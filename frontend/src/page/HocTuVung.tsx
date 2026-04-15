import { useNavigate, useParams } from "react-router-dom";
import Header from "./componan/header";
import React, { useEffect, useState } from "react";
import { p } from "framer-motion/client";

export default function HocTuVung() {
  const { id } = useParams();
  const [tenTV, settenTV] = useState("");
  const [TuVung, setTuVUng] = useState<string[]>([]);
  const [TuVungTron, setTuVUngTron] = useState<string[]>([]);
  const [TuVungHocLai, setTuVUngHocLai] = useState<string[]>([]);
  const [ViTriTu, setViTriTu] = useState(1);
  const [Animation, setAnimatio] = useState(0);
  const [TextAnimation, setTextAnimation] = useState("");
  const [xoay, setxoay] = useState(false);
  const [TiengAnh, setTiengAnh] = useState("");
  const [TiengViet, setTiengViet] = useState("");
  const [idlophoc, setidlophoc] = useState("");
  const [Tron, setTron] = useState(false);

  const [TuDongDoc, setTuDongDoc] = useState(false);

  const ChuyenTrang = useNavigate();

  const layTuVung = async () => {
    try {
      const api = await fetch(
        `http://localhost:3000/api/lay-tuvung-chitiet/${id}`,
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        setidlophoc(req.data.idLopHoc);
        settenTV(req.data.TenTuVung);
        setTuVUng(req.data.tuVung.split("\n"));
        setViTriTu(0);
        // const tu1 = req.data.tuVung.split("\n");
        // const tu = tu1[0].split(":");
        // if (tu) {
        //   setTiengAnh(tu[0]);
        //   setTiengViet(tu[1]);
        // }
      }
    } catch (err) {
      console.log("lay từ vựng thất bại :" + err);
    }
  };

  const AnimationChuThuoc = () => {
    setTextAnimation("Chưa Thuộc");
    setViTriTu(ViTriTu + 1);
    setAnimatio(1);
    setTuVUngHocLai((prev) => [...prev, TuVung[ViTriTu]]);
    setTimeout(() => {
      setAnimatio(2);
    }, 300);
    setTimeout(() => {
      setAnimatio(0);
    }, 600);
  };

  const AnimationDaThuoc = () => {
    setTextAnimation("Đã Thuộc");
    setViTriTu(ViTriTu + 1);
    setAnimatio(3);
    setTimeout(() => {
      setAnimatio(4);
    }, 300);
    setTimeout(() => {
      setAnimatio(0);
    }, 600);
  };

  const HocLai = () => {
    setTuVUng(TuVungHocLai);
    setTuVUngHocLai([]);
    setTron(false);

    setViTriTu(0);
  };

  const clickTron = () => {
    setTron(!Tron);
    console.log(Tron);
    if (Tron) {
      const tu = TuVung[ViTriTu]?.split(":");
      if (tu) {
        setTiengAnh(tu[0]);
        setTiengViet(tu[1]);
      }
    } else {
      const tu = TuVungTron[ViTriTu]?.split(":");
      if (tu) {
        setTiengAnh(tu[0]);
        setTiengViet(tu[1]);
      }
    }
  };

  const PhatAm = (text: string) => {
    if (!("SpeechSynthesis" in window)) {
      alert("trinh duyet cua ban khong ho tro doc");
      return;
    }
    window.speechSynthesis.cancel();

    const tucandoc = new SpeechSynthesisUtterance(text);
    tucandoc.lang = "en-US";
    tucandoc.rate = 0.9;
    tucandoc.pitch = 1;
    window.speechSynthesis.speak(tucandoc);
  };

  useEffect(() => {
    if (TuDongDoc) {
      if (!xoay) {
        setTimeout(() => {
          PhatAm(TiengAnh);
        }, 300);
      }
    }
  }, [xoay]);

  useEffect(() => {
    const ChuyenTuBP = (e: KeyboardEvent) => {
      e.preventDefault();

      if (e.key === "ArrowRight") {
        AnimationDaThuoc();
        setViTriTu(ViTriTu + 1);
      } else if (e.key === "ArrowLeft") {
        AnimationChuThuoc();
        setViTriTu(ViTriTu + 1);
      } else if (e.key === " ") {
        setxoay(!xoay);
      }
    };

    window.addEventListener("keydown", ChuyenTuBP);

    return () => {
      window.removeEventListener("keydown", ChuyenTuBP);
    };
  });

  useEffect(() => {
    layTuVung();
  }, []);

  useEffect(() => {
    if (!Tron) {
      const tu = TuVung[ViTriTu]?.split(":");
      if (tu) {
        setTiengAnh(tu[0]);
        setTiengViet(tu[1]);
        if (TuDongDoc) {
          if (!xoay) {
            setTimeout(() => {
              PhatAm(tu[0]);
            }, 300);
          }
        }
      }
    } else {
      const tu = TuVungTron[ViTriTu]?.split(":");
      if (tu) {
        setTiengAnh(tu[0]);
        setTiengViet(tu[1]);
        if (TuDongDoc) {
          if (!xoay) {
            setTimeout(() => {
              PhatAm(tu[0]);
            }, 300);
          }
        }
      }
    }

    setxoay(false);
  }, [ViTriTu]);

  useEffect(() => {
    const TuVungTR = [...TuVung];

    for (let i = TuVungTR.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [TuVungTR[i], TuVungTR[j]] = [TuVungTR[j], TuVungTR[i]];
    }
    setTuVUngTron([...TuVungTR]);
    console.log(TuVungTR);
    console.log(TuVung);
  }, [TuVung]);

  return (
    <>
      <Header type="kthem" />
      {/* //////// phần học từ vựng ///////////////// */}
      {ViTriTu < TuVung.length ? (
        <section className=" [perspective:1000px] flex-col gap-5   relative flex justify-center items-center mx-[10px]  h-[calc(100vh-85px)] rounded-[20px] bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F]">
          {/* //// phần  số từ vựng trên header /////// */}
          <div className="absolute  top-[-60px] flex flex-col items-center justify-between ">
            <p className="font-bold text-[18px]">{tenTV}</p>
            <p>
              {ViTriTu + 1}/{TuVung.length}
            </p>
          </div>
          <div
            onClick={() => {
              ChuyenTrang(`/HocVien/QlLopHoc/${idlophoc}`);
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

          {/* ////////// phần thẻ từ vựng //////////////////// */}
          <div
            className={`[transform-style:preserve-3d]  transition-all duration-700 relative flex-col w-[700px] h-[400px] rounded-[20px] flex items-center justify-center text-[30px]
            ${xoay && `[transform:rotateX(180deg)]`}
          `}
          >
            <div className="[backface-visibility:hidden] overflow-hidden flex-col absolute w-full h-full bg-white flex justify-center items-center rounded-[10px]">
              {TiengAnh}
              {ViTriTu === 0 && (
                <p className="w-full text-white font-medium h-[50px] bg-[#13474b] absolute bottom-0 flex justify-center text-[15px] items-center">
                  Nhấn{" "}
                  <span className="px-[10px] py-[5px] text-[#13474b] mx-[5px] bg-[#d8f8ff] rounded-[5px] drop-shadow-[3px_3px_2px_rgb(0,0,0)]">
                    {" "}
                    phím cách{" "}
                  </span>{" "}
                  hoặc nhấp vào thẻ để lật
                </p>
              )}
            </div>
            <div className="[backface-visibility:hidden] overflow-hidden absolute [transform:rotateY(180deg)] w-full h-full bg-white flex justify-center items-center rounded-[10px]">
              <p className="[transform:rotate(180deg)]">{TiengViet}</p>
              {ViTriTu === 0 && (
                <p className="[transform:rotate(180deg)]  w-full text-white font-medium h-[50px] bg-[#13474b] absolute top-0 flex justify-center text-[15px] items-center">
                  Nhấn
                  <span className="px-[10px] py-[5px] text-[#13474b] mx-[5px] bg-[#d8f8ff] rounded-[5px] drop-shadow-[3px_3px_2px_rgb(0,0,0)]">
                    {" "}
                    ←{" "}
                  </span>{" "}
                  để học lại hoặc
                  <span className="px-[10px] py-[5px]  text-[#13474b] mx-[5px] bg-[#d8f8ff] rounded-[5px] drop-shadow-[3px_3px_2px_rgb(0,0,0)]">
                    {" "}
                    →{" "}
                  </span>{" "}
                  nếu bạn biết câu trả lời{" "}
                </p>
              )}
            </div>
          </div>

          {/* ////////////// phần animatio thuộc và chưa thuộc /////////////// */}
          <div
            onClick={() => {
              setxoay(!xoay);
            }}
            className={`absolute translate-y-[-30px] flex-col w-[700px] h-[400px] bg-white rounded-[20px] flex items-center justify-center text-[30px] transition-all duration-300 
            
            
              ${Animation === 0 && `opacity-0`}
            ${Animation === 1 && `font-bold scale-[1.08] border-[3px] border-[#ff0000] text-[#ff0000] rotate-[-3deg] `}
            ${Animation === 2 && `font-bold  scale-[1.08] border-[3px] border-[#ff0000] text-[#ff0000] rotate-[-3deg] translate-x-[-300px] opacity-[0]`}
            ${Animation === 3 && `font-bold  scale-[1.08] border-[3px] border-[#539d40] text-[#539d40] rotate-[3deg] `}
            ${Animation === 4 && `font-bold  scale-[1.08] border-[3px] border-[#539d40] text-[#539d40] rotate-[3deg] translate-x-[300px] opacity-[0]`}
            `}
          >
            <p className={`${xoay && `[transform:rotateX(-180deg)]`} `}>
              {TextAnimation}
            </p>
          </div>

          {/* ////////////// phần nút nhất phía ở dưới /////////////// */}

          <div className="flex items-center  w-[700px] justify-between gap-5 px-[10px]">
            {/* nut tro ve 1 tu */}
            <div className="flex gap-4">
              <div
                onClick={() => {
                  if (ViTriTu > 0) {
                    setViTriTu(ViTriTu - 1);
                    const xoa = [...TuVungHocLai];
                    xoa.pop();
                    setTuVUngHocLai(xoa);
                  }
                }}
                className="cursor-pointer w-[40px] h-[40px] rounded-[50%]  flex items-center justify-center transition-all duration-300 bg-blend-normal hover:bg-[#d8f8ff]/50"
              >
                <img
                  className="w-[50%]"
                  src="https://img.icons8.com/?size=100&id=106516&format=png&color=114a53"
                  alt=""
                />
              </div>

              {/* nut doc phat am */}
              <div
                onClick={() => {
                  PhatAm(TiengAnh);
                }}
                className="cursor-pointer w-[40px] h-[40px] rounded-[50%]  flex items-center justify-center  transition-all duration-300 bg-blend-normal hover:bg-[#d8f8ff]/50"
              >
                <img
                  className="w-[50%]"
                  src="https://img.icons8.com/?size=100&id=w65ACvDRcNvV&format=png&color=114a53"
                  alt=""
                />
              </div>
            </div>

            <div className="flex gap-5">
              {/* nut chua thuoc */}
              <button
                onClick={() => {
                  setViTriTu(ViTriTu + 1);

                  AnimationChuThuoc();
                }}
                className="px-[30px] py-[10px] rounded-[15px] bg-white"
              >
                <img
                  className="w-[30px]"
                  src="https://img.icons8.com/?size=100&id=79023&format=png&color=FF0000"
                  alt="anh chưa thuộc"
                />
              </button>
              {/* nut da thuoc */}
              <button
                onClick={() => {
                  setViTriTu(ViTriTu + 1);
                  AnimationDaThuoc();
                }}
                className="px-[30px] py-[10px] rounded-[15px] bg-white"
              >
                <img
                  className="w-[30px]"
                  src="https://img.icons8.com/?size=100&id=OyGfrOzh4XAT&format=png&color=539D40"
                  alt="anh đã thuộc"
                />
              </button>
            </div>
            <div className="flex gap-4">
              {/* nut set tu dong doc */}
              <div
                onClick={() => {
                  setTuDongDoc(!TuDongDoc);
                }}
                className={`cursor-pointer w-[40px] h-[40px] rounded-[50%] border  flex items-center justify-center transition duration-300 ${TuDongDoc ? `bg-blend-normal bg-[#d8f8ff]/50 border-[#d8f8ff] ` : `border-[#13474b]/20 `}`}
              >
                <img
                  className="w-[50%]"
                  src="https://img.icons8.com/?size=100&id=10482&format=png&color=114a53"
                  alt=""
                />
              </div>
              {/* nut tron tu vung */}
              <div
                onClick={() => {
                  clickTron();
                }}
                className={`cursor-pointer w-[40px] h-[40px] rounded-[50%] border  flex items-center justify-center transition duration-300 ${Tron ? `bg-blend-normal bg-[#d8f8ff]/50 border-[#d8f8ff] ` : `border-[#13474b]/20 `}`}
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
        <section className=" [perspective:1000px] flex-col gap-5   relative flex justify-center items-center mx-[10px]  h-[calc(100vh-85px)] rounded-[20px] bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F]">
          {/* ///////// phần khi hét từ vựng ///////////// */}
          <div className="w-[700px]  p-[80px] bg-white rounded-[20px] gap-3 flex flex-col justify-center items-center">
            <div className="w-[100px] h-[100px] rounded-[50%] bg-[#d8f8ff]  flex items-center justify-center">
              <img
                className="w-[65%]"
                src="https://img.icons8.com/?size=100&id=2koI9uU0dBK7&format=png&color=13474b"
                alt=""
              />
            </div>
            <p className="font-extrabold text-[25px] text-[#13474b]">
              HOÀN THÀNH
            </p>
            <p>bạn đã học hết toàn bộ từ vựng</p>
            {TuVungHocLai.length > 0 && (
              <button
                onClick={() => {
                  HocLai();
                }}
                className="w-[300px] gap-3 px-[10px] py-[10px] rounded-[10px] bg-[#13474b] flex justify-center items-center text-white font-medium"
              >
                <img
                  className="w-[25px]"
                  src="https://img.icons8.com/?size=100&id=NkMivaNIpaNp&format=png&color=FFFFFF"
                  alt=""
                />
                <p>Học lại từ chưa nhớ</p>
              </button>
            )}

            <button
              onClick={() => {
                ChuyenTrang(`/HocVien/QlLopHoc/${idlophoc}`);
              }}
              className={`w-[300px] gap-3 px-[10px] py-[10px] rounded-[10px] border border-[#13474b] flex justify-center items-center  font-medium ${TuVungHocLai.length > 0 ? `bg-white text-[#13474b]` : `bg-[#13474b] text-white`}`}
            >
              <img
                className="w-[25px]"
                src={`https://img.icons8.com/?size=100&id=40217&format=png&color=${TuVungHocLai.length > 0 ? `13474b` : `FFFFFF`}`}
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
