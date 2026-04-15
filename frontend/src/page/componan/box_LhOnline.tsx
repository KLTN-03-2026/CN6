import { div } from "framer-motion/client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "./aletr";

export default function Box_LhOnline() {
  const { id } = useParams();
  const [Data, setData] = useState<any[]>([]);
  const [alData, setalData] = useState(false);

  const layData = async () => {
    try {
      const api = await fetch(`http://localhost:3000/api/lay-lopHocon/${id}`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setData(req.data);
        setalData(false);
      } else if (req.trangThai === "ktt") {
        setalData(true);
      }
      console.log(req);
    } catch (err) {
      console.log("lay data lop hoc on that bai");
    }
  };

  useEffect(() => {
    layData();
  }, []);

  return (
    <div className="w-full ">
      {alData ? (
        <p className="w-full text-center">
          Hiện giáo viên chưa mở lớp bạn chờ một chút nhé
        </p>
      ) : (
        <div>
          {Data?.map((item) => (
            <div
              key={item._id}
              className="w-full relative flex gap-2 items-center p-[5px] border border-black/20 rounded-[10px] bg-white drop-shadow-[0_5px_5px_rgb(0,0,0,0.1)]"
            >
              <div className="w-[50px] h-[50px] rounded-[5px] bg-[#D7E8EC] flex justify-center items-center">
                <img
                  className="w-[70%]"
                  src="https://img.icons8.com/?size=100&id=9456&format=png&color=114A53"
                  alt=""
                />
              </div>
              <p className="font-bold text-[18px]">{item.tenLH}</p>
              <a
                href={item.linkLop}
                className="px-[15px] absolute right-[10px] py-[10px] rounded-[10px] bg-[#104B53] text-white font-bold"
              >
                Vào Lớp
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
