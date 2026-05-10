import Header from "./componan/header";
import { param } from "framer-motion/client";
import Footed from "./componan/footed";

import TuVan from "./componan/tuvan";
import { motion } from "framer-motion";
import { data, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Alert from "./componan/aletr";
import ChatBot from "./componan/ChatBot";
import { BACKEND_URL } from "./FileThongso";
import BoxXacNhan from "./componan/BoxXacNhan";

export default function ThemChinhSuaKH() {
  const [Data, setData] = useState<any>();
  const { id } = useParams();
  const [dr, setdr] = useState(false);
  const [BoxLinkAnh, setBoxLinkAnh] = useState(false);
  const [Anh, setAnh] = useState("/hsCB.jpeg");
  const [AlInputLinkAnh, setALinputLinkAnh] = useState(false);

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const InputTenKhoaHoc = useRef<HTMLInputElement>(null);
  const InputDauRa = useRef<HTMLInputElement>(null);
  const InputMoTa = useRef<HTMLTextAreaElement>(null);
  const InputPhuHop = useRef<HTMLInputElement>(null);
  const InputGia = useRef<HTMLInputElement>(null);
  const InputLinkAnh = useRef<HTMLInputElement>(null);
  const InputQuyenLoi = useRef<HTMLTextAreaElement>(null);
  const InputPhuongPhap = useRef<HTMLTextAreaElement>(null);
  const InputKetQua = useRef<HTMLTextAreaElement>(null);
  const [trangThai, setTrangThai] = useState("Đang Hoạt Động");

  const ChuyenTrang = useNavigate();

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const [xn, setxn] = useState(false);
  const tatxn = () => {
    setxn(false);
  };

  const layData = async (idkhoaHoc: any) => {
    try {
      const api = await fetch(`${BACKEND_URL}/ChiTietKhoaHoc/${idkhoaHoc}`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setData(req.dulieu);
        setAnh(req.dulieu.Image);
        setTrangThai(req.dulieu.trangThai);
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w"); // w , err
        setNdTB("phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("lay data khóa học thất bại: " + err);
    }
  };

  const luu = async () => {
    const TenKhoaHoc = InputTenKhoaHoc.current?.value.trim() || "";
    const DauRa = InputDauRa.current?.value.trim() || "";
    const MoTa = InputMoTa.current?.value.trim() || "";
    const PhuHop = InputPhuHop.current?.value.trim() || "";
    const Gia = InputGia.current?.value.trim() || "";
    const QuyenLoi = InputQuyenLoi.current?.value.trim() || "";
    const PhuongPhap = InputPhuongPhap.current?.value.trim() || "";
    const KetQua = InputKetQua.current?.value.trim() || "";

    if (
      (TenKhoaHoc &&
        DauRa &&
        MoTa &&
        PhuHop &&
        Gia &&
        QuyenLoi &&
        PhuongPhap &&
        KetQua) !== ""
    ) {
      const data = {
        TenKhoaHoc: TenKhoaHoc,
        DauRa: DauRa,
        MoTa: MoTa,
        PhuHop: PhuHop,
        Gia: Gia,
        Image: Anh,
        QuyenLoi: QuyenLoi,
        PhuongPhap: PhuongPhap,
        KetQua: KetQua,
        trangThai: trangThai,
      };
      if (id !== "them") {
        ///// cập nhật khóa học
        try {
          const api = await fetch(`${BACKEND_URL}/capNhatKhoaHoc/${id}`, {
            method: "PATCH",
            headers: {
              Authorization: Token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          const req = await api.json();
          if (req.trangThai === "hh") {
            settb(true);
            settypeTB("w"); // w , err
            setNdTB("phiên đăng nhập hết hạn vui lòng đăng nhập lại");
          } else if (req.trangThai === "kdtq") {
            settb(true);
            settypeTB("w"); // w , err
            setNdTB("Bạn không đủ thẩm quyền đẻ thực hiện chức năng này");
          } else if (req.trangThai === "tc") {
            ChuyenTrang(-1);
          }
        } catch (err) {
          console.log("cập nhật khóa học thất bại");
        }
      } else {
        try {
          // thêm khóa học
          const api = await fetch(`${BACKEND_URL}/ThemKhoaHoc`, {
            method: "POST",
            headers: {
              Authorization: Token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          const req = await api.json();
          if (req.trangThai === "hh") {
            settb(true);
            settypeTB("w"); // w , err
            setNdTB("phiên đăng nhập hết hạn vui lòng đăng nhập lại");
          } else if (req.trangThai === "kdtq") {
            settb(true);
            settypeTB("w"); // w , err
            setNdTB("Bạn không đủ thẩm quyền đẻ thực hiện chức năng này");
          } else if (req.trangThai === "tc") {
            ChuyenTrang(-1);
          }
        } catch (err) {
          console.log("thêm khóa học thất bại");
        }
      }
    } else {
      settb(true);
      settypeTB("w"); // w , err
      setNdTB("các ô không được để trống");
    }
  };

  const xoa = async () => {
    if (id !== "them") {
      try {
        const api = await fetch(`${BACKEND_URL}/xoaKhoaHoc/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: Token,
            "Content-Type": "application/json",
          },
        });
        const req = await api.json();
        if (req.trangThai === "tb") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Xóa khóa học THẤT BẠI");
        } else if (req.trangThai === "ktt") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("ID khóa học không tồn tại");
        } else if (req.trangThai === "kdtq") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Chỉ có Admin mới được sử dụng chức năng này");
        } else if (req.trangThai === "dangCoLop") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Khóa học đang có lớp hoạt động");
          setTrangThai("Đang Ẩn");
        } else if (req.trangThai === "tc") {
          ChuyenTrang(-1);
        }
      } catch (err) {
        console.log("xóa khóa học thất bại :" + err);
      }
    } else {
      settb(true);
      settypeTB("err"); // w , err
      setNdTB("khóa học vẩn đang trong quá trình khởi tạo");
    }
  };

  useEffect(() => {
    if (id !== "them") {
      layData(id);
    }
  }, []);
  return (
    <>
      <Header type="khien" />
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      <div className="relative">
        {xn && (
          <BoxXacNhan tat={tatxn} xoa={xoa} noiDung="Xác nhận xóa khóa học" />
        )}
        {dr && (
          <div
            onClick={() => {
              setdr(false);
            }}
            className="w-screen h-screen fixed  z-[2] top-0"
          ></div>
        )}
        {/* box thêm link ảnh */}
        {BoxLinkAnh && (
          <div className="w-screen h-screen bg-black/50 fixed top-0 z-[3] flex justify-center items-center">
            <div className="w-[500px] p-[30px] bg-white rounded-[10px] relative">
              <h2 className="w-full text-center font-bold text-[20px] text-[#114a53]">
                Thêm link ảnh
              </h2>
              <input
                ref={InputLinkAnh}
                defaultValue={Anh}
                className={`w-full mt-[10px] p-[10px] border  rounded-[10px] focus:outline-none ${AlInputLinkAnh ? `border-red-600` : `border-black/20`}`}
                type="text"
              />
              {AlInputLinkAnh && (
                <p className="text-red-500 mt-[10px] text-[15px] ml-[5px]">
                  Ô này không được để trống
                </p>
              )}
              <button
                onClick={() => {
                  const linkanh = InputLinkAnh.current?.value.trim() || "";
                  if (linkanh === "") {
                    setALinputLinkAnh(true);
                  } else {
                    setALinputLinkAnh(false);
                    const xacNhanid = linkanh.split(".")[0];
                    if (xacNhanid === "https://drive") {
                      const layidDriver1 = linkanh.split("/d/")[1];
                      const layidDriver2 = layidDriver1.split("/view")[0];
                      setAnh(
                        `https://lh3.googleusercontent.com/d/${layidDriver2}`,
                      );
                    } else {
                      setAnh(linkanh);
                    }
                    setBoxLinkAnh(false);
                  }
                }}
                className="w-full py-[10px] text-white font-bold mt-[10px] bg-[#114a53] rounded-[10px]"
              >
                THÊM
              </button>
              <img
                onClick={() => {
                  setBoxLinkAnh(false);
                }}
                className="cursor-pointer w-[20px] absolute top-[20px] right-[20px]"
                src="https://img.icons8.com/?size=100&id=46&format=png&color=000000"
                alt=""
              />
            </div>
          </div>
        )}

        {/* điều khiển sửa xóa */}
        <div className="flex justify-center m-[20px] sticky top-[70px] z-[2]">
          <div className=" w-fit flex gap-2  bg-white border border-black/20 rounded-[10px] p-[10px] shadow-[0_5px_15px_rgb(18,19,20,0.15)]">
            {dr && (
              <div
                onClick={() => {
                  setdr(false);
                }}
                className="w-full h-full  absolute top-0 right-0"
              ></div>
            )}
            <div
              onClick={() => {
                setdr(true);
              }}
              className={`transition-all duration-300 relative w-[200px] flex justify-between cursor-pointer  gap-2  items-center p-[10px]  rounded-[10px] text-white font-bold ${trangThai === "Đang Hoạt Động" ? "bg-[#018531]" : `bg-[#e03d3a]`}`}
            >
              <p>{trangThai}</p>
              <img
                className={`h-[20px] transition-all duration-300  ${dr ? ` rotate-0` : `rotate-[90deg]`}`}
                src="https://img.icons8.com/?size=100&id=87356&format=png&color=ffffff"
                alt=""
              />
              {dr && (
                <div className="left-0 w-full py-[10px] absolute top-[45px] bg-white border border-black/20 rounded-[10px] text-black font-normal ">
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setTrangThai("Đang Hoạt Động");
                      setdr(false);
                    }}
                    className="px-[10px] py-[5px] transition-all duration-300 hover:bg-[#c3d2d4]"
                  >
                    Đang Hoạt Động
                  </p>
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setdr(false);
                      setTrangThai("Đang Ẩn");
                    }}
                    className="px-[10px] py-[5px] transition-all duration-300 hover:bg-[#f0cdcc]"
                  >
                    Đang Ẩn
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                luu();
              }}
              className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] text-white rounded-[10px] font-bold bg-[#13474b]"
            >
              Lưu
            </button>
            <button
              onClick={() => {
                setxn(true);
              }}
              className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] text-white rounded-[10px] font-bold bg-[#a90c07]"
            >
              Xóa
            </button>
          </div>
        </div>

        <section className="mx-[20px] bg-[#d8f8ff] h-[680px] rounded-[20px] p-[20px] flex justify-between ">
          <div className="p-[50px] flex flex-col gap-[20px] w-[880.61px] ">
            <input
              ref={InputTenKhoaHoc}
              type="text"
              defaultValue={`${Data?.TenKhoaHoc || ""}`}
              className="p-[10px] caret-black focus:outline-none border border-black/20 rounded-[10px] w-full font-extrabold text-[40px] bg-gradient-to-b from-[#287678] to-[#4ADADE] bg-clip-text text-transparent"
            />

            <div className="text-[20px] text-[#2A6770] px-[15px] py-[10px] bg-[rgba(175,208,217,0.5)] w-fit rounded-[10px]">
              Đầu ra :{" "}
              <input
                ref={InputDauRa}
                type="text"
                defaultValue={`${Data?.DauRa || ""}`}
                className="font-bold focus:outline-none w-fit text-[#0D2A2E] border border-black/20 rounded-[10px] p-[10px]"
              />{" "}
            </div>
            <textarea
              ref={InputMoTa}
              defaultValue={`${Data?.MoTa || ""}`}
              name=""
              id=""
              className="p-[10px] rounded-[10px] focus:outline-none text-[20px] font-normal text-[#0D2A2E] h-[230px] whitespace-pre-line"
            ></textarea>
            <p className="text-[23px] font-bold text-[#13474B]">
              → Phù hợp với:{" "}
              <input
                ref={InputPhuHop}
                defaultValue={`${Data?.PhuHop || ""}`}
                type="text"
                className="w-[600px] h-[40px] border border-black/20 p-[10px] rounded-[10px]"
              />
            </p>
            <div className="flex justify-between">
              <button className="p-[20px] rounded-[20px] bg-[#0D2A2E] text-white font-bold transition-all duration-300 hover:scale-[1.05]">
                DĂNG KÝ HỌC NGAY →
              </button>
              <p className="text-[40px] bg-gradient-to-t from-[#F34641] to-[#8D2926] bg-clip-text text-transparent font-extrabold">
                <input
                  ref={InputGia}
                  defaultValue={`${Data?.Gia || ""}`}
                  type="number"
                  className="w-[350px] border border-black/20 rounded-[10px] text-black p-[5px]"
                />{" "}
                VND
              </p>
            </div>
          </div>
          <div
            onClick={() => {
              setBoxLinkAnh(true);
            }}
            className="h-full flex justify-center items-center overflow-hidden rounded-[20px] w-[475px] bg-slate-400 relative"
          >
            <div className="w-full flex justify-center items-center text-white text-[30px] font-bold h-full cursor-pointer bg-black/70 absolute opacity-0 transition-all duration-300 hover:opacity-[1]">
              Thêm ảnh
            </div>
            <img className="h-full " src={`${Anh}`} alt="anh" />
          </div>
        </section>

        {/* ////////////////////QUYỀN LỢI ////////////////////////// */}

        <section className="flex m-[40px] gap-[200px] justify-center items-center">
          <div className="w-[400.69px]">
            <img src="/quyenloi.png" alt="anh" className="h-full" />
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-extrabold text-[40px] bg-gradient-to-t from-[#4ADADE] to-[#287678] bg-clip-text text-transparent">
              Quền Lợi
            </p>

            <textarea
              ref={InputQuyenLoi}
              defaultValue={`${Data?.QuyenLoi || ""}`}
              className="text-[23px]  text-[#0D2A2E]  leading-7 whitespace-pre-line border border-black/20 rounded-[10px] w-[450px] p-[10px] h-[300px]"
            ></textarea>
          </div>
        </section>
        {/* //////////////////////////////////////////////////////////////////////////////// */}

        <section className="py-[50px] mx-[10px] flex gap-[80px] justify-center">
          <div className="w-[510px]  p-[10px] bg-white border border-black/15 drop-shadow-[0_5px_10px_rgb(0,0,0,0.25)] rounded-[20px]">
            <div className="w-full p-[10px] bg-[#D8F8FF] rounded-[20px] h-full">
              <h2 className=" w-full text-[40px] font-extrabold bg-gradient-to-t from-[#4ADADE] to-[#287678] bg-clip-text text-transparent text-center">
                Phương pháp học:
              </h2>
              <textarea
                ref={InputPhuongPhap}
                defaultValue={`${Data?.PhuongPhap || ""}`}
                className="p-[10px] leading-[40px] mt-[20px] text-[20px] mx-[10px] whitespace-pre-line w-[95%] border border-black/20 rounded-[10px] h-[150px]"
              ></textarea>
            </div>
          </div>

          <div className="w-[510px]  p-[10px] bg-white border border-black/15 drop-shadow-[0_5px_10px_rgb(0,0,0,0.25)] rounded-[20px]">
            <div className="w-full p-[10px] bg-[#D8F8FF] rounded-[20px] h-full">
              <h2 className="w-full text-[40px] font-extrabold bg-gradient-to-t from-[#4ADADE] to-[#287678] bg-clip-text text-transparent text-center">
                Kết quả đạt được::
              </h2>
              <textarea
                ref={InputKetQua}
                defaultValue={`${Data?.KetQua || ""}`}
                className="p-[10px] leading-[40px] mt-[20px] text-[20px] mx-[10px] whitespace-pre-line w-[95%] border border-black/20 rounded-[10px] h-[150px]"
              ></textarea>
            </div>
          </div>
        </section>
      </div>

      {/* ///////////////////////////////////////////////////////////////////// */}
    </>
  );
}
