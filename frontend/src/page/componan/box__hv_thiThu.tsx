import { useNavigate } from "react-router-dom";
import Footed from "./footed";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../FileThongso";

export default function Box_hv_thiThu() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [DataThiThu, setDataThiThu] = useState<any[]>([]);
  const [Tap, setTap] = useState<string>("ALL");
  const dsTab = ["ALL", "Listening && Reading", "Speaking && Writing"];
  const layDanhSachLuyenDe = async () => {
    try {
      setLoading(true);
      const api = await fetch(`${BACKEND_URL}/api/thi-thu`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        // Chỉ lấy đề có trạng thái "Đã Tạo"
        setDataThiThu(
          req.data.filter((item: any) => item.trangThai === "Đã Tạo"),
        );
      }
    } catch (err) {
      console.log("Lỗi tải danh sách luyện đề:", err);
    } finally {
      setLoading(false);
    }
  };
  const currentList = DataThiThu.filter(
    (item) => Tap === "ALL" || item.kyNang === Tap,
  );
  useEffect(() => {
    layDanhSachLuyenDe();
  }, []);
  return (
    <section className="w-full flex flex-col gap-4 relative mt-[10px] ">
      <div className="w-full h-[300px] flex justify-between items-center p-[50px] bg-gradient-to-r from-[#0d2a2e] to-[#349a9d] rounded-2xl shadow-md">
        <div className="text-white flex flex-col gap-4 font-medium">
          <h2 className="text-[40px] font-bold ">
            THI THỬ TOEIC ONLINE CHUẨN ĐỀ THI THẬT
          </h2>

          <p>Trải nghiệm kỳ thi TOEIC thực tế ngay trên máy tính của bạn</p>
          <p>
            Hệ thống thi thử hiện đại giúp bạn làm quen với cấu trúc đề thi
            TOEIC mới nhất.
          </p>
        </div>
        <div className="h-full  bg-gradient-to-t from-white to-[#93e5eb] rounded-[50%]  flex justify-center items-center mr-[20px] relative">
          <img className="h-[110%]" src="/cuLuyenDe.png" alt="" />
        </div>
      </div>
      <h1 className="text-[22px] font-bold text-[#114A53] mb-[5px]">
        Danh sách đề thi
      </h1>
      <div className="flex gap-2 justify-between items-center w-full">
        <div className="text-[#2A6770] font-medium text-[15px] flex gap-2 justify-start items-center flex-1">
          <div className="flex gap-2 items-center overflow-x-auto flex-nowrap py-2 custom-scrollbar">
            {dsTab.map((t) => (
              <div
                key={t}
                onClick={() => setTap(t)}
                className={`shrink-0 cursor-pointer px-[15px] py-[10px] rounded-[10px] w-fit border transition-all duration-300 border-black/20 ${
                  Tap === t ? "bg-[#d7e8ec]" : ""
                }`}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col mt-[10px]">
        {loading && (
          <p className="text-black/50 italic px-2 animate-pulse">
            Đang tải danh sách đề...
          </p>
        )}

        {!loading && currentList.length === 0 && (
          <p className="text-black/50 italic px-2">
            Không có đề nào trong mục này.
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          {currentList.map((item) => (
            <div className="flex flex-wrap gap-4 ">
              <div
                key={item?._id}
                className="relative w-[230px] h-[300px] gap-2 flex flex-col items-center bg-gradient-to-t from-[#2F8C8F] to-[#A9F9FC] rounded-2xl shadow-md "
              >
                <div className="text-[20px] w-[180px] h-[38px] bg-[#0d2a2e] text-white rounded-b-[20px] flex justify-center items-center text-[14px] font-bold text-center px-2 truncate">
                  {item?.tenBoDe}
                </div>
                <p className="text-[25px] text-white font-extrabold mt-2 uppercase text-center leading-tight">
                  {item?.kyNang}
                </p>

                <p className="text-[16px] text-white font-medium truncate w-full text-center">
                  Đề: {item?.tenDe}
                </p>
                <p className="text-[14px] text-white/80 font-medium mt-1">
                  Ngày tạo: {item?.ngayTao}
                </p>
                <button
                  onClick={() => navigate(`/HV_chiTietThiThu/${item?._id}`)}
                  className="transition-all duration-300 hover:bg-[#174c54] hover:scale-[1.01] cursor-pointer w-[calc(100%-20px)] absolute bottom-[10px] py-[10px] bg-[#0d2a2e] font-extrabold text-[15px] text-white rounded-[10px]"
                >
                  CHI TIẾT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="my-[50px]"></div>
      <Footed />
    </section>
  );
}
