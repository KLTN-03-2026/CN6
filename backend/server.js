const express = require('express');
const app= express();
const port = 3000;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Mistral } = require('@mistralai/mistralai')
const Groq = require('groq-sdk');
const OpenAI = require('openai');


app.use(cors());
app.use(express.json());
const thuMucTaiNguyen = path.join(__dirname, 'taiNguyen');

app.use('/taiNguyen', express.static(thuMucTaiNguyen));

mongoose.connect('mongodb://localhost:27017/E-learning').then(()=>{
    console.log("kết nối mongodb thanh cong 💚");
}).catch((err)=>{
    console.log("kết nối mongodb thất bại ❤️ "+ err);
})

//////////////// API TƯ VẤN /////////////////////////////////

const TuVanSchema= new mongoose.Schema({
    HoTen :{type:String, require: true},
    Sdt :{type:String, require: true},
    NamSinh:{type:Number},
    Email:{type:String, require: true},
    NgheNghiep:{type: String},
    QuanTam: {type: String, require:true},
    NoiDung:{type: String, require:true}

});

const TuVan = mongoose.model('TuVan', TuVanSchema);

app.post('/tuvan',async (req, res)=>{
    try{
        const {HoTen,Sdt,NamSinh ,Email , NgheNghiep,QuanTam ,NoiDung}= req.body;

        const TuVanMoi = new TuVan({
            HoTen: HoTen,
            Sdt: Sdt,
            NamSinh: NamSinh,
            Email: Email,
            NgheNghiep: NgheNghiep,
            QuanTam: QuanTam,
            NoiDung: NoiDung
        });
        await TuVanMoi.save();
        res.status(200).json({
            trangThai: "đã gửi tư vấn thành công"
        })
    }catch(err){
        res.status(400).json({
            trangThai: "gửi tư vấn thất bại : "+err
        })
    }
});

////////////////////xác thực ///////////////////////

const xacThuc = (req,res,next)=>{
    
    const token = req.header('Authorization');
    
    if(!token) return res.status(400).json({
        trangThai:"hh",
        mess:"phien dang nhap het han vui long dang nhap lai"
    })
    
    try{
        const GiaiMa = jwt.verify(token, "ToanDepTrai");
        
        req.user = GiaiMa;
        
        next();
        
    }
    catch(err){
        res.status(500).json({
            trangThai:"hh",
            mess:"phien dang nhap het han vui long dang nhap lai"
        })
        console.log("xác thực thất bại : "+err)
    }
}

app.get('/api/xacThuc-thongTinTk',xacThuc,async(req,res)=>{
    const {Email,VaiTro}= req.user;
    res.status(200).json({
        trangThai:"tc",
        data:{
            Email: Email,
            VaiTro:VaiTro
        }
    })
})

//////////////////   BANG TÀI KHOẢN   ////////////////////////

const TaiKhoanSchema = new mongoose.Schema({
    sdt :{type: String, require: true},
    mk:{type:String, require:true},
    HoTen :{type:String, require: true},
    NamSinh:{type:Number},
    Email:{type:String, require: true, unique: true},
    VaiTro:{type:String, default:"Học Viên"},
    NgheNghiep:{type: String}
});

const TaiKhoan = mongoose.model('TaiKhoan', TaiKhoanSchema);

///////////kt số điện thoại
app.post('/dangnhap/email', async(req, res)=>{
    try{
        const {Email} = req.body;
        console.log("1")
        const check = await TaiKhoan.findOne({Email:Email})
        console.log("2")
        if(check) return res.status(200).json({trangThai: "T"});
        return res.status(400).json({trangThai: "F"
            
        });
        
    }catch(err){
        res.status(500).json({
            trangThai: "tim email thất bại"
        })
    }
})

////////đăng nhập
app.post('/dangnhap/dn', async(req, res)=>{
    try{
        const {Email, mk}= req.body;
        
        const check = await TaiKhoan.findOne({Email:Email});
        const matKhauDung = await bcrypt.compare(mk,check.mk);
       
        if(!matKhauDung) return res.status(400).json({
            trangThai:"smk"
        })
        
        else{
            const theVip = jwt.sign(
                {Email: check.Email, VaiTro: check.VaiTro},
                "ToanDepTrai",
                {expiresIn:"5h"}
                
            );
            
            res.status(200).json({
                trangThai:"thanhCong",
                Token: theVip
            })
        }
    }catch(err){
        res.status(500).json({
            trangThai:"loi trong qua trinh dang nhap :"+err
        })
    }
})

////ĐĂNG KÝ
app.post('/dangky', async (req, res)=>{
   try{
     const {sdt,mk,HoTen,NamSinh,Email,VaiTro,NgheNghiep}= req.body;
    console.log(1);
    const giavi= await bcrypt.genSalt(10);
    console.log(2);
    const matKhauBam= await bcrypt.hash(mk,giavi)
    console.log(3);
    const taikhoanMoi = new TaiKhoan({
        sdt:sdt,
        mk:matKhauBam,
        HoTen:HoTen,
        NamSinh: NamSinh,
        Email:Email,
        VaiTro:VaiTro,
        NgheNghiep:NgheNghiep
    })
    console.log(4);
    await taikhoanMoi.save();
    console.log(5);
    res.status(200).json({
        trangThai: true
    })
   }catch(err){
    res.status(400).json({
        trangThai: false,
        mess : err
    })
   }
})

// api lay thong tin tai khoan 

app.get('/api/lay-tt-tk', xacThuc , async(req,res)=>{
    try{
        const Email = req.user.Email;
        const data = await TaiKhoan.findOne({Email:Email});
        res.status(200).json({
            trangThai:"tc",
            data:data
        })
        console.log("/api/lay-tt-tk thành công")

    }catch(err){
        console.log("lay thong tin tk that bai: " + err);
        res.status(500).json({ trangThai:"tb" })
    }
})

/// api cap nhat thong tin tai khoản 

app.patch('/api/cap-nhat-tt-tk',xacThuc, async(req,res)=>{
    try{
        const email = req.user.Email;
        const {HoTen,NamSinh,sdt,NgheNghiep}= req.body;
        const updateTK= await TaiKhoan.findOne({Email:email});
        if(HoTen) updateTK.HoTen= HoTen;
        if(NamSinh) updateTK.NamSinh= NamSinh;
        if(sdt) updateTK.sdt= sdt;
        if(NgheNghiep) updateTK.NgheNghiep= NgheNghiep; 

        await updateTK.save();
        console.log("thành công: /api/cap-nhat-tt-tk")
        res.status(200).json({trangThai:"tc"});
    }catch(err){
        console.log(" thất bại: /api/cap-nhat-tt-tk  : "+err);
        res.status(500).json({trangThai:"tb"});
    }
})

///api doi mật khẩu

app.patch('/api/doi-mat-khau',xacThuc, async(req,res)=>{
    try{
        const Email= req.user.Email;
        const {mkCu, mkMoi} = req.body;
        const tk = await TaiKhoan.findOne({Email:Email});
        const mkdung = await  bcrypt.compare(mkCu,tk.mk);

        if(!mkdung) {
            console.error("sai mat khau");
            return res.status(400).json({trangThai:"smk"});
            
        }
        console.log(mkCu);
        console.log(mkdung)
        const giavi = await bcrypt.genSalt(10);
        const mkbam = await bcrypt.hash(mkMoi,giavi);
        tk.mk =mkbam;
        await tk.save();
        res.status(200).json({trangThai: "tc"});
        console.log("doi mat khau thanh cong")
    }catch(err){
        console.log("/api/doi-mat-khau that bai: "+err);
        res.status(500).json({trangThai:"tb"})
    }
})



//////XÁC NHẬN OTP/////

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dinhvanngoctoan@gmail.com', // Email của bạn
    pass: 'amut vjbh ntgd jiqd'  // Mật khẩu ứng dụng 16 số vừa lấy
  }
});

// Lưu trữ OTP tạm thời (Trong thực tế nên dùng Redis)
let otpStore = {}; 

/// 2. API Gửi mã OTP về Email
app.post("/dangnhap/gui-otp-email", async (req, res) => {
    const { email } = req.body;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu mã vào bộ nhớ tạm (5 phút)
    otpStore[email] = { code: otpCode, expire: Date.now() + 300000 };

    const mailOptions = {
        from: '"E-Learning Center" <your-email@gmail.com>',
        to: email,
        subject: 'Mã xác thực đăng ký tài khoản',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #2A8794;">Xác thực tài khoản E-Learning</h2>
                <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #ff5722;">${otpCode}</b></p>
                <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ cho bất kỳ ai.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ trangThai: "ThanhCong" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ trangThai: "Không gửi được email" +err });
    }
});


// 2. API Xác nhận OTP
app.post("/dangnhap/xac-nhan-otp", (req, res) => {
    const { email, otp } = req.body;
    const data = otpStore[email];

    if (data && data.code === otp && Date.now() < data.expire) {
        delete otpStore[email]; // Xóa mã sau khi dùng xong
        res.json({ trangThai: true });
    } else {
        res.status(400).json({ trangThai: false, message: "Mã sai hoặc hết hạn" });
    }
});


///api gui hoa don
app.post("/api/gui-hoaDon-email", async (req, res) => {
    
    const { email, HoTen,sdt,NamSinh,NgheNghiep, TenKhoaHoc,Gia,TenLop, Time } = req.body;
    const mailOptions = {
        from: '"E-Learning Center" <your-email@gmail.com>',
        to: email,
        subject: 'HÓA ĐƠN GIÁ TRỊ GIA TĂNG',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 5px solid rgba(17,74,83,0.5); width: 1000px; position: relative;">
            <!-- Header -->
            <div style="border-bottom: 1px solid rgba(0,0,0,0.5); padding-bottom: 20px;">
                <h1 style="text-align: center; font-weight: bold;">
                HÓA ĐƠN GIÁ TRỊ GIA TĂNG
                </h1>
                <p style="text-align: center;">
                (Bản thể hiện của hóa đơn điện tử từ máy tính tiền)
                </p>
                <p style="text-align: center;">Thời gian: ${Time}</p>
            </div>

            <!-- Thông tin đơn vị -->
            <p style="margin-top: 20px;">
                Đơn vị bán: <b>TRUNG TÂM ANH NGỮ E-LEARNING</b>
            </p>

            <div style="display: flex;">
                <p style="width: 50%; ">
                Số tài khoản: <b>0334604948</b>
                </p>
                <p style="width: 50%; ">
                Mở tại: <b>MB Bank Điện Biên Phủ</b>
                </p>
            </div>

            <p style="">
                Địa chỉ: <b>Số 10 - Dũng Sĩ Thanh Khê / Đà Nẵng</b>
            </p>

            <p style=" border-bottom: 1px solid rgba(0,0,0,0.5); padding-bottom: 20px;">
                Số điện thoại: <b>0334604948</b>
            </p>

            <!-- Thông tin khách -->
            <p style="margin-top: 20px;">
                Họ tên người mua: <b>${HoTen}</b>
            </p>

            <div style="display: flex;">
                <p style="width: 50%; ">
                Email: <b>${email}</b>
                </p>
                <p style="width: 50%; ">
                SĐT: <b>${sdt}</b>
                </p>
            </div>

            <div style="display: flex;">
                <p style="width: 50%; ">
                Năm sinh: <b>${NamSinh}</b>
                </p>
                <p style="width: 50%; ">
                Nghề nghiệp: <b>${NgheNghiep}</b>
                </p>
            </div>

            <p style="margin-top: 10px;">
                Hình thức thanh toán: <b>Chuyển khoản</b>
            </p>

            <!-- Bảng -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: center;">
            <thead>
                <tr style="font-weight: bold;">
                <th style="border: 1px solid black; padding: 5px; width: 10%;">STT</th>
                <th style="border: 1px solid black; padding: 5px; width: 30%;">Tên Hàng Hóa & dịch Vụ</th>
                <th style="border: 1px solid black; padding: 5px; width: 15%;">Đơn Vị Tính</th>
                <th style="border: 1px solid black; padding: 5px; width: 10%;">Số Lượng</th>
                <th style="border: 1px solid black; padding: 5px; width: 20%;">Đơn Giá</th>
                <th style="border: 1px solid black; padding: 5px; width: 15%;">Thành Tiền</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td style="border: 1px solid black; padding: 5px;">1</td>
                <td style="border: 1px solid black; padding: 5px;">${TenKhoaHoc} / ${TenLop}</td>
                <td style="border: 1px solid black; padding: 5px;">Khóa Học</td>
                <td style="border: 1px solid black; padding: 5px;">1</td>
                <td style="border: 1px solid black; padding: 5px;">${Gia}</td>
                <td style="border: 1px solid black; padding: 5px;">${Gia}</td>
                </tr>
                <tr>
                <td colspan="5" style="border: 1px solid black; padding: 5px; text-align: left; font-weight: bold;">
                    Tổng Hóa Đơn:
                </td>
                <td style="border: 1px solid black; padding: 5px; font-weight: bold;">
                    ${Gia} VNĐ
                </td>
                </tr>
            </tbody>
            </table>

            <div style="height: 130px; width: 100%; margin-top: 20px; display: flex; font-weight: bold; ">
            <div style="flex: 1; text-align: center; width: 100%;">Người Mua Hàng</div>
            <div style="flex: 1; text-align: center; width: 100%;">Người Bán Hàng</div>
            <div style="flex: 1; text-align: center; width: 100%;">Cơ Quan Thuế</div>
            </div>

            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ trangThai: "tc" });
        console.log("gui email hoa don thanh cong");
    } catch (error) {
        console.error(error);
        res.status(500).json({ trangThai: "tb" +err });
    }
});




///////////////////////////////////////////////////////



//////////////////////KHÓA HỌC////////////////////////////////

const KhoaHocSchema = new mongoose.Schema({
    TenKhoaHoc:{type: String,require:true},
    DauRa: {type:String,require:true},
    MoTa:{type:String, require:true},
    PhuHop:{type:String,require:true},
    Gia:{type:Number,require:true},
    Image:{type:String,require:true},
    QuyenLoi:{type:String,require:true},
    PhuongPhap:{type:String,require:true},
    KetQua:{type:String,require:true}

})

const KhoaHoc = mongoose.model('KhoaHoc', KhoaHocSchema);

//// api them khoa hoc 

app.post('/ThemKhoaHoc', async(req,res)=>{
    try{
        const {TenKhoaHoc,DauRa,MoTa,PhuHop,Gia,Image,QuyenLoi,PhuongPhap,KetQua}= req.body;
        
        if(!TenKhoaHoc) return res.status(400).json({trangThai:"loi",  mess: "thieu ten khoa hoc"});
        if(!DauRa) return res.status(400).json({trangThai:"loi",  mess: "thieu diem dau ra khoa hoc"});
        if(!MoTa) return res.status(400).json({trangThai:"loi",  mess: "thieu mo ta khoa hoc"});
        if(!PhuHop) return res.status(400).json({trangThai:"loi",  mess: "thieu doi tuong phu hop khoa hoc"});
        if(!Gia) return res.status(400).json({trangThai:"loi",  mess: "thieu gia khoa hoc"});
        if(!Image) return res.status(400).json({trangThai:"loi",  mess: "thieu anh khoa hoc"});
        if(!QuyenLoi) return res.status(400).json({trangThai:"loi",  mess: "thieu quyen loi khoa hoc"});
        if(!PhuongPhap) return res.status(400).json({trangThai:"loi",  mess: "thieu phong phap khoa hoc"});
        if(!KetQua) return res.status(400).json({trangThai:"loi",  mess: "thieu ket qua khoa hoc"});

        const Data = new KhoaHoc({
            TenKhoaHoc:TenKhoaHoc,
            DauRa: DauRa,
            MoTa:MoTa,
            PhuHop:PhuHop,
            Gia: Gia,
            Image: Image,
            QuyenLoi: QuyenLoi,
            PhuongPhap: PhuongPhap,
            KetQua: KetQua
        }) 

        await Data.save();

        res.status(202).json({
            trangThai:"tc",
            mess:"them khoa hoc thanh cong"
        })
        console.log("them khoa hoc thanh cong 👌")
            
    }catch(err){
        res.status(500).json({
            trangThai:"loi",
            mess: "loi tu phia server "+err
        })
        console.log("loi khi them khoa hoc: "+err);
    }
})




/// api lay danh sach  khoa Học

app.get('/khoaHoc',async (req,res)=>{
    try{
        const data= await KhoaHoc.find();
        res.status(200).json({
            trangThai:"tc",
            dulieu: data
        })

        
    }catch(err){
        res.status(500).json({
            trangThai:"loi",
            mess : " loi tu phia server " + err
        })
    }
})


/// api lay chi tiet khoa hoc

app.get('/ChiTietKhoaHoc/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        const data = await KhoaHoc.findById(id);
        if(!data) {
            return res.status(404).json({trangThai: "loi", mess:"id khong ton tai"});
            console.log("id khong ton tai")
        }
        else{
            res.status(200).json({trangThai:"tc", dulieu: data});
            console.log("lay data chi tiet khoa hoc thanh cong");
        }
    }catch(err){
        res.status(500).json({
            trangThai:"loi",
            mess :" loi phia server "+err
        })
        console.log("loi lay chi tiet khoa hoc :"+err)
    }
})



//////////////////////////// BANG LOP HOC ///////////////////////////////

const LopHocSchema = new mongoose.Schema({
    idKhoaHoc :{type:String, require:true},
    trangThai:{type:String,require:true},
    DateKhaiGiang:{type:String , require:true},
    LichHoc:{type:String,require: true},
    GioHoc:{type:String,require: true},
    TenLop:{type:String, require:true},
    SoLuong :{type:Number, default :    0}
});

const LopHoc = mongoose.model('LopHoc',LopHocSchema);


/// api lay danh sach lop hoc 

app.get('/lophoc/lay/:id',async(req,res)=>{
    try{
        const idKhoaHoc=  req.params.id; 
        const trangThai = "khaiGiang";
        const Data = await LopHoc.find({idKhoaHoc:idKhoaHoc, trangThai:trangThai});
        if(Data.length === 0){
            console.log("hien khong co lop hoc nao");
            return res.status(404).json({
                trangThai:"ktt",
                mess:"hien khoa hoc nay khong co lop hoc nao "
            })
        }
        console.log("tra ve danh sach lop hocc thanh cong");
        return res.status(200).json({
            trangThai:"tc",
            Data:Data
        })
        
    }catch(err){
        console.log("lay danh sach lop hoc that bai :" +err);
        res.status(500).json({
            trangThai:"tb",
            mess: err
        })
    }
})



/// api them lop hoc 

app.post('/lophoc/them',async(req,res)=>{
    try{
        const {idKhoaHoc,trangThai,DateKhaiGiang,LichHoc,TenLop,GioHoc}= req.body;
        
        const check= await KhoaHoc.findById(idKhoaHoc);
        
        if(!check) {
            console.log("khoa hoc khong ton tai");
            return res.status(404).json({
                trangThai:"tb",
                mess:"khoa hoc khong ton tai"
            });
            
        };
        
        const newLopHoc= new LopHoc ({
            idKhoaHoc:idKhoaHoc,
            trangThai:trangThai,
            DateKhaiGiang:DateKhaiGiang,
            LichHoc: LichHoc,
            GioHoc:GioHoc,
            TenLop: TenLop
        });
        
        await newLopHoc.save();
     
        res.status(201).json({
            trangThai:"tc"
        })
        console.log("them lop thanh cong");
    }catch(err){
        res.status(500).json({
            trangThai:"loi",
            mess :"loi tu phia server :"+err
        })
        console.log("loi khi them lop hoc "+err)
    }
})

///api cập nhật sỉ số lớp

app.patch(`/api/cap-nhat-si-so/:id`,async(req,res)=>{
    try{
        const id = req.params.id
        const data = await LopHoc.findById(id);
        data.SoLuong = data.SoLuong +1;
        data.save();
        console.log("cap nhat si so lop tk");
        res.status(200).json({trangThai:"tc"});
    }catch(err){
        res.status(500).json({trangThai:"tb"});
        console.log("cap nhat si so that bai: "+err)
    }
})

/// api kt si so 

app.get('/api/ktSiSo/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        const data = await LopHoc.findById(id);

        res.status(200).json({
            trangThai:"tc",
            mess: data.SoLuong
        })
        console.log("lay si so tk")
    }catch(err){
        console.log("kt si so that bai : " +err);
        res.status(500).json({
            trangThai:"tb"
        })
    }
})

////////////////////////TRANG XÁC NHẬN THANH TOÁN//////////////////////

///api lay thong tin thanh TOÁN

app.get('/XNThanhToan/:id',xacThuc,async(req,res)=>{
    try{
        
        const idLopHoc = req.params.id;
        const email = req.user.Email;
        console.log(email);
        const dataLopHoc = await LopHoc.findById(idLopHoc);
        const dataTk = await TaiKhoan.findOne({Email:email});
        const dataKH = await KhoaHoc.findById(dataLopHoc.idKhoaHoc);
        const data= {
            datalop: dataLopHoc,
            datatk: dataTk,
            datakh: dataKH,
        }
        
        res.status(200).json({
            trangThai:"tc",
            data : data
        })
        
    }catch(err){
        res.status(500).json({
            trangThai: "loi1",
            mess: err
        });
        console.log("loi xan nhan thanh toan: "+err);
    }
    


})

app.patch('/XNThanhToan/update',xacThuc ,async(req,res)=>{
    try{
        
    const Email = req.user.Email;
    const update = await TaiKhoan.findOne({Email:Email});
    if(!update){
        return res.status(404).json({
            trangThai:"ktt",
            mess : "email khong ton tai"
        })
    }
    if(req.body.sdt) update.sdt = req.body.sdt;
    await update.save();
    res.status(200).json({
        trangThai:"tc"
    })
    }catch(err){
        res.status(500).json({
            trangThai:"loi",
            mess:"loi server: "+err 
        })
    }
})


////////////////////////THANH TOÁN ///////////////////////

// 1. Bạn require và đặt tên là PayOS
// 1. Thêm dấu ngoặc nhọn { } quanh chữ PayOS để lấy đúng class từ thư viện
// 1. Nhập toàn bộ thư viện vào một biến tạm
const PayOS = require('@payos/node');

// Truyền thẳng 3 chuỗi, không cần dấu ngoặc nhọn { }
const payos = new PayOS(
  '85bba212-a701-4d47-a08e-36a1803cf998', 
  'be36e0cf-a470-4c9d-9331-a50525f83d61', 
  'c5db2e3e87656ebcb2e29a3b295c54d0eaf515d52c295690a5436222b41fb62b'
);

// Phía dưới bạn dùng hàm payos.createPaymentLink(order) như cũ!
// Paste đoạn này ngay dưới chỗ const payos = new PayOSClass({...});


app.post('/api/tao-don-hang', async (req, res) => {
    const { amount } = req.body; 
    const soNgauNhien = Math.floor(1000000000 + Math.random() * 9000000000)
    const order = {
        orderCode: soNgauNhien, 
        amount: amount, 
        description: soNgauNhien, 
        returnUrl: `http://localhost:3000/success`, 
        cancelUrl: `http://localhost:3000/cancel`,  
    };
    
    console.log(order.orderCode);

    try {
        const paymentLinkData = await payos.createPaymentLink(order);
        console.log(paymentLinkData);
        
        // Trả về toàn bộ data, đặc biệt là trường qrCode (chuỗi thô)
        res.json({
            trangThai:"tc",
            data: {
                orderCode : paymentLinkData.orderCode,
                maNganHang: paymentLinkData.bin, // Mã ngân hàng
                soTK: paymentLinkData.accountNumber, // Số TK của bạn
                Gia: paymentLinkData.amount,
                tenTK:  paymentLinkData.accountName,
                ghiChu: paymentLinkData.orderCode,
                qrCode: paymentLinkData.qrCode // CHUỖI MÃ QR QUAN TRỌNG NHẤT
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi tạo mã QR' });
    }
});

app.get('/KTdonHang/:id', async (req, res)=>{
    try{

        const id = req.params.id;
        const check = await payos.getPaymentLinkInformation(id);
        if(check.status==='PAID') return res.status(200).json({trangThai:"tc"});
        return res.status(400).json({trangThai:"tb"});
    }catch(err){
        res.status(500).json({
            trangThai:"tb"
        })
    }
})


///////////////////Hóa Đơn////////////////////////////////////////

///api thêm hóa đơn

const HoaDonSchema = new mongoose.Schema({
    maHoaDon :{type:String,require:true},
    idKhoaHoc :{type:String ,require:true},
    idLopHoc:{type:String,require:true},
    email:{type:String,require:true},
    TenKhoaHoc:{type:String, require:true},
    TenLop:{type:String,require:true},
    Gia:{type:Number,require: true},
    Time :{type:String,require: true}
})

const HoaDon = mongoose.model("HoaDon", HoaDonSchema);

/// api thếm hóa đơn

app.post('/api/them-hoa-don',async(req,res)=>{
    try{
         const date = new Date();
        const vietnamTime = date.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
        const {maHoaDon, idKhoaHoc,idLopHoc,email,TenKhoaHoc,TenLop,Gia}= req.body;
        const newHoaDon = new HoaDon ({
            maHoaDon:maHoaDon,
            idKhoaHoc:idKhoaHoc,
            idLopHoc:idLopHoc,
            email:email,
            TenKhoaHoc:TenKhoaHoc,
            TenLop:TenLop,
            Gia:Gia,
            Time: vietnamTime
        });
        await newHoaDon.save();
        res.status(200).json({
            trangThai :"tc"
        })
        console.log("them hd tk");

    }catch(err){
        res.status(500).json({
            trangThai:"tb",
            mess : "loi server "+err
        })
        console.log("them hd tb");

    }
})

/// api kiểm tra có đang học khóa học nào không

app.get('/api/kt-trung-khoa-hoc', xacThuc , async (req,res)=>{
    try{
        const email = req.user.Email;

        const checkHD = await HoaDon.find({email:email});
      
        if(checkHD.length === 0) return res.status(200).json({
            trangThai : true
        })

        let sokt =0;
         
        for(let i=0; i<checkHD.length; i++){
            const checkLH = await LopHoc.findById(checkHD[i].idLopHoc);
            if(checkLH.trangThai !=="ketThuc" || checkLH.trangThai !=="an"){
                return res.status(200).json({
                trangThai : false
        })
            }
        }
        
        return res.status(200).json({ trangThai : true})
        

    }catch(err){
        console.log("loi /api/kt-trung-khoa-hoc :" +err);
        res.status.json({trangThai:"tb"})
    }
})

//api lay tt hóa đơn

app.get('/api/lay-tt-hoaDon',xacThuc, async(req,res)=>{
    try{
        const email = req.user.Email;
        const data = await HoaDon.find({email:email});
        if(data.length ===0){
            console.log("tai khoan khong có hóa đơn");
            return res.status(200).json({trangThai: "ktt"});
            
        }
        return res.status(200).json({
            trangThai: "tc",
            data: data
        })
    }catch(err){
        console.log("loi khi lay tt hóa đơn :" +err)
        res.status(500).json({trangThai:"tb"});
    }
})

///api lay ten và id lop hoc 

app.get('/api/ten-id-lopHoc',xacThuc, async(req,res)=>{
    try{
        let data =[];
        const email = req.user.Email;
        const dsHoaDown = await HoaDon.find({email:email}).select('idLopHoc  TenKhoaHoc TenLop');
       
        if(dsHoaDown.length === 0){
            return res.status(404).json({trangThai:"ktt"});
        }
        for(const item of dsHoaDown){
            const check = await LopHoc.findById(item.idLopHoc).select('trangThai');
            const them ={
            idLopHoc:item.idLopHoc,
            TenKhoaHoc: item.TenKhoaHoc,
            TenLop : item.TenLop,
            trangThai: check.trangThai
            }
            data.push(them);
            
        }
       
        console.log("/api/ten-id-lopHoc thành công");
        return res.status(200).json({
            trangThai:"tc",
            data: data
        })
        
        

    }catch(err){
        console.log("loi /api/ten-id-lopHoc : " +err);
        res.status(500).json({trangThai:"tb"})
    }
})


////////////// CHAT BOT AI//////////

require('dotenv').config();

const groq = new Groq(process.env.GROQ_API_KEY);

/// api tạo tin nhắn 

app.post('/api/tap-tn-ai',async(req,res)=>{
    try{
        const {message , LichSuChat} = req.body;

        const dataKH = await KhoaHoc.find().select('_id TenKhoaHoc DauRa PhuHop Gia QuyenLoi PhuongPhap KetQua');
        const duLieuKH = JSON.stringify(dataKH);
        const dataLH =  await LopHoc.find();
        const duLieuLH = JSON.stringify(dataLH);
        const duLieuLSC =JSON.stringify(LichSuChat);

        // const model = genAI.getGenerativeModel({ 
        //     model: "gemini-2.5-flash",
        //     // systemInstruction chính là "Khuôn mẫu nhân cách" và "Kiến thức"
        //     systemInstruction: `
        //         Bạn là tư vấn viên ảo của hệ thống E-learning. 
        //         Dưới đây là danh sách toàn bộ các khóa học và lớp học của từng khóa hiện có hiện có trong hệ thống (dữ liệu JSON):
        //         ${duLieuKH}
        //          ${duLieuLH}
        //         Đây là lịch sử chat trước đó để bạn có thể hiêu ngữ cảnh hơn :
        //         ${duLieuLSC}

        //         Nguyên tắc:
        //         1. CHỈ tư vấn dựa trên danh sách khóa học và lớp học ở trên. Không bịa đặt thêm khóa học ngoài.
        //         2. Nếu người dùng hỏi khóa học không có trong danh sách, hãy báo là hệ thống chưa có và gợi ý khóa học gần giống nhất.
        //         3. Trả lời thân thiện, xưng "mình" và gọi "bạn", format chữ thuần túy, không dùng dấu sao (**).
        //     `
        // });

        const tinNhanHeThong = {
            role: "system",
            content: `Bạn là tư vấn viên ảo của hệ thống E-learning. 
                Dưới đây là danh sách toàn bộ các khóa học và lớp học của từng khóa hiện có hiện có trong hệ thống (dữ liệu JSON):
                ${duLieuKH}
                 ${duLieuLH}
                Đây là lịch sử chat trước đó để bạn có thể hiêu ngữ cảnh hơn :
                ${duLieuLSC}

                Nguyên tắc:
                1. CHỈ tư vấn dựa trên danh sách khóa học và lớp học ở trên. Không bịa đặt thêm khóa học ngoài.
                2. Nếu người dùng hỏi khóa học không có trong danh sách, hãy báo là hệ thống chưa có và gợi ý khóa học gần giống nhất.
                3. Trả lời thân thiện, xưng "mình" và gọi "bạn", format chữ thuần túy, không dùng dấu sao (**).
                4. Trả lời thật ngắn gọn, súc tích (dưới 100 chữ nếu có thể).
                `
                
        };
        // const prompt = `
        //     Bạn là một trợ lý tư vấn học tập ảo của một nền tảng E-learning. 
        //     Nhiệm vụ của bạn là giải đáp thắc mắc về các khóa học .
        //     Nguyên tắc trả lời:
        //     1. Luôn xưng là "mình" và gọi người dùng là "bạn". Thái độ nhiệt tình, thân thiện.
        //     2. Trả lời thật ngắn gọn, súc tích (dưới 100 chữ nếu có thể).
        //     3. Tuyệt đối không dùng các ký hiệu định dạng phức tạp (như in đậm **, dấu sao *), chỉ dùng văn bản thuần túy.
            
        //     Câu hỏi của học viên là: "${message}"
        // `;

        const messages = [
            tinNhanHeThong, 
            { role: "user", content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile", // Dùng Llama 3 70B của Meta (Facebook) cực kỳ thông minh
            temperature: 0.5, // Số từ 0 đến 1 (0.5 là vừa đủ cân bằng giữa sáng tạo và chính xác)
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "Xin lỗi, mình bị lỡ nhịp. Bạn nói lại nhé!";
        // Rút trích đoạn text câu trả lời từ kết quả
       
        // Trả về cho Frontend React
        return res.status(200).json({
            trangThai:"tc",
            mess: responseText });
        
    }catch(err){
        console.log("loi chat bot ai: "+err);
        res.status(500).json({
            trangThai:"tb"
        })
    }
})



//// ai cham bai /////////



const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});


// Khởi tạo Gemini với API Key của bạn (Lấy miễn phí tại Google AI Studio)
const genAI = new GoogleGenerativeAI(process.env.GEMIN_KEY_1);

// Hàm phụ trợ: Biến file vật lý (mp3, webm, jpg) thành định dạng Base64 để nhét vào Gemini
function chuyenFileChoGemini(duongDanFile, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(duongDanFile)).toString("base64"),
      mimeType: mimeType
    },
  };
}

    // idBaiTap:{type:String,require:true},
    // email:{type:String,require:true},
    // CauHoi:{type:String, require:true},/
    // type:{type:Number,default: 0},/
    // a:{type:String, default:""},/
    // b:{type:String, default:""},/
    // c:{type:String, default:""},/
    // d:{type:String, default:""},/
    // fileNghe:{type:String,default:""},/
    // anh:{type:String,default:""},/
    // dapAnDung:{type:String,default:""},/
    // dapAnHocVien:{type:String,default:""},/
    // giaiThich:{type:String,default:""},/
    // loipheAI:{type:String,default:""},

    // File: test-gemini.js


app.post(`/api/chamDiemTuLuan`, async (req, res) => {
  try {
    const { CauHoi, dapAnHocVien, giaiThich, anh, type } = req.body;
    // 1. Xử lý ảnh (Đã sửa triệt để lỗi ép kiểu MIME)
    

    // 2. Chuẩn bị Prompt (Đã dọn sạch lỗi chính tả, bỏ dấu phẩy và xóa phần bắt AI nghe âm thanh)
    
    

     ///// lần 1 yêu cầu gemi chấm bài
        try{
            let khoangDiem = "";
    
                    if (Number(type) === 1) {
                    khoangDiem = "từ 0 đến 2 (thấp nhất là 0 điểm và cao nhất là 2 điểm)";
                    } else if (Number(type) === 2) {
                    khoangDiem = "từ 0 đến 6 (thấp nhất là 0 điểm và cao nhất là 6 điểm)";
                    }
                    const duLieuGoiDi = [];
                    const yeuCau = `
                    Bạn là một giám khảo chấm thi tiếng Anh chuẩn TOEIC/IELTS phần Writing (Tự luận).
                    
                    THÔNG TIN BÀI THI:
                    - Câu hỏi: "${CauHoi}"
                    - Hình ảnh đính kèm: (Học viên sẽ miêu tả dựa trên hình ảnh được cung cấp nếu có).
                    - Yêu cầu/Giải thích của giáo viên: "${giaiThich}"

                    BÀI LÀM CỦA HỌC VIÊN:
                    "${dapAnHocVien}"

                    NHIỆM VỤ:
                    Hãy đọc bài làm của học viên, phân tích độ chuẩn xác về ngữ pháp, từ vựng và sự liên quan đến câu hỏi cũng như hình ảnh của đề thi.
                    
                    QUAN TRỌNG: Hãy trả về kết quả ĐÚNG theo định dạng JSON sau, không bọc markdown, không kèm theo bất kỳ chữ nào khác:
                    {
                        "diemUocTinh": "Số điểm ${khoangDiem}",
                        "loiNhanXet": "Lời nhận xét chi tiết bằng tiếng Việt để học viên có thể cải thiện (ngắn gọn nhất có thể, đúng trọng tâm),(LƯU Ý QUAN TRỌNG: Viết liền trên 1 dòng duy nhất, tuyệt đối KHÔNG sử dụng ký tự xuống dòng ở đây)"
                    }
                    `;
                    duLieuGoiDi.push(yeuCau);
                    if (anh !== "") {
                    const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
                    const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
                    const phanHinhAnh = chuyenFileChoGemini(duongDanAnhThat, mimeTypeAnh);
                    duLieuGoiDi.push(phanHinhAnh);
                    }
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                    console.log(`⏳ Đang nhờ gemini chấm bài tự luận...`);
                    const ketQua = await model.generateContent(duLieuGoiDi);
                    const phanHoiTuAI = ketQua.response.text();
                    
                    // Dọn dẹp markdown rác và Parse JSON
                    const chuoiJsonSach = phanHoiTuAI.replace(/```json|```/g, "").trim(); 
                    const ketQuaHoanChinh = JSON.parse(chuoiJsonSach);
                    console.log("🎯 KẾT QUẢ CHẤM ĐIỂM TỰ LUẬN:", ketQuaHoanChinh);
                    
                    // Trả kết quả thành công và DỪNG API
                    return res.status(200).json({
                    trangThai: "tc",
                    data: ketQuaHoanChinh
                    });
            
            // Trả kết quả thành công và DỪNG API
            return res.status(200).json({
            trangThai: "tc",
            data: ketQuaHoanChinh
            });
        }catch(err){
            console.log("mode gemini cham bai that bai: "+err);
            ///// chấm lần 2 yêu cầu nvidia
            try{
                console.log("⏳ Đang nhờ NVIDIA NIM (Llama 3.2 Vision) chấm bài...");
                let khoangDiem = "";
    
                    if (Number(type) === 1) {
                    khoangDiem = "từ 0 đến 2 (thấp nhất là 0 điểm và cao nhất là 2 điểm)";
                    } else if (Number(type) === 2) {
                    khoangDiem = "từ 0 đến 6 (thấp nhất là 0 điểm và cao nhất là 6 điểm)";
                    }
                    const duLieuGoiDi = [];
                    const yeuCau = `
                    Bạn là một giám khảo chấm thi tiếng Anh chuẩn TOEIC/IELTS phần Writing (Tự luận).
                    
                    THÔNG TIN BÀI THI:
                    - Câu hỏi: "${CauHoi}"
                    - Hình ảnh đính kèm: (Học viên sẽ miêu tả dựa trên hình ảnh được cung cấp nếu có).
                    - Yêu cầu/Giải thích của giáo viên: "${giaiThich}"

                    BÀI LÀM CỦA HỌC VIÊN:
                    "${dapAnHocVien}"

                    NHIỆM VỤ:
                    Hãy đọc bài làm của học viên, phân tích độ chuẩn xác về ngữ pháp, từ vựng và sự liên quan đến câu hỏi cũng như hình ảnh của đề thi.
                    
                    QUAN TRỌNG: Hãy trả về kết quả ĐÚNG theo định dạng JSON sau, không bọc markdown, không kèm theo bất kỳ chữ nào khác:
                    {
                        "diemUocTinh": "Số điểm ${khoangDiem}",
                        "loiNhanXet": "Lời nhận xét chi tiết bằng tiếng Việt để học viên có thể cải thiện (ngắn gọn nhất có thể, đúng trọng tâm),(LƯU Ý QUAN TRỌNG: Viết liền trên 1 dòng duy nhất, tuyệt đối KHÔNG sử dụng ký tự xuống dòng ở đây)"
                    }
                    `;
                    duLieuGoiDi.push({ type: "text", text: yeuCau });
                    if (anh && anh !== "") {
                    // TRƯỜNG HỢP 1: BÀI THI CÓ ẢNH (Dùng mảng)
                    const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
                    const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
                    const anhBase64 = fs.readFileSync(duongDanAnhThat).toString('base64');
                    const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;
                    
                    duLieuGoiDi = [
                        { type: "text", text: yeuCau },
                        { type: "image_url", image_url: { url: dataUrl } }
                    ];
                    } else {
                    // TRƯỜNG HỢP 2: BÀI THI CHỈ CÓ CHỮ (Gửi chuỗi Text thuần túy)
                    // Chặn đứng lỗi 400 của NVIDIA
                    noiDungGuiDi = yeuCau; 
                    }
                    const ketQua = await openai1.chat.completions.create({
                    model: "meta/llama-3.2-90b-vision-instruct", 
                    messages: [{ role: "user", content: duLieuGoiDi }],
                    temperature: 0.2, 
                    max_tokens: 512,
                    });

                    const phanHoiTuAI = ketQua.choices[0].message.content;
                    
                    // Dọn dẹp JSON
                    let chuoiJsonSach = phanHoiTuAI.replace(/```json|```/g, "").trim();
                    chuoiJsonSach = chuoiJsonSach.replace(/[\r\n\t]+/g, " "); 
                    const ketQuaHoanChinh = JSON.parse(chuoiJsonSach);
                    
                    console.log("🎯 KẾT QUẢ TỪ NVIDIA:", ketQuaHoanChinh);
                    return res.status(200).json({
                    trangThai: "tc",
                    data: ketQuaHoanChinh
                    });
            }catch(err){
                console.log("mode nvidia cham bai that bai: "+err);
                try{
                    ///// lần 3 yêu cầu MISTRAL chám bài 
                    let khoangDiem = "";
    
                    if (Number(type) === 1) {
                    khoangDiem = "từ 0 đến 2 (thấp nhất là 0 điểm và cao nhất là 2 điểm)";
                    } else if (Number(type) === 2) {
                    khoangDiem = "từ 0 đến 6 (thấp nhất là 0 điểm và cao nhất là 6 điểm)";
                    }
                    const duLieuGoiDi = [];
                    const yeuCau = `
                    Bạn là một giám khảo chấm thi tiếng Anh chuẩn TOEIC/IELTS phần Writing (Tự luận).
                    
                    THÔNG TIN BÀI THI:
                    - Câu hỏi: "${CauHoi}"
                    - Hình ảnh đính kèm: (Học viên sẽ miêu tả dựa trên hình ảnh được cung cấp nếu có).
                    - Yêu cầu/Giải thích của giáo viên: "${giaiThich}"

                    BÀI LÀM CỦA HỌC VIÊN:
                    "${dapAnHocVien}"

                    NHIỆM VỤ:
                    Hãy đọc bài làm của học viên, phân tích độ chuẩn xác về ngữ pháp, từ vựng và sự liên quan đến câu hỏi cũng như hình ảnh của đề thi.
                    
                    QUAN TRỌNG: Hãy trả về kết quả ĐÚNG theo định dạng JSON sau, không bọc markdown, không kèm theo bất kỳ chữ nào khác:
                    {
                        "diemUocTinh": "Số điểm ${khoangDiem}",
                        "loiNhanXet": "Lời nhận xét chi tiết bằng tiếng Việt để học viên có thể cải thiện (ngắn gọn nhất có thể, đúng trọng tâm),(LƯU Ý QUAN TRỌNG: Viết liền trên 1 dòng duy nhất, tuyệt đối KHÔNG sử dụng ký tự xuống dòng ở đây)"
                    }
                    `;
                    duLieuGoiDi.push({ type: "text", text: yeuCau });
                    const apiKey = process.env.MISTRAL_API_KEY;
                    const client = new Mistral({ apiKey: apiKey });
                    console.log("⏳ Đang nhờ MISTRAL chấm bài...");
                    if (anh !== "") {
                          const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
                          const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
                          const anhBase64 = fs.readFileSync(duongDanAnhThat).toString('base64');
                          const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;
                          
                          duLieuGoiDi.push({
                            type: "image_url",
                            imageUrl: dataUrl // Theo chuẩn SDK của Mistral
                          });
                        }
                    const ketQua = await client.chat.complete({
                    model: "pixtral-12b-2409", // Cỗ máy Vision cực xịn của Mistral
                    messages: [{ role: "user", content: duLieuGoiDi }],
                    temperature: 0.2,
                    responseFormat: { type: "json_object" } // Bắt buộc Mistral trả về JSON 100% sạch
                    });

                    const phanHoiTuAI = ketQua.choices[0].message.content;
                    
                    // 4. Dọn dẹp JSON an toàn
                    let chuoiJsonSach = phanHoiTuAI.replace(/```json|```/g, "").trim();
                    chuoiJsonSach = chuoiJsonSach.replace(/[\r\n\t]+/g, " "); 
                    const ketQuaHoanChinh = JSON.parse(chuoiJsonSach);
                    
                    console.log("🎯 KẾT QUẢ TỪ MISTRAL:", ketQuaHoanChinh);
                    return res.status(200).json({
                    trangThai: "tc",
                    data: ketQuaHoanChinh
                    });
                }catch(err){
                    console.log("mode MISTRAL chấm bài thất bại :" +err )
                }
            }
        }

  } catch (loi) {
    console.error("❌ Lỗi khi Gemini chấm bài tự luận:", loi.message);
    res.status(500).json({
      trangThai: "tb", 
      loi: "Hệ thống AI đang bận. Vui lòng thử lại sau."
    });
  }
});

/// PHAN XU LY LUU AM THANH

const thuMucGhiAm = path.join(__dirname, 'taiNguyen/fileGhiAm_HV');

app.use('/taiNguyen/fileGhiAm_HV', express.static(thuMucTaiNguyen));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Nếu chưa có thư mục 'taiNguyen' thì tự động tạo
    if (!fs.existsSync(thuMucGhiAm)) {
      fs.mkdirSync(thuMucGhiAm, { recursive: true });
    }
    cb(null, thuMucGhiAm); // Lệnh cất file vào đây
  },
  filename: (req, file, cb) => {
    // Lấy cái tên file gốc mà Frontend ĐÃ ÉP TÊN đính kèm vào kiện hàng
    cb(null, file.originalname); 
  }
});

// Tuyển nhân viên gác cổng
const upload = multer({ storage });

app.post('/api/uploadAudio', upload.single('fileGhiAm'), (req, res) => {
  try {
    // Nếu gác cổng báo không nhận được hàng -> Báo lỗi
    if (!req.file) {
      return res.status(400).json({ trangThai: "tb", loi: "Không nhận được file âm thanh từ Frontend." });
    }

    // Đọc tên file đã lưu thành công
    const tenFile = req.file.filename;

    // Tạo đường link động để Frontend ghép vào src của <audio>
    const linkAmThanh = `taiNguyen/fileGhiAm_HV/${tenFile}`;

    // Trả kết quả về cho Frontend (React)
    res.status(200).json({
      trangThai: "tc",
      linkAmThanh: linkAmThanh,
    });
    console.log("up load file thành công");
    console.log(linkAmThanh);

  } catch (error) {
    console.error("Lỗi Server:", error);
    res.status(500).json({ trangThai: "tb", loi: "Lỗi hệ thống Backend" });
  }
});



/// api cham diem speaking

// chuyển âm thanh sang văn bản






// Khởi tạo client OpenAI


const bocBangWhisper = async (duongDanFile) => {
  try {
    console.log("Đang gửi file .webm cho Whisper bóc băng...");
    const duongDanAudioThat = path.join(__dirname, '../backend/', duongDanFile); 
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(duongDanAudioThat),
      model: "whisper-large-v3", // Sử dụng model Whisper V2/V3 mới nhất
      response_format: "verbose_json", // Bắt buộc để lấy được timestamp
      timestamp_granularities: ["word"], // Yêu cầu bóc tách thời gian từng từ một
    });

    console.log("✅ Whisper bóc băng hoàn tất!");
    
    return transcription;
    

  } catch (error) {
    console.error("❌ Lỗi khi gọi Whisper API:", error.message);
    throw error;
  }
};

module.exports = { bocBangWhisper };

/// đánh giá ngữ điều




const wav = require('node-wav');
const { PitchDetector } = require('pitchy');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// --- 1. TRẠM CHUYỂN ĐỔI ÂM THANH (FFMPEG) ---
const chuyenDoiWebmSangWav = (duongDanWebmGoc, duongDanWavDich) => {
  return new Promise((resolve, reject) => {
    ffmpeg(duongDanWebmGoc)
      .audioChannels(1) 
      .audioFrequency(16000) 
      .audioCodec('pcm_s16le') // Ép chuẩn PCM 16-bit cho thư viện wav đọc
      .on('end', () => resolve(duongDanWavDich))
      .on('error', (err) => reject(err))
      .save(duongDanWavDich);
  });
};

// --- 2. HÀM TÍNH TOÁN TOÁN HỌC ---
const tinhDoLechChuan = (mangSo) => {
  if (mangSo.length === 0) return 0;
  const trungBinh = mangSo.reduce((a, b) => a + b) / mangSo.length;
  const phuongSai = mangSo.reduce((a, b) => a + Math.pow(b - trungBinh, 2), 0) / mangSo.length;
  return Math.sqrt(phuongSai);
};

// --- 3. TRẠM ĐO LƯỜNG NGỮ ĐIỆU (PITCHY) ---
const phanTichNguDieuBangJS = async (duongDanWav) => {
  try {
    console.log("Đang dùng JS thuần đo lường sóng âm...");
    
    // Đọc trực tiếp file WAV vừa được FFmpeg sinh ra
    const buffer = fs.readFileSync(duongDanWav);
    const result = wav.decode(buffer);
    
    const audioData = result.channelData[0]; 
    const sampleRate = result.sampleRate;

    const doDaiKhung = 2048; 
    const detector = PitchDetector.forFloat32Array(doDaiKhung);
    const mangCaoDo = [];

    for (let i = 0; i < audioData.length - doDaiKhung; i += doDaiKhung) {
      const khungAmThanh = audioData.slice(i, i + doDaiKhung);
      const [pitch, clarity] = detector.findPitch(khungAmThanh, sampleRate);
      
      if (clarity > 0.8 && pitch > 50 && pitch < 500) {
        mangCaoDo.push(pitch);
      }
    }

    const doLechChuanF0 = tinhDoLechChuan(mangCaoDo);
    
    let nhanXet = "Chưa xác định";
    if (doLechChuanF0 < 20) {
      nhanXet = "Giọng đọc khá đều đều (Monotone), chưa có sự nhấn nhá trọng âm câu.";
    } else {
      nhanXet = "Giọng đọc có ngữ điệu tốt, trầm bổng và tự nhiên.";
    }

    console.log(`✅ Tính toán xong! Độ biến thiên cao độ (F0 SD): ${doLechChuanF0.toFixed(2)} Hz`);
    return {
      f0_SD: doLechChuanF0.toFixed(2),
      nhanXetNguDieu: nhanXet
    };

  } catch (error) {
    console.error("❌ Lỗi khi phân tích sóng âm bằng JS:", error);
    throw error;
  }
};

// --- 4. LUỒNG CHẠY TEST TỔNG THỂ ---
const chayThuHeThong = async (fileWebmGoc) => {
  try {
    // Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn
    
    const fileWavDich = fileWebmGoc.replace('.webm', '.wav'); 

    console.log("⏳ BƯỚC 1: Đang ép kiểu file .webm sang .wav...");
    await chuyenDoiWebmSangWav(fileWebmGoc, fileWavDich);
    console.log("✅ Ép kiểu thành công!");

    console.log("⏳ BƯỚC 2: Đưa file .wav chuẩn vào thư viện đo sóng âm...");
    const ketQua = await phanTichNguDieuBangJS(fileWavDich); 
    
    console.log("🎯 KẾT QUẢ CUỐI CÙNG:");
    return ketQua;

  } catch (error) {
    console.error("❌ Luồng chạy thất bại:", error);
  }
};

// Kích hoạt chạy thử


/// api

// const genAI = [
//     { 
//         genAI: new GoogleGenerativeAI(process.env.GEMIN_KEY_1), 
//         tenModel: "gemini-2.5-flash-lite" 
//       },
//       { 
//         genAI: new GoogleGenerativeAI(process.env.GEMIN_KEY_2), 
//         tenModel: "gemini-1.5-flash" 
//       },
//       { 
//         genAI: new GoogleGenerativeAI(process.env.GEMIN_KEY_3), 
//         tenModel: "gemini-pro" 
//       }
// ]

const openai1 = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY, // NHỚ DÁN KEY MỚI VÀO FILE .ENV NHÉ!
  baseURL: 'https://integrate.api.nvidia.com/v1', // Trỏ đường truyền về NVIDIA thay vì ChatGPT
});



app.post(`/api/chamDiemSpeaking`, async (req, res) => {
  const { CauHoi, dapAnHocVien, giaiThich, anh, type } = req.body;
  
  try {
    const nguDieu = await chayThuHeThong(dapAnHocVien);
    const Whisper = await bocBangWhisper(dapAnHocVien);

    console.log("Whisper Text:", Whisper);
    console.log("Ngữ điệu:", nguDieu);

    const duLieuGoiDi = [];
    
    // 1. Chuẩn bị File Âm Thanh (Đã sửa lỗi ép kiểu luôn thành mp3)
    if (dapAnHocVien !== "") {
      const duongDanAudioThat = path.join(__dirname, '../backend/', dapAnHocVien); 
      const mimeTypeAudio = dapAnHocVien.endsWith('.mp3') ? 'audio/mp3' : 'audio/webm';
      const dapAnHocVienGhiAm = chuyenFileChoGemini(duongDanAudioThat, mimeTypeAudio);
      duLieuGoiDi.push(dapAnHocVienGhiAm);
    }
    
    // 2. Chuẩn bị File Ảnh
    

    // 3. Chuẩn bị Prompt (Đã xóa dấu phẩy thừa ở cuối JSON)
    

    
    try{
        ////gemi chấm bài
        let duLieuGoiDi = [];
        
                
                    const yeuCau = `
                    Bạn là một giám khảo chấm thi tiếng Anh chuẩn TOEIC/IELTS.
                    THÔNG TIN BÀI THI:
                        - Câu hỏi: "${CauHoi}"
                        - Hình ảnh đính kèm: có thể có hoặc không.
                        - Yêu cầu/Giải thích của giáo viên: "${giaiThich}"

                    DỮ LIỆU BÀI LÀM CỦA HỌC VIÊN:
                        - Nội dung học viên đã nói: "${Whisper.text}"
                        - Đánh giá ngữ điệu giọng nói: "${nguDieu.nhanXetNguDieu}"

                    Dựa vào nội dung bóc băng và đánh giá ngữ điệu, hãy phân tích độ trôi chảy, ngữ pháp, từ vựng và sự liên quan đến đề thi.
                    
                    QUAN TRỌNG: Hãy trả về kết quả ĐÚNG theo định dạng JSON sau, không bọc markdown, không kèm chữ nào khác:
                    {
                        "diemUocTinh": "Số điểm từ 0-8",
                        "loiNhanXet": "Lời nhận xét chi tiết bằng tiếng Việt để học viên có thể cải thiện (ngắn gọn nhất có thể, đúng trọng tâm),(LƯU Ý QUAN TRỌNG: Viết liền trên 1 dòng duy nhất, tuyệt đối KHÔNG sử dụng ký tự xuống dòng ở đây)"
                    }
                    `;
                    duLieuGoiDi.push(yeuCau );
            if (anh !== "") {
            const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
            const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
            const phanHinhAnh = chuyenFileChoGemini(duongDanAnhThat, mimeTypeAnh);
            duLieuGoiDi.push(phanHinhAnh);
            }
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            console.log(`⏳ Đang nhờ gemini chấm bài tự luận...`);
            const ketQua = await model.generateContent(duLieuGoiDi);
            const phanHoiTuAI = ketQua.response.text();
            
            // Dọn dẹp markdown rác và Parse JSON
            const chuoiJsonSach = phanHoiTuAI.replace(/```json|```/g, "").trim(); 
            const ketQuaHoanChinh = JSON.parse(chuoiJsonSach);
            console.log("🎯 KẾT QUẢ CHẤM ĐIỂM TỰ LUẬN:", ketQuaHoanChinh);
            
            // Trả kết quả thành công và DỪNG API
            return res.status(200).json({
            trangThai: "tc",
            data: ketQuaHoanChinh
            });
        }catch(err){
            console.log("mode gemini cham bai that bai: "+err);
            
            
            ///// chấm lần 2 yêu cầu nvidia
            try{



                let duLieuGoiDi = [];
                
                    const yeuCau = `
                    Bạn là một giám khảo chấm thi tiếng Anh chuẩn TOEIC/IELTS.
                    THÔNG TIN BÀI THI:
                        - Câu hỏi: "${CauHoi}"
                        - Hình ảnh đính kèm: có thể có hoặc không.
                        - Yêu cầu/Giải thích của giáo viên: "${giaiThich}"

                    DỮ LIỆU BÀI LÀM CỦA HỌC VIÊN:
                        - Nội dung học viên đã nói: "${Whisper.text}"
                        - Đánh giá ngữ điệu giọng nói: "${nguDieu.nhanXetNguDieu}"

                    Dựa vào nội dung bóc băng và đánh giá ngữ điệu, hãy phân tích độ trôi chảy, ngữ pháp, từ vựng và sự liên quan đến đề thi.
                    
                    QUAN TRỌNG: Hãy trả về kết quả ĐÚNG theo định dạng JSON sau, không bọc markdown, không kèm chữ nào khác:
                    {
                        "diemUocTinh": "Số điểm từ 0-8",
                        "loiNhanXet": "Lời nhận xét chi tiết bằng tiếng Việt để học viên có thể cải thiện (ngắn gọn nhất có thể, đúng trọng tâm),(LƯU Ý QUAN TRỌNG: Viết liền trên 1 dòng duy nhất, tuyệt đối KHÔNG sử dụng ký tự xuống dòng ở đây)"
                    }
                    `;
                    duLieuGoiDi.push({ type: "text", text: yeuCau });
                console.log("⏳ Đang nhờ NVIDIA NIM (Llama 3.2 Vision) chấm bài...");
                if (anh && anh !== "") {
                // TRƯỜNG HỢP 1: BÀI THI CÓ ẢNH (Dùng mảng)
                const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
                const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
                const anhBase64 = fs.readFileSync(duongDanAnhThat).toString('base64');
                const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;
                
                duLieuGoiDi = [
                    { type: "text", text: yeuCau },
                    { type: "image_url", image_url: { url: dataUrl } }
                ];
                } else {
                // TRƯỜNG HỢP 2: BÀI THI CHỈ CÓ CHỮ (Gửi chuỗi Text thuần túy)
                // Chặn đứng lỗi 400 của NVIDIA
                noiDungGuiDi = yeuCau; 
                }
                const ketQua = await openai1.chat.completions.create({
                model: "meta/llama-3.2-90b-vision-instruct", 
                messages: [{ role: "user", content: duLieuGoiDi }],
                temperature: 0.2, 
                max_tokens: 512,
                });

                const phanHoiTuAI = ketQua.choices[0].message.content;
                
                // Dọn dẹp JSON
                let chuoiJsonSach = phanHoiTuAI.replace(/```json|```/g, "").trim();
                chuoiJsonSach = chuoiJsonSach.replace(/[\r\n\t]+/g, " "); 
                const ketQuaHoanChinh = JSON.parse(chuoiJsonSach);
                
                console.log("🎯 KẾT QUẢ TỪ NVIDIA:", ketQuaHoanChinh);
                return res.status(200).json({
                trangThai: "tc",
                data: ketQuaHoanChinh
                });



            }catch(err){
                console.log("mode nvidia cham bai that bai: "+err);
                try{
                    ///// lần 3 yêu cầu MISTRAL chám bài 
                    let duLieuGoiDi = [];
                    const yeuCau = `
                    Bạn là một giám khảo chấm thi tiếng Anh chuẩn TOEIC/IELTS.
                    THÔNG TIN BÀI THI:
                        - Câu hỏi: "${CauHoi}"
                        - Hình ảnh đính kèm: có thể có hoặc không.
                        - Yêu cầu/Giải thích của giáo viên: "${giaiThich}"

                    DỮ LIỆU BÀI LÀM CỦA HỌC VIÊN:
                        - Nội dung học viên đã nói: "${Whisper.text}"
                        - Đánh giá ngữ điệu giọng nói: "${nguDieu.nhanXetNguDieu}"

                    Dựa vào nội dung bóc băng và đánh giá ngữ điệu, hãy phân tích độ trôi chảy, ngữ pháp, từ vựng và sự liên quan đến đề thi.
                    
                    QUAN TRỌNG: Hãy trả về kết quả ĐÚNG theo định dạng JSON sau, không bọc markdown, không kèm chữ nào khác:
                    {
                        "diemUocTinh": "Số điểm từ 0-8",
                        "loiNhanXet": "Lời nhận xét chi tiết bằng tiếng Việt để học viên có thể cải thiện (ngắn gọn nhất có thể, đúng trọng tâm),(LƯU Ý QUAN TRỌNG: Viết liền trên 1 dòng duy nhất, tuyệt đối KHÔNG sử dụng ký tự xuống dòng ở đây)"
                    }
                    `;
                    duLieuGoiDi.push({ type: "text", text: yeuCau });
                    const apiKey = process.env.MISTRAL_API_KEY;
                    const client = new Mistral({ apiKey: apiKey });
                    console.log("⏳ Đang nhờ MISTRAL chấm bài...");
                    if (anh !== "") {
                          const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
                          const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
                          const anhBase64 = fs.readFileSync(duongDanAnhThat).toString('base64');
                          const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;
                          
                          duLieuGoiDi.push({
                            type: "image_url",
                            imageUrl: dataUrl // Theo chuẩn SDK của Mistral
                          });
                        }
                    const ketQua = await client.chat.complete({
                    model: "pixtral-12b-2409", // Cỗ máy Vision cực xịn của Mistral
                    messages: [{ role: "user", content: duLieuGoiDi }],
                    temperature: 0.2,
                    responseFormat: { type: "json_object" } // Bắt buộc Mistral trả về JSON 100% sạch
                    });

                    const phanHoiTuAI = ketQua.choices[0].message.content;
                    
                    // 4. Dọn dẹp JSON an toàn
                    let chuoiJsonSach = phanHoiTuAI.replace(/```json|```/g, "").trim();
                    chuoiJsonSach = chuoiJsonSach.replace(/[\r\n\t]+/g, " "); 
                    const ketQuaHoanChinh = JSON.parse(chuoiJsonSach);
                    
                    console.log("🎯 KẾT QUẢ TỪ MISTRAL:", ketQuaHoanChinh);
                    return res.status(200).json({
                    trangThai: "tc",
                    data: ketQuaHoanChinh
                    });
                }catch(err){
                    console.log("mode MISTRAL chấm bài thất bại :" +err )
                }
            }
        }

  } catch (err) {
    // 5. CHỐT CHẶN CUỐI CÙNG: Tránh việc Frontend bị treo loading
    console.error("❌ Lỗi toàn hệ thống chấm bài speaking: " + err);
    res.status(500).json({
      trangThai: "tb",
      loi: "Hệ thống AI đang bảo trì. Vui lòng thử lại sau."
    });
  }
});




///////////////Bang lop hoc online/////////////////////////////////////

const lopHocOnlineSchemal = new mongoose.Schema({
    idLopHoc:{type:String,require :true},
    tenLH: {type:String, require :true},
    linkLop:{type:String,require:true}
})

const lopHocOnline =  mongoose.model("lopHocOnline",lopHocOnlineSchemal);

///api lay tt lop on

app.get('/api/lay-lopHocon/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        const data = await lopHocOnline.find({idLopHoc:id});
        if(data === 0) return res.status(404).json({trangThai:"ktt"});
        return res.status(200).json({
            trangThai: "tc",
            data:data
        })
    }catch(err){
        console.log("/api/lay-lopHocon/:id THAT BAI");
        res.status(500).json({
            trangThai :"tb"
        })
    }
})

app.post('/api/them-lopHocon/:id',async(req,res)=>{
    try{
        const {tenLH, linkLop} = req.body;
        const idLopHoc = req.params.id;

        const newLopHocOnline = new lopHocOnline({
            idLopHoc:idLopHoc,
            tenLH:tenLH,
            linkLop:linkLop
        })

        await newLopHocOnline.save();
        console.log("/api/them-lopHocon/:id THÀNH CÔNG");
        res.status(201).json({trangThai:"tc"});

    }catch(err){
        console.log("them lop hoc on that bai: "+err);
        res.status(500).json({trangThai:"tb"});
    }
})


/////////////////// bang cong dong //////////////////////////

const CongDongSchemal = new mongoose.Schema({
    idLopHoc:{type:String,require:true},
    tenCD: {type:String, require :true},
    linkCD:{type:String,require:true}
})

const CongDong = mongoose.model("CongDong", CongDongSchemal);


app.get('/api/lay-CongDong/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        const data = await CongDong.find({idLopHoc:id});
        if(data.length === 0) return res.status(404).json({trangThai:"ktt"});
        console.log("tra vè data cộng đồng thành công");
        console.log(data)
        return res.status(200).json({
            trangThai: "tc",
            data:data
        })
    }catch(err){
        console.log("'/api/lay-CongDong/:id THAT BAI");
        res.status(500).json({
            trangThai :"tb"
        })
    }
})

app.post('/api/them-CongDong/:id',async(req,res)=>{
    try{
        const {tenCD, linkCD} = req.body;
        const idLopHoc = req.params.id;

        const newCongDong = new CongDong({
            idLopHoc:idLopHoc,
            tenCD:tenCD,
            linkCD:linkCD
        })
        await newCongDong.save();
        console.log("/api/them-CongDong/:id THÀNH CÔNG");
        res.status(201).json({trangThai:"tc"});

    }catch(err){
        console.log("/api/them-CongDong/:id "+err);
        res.status(500).json({trangThai:"tb"});
    }
})



/////////bang tu vung /////////////////

const TuVungSchemal = new mongoose.Schema({
    idKhoaHoc:{type:String,require:true},
    idLopHoc:{type:String,require:true},
    Email:{type:String,require:true},
    VaiTroNguoiThem:{type:String,require:true},
    TenTuVung:{type:String,require:true},
    tuVung:{type:String,require:true}
})

const TuVung = mongoose.model("TuVung",TuVungSchemal);

/// api them từ vựng 

app.post('/api/them-TuVung/:id',xacThuc , async(req,res)=>{
    try{
        const idLopHoc = req.params.id;
        const idKhoaHoc = await LopHoc.findById(idLopHoc).select('idKhoaHoc');
        const Email = req.user.Email;
        const VaiTroNguoiThem = req.user.VaiTro;
        const {tuVung, TenTuVung } = req.body;
        


        const newTuVung = new TuVung({
            idKhoaHoc : idKhoaHoc.idKhoaHoc,
            idLopHoc: idLopHoc,
            Email:Email,
            VaiTroNguoiThem:VaiTroNguoiThem,
            TenTuVung: TenTuVung,
            tuVung:tuVung
        })
        
        await newTuVung.save();
        console.log("them tu vung thanh cong");
        res.status(201).json({trangThai:"tc"});


    }catch(err){
        console.log("them từ vựng thất bại :"+err);
        res.status(500).json({trangThai:"tb"})
    }
})

//api lay danh sach tu vung cua hoc vien
 
app.get('/api/lay-tuVung-hv/:id', xacThuc,async(req,res)=>{
    try{
    const idLopHoc = req.params.id;
    const email = req.user.Email;
    const dataTuVung = await TuVung.find({idLopHoc:idLopHoc , Email:email ,VaiTroNguoiThem :'Học Viên'}).select(`_id TenTuVung`);
    if(dataTuVung.length===0){
        return res.status(404).json({trangThai:"ktt"});
    }
    return res.status(200).json({trangThai:"tc",
        data: dataTuVung
    })
    }catch(err){
        console.log("lay tu vung that bai");
        res.status(500).json({trangThai :"tb"});
    }
})

//// api lay danh sach tu vung trung tâm
app.get('/api/layDanhSachTuVung-Gv/:id', async (req,res)=>{
    try{
        const idLopHoc = req.params.id;
        const dataKhoaHoc = await LopHoc.findById(idLopHoc).select('idKhoaHoc');
        const idKhoaHoc = dataKhoaHoc.idKhoaHoc
        
        const dataTuVung = await TuVung.find({idKhoaHoc: idKhoaHoc , $or :[
            {VaiTroNguoiThem: 'Giao Vien'},
            {VaiTroNguoiThem: 'admin'}
        ]}).select('_id TenTuVung');
        if(dataTuVung.length===0){
        return res.status(404).json({trangThai:"ktt"});
        }
        return res.status(200).json({trangThai:"tc",
            data: dataTuVung
        })

    }catch(err){
        console.log("lay danh sach tu vung E-learning that bại: "+err);
        res.status(500).json({trangThai:"tb"});
    }
})

/// api lay chi tiet tu vung

app.get(`/api/lay-tuvung-chitiet/:id`,async(req,res)=>{
    try{
        const idTuVung = req.params.id;

        const data= await TuVung.findById(idTuVung).select('TenTuVung tuVung idLopHoc');

        res.status(200).json({
            trangThai:"tc",
            data:data
        })
        console.log(`/api/lay-tuvung-chitiet/${idTuVung} thành cong`)
     

    }catch(err){
        console.log("lay chi tiet từ vựng thất bại :  /api/lay-tuvung-chitiet/:id : "+err)
        res.status(500).json({trangThai:"tb"})
    }
})

app.patch('/api/capNhatTuVung/:id', async(req,res)=>{
    try{
        const idTuVung = req.params.id;
        const {TenTuVung, tuVung} = req.body;

        const updateTuVung = await TuVung.findById(idTuVung);

        updateTuVung.TenTuVung = TenTuVung;
        updateTuVung.tuVung = tuVung;

        await updateTuVung.save();
        console.log(`/api/capNhatTuVung/${idTuVung} thành công 💚`);
        res.status(200).json({trangThai:"tc"})

    }catch(err){
        console.log("/api/capNhatTuVung/:id That bai: "+err );
        res.status(500).json({trangThai:"tb"})
    }
})

///api xoa tu vung 
app.delete('/api/xoaTuVung/:id',async(req,res)=>{
    try{
        const idTuVung = req.params.id;

        const data= await TuVung.findByIdAndDelete(idTuVung);

        
        console.log("xoa tu vung thanh cong 💚");
        res.status(200).json({trangThai:"tc"})
    }catch(err){
        console.log("xoa tu vung that bai ❤️ : " +err);
        res.status(500).json({trangThai:"tb"})
    }
})

/////////////// Bang bai tap ///////////////////////////////

const baitapSchemal = new mongoose.Schema({
    idLopHoc:{type:String, require:true},
    TenBT :{type:String,require:true},
    trangThai:{type:String,default:"banNhap"},
    EmailNGuoiTao:{type:String, require:true},
    ngayTao: {type:Date, default: Date.now},
    hanNop:{type:Date,require:true}
});

const BaiTap = mongoose.model('BaiTap', baitapSchemal);

// api them bai tap

app.post('/api/themBT/:id',xacThuc, async(req,res)=>{
    try{
        const idLopHoc = req.params.id
        const email = req.user.Email;
        const { TenBT , hanNop} = req.body;

        const newBaiTap = new BaiTap({
            idLopHoc: idLopHoc,
            TenBT: TenBT,
            EmailNGuoiTao: email,
            hanNop: hanNop
        });
        await newBaiTap.save();
        console.log("them bài tập thành công  💚");
        res.status(201).json({trangThai:"tc"})
    }catch(err){
        console.log("them bai tap that bai ❤️ : " +err);
        res.status(500).json({trangThai:"tb"});
    }
})
 // api lay bai tap

 app.get('/api/layBaiTap/:id', async(req,res)=>{
    try{
        const idLopHoc = req.params.id
        const dataBaiTap = await BaiTap.find({idLopHoc:idLopHoc});
        if(dataBaiTap.length ===0 ){
            console.log("danh sach bai tap lop khong ton tai ⭐")
            return res.status(404).json({trangThai:"ktt"});
        }
        console.log("tra vè danh sách bài tập thành công 💚")
        return res.status(200).json({
            trangThai:"tc",
            data: dataBaiTap
        })

    }catch(err){
        console.log("lay danh sach bai tap that bai ❤️ : "+err);
        res.status(500).json({trangThai:"tb"});
    }
 })


//////////////////////////// BANG BAI TAP DA NOP///////////////////////////

const BaiTapDaLamSchemal = new mongoose.Schema({
    idBaiTap:{type:String,require:true},
    idLopHoc:{type:String, require: true},
    Email:{type:String,require:true},
    ngayNop:{type:Date, default: Date.now},
    diemUocTinh:{type:Number, default: null },
    diemChinhThuc:{type:Number, default:null}
});

const BaiTapDaLam = mongoose.model('BaiTapDaLam', BaiTapDaLamSchemal);

/// api them bai tap da lam

app.post('/api/nopBaiTap/:id', xacThuc, async(req,res)=>{
    try{
        const idBaiTap = req.params.id;
        const idLopHoc = await BaiTap.findById(idBaiTap).select('idLopHoc');

        if(!idLopHoc) return res.status(404).json({trangThai:"ktt"})

        const email = req.user.Email;
        const {diemUocTinh,diemChinhThuc}= req.body;

        const NopBai = new BaiTapDaLam({
            idBaiTap: idBaiTap,
            idLopHoc: idLopHoc.idLopHoc,
            Email: email,
            diemUocTinh: diemUocTinh,
            diemChinhThuc:diemChinhThuc
        });
        await NopBai.save();
        console.log("Nộp bài tập thành công 💚");
        res.status(201).json({trangThai:"tc"});
        
    }catch(err){
        console.log(" nộp bài tập thất bại ❤️ : "+err);
        res.status(500).json({trangThai:"tb"});
    }
})

// api lay bai tap da lam
app.get('/api/layBaiTapDaLam/:id', xacThuc, async(req,res)=>{
    try{
        const idBaiTap = req.params.id;
        const email = req.user.Email;

        const dataNopBai = await BaiTapDaLam.findOne({idBaiTap:idBaiTap, Email:email});
        if(!dataNopBai) return res.status(404).json({trangThai:"ktt"});
        console.log("lay bai tap da lam thanh cong 💚")
        return res.status(200).json({trangThai:"tc",
            data : dataNopBai
        })

    }catch(err){
        console.log("lay bai tap da lam that bai ❤️ : "+err);
        res.status(500).json({trangThai:"tb"});
    }
})


/////////////// bang chi tiet bai tap///////////////////////

const ChiTietBaiTapSchemal = new mongoose.Schema({
    idBaiTap:{type:String,require: true},
    CauHoi:{type:String, require:true},
    type:{type:Number,default: 0},
    a:{type:String, default:""},
    b:{type:String, default:""},
    c:{type:String, default:""},
    d:{type:String, default:""},
    fileNghe:{type:String,default:""},
    anh:{type:String,default:""},
    dapAn:{type:String,default:""},
    giaiThich:{type:String,default:""}
})

const ChiTietBaiTap = mongoose.model('ChiTietBaiTap',ChiTietBaiTapSchemal);

/// api them chiet bai tap

app.post('/api/themChiTietBaiTap/:id',async(req,res)=>{
    try{    
        const idBaiTap = req.params.id;
        const {CauHoi, type, a,b,c,d,fileNghe,anh ,dapAn} = req.body;
        
        const newChiTietBaiTap = new ChiTietBaiTap({
            idBaiTap:idBaiTap,
            CauHoi:CauHoi,
            type:type,
            a:a,
            b:b,
            c:c,
            d:d,
            fileNghe:fileNghe,
            anh:anh,
            dapAn:dapAn
        })
        await newChiTietBaiTap.save();
        console.log("thêm chi tiết bài tập thành công  💚");
        res.status(201).json({trangThai:"tc"});

    }catch(err){
        console.log("them chi tiet bai tap that bai  ❤️ : "+err);
        res.status(500).json({trangThai:"tb"});
    }
})

// api lay danh sach chi tiết bài tâp (câu hỏi)

app.get('/api/LatDanhSachChiTietBaiTap/:id',async(req,res)=>{
    try{
        const idBaiTap = req.params.id;

        const dataDSBaiTap = await ChiTietBaiTap.find({idBaiTap:idBaiTap});
        if(dataDSBaiTap.length===0){
            return res.status(404).json({trangThai:"ktt"});
        }
        console.log("lay danh sach chi tiet bai tap thanh công 💚")
        return res.status(200).json({
            trangThai:"tc",
            data: dataDSBaiTap
        })

    }catch(err){    
        console.log("lay chi tiet bai tap that bai ❤️ : " +err);
        res.status(500).json({trangThai:"tb"});
    }
})

//////////// bang chi tiet bai tap da lam  /////////////////

const ChiTietBaiTapDaLamSchemal = new mongoose.Schema({
    idBaiTap:{type:String,require:true},
    email:{type:String,require:true},
    CauHoi:{type:String, require:true},
    type:{type:Number,default: 0},
    a:{type:String, default:""},
    b:{type:String, default:""},
    c:{type:String, default:""},
    d:{type:String, default:""},
    fileNghe:{type:String,default:""},
    anh:{type:String,default:""},
    dapAn:{type:String,default:""},
    dapAnHocVien:{type:String,default:""},
    giaiThich:{type:String,default:""},
    loipheAI:{type:String,default:""},
})

const ChiTietBaiTapDaLam = mongoose.model('ChiTietBaiTapDaLam',ChiTietBaiTapDaLamSchemal);

/// api thêm chi tiết bài tập đã làm

app.post(`/api/theChiTietBaiTapDaLam/:id`,xacThuc, async(req,res)=>{
    try{
        const idBaiTap = req.params.id;
        const email = req.user.Email;
        // const {CauHoi, type, a,b,c,d,fileNghe,anh,dapAnDung,dapAnHocVien,giaiThich,loipheAI}= req.body;
        const dataDapANHocVien = req.body;
        const mangDapAnHoanChinh = dataDapANHocVien.map((item)=>{
            return{
                idBaiTap:idBaiTap,
                email:email,
                ...item,
            }
        });
        await ChiTietBaiTapDaLam.insertMany(mangDapAnHoanChinh);
        console.log("thêm chi tiêt bai tập đã làm THÀNH CÔNG 💚");
        res.status(201).json({trangThai:"tc"});
    }catch(err){
        console.log("thêm chi tiết bài tập đã làm THẤT BẠI ❤️");
        res.status(500).json({trangThai:"tb"});
    }
})

app.get(`/api/xemtheChiTietBaiTapDaLam/:id`,xacThuc, async(req,res)=>{
    try{
        const idBaiTap = req.params.id;
        const email = req.user.Email;

        const data = await ChiTietBaiTapDaLam.find({idBaiTap:idBaiTap, email:email});
        if(data.length===0) return res.status(404).json({ trangThai:"ktt"});

        return res.status(200).json({trangThai:"tc",
            data: data
        })
        console.log("trả về dữ liệu chi tiết bài tập thành công 💚")
    }catch(err){
        console.log("lay chi tiet bai tap that bai ❤️ : " +err);
        res.status(500).json({trangThai:"tb"});
    }
})

//////////////////////////////////////////////////////////////////
app.listen(port,()=>{
    console.log(`server dang chay tai :http://localhost:${port}`)
})
