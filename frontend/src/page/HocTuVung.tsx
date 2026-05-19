import { useNavigate, useParams } from "react-router-dom";
import Header from "./componan/header";
import React, { useEffect, useState } from "react";

export default function HocTuVung() {
  const { id } = useParams();
  const [tenTV, settenTV] = useState("");
  
  // Quản lý từ vựng
  const [TuVungGoc, setTuVungGoc] = useState<string[]>([]);
  const [TuVungHienTai, setTuVungHienTai] = useState<string[]>([]);
  const [TuVungHocLai, setTuVUngHocLai] = useState<string[]>([]);
  
  // Trạng thái điều khiển
  const [ViTriTu, setViTriTu] = useState(0);
  const [Animation, setAnimatio] = useState(0);
  const [TextAnimation, setTextAnimation] = useState("");
  const [xoay, setxoay] = useState(false);
  const [TiengAnh, setTiengAnh] = useState("");
  const [TiengViet, setTiengViet] = useState("");
  const [idlophoc, setidlophoc] = useState("");
  const [Tron, setTron] = useState(false);
  const [TuDongDoc, setTuDongDoc] = useState(false);

  const ChuyenTrang = useNavigate();

  // Hàm trộn từ vựng ngẫu nhiên (Fisher-Yates)
  const shuffleArray = (array: string[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const layTuVung = async () => {
    try {
      const api = await fetch(
        `http://localhost:3000/api/lay-tuvung-chitiet/${id}`,
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        setidlophoc(req.data.idLopHoc);
        settenTV(req.data.TenTuVung);
        const list = req.data.tuVung.split("\n").filter((item: string) => item.trim() !== "");
        setTuVungGoc(list);
        setTuVungHienTai(list);
        setViTriTu(0);
        setTron(false);
      }
    } catch (err) {
      console.log("lay từ vựng thất bại :", err);
    }
  };

  const AnimationChuThuoc = () => {
    if (ViTriTu >= TuVungHienTai.length) return;

    setTextAnimation("Chưa Thuộc");
    setAnimatio(1);
    
    // Lưu từ vựng hiện tại đang hiển thị vào mảng học lại
    const tuHienTai = TuVungHienTai[ViTriTu];
    setTuVUngHocLai((prev) => {
      if (prev.includes(tuHienTai)) return prev;
      return [...prev, tuHienTai];
    });

    setTimeout(() => {
      setAnimatio(2);
    }, 300);
    setTimeout(() => {
      setAnimatio(0);
      setViTriTu((prev) => prev + 1);
    }, 600);
  };

  const AnimationDaThuoc = () => {
    if (ViTriTu >= TuVungHienTai.length) return;

    setTextAnimation("Đã Thuộc");
    setAnimatio(3);
    
    setTimeout(() => {
      setAnimatio(4);
    }, 300);
    setTimeout(() => {
      setAnimatio(0);
      setViTriTu((prev) => prev + 1);
    }, 600);
  };

  const HocLai = () => {
    const danhSachMoi = [...TuVungHocLai];
    setTuVungGoc(danhSachMoi);
    setTuVUngHocLai([]);
    setViTriTu(0);
    setxoay(false);
    
    if (Tron) {
      setTuVungHienTai(shuffleArray(danhSachMoi));
    } else {
      setTuVungHienTai(danhSachMoi);
    }
  };

  const clickTron = () => {
    const nextTron = !Tron;
    setTron(nextTron);
    setViTriTu(0);
    setxoay(false);
    
    if (nextTron) {
      setTuVungHienTai(shuffleArray(TuVungGoc));
    } else {
      setTuVungHienTai(TuVungGoc);
    }
  };

  const PhatAm = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ phát âm!");
      return;
    }
    window.speechSynthesis.cancel();

    const tucandoc = new SpeechSynthesisUtterance(text);
    tucandoc.lang = "en-US";
    tucandoc.rate = 0.9;
    tucandoc.pitch = 1;
    window.speechSynthesis.speak(tucandoc);
  };

  // Tự động phát âm khi lật mặt tiếng Anh
  useEffect(() => {
    if (TuDongDoc && !xoay && TiengAnh) {
      const timer = setTimeout(() => {
        PhatAm(TiengAnh);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [xoay, TiengAnh, TuDongDoc]);

  // Lắng nghe phím bàn phím
  useEffect(() => {
    const ChuyenTuBP = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        AnimationDaThuoc();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        AnimationChuThuoc();
      } else if (e.key === " ") {
        e.preventDefault();
        setxoay((prev) => !prev);
      }
    };

    window.addEventListener("keydown", ChuyenTuBP);
    return () => {
      window.removeEventListener("keydown", ChuyenTuBP);
    };
  }, [ViTriTu, TuVungHienTai]);

  useEffect(() => {
    layTuVung();
  }, []);

  // Cập nhật nội dung thẻ khi chỉ mục từ vựng thay đổi
  useEffect(() => {
    const word = TuVungHienTai[ViTriTu];
    if (word) {
      const tu = word.split(":");
      if (tu && tu.length >= 2) {
        setTiengAnh(tu[0].trim());
        setTiengViet(tu[1].trim());
        
        if (TuDongDoc && !xoay) {
          const timer = setTimeout(() => {
            PhatAm(tu[0].trim());
          }, 300);
          return () => clearTimeout(timer);
        }
      }
    }
    setxoay(false);
  }, [ViTriTu, TuVungHienTai]);

  return (
    <>
      <Header type="kthem" />
      
      {ViTriTu < TuVungHienTai.length ? (
        <section className=" [perspective:1000px] flex-col gap-5 relative flex justify-center items-center mx-[10px] h-[calc(100vh-85px)] rounded-[20px] bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F]">
          {/* Header chỉ mục */}
          <div className="absolute top-[-60px] flex flex-col items-center justify-between ">
            <p className="font-bold text-[18px]">{tenTV}</p>
            <p className="font-medium text-black/60">
              {ViTriTu + 1}/{TuVungHienTai.length}
            </p>
          </div>
          
          <div
            onClick={() => {
              ChuyenTrang(-1);
            }}
            className="absolute cursor-pointer top-[-60px] right-[50px] items-center gap-1 text-[#114a53] font-medium text-[18px] flex px-[10px] py-[8px] bg-[#e1eef1] rounded-[10px]"
          >
            <img
              className="w-[25px] h-[25px]"
              src="https://img.icons8.com/?size=100&id=79023&format=png&color=114a53"
              alt=""
            />
            <p>Thoát</p>
          </div>

          {/* Thẻ học từ vựng */}
          <div
            className={`[transform-style:preserve-3d] transition-all duration-700 relative flex-col w-[700px] h-[400px] rounded-[20px] flex items-center justify-center text-[30px]
            ${xoay ? `[transform:rotateX(180deg)]` : ""}
          `}
          >
            {/* Mặt tiếng Anh */}
            <div className="[backface-visibility:hidden] overflow-hidden flex-col absolute w-full h-full bg-white flex justify-center items-center rounded-[10px] shadow-lg">
              <span className="font-bold text-[#114a53]">{TiengAnh}</span>
              {ViTriTu === 0 && (
                <p className="w-full text-white font-medium h-[50px] bg-[#13474b] absolute bottom-0 flex justify-center text-[15px] items-center">
                  Nhấn
                  <span className="px-[10px] py-[5px] text-[#13474b] mx-[5px] bg-[#d8f8ff] rounded-[5px] drop-shadow-[3px_3px_2px_rgb(0,0,0)]">
                    phím cách
                  </span>
                  hoặc nhấp vào thẻ để lật
                </p>
              )}
            </div>
            
            {/* Mặt tiếng Việt */}
            <div className="[backface-visibility:hidden] overflow-hidden absolute [transform:rotateY(180deg)] w-full h-full bg-white flex justify-center items-center rounded-[10px] shadow-lg">
              <p className="[transform:rotate(180deg)] font-semibold text-[#13474b]">{TiengViet}</p>
              {ViTriTu === 0 && (
                <p className="[transform:rotate(180deg)] w-full text-white font-medium h-[50px] bg-[#13474b] absolute top-0 flex justify-center text-[15px] items-center">
                  Nhấn
                  <span className="px-[10px] py-[5px] text-[#13474b] mx-[5px] bg-[#d8f8ff] rounded-[5px] drop-shadow-[3px_3px_2px_rgb(0,0,0)]">
                    ←
                  </span>
                  để học lại hoặc
                  <span className="px-[10px] py-[5px] text-[#13474b] mx-[5px] bg-[#d8f8ff] rounded-[5px] drop-shadow-[3px_3px_2px_rgb(0,0,0)]">
                    →
                  </span>
                  nếu bạn biết câu trả lời
                </p>
              )}
            </div>
          </div>

          {/* Phần animation thuộc và chưa thuộc */}
          <div
            onClick={() => {
              setxoay(!xoay);
            }}
            className={`absolute translate-y-[-30px] flex-col w-[700px] h-[400px] bg-white rounded-[20px] flex items-center justify-center text-[30px] transition-all duration-300 pointer-events-none z-10
              ${Animation === 0 ? "opacity-0" : ""}
              ${Animation === 1 ? "font-bold scale-[1.08] border-[3px] border-[#ff0000] text-[#ff0000] rotate-[-3deg]" : ""}
              ${Animation === 2 ? "font-bold scale-[1.08] border-[3px] border-[#ff0000] text-[#ff0000] rotate-[-3deg] translate-x-[-300px] opacity-0" : ""}
              ${Animation === 3 ? "font-bold scale-[1.08] border-[3px] border-[#539d40] text-[#539d40] rotate-[3deg]" : ""}
              ${Animation === 4 ? "font-bold scale-[1.08] border-[3px] border-[#539d40] text-[#539d40] rotate-[3deg] translate-x-[300px] opacity-0" : ""}
            `}
          >
            <p className="">
              {TextAnimation}
            </p>
          </div>

          {/* Điều khiển dưới thẻ */}
          <div className="flex items-center w-[700px] justify-between gap-5 px-[10px]">
            <div className="flex gap-4">
              {/* Nút trở về 1 từ */}
              <div
                onClick={() => {
                  if (ViTriTu > 0) {
                    setViTriTu(ViTriTu - 1);
                    const xoa = [...TuVungHocLai];
                    xoa.pop();
                    setTuVUngHocLai(xoa);
                  }
                }}
                className="cursor-pointer w-[40px] h-[40px] rounded-[50%] flex items-center justify-center transition-all duration-300 bg-blend-normal hover:bg-[#d8f8ff]/50"
              >
                <img
                  className="w-[50%]"
                  src="https://img.icons8.com/?size=100&id=106516&format=png&color=114a53"
                  alt=""
                />
              </div>

              {/* Nút phát âm */}
              <div
                onClick={() => {
                  PhatAm(TiengAnh);
                }}
                className="cursor-pointer w-[40px] h-[40px] rounded-[50%] flex items-center justify-center transition-all duration-300 bg-blend-normal hover:bg-[#d8f8ff]/50"
              >
                <img
                  className="w-[50%]"
                  src="https://img.icons8.com/?size=100&id=w65ACvDRcNvV&format=png&color=114a53"
                  alt=""
                />
              </div>
            </div>

            <div className="flex gap-5">
              {/* Nút Chưa Thuộc */}
              <button
                onClick={() => {
                  AnimationChuThuoc();
                }}
                className="px-[30px] py-[10px] rounded-[15px] bg-white shadow-sm hover:shadow-md hover:bg-red-50/20 active:scale-95 transition-all"
              >
                <img
                  className="w-[30px]"
                  src="https://img.icons8.com/?size=100&id=79023&format=png&color=FF0000"
                  alt="Chưa thuộc"
                />
              </button>
              
              {/* Nút Đã Thuộc */}
              <button
                onClick={() => {
                  AnimationDaThuoc();
                }}
                className="px-[30px] py-[10px] rounded-[15px] bg-white shadow-sm hover:shadow-md hover:bg-green-50/20 active:scale-95 transition-all"
              >
                <img
                  className="w-[30px]"
                  src="https://img.icons8.com/?size=100&id=OyGfrOzh4XAT&format=png&color=539D40"
                  alt="Đã thuộc"
                />
              </button>
            </div>
            
            <div className="flex gap-4">
              {/* Tự động phát âm */}
              <div
                onClick={() => {
                  setTuDongDoc(!TuDongDoc);
                }}
                className={`cursor-pointer w-[40px] h-[40px] rounded-[50%] border flex items-center justify-center transition duration-300 ${TuDongDoc ? "bg-blend-normal bg-[#d8f8ff]/50 border-[#d8f8ff]" : "border-[#13474b]/20"}`}
              >
                <img
                  className="w-[50%]"
                  src="https://img.icons8.com/?size=100&id=10482&format=png&color=114a53"
                  alt=""
                />
              </div>
              
              {/* Trộn từ vựng */}
              <div
                onClick={() => {
                  clickTron();
                }}
                className={`cursor-pointer w-[40px] h-[40px] rounded-[50%] border flex items-center justify-center transition duration-300 ${Tron ? "bg-blend-normal bg-[#d8f8ff]/50 border-[#d8f8ff]" : "border-[#13474b]/20"}`}
              >
                <img
                  className="w-[70%]"
                  src="https://img.icons8.com/?size=100&id=9986&format=png&color=114a53"
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className=" [perspective:1000px] flex-col gap-5 relative flex justify-center items-center mx-[10px] h-[calc(100vh-85px)] rounded-[20px] bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F]">
          {/* Màn hình hoàn thành */}
          <div className="w-[700px] p-[80px] bg-white rounded-[20px] gap-3 flex flex-col justify-center items-center shadow-2xl">
            <div className="w-[100px] h-[100px] rounded-[50%] bg-[#d8f8ff] flex items-center justify-center">
              <img
                className="w-[65%]"
                src="https://img.icons8.com/?size=100&id=2koI9uU0dBK7&format=png&color=13474b"
                alt=""
              />
            </div>
            <p className="font-extrabold text-[25px] text-[#13474b]">
              HOÀN THÀNH
            </p>
            <p className="text-gray-500 font-medium">Bạn đã học hết toàn bộ từ vựng!</p>
            
            {TuVungHocLai.length > 0 && (
              <button
                onClick={() => {
                  HocLai();
                }}
                className="w-[300px] gap-3 px-[10px] py-[10px] rounded-[10px] bg-[#13474b] hover:bg-[#1a5b60] transition-colors flex justify-center items-center text-white font-medium shadow-md"
              >
                <img
                  className="w-[25px]"
                  src="https://img.icons8.com/?size=100&id=NkMivaNIpaNp&format=png&color=FFFFFF"
                  alt=""
                />
                <p>Học lại từ chưa nhớ ({TuVungHocLai.length})</p>
              </button>
            )}

            <button
              onClick={() => {
                ChuyenTrang(-1);
              }}
              className={`w-[300px] gap-3 px-[10px] py-[10px] rounded-[10px] border border-[#13474b] flex justify-center items-center font-medium transition-colors ${TuVungHocLai.length > 0 ? "bg-white text-[#13474b] hover:bg-gray-50" : "bg-[#13474b] text-white hover:bg-[#1a5b60]"}`}
            >
              <img
                className="w-[25px]"
                src={`https://img.icons8.com/?size=100&id=40217&format=png&color=${TuVungHocLai.length > 0 ? "13474b" : "FFFFFF"}`}
                alt=""
              />
              <p>Về trang từ vựng</p>
            </button>
          </div>
        </section>
      )}
    </>
  );
}
