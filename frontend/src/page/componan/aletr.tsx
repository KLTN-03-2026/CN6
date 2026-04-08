import { useEffect, useState } from "react";

interface AlertProps {
  type: string;
  noiDung: string;
  tat: () => void;
}

export default function Alert({ type, noiDung, tat }: AlertProps) {
  const [battat, setbattat] = useState(false);

  useEffect(() => {
    setbattat(true);
  }, []);

  return (
    <div
      className={`w-[400px] z-[10]  fixed top-[20px] right-[-400px] transition-all duration-500  border border-black/20 rounded-[10px] p-[5px] flex items-center gap-5 drop-shadow-[0_5px_10px_rgb(0,0,0,0.25)] ${battat && `right-[20px]`}
      ${type === "err" && `bg-[#fceeeb]`}
      ${type === "ss" && `bg-[#e6f7f1]`}
      ${type === "w" && `bg-[#fff3e7]`}
      `}
    >
      <div className="h-[40px] w-[40px] bg-white rounded-[10px] flex justify-center items-center">
        {type === "w" && (
          <img
            src="https://img.icons8.com/?size=100&id=6qznCUCGwu3i&format=png&color=f3a946"
            className="w-[30px]"
            alt=""
          />
        )}
        {type === "err" && (
          <img
            src="https://img.icons8.com/?size=100&id=p7DcSnjN6ygX&format=png&color=f06955"
            className="w-[30px]"
            alt=""
          />
        )}
        {type === "ss" && (
          <img
            src="https://img.icons8.com/?size=100&id=0H26EziLCAhq&format=png&color=1bac74"
            className="w-[30px]"
            alt=""
          />
        )}
      </div>
      <div className="text-[13px]">
        <h3 className="font-extrabold">
          {type === "w" && "Cảnh Báo"} {type === "err" && "Cảnh Báo lỗi"}
          {type === "ss" && "Thành Công"}
        </h3>

        <p className="text-black/75">{noiDung}</p>
      </div>
      <img
        onClick={() => {
          tat();
        }}
        src="https://img.icons8.com/?size=100&id=Emle2kcE82Fp&format=png&color=000000"
        className="w-[15px] opacity-[80%] absolute right-4 cursor-pointer"
        alt=""
      />
    </div>
  );
}
