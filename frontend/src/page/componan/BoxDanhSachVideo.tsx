import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxXacNhan from "./BoxXacNhan";
import { BACKEND_URL } from "../FileThongso";

interface BoxDanhSachVideoProps {
  items: any;
  suaVideo: () => void;
  layid: (id: string) => void;
  laydata: () => void;
  laHocVien?: boolean;
}

export default function BoxDanhSachVideo({
  items,
  suaVideo,
  layid,
  laydata,
  laHocVien,
}: BoxDanhSachVideoProps) {
  const chuyenTrang = useNavigate();
  const [DrVideo, setDrVideo] = useState(false);
  const [ShowXacNhan, setShowXacNhan] = useState(false);

  const xoaVideo = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/xoaVideo/${items._id}`, {
        method: "DELETE",
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setShowXacNhan(false);
        setDrVideo(false);
        laydata();
      }
    } catch (err) {
      console.log("xoa video that bai : " + err);
    }
  };

  const moBoxXacNhan = () => {
    setShowXacNhan(true);
    setDrVideo(false);
  };

  const tatBoxXacNhan = () => {
    setShowXacNhan(false);
  };

  return (
    <div
      key={items._id}
      className={`p-[10px] items-center flex gap-3 relative transition-all duration-300 hover:bg-[#d7e8ec] rounded-[10px] border border-black/10`}
    >
      {/* Box Xác Nhận Xóa */}
      {ShowXacNhan && (
        <BoxXacNhan
          xoa={xoaVideo}
          tat={tatBoxXacNhan}
          noiDung="Bạn có chắc chắn muốn xóa video này không?"
        />
      )}

      {DrVideo && (
        <div
          onClick={() => {
            setDrVideo(false);
          }}
          className="w-screen h-screen fixed top-[0px] left-0 z-[2]"
        ></div>
      )}

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
        className="absolute right-[35px] px-[10px] py-[5px] rounded-[10px] bg-[#2A6770] text-white font-bold"
      >
        Xem
      </button>
      {/* <div className="flex flex-col gap-1 w-full item-center">
        
        
      </div> */}

      {/* Dropdown Menu Toggle */}
      {!laHocVien && (
        <div
          onClick={() => {
            setDrVideo(!DrVideo);
          }}
          className="cursor-pointer absolute right-[15px] top-[20px] flex-col flex gap-1 p-[5px]"
        >
          <div className="w-[3px] h-[3px] rounded-[50%] bg-black/50"></div>
          <div className="w-[3px] h-[3px] rounded-[50%] bg-black/50"></div>
          <div className="w-[3px] h-[3px] rounded-[50%] bg-black/50"></div>
        </div>
      )}

      {/* Dropdown Menu */}
      {DrVideo && (
        <div className="py-[10px] text-[14px] bg-white border border-black/20 rounded-[10px] absolute top-[50px] z-[3] right-[10px] shadow-lg">
          <p
            onClick={() => {
              suaVideo();
              layid(items._id);
            }}
            className="cursor-pointer px-[20px] py-[5px] w-full transition-all duration-300 hover:bg-[#d7e8ec]"
          >
            Sửa
          </p>
          <p
            onClick={moBoxXacNhan}
            className="cursor-pointer px-[20px] py-[5px] w-full transition-all duration-300 hover:bg-red-200 text-red-600 font-medium"
          >
            Xóa
          </p>
        </div>
      )}
    </div>
  );
}
