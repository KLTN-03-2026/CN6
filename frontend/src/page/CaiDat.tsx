import { useEffect, useRef, useState } from "react";
import Header from "./componan/header";
import { div, p } from "framer-motion/client";
import Alert from "./componan/aletr";

export default function CaiDat() {
  const [chon, setchon] = useState(1);
  const [chonNgheNghiep, setchonNgheNghiep] = useState("");
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const [dataTK, setdataTK] = useState<any>(null);

  const [DrNgheNghiep, setDrNgheNghiep] = useState(false);

  const inHoTen = useRef<HTMLInputElement>(null);
  const inNamSinh = useRef<HTMLInputElement>(null);
  const inSdt = useRef<HTMLInputElement>(null);

  const inmkCu = useRef<HTMLInputElement>(null);
  const inmkMoi = useRef<HTMLInputElement>(null);
  const inXnMK = useRef<HTMLInputElement>(null);

  const [AlmkCu, setAlmkCu] = useState(false);
  const [AlmkMoi, setAlmkMoi] = useState(false);
  const [AlXnMK, setAlXnMK] = useState(false);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const [DataHD, setDataHD] = useState<any[]>([]);
  const [AlHD, setAlHD] = useState(false);

  const TatThongBao = () => {
    settb(false);
  };
  /// lay dữ liệu tài khoản
  const layDataTK = async () => {
    try {
      const api = await fetch("http://localhost:3000/api/lay-tt-tk", {
        method: "GET",
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const res = await api.json();
      if (res.trangThai === "tc") {
        setdataTK(res.data);
        setchonNgheNghiep(res.data.NgheNghiep);
      }
    } catch (err) {
      console.log("layDataTK thất bại");
    }
  };
  ///cập nhật tài khoản
  const CapNhatTk = async () => {
    try {
      const data = {
        HoTen: inHoTen.current?.value || "",
        NamSinh: inNamSinh.current?.value || "",
        sdt: inSdt.current?.value || "",
        NgheNghiep: chonNgheNghiep,
      };
      console.log(data);
      const api = await fetch("http://localhost:3000/api/cap-nhat-tt-tk", {
        method: "PATCH",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        settb(true);
        settypeTB("ss");
        setNdTB("Cập Nhật Thông Tin Tk Thành Công");
      }
    } catch (err) {
      console.log("cap nhạt tt tk that bai");
    }
  };
  ////cập nhật mật khẩu
  const capNhatMK = async () => {
    let i = 0;
    const mkCu = inmkCu.current?.value || "";
    const mkMoi = inmkMoi.current?.value || "";
    const XnMK = inXnMK.current?.value || "";

    const check = {
      vietHoa: /[A-Z]/.test(mkMoi),
      hasNumber: /\d/.test(mkMoi),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(mkMoi),
      isLongEnough: mkMoi.length >= 8,
    };

    if (
      check.vietHoa &&
      check.hasNumber &&
      check.hasSpecialChar &&
      check.isLongEnough
    ) {
      i++;
      setAlmkMoi(false);
    } else {
      setAlmkMoi(true);
    }

    if (XnMK === mkMoi) {
      i++;
      setAlXnMK(false);
    } else setAlXnMK(true);

    if (i === 2) {
      try {
        const data = {
          mkCu: mkCu,
          mkMoi: mkMoi,
        };
        const api = await fetch("http://localhost:3000/api/doi-mat-khau", {
          method: "PATCH",
          headers: { Authorization: Token, "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const req = await api.json();
        if (req.trangThai === "smk") {
          setAlmkCu(true);
        } else if (req.trangThai === "tc") {
          settb(true);
          settypeTB("ss");
          setNdTB("Cập Nhật Mật Khẩu Thành Công");
          setAlmkCu(false);
        } else if (req.trangThai === "hh") {
          settb(true);
          settypeTB("w");
          setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
          setAlmkCu(false);
        } else {
          settb(true);
          settypeTB("err");
          setNdTB("Cập Nhật Mật Khẩu Thất Bại");
          setAlmkCu(false);
        }
      } catch (err) {
        console.error("loi qua trinh cap nhat mk");
      }
    }
  };
  ///lay dữ liệu hóa Đơn
  const LaydataHD = async () => {
    try {
      const api = await fetch("http://localhost:3000/api/lay-tt-hoaDon", {
        method: "GET",
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setAlHD(true);
        setDataHD(req.data);
      } else if (req.trangThai === "ktt") {
        setAlHD(false);
      }
    } catch (err) {
      console.log("lay data hóa đơn that bại :" + err);
    }
  };
  useEffect(() => {
    layDataTK();
    LaydataHD();
  }, []);

  return (
    <>
      <Header type="hien" />
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      <section className="w-full mt-[30px] justify-center flex">
        {DrNgheNghiep && (
          <div
            onClick={() => {
              setDrNgheNghiep(false);
            }}
            className="w-screen h-screen absolute top-0 left-0  z-[1]"
          ></div>
        )}

        <div
          className="z-[1] w-[800px] p-[30px] bg-white border  border-black/20 rounded-[10px] drop-shadow-[0_5px_10px_rgb(0,0,0,0.2)]
            text-[15px]
        "
        >
          {/* /////phan đầu//// */}
          <div className="flex text-[#13474B] font-medium  pb-[10px]  border-b border-b-black/10">
            <h3
              onClick={() => {
                setchon(1);
              }}
              className={`w-full text-center transition-all duration-300  hover:scale-[1.1] cursor-pointer  py-2 rounded-[10px] flex gap-2 justify-center items-center ${chon === 1 && `bg-[#d8f8ff]`}`}
            >
              <img
                className="h-[20px]"
                src="https://img.icons8.com/?size=100&id=4Sf2GPOpTPre&format=png&color=13474B"
              />
              Hồ Sơ
            </h3>
            <h3
              onClick={() => {
                setchon(2);
              }}
              className={`w-full text-center transition-all duration-300  hover:scale-[1.1] cursor-pointer  py-2 rounded-[10px] flex gap-2 justify-center items-center ${chon === 2 && `bg-[#d8f8ff]`}`}
            >
              <img
                className="h-[20px]"
                src="https://img.icons8.com/?size=100&id=10480&format=png&color=13474B"
              />
              Đổi mật khẩu
            </h3>
            <h3
              onClick={() => {
                setchon(3);
              }}
              className={`w-full text-center transition-all duration-300  hover:scale-[1.1] cursor-pointer  py-2 rounded-[10px] flex gap-2 justify-center items-center ${chon === 3 && `bg-[#d8f8ff]`}`}
            >
              <img
                className="h-[20px]"
                src="https://img.icons8.com/?size=100&id=16405&format=png&color=13474B"
              />
              Lịch sử Thanh toán
            </h3>
          </div>
          {/* ////PHần thân//// */}
          {/* ////Hồ sơ//// */}
          {chon === 1 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-[20px] font-bold w-full text-center mt-[20px]">
                Hồ Sơ
              </h2>
              <p className="font-medium w-full">email </p>
              <p className="w-full p-[10px] border border-black/20 rounded-[10px] focus:outline-none text-black/80">
                {dataTK?.Email}
              </p>
              <div className="w-full flex gap-5">
                <p className="font-medium w-full">Họ Tên </p>
                <p className="font-medium w-full">Năm Sinh </p>
              </div>
              <div className="w-full flex gap-5">
                <input
                  ref={inHoTen}
                  type="text"
                  className="w-full p-[10px] border border-black/20 rounded-[10px] focus:outline-none"
                  defaultValue={dataTK?.HoTen}
                />
                <input
                  ref={inNamSinh}
                  type="number"
                  className="w-full p-[10px] border border-black/20 rounded-[10px] focus:outline-none"
                  defaultValue={dataTK?.NamSinh}
                />
              </div>
              <p className="font-medium w-full">Số Điện Thoại </p>
              <input
                ref={inSdt}
                type="text"
                className="w-full p-[10px] border border-black/20 rounded-[10px] focus:outline-none"
                defaultValue={dataTK?.sdt}
              />

              <p className="font-medium w-full">Nghề Nghiệp </p>

              <div
                onClick={() => {
                  setDrNgheNghiep(true);
                }}
                className="flex items-center cursor-pointer w-full p-[10px] border border-black/20 rounded-[10px] focus:outline-none relative"
              >
                <img
                  src="https://img.icons8.com/?size=100&id=40217&format=png&color=000000"
                  alt=""
                  className={`absolute w-[15px] opacity-75 right-[10px] transition-all duration-200 ${DrNgheNghiep ? `rotate-[-90deg]` : `rotate-[0deg]`} `}
                />
                {chonNgheNghiep}
                {DrNgheNghiep && (
                  <div className=" z-[5] top-[45px] left-[0px] bg-white absolute w-[739px] p-[10px] border border-black/20 rounded-[10px] drop-shadow-[0_5px_5px_rgb(0,0,0,0.2)]">
                    <p
                      onMouseDown={() => {
                        setDrNgheNghiep(false);
                        setchonNgheNghiep("Học sinh & Sinh Viên");
                      }}
                      className="py-1 transition-all duration-300 hover:bg-[#114a53]/25 px-[10px] rounded-[5px]"
                    >
                      Học sinh & Sinh Viên
                    </p>
                    <p
                      onMouseDown={() => {
                        setchonNgheNghiep("Đã đi làm");
                        setDrNgheNghiep(false);
                      }}
                      className="py-1 transition-all duration-300 hover:bg-[#114a53]/25 px-[10px] rounded-[5px]"
                    >
                      Đã đi làm
                    </p>
                    <p
                      onMouseDown={() => {
                        setchonNgheNghiep("Khác");
                        setDrNgheNghiep(false);
                      }}
                      className="py-1 transition-all duration-300 hover:bg-[#114a53]/25 px-[10px] rounded-[5px]"
                    >
                      Khác
                    </p>
                  </div>
                )}
              </div>
              {DrNgheNghiep && (
                <div
                  onClick={() => {
                    setDrNgheNghiep(false);
                  }}
                  className="w-full h-full absolute top-0 left-0  z-[1]"
                ></div>
              )}

              <button
                onClick={() => {
                  CapNhatTk();
                  layDataTK();
                }}
                className="px-[50px] py-[10px] rounded-[10px] bg-[#13474B] text-white font-bold w-fit mx-auto transition-all duration-300 hover:scale-[1.05]"
              >
                Lưu
              </button>
            </div>
          )}

          {/* ////phàn mật khẩu ///// */}

          {chon === 2 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-[20px] font-bold w-full text-center mt-[20px]">
                Đổi mật Khẩu
              </h2>
              <p className="font-medium w-full">Mật Khẩu Cũ </p>
              <input
                ref={inmkCu}
                type="password"
                className={`w-full p-[10px] border border-black/20 rounded-[10px] focus:outline-none ${AlmkCu && `border-red-500 bg-red-50`}`}
                placeholder="Nhập mật khẩu hiện tại của bạn"
              />
              {AlmkCu && (
                <p className="text-[13px] text-red-400">Sai Mật Khẩu</p>
              )}
              <p className="font-medium w-full">Mật Khẩu Mới </p>
              <input
                ref={inmkMoi}
                type="password"
                className={`w-full p-[10px] border border-black/20 rounded-[10px] focus:outline-none ${AlmkMoi && `border-red-500 bg-red-50`}`}
                placeholder="Nhập mật khẩu bạn muốn đổi của bạn"
              />
              {AlmkMoi && (
                <p className="text-[13px] text-red-400">
                  Mật Khẩu không đủ mạnh (mật khẩu phải đủ có ít nhất 8 ký tư,
                  ký tự đặc biệt, chữ viết hoa và số)
                </p>
              )}
              <p className="font-medium w-full">Xác Nhận Lại Mật Khẩu </p>
              <input
                ref={inXnMK}
                type="password"
                className={`w-full p-[10px] border border-black/20 rounded-[10px] focus:outline-none ${AlXnMK && `border-red-500 bg-red-50`}`}
                placeholder="Nhập lại mật khẩu của bạn"
              />
              {AlXnMK && (
                <p className="text-[13px] text-red-400">Mật khẩu không khớp</p>
              )}
              <button
                onClick={() => {
                  capNhatMK();
                  layDataTK();
                }}
                className="px-[50px] py-[10px] rounded-[10px] bg-[#13474B] text-white font-bold w-fit mx-auto transition-all duration-300 hover:scale-[1.05]"
              >
                Lưu
              </button>
            </div>
          )}

          {chon === 3 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-[20px] font-bold w-full text-center mt-[20px] mb-[10px]">
                Lịch Sử Thanh Toán
              </h2>
              {AlHD ? (
                <div>
                  {DataHD?.map((item) => (
                    <div className="p-[10px] border border-black/20 rounded-[10px]">
                      <p className="font-medium text-[17px]">Toic nền Tảng</p>
                      <div className="flex">
                        <p className="w-full">Mã Hóa Đơn: {item.maHoaDon}</p>
                        <p className="w-full">Lớp: {item.TenLop}</p>
                      </div>
                      <div className="flex">
                        <p className="w-full">Thời Gian: {item.Time}</p>
                        <p className="w-full">
                          Tổng Tiền: {item.Gia.toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="w-full text-center">
                  bạn hiên chưa đăng ký học khóa học nào :((
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
