import { a, tr } from "framer-motion/client";
import { useEffect, useRef, useState } from "react";
import DangKy from "./componan/dangky";

interface DangNhapProp {
  tat: () => void;
  dangnhap1: (text: any) => void;
}

export default function DangNhap({ tat, dangnhap1 }: DangNhapProp) {
  const [Chon, setChon] = useState("1");
  const [alEmail, setalEmail] = useState("vao"); //sdinhDang//SokTonTai;
  const [alMK, setalMK] = useState("vao"); //sMK
  const [alOTP, setalOTP] = useState("vao");
  const [luuEmail, setluuEmail] = useState("");

  const inEmail = useRef<HTMLInputElement>(null);
  const inMK = useRef<HTMLInputElement>(null);
  const inOTP = useRef<HTMLInputElement>(null);
  const inNewMK = useRef<HTMLInputElement>(null);

  const checkDinhDangEmail = () => {
    const check = inEmail.current?.value || "";
    const check2 = check.split("@");
    if (check2.length > 1 && check2[1] !== "") {
      setalEmail("vao");
      return true;
    } else {
      setalEmail("sdinhDang");
      return false;
    }
  };

  const ktmk = (text: string) => {
    const check = {
      vietHoa: /[A-Z]/.test(text),
      hasNumber: /\d/.test(text),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(text),
      isLongEnough: text.length >= 8,
    };
    return (
      check.vietHoa &&
      check.hasNumber &&
      check.hasSpecialChar &&
      check.isLongEnough
    );
  };

  const checTonTaiSDT = async () => {
    try {
      const guiEmail = {
        Email: inEmail.current?.value || "",
      };
      const check = await fetch("http://localhost:3000/dangnhap/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Báo cho Server biết hàng được đóng gói bằng JSON
        },
        body: JSON.stringify(guiEmail),
      });
      const check2 = await check.json();
      if (check2.trangThai === "T") {
        setluuEmail(inEmail.current?.value || "");
        setChon("3");
      } else if (check2.trangThai === "F") setalEmail("EmailKTonTai");
    } catch (err) {
      console.log("loi trong qua trinh goi api");
    }
  };

  const checkEmailTonTaiDeReset = async () => {
    try {
      const emailVal = inEmail.current?.value.trim() || "";
      if (emailVal === "") {
        setalEmail("sdinhDang");
        return;
      }

      const check2 = emailVal.split("@");
      if (check2.length <= 1 || check2[1] === "") {
        setalEmail("sdinhDang");
        return;
      }

      const guiEmail = { Email: emailVal };
      const check = await fetch("http://localhost:3000/dangnhap/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guiEmail),
      });
      const res = await check.json();
      if (res.trangThai === "T") {
        setluuEmail(emailVal);
        setalEmail("vao");

        await fetch("http://localhost:3000/dangnhap/gui-otp-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailVal }),
        });

        setChon("quenMK_2");
        setalOTP("vao");
      } else {
        setalEmail("EmailKTonTai");
      }
    } catch (err) {
      console.log("Lỗi check email đặt lại mật khẩu:", err);
    }
  };

  const xacNhanOTPReset = async () => {
    try {
      const otpVal = inOTP.current?.value.trim() || "";
      const ma = {
        email: luuEmail,
        otp: otpVal,
      };

      const api = await fetch("http://localhost:3000/dangnhap/xac-nhan-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ma),
      });
      const res = await api.json();
      if (res.trangThai === true) {
        setChon("quenMK_3");
        setalMK("vao");
      } else {
        setalOTP("s");
      }
    } catch (err) {
      console.log("Xác nhận OTP reset thất bại:", err);
    }
  };

  const capNhatMatKhauMoi = async () => {
    try {
      const mkMoi = inNewMK.current?.value || "";
      if (!ktmk(mkMoi)) {
        setalMK("s");
        return;
      }

      const api = await fetch(
        "http://localhost:3000/dangnhap/dat-lai-mat-khau",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: luuEmail, newPassword: mkMoi }),
        },
      );
      const res = await api.json();
      if (res.trangThai === "tc") {
        alert(
          "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.",
        );
        setChon("2");
        setalEmail("vao");
      } else {
        alert("Đặt lại mật khẩu thất bại!");
      }
    } catch (err) {
      console.log("Đặt lại mật khẩu thất bại:", err);
    }
  };

  const DangNhap = async (Email: string, mk: string) => {
    try {
      const gui = {
        Email: Email,
        mk: mk,
      };
      const DN = await fetch("http://localhost:3000/dangnhap/dn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gui),
      });

      const DN2 = await DN.json();
      if (DN2.trangThai === "thanhCong") {
        tat();
        console.log(DN2.trangThai);
        console.log(DN2.Token);
        console.log(DN2);
        dangnhap1(DN2.Token);
      }
      return setalMK("sMK");
    } catch (err) {
      console.log("loi khi dang nhap");
    }
  };

  return (
    <section className="w-[100vw] h-[100vh] bg-black/50 fixed z-[100] top-0 flex justify-center items-center ">
      {/* /////////////////////// LỰA CHỌN ////////////////////////// */}
      {Chon === "1" && (
        <div className=" relative flex-col gap-[20px] w-[350px] h-[280px] bg-white rounded-[20px] px-[50px] py-[20px] flex justify-center items-center">
          <img
            onClick={tat}
            className="absolute w-[20px] top-[20px] left-[310px] cursor-pointer"
            src="https://img.icons8.com/?size=100&id=Emle2kcE82Fp&format=png&color=000000"
            alt="tat"
          />
          <img src="/logo.svg" alt="LOGO" />
          <p className="text-center text-[13px]">
            Khám phá E-learning – Nền tảng học và luyện thi thông minh dành cho
            bạn
          </p>
          <button
            onClick={() => {
              setChon("2");
            }}
            className="font-extrabold text-white bg-[#287678] w-full h-[43px] rounded-[10px] flex justify-center items-center"
          >
            ĐĂNG NHẬP
          </button>

          <button
            onClick={() => {
              setChon("dk");
            }}
            className="font-extrabold border border-[#287678]  text-[#287678]  w-full h-[43px] rounded-[10px] flex justify-center items-center"
          >
            ĐĂNG KÝ
          </button>
        </div>
      )}

      {/* ////////////// NHẬP SỐ ĐIỆN THOẠI ////////////////////////// */}

      {/* ////////////// NHẬP SỐ ĐIỆN THOẠI ////////////////////////// */}

      {Chon === "2" && (
        <div className=" relative flex-col gap-[15px] w-[350px] h-[310px] bg-white rounded-[20px] px-[50px] py-[20px] flex justify-center items-center">
          <img
            onClick={tat}
            className="absolute w-[20px] top-[20px] left-[310px] cursor-pointer"
            src="https://img.icons8.com/?size=100&id=Emle2kcE82Fp&format=png&color=000000"
            alt="tat"
          />
          <h2 className="text-[#114A53] font-extrabold text-[20px]">
            ĐĂNG NHẬP
          </h2>
          <p className="text-center w-full text-start text-[13px] mb-[-10px]">
            Email
          </p>

          {alEmail === "vao" && (
            <input
              type="text"
              ref={inEmail}
              placeholder="Nhập Email của bạn"
              className="w-full h-[40px] p-[10px] border border-black/25 rounded-[10px]  text-[13px]"
            />
          )}

          {alEmail === "sdinhDang" && (
            <div className="w-full">
              <input
                type="text"
                ref={inEmail}
                placeholder="Nhập email của bạn"
                className="w-full h-[40px] p-[10px] border border-red-500 rounded-[10px]  text-[13px]"
              />
              <p className="ml-2 mt-1 mb-0 text-red-400 text-[13px]">
                email sai định dạng
              </p>
            </div>
          )}
          {alEmail === "EmailKTonTai" && (
            <div className="w-full">
              <input
                type="text"
                ref={inEmail}
                placeholder="Nhập email của bạn"
                className="w-full h-[40px] p-[10px] border border-red-500 rounded-[10px]  text-[13px]"
              />
              <p className="ml-2 mt-1 mb-0 text-red-400 text-[13px]">
                Email không tồn tại
              </p>
            </div>
          )}

          <p
            onClick={() => {
              setChon("quenMK_1");
              setalEmail("vao");
            }}
            className="text-[12px] text-[#287678] cursor-pointer hover:underline self-end"
          >
            Quên mật khẩu?
          </p>

          <button
            onClick={() => {
              if (checkDinhDangEmail()) {
                checTonTaiSDT();
              }
            }}
            className="font-extrabold text-white bg-[#287678] w-full h-[43px] rounded-[10px] flex justify-center items-center"
          >
            Tiếp Tục
          </button>
        </div>
      )}

      {/* //////////////// NHẬP MẬT KHẨU /////////////////////////// */}
      {Chon === "3" && (
        <div className=" relative flex-col gap-[15px] w-[350px] h-[310px] bg-white rounded-[20px] px-[50px] py-[20px] flex justify-center items-center">
          <img
            onClick={tat}
            className="absolute w-[20px] top-[20px] left-[310px] cursor-pointer"
            src="https://img.icons8.com/?size=100&id=Emle2kcE82Fp&format=png&color=000000"
            alt="tat"
          />
          <h2 className="text-[#114A53] font-extrabold text-[20px]">
            ĐĂNG NHẬP
          </h2>
          <p className="text-center w-full text-start text-[13px] mb-[-10px]">
            Mật Khẩu
          </p>

          {alMK === "vao" && (
            <input
              type="password"
              ref={inMK}
              placeholder="Nhập mật khẩu của bạn"
              className="w-full h-[40px] p-[10px] border border-black/25 rounded-[10px]  text-[13px]"
            />
          )}

          {alMK === "sMK" && (
            <div className="w-full">
              <input
                type="password"
                ref={inMK}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full h-[40px] p-[10px] border border-red-500 rounded-[10px]  text-[13px]"
              />
              <p className="ml-2 mt-1 mb-0 text-red-400 text-[13px]">
                sai mật khẩu
              </p>
            </div>
          )}

          <p
            onClick={() => {
              setChon("quenMK_1");
              setalEmail("vao");
            }}
            className="text-[12px] text-[#287678] cursor-pointer hover:underline self-end"
          >
            Quên mật khẩu?
          </p>

          <button
            onClick={() => {
              DangNhap(luuEmail, inMK.current?.value || "");
            }}
            className="font-extrabold text-white bg-[#287678] w-full h-[43px] rounded-[10px] flex justify-center items-center"
          >
            Tiếp Tục
          </button>
        </div>
      )}

      {/* /////////////////// QUÊN MẬT KHẨU 1: NHẬP EMAIL /////////////////////// */}
      {Chon === "quenMK_1" && (
        <div className=" relative flex-col gap-[20px] w-[350px] h-[280px] bg-white rounded-[20px] px-[50px] py-[20px] flex justify-center items-center">
          <img
            onClick={tat}
            className="absolute w-[20px] top-[20px] left-[310px] cursor-pointer"
            src="https://img.icons8.com/?size=100&id=Emle2kcE82Fp&format=png&color=000000"
            alt="tat"
          />
          <h2 className="text-[#114A53] font-extrabold text-[20px]">
            ĐẶT LẠI MẬT KHẨU
          </h2>
          <p className="text-center w-full text-start text-[13px]">
            Nhập email đã đăng ký của bạn
          </p>

          {alEmail === "vao" && (
            <input
              type="text"
              ref={inEmail}
              placeholder="Nhập Email của bạn"
              className="w-full h-[40px] p-[10px] border border-black/25 rounded-[10px]  text-[13px]"
            />
          )}

          {alEmail === "sdinhDang" && (
            <div className="w-full">
              <input
                type="text"
                ref={inEmail}
                placeholder="Nhập email của bạn"
                className="w-full h-[40px] p-[10px] border border-red-500 rounded-[10px]  text-[13px]"
              />
              <p className="ml-2 mt-1 mb-0 text-red-400 text-[13px]">
                email sai định dạng
              </p>
            </div>
          )}
          {alEmail === "EmailKTonTai" && (
            <div className="w-full">
              <input
                type="text"
                ref={inEmail}
                placeholder="Nhập email của bạn"
                className="w-full h-[40px] p-[10px] border border-red-500 rounded-[10px]  text-[13px]"
              />
              <p className="ml-2 mt-1 mb-0 text-red-400 text-[13px]">
                Email không tồn tại
              </p>
            </div>
          )}
          <button
            onClick={checkEmailTonTaiDeReset}
            className="font-extrabold text-white bg-[#287678] w-full h-[43px] rounded-[10px] flex justify-center items-center"
          >
            Tiếp Tục
          </button>
        </div>
      )}

      {/* /////////////////// QUÊN MẬT KHẨU 2: NHẬP OTP /////////////////////// */}
      {Chon === "quenMK_2" && (
        <div className=" relative flex-col gap-[10px] w-[350px] h-[280px] bg-white rounded-[20px] px-[50px] py-[20px] flex justify-center items-center">
          <img
            onClick={tat}
            className="absolute w-[20px] top-[20px] left-[310px] cursor-pointer"
            src="https://img.icons8.com/?size=100&id=Emle2kcE82Fp&format=png&color=000000"
            alt="tat"
          />
          <h2 className="text-[#114A53] font-extrabold text-[20px]">
            XÁC THỰC OTP
          </h2>
          <p className="text-start w-full  text-[13px]">
            Mã OTP đã được gửi về Email của bạn
          </p>
          <input
            type="text"
            ref={inOTP}
            placeholder="Nhập mã OTP của bạn"
            className={`w-full h-[40px] p-[10px] border  ${alOTP === "vao" ? `border-black/25 rounded-[10px]  text-[13px]` : `border-red-500 rounded-[10px]  text-[13px]`}`}
          />
          {alOTP === "s" && (
            <p className="w-full ml-2 text-start text-red-400 text-[13px]">
              Mã sai hoặc hết hạn
            </p>
          )}
          <button
            onClick={xacNhanOTPReset}
            className="font-extrabold text-white bg-[#287678] w-full h-[43px] rounded-[10px] flex justify-center items-center"
          >
            Xác nhận
          </button>
        </div>
      )}

      {/* /////////////////// QUÊN MẬT KHẨU 3: NHẬP MẬT KHẨU MỚI /////////////////////// */}
      {Chon === "quenMK_3" && (
        <div className=" relative flex-col gap-[10px] w-[350px] h-[280px] bg-white rounded-[20px] px-[50px] py-[20px] flex justify-center items-center">
          <img
            onClick={tat}
            className="absolute w-[20px] top-[20px] left-[310px] cursor-pointer"
            src="https://img.icons8.com/?size=100&id=Emle2kcE82Fp&format=png&color=000000"
            alt="tat"
          />
          <h2 className="text-[#114A53] font-extrabold text-[20px]">
            ĐẶT LẠI MẬT KHẨU
          </h2>
          <p className="text-center w-full text-start text-[11px] leading-tight opacity-75">
            Mật khẩu mới phải có ký tự đặc biệt, tối thiểu 8 ký tự, số và chữ
            cái viết hoa
          </p>

          <input
            type="password"
            ref={inNewMK}
            placeholder="Nhập mật khẩu mới"
            className={`w-full h-[40px] p-[10px] border  ${alMK === "vao" ? `border-black/25 rounded-[10px]  text-[13px]` : `border-red-500 rounded-[10px]  text-[13px]`}`}
          />
          {alMK === "s" && (
            <p className="w-full ml-2 text-start text-red-400 text-[12px]">
              mật khẩu không đủ mạnh
            </p>
          )}

          <button
            onClick={capNhatMatKhauMoi}
            className="font-extrabold text-white bg-[#287678] w-full h-[43px] rounded-[10px] flex justify-center items-center"
          >
            Cập nhật
          </button>
        </div>
      )}

      {Chon === "dk" && <DangKy dangNhap={DangNhap} tat={tat} />}
    </section>
  );
}
