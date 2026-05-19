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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const thuMucTaiNguyen = path.join(__dirname, 'taiNguyen');

app.use('/taiNguyen', express.static(thuMucTaiNguyen));

mongoose.connect('mongodb://localhost:27017/E-learning').then(() => {
    console.log("kết nối mongodb thanh cong 💚");
}).catch((err) => {
    console.log("kết nối mongodb thất bại ❤️ " + err);
})

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

//////////////// API TƯ VẤN /////////////////////////////////

const TuVanSchema = new mongoose.Schema({
    HoTen: { type: String, require: true },
    Sdt: { type: String, require: true },
    NamSinh: { type: Number },
    Email: { type: String, require: true },
    NgheNghiep: { type: String },
    QuanTam: { type: String, require: true },
    NoiDung: { type: String, require: true },
    trangThai: { type: String, default: "Chưa tư vấn" }
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

app.get('/api/tuvan', xacThuc, async (req, res) => {
    try {
        const data = await TuVan.find();
        res.status(200).json({ trangThai: "tc", data });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

app.patch('/api/tuvan/:id', xacThuc, async (req, res) => {
    try {
        const { trangThai } = req.body;
        await TuVan.findByIdAndUpdate(req.params.id, { trangThai });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

////////////////////xác thực ///////////////////////



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
    NgheNghiep: { type: String },
    ngayTao: { type: Date, default: Date.now }
});

const TaiKhoan = mongoose.model('TaiKhoan', TaiKhoanSchema);

////////////////   BANG KiemTraDauVaoDaLam   ////////////////////////

const KiemTraDauVaoDaLamSchema = new mongoose.Schema({
    email: { type: String, require: true },
    hoten: { type: String, require: true },
    sdt: { type: String, require: true },
    diemLR: { type: Number },
    diemSW: { type: Number },
    motanangluc: { type: String },
    ngayTao: { type: Date, default: Date.now }
});

const KiemTraDauVaoDaLam = mongoose.model('KiemTraDauVaoDaLam', KiemTraDauVaoDaLamSchema);

app.post('/api/luu-kiem-tra-dau-vao', xacThuc, async (req, res) => {
    try {
        const { diemLR, diemSW, motanangluc } = req.body;
        const Email = req.user.Email;

        const tk = await TaiKhoan.findOne({ Email: Email });
        if (!tk) return res.status(404).json({ trangThai: "tb", mess: "Không tìm thấy tài khoản" });

        const moi = new KiemTraDauVaoDaLam({
            email: tk.Email,
            hoten: tk.HoTen,
            sdt: tk.sdt,
            diemLR,
            diemSW,
            motanangluc
        });
        
        await moi.save();
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Loi luu kiem tra dau vao: ", err);
        res.status(500).json({ trangThai: "tb", mess: "Lỗi server" });
    }
});

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


// API đặt lại mật khẩu bằng email
app.post("/dangnhap/dat-lai-mat-khau", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const tk = await TaiKhoan.findOne({ Email: email });
        if (!tk) return res.status(404).json({ trangThai: "ktt", message: "Email không tồn tại" });

        const giavi = await bcrypt.genSalt(10);
        const mkbam = await bcrypt.hash(newPassword, giavi);
        tk.mk = mkbam;
        await tk.save();

        console.log(`Đặt lại mật khẩu thành công cho ${email}`);
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.error("Đặt lại mật khẩu thất bại:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});


////////////////// BANG HOA DON /////////////////////




///////////////////////////////////////////////////////



//////////////////////KHÓA HỌC////////////////////////////////

const KhoaHocSchema = new mongoose.Schema({
    TenKhoaHoc: { type: String, require: true },
    kyNang: { type: String, require: true },
    DauRa: { type: String, require: true },
    MoTa: { type: String, require: true },
    PhuHop: { type: String, require: true },
    Gia: { type: Number, require: true },
    Image: { type: String, require: true },
    QuyenLoi: { type: String, require: true },
    PhuongPhap: { type: String, require: true },
    KetQua: { type: String, require: true },
    trangThai: { type: String, default: "Đang Hoạt Động" },
    ngayTao: { type: Date, default: Date.now },
})

const KhoaHoc = mongoose.model('KhoaHoc', KhoaHocSchema);

//// api them khoa hoc 

app.post('/ThemKhoaHoc', xacThuc, async (req, res) => {
    try {

        const VaiTro = req.user.VaiTro;

        if (VaiTro === "Học Viên") return res.status(200).json({ trangThai: "kdtq" })

        const { TenKhoaHoc, kyNang, DauRa, MoTa, PhuHop, Gia, Image, QuyenLoi, PhuongPhap, KetQua, trangThai } = req.body;

        const Data = new KhoaHoc({
            TenKhoaHoc: TenKhoaHoc,
            kyNang: kyNang,
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
        const { TenKhoaHoc, kyNang, DauRa, MoTa, PhuHop, Gia, Image, QuyenLoi, PhuongPhap, KetQua, trangThai } = req.body;
        dataKhoaHoc.TenKhoaHoc = TenKhoaHoc;
        dataKhoaHoc.kyNang = kyNang;
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

// HÀM HỖ TRỢ XÓA FILE GHI ÂM CỦA HỌC VIÊN Ở SERVER BACKEND
const xoaFileGhiAm = (dapAnHocVien) => {
    if (dapAnHocVien && typeof dapAnHocVien === 'string' && dapAnHocVien.includes('taiNguyen/fileGhiAm_HV/')) {
        const parts = dapAnHocVien.split('taiNguyen/fileGhiAm_HV/');
        const fileName = parts[parts.length - 1];
        if (fileName) {
            const filePath = path.join(__dirname, 'taiNguyen/fileGhiAm_HV', fileName);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`Đã xóa file ghi âm học viên: ${filePath}`);
                } catch (e) {
                    console.log(`Lỗi khi xóa file ghi âm ${filePath}:`, e);
                }
            }
        }
    }
};

// api xóa khóa Học

app.delete(`/xoaKhoaHoc/:id`, xacThuc, async (req, res) => {
    try {
        const VaiTro = req.user.VaiTro;
        const idKhoaHoc = req.params.id;
        const dataKhoaHoc = await KhoaHoc.findById(idKhoaHoc);
        if (!dataKhoaHoc) return res.status(404).json({ trangThai: "ktt" });
        if (VaiTro !== "admin") return res.status(200).json({ trangThai: "kdtq" });/// không đủ thẩm quyền

        const dsLopHoc = await LopHoc.find({ idKhoaHoc: idKhoaHoc });
        const coLopHoatDong = dsLopHoc.some(lh => 
            lh.trangThai === "Khai Giảng" || lh.trangThai === "Đang Hoạt Động"
        );

        if (coLopHoatDong) {
            dataKhoaHoc.trangThai = "Đang Ẩn";
            await dataKhoaHoc.save();
            return res.status(200).json({ trangThai: "dangCoLop" });
        }

        const idLopHocs = dsLopHoc.map(lh => String(lh._id));

        // Tìm tất cả bài tập thuộc các lớp này để xóa chi tiết bài tập và file ghi âm học viên
        const dsBaiTap = await BaiTap.find({ idLopHoc: { $in: idLopHocs } });
        const idBaiTaps = dsBaiTap.map(bt => String(bt._id));

        // Xóa file ghi âm của học viên từ ChiTietBaiTapDaLam
        if (typeof ChiTietBaiTapDaLam !== "undefined") {
            const dsChiTietDaLam = await ChiTietBaiTapDaLam.find({ idBaiTap: { $in: idBaiTaps } });
            for (const item of dsChiTietDaLam) {
                if (item.type === 3 && item.dapAnHocVien) {
                    xoaFileGhiAm(item.dapAnHocVien);
                }
            }
        }

        // Thực hiện xóa toàn bộ dữ liệu của từng lớp trong khóa học
        if (typeof lopHocOnline !== "undefined") await lopHocOnline.deleteMany({ idLopHoc: { $in: idLopHocs } });
        if (typeof CongDong !== "undefined") await CongDong.deleteMany({ idLopHoc: { $in: idLopHocs } });
        if (typeof DiemDanh !== "undefined") await DiemDanh.deleteMany({ idLopHoc: { $in: idLopHocs } });
        if (typeof ChiTietDiemDanh !== "undefined") await ChiTietDiemDanh.deleteMany({ idLopHoc: { $in: idLopHocs } });

        // Chỉ xóa từ vựng của Học Viên đã thêm trong các lớp thuộc khóa học này
        if (typeof TuVung !== "undefined") {
            await TuVung.deleteMany({ 
                idLopHoc: { $in: idLopHocs }, 
                VaiTroNguoiThem: "Học Viên" 
            });
        }

        // Xóa các bảng liên quan đến bài tập
        if (typeof BaiTap !== "undefined") await BaiTap.deleteMany({ idLopHoc: { $in: idLopHocs } });
        if (typeof BaiTapDaLam !== "undefined") await BaiTapDaLam.deleteMany({ idLopHoc: { $in: idLopHocs } });
        if (typeof ChiTietBaiTap !== "undefined") await ChiTietBaiTap.deleteMany({ idBaiTap: { $in: idBaiTaps } });
        if (typeof ChiTietBaiTapDaLam !== "undefined") await ChiTietBaiTapDaLam.deleteMany({ idBaiTap: { $in: idBaiTaps } });

        // Xóa toàn bộ lớp học của khóa học
        await LopHoc.deleteMany({ idKhoaHoc: idKhoaHoc });

        // Xóa khóa học
        await KhoaHoc.findByIdAndDelete(idKhoaHoc);
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
    SoLuong: { type: Number, default: 0 },
    ngayTao: { type: Date, default: Date.now },
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

        // Lấy thông tin lớp học
        const dataLopHoc = await LopHoc.findById(idLopHoc);
        if (!dataLopHoc) return res.status(404).json({ trangThai: "ktt" });

        // Nếu lớp học đang trong trạng thái Khai Giảng hoặc Đang Hoạt Động thì không thể xóa
        if (dataLopHoc.trangThai === "Khai Giảng" || dataLopHoc.trangThai === "Đang Hoạt Động") {
            return res.status(200).json({ trangThai: "dangHoatDong" });
        }

        // Tách lấy danh sách bài tập của lớp học này để xóa chi tiết bài tập và file ghi âm
        const dsBaiTap = await BaiTap.find({ idLopHoc: idLopHoc });
        const idBaiTaps = dsBaiTap.map(bt => String(bt._id));

        // Xóa file ghi âm của học viên từ ChiTietBaiTapDaLam
        if (typeof ChiTietBaiTapDaLam !== "undefined") {
            const dsChiTietDaLam = await ChiTietBaiTapDaLam.find({ idBaiTap: { $in: idBaiTaps } });
            for (const item of dsChiTietDaLam) {
                if (item.type === 3 && item.dapAnHocVien) {
                    xoaFileGhiAm(item.dapAnHocVien);
                }
            }
        }

        // Xóa Lớp học
        await LopHoc.findByIdAndDelete(idLopHoc);

        // Xóa Lớp học online
        if (typeof lopHocOnline !== "undefined") await lopHocOnline.deleteMany({ idLopHoc: idLopHoc });

        // Xóa Cộng đồng
        if (typeof CongDong !== "undefined") await CongDong.deleteMany({ idLopHoc: idLopHoc });

        // Xóa từ vựng của Học Viên đã thêm trong lớp học cần xóa (giữ lại giảng viên/admin)
        if (typeof TuVung !== "undefined") {
            await TuVung.deleteMany({ idLopHoc: idLopHoc, VaiTroNguoiThem: "Học Viên" });
        }

        // Xóa Bài tập và kết quả bài tập liên quan
        if (typeof BaiTap !== "undefined") await BaiTap.deleteMany({ idLopHoc: idLopHoc });
        if (typeof BaiTapDaLam !== "undefined") await BaiTapDaLam.deleteMany({ idLopHoc: idLopHoc });
        if (typeof ChiTietBaiTap !== "undefined") await ChiTietBaiTap.deleteMany({ idBaiTap: { $in: idBaiTaps } });
        if (typeof ChiTietBaiTapDaLam !== "undefined") await ChiTietBaiTapDaLam.deleteMany({ idBaiTap: { $in: idBaiTaps } });

        // Xóa Điểm danh và Chi tiết điểm danh
        if (typeof DiemDanh !== "undefined") await DiemDanh.deleteMany({ idLopHoc: idLopHoc });
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
    Email: { type: String },
    TenKhoaHoc: { type: String },
    Gia: { type: String },
    TenLop: { type: String },
    Time: { type: String, default: () => new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) },
    trangThai: { type: String, default: "Hoạt động" }
});

const HoaDon = mongoose.model('HoaDon', HoaDonSchema);

///api gui hoa don email
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
        console.error("gui email hoa don that bai:", error);
        res.status(500).json({ trangThai: "tb", mess: String(error) });
    }
});

// API Quản lý Hóa Đơn (Admin)
app.get('/api/hoadon', xacThuc, async (req, res) => {
    try {
        const data = await HoaDon.find();
        res.status(200).json({ trangThai: "tc", data });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

// api lấy hóa đơn lop học còn hoạt động

app.get('/api/hoadon-hoat-dong', xacThuc, async (req, res) => {
    try {
        const data = await HoaDon.find();
        let newDataLH = [];
        let emails = new Set();
        
        for (let item of data) {
            if (!item.idLopHoc) continue;
            const checkLH = await LopHoc.findById(item.idLopHoc);
            if (!checkLH) continue;
            
            const status = (checkLH.trangThai || "").trim().toLowerCase();
            // Chấp nhận nhiều biến thể của trạng thái hoạt động
            if (status === "khai giảng" || status === "đang hoạt động" || status === "hoạt động") {
                newDataLH.push(item);
                if (item.Email) emails.add(item.Email);
            }
        }
        
        // Chỉ lấy tài khoản của những học viên trong các hóa đơn đã lọc
        const uniqueEmails = Array.from(emails);
        const newDataTK = await TaiKhoan.find({ Email: { $in: uniqueEmails } });
        
        console.log(`Trả về ${newDataLH.length} hóa đơn và ${newDataTK.length} tài khoản hoạt động`);
        res.status(200).json({ trangThai: "tc", dataLH: newDataLH, dataTK: newDataTK });
    } catch (err) {
        console.error("Lỗi /api/hoadon-hoat-dong:", err);
        res.status(500).json({ trangThai: "tb", mess: err.message });
    }
});

// api tài hóa đơn tài khoản 
app.get('/api/hoadon-tai-khoan', xacThuc, async (req, res) => {
    
    
    try {
        console.log("ádfasdasdf");
        const data = await HoaDon.find();
        let newData=[];
        for(let item of data){
            const checkTk = await TaiKhoan.find({Email:item.Email});
            console.log(checkTk);
            
            if(checkTk) {
                newData.push(checkTk[0]); 
            };            
        }
        console.log(newData);
        console.log("trả về tài khoản mua khóa học  thành công")
        res.status(200).json({ trangThai: "tc", data:newData });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
        console.log("trả về tài khoản mua khóa học  thất bại : "+err)
    }
});
////////////////////////////////////////


app.patch('/api/hoadon/:id', xacThuc, async (req, res) => {
    try {
        const { trangThai } = req.body;
        await HoaDon.findByIdAndUpdate(req.params.id, { trangThai });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});


/// api thếm hóa đơn

app.post('/api/them-hoa-don', async (req, res) => {
    try {
        const date = new Date();
        const vietnamTime = date.toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
        });
        const { maHoaDon, idKhoaHoc, idLopHoc, email, TenKhoaHoc, TenLop, Gia } = req.body;
        console.log("[them-hoa-don] Nhan du lieu:", { maHoaDon, idKhoaHoc, idLopHoc, email, TenKhoaHoc, TenLop, Gia });
        const newHoaDon = new HoaDon({
            maHoaDon: String(maHoaDon),
            idKhoaHoc: idKhoaHoc,
            idLopHoc: idLopHoc,
            Email: email,
            TenKhoaHoc: TenKhoaHoc,
            TenLop: TenLop,
            Gia: Gia,
            Time: vietnamTime
        });
        await newHoaDon.save();
        res.status(200).json({
            trangThai: "tc"
        })
        console.log("[them-hoa-don] Them hoa don thanh cong, ID:", newHoaDon._id);

    } catch (err) {
        res.status(500).json({
            trangThai: "tb",
            mess: "loi server " + err
        })
        console.log("[them-hoa-don] That bai:", err);

    }
})

/// api kiểm tra có đang học khóa học nào không

app.get('/api/kt-trung-khoa-hoc', xacThuc, async (req, res) => {
    try {
        const email = req.user.Email;

        const checkHD = await HoaDon.find({ Email: email });

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
        const data = await HoaDon.find({ Email: email });
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
        const dsHoaDown = await HoaDon.find({ Email: email }).select('idLopHoc  TenKhoaHoc TenLop trangThai');

        if (dsHoaDown.length === 0) {
            return res.status(404).json({ trangThai: "ktt" });
        }
        for (const item of dsHoaDown) {
          
            const check = await LopHoc.findById(item.idLopHoc);
            let them={}
            if(item.trangThai === "Ẩn"){
                them = {
                    idLopHoc: item.idLopHoc,
                    TenKhoaHoc: item.TenKhoaHoc,
                    TenLop: item.TenLop,
                    trangThai: "Đã bị chặn"
                }
            }
            else if(!check){
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
//  dành cho tư vấn

const groq = new Groq(process.env.GROQ_API_KEY);
// dành cho video bài giảng
const groqVideo = new Groq(process.env.GROQ_API_KEY_github);

console.log("KIỂM TRA KEY EMAIL:", process.env.GROQ_API_KEY);
console.log("KIỂM TRA KEY GITHUB:", process.env.GROQ_API_KEY_github);






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
            content: `Bạn là EduMate - Trợ lý tư vấn ảo thông minh của hệ thống luyện thi TOEIC trực tuyến EduMate. Nhiệm vụ của bạn là hỗ trợ, tư vấn khóa học và giải đáp thắc mắc của học viên một cách chính xác, thân thiện.

### 1. DỮ LIỆU HỆ THỐNG
- Danh sách khóa học hiện có (JSON): ${duLieuKH}
- Danh sách lớp học hiện có (JSON): ${duLieuLH}
- Lịch sử cuộc trò chuyện trước đó: ${duLieuLSC}

### 2. THÔNG TIN TÍNH NĂNG & ĐƯỜNG DẪN GỐC
Hệ thống CHỈ CÓ các đường dẫn sau đây, tuyệt đối không tự ý thay đổi cấu trúc URL:
- Xem chi tiết khóa học: http://localhost:5173/khoahoc/[id_khoa_hoc] (Thay [id_khoa_hoc] bằng ID thực tế lấy từ dữ liệu khóa học).
- Kiểm tra đầu vào (MIỄN PHÍ): Gồm 27 câu hỏi làm trong 35 phút để biết trình độ. Chỉ cần đăng nhập là làm được, không cần mua khóa học. Link: http://localhost:5173/HV_kiemTraDauVao
- Luyện đề (Trả phí): Giải đề TOEIC chuẩn ETS 4 kỹ năng, có tính năng chấm chữa ngay tại chỗ cho từng câu hỏi.
- Thi thử (Trả phí): Làm bài thi mô phỏng TOEIC chuẩn ETS 4 kỹ năng, làm xong hết bài mới được chấm điểm.
- Quyền lợi khi mua khóa học: Học với giảng viên, tự học qua video bài giảng (mỗi video có chatbot riêng), học từ vựng Flashcard (tự thêm hoặc dùng có sẵn), bài tập có AI chấm chữa, lớp học Online (link meeting của giáo viên), tham gia cộng đồng (link Zalo/Facebook).
- Đăng ký nhận tư vấn từ người thật: Điền form tại trang chủ http://localhost:5173/ (Giảng viên sẽ liên hệ qua SĐT hoặc Email).

### 3. NGUYÊN TẮC ỨNG XỬ VÀ ĐỊNH DẠNG (Bắt buộc tuân thủ)
- Phong cách: Thân thiện, gần gũi. Luôn xưng "mình" và gọi học viên là "bạn". 
- Độ dài: Câu trả lời phải thật ngắn gọn, súc tích, đi thẳng vào vấn đề và dưới 100 chữ.
- Định dạng văn bản: Chỉ sử dụng chữ thuần túy (Plain text). TUYỆT ĐỐI KHÔNG sử dụng dấu sao (**) để in đậm hoặc viết chữ in hoa vô tội vạ.
- QUY TẮC ĐƯỜNG DẪN (CLICKABLE LINK): BẮT BUỘC viết dưới dạng Markdown Link: [Tên hành động hoặc Tên khóa học](Đường dẫn thực tế). KHÔNG được gửi link thô.
- TUYỆT ĐỐI KHÔNG BỊA LINK LỚP HỌC: Hệ thống không có link riêng cho từng lớp. Nếu học viên hỏi về một Lớp học, phải tìm xem lớp đó thuộc Khóa học nào và trả về đường dẫn của Khóa học đó.

### 4. HƯỚNG DẪN XỬ LÝ CÁC TÌNH HUỐNG THƯỜNG GẶP (EDGE CASES)
- Tình huống 1: Học viên phân vân không biết trình độ bản thân hoặc không biết chọn khóa nào phù hợp.
  => Xử lý: Gợi ý học viên tham gia làm bài [Kiểm tra đầu vào](http://localhost:5173/HV_kiemTraDauVao) miễn phí để biết sức mình trước.
- Tình huống 2: Học viên hỏi về các khóa học KHÔNG CÓ trong dữ liệu (Ví dụ: IELTS, Giao tiếp, Tiếng Trung...).
  => Xử lý: Lịch sự thông báo EduMate hiện tại chuyên sâu về TOEIC và chưa có khóa học đó. Gợi ý họ [Điền form tư vấn tại đây](http://localhost:5173/) để trung tâm ghi nhận nhu cầu.
- Tình huống 3: Học viên hỏi các thông tin không có trong JSON (Ví dụ: Học phí bao nhiêu, Lịch khai giảng cụ thể ngày mấy, Giảng viên là ai nếu mà trong JSON không ghi).
  => Xử lý: Không tự bịa thông tin. Hãy hướng dẫn học viên bấm vào [Chi tiết khóa học](http://localhost:5173/khoahoc/[id_khoa_hoc]) mà học viên quan tâm hoặc phù hợp để xem hoặc [Điền form tư vấn tại đây](http://localhost:5173/) để tư vấn viên liên hệ giải đáp.
- Tình huống 4: Học viên hỏi về Lớp học (Ví dụ: "Lớp TOEIC-A1 học khi nào?").
  => Xử lý: Kiểm tra lớp TOEIC-A1 thuộc khóa nào (Ví dụ: Khóa TOEIC 550). Trả lời: "Lớp TOEIC-A1 thuộc khóa TOEIC 550. Bạn xem lịch học chi tiết tại [Khóa học TOEIC 550](http://localhost:5173/khoahoc/toeic550) nhé."

### 5. VÍ DỤ MẪU
- Đúng: "Để biết chính xác trình độ của mình, bạn hãy tham gia [Kiểm tra đầu vào](http://localhost:5173/HV_kiemTraDauVao) miễn phí nhé. Bài test gồm 27 câu trong 35 phút thôi nè."
- Đúng: "Hiện tại hệ thống chưa có khóa IELTS. Bạn có thể tham khảo các [Khóa học TOEIC 550](http://localhost:5173/khoahoc/t550) hiện có, hoặc [Điền form tư vấn tại đây](http://localhost:5173/) để tụi mình hỗ trợ thêm nha."
- Sai: "Bạn vào link http://localhost:5173/HV_kiemTraDauVao để test nhé." (Vi phạm lỗi gửi link thô).
- Sai: "Bạn xem thông tin lớp tại **[Lớp TOEIC A1](http://localhost:5173/lophoc/a1)** nha." (Vi phạm lỗi bịa link lớp và dùng dấu **).
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
            model: "llama-3.1-8b-instant", // Dùng Llama 3 70B của Meta (Facebook) cực kỳ thông minh
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
            content: `Bạn là EduMate — trợ lý học tập ảo của nền tảng E-learning.

## Nhiệm vụ
Hỗ trợ học viên đang xem video bài giảng bằng cách:
- Giải thích, làm rõ nội dung trong video
- Trả lời thắc mắc liên quan đến bài học
- Tìm kiếm và cung cấp thêm kiến thức liên quan đến chủ đề bài học khi học viên yêu cầu

## Nội dung video hiện tại
${videoSummary ? `"""${videoSummary}"""` : "Hiện chưa có tóm tắt nội dung video. Hãy hỗ trợ học viên dựa trên câu hỏi của họ."}

## Lịch sử hội thoại
${duLieuLSC ? duLieuLSC : "Chưa có lịch sử hội thoại. Đây là lần đầu học viên nhắn tin."}

## Nguyên tắc trả lời

### Phân loại câu hỏi
- Nếu câu hỏi LIÊN QUAN đến nội dung video: trả lời dựa trên tóm tắt video, ưu tiên thông tin trong video trước.
- Nếu câu hỏi NGOÀI nội dung video nhưng liên quan đến chủ đề bài học: thông báo ngắn gọn rằng nội dung này không có trong video, sau đó chủ động giải thích thêm để hỗ trợ học viên.
- Nếu câu hỏi HOÀN TOÀN không liên quan đến bài học: lịch sự từ chối và nhắc học viên tập trung vào nội dung bài giảng.

### Phong cách
- Xưng "mình", gọi học viên là "bạn"
- Thân thiện, ngắn gọn, dễ hiểu
- Chỉ dùng văn bản thuần túy, không dùng markdown (không dùng **, ##, -, hoặc các ký tự định dạng phức tạp)
- Nếu cần liệt kê, dùng số thứ tự: 1. 2. 3.

### Xử lý trường hợp đặc biệt
- Nếu câu hỏi không rõ ý: hỏi lại ngắn gọn để làm rõ, không tự đoán sai ý
- Nếu không chắc chắn về thông tin: nói rõ "mình không chắc về điều này" thay vì trả lời sai
- Nếu học viên chào hỏi hoặc nhắn tin không phải câu hỏi: phản hồi tự nhiên, thân thiện và hỏi mình có thể giúp gì
- Nếu tóm tắt video trống hoặc không đủ thông tin: thừa nhận giới hạn và vẫn cố gắng hỗ trợ dựa trên câu hỏi của học viên`
        };

        const messages = [
            tinNhanHeThong,
            { role: "user", content: message }
        ];

        const chatCompletion = await groqVideo.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant",
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
        const { CauHoi, dapAnHocVien, giaiThich, anh, type, noiDungDoc , loaiBai} = req.body;
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
            const yeuCau = `Bạn là giám khảo chấm thi Writing chuẩn ETS. Nhiệm vụ duy nhất của bạn là chấm điểm và nhận xét bài làm của học viên.

            ## THÔNG TIN ĐỀ THI
            - Loại bài: ${loaiBai}
            - Câu hỏi: ${CauHoi}
            ${noiDungDoc ? `- Nội dung bài đọc: ${noiDungDoc}` : ""}
            ${giaiThich ? `- Hướng dẫn của giáo viên: ${giaiThich}` : ""}
            ${anh ? `- Đề có hình ảnh đính kèm: học viên cần mô tả/viết dựa trên hình ảnh đó` : ""}

            ## BÀI LÀM CỦA HỌC VIÊN
            ${dapAnHocVien ? `"${dapAnHocVien}"` : "KHÔNG CÓ NỘI DUNG — học viên bỏ trống"}

            ## THANG ĐIỂM
            Chấm theo thang: ${khoangDiem}
            Quy tắc điểm tối thiểu: nếu học viên bỏ trống hoàn toàn → trả về điểm thấp nhất của thang.

            ## TIÊU CHÍ CHẤM ĐIỂM (theo thứ tự ưu tiên)
            1. Mức độ hoàn thành yêu cầu đề bài (có trả lời đúng trọng tâm không)
            2. Ngữ pháp (độ chính xác câu, thì, cấu trúc)
            3. Từ vựng (sự phù hợp, đa dạng, chính xác)
            4. Tính mạch lạc và liên kết ý
            5. Độ dài và mức độ phát triển ý (nếu yêu cầu đề có quy định)

            ## HƯỚNG DẪN NHẬN XÉT
            - Viết bằng tiếng Việt, ngắn gọn, đúng trọng tâm
            - Nêu rõ: điểm mạnh → điểm yếu → gợi ý cải thiện cụ thể
            - Không khen chung chung, không dùng từ sáo rỗng
            - Nếu bài bỏ trống: chỉ ghi "Học viên không làm bài"
            - Tuyệt đối không xuống dòng, không dùng ký tự \\n, viết thành 1 chuỗi liên tục

            ## OUTPUT
            Trả về JSON hợp lệ duy nhất, không markdown, không giải thích thêm:
            {
            "diemUocTinh": <số thực trong khoảng ${khoangDiem}>,
            "loiNhanXet": "<nhận xét trên 1 dòng duy nhất>"
            }`;
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
                const yeuCau = `Bạn là giám khảo chấm thi Writing chuẩn ETS. Nhiệm vụ duy nhất của bạn là chấm điểm và nhận xét bài làm của học viên.

            ## THÔNG TIN ĐỀ THI
            - Loại bài: ${loaiBai}
            - Câu hỏi: ${CauHoi}
            ${noiDungDoc ? `- Nội dung bài đọc: ${noiDungDoc}` : ""}
            ${giaiThich ? `- Hướng dẫn của giáo viên: ${giaiThich}` : ""}
            ${anh ? `- Đề có hình ảnh đính kèm: học viên cần mô tả/viết dựa trên hình ảnh đó` : ""}

            ## BÀI LÀM CỦA HỌC VIÊN
            ${dapAnHocVien ? `"${dapAnHocVien}"` : "KHÔNG CÓ NỘI DUNG — học viên bỏ trống"}

            ## THANG ĐIỂM
            Chấm theo thang: ${khoangDiem}
            Quy tắc điểm tối thiểu: nếu học viên bỏ trống hoàn toàn → trả về điểm thấp nhất của thang.

            ## TIÊU CHÍ CHẤM ĐIỂM (theo thứ tự ưu tiên)
            1. Mức độ hoàn thành yêu cầu đề bài (có trả lời đúng trọng tâm không)
            2. Ngữ pháp (độ chính xác câu, thì, cấu trúc)
            3. Từ vựng (sự phù hợp, đa dạng, chính xác)
            4. Tính mạch lạc và liên kết ý
            5. Độ dài và mức độ phát triển ý (nếu yêu cầu đề có quy định)

            ## HƯỚNG DẪN NHẬN XÉT
            - Viết bằng tiếng Việt, ngắn gọn, đúng trọng tâm
            - Nêu rõ: điểm mạnh → điểm yếu → gợi ý cải thiện cụ thể
            - Không khen chung chung, không dùng từ sáo rỗng
            - Nếu bài bỏ trống: chỉ ghi "Học viên không làm bài"
            - Tuyệt đối không xuống dòng, không dùng ký tự \\n, viết thành 1 chuỗi liên tục

            ## OUTPUT
            Trả về JSON hợp lệ duy nhất, không markdown, không giải thích thêm:
            {
            "diemUocTinh": <số thực trong khoảng ${khoangDiem}>,
            "loiNhanXet": "<nhận xét trên 1 dòng duy nhất>"
            }`;
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
                    const yeuCau = `Bạn là giám khảo chấm thi Writing chuẩn ETS. Nhiệm vụ duy nhất của bạn là chấm điểm và nhận xét bài làm của học viên.

            ## THÔNG TIN ĐỀ THI
            - Loại bài: ${loaiBai}
            - Câu hỏi: ${CauHoi}
            ${noiDungDoc ? `- Nội dung bài đọc: ${noiDungDoc}` : ""}
            ${giaiThich ? `- Hướng dẫn của giáo viên: ${giaiThich}` : ""}
            ${anh ? `- Đề có hình ảnh đính kèm: học viên cần mô tả/viết dựa trên hình ảnh đó` : ""}

            ## BÀI LÀM CỦA HỌC VIÊN
            ${dapAnHocVien ? `"${dapAnHocVien}"` : "KHÔNG CÓ NỘI DUNG — học viên bỏ trống"}

            ## THANG ĐIỂM
            Chấm theo thang: ${khoangDiem}
            Quy tắc điểm tối thiểu: nếu học viên bỏ trống hoàn toàn → trả về điểm thấp nhất của thang.

            ## TIÊU CHÍ CHẤM ĐIỂM (theo thứ tự ưu tiên)
            1. Mức độ hoàn thành yêu cầu đề bài (có trả lời đúng trọng tâm không)
            2. Ngữ pháp (độ chính xác câu, thì, cấu trúc)
            3. Từ vựng (sự phù hợp, đa dạng, chính xác)
            4. Tính mạch lạc và liên kết ý
            5. Độ dài và mức độ phát triển ý (nếu yêu cầu đề có quy định)

            ## HƯỚNG DẪN NHẬN XÉT
            - Viết bằng tiếng Việt, ngắn gọn, đúng trọng tâm
            - Nêu rõ: điểm mạnh → điểm yếu → gợi ý cải thiện cụ thể
            - Không khen chung chung, không dùng từ sáo rỗng
            - Nếu bài bỏ trống: chỉ ghi "Học viên không làm bài"
            - Tuyệt đối không xuống dòng, không dùng ký tự \\n, viết thành 1 chuỗi liên tục

            ## OUTPUT
            Trả về JSON hợp lệ duy nhất, không markdown, không giải thích thêm:
            {
            "diemUocTinh": <số thực trong khoảng ${khoangDiem}>,
            "loiNhanXet": "<nhận xét trên 1 dòng duy nhất>"
            }`;
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
const { log } = require('console');
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
    const { CauHoi, dapAnHocVien, giaiThich, anh, type ,noiDungDoc,loaiBai} = req.body;
  

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


            const yeuCau = `Bạn là giám khảo chấm thi Speaking chuẩn ETS. Nhiệm vụ duy nhất của bạn là chấm điểm và nhận xét bài nói của học viên.

            ## THÔNG TIN ĐỀ THI
            - Loại bài: ${loaiBai}
            - Câu hỏi: ${CauHoi}
            ${noiDungDoc ? `- Nội dung bài đọc: ${noiDungDoc}` : ""}
            ${giaiThich ? `- Hướng dẫn của giáo viên: ${giaiThich}` : ""}
            ${anh ? `- Đề có hình ảnh đính kèm: học viên cần mô tả/trả lời dựa trên hình ảnh đó` : ""}

            ## BÀI LÀM CỦA HỌC VIÊN
            ${Whisper.text ? `- Nội dung học viên đã nói (speech-to-text): "${Whisper.text}"` : "- Nội dung: KHÔNG CÓ — học viên không nói gì"}
            ${nguDieu.nhanXetNguDieu ? `- Đánh giá ngữ điệu (từ hệ thống phân tích giọng nói): "${nguDieu.nhanXetNguDieu}"` : "- Ngữ điệu: Không có dữ liệu"}

            ## THANG ĐIỂM
            - Thang điểm cố định: 0.0 – 8.0 (số thực, làm tròn 1 chữ số thập phân)
            - Điểm 0.0: học viên không nói gì hoặc nội dung hoàn toàn không liên quan
            - Điểm 8.0: hoàn toàn xuất sắc, không có lỗi đáng kể
            - Không được trả về điểm ngoài khoảng 0.0 – 8.0

            ## TIÊU CHÍ CHẤM ĐIỂM (theo thứ tự ưu tiên)
            1. Mức độ hoàn thành yêu cầu đề bài (có trả lời đúng trọng tâm không)
            2. Độ trôi chảy (fluency): nói tự nhiên, ít ngập ngừng, không dừng quá lâu
            3. Ngữ pháp (grammar): độ chính xác cấu trúc câu, thì động từ
            4. Từ vựng (vocabulary): sự phù hợp, đa dạng, chính xác với ngữ cảnh
            5. Ngữ điệu và phát âm (pronunciation & intonation): dựa trên đánh giá từ hệ thống phân tích giọng nói

            ## HƯỚNG DẪN NHẬN XÉT
            - Viết bằng tiếng Việt, ngắn gọn, đúng trọng tâm
            - Cấu trúc nhận xét: điểm mạnh → điểm yếu → gợi ý cải thiện cụ thể
            - Nhận xét phải bao quát cả 5 tiêu chí, không bỏ sót tiêu chí nào
            - Không khen chung chung, không dùng từ sáo rỗng
            - Nếu whisper.text trống hoặc không rõ nghĩa: dựa vào ngữ điệu để chấm, ghi rõ "Không nhận diện được nội dung, chỉ đánh giá dựa trên ngữ điệu"
            - Nếu cả hai đều trống: ghi "Học viên không thực hiện bài nói"
            - Tuyệt đối không xuống dòng, không dùng ký tự \\n, viết thành 1 chuỗi liên tục

            ## LƯU Ý ĐẶC BIỆT
            - Whisper có thể phiên âm sai một số từ → không trừ điểm nặng nếu lỗi nhỏ có thể do nhận diện sai
            - Ngữ điệu từ hệ thống là dữ liệu bổ trợ, không phải dữ liệu duy nhất để chấm
            - Ưu tiên đánh giá nội dung và sự liên quan đến đề bài trước khi xét các tiêu chí phụ

            ## OUTPUT
            Trả về JSON hợp lệ duy nhất, không markdown, không giải thích thêm:
            {
            "diemUocTinh": <số thực 0.0–8.0, làm tròn 1 chữ số thập phân>,
            "loiNhanXet": "<nhận xét trên 1 dòng duy nhất>"
            }`;
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
            console.log("🎯 KẾT QUẢ CHẤM ĐIỂM TỰ speaking:", ketQuaHoanChinh);

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

                const yeuCau = `Bạn là giám khảo chấm thi Speaking chuẩn ETS. Nhiệm vụ duy nhất của bạn là chấm điểm và nhận xét bài nói của học viên.

            ## THÔNG TIN ĐỀ THI
            - Loại bài: ${loaiBai}
            - Câu hỏi: ${CauHoi}
            ${noiDungDoc ? `- Nội dung bài đọc: ${noiDungDoc}` : ""}
            ${giaiThich ? `- Hướng dẫn của giáo viên: ${giaiThich}` : ""}
            ${anh ? `- Đề có hình ảnh đính kèm: học viên cần mô tả/trả lời dựa trên hình ảnh đó` : ""}

            ## BÀI LÀM CỦA HỌC VIÊN
            ${Whisper.text ? `- Nội dung học viên đã nói (speech-to-text): "${Whisper.text}"` : "- Nội dung: KHÔNG CÓ — học viên không nói gì"}
            ${nguDieu.nhanXetNguDieu ? `- Đánh giá ngữ điệu (từ hệ thống phân tích giọng nói): "${nguDieu.nhanXetNguDieu}"` : "- Ngữ điệu: Không có dữ liệu"}

            ## THANG ĐIỂM
            - Thang điểm cố định: 0.0 – 8.0 (số thực, làm tròn 1 chữ số thập phân)
            - Điểm 0.0: học viên không nói gì hoặc nội dung hoàn toàn không liên quan
            - Điểm 8.0: hoàn toàn xuất sắc, không có lỗi đáng kể
            - Không được trả về điểm ngoài khoảng 0.0 – 8.0

            ## TIÊU CHÍ CHẤM ĐIỂM (theo thứ tự ưu tiên)
            1. Mức độ hoàn thành yêu cầu đề bài (có trả lời đúng trọng tâm không)
            2. Độ trôi chảy (fluency): nói tự nhiên, ít ngập ngừng, không dừng quá lâu
            3. Ngữ pháp (grammar): độ chính xác cấu trúc câu, thì động từ
            4. Từ vựng (vocabulary): sự phù hợp, đa dạng, chính xác với ngữ cảnh
            5. Ngữ điệu và phát âm (pronunciation & intonation): dựa trên đánh giá từ hệ thống phân tích giọng nói

            ## HƯỚNG DẪN NHẬN XÉT
            - Viết bằng tiếng Việt, ngắn gọn, đúng trọng tâm
            - Cấu trúc nhận xét: điểm mạnh → điểm yếu → gợi ý cải thiện cụ thể
            - Nhận xét phải bao quát cả 5 tiêu chí, không bỏ sót tiêu chí nào
            - Không khen chung chung, không dùng từ sáo rỗng
            - Nếu whisper.text trống hoặc không rõ nghĩa: dựa vào ngữ điệu để chấm, ghi rõ "Không nhận diện được nội dung, chỉ đánh giá dựa trên ngữ điệu"
            - Nếu cả hai đều trống: ghi "Học viên không thực hiện bài nói"
            - Tuyệt đối không xuống dòng, không dùng ký tự \\n, viết thành 1 chuỗi liên tục

            ## LƯU Ý ĐẶC BIỆT
            - Whisper có thể phiên âm sai một số từ → không trừ điểm nặng nếu lỗi nhỏ có thể do nhận diện sai
            - Ngữ điệu từ hệ thống là dữ liệu bổ trợ, không phải dữ liệu duy nhất để chấm
            - Ưu tiên đánh giá nội dung và sự liên quan đến đề bài trước khi xét các tiêu chí phụ

            ## OUTPUT
            Trả về JSON hợp lệ duy nhất, không markdown, không giải thích thêm:
            {
            "diemUocTinh": <số thực 0.0–8.0, làm tròn 1 chữ số thập phân>,
            "loiNhanXet": "<nhận xét trên 1 dòng duy nhất>"
            }`;
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

                console.log("🎯 KẾT QUẢ speaking TỪ NVIDIA:", ketQuaHoanChinh);
                return res.status(200).json({
                    trangThai: "tc",
                    data: ketQuaHoanChinh
                });



            } catch (err) {
                console.log("mode nvidia cham bai that bai: " + err);
                try {
                    ///// lần 3 yêu cầu MISTRAL chám bài 
                    let duLieuGoiDi = [];
                    const yeuCau = `Bạn là giám khảo chấm thi Speaking chuẩn ETS. Nhiệm vụ duy nhất của bạn là chấm điểm và nhận xét bài nói của học viên.

            ## THÔNG TIN ĐỀ THI
            - Loại bài: ${loaiBai}
            - Câu hỏi: ${CauHoi}
            ${noiDungDoc ? `- Nội dung bài đọc: ${noiDungDoc}` : ""}
            ${giaiThich ? `- Hướng dẫn của giáo viên: ${giaiThich}` : ""}
            ${anh ? `- Đề có hình ảnh đính kèm: học viên cần mô tả/trả lời dựa trên hình ảnh đó` : ""}

            ## BÀI LÀM CỦA HỌC VIÊN
            ${Whisper.text ? `- Nội dung học viên đã nói (speech-to-text): "${Whisper.text}"` : "- Nội dung: KHÔNG CÓ — học viên không nói gì"}
            ${nguDieu.nhanXetNguDieu ? `- Đánh giá ngữ điệu (từ hệ thống phân tích giọng nói): "${nguDieu.nhanXetNguDieu}"` : "- Ngữ điệu: Không có dữ liệu"}

            ## THANG ĐIỂM
            - Thang điểm cố định: 0.0 – 8.0 (số thực, làm tròn 1 chữ số thập phân)
            - Điểm 0.0: học viên không nói gì hoặc nội dung hoàn toàn không liên quan
            - Điểm 8.0: hoàn toàn xuất sắc, không có lỗi đáng kể
            - Không được trả về điểm ngoài khoảng 0.0 – 8.0

            ## TIÊU CHÍ CHẤM ĐIỂM (theo thứ tự ưu tiên)
            1. Mức độ hoàn thành yêu cầu đề bài (có trả lời đúng trọng tâm không)
            2. Độ trôi chảy (fluency): nói tự nhiên, ít ngập ngừng, không dừng quá lâu
            3. Ngữ pháp (grammar): độ chính xác cấu trúc câu, thì động từ
            4. Từ vựng (vocabulary): sự phù hợp, đa dạng, chính xác với ngữ cảnh
            5. Ngữ điệu và phát âm (pronunciation & intonation): dựa trên đánh giá từ hệ thống phân tích giọng nói

            ## HƯỚNG DẪN NHẬN XÉT
            - Viết bằng tiếng Việt, ngắn gọn, đúng trọng tâm
            - Cấu trúc nhận xét: điểm mạnh → điểm yếu → gợi ý cải thiện cụ thể
            - Nhận xét phải bao quát cả 5 tiêu chí, không bỏ sót tiêu chí nào
            - Không khen chung chung, không dùng từ sáo rỗng
            - Nếu whisper.text trống hoặc không rõ nghĩa: dựa vào ngữ điệu để chấm, ghi rõ "Không nhận diện được nội dung, chỉ đánh giá dựa trên ngữ điệu"
            - Nếu cả hai đều trống: ghi "Học viên không thực hiện bài nói"
            - Tuyệt đối không xuống dòng, không dùng ký tự \\n, viết thành 1 chuỗi liên tục

            ## LƯU Ý ĐẶC BIỆT
            - Whisper có thể phiên âm sai một số từ → không trừ điểm nặng nếu lỗi nhỏ có thể do nhận diện sai
            - Ngữ điệu từ hệ thống là dữ liệu bổ trợ, không phải dữ liệu duy nhất để chấm
            - Ưu tiên đánh giá nội dung và sự liên quan đến đề bài trước khi xét các tiêu chí phụ

            ## OUTPUT
            Trả về JSON hợp lệ duy nhất, không markdown, không giải thích thêm:
            {
            "diemUocTinh": <số thực 0.0–8.0, làm tròn 1 chữ số thập phân>,
            "loiNhanXet": "<nhận xét trên 1 dòng duy nhất>"
            }`;
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

                    console.log("🎯 KẾT QUẢ speaking TỪ MISTRAL:", ketQuaHoanChinh);
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
        const emails = hoadons.map(hd => hd.Email);
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
        const emails = hoadons.map(hd => hd.Email);
        
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

// API Cập nhật Luyện Đề (tên, trạng thái)
app.patch('/api/luyen-de/:id', xacThuc, async (req, res) => {
    try {
        const { tenBoDe, tenDe, trangThai } = req.body;
        const today = new Date();
        const ngayTao = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        await LuyenDe.findByIdAndUpdate(req.params.id, {
            tenBoDe, tenDe, trangThai, ngayTao
        });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi cập nhật luyện đề:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Xóa toàn bộ chi tiết luyện đề theo idLuyenDe
app.delete('/api/chi-tiet-luyen-de/:idLuyenDe', xacThuc, async (req, res) => {
    try {
        await ChiTietLuyenDe.deleteMany({ idLuyenDe: req.params.idLuyenDe });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi xóa chi tiết luyện đề:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Thêm hàng loạt chi tiết luyện đề
app.post('/api/chi-tiet-luyen-de', xacThuc, async (req, res) => {
    try {
        const data = req.body; // array
        await ChiTietLuyenDe.insertMany(data);
        res.status(201).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi thêm chi tiết luyện đề:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Xóa Luyện Đề theo id
app.delete('/api/luyen-de/:id', xacThuc, async (req, res) => {
    try {
        await LuyenDe.findByIdAndDelete(req.params.id);
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi xóa luyện đề:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Lấy chi tiết luyện đề theo idLuyenDe
app.get('/api/chi-tiet-luyen-de/:idLuyenDe', async (req, res) => {
    try {
        const data = await ChiTietLuyenDe.find({ idLuyenDe: req.params.idLuyenDe });
        res.status(200).json({ trangThai: "tc", data });
        console.log("lấy chi tiết luyện đề thành công");
    } catch (err) {
        console.log("Lỗi lấy chi tiết luyện đề:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

///////////////// THI THỬ ///////////////////
// Bảng Thi Thử
const ThiThuSchema = new mongoose.Schema({
    
    tenBoDe: { type: String, required: true },
    tenDe: { type: String, required: true },
    kyNang: { type: String, required: true },
    ngayTao: { type: String },
    trangThai: { type: String, default: "Bản Nháp" }
});
const ThiThu = mongoose.model("ThiThu", ThiThuSchema);

// Bảng Chi Tiết Thi Thử
const ChiTietThiThuSchema = new mongoose.Schema({
    idThiThu: { type: String, required: true },
    tenPart: { type: String },
    email: { type: String },
    type: { type: Number },
    fileNghe: { type: String },
    anh: { type: String },
    noiDungDoc: { type: String },
    noiDungCauHoi: [
        {
            soCau: { type: Number },
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
const ChiTietThiThu = mongoose.model("ChiTietThiThu", ChiTietThiThuSchema);

// API Thêm Thi Thử
app.post('/api/thi-thu', xacThuc, async (req, res) => {
    try {
        const {  tenBoDe, tenDe, kyNang } = req.body;
        const today = new Date();
        const ngayTao = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        
        const newThiThu = new ThiThu({ 
            tenBoDe, 
            tenDe, 
            kyNang,
            ngayTao,
            trangThai: "Bản Nháp"
        });
        
        await newThiThu.save();
        res.status(201).json({ trangThai: "tc", data: newThiThu });
    } catch (err) {
        console.log("Lỗi thêm thi thử:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Lấy danh sách Thi Thử
app.get('/api/thi-thu', async (req, res) => {
    try {
        const data = await ThiThu.find();
        res.status(200).json({ trangThai: "tc", data: data });
    } catch (err) {
        console.log("Lỗi lấy thi thử:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});



// API Lấy 1 Thi Thử theo ID
app.get('/api/thi-thu/:id', async (req, res) => {
    try {
        const data = await ThiThu.findById(req.params.id);
        if(data) {
            res.status(200).json({ trangThai: "tc", data: data });
        } else {
            res.status(404).json({ trangThai: "tb" });
        }
    } catch (err) {
        console.log("Lỗi lấy thi thử:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Cập nhật Thi Thử
app.patch('/api/thi-thu/:id', xacThuc, async (req, res) => {
    try {
        const { tenBoDe, tenDe, trangThai } = req.body;
        const today = new Date();
        const ngayTao = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        await ThiThu.findByIdAndUpdate(req.params.id, {
            tenBoDe, tenDe, trangThai, ngayTao
        });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi cập nhật thi thử:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Xóa Thi Thử
app.delete('/api/thi-thu/:id', xacThuc, async (req, res) => {
    try {
        await ThiThu.findByIdAndDelete(req.params.id);
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi xóa thi thử:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Chi Tiết Thi Thử - Lấy theo idThiThu
app.get('/api/chi-tiet-thi-thu/:idThiThu', async (req, res) => {
    try {
        const data = await ChiTietThiThu.find({ idThiThu: req.params.idThiThu });
        res.status(200).json({ trangThai: "tc", data });
    } catch (err) {
        console.log("Lỗi lấy chi tiết thi thử:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Chi Tiết Thi Thử - Thêm hàng loạt
app.post('/api/chi-tiet-thi-thu', xacThuc, async (req, res) => {
    try {
        const data = req.body;
        await ChiTietThiThu.insertMany(data);
        res.status(201).json({ trangThai: "tc" });
        console.log("thêm chi tiết thi thử thành công");
    } catch (err) {
        console.log("Lỗi thêm chi tiết thi thử:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Chi Tiết Thi Thử - Xóa theo idThiThu
app.delete('/api/chi-tiet-thi-thu/:idThiThu', xacThuc, async (req, res) => {
    try {
        await ChiTietThiThu.deleteMany({ idThiThu: req.params.idThiThu });
        console.log("xoa chi tiet thi thu thanh cong");
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        console.log("Lỗi xóa chi tiết thi thử:", err);
        res.status(500).json({ trangThai: "tb" });
    }
});

///////////////// KIỂM TRA ĐẦU VÀO ///////////////////

// Bảng Kiểm Tra Đầu Vào
const KiemTraDauVaoSchema = new mongoose.Schema({
    tenKiemTraDauVao: { type: String, required: true },
    emailNguoiTao: { type: String },
    ngayTao: { type: String },
    trangThai: { type: String, default: "Bản Nháp" }
});
const KiemTraDauVao = mongoose.model("KiemTraDauVao", KiemTraDauVaoSchema);

// Bảng Chi Tiết Kiểm Tra Đầu Vào
const ChiTietKiemTraDauVaoSchema = new mongoose.Schema({
    idKiemTraDauVao: { type: String, required: true },
    CauHoi: { type: String },
    type: { type: Number }, // 0: trắc nghiệm, 1: tự luận ngắn, 2: tự luận dài, 3: ghi âm
    a: { type: String },
    b: { type: String },
    c: { type: String },
    d: { type: String },
    fileNghe: { type: String },
    anh: { type: String },
    dapAn: { type: String }
});
const ChiTietKiemTraDauVao = mongoose.model("ChiTietKiemTraDauVao", ChiTietKiemTraDauVaoSchema);

// Bảng Kiểm Tra Đầu Vào Đã Làm


// API lấy danh sách Kiểm Tra Đầu Vào
app.get('/api/kiem-tra-dau-vao', async (req, res) => {
    try {
        const data = await KiemTraDauVao.find();
        res.status(200).json({ trangThai: "tc", data });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

// api lấy random 1 dề kiểm tra đầu vào
app.get('/api/kiem-tra-dau-vao-random', async (req, res) => {
    try {
        const data = await KiemTraDauVao.aggregate([{ $sample: { size: 1 } }]);
        res.status(200).json({ trangThai: "tc", data: data });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});


// lấy chi tiết 1 bài kiểm tra đầu vào
app.get('/api/kiem-tra-dau-vao/:id', async (req, res) => {
    try {
        const data = await KiemTraDauVao.findById(req.params.id);
        res.status(200).json({ trangThai: "tc", data });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

app.post('/api/kiem-tra-dau-vao', xacThuc, async (req, res) => {
    try {
        const { tenKiemTraDauVao } = req.body;
        const emailNguoiTao = req.user.Email;
        const today = new Date();
        const ngayTao = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        const newKTDV = new KiemTraDauVao({ tenKiemTraDauVao, emailNguoiTao, ngayTao });
        await newKTDV.save();
        res.status(201).json({ trangThai: "tc", data: newKTDV });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

app.patch('/api/kiem-tra-dau-vao/:id', xacThuc, async (req, res) => {
    try {
        const { tenKiemTraDauVao, trangThai } = req.body;
        await KiemTraDauVao.findByIdAndUpdate(req.params.id, { tenKiemTraDauVao, trangThai });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

app.delete('/api/kiem-tra-dau-vao/:id', xacThuc, async (req, res) => {
    try {
        await KiemTraDauVao.findByIdAndDelete(req.params.id);
        await ChiTietKiemTraDauVao.deleteMany({ idKiemTraDauVao: req.params.id });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Chi Tiết Kiểm Tra Đầu Vào
app.get('/api/chi-tiet-kiem-tra-dau-vao/:idKTDV', async (req, res) => {
    try {
        const data = await ChiTietKiemTraDauVao.find({ idKiemTraDauVao: req.params.idKTDV });
        res.status(200).json({ trangThai: "tc", data });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

app.post('/api/chi-tiet-kiem-tra-dau-vao', xacThuc, async (req, res) => {
    try {
        const data = req.body; // Array of questions
        await ChiTietKiemTraDauVao.insertMany(data);
        res.status(201).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

app.delete('/api/chi-tiet-kiem-tra-dau-vao/:idKTDV', xacThuc, async (req, res) => {
    try {
        await ChiTietKiemTraDauVao.deleteMany({ idKiemTraDauVao: req.params.idKTDV });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

// API Kiểm Tra Đầu Vào Đã Làm
app.get('/api/kiem-tra-dau-vao-da-lam', async (req, res) => {
    try {
        const data = await KiemTraDauVaoDaLam.find();
        res.status(200).json({ trangThai: "tc", data });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

app.post('/api/kiem-tra-dau-vao-da-lam', async (req, res) => {
    try {
        const { idKiemTraDauVao, email, diemLR, diemSW } = req.body;
        const today = new Date();
        const ngayNop = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        const newDaLam = new KiemTraDauVaoDaLam({ idKiemTraDauVao, email, diemLR, diemSW, ngayNop });
        await newDaLam.save();
        res.status(201).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

//////////////////////////////////////////////////////////////////
///////////////// THI THỬ ĐÃ LÀM ///////////////////

// Bảng Thi Thử Đã Làm
const ThiThuDaLamSchema = new mongoose.Schema({
    idThiThu: { type: String, required: true },
    diem: { type: Number, default: 0 },
    kyNang: { type: String },
    email: { type: String },
    ngayTao: { type: String },
});
const ThiThuDaLam = mongoose.model("ThiThuDaLam", ThiThuDaLamSchema);

// Bảng Chi Tiết Thi Thử Đã Làm
const ChiTietThiThuDaLamSchema = new mongoose.Schema({
    idThiThu: { type: String, required: true },
    email: { type: String },
    tenPart: { type: String },
    type: { type: Number },
    fileNghe: { type: String },
    anh: { type: String },
    noiDungDoc: { type: String },
    noiDungCauHoi: [
        {
            soCau: { type: Number },
            cauHoi: { type: String },
            a: { type: String },
            b: { type: String },
            c: { type: String },
            d: { type: String },
            dapAn: { type: String },
            giaiThich: { type: String },
            loiPheAI: { type: String, default: "" },
        }
    ],
});
const ChiTietThiThuDaLam = mongoose.model("ChiTietThiThuDaLam", ChiTietThiThuDaLamSchema);

// API: Lấy danh sách Thi Thử Đã Làm
app.get('/api/thi-thu-da-lam', async (req, res) => {
    try {
        const { email, idThiThu } = req.query;
        const query = {};
        if (email) query.email = email;
        if (idThiThu) query.idThiThu = idThiThu;
        const data = await ThiThuDaLam.find(query);
        res.status(200).json({ trangThai: "tc", data });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

// API: Thêm Thi Thử Đã Làm
app.post('/api/thi-thu-da-lam', async (req, res) => {
    try {
        const { idThiThu, diem, kyNang, email } = req.body;
        const today = new Date();
        const ngayTao = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        // Clean up previous attempts for the same exam by this user
        await ThiThuDaLam.deleteMany({ idThiThu, email });
        const newEntry = new ThiThuDaLam({ idThiThu, diem, kyNang, email, ngayTao });
        await newEntry.save();
        res.status(201).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

// API: Lấy Chi Tiết Thi Thử Đã Làm theo email + idThiThu
app.get('/api/chi-tiet-thi-thu-da-lam', async (req, res) => {
    try {
        const { email, idThiThu } = req.query;
        const query = {};
        if (email) query.email = email;
        if (idThiThu) query.idThiThu = idThiThu;
        const data = await ChiTietThiThuDaLam.find(query);
        res.status(200).json({ trangThai: "tc", data });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

// API: Thêm Chi Tiết Thi Thử Đã Làm (array)
app.post('/api/chi-tiet-thi-thu-da-lam', async (req, res) => {
    try {
        const data = req.body;
        if (Array.isArray(data) && data.length > 0) {
            const firstItem = data[0];
            if (firstItem && firstItem.idThiThu && firstItem.email) {
                await ChiTietThiThuDaLam.deleteMany({
                    idThiThu: firstItem.idThiThu,
                    email: firstItem.email
                });
            }
        }
        await ChiTietThiThuDaLam.insertMany(data);
        res.status(201).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});
// API: Xóa Thi Thử Đã Làm theo email + idThiThu
app.delete('/api/thi-thu-da-lam', async (req, res) => {
    try {
        const { email, idThiThu } = req.query;
        await ThiThuDaLam.deleteMany({ email, idThiThu });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

// API: Xóa Chi Tiết Thi Thử Đã Làm theo email + idThiThu
app.delete('/api/chi-tiet-thi-thu-da-lam', async (req, res) => {
    try {
        const { email, idThiThu } = req.query;
        await ChiTietThiThuDaLam.deleteMany({ email, idThiThu });
        res.status(200).json({ trangThai: "tc" });
    } catch (err) {
        res.status(500).json({ trangThai: "tb" });
    }
});

//////////////////////////////////////////////////////////////////
app.listen(port, () => {
    console.log(`server dang chay tai :http://localhost:${port}`)
})
