import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "./aletr";
import { BACKEND_URL } from "../FileThongso";

interface ThemSuaVideoProps {
  tatThemVideo: () => void;
  type: string;
  layVideo: () => void;
  idVideo: string;
  idKhoaHoc?: string;
}

export default function ThemSuaVideo({
  tatThemVideo,
  type,
  layVideo,
  idVideo,
  idKhoaHoc,
}: ThemSuaVideoProps) {
  const params = useParams();
  const id = idKhoaHoc || params.id;
  const [Token, setToken] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const inTenVideo = useRef<HTMLInputElement>(null);
  const inLinkVideo = useRef<HTMLInputElement>(null);
  const inTomTat = useRef<HTMLTextAreaElement>(null);

  const [alInTen, setalInTen] = useState(false);
  const [alInLink, setalInLink] = useState(false);
  const [alInTomTat, setalInTomTat] = useState(false);

  const [TenVideo, setTenVideo] = useState("");
  const [LinkVideo, setLinkVideo] = useState("");
  const [TomTat, setTomTat] = useState("");

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const themVideo = async () => {
    const ten = inTenVideo.current?.value || "";
    const link = inLinkVideo.current?.value || "";
    const tomtat = inTomTat.current?.value || "";

    setalInTen(ten === "");
    setalInLink(link === "");
    setalInTomTat(tomtat === "");

    if (ten !== "" && link !== "" && tomtat !== "") {
      const data = {
        tenvideobaigiang: ten,
        linkvideo: link,
        tomtatND: tomtat,
      };
      try {
        const api = await fetch(`${BACKEND_URL}/api/them-video/${id}`, {
          method: "POST",
          headers: { Authorization: Token, "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const req = await api.json();
        if (req.trangThai === "tc") {
          layVideo();
          tatThemVideo();
        } else if (req.trangThai === "hh") {
          settb(true);
          settypeTB("w");
          setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
        }
      } catch (err) {
        console.log("Thêm video thất bại :" + err);
      }
    }
  };

  const capNhatVideo = async () => {
    const ten = inTenVideo.current?.value || "";
    const link = inLinkVideo.current?.value || "";
    const tomtat = inTomTat.current?.value || "";

    setalInTen(ten === "");
    setalInLink(link === "");
    setalInTomTat(tomtat === "");

    if (ten !== "" && link !== "" && tomtat !== "") {
      const data = {
        tenvideobaigiang: ten,
        linkvideo: link,
        tomtatND: tomtat,
      };
      try {
        const api = await fetch(
          `${BACKEND_URL}/api/capNhatVideo/${idVideo}`,
          {
            method: "PATCH",
            headers: {
              Authorization: Token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );
        const req = await api.json();
        if (req.trangThai === "tc") {
          layVideo();
          tatThemVideo();
        }
      } catch (err) {
        console.log("Cập nhật video thất bại : " + err);
      }
    }
  };

  const layChiTietVideo = async () => {
    try {
      const api = await fetch(
        `${BACKEND_URL}/api/lay-video-chitiet/${idVideo}`,
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        setTenVideo(req.data.tenvideobaigiang);
        setLinkVideo(req.data.linkvideo);
        setTomTat(req.data.tomtatND);
      }
    } catch (err) {
      console.log("Lấy video thất bại :" + err);
    }
  };

  useEffect(() => {
    if (type !== "them") {
      layChiTietVideo();
    }
  }, [type]);

  return (
    <div className="w-screen h-screen bg-black/50 fixed top-0 left-0 z-20 flex justify-center items-center">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      <img
        onClick={tatThemVideo}
        className="cursor-pointer w-[50px] fixed top-[20px] right-[20px] drop-shadow-[0_0_5px_rgb(0,0,0)]"
        src="https://img.icons8.com/?size=100&id=6483&format=png&color=ffffff"
        alt="Đóng"
      />
      <div className="flex flex-col gap-3">
        <div className="w-[800px] p-[20px] rounded-[10px] bg-white flex flex-col gap-2">
          <h1 className="w-full text-center font-bold text-[#13474b] text-[25px]">
            {type === "them" ? `Thêm ` : `Sửa `}
            Video Bài Giảng
          </h1>
          
          <p className="font-medium text-[#13474b]">Tên bài giảng: (*)</p>
          <input
            ref={inTenVideo}
            defaultValue={TenVideo}
            placeholder="Nhập tên bài giảng"
            className={`w-full p-[10px] rounded-[10px] bg-[#d7e8ec] focus:outline-none ${alInTen && `border-[2px] border-red-500`}`}
            type="text"
          />
          {alInTen && (
            <p className="text-[13px] text-red-500">
              Ô này không được để trống
            </p>
          )}

          <p className="font-medium text-[#13474b]">Link video bài giảng: (*)</p>
          <input
            ref={inLinkVideo}
            defaultValue={LinkVideo}
            placeholder="Nhập link video (URL)"
            className={`w-full p-[10px] rounded-[10px] bg-[#d7e8ec] focus:outline-none ${alInLink && `border-[2px] border-red-500`}`}
            type="text"
          />
          {alInLink && (
            <p className="text-[13px] text-red-500">
              Ô này không được để trống
            </p>
          )}

          <p className="font-medium text-[#13474b]">Tóm tắt nội dung: (*)</p>
          <textarea
            defaultValue={TomTat}
            ref={inTomTat}
            placeholder="Nhập tóm tắt nội dung bài giảng"
            className={`w-full min-h-[150px] p-[10px] rounded-[10px] bg-[#d7e8ec] focus:outline-none ${alInTomTat && `border-[2px] border-red-500`}`}
          />
          {alInTomTat && (
            <p className="text-[13px] text-red-500">
              Ô này không được để trống
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          {type === "them" ? (
            <button
              onClick={themVideo}
              className="px-[30px] py-[15px] rounded-[20px] text-[18px] bg-[#13474b] text-white font-bold transition-all duration-300 hover:scale-[1.05]"
            >
              Thêm
            </button>
          ) : (
            <button
              onClick={capNhatVideo}
              className="px-[30px] py-[15px] rounded-[20px] text-[18px] bg-[#13474b] text-white font-bold transition-all duration-300 hover:scale-[1.05]"
            >
              Cập Nhật
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
