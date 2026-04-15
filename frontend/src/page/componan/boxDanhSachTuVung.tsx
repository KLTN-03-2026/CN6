import { floor } from "firebase/firestore/pipelines";
import { FlatTree } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemSuaTuVung from "./ThemSuaTuVung";

interface BoxDanhSachTuVungProps {
  items: any;
  suaTuVung: () => void;
  layid: (id: string) => void;
  laydata: () => void;
}

export default function BoxDanhSachTuVung({
  items,
  suaTuVung,
  layid,
  laydata,
}: BoxDanhSachTuVungProps) {
  const chuyenTrang = useNavigate();

  const [DrTuVung, setDrTuVung] = useState(false);

  const xoaTuVung = async () => {
    try {
      const api = await fetch(
        `http://localhost:3000/api/xoaTuVung/${items._id}`,
        {
          method: "DELETE",
        },
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        laydata();
        setDrTuVung(false);
      }
    } catch (err) {
      console.log("xoa tu Vung That bai : " + err);
    }
  };

  return (
    <div
      key={items._id}
      className={`p-[5px] flex gap-3 items-center relative transition-all duration-300 hover:bg-[#d7e8ec] rounded-[10px]`}
    >
      {DrTuVung && (
        <div
          onClick={() => {
            setDrTuVung(false);
          }}
          className="w-screen h-screen  fixed top-[0px] left-0 z-[2]"
        ></div>
      )}
      <div className="w-[40px] h-[40px] bg-[#d7e8ec] rounded-[10px] shrink-0 flex items-center justify-center">
        <img
          className="w-[70%]"
          src="https://img.icons8.com/?size=100&id=KeaSSZW47moI&format=png&color=2A6770"
          alt=""
        />
      </div>
      <p className="text-[18px] font-bold">{items.TenTuVung}</p>
      <button
        onClick={() => {
          chuyenTrang(`//HocVien/HocTuVung/${items._id}`);
        }}
        className="absolute right-[35px] px-[10px] py-[5px] rounded-[10px] bg-[#2A6770] text-white font-bold"
      >
        Học
      </button>
      <div
        onClick={() => {
          setDrTuVung(!DrTuVung);
        }}
        className=" cursor-pointer absolute right-[15px] flex-col flex gap-1"
      >
        <div className="w-[5px] h-[5px] rounded-[50%] bg-black/50"></div>
        <div className="w-[5px] h-[5px] rounded-[50%] bg-black/50"></div>
        <div className="w-[5px] h-[5px] rounded-[50%] bg-black/50"></div>
      </div>
      {DrTuVung && (
        <div className=" py-[10px] bg-white border border-black/20 rounded-[10px] absolute top-[45px] z-[3] right-[10px]">
          <p
            onClick={() => {
              suaTuVung();
              layid(items._id);
            }}
            className="cursor-pointer  px-[20px] w-full transition-all duration-300 hover:bg-[#d7e8ec]"
          >
            Sửa
          </p>
          <p
            onClick={() => {
              xoaTuVung();
            }}
            className="cursor-pointer px-[20px] w-full transition-all duration-300 hover:bg-red-200"
          >
            Xóa
          </p>
        </div>
      )}
    </div>
  );
}
