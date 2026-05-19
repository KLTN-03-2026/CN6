import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../FileThongso";
import { useEffect, useState } from "react";
import { div } from "framer-motion/client";

export default function GV_QL_KhoaHoc() {
  const ChuyenTrang = useNavigate();
  const [Data, setData] = useState<any[]>([]);
  const [alData, setalData] = useState(false);

  const layData = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/khoaHoc`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        if (req.dulieu.length === 0) {
          setalData(true);
        } else {
          setalData(false);
          setData(req.dulieu);
        }
      }
    } catch (err) {
      console.log("lấy danh sách khóa học thất bại : " + err);
    }
  };

  useEffect(() => {
    layData();
  }, []);

  return (
    <section className=" w-full mx-[10px] flex flex-col gap-2">
      <div className="w-[10] flex justify-end">
        {/* nút thêm  */}
        <div
          onClick={() => {
            ChuyenTrang(`/ThemChinhSuaKH/them`);
          }}
          className="cursor-pointer w-[35px] h-[35px] bg-[#114A53] rounded-[50%] flex justify-center items-center"
        >
          <img
            className="w-[60%]"
            src="https://img.icons8.com/?size=100&id=3220&format=png&color=f7f7f7"
            alt=""
          />
        </div>
      </div>
      {/* danh sách khóa học */}
      {alData ? (
        <p className="w-full text-center font-bold">
          Hiện chưa có khóa học nào
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {Data?.toReversed().map((item) => (
            <div
              key={item._id}
              className="transition-all duration-300 hover:bg-[#d7e8ec] w-full  border border-black/20 rounded-[10px] p-[5px] flex gap-2 items-center relative"
            >
              <div className="w-[45px] h-[45px] rounded-[10px] bg-[#d7e8ec] flex justify-center items-center">
                <img
                  className="w-[60%]"
                  src="https://img.icons8.com/?size=100&id=50895&format=png&color=114A53"
                  alt=""
                />
              </div>
              <p className="font-bold text-[20px] text-[#114a53]">
                {item.TenKhoaHoc}
              </p>
              <div className="absolute right-[8px] flex gap-2">
                <button
                  onClick={() => {
                    ChuyenTrang(`/ThemChinhSuaKH/${item._id}`);
                  }}
                  className="px-[10px] py-[10px] bg-[#114a53] rounded-[10px] text-white font-bold"
                >
                  Chi tiết →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
