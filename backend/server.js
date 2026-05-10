const express = require('express');
const app = express();
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

mongoose.connect('mongodb://localhost:27017/E-learning').then(() => {
    console.log("kết nối mongodb thanh cong 💚");
}).catch((err) => {
    console.log("kết nối mongodb thất bại ❤️ " + err);
})

//////////////// API TƯ VẤN /////////////////////////////////

const TuVanSchema = new mongoose.Schema({
    HoTen: { type: String, require: true },
    Sdt: { type: String, require: true },
    NamSinh: { type: Number },
    Email: { type: String, require: true },
    NgheNghiep: { type: String },
    QuanTam: { type: String, require: true },
    NoiDung: { type: String, require: true }

});

const TuVan = mongoose.model('TuVan', TuVanSchema);

app.post('/tuvan', async (req, res) => {
    try {
        const { HoTen, Sdt, NamSinh, Email, NgheNghiep, QuanTam, NoiDung } = req.body;

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
    } catch (err) {
        res.status(400).json({
            trangThai: "gửi tư vấn thất bại : " + err
        })
    }
});

////////////////////xác thực ///////////////////////

const xacThuc = (req, res, next) => {

    const token = req.header('Authorization');

    if (!token) return res.status(400).json({
        trangThai: "hh",
        mess: "phien dang nhap het han vui long dang nhap lai"
    })

    try {
        const GiaiMa = jwt.verify(token, "ToanDepTrai");

        req.user = GiaiMa;

        next();

    }
    catch (err) {
        res.status(500).json({
            trangThai: "hh",
            mess: "phien dang nhap het han vui long dang nhap lai"
        })
        console.log("xác thực thất bại : " + err)
    }
}

app.get('/api/xacThuc-thongTinTk', xacThuc, async (req, res) => {
    const { Email, VaiTro } = req.user;
    res.status(200).json({
        trangThai: "tc",
        data: {
            Email: Email,
            VaiTro: VaiTro
        }
    })
})

//////////////////   BANG TÀI KHOẢN   ////////////////////////

const TaiKhoanSchema = new mongoose.Schema({
    sdt: { type: String, require: true },
    mk: { type: String, require: true },
    HoTen: { type: String, require: true },
    NamSinh: { type: Number },
    Email: { type: String, require: true, unique: true },
    VaiTro: { type: String, default: "Học Viên" },
    NgheNghiep: { type: String }
});

const TaiKhoan = mongoose.model('TaiKhoan', TaiKhoanSchema);

///////////kt số điện thoại
app.post('/dangnhap/email', async (req, res) => {
    try {
        const { Email } = req.body;
        console.log("1")
        const check = await TaiKhoan.findOne({ Email: Email })
        console.log("2")
        if (check) return res.status(200).json({ trangThai: "T" });
        return res.status(400).json({
            trangThai: "F"

        });

    } catch (err) {
        res.status(500).json({
            trangThai: "tim email thất bại"
        })
    }
})

////////đăng nhập
app.post('/dangnhap/dn', async (req, res) => {
    try {
        const { Email, mk } = req.body;

        const check = await TaiKhoan.findOne({ Email: Email });
        const matKhauDung = await bcrypt.compare(mk, check.mk);

        if (!matKhauDung) return res.status(400).json({
            trangThai: "smk"
        })

        else {
            const theVip = jwt.sign(
                { Email: check.Email, VaiTro: check.VaiTro },
                "ToanDepTrai",
                { expiresIn: "5h" }

            );

            res.status(200).json({
                trangThai: "thanhCong",
                Token: theVip
            })
        }
    } catch (err) {
        res.status(500).json({
            trangThai: "loi trong qua trinh dang nhap :" + err
        })
    }
})

////ĐĂNG KÝ
app.post('/dangky', async (req, res) => {
    try {
        const { sdt, mk, HoTen, NamSinh, Email, VaiTro, NgheNghiep } = req.body;
        console.log(1);
        const giavi = await bcrypt.genSalt(10);
        console.log(2);
        const matKhauBam = await bcrypt.hash(mk, giavi)
        console.log(3);
        const taikhoanMoi = new TaiKhoan({
            sdt: sdt,
            mk: matKhauBam,
            HoTen: HoTen,
            NamSinh: NamSinh,
            Email: Email,
            VaiTro: VaiTro,
            NgheNghiep: NgheNghiep
        })
        console.log(4);
        await taikhoanMoi.save();
        console.log(5);
        res.status(200).json({
            trangThai: true
        })
    } catch (err) {
        res.status(400).json({
            trangThai: false,
            mess: err
        })
    }
})

// api lay thong tin tai khoan 

app.get('/api/lay-tt-tk', xacThuc, async (req, res) => {
    try {
        const Email = req.user.Email;
        const data = await TaiKhoan.findOne({ Email: Email });
        res.status(200).json({
            trangThai: "tc",
            data: data
        })
        console.log("/api/lay-tt-tk thành công")

    } catch (err) {
        console.log("lay thong tin tk that bai: " + err);
        res.status(500).json({ trangThai: "tb" })
    }
})

/// api cap nhat thong tin tai khoản 

app.patch('/api/cap-nhat-tt-tk', xacThuc, async (req, res) => {
    try {
        const email = req.user.Email;
        const { HoTen, NamSinh, sdt, NgheNghiep } = req.body;
        const updateTK = await TaiKhoan.findOne({ Email: email });
        if (HoTen) updateTK.HoTen = HoTen;
        if (NamSinh) updateTK.NamSinh = NamSinh;
        if (sdt) updateTK.sdt = sdt;
        if (NgheNghiep) updateTK.NgheNghiep = NgheNghiep;

        await updateTK.save();
        console.log("thành công: /api/cap-nhat-tt-tk")
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log(" thất bại: /api/cap-nhat-tt-tk  : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

///api doi mật khẩu

app.patch('/api/doi-mat-khau', xacThuc, async (req, res) => {
    try {
        const Email = req.user.Email;
        const { mkCu, mkMoi } = req.body;
        const tk = await TaiKhoan.findOne({ Email: Email });
        const mkdung = await bcrypt.compare(mkCu, tk.mk);

        if (!mkdung) {
            console.error("sai mat khau");
            return res.status(400).json({ trangThai: "smk" });

        }
        console.log(mkCu);
        console.log(mkdung)
        const giavi = await bcrypt.genSalt(10);
        const mkbam = await bcrypt.hash(mkMoi, giavi);
        tk.mk = mkbam;
        await tk.save();
        res.status(200).json({ trangThai: "tc" });
        console.log("doi mat khau thanh cong")
    } catch (err) {
        console.log("/api/doi-mat-khau that bai: " + err);
        res.status(500).json({ trangThai: "tb" })
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
        res.status(500).json({ trangThai: "Không gửi được email" + err });
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

    const { email, HoTen, sdt, NamSinh, NgheNghiep, TenKhoaHoc, Gia, TenLop, Time } = req.body;
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
        res.status(500).json({ trangThai: "tb" + err });
    }
});




///////////////////////////////////////////////////////



//////////////////////KHÓA HỌC////////////////////////////////

const KhoaHocSchema = new mongoose.Schema({
    TenKhoaHoc: { type: String, require: true },
    DauRa: { type: String, require: true },
    MoTa: { type: String, require: true },
    PhuHop: { type: String, require: true },
    Gia: { type: Number, require: true },
    Image: { type: String, require: true },
    QuyenLoi: { type: String, require: true },
    PhuongPhap: { type: String, require: true },
    KetQua: { type: String, require: true },
    trangThai: { type: String, default: "Đang Hoạt Động" }

})

const KhoaHoc = mongoose.model('KhoaHoc', KhoaHocSchema);

//// api them khoa hoc 

app.post('/ThemKhoaHoc', xacThuc, async (req, res) => {
    try {

        const VaiTro = req.user.VaiTro;

        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" })

        const { TenKhoaHoc, DauRa, MoTa, PhuHop, Gia, Image, QuyenLoi, PhuongPhap, KetQua, trangThai } = req.body;

        const Data = new KhoaHoc({
            TenKhoaHoc: TenKhoaHoc,
            DauRa: DauRa,
            MoTa: MoTa,
            PhuHop: PhuHop,
            Gia: Gia,
            Image: Image,
            QuyenLoi: QuyenLoi,
            PhuongPhap: PhuongPhap,
            KetQua: KetQua,
            trangThai: trangThai
        })

        await Data.save();

        res.status(202).json({
            trangThai: "tc",
            mess: "them khoa hoc thanh cong"
        })
        console.log("them khoa hoc thanh cong 👌")

    } catch (err) {
        res.status(500).json({
            trangThai: "loi",
            mess: "loi tu phia server " + err
        })
        console.log("loi khi them khoa hoc: " + err);
    }
})

app.patch('/capNhatKhoaHoc/:id', xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;
        const idKhoaHoc = req.params.id;
        const dataKhoaHoc = await KhoaHoc.findById(idKhoaHoc);
        if (!dataKhoaHoc) return res.status(404).json({ trangThai: "ktt" });
        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" })
        const { TenKhoaHoc, DauRa, MoTa, PhuHop, Gia, Image, QuyenLoi, PhuongPhap, KetQua, trangThai } = req.body;
        dataKhoaHoc.TenKhoaHoc = TenKhoaHoc;
        dataKhoaHoc.DauRa = DauRa;
        dataKhoaHoc.MoTa = MoTa;
        dataKhoaHoc.PhuHop = PhuHop;
        dataKhoaHoc.Gia = Gia;
        dataKhoaHoc.Image = Image;
        dataKhoaHoc.QuyenLoi = QuyenLoi;
        dataKhoaHoc.PhuongPhap = PhuongPhap;
        dataKhoaHoc.KetQua = KetQua;
        dataKhoaHoc.trangThai = trangThai;

        await dataKhoaHoc.save();

        res.status(200).json({ trangThai: "tc" });
        console.log("cập nhật khóa học thành công 💚")
    } catch (err) {
        console.log("cap nhat khoa hoc that bai : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})


/// api lay danh sach  khoa Học

app.get('/khoaHoc', async (req, res) => {
    try {
        const data = await KhoaHoc.find();

        res.status(200).json({
            trangThai: "tc",
            dulieu: data
        })


    } catch (err) {
        res.status(500).json({
            trangThai: "loi",
            mess: " loi tu phia server " + err
        })
    }
})

// api xóa khóa Học

app.delete(`/xoaKhoaHoc/:id`, xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;
        const idKhoaHoc = req.params.id;
        const dataKhoaHoc = await KhoaHoc.findById(idKhoaHoc);
        if (!dataKhoaHoc) return res.status(404).json({ trangThai: "ktt" });
        if (VaiTro !== "admin") return res.status(200).json({ trangThai: "kdtq" });/// không đủ thẩm quyền

        const datalop = await LopHoc.find({
            idKhoaHoc: idKhoaHoc, $or: [
                { trangThai: "khaiGiang" },
                { trangThai: "dangHoatDong" }
            ]
        });
        if (datalop.length !== 0) return res.status(200).json({ trangThai: "dangCoLop" });

        const xoa = await KhoaHoc.findByIdAndDelete(idKhoaHoc);
        res.status(200).json({ trangThai: 'tc' });
    } catch (err) {
        console.log("xóa khóa học thất bại :" + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

/// api lay chi tiet khoa hoc

app.get('/ChiTietKhoaHoc/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await KhoaHoc.findById(id);
        if (!data) {
            return res.status(404).json({ trangThai: "loi", mess: "id khong ton tai" });
            console.log("id khong ton tai")
        }
        else {
            res.status(200).json({ trangThai: "tc", dulieu: data });
            console.log("lay data chi tiet khoa hoc thanh cong");
        }
    } catch (err) {
        res.status(500).json({
            trangThai: "loi",
            mess: " loi phia server " + err
        })
        console.log("loi lay chi tiet khoa hoc :" + err)
    }
})



//////////////////////////// BANG LOP HOC ///////////////////////////////

const LopHocSchema = new mongoose.Schema({
    idKhoaHoc: { type: String, require: true },
    trangThai: { type: String, require: true },
    DateKhaiGiang: { type: String, require: true },
    LichHoc: { type: String, require: true },
    GioHoc: { type: String, require: true },
    TenLop: { type: String, require: true },
    SoLuong: { type: Number, default: 0 }
});

const LopHoc = mongoose.model('LopHoc', LopHocSchema);

/// api cập nhật lớp học
app.patch(`/CapNhatLopHoc/:id`, xacThuc, async (req, res) => {
    try {
        const id = req.params.id;
        const dataLopHoc = await LopHoc.findById(id);
        if (!dataLopHoc) return res.status(404).json({ trangThai: "ktt" });

        const VaiTro = req.user.VaiTro;
        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" });/// không đủ thẩm quyền
        const { trangThai, DateKhaiGiang, LichHoc, GioHoc, TenLop } = req.body;

        dataLopHoc.trangThai = trangThai;
        dataLopHoc.DateKhaiGiang = DateKhaiGiang;
        dataLopHoc.LichHoc = LichHoc;
        dataLopHoc.GioHoc = GioHoc;
        dataLopHoc.TenLop = TenLop;

        await dataLopHoc.save()
        res.status(200).json({ trangThai: "tc" });

    } catch (err) {
        console.log("cập nhật lớp học thất bại");
        res.status(200).json({ trangThai: "tb" })
    }
})


/// api lay toan bo danh sach lop hoc

app.get(`/layDanhSachLopHoc`, async (req, res) => {
    try {
        const data = await LopHoc.find();
        if (data.length === 0) return res.status(200).json({ trangThai: "ktt" });
        return res.status(200).json({
            trangThai: "tc",
            data: data
        })
    } catch (err) {
        res.status(500).json({ trangThai: "tb" })
        console.log("lay danh sach lop hoc that bai :" + err)
    }
})


/// api lay danh sach lop hoc  theo khóa học

app.get('/lophoc/lay/:id', async (req, res) => {
    try {
        const idKhoaHoc = req.params.id;
        const trangThai = "Khai Giảng";
        const Data = await LopHoc.find({ idKhoaHoc: idKhoaHoc, trangThai: trangThai });
        if (Data.length === 0) {
            console.log("hien khong co lop hoc nao");
            return res.status(404).json({
                trangThai: "ktt",
                mess: "hien khoa hoc nay khong co lop hoc nao "
            })
        }
        console.log("tra ve danh sach lop hocc thanh cong");
        return res.status(200).json({
            trangThai: "tc",
            Data: Data
        })

    } catch (err) {
        console.log("lay danh sach lop hoc that bai :" + err);
        res.status(500).json({
            trangThai: "tb",
            mess: err
        })
    }
})



/// api them lop hoc theo khóa học

app.post('/lophoc/them', xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;
        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" });/// không đủ thẩm quyền
        const { idKhoaHoc, trangThai, DateKhaiGiang, LichHoc, TenLop, GioHoc } = req.body;

        const check = await KhoaHoc.findById(idKhoaHoc);

        if (!check) {
            console.log("khoa hoc khong ton tai");
            return res.status(404).json({
                trangThai: "tb",
                mess: "khoa hoc khong ton tai"
            });

        };

        const newLopHoc = new LopHoc({
            idKhoaHoc: idKhoaHoc,
            trangThai: trangThai,
            DateKhaiGiang: DateKhaiGiang,
            LichHoc: LichHoc,
            GioHoc: GioHoc,
            TenLop: TenLop
        });

        await newLopHoc.save();

        res.status(201).json({
            trangThai: "tc"
        })
        console.log("them lop thanh cong");
    } catch (err) {
        res.status(500).json({
            trangThai: "tb",
            mess: "loi tu phia server :" + err
        })
        console.log("loi khi them lop hoc " + err)
    }
})

///api cập nhật sỉ số lớp

app.patch(`/api/cap-nhat-si-so/:id`, async (req, res) => {
    try {
        const id = req.params.id
        const data = await LopHoc.findById(id);
        data.SoLuong = data.SoLuong + 1;
        data.save();
        console.log("cap nhat si so lop tk");
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
        console.log("cap nhat si so that bai: " + err)
    }
})

/// api kt si so 

app.get('/api/ktSiSo/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await LopHoc.findById(id);

        res.status(200).json({
            trangThai: "tc",
            mess: data.SoLuong
        })
        console.log("lay si so tk")
    } catch (err) {
        console.log("kt si so that bai : " + err);
        res.status(500).json({
            trangThai: "tb"
        })
    }
})

// api lay chi tiet lop hoc

app.get(`/layChiTietLopHoc/:id`, async (req, res) => {
    try {
        const id = req.params.id;
        const data = await LopHoc.findById(id);
        if (!data) return res.status(404).json({ trangThai: "ktt" });
        res.status(200).json({
            trangThai: "tc",
            data: data
        })
        console.log("lay chi tiết lớp học thành công")

    } catch (err) {
        console.log("lấy chi tiết lớp học thất bại :" + err);
        res.status(500).json({ trangThai: "tb" })
    }})
// API xóa lớp học toàn diện
app.delete('/api/xoa-lop-hoc-toan-dien/:id', xacThuc, async (req, res) => {
    try {
        const idLopHoc = req.params.id;
        const VaiTro = req.user.VaiTro;
        
        // Kiểm tra quyền admin
        if (VaiTro !== "admin") return res.status(403).json({ trangThai: "kdtq" });

        // Xóa Lớp học
        await LopHoc.findByIdAndDelete(idLopHoc);

        // Xóa Lớp học online
        if (typeof lopHocOnline !== "undefined") await lopHocOnline.deleteMany({ idLopHoc: idLopHoc });

        // Xóa Cộng đồng
        if (typeof CongDong !== "undefined") await CongDong.deleteMany({ idLopHoc: idLopHoc });

        // Xóa Bài tập
        if (typeof BaiTap !== "undefined") await BaiTap.deleteMany({ idLopHoc: idLopHoc });

        // Xóa Bài tập đã làm
        if (typeof BaiTapDaLam !== "undefined") await BaiTapDaLam.deleteMany({ idLopHoc: idLopHoc });

        // Xóa Chi tiết bài tập
        if (typeof ChiTietBaiTap !== "undefined") await ChiTietBaiTap.deleteMany({ idLopHoc: idLopHoc });

        // Xóa Chi tiết bài tập đã làm
        if (typeof ChiTietBaiTapDaLam !== "undefined") await ChiTietBaiTapDaLam.deleteMany({ idLopHoc: idLopHoc });

        // Xóa Điểm danh
        if (typeof DiemDanh !== "undefined") await DiemDanh.deleteMany({ idLopHoc: idLopHoc });

        // Xóa Chi tiết điểm danh
        if (typeof ChiTietDiemDanh !== "undefined") await ChiTietDiemDanh.deleteMany({ idLopHoc: idLopHoc });

        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi xóa lớp học toàn diện:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

////////////////////////TRANG XÁC NHẬN THANH TOÁN//////////////////////

///api lay thong tin thanh TOÁN

app.get('/XNThanhToan/:id', xacThuc, async (req, res) => {
    try {

        const idLopHoc = req.params.id;
        const email = req.user.Email;
        console.log(email);
        const dataLopHoc = await LopHoc.findById(idLopHoc);
        const dataTk = await TaiKhoan.findOne({ Email: email });
        const dataKH = await KhoaHoc.findById(dataLopHoc.idKhoaHoc);
        const data = {
            datalop: dataLopHoc,
            datatk: dataTk,
            datakh: dataKH,
        }

        res.status(200).json({
            trangThai: "tc",
            data: data
        })

    } catch (err) {
        res.status(500).json({
            trangThai: "loi1",
            mess: err
        });
        console.log("loi xan nhan thanh toan: " + err);
    }



})

app.patch('/XNThanhToan/update', xacThuc, async (req, res) => {
    try {

        const Email = req.user.Email;
        const update = await TaiKhoan.findOne({ Email: Email });
        if (!update) {
            return res.status(404).json({
                trangThai: "ktt",
                mess: "email khong ton tai"
            })
        }
        if (req.body.sdt) update.sdt = req.body.sdt;
        await update.save();
        res.status(200).json({
            trangThai: "tc"
        })
    } catch (err) {
        res.status(500).json({
            trangThai: "loi",
            mess: "loi server: " + err
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
            trangThai: "tc",
            data: {
                orderCode: paymentLinkData.orderCode,
                maNganHang: paymentLinkData.bin, // Mã ngân hàng
                soTK: paymentLinkData.accountNumber, // Số TK của bạn
                Gia: paymentLinkData.amount,
                tenTK: paymentLinkData.accountName,
                ghiChu: paymentLinkData.orderCode,
                qrCode: paymentLinkData.qrCode // CHUỖI MÃ QR QUAN TRỌNG NHẤT
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi tạo mã QR' });
    }
});

app.get('/KTdonHang/:id', async (req, res) => {
    try {

        const id = req.params.id;
        const check = await payos.getPaymentLinkInformation(id);
        if (check.status === 'PAID') return res.status(200).json({ trangThai: "tc" });
        return res.status(400).json({ trangThai: "tb" });
    } catch (err) {
        res.status(500).json({
            trangThai: "tb"
        })
    }
})


///////////////////Hóa Đơn////////////////////////////////////////

///api thêm hóa đơn

const HoaDonSchema = new mongoose.Schema({
    maHoaDon: { type: String, require: true },
    idKhoaHoc: { type: String, require: true },
    idLopHoc: { type: String, require: true },
    email: { type: String, require: true },
    TenKhoaHoc: { type: String, require: true },
    TenLop: { type: String, require: true },
    Gia: { type: Number, require: true },
    Time: { type: String, require: true }
})

const HoaDon = mongoose.model("HoaDon", HoaDonSchema);

/// api thếm hóa đơn

app.post('/api/them-hoa-don', async (req, res) => {
    try {
        const date = new Date();
        const vietnamTime = date.toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
        });
        const { maHoaDon, idKhoaHoc, idLopHoc, email, TenKhoaHoc, TenLop, Gia } = req.body;
        const newHoaDon = new HoaDon({
            maHoaDon: maHoaDon,
            idKhoaHoc: idKhoaHoc,
            idLopHoc: idLopHoc,
            email: email,
            TenKhoaHoc: TenKhoaHoc,
            TenLop: TenLop,
            Gia: Gia,
            Time: vietnamTime
        });
        await newHoaDon.save();
        res.status(200).json({
            trangThai: "tc"
        })
        console.log("them hd tk");

    } catch (err) {
        res.status(500).json({
            trangThai: "tb",
            mess: "loi server " + err
        })
        console.log("them hd tb");

    }
})

/// api kiểm tra có đang học khóa học nào không

app.get('/api/kt-trung-khoa-hoc', xacThuc, async (req, res) => {
    try {
        const email = req.user.Email;

        const checkHD = await HoaDon.find({ email: email });

        if (checkHD.length === 0) return res.status(200).json({
            trangThai: true
        })

        let sokt = 0;

        for (let i = 0; i < checkHD.length; i++) {
            const checkLH = await LopHoc.findById(checkHD[i].idLopHoc);

            if (!checkLH) {
                continue;
            }  
            else if (checkLH.trangThai !== "Kết Thúc" && checkLH.trangThai !== "Ẩn") {
                console.log(checkLH.trangThai);
                return res.status(200).json({
                    trangThai: false
                })
            }
        }
        console.log("kt-trung-khoa-hoc thành công");
        return res.status(200).json({ trangThai: true })



    } catch (err) {
        console.log("loi /api/kt-trung-khoa-hoc :" + err);
        res.status.json({ trangThai: "tb" })
    }
})

//api lay tt hóa đơn

app.get('/api/lay-tt-hoaDon', xacThuc, async (req, res) => {
    try {
        const email = req.user.Email;
        const data = await HoaDon.find({ email: email });
        if (data.length === 0) {
            console.log("tai khoan khong có hóa đơn");
            return res.status(200).json({ trangThai: "ktt" });

        }
        return res.status(200).json({
            trangThai: "tc",
            data: data
        })
    } catch (err) {
        console.log("loi khi lay tt hóa đơn :" + err)
        res.status(500).json({ trangThai: "tb" });
    }
})

///api lay ten và id lop hoc 

app.get('/api/ten-id-lopHoc', xacThuc, async (req, res) => {
    try {
        let data = [];
        const email = req.user.Email;
        const dsHoaDown = await HoaDon.find({ email: email }).select('idLopHoc  TenKhoaHoc TenLop');

        if (dsHoaDown.length === 0) {
            return res.status(404).json({ trangThai: "ktt" });
        }
        for (const item of dsHoaDown) {
           
            const check = await LopHoc.findById(item.idLopHoc);
            let them={}
            if(!check){
                them = {
                    idLopHoc: item.idLopHoc,
                    TenKhoaHoc: item.TenKhoaHoc,
                    TenLop: item.TenLop,
                    trangThai: "Đã xóa"
                }
            }else{
                them = {
                    idLopHoc: item.idLopHoc,
                    TenKhoaHoc: item.TenKhoaHoc,
                    TenLop: item.TenLop,
                    trangThai: check.trangThai
                }
            }
            data.push(them);
        }
        console.log("/api/ten-id-lopHoc thành công");
        return res.status(200).json({
            trangThai: "tc",
            data: data
        })
    } catch (err) {
        console.log("loi /api/ten-id-lopHoc : " + err);
        res.status(500).json({ trangThai: "tb" })
    }
})


////////////// CHAT BOT AI//////////

require('dotenv').config();

const groq = new Groq(process.env.GROQ_API_KEY);

/// api tạo tin nhắn 

app.post('/api/tap-tn-ai', async (req, res) => {
    try {
        const { message, LichSuChat } = req.body;

        const dataKH = await KhoaHoc.find().select('_id TenKhoaHoc DauRa PhuHop Gia QuyenLoi PhuongPhap KetQua');
        const duLieuKH = JSON.stringify(dataKH);
        const dataLH = await LopHoc.find();
        const duLieuLH = JSON.stringify(dataLH);
        const duLieuLSC = JSON.stringify(LichSuChat);

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
            trangThai: "tc",
            mess: responseText
        });

    } catch (err) {
        console.log("loi chat bot ai: " + err);
        res.status(500).json({
            trangThai: "tb"
        })
    }
})

// API Chat AI dành cho xem video bài giảng
app.post('/api/chat-video-ai', async (req, res) => {
    try {
        const { message, LichSuChat, videoSummary } = req.body;
        const duLieuLSC = JSON.stringify(LichSuChat);

        const tinNhanHeThong = {
            role: "system",
            content: `Bạn là trợ lý học tập ảo của nền tảng E-learning, tên là EduMate.
                Học viên đang xem một video bài giảng. Đây là tóm tắt nội dung chính của video:
                """${videoSummary}"""

                Đây là lịch sử chat trước đó để bạn hiểu ngữ cảnh:
                ${duLieuLSC}

                Nguyên tắc trả lời:
                1. Hãy giải thích, làm rõ hoặc trả lời các thắc mắc của học viên dựa trên tóm tắt nội dung video trên.
                2. Nếu học viên hỏi thông tin nằm ngoài nội dung video, hãy lịch sự thông báo rằng thông tin này không có trong video hiện tại nhưng bạn vẫn có thể trả lời nếu cần thiết.
                3. Xưng "mình" và gọi học viên là "bạn". Trả lời thân thiện, mạch lạc.
                4. Cố gắng trả lời ngắn gọn, dễ hiểu, tránh viết quá dài dòng. Chỉ dùng văn bản thuần túy, hạn chế dùng các ký tự đánh dấu định dạng markdown phức tạp.
                `
        };

        const messages = [
            tinNhanHeThong,
            { role: "user", content: message }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "Xin lỗi, mình không thể phân tích nội dung lúc này.";

        return res.status(200).json({
            trangThai: "tc",
            mess: responseText
        });

    } catch (err) {
        console.log("loi chat video ai: " + err);
        res.status(500).json({
            trangThai: "tb"
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
        try {
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
            // LƯU Ý: Đảm bảo hàm chứa đoạn code này có chữ 'async' ở đầu nhé!
            if (anh !== "") {
                try {
                    // 1. Tải ảnh từ đường link Cloudinary
                    const response = await fetch(anh);

                    // Lấy định dạng ảnh chuẩn xác trực tiếp từ Cloudinary (rất an toàn)
                    const mimeTypeAnh = response.headers.get('content-type') || 'image/jpeg';

                    // 2. Chuyển ảnh thành dạng Buffer (Bộ nhớ)
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    // 3. Đổi sang chuỗi Base64
                    const base64Image = buffer.toString("base64");

                    // 4. Đóng gói theo chuẩn inlineData của Gemini
                    const phanHinhAnh = {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeTypeAnh
                        }
                    };

                    // Nhét vào mảng để gửi đi
                    duLieuGoiDi.push(phanHinhAnh);

                } catch (error) {
                    console.error("Lỗi khi kéo ảnh từ Cloudinary về cho AI:", error);
                }
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
        } catch (err) {
            console.log("mode gemini cham bai that bai: " + err);
            ///// chấm lần 2 yêu cầu nvidia
            try {
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
                // LƯU Ý: Đảm bảo hàm chứa đoạn code này có chữ 'async' ở đầu nhé!
                if (anh && anh !== "") {
                    try {
                        // 1. Tải ảnh từ Cloudinary về
                        const response = await fetch(anh);
                        const mimeTypeAnh = response.headers.get('content-type') || 'image/jpeg';

                        // 2. Chuyển thành Base64
                        const arrayBuffer = await response.arrayBuffer();
                        const anhBase64 = Buffer.from(arrayBuffer).toString("base64");

                        // 3. Ghép thành chuỗi Data URL chuẩn của NVIDIA
                        const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;

                        // 4. Gắn vào mảng
                        duLieuGoiDi = [
                            { type: "text", text: yeuCau },
                            { type: "image_url", image_url: { url: dataUrl } }
                        ];
                    } catch (error) {
                        console.error("Lỗi khi kéo ảnh từ Cloudinary:", error);
                    }
                } else {
                    // TRƯỜNG HỢP 2: BÀI THI CHỈ CÓ CHỮ
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
            } catch (err) {
                console.log("mode nvidia cham bai that bai: " + err);
                try {
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
                    // LƯU Ý: Đảm bảo hàm chứa đoạn code này có chữ 'async' ở đầu nhé!
                    if (anh !== "") {
                        try {
                            // 1. Tải ảnh từ Cloudinary về
                            const response = await fetch(anh);
                            const mimeTypeAnh = response.headers.get('content-type') || 'image/jpeg';

                            // 2. Chuyển thành Base64
                            const arrayBuffer = await response.arrayBuffer();
                            const anhBase64 = Buffer.from(arrayBuffer).toString("base64");

                            // 3. Ghép thành chuỗi Data URL
                            const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;

                            // 4. Đẩy vào mảng theo chuẩn SDK của Mistral
                            duLieuGoiDi.push({
                                type: "image_url",
                                imageUrl: dataUrl
                            });
                        } catch (error) {
                            console.error("Lỗi khi kéo ảnh cho Mistral:", error);
                        }
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
                } catch (err) {
                    console.log("mode MISTRAL chấm bài thất bại :" + err)
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
const { type } = require('os');
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



        try {
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
            duLieuGoiDi.push(yeuCau);
            // LƯU Ý: Đảm bảo hàm chứa đoạn code này có chữ 'async' ở đầu nhé!
            if (anh !== "") {
                try {
                    // 1. Tải ảnh từ đường link Cloudinary
                    const response = await fetch(anh);

                    // Lấy định dạng ảnh chuẩn xác trực tiếp từ Cloudinary (rất an toàn)
                    const mimeTypeAnh = response.headers.get('content-type') || 'image/jpeg';

                    // 2. Chuyển ảnh thành dạng Buffer (Bộ nhớ)
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    // 3. Đổi sang chuỗi Base64
                    const base64Image = buffer.toString("base64");

                    // 4. Đóng gói theo chuẩn inlineData của Gemini
                    const phanHinhAnh = {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeTypeAnh
                        }
                    };

                    // Nhét vào mảng để gửi đi
                    duLieuGoiDi.push(phanHinhAnh);

                } catch (error) {
                    console.error("Lỗi khi kéo ảnh từ Cloudinary về cho AI:", error);
                }
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
        } catch (err) {
            console.log("mode gemini cham bai that bai: " + err);


            ///// chấm lần 2 yêu cầu nvidia
            try {



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
                // LƯU Ý: Đảm bảo hàm chứa đoạn code này có chữ 'async' ở đầu nhé!
                if (anh && anh !== "") {
                    try {
                        // 1. Tải ảnh từ Cloudinary về
                        const response = await fetch(anh);
                        const mimeTypeAnh = response.headers.get('content-type') || 'image/jpeg';

                        // 2. Chuyển thành Base64
                        const arrayBuffer = await response.arrayBuffer();
                        const anhBase64 = Buffer.from(arrayBuffer).toString("base64");

                        // 3. Ghép thành chuỗi Data URL chuẩn của NVIDIA
                        const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;

                        // 4. Gắn vào mảng
                        duLieuGoiDi = [
                            { type: "text", text: yeuCau },
                            { type: "image_url", image_url: { url: dataUrl } }
                        ];
                    } catch (error) {
                        console.error("Lỗi khi kéo ảnh từ Cloudinary:", error);
                    }
                } else {
                    // TRƯỜNG HỢP 2: BÀI THI CHỈ CÓ CHỮ
                    noiDungGuiDi = yeuCau;
                }
                // if (anh && anh !== "") {
                // // TRƯỜNG HỢP 1: BÀI THI CÓ ẢNH (Dùng mảng)
                // const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
                // const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
                // const anhBase64 = fs.readFileSync(duongDanAnhThat).toString('base64');
                // const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;

                // duLieuGoiDi = [
                //     { type: "text", text: yeuCau },
                //     { type: "image_url", image_url: { url: dataUrl } }
                // ];
                // } else {
                // // TRƯỜNG HỢP 2: BÀI THI CHỈ CÓ CHỮ (Gửi chuỗi Text thuần túy)
                // // Chặn đứng lỗi 400 của NVIDIA
                // noiDungGuiDi = yeuCau; 
                // }
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



            } catch (err) {
                console.log("mode nvidia cham bai that bai: " + err);
                try {
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
                    // if (anh !== "") {
                    //       const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
                    //       const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
                    //       const anhBase64 = fs.readFileSync(duongDanAnhThat).toString('base64');
                    //       const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;

                    //       duLieuGoiDi.push({
                    //         type: "image_url",
                    //         imageUrl: dataUrl // Theo chuẩn SDK của Mistral
                    //       });
                    //     }
                    // LƯU Ý: Đảm bảo hàm chứa đoạn code này có chữ 'async' ở đầu nhé!
                    if (anh !== "") {
                        try {
                            // 1. Tải ảnh từ Cloudinary về
                            const response = await fetch(anh);
                            const mimeTypeAnh = response.headers.get('content-type') || 'image/jpeg';

                            // 2. Chuyển thành Base64
                            const arrayBuffer = await response.arrayBuffer();
                            const anhBase64 = Buffer.from(arrayBuffer).toString("base64");

                            // 3. Ghép thành chuỗi Data URL
                            const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;

                            // 4. Đẩy vào mảng theo chuẩn SDK của Mistral
                            duLieuGoiDi.push({
                                type: "image_url",
                                imageUrl: dataUrl
                            });
                        } catch (error) {
                            console.error("Lỗi khi kéo ảnh cho Mistral:", error);
                        }
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
                } catch (err) {
                    console.log("mode MISTRAL chấm bài thất bại :" + err)
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
    idLopHoc: { type: String, require: true },
    tenLH: { type: String, require: true },
    linkLop: { type: String, require: true }
})

const lopHocOnline = mongoose.model("lopHocOnline", lopHocOnlineSchemal);

///api lay tt lop on

app.patch(`/api/CapNhat-lophocon/:id`, xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;

        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" });
        const { tenLH, linkLop } = req.body;
        const id = req.params.id;
        const data = await lopHocOnline.findById(id);
        if (!data) return res.status(404).json({ trangThai: "ktt" });
        data.tenLH = tenLH;
        data.linkLop = linkLop;
        await data.save();
        res.status(200).json({ trangThai: "tc" })
        console.log("cập nhật lớp học onlien thành công")

    } catch (err) {
        console.log("cập nhật lop hoc online that bai : " + err)
        res.status(500).json({ trangThai: "tb" })
    }
})

app.delete(`/api/Xoa-lopHocOn/:id`, xacThuc, async (req, res) => {
    try {
        const id = req.params.id
        const VaiTro = req.user.VaiTro;
        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" });
        const xoa = await lopHocOnline.findByIdAndDelete(id);
        res.status(200).json({ trangThai: "tc" })
    } catch (err) {
        console.log("xóa lớp học on thất bại : " + err);
        res.status(500).json({ trangThai: "tb" })
    }
})

app.get('/api/lay-lopHocon/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const data = await lopHocOnline.find({ idLopHoc: id });
        if (data.length === 0) return res.status(404).json({ trangThai: "ktt" });
        return res.status(200).json({
            trangThai: "tc",
            data: data
        })
    } catch (err) {
        console.log("/api/lay-lopHocon/:id THAT BAI : " + err);
        res.status(500).json({
            trangThai: "tb"
        })
    }
})

app.post('/api/them-lopHocon/:id', xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;

        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" })
        const { tenLH, linkLop } = req.body;
        const idLopHoc = req.params.id;

        const check = await LopHoc.findById(idLopHoc)

        if (!check) return res.status(404).json({ trangThai: "ktt" });

        const newLopHocOnline = new lopHocOnline({
            idLopHoc: idLopHoc,
            tenLH: tenLH,
            linkLop: linkLop
        })

        await newLopHocOnline.save();
        console.log("/api/them-lopHocon/:id THÀNH CÔNG");
        res.status(201).json({ trangThai: "tc" });

    } catch (err) {
        console.log("them lop hoc on that bai: " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})


/////////////////// bang cong dong //////////////////////////

const CongDongSchemal = new mongoose.Schema({
    idLopHoc: { type: String, require: true },
    tenCD: { type: String, require: true },
    linkCD: { type: String, require: true }
})

const CongDong = mongoose.model("CongDong", CongDongSchemal);


app.get('/api/lay-CongDong/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await CongDong.find({ idLopHoc: id });
        if (data.length === 0) return res.status(404).json({ trangThai: "ktt" });
        console.log("tra vè data cộng đồng thành công");

        return res.status(200).json({
            trangThai: "tc",
            data: data
        })
    } catch (err) {
        console.log("'/api/lay-CongDong/:id THAT BAI");
        res.status(500).json({
            trangThai: "tb"
        })
    }
})

app.post('/api/them-CongDong/:id', xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;

        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" })
        const { tenCD, linkCD } = req.body;
        const idLopHoc = req.params.id;
        const check = await LopHoc.findById(idLopHoc)

        if (!check) return res.status(404).json({ trangThai: "ktt" });
        const newCongDong = new CongDong({
            idLopHoc: idLopHoc,
            tenCD: tenCD,
            linkCD: linkCD
        })
        await newCongDong.save();
        console.log("/api/them-CongDong/:id THÀNH CÔNG");
        res.status(201).json({ trangThai: "tc" });

    } catch (err) {
        console.log("/api/them-CongDong/:id " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

app.patch(`/api/CapNhat-CongDong/:id`, xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;

        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" });
        const { tenCD, linkCD } = req.body;
        const id = req.params.id;
        const data = await CongDong.findById(id);
        if (!data) return res.status(404).json({ trangThai: "ktt" });
        data.tenCD = tenCD;
        data.linkCD = linkCD;
        await data.save();
        res.status(200).json({ trangThai: "tc" })
        console.log("cập nhật Cộng Đồng thành công")

    } catch (err) {
        console.log("cập nhật lop hoc online that bai : " + err)
        res.status(500).json({ trangThai: "tb" })
    }
})

app.delete(`/api/Xoa-CongDong/:id`, xacThuc, async (req, res) => {
    try {
        const id = req.params.id
        const VaiTro = req.user.VaiTro;
        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" });
        const xoa = await CongDong.findByIdAndDelete(id);
        res.status(200).json({ trangThai: "tc" })
    } catch (err) {
        console.log("xóa Cộng Đồng thất bại : " + err);
        res.status(500).json({ trangThai: "tb" })
    }
})


/////////bang tu vung /////////////////

const TuVungSchemal = new mongoose.Schema({
    idKhoaHoc: { type: String, require: true },
    idLopHoc: { type: String, require: true },
    Email: { type: String, require: true },
    VaiTroNguoiThem: { type: String, require: true },
    TenTuVung: { type: String, require: true },
    tuVung: { type: String, require: true }
})

const TuVung = mongoose.model("TuVung", TuVungSchemal);

/// api them từ vựng 

app.post('/api/them-TuVung/:id', xacThuc, async (req, res) => {
    try {
        const idLopHoc = req.params.id;
        const dataKhoaHoc = await LopHoc.findById(idLopHoc).select('idKhoaHoc');
        let idKhoaHocVal = dataKhoaHoc ? dataKhoaHoc.idKhoaHoc : idLopHoc;

        const Email = req.user.Email;
        const VaiTroNguoiThem = req.user.VaiTro;
        const { tuVung, TenTuVung } = req.body;

        const newTuVung = new TuVung({
            idKhoaHoc: idKhoaHocVal,
            idLopHoc: idLopHoc,
            Email: Email,
            VaiTroNguoiThem: VaiTroNguoiThem,
            TenTuVung: TenTuVung,
            tuVung: tuVung
        })

        await newTuVung.save();
        console.log("them tu vung thanh cong");
        res.status(201).json({ trangThai: "tc" });


    } catch (err) {
        console.log("them từ vựng thất bại :" + err);
        res.status(500).json({ trangThai: "tb" })
    }
})

//api lay danh sach tu vung cua hoc vien

app.get('/api/lay-tuVung-hv/:id', xacThuc, async (req, res) => {
    try {
        const idLopHoc = req.params.id;
        const email = req.user.Email;
        const dataTuVung = await TuVung.find({ idLopHoc: idLopHoc, Email: email, VaiTroNguoiThem: 'Học Viên' }).select(`_id TenTuVung`);
        if (dataTuVung.length === 0) {
            return res.status(404).json({ trangThai: "ktt" });
        }
        return res.status(200).json({
            trangThai: "tc",
            data: dataTuVung
        })
    } catch (err) {
        console.log("lay tu vung that bai");
        res.status(500).json({ trangThai: "tb" });
    }
})

//// api lay danh sach tu vung trung tâm
app.get('/api/layDanhSachTuVung-Gv/:id', async (req, res) => {
    try {
        const idLopHoc = req.params.id;
        const dataKhoaHoc = await LopHoc.findById(idLopHoc).select('idKhoaHoc');
        let idKhoaHoc = dataKhoaHoc.idKhoaHoc;
        if (!dataKhoaHoc) {
            idKhoaHoc = idLopHoc;
        };


        const dataTuVung = await TuVung.find({
            idKhoaHoc: idKhoaHoc, $or: [
                { VaiTroNguoiThem: 'Giảng Viên' },
                { VaiTroNguoiThem: 'admin' }
            ]
        }).select('_id TenTuVung');
        if (dataTuVung.length === 0) {
            return res.status(404).json({ trangThai: "ktt" });
        }
        return res.status(200).json({
            trangThai: "tc",
            data: dataTuVung
        })

    } catch (err) {
        console.log("lay danh sach tu vung E-learning that bại: " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})
/// api lây danh sách từ vựng của giáo viên toàn bộ khóa học
app.get('/api/layDanhSachTuVung-Gv-tbkh', async (req, res) => {
    try {

        const dataTuVung = await TuVung.find({
            $or: [
                { VaiTroNguoiThem: 'Giảng Viên' },
                { VaiTroNguoiThem: 'admin' }
            ]
        });
        if (dataTuVung.length === 0) {
            return res.status(404).json({ trangThai: "ktt" });
        }
        return res.status(200).json({
            trangThai: "tc",
            data: dataTuVung
        })

    } catch (err) {
        console.log("lay danh sach toàn bộ từ vưng E-learning that bại: " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

/// api lay chi tiet tu vung

app.get(`/api/lay-tuvung-chitiet/:id`, async (req, res) => {
    try {
        const idTuVung = req.params.id;

        const data = await TuVung.findById(idTuVung).select('TenTuVung tuVung idLopHoc');

        res.status(200).json({
            trangThai: "tc",
            data: data
        })
        console.log(`/api/lay-tuvung-chitiet/${idTuVung} thành cong`)


    } catch (err) {
        console.log("lay chi tiet từ vựng thất bại :  /api/lay-tuvung-chitiet/:id : " + err)
        res.status(500).json({ trangThai: "tb" })
    }
})

app.patch('/api/capNhatTuVung/:id', async (req, res) => {
    try {
        const idTuVung = req.params.id;
        const { TenTuVung, tuVung } = req.body;

        const updateTuVung = await TuVung.findById(idTuVung);

        updateTuVung.TenTuVung = TenTuVung;
        updateTuVung.tuVung = tuVung;

        await updateTuVung.save();
        console.log(`/api/capNhatTuVung/${idTuVung} thành công 💚`);
        res.status(200).json({ trangThai: "tc" })

    } catch (err) {
        console.log("/api/capNhatTuVung/:id That bai: " + err);
        res.status(500).json({ trangThai: "tb" })
    }
})

///api xoa tu vung 
app.delete('/api/xoaTuVung/:id', async (req, res) => {
    try {
        const idTuVung = req.params.id;

        const data = await TuVung.findByIdAndDelete(idTuVung);


        console.log("xoa tu vung thanh cong 💚");
        res.status(200).json({ trangThai: "tc" })
    } catch (err) {
        console.log("xoa tu vung that bai ❤️ : " + err);
        res.status(500).json({ trangThai: "tb" })
    }
})

/////////////// Bang VideoBaiGiang ///////////////////////////////

const VideoBaiGiangSchema = new mongoose.Schema({
    idKhoaHoc: { type: String, require: true },
    idLopHoc: { type: String, require: true },
    Email: { type: String, require: true },
    VaiTroNguoiThem: { type: String, require: true },
    tenvideobaigiang: { type: String, require: true },
    linkvideo: { type: String, require: true },
    tomtatND: { type: String, require: true }
});

const VideoBaiGiang = mongoose.model("VideoBaiGiang", VideoBaiGiangSchema);

// API lấy toàn bộ video bài giảng của admin/GV
app.get('/api/layDanhSachVideo-tbkh', async (req, res) => {
    try {
        const data = await VideoBaiGiang.find({
            $or: [
                { VaiTroNguoiThem: 'Giảng Viên' },
                { VaiTroNguoiThem: 'admin' }
            ]
        });
        if (data.length === 0) {
            return res.status(404).json({ trangThai: "ktt" });
        }
        return res.status(200).json({ trangThai: "tc", data: data });
    } catch (err) {
        console.log("lay danh sach video that bai: " + err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// api lấy danh sách video theo khóa học
app.get(`/api/lay-video-khoahoc/:id`, async (req, res) => {
    try {
        const lopHoc = req.params.id;
        const dataLopHoc = await LopHoc.findById(lopHoc).select('idKhoaHoc');
        const idKhoaHoc = dataLopHoc.idKhoaHoc;
        const data = await VideoBaiGiang.find({ idKhoaHoc: idKhoaHoc });
        if (data.length === 0) {
            return res.status(404).json({ trangThai: "ktt" });
        }
        return res.status(200).json({ trangThai: "tc", data: data });
    } catch (err) {
        console.log("lay danh sách video theo khóa học that bai: " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

// API lay chi tiet video
app.get('/api/lay-video-chitiet/:id', async (req, res) => {
    try {
        const data = await VideoBaiGiang.findById(req.params.id);
        if (!data) return res.status(404).json({ trangThai: "ktt" });
        res.status(200).json({ trangThai: "tc", data: data });
        console.log("lay chi tiết video bài giảng thành cống")
    } catch (err) {
        console.log("lay chi tiet video that bai : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API them video
app.post('/api/them-video/:id', xacThuc, async (req, res) => {
    try {
        const idLopHoc = req.params.id;
        const dataKhoaHoc = await LopHoc.findById(idLopHoc).select('idKhoaHoc');
        let idKhoaHocVal = dataKhoaHoc ? dataKhoaHoc.idKhoaHoc : idLopHoc;

        const Email = req.user.Email;
        const VaiTroNguoiThem = req.user.VaiTro;
        const { tenvideobaigiang, linkvideo, tomtatND } = req.body;

        const newVideo = new VideoBaiGiang({
            idKhoaHoc: idKhoaHocVal,
            idLopHoc: idLopHoc,
            Email: Email,
            VaiTroNguoiThem: VaiTroNguoiThem,
            tenvideobaigiang,
            linkvideo,
            tomtatND
        });

        await newVideo.save();
        res.status(201).json({ trangThai: "tc" });
    } catch (err) {
        console.log("them video that bai :" + err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API cap nhat video
app.patch('/api/capNhatVideo/:id', async (req, res) => {
    try {
        const { tenvideobaigiang, linkvideo, tomtatND } = req.body;
        const updateVideo = await VideoBaiGiang.findById(req.params.id);
        if (!updateVideo) return res.status(404).json({ trangThai: "ktt" });

        updateVideo.tenvideobaigiang = tenvideobaigiang;
        updateVideo.linkvideo = linkvideo;
        updateVideo.tomtatND = tomtatND;

        await updateVideo.save();
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("cap nhat video that bai: " + err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API xoa video
app.delete('/api/xoaVideo/:id', async (req, res) => {
    try {
        await VideoBaiGiang.findByIdAndDelete(req.params.id);
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("xoa video that bai: " + err);
        res.status(500).json({ trangThai: "tb" });
    }
});

/////////////// Bang bai tap ///////////////////////////////

const baitapSchemal = new mongoose.Schema({
    idLopHoc: { type: String, require: true },
    TenBT: { type: String, require: true },
    trangThai: { type: String, default: "Bản Nháp" },
    EmailNGuoiTao: { type: String, require: true },
    ngayTao: { type: Date, default: Date.now },
    hanNop: { type: Date, require: true }
});

const BaiTap = mongoose.model('BaiTap', baitapSchemal);

// api them bai tap

app.post('/api/themBT/:id', xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;

        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" })


        const idLopHoc = req.params.id
        const email = req.user.Email;
        const { TenBT, hanNop } = req.body;

        const ngayHienTai = new Date();

        const HanNopDung = new Date();
        if (hanNop === "3 ngày") HanNopDung.setDate(ngayHienTai.getDate() + 3);
        else if (hanNop === "5 ngày") HanNopDung.setDate(ngayHienTai.getDate() + 5);
        else if (hanNop === "7 ngày") HanNopDung.setDate(ngayHienTai.getDate() + 7);

        const newBaiTap = new BaiTap({
            idLopHoc: idLopHoc,
            TenBT: TenBT,
            EmailNGuoiTao: email,
            hanNop: HanNopDung
        });
        const dataVuaTao = await newBaiTap.save();
        console.log("them bài tập thành công  💚");
        res.status(201).json({
            trangThai: "tc",
            data: dataVuaTao,
        })
    } catch (err) {
        console.log("them bai tap that bai ❤️ : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})
// api lay bai tap

app.get('/api/layBaiTap/:id', async (req, res) => {
    try {
        const idLopHoc = req.params.id
        const dataBaiTap = await BaiTap.find({ idLopHoc: idLopHoc });
        if (dataBaiTap.length === 0) {
            console.log("danh sach bai tap lop khong ton tai ⭐")
            return res.status(404).json({ trangThai: "ktt" });
        }
        console.log("tra vè danh sách bài tập thành công 💚")
        return res.status(200).json({
            trangThai: "tc",
            data: dataBaiTap
        })

    } catch (err) {
        console.log("lay danh sach bai tap that bai ❤️ : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

// api lây chi tiet noi dung bai tap

app.get(`/layTTBaiTap/:id`, async (req, res) => {
    try {
        const idBaiTap = req.params.id;
        const data = await BaiTap.findById(idBaiTap);
        if (!data) return res.status(404).json({ trangThai: "ktt" });
        res.status(200).json({
            trangThai: "tc",
            data: data
        })
    } catch (err) {
        console.log("lay chi tiết tt bài tập thất bại : " + err);
        res.status(500).json({ trangThai: "tb" })
    }
})

app.patch(`/updateBaiTap/:id`, xacThuc, async (req, res) => {
    try {
        const idBaiTap = req.params.id;
        const VaiTro = req.user.VaiTro;
        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" })
        const { hanNop, trangThai, TenBT } = req.body;
        const dataBaiTap = await BaiTap.findById(idBaiTap);
        const ngayHienTai = new Date();
        const HanNopDung = new Date();
        if (hanNop === "3 ngày") HanNopDung.setDate(ngayHienTai.getDate() + 3);
        else if (hanNop === "5 ngày") HanNopDung.setDate(ngayHienTai.getDate() + 5);
        else if (hanNop === "7 ngày") HanNopDung.setDate(ngayHienTai.getDate() + 7);
        dataBaiTap.ngayTao = ngayHienTai;
        if (hanNop !== "Gia Hạn") dataBaiTap.hanNop = HanNopDung;
        dataBaiTap.TenBT = TenBT;
        dataBaiTap.trangThai = trangThai;

        await dataBaiTap.save()
        console.log("Cập nhật bài tập thành công")
        res.status(200).json({ trangThai: "tc" })


    } catch (err) {
        console.error("cập nhật bài tập Thất bại :" + err)
        res.status(500).json({ trangThai: "tb" })
    }
})

app.delete(`/xoaBaiTap/:id`, xacThuc, async (req, res) => {
    try {
        const idCanXoa = req.params.id;
        const VaiTro = req.user.VaiTro;

        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" })
        await BaiTap.findByIdAndDelete(idCanXoa);
        res.status(200).json({ trangThai: "tc" });
        console.log("xóa bài tập thành công")
    } catch (err) {
        console.error("xóa bài tập thất bại");
        res.status(500).json({ trangThai: "tb" });
    }
})

//////////////////////////// BANG BAI TAP DA NOP///////////////////////////

const BaiTapDaLamSchemal = new mongoose.Schema({
    idBaiTap: { type: String, require: true },
    idLopHoc: { type: String, require: true },
    Email: { type: String, require: true },
    ngayNop: { type: Date, default: Date.now },
    diemUocTinh: { type: Number, default: null },
    diemChinhThuc: { type: Number, default: null }
});

const BaiTapDaLam = mongoose.model('BaiTapDaLam', BaiTapDaLamSchemal);

/// api them bai tap da lam

app.post('/api/nopBaiTap/:id', xacThuc, async (req, res) => {
    try {
        const idBaiTap = req.params.id;
        const idLopHoc = await BaiTap.findById(idBaiTap).select('idLopHoc');

        if (!idLopHoc) return res.status(404).json({ trangThai: "ktt" })

        const email = req.user.Email;
        const { diemUocTinh, diemChinhThuc } = req.body;

        const NopBai = new BaiTapDaLam({
            idBaiTap: idBaiTap,
            idLopHoc: idLopHoc.idLopHoc,
            Email: email,
            diemUocTinh: diemUocTinh,
            diemChinhThuc: diemChinhThuc
        });
        await NopBai.save();
        console.log("Nộp bài tập thành công 💚");
        res.status(201).json({ trangThai: "tc" });

    } catch (err) {
        console.log(" nộp bài tập thất bại ❤️ : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

// api lay bai tap da lam
app.get('/api/layBaiTapDaLam/:id', xacThuc, async (req, res) => {
    try {
        const idBaiTap = req.params.id;
        const email = req.user.Email;

        const dataNopBai = await BaiTapDaLam.findOne({ idBaiTap: idBaiTap, Email: email });
        if (!dataNopBai) return res.status(404).json({ trangThai: "ktt" });
        console.log("lay bai tap da lam thanh cong 💚")
        return res.status(200).json({
            trangThai: "tc",
            data: dataNopBai
        })

    } catch (err) {
        console.log("lay bai tap da lam that bai ❤️ : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

// api lay danh sách học viên đã nộp bài tập
app.get(`/layDsHVdaNopBT/:id`, async (req, res) => {
    try {
        const idBaiTap = req.params.id;
        const data = await BaiTapDaLam.find({ idBaiTap: idBaiTap });
        if (data.length === 0) return res.status(404).json({ trangThai: "ktt" });
        res.status(200).json({
            trangThai: "tc",
            data: data
        })
        console.log("lay data danh sách học viên nộp bài tập thành công 💚")
    } catch (err) {
        res.status(500).json({ trangThai: "tb" })
        console.log("lay danh sách học viên đã nộp bài tập thất bại :" + err)
    }
})

// API cho Giáo viên lấy thông tin 1 bài tập đã làm bằng idBaiTap và email
app.get('/api/layBaiTapDaLamAdmin/:id/:email', xacThuc, async (req, res) => {
    try {
        const idBaiTap = req.params.id;
        const email = req.params.email;
        const dataNopBai = await BaiTapDaLam.findOne({ idBaiTap: idBaiTap, Email: email });
        if (!dataNopBai) return res.status(404).json({ trangThai: "ktt" });
        return res.status(200).json({ trangThai: "tc", data: dataNopBai });
    } catch (err) {
        console.log("Lỗi layBaiTapDaLamAdmin:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API cho Giáo viên cập nhật điểm chính thức
app.patch('/api/CapNhatDiemChinhThucAdmin/:id/:email', xacThuc, async (req, res) => {
    try {
        const idBaiTap = req.params.id;
        const email = req.params.email;
        const { diemChinhThuc } = req.body;
        const data = await BaiTapDaLam.findOne({ idBaiTap: idBaiTap, Email: email });
        if (!data) return res.status(404).json({ trangThai: "ktt" });
        data.diemChinhThuc = diemChinhThuc;
        await data.save();
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi CapNhatDiemChinhThucAdmin:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

/////////////// bang chi tiet bai tap///////////////////////

const ChiTietBaiTapSchemal = new mongoose.Schema({
    idBaiTap: { type: String, require: true },
    CauHoi: { type: String, require: true },
    type: { type: Number, default: 0 },
    a: { type: String, default: "" },
    b: { type: String, default: "" },
    c: { type: String, default: "" },
    d: { type: String, default: "" },
    fileNghe: { type: String, default: "" },
    anh: { type: String, default: "" },
    dapAn: { type: String, default: "" },
    giaiThich: { type: String, default: "" }
})

const ChiTietBaiTap = mongoose.model('ChiTietBaiTap', ChiTietBaiTapSchemal);

/// api them chiet bai tap

app.post('/api/themChiTietBaiTap', xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;
        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" })
        const mangBaiTap = req.body;

        await ChiTietBaiTap.insertMany(mangBaiTap);

        console.log("thêm chi tiết bài tập thành công  💚");
        res.status(201).json({ trangThai: "tc" });

    } catch (err) {
        console.log("them chi tiet bai tap that bai  ❤️ : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

app.delete(`/xoaChiTieBaiTap/:id`, xacThuc, async (req, res) => {
    try {
        const idCanXoa = req.params.id;
        const VaiTro = req.user.VaiTro;

        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" });
        const xoa = await ChiTietBaiTap.deleteMany({ idBaiTap: idCanXoa });
        console.log("xóa chi tiết bài tập thành công")
        res.status(200).json({ trangThai: "tc" })
    } catch (err) {
        console.error("xoa chi tiet bài tập thất bại :" + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

// api lay danh sach chi tiết bài tâp (câu hỏi)

app.get('/api/LatDanhSachChiTietBaiTap/:id', async (req, res) => {
    try {
        const idBaiTap = req.params.id;

        const dataDSBaiTap = await ChiTietBaiTap.find({ idBaiTap: idBaiTap });
        if (dataDSBaiTap.length === 0) {
            return res.status(404).json({ trangThai: "ktt" });
        }
        console.log("lay danh sach chi tiet bai tap thanh công 💚")
        return res.status(200).json({
            trangThai: "tc",
            data: dataDSBaiTap
        })

    } catch (err) {
        console.log("lay chi tiet bai tap that bai ❤️ : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

//////////// bang chi tiet bai tap da lam  /////////////////

const ChiTietBaiTapDaLamSchemal = new mongoose.Schema({
    idBaiTap: { type: String, require: true },
    email: { type: String, require: true },
    CauHoi: { type: String, require: true },
    type: { type: Number, default: 0 },
    a: { type: String, default: "" },
    b: { type: String, default: "" },
    c: { type: String, default: "" },
    d: { type: String, default: "" },
    fileNghe: { type: String, default: "" },
    anh: { type: String, default: "" },
    dapAn: { type: String, default: "" },
    dapAnHocVien: { type: String, default: "" },
    giaiThich: { type: String, default: "" },
    loipheAI: { type: String, default: "" },
})

const ChiTietBaiTapDaLam = mongoose.model('ChiTietBaiTapDaLam', ChiTietBaiTapDaLamSchemal);

/// api thêm chi tiết bài tập đã làm

app.post(`/api/theChiTietBaiTapDaLam/:id`, xacThuc, async (req, res) => {
    try {
        const idBaiTap = req.params.id;
        const email = req.user.Email;
        // const {CauHoi, type, a,b,c,d,fileNghe,anh,dapAnDung,dapAnHocVien,giaiThich,loipheAI}= req.body;
        const dataDapANHocVien = req.body;
        const mangDapAnHoanChinh = dataDapANHocVien.map((item) => {
            return {
                idBaiTap: idBaiTap,
                email: email,
                ...item,
            }
        });
        await ChiTietBaiTapDaLam.insertMany(mangDapAnHoanChinh);
        console.log("thêm chi tiêt bai tập đã làm THÀNH CÔNG 💚");
        res.status(201).json({ trangThai: "tc" });
    } catch (err) {
        console.log("thêm chi tiết bài tập đã làm THẤT BẠI ❤️");
        res.status(500).json({ trangThai: "tb" });
    }
})

app.get(`/api/xemtheChiTietBaiTapDaLam/:id`, xacThuc, async (req, res) => {
    try {
        const idBaiTap = req.params.id;
        const email = req.user.Email;

        const data = await ChiTietBaiTapDaLam.find({ idBaiTap: idBaiTap, email: email });
        if (data.length === 0) return res.status(404).json({ trangThai: "ktt" });

        return res.status(200).json({
            trangThai: "tc",
            data: data
        })
        console.log("trả về dữ liệu chi tiết bài tập thành công 💚")
    } catch (err) {
        console.log("lay chi tiet bai tap that bai ❤️ : " + err);
        res.status(500).json({ trangThai: "tb" });
    }
})

// API cho Giáo viên lấy chi tiết bài làm của học viên
app.get(`/api/ChiTietBaiTapDaLamAdmin/:idBaiTap/:email`, xacThuc, async (req, res) => {
    try {
        const idBaiTap = req.params.idBaiTap;
        const email = req.params.email;

        const data = await ChiTietBaiTapDaLam.find({ idBaiTap: idBaiTap, email: email });
        if (data.length === 0) return res.status(404).json({ trangThai: "ktt" });

        return res.status(200).json({ trangThai: "tc", data: data });
    } catch (err) {
        console.log("Lỗi ChiTietBaiTapDaLamAdmin:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API cho Giáo viên cập nhật nhận xét / giải thích
app.patch('/api/CapNhatGiaiThichChiTiet/:id', xacThuc, async (req, res) => {
    try {
        const idChiTiet = req.params.id;
        const { phanGiaiThich } = req.body;
        const data = await ChiTietBaiTapDaLam.findById(idChiTiet);
        if (!data) return res.status(404).json({ trangThai: "ktt" });
        // Lưu vào trường giaiThich của Giáo viên, thay vì đè lên loipheAI của AI
        data.giaiThich = phanGiaiThich;
        await data.save();
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi CapNhatGiaiThichChiTiet:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

//////////////// ĐIỂM DANH ////////////////////////////////////////
const DiemDanhSchema = new mongoose.Schema({
    idLopHoc: { type: String, require: true },
    tenBuoiDiemDanh: { type: String, require: true },
    ngayTao: { type: String, require: true }
});
const DiemDanh = mongoose.model('DiemDanh', DiemDanhSchema);

const ChiTietDiemDanhSchema = new mongoose.Schema({
    idDiemDanh: { type: String, require: true },
    idLopHoc: { type: String, require: true },
    emailHocVien: { type: String, require: true }
});
const ChiTietDiemDanh = mongoose.model('ChiTietDiemDanh', ChiTietDiemDanhSchema);

// API Lấy danh sách học viên của lớp học
app.get('/api/lay-danh-sach-hoc-vien/:idLopHoc', xacThuc, async (req, res) => {
    try {
        const idLopHoc = req.params.idLopHoc;
        const hoadons = await HoaDon.find({ idLopHoc: idLopHoc });
        const emails = hoadons.map(hd => hd.email);
        const hocviens = await TaiKhoan.find({ Email: { $in: emails } }).select('HoTen Email');
        res.status(200).json({ trangThai: "tc", data: hocviens });
    } catch (err) {
        console.log("Lỗi lấy danh sách học viên:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Thêm buổi điểm danh
app.post('/api/them-diem-danh/:idLopHoc', xacThuc, async (req, res) => {
    try {
        const idLopHoc = req.params.idLopHoc;
        const { tenBuoiDiemDanh, danhSachCoMat } = req.body;
        
        const date = new Date();
        const ngayTao = date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

        const newDiemDanh = new DiemDanh({
            idLopHoc: idLopHoc,
            tenBuoiDiemDanh: tenBuoiDiemDanh,
            ngayTao: ngayTao
        });
        const savedDiemDanh = await newDiemDanh.save();

        if (danhSachCoMat && danhSachCoMat.length > 0) {
            for (let email of danhSachCoMat) {
                const newChiTiet = new ChiTietDiemDanh({
                    idDiemDanh: savedDiemDanh._id.toString(),
                    idLopHoc: idLopHoc,
                    emailHocVien: email
                });
                await newChiTiet.save();
            }
        }

        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi thêm điểm danh:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Lấy danh sách buổi điểm danh
app.get('/api/lay-diem-danh/:idLopHoc', xacThuc, async (req, res) => {
    try {
        const idLopHoc = req.params.idLopHoc;
        const data = await DiemDanh.find({ idLopHoc: idLopHoc }).sort({ ngayTao: -1 });
        res.status(200).json({ trangThai: "tc", data: data });
    } catch (err) {
        console.log("Lỗi lấy điểm danh:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Lấy chi tiết buổi điểm danh (danh sách học viên có mặt)
app.get('/api/lay-chi-tiet-diem-danh/:idDiemDanh', xacThuc, async (req, res) => {
    try {
        const idDiemDanh = req.params.idDiemDanh;
        const chiTiets = await ChiTietDiemDanh.find({ idDiemDanh: idDiemDanh });
        const emails = chiTiets.map(ct => ct.emailHocVien);
        const hocviens = await TaiKhoan.find({ Email: { $in: emails } }).select('HoTen Email');
        res.status(200).json({ trangThai: "tc", data: hocviens });
    } catch (err) {
        console.log("Lỗi lấy chi tiết điểm danh:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Lấy thống kê học viên
app.get('/api/thong-ke-hoc-vien/:idLopHoc', xacThuc, async (req, res) => {
    try {
        const idLopHoc = req.params.idLopHoc;
        
        // Lấy danh sách email học viên từ hóa đơn
        const hoadons = await HoaDon.find({ idLopHoc: idLopHoc });
        const emails = hoadons.map(hd => hd.email);
        
        // Lấy thông tin tài khoản
        const hocviens = await TaiKhoan.find({ Email: { $in: emails } }).select('HoTen Email NamSinh NgheNghiep');
        
        // Tổng số buổi điểm danh của lớp
        const tongSoBuoiDiemDanh = await DiemDanh.countDocuments({ idLopHoc: idLopHoc });
        
        // Tổng số bài tập của lớp
        const tongSoBaiTap = await BaiTap.countDocuments({ idLopHoc: idLopHoc ,trangThai:`Đã Tạo`});
        
        let dsThongKe = [];
        
        for (let hv of hocviens) {
            // Đếm số buổi có mặt
            const soBuoiCoMat = await ChiTietDiemDanh.countDocuments({ idLopHoc: idLopHoc, emailHocVien: hv.Email });
            
            // Tìm bài tập đã làm
            const baiTapDaLams = await BaiTapDaLam.find({ idLopHoc: idLopHoc, Email: hv.Email });
            const soBaiTapHoanThanh = baiTapDaLams.length;
            
            // Tính điểm trung bình (ưu tiên điểm chính thức, nếu không có lấy điểm ước tính)
            let tongDiem = 0;
            let soBaiCoDiem = 0;
            
            for (let btdl of baiTapDaLams) {
                if (btdl.diemChinhThuc !== null && btdl.diemChinhThuc !== undefined) {
                    tongDiem += btdl.diemChinhThuc;
                    soBaiCoDiem++;
                } else if (btdl.diemUocTinh !== null && btdl.diemUocTinh !== undefined) {
                    tongDiem += btdl.diemUocTinh;
                    soBaiCoDiem++;
                }
            }
            
            const diemTrungBinh = soBaiCoDiem > 0 ? (tongDiem / soBaiCoDiem).toFixed(2) : 0;
            
            dsThongKe.push({
                HoTen: hv.HoTen,
                Email: hv.Email,
                NamSinh: hv.NamSinh,
                NgheNghiep: hv.NgheNghiep,
                tongSoBuoiDiemDanh: tongSoBuoiDiemDanh,
                soBuoiCoMat: soBuoiCoMat,
                tongSoBaiTap: tongSoBaiTap,
                soBaiTapHoanThanh: soBaiTapHoanThanh,
                diemTrungBinh: diemTrungBinh
            });
        }
        
        res.status(200).json({ trangThai: "tc", data: dsThongKe });
    } catch (err) {
        console.log("Lỗi thống kê học viên:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Lấy danh sách tài khoản theo vai trò
app.get('/api/lay-danh-sach-tai-khoan', xacThuc, async (req, res) => {
    try {
        const VaiTroReq = req.user.VaiTro;
        if (VaiTroReq !== "admin") return res.status(403).json({ trangThai: "kdtq" });
        
        const data = await TaiKhoan.find().select('-MatKhau');
        res.status(200).json({ trangThai: "tc", data: data });
    } catch (err) {
        console.log("Lỗi lấy danh sách tài khoản:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Cập nhật vai trò tài khoản
app.patch('/api/cap-nhat-vai-tro/:id', xacThuc, async (req, res) => {
    try {
        const VaiTroReq = req.user.VaiTro;
        if (VaiTroReq !== "admin") return res.status(403).json({ trangThai: "kdtq" });
        
        const id = req.params.id;
        const { VaiTro } = req.body;
        
        await TaiKhoan.findByIdAndUpdate(id, { VaiTro: VaiTro });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi cập nhật vai trò:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

////////////////// LUYỆN ĐỀ ///////////////////
// Bảng Luyện Đề
const LuyenDeSchema = new mongoose.Schema({
    tenBoDe: { type: String, required: true },
    tenDe: { type: String, required: true },
    kyNang: { type: String, required: true },
    ngayTao: { type: String },
    trangThai: { type: String, default: "Bản Nháp" }
});
const LuyenDe = mongoose.model("LuyenDe", LuyenDeSchema);

// Bảng Chi Tiết Luyện Đề
const ChiTietLuyenDeSchema = new mongoose.Schema({
    idLuyenDe: { type: String, required: true },
    tenPart: { type: String },
    email: { type: String },
    type: { type: Number },
    fileNghe: { type: String },
    anh: { type: String },
    noiDungDoc:{type:String},
    noiDungCauHoi: [
        {
            soCau:{ type: Number},
            cauHoi: { type: String },
            a: { type: String },
            b: { type: String },
            c: { type: String },
            d: { type: String },
            dapAn: { type: String },
            giaiThich: { type: String },
        }
    ],
    
});
const ChiTietLuyenDe = mongoose.model("ChiTietLuyenDe", ChiTietLuyenDeSchema);

// api tesst theem chi tiết luyện đề

app.post(`/themChiTieiLuyenDe/:id`, async(req,res)=>{
    try{
        const idLuyenDe = req.params.id;
        const {tenPart,email,noiDungCauHoi}= req.body;
        const newChiTietLuyenDe = new ChiTietLuyenDe({
            idLuyenDe:idLuyenDe,
            tenPart:tenPart,
            email:email,
            noiDungCauHoi:noiDungCauHoi,
        })
        await newChiTietLuyenDe.save();
        console.log("thêm chi tiết luyện đề thành công");
        res.status(200).json({trangThai:"tc"});

    }catch(err){
        console.error("thêm chi tiết luyện đề thất bại : "+err );
        res.status(500).json({trangThai:"tb"})
    }
})

// API Thêm Luyện Đề
app.post('/api/luyen-de', xacThuc, async (req, res) => {
    try {
        const { tenBoDe, tenDe, kyNang } = req.body;
        
        const today = new Date();
        const ngayTao = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        
        const newLuyenDe = new LuyenDe({ 
            tenBoDe, 
            tenDe, 
            kyNang,
            ngayTao: ngayTao,
            trangThai: "Bản Nháp"
        });
        
        await newLuyenDe.save();
        res.status(201).json({ trangThai: "tc", data: newLuyenDe });
    } catch (err) {
        console.log("Lỗi thêm luyện đề:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Lấy danh sách Luyện Đề
app.get('/api/luyen-de', async (req, res) => {
    try {
        const data = await LuyenDe.find();
        res.status(200).json({ trangThai: "tc", data: data });
    } catch (err) {
        console.log("Lỗi lấy luyện đề:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Lấy 1 Luyện Đề theo ID
app.get('/api/luyen-de/:id', async (req, res) => {
    try {
        const data = await LuyenDe.findById(req.params.id);
        if(data) {
            res.status(200).json({ trangThai: "tc", data: data });
        } else {
            res.status(404).json({ trangThai: "tb" });
        }
    } catch (err) {
        console.log("Lỗi lấy luyện đề:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

//////////////////////////////////////////////////////////////////
app.listen(port, () => {
    console.log(`server dang chay tai :http://localhost:${port}`)
})
