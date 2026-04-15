import { useState } from "react";
import { Link } from "react-router-dom";

interface typeData {
  text: string;
  img: string;
}

interface SidebarProps {
  data: typeData[];
  Chon: number;
  ClickChon: (i: number) => void;
}

export default function Sidebar({ data, Chon, ClickChon }: SidebarProps) {
  return (
    <div className="sticky shrink-0 top-[80px] w-[250px] h-[calc(100vh-100px)] py-[10px]  ">
      <div className="relative w-full h-full flex flex-col gap-2">
        {data.map((item, index) => (
          <div
            onClick={() => {
              ClickChon(index);
            }}
            className={`flex items-center gap-2 w-full p-[10px] transition-all duration-300 cursor-pointer rounded-[10px] text-[#114A53] font-medium border-b  border-b-black/20 ${Chon === index && "bg-[#D8F8FF] "}`}
          >
            <img src={item.img} alt="" className="w-[30px]" />
            {item.text}
          </div>
        ))}

        <Link
          to={`/`}
          className="border w-full border-black/20 rounded-[20px] p-[10px] text-[#114A53] font-medium flex gap-2 justify-center items-center absolute bottom-0"
        >
          <img
            src="https://img.icons8.com/?size=100&id=2797&format=png&color=114A53"
            alt=""
            className="w-[20px] h-[20px]"
          />
          <p>Về trang Chủ</p>
        </Link>
      </div>
    </div>
  );
}
