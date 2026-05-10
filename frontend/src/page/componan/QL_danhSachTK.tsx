import { useState } from "react";

interface QL_danhSachTK_Props {
  items: {
    _id: string;
    HoTen: string;
    Email: string;
    sdt: string;
    NamSinh: number;
    VaiTro: string;
    NgheNghiep: string;
  };
  luuVaiTro: (id: string, newVaiTro: string) => void;
}

export default function QL_danhSachTK({
  items,
  luuVaiTro,
}: QL_danhSachTK_Props) {
  const [hien, setHien] = useState(false);
  const [ChonVaiTro, setChonVaiTro] = useState(items?.VaiTro || "Đang Tải ...");

  return (
    <div className=" relative w-full items-center gap-2 flex p-[15px] border border-black/20 bg-white text-[#114a53]">
      {hien && (
        <div
          onClick={() => {
            setHien(false);
          }}
          className="w-full h-screen  top-0 left-0 fixed z-[2]"
        ></div>
      )}

      <div className="w-full flex flex-col gap-1">
        <p className="font-bold">{items?.HoTen || "Đang Tải ..."}</p>
        <p className="text-[13px] text-black/60">
          {items?.Email || "Đang Tải ..."}
        </p>
      </div>
      <p className="w-[250px]  text-center shrink-0 ">
        {items?.sdt || "Đang Tải ..."}
      </p>

      <p className="w-[100px] shrink-0  text-center">
        {items?.NamSinh || "Đang Tải ..."}
      </p>
      <p className="w-[200px] text-center  shrink-0">
        {items?.VaiTro || "Đang Tải ..."}
      </p>
      <div
        onClick={() => {
          setHien(true);
        }}
        className="cursor-pointer w-[150px] relative text-center shrink-0 border border-black/20 rounded-[5px] py-[5px]"
      >
        <p>{ChonVaiTro}</p>
        {hien && (
          <div className="absolute w-full py-[5px] h-fit border border-black/20 rounded-[5px] bg-white top-full left-0 z-10">
            <p
              onClick={(e) => {
                e.stopPropagation();
                setChonVaiTro("Học Viên");
                setHien(false);
              }}
              className="transition-all cursor-pointer hover:bg-[#d7e8ec]"
            >
              Học Viên
            </p>
            <p
              onClick={(e) => {
                e.stopPropagation();
                setChonVaiTro("Giảng Viên");
                setHien(false);
              }}
              className="transition-all cursor-pointer hover:bg-[#d7e8ec]"
            >
              Giảng Viên
            </p>
          </div>
        )}
      </div>
      <div className="w-[100px] shrink-0  text-center">
        <button
          onClick={() => {
            luuVaiTro(items._id, ChonVaiTro);
          }}
          className="py-[5px] px-[10px] bg-[#114A53] font-medium text-white rounded-[5px]"
        >
          Lưu
        </button>
      </div>
    </div>
  );
}
