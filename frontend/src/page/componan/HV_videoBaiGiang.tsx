import { useEffect, useState } from "react";
import BoxDanhSachVideo from "./BoxDanhSachVideo";
import Alert from "./aletr";
import { BACKEND_URL } from "../FileThongso";
import { useNavigate, useParams } from "react-router-dom";

export default function HV_videoBaiGiang() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const [DataVideo, setDataVideo] = useState<any[]>([]);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const chuyenTrang = useNavigate();

  const { id } = useParams();

  const layDanhSachVideo = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/lay-video-khoahoc/${id}`, {
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "ktt") {
        setDataVideo([]);
      } else if (req.trangThai === "tc") {
        setDataVideo(req.data);
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w"); // w , err
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("Lấy danh sách video thất bại: " + err);
    }
  };

  useEffect(() => {
    layDanhSachVideo();
  }, []);

  return (
    <section className="w-full flex flex-col gap-2 relative mt-[10px]">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      {/* Main List */}
      <div className="flex gap-2 flex-col mt-[20px]">
        {DataVideo.length === 0 && (
          <p className="w-full text-center text-black/60 italic">
            Chưa có video bài giảng nào được tạo.
          </p>
        )}

        {DataVideo.map((items) => (
          <div
            key={items._id}
            className={`p-[10px] items-center flex gap-3 relative transition-all duration-300 hover:bg-[#d7e8ec] rounded-[10px] border border-black/10`}
          >
            {/* Icon */}
            <div className="w-[50px] h-[50px] bg-[#2A6770] rounded-[10px] shrink-0 flex items-center justify-center">
              <img
                className="w-[60%]"
                src="https://img.icons8.com/?size=100&id=5NvZIXB49iQB&format=png&color=ffffff"
                alt="Video"
              />
            </div>

            {/* Content */}
            <p className="text-[20px]  h-fit font-bold text-[#114A53]">
              {items.tenvideobaigiang}
            </p>
            <button
              onClick={() => {
                chuyenTrang(`/XemVideoBaiGiang/${items._id}`);
              }}
              className="absolute right-[10px] px-[20px] py-[10px] rounded-[10px] bg-[#2A6770] text-white font-bold"
            >
              Xem
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
