import { div } from "framer-motion/client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface SidebarProps {
  Type: string;
  data: any[];
  Chon: number;
  dapAN: any[];
  ClickChon: (i: number) => void;
}

export default function Sidebar({
  Type,
  data,
  Chon,
  ClickChon,
  dapAN,
}: SidebarProps) {
  let so = 0;

  return (
    <div className="sticky shrink-0 top-[80px] w-[250px] h-[calc(100vh-100px)] py-[10px]  ">
      {Type === "ql" ? (
        <div className="relative w-full h-full flex flex-col gap-2">
          <div className="flex gap-1 flex-col">
            {data?.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  ClickChon(index);
                }}
                className={`flex items-center gap-2 w-full p-[10px] transition-all duration-300 cursor-pointer rounded-[10px] text-[#114A53] font-medium border-b  border-b-black/20 ${Chon === index && "bg-[#D8F8FF] "}`}
              >
                <img src={item.img} alt="" className="w-[30px]" />
                {item.text}
              </div>
            ))}
          </div>

          <Link
            to={`/`}
            className=" border w-full border-black/20 rounded-[20px] p-[10px] text-[#114A53] font-medium flex gap-2 justify-center items-center absolute bottom-0"
          >
            <img
              src="https://img.icons8.com/?size=100&id=2797&format=png&color=114A53"
              alt=""
              className="w-[20px] h-[20px]"
            />
            <p>Về trang Chủ</p>
          </Link>
        </div>
      ) : (
        <div className="relative w-full h-full flex flex-col gap-2">
          <div className="w-full h-full overflow-y-scroll overflow-hidden ">
            {data?.map((item, index) => {
              let xp = so;
              so = so + item.slCauHoi;
              return (
                <div
                  key={so}
                  className={`flex flex-col  items-start  gap-2 w-full p-[10px] transition-all duration-300 cursor-pointer  text-[#114A53] font-medium border-b  border-b-black/20}`}
                >
                  <p>{item.text}</p>
                  <div className="flex gap-[3px] flex-wrap">
                    {Array.from({ length: item.slCauHoi }).map((_, index1) => {
                      let soHien = xp + index1 + 1;
                      return (
                        <div
                          key={soHien}
                          onClick={() => {
                            ClickChon(soHien - 1);
                            console.log(dapAN?.[soHien - 1]);
                          }}
                          className={`w-[40px] h-[40px] flex justify-center items-center rounded-[10px]  ${dapAN?.[soHien - 1].dapAnHocVien ? `bg-[#114a53] text-white ` : ` bg-[#d7e8ec] text-[#114a53]`}  `}
                        >
                          {soHien}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            to={`/`}
            className="border w-full border-black/20 rounded-[20px] p-[10px] text-[#114A53] font-medium flex gap-2 justify-center items-center  bottom-0"
          >
            <img
              src="https://img.icons8.com/?size=100&id=2797&format=png&color=114A53"
              alt=""
              className="w-[20px] h-[20px]"
            />
            <p>Về trang Chủ</p>
          </Link>
        </div>
      )}
    </div>
  );
}
