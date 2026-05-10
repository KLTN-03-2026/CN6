import { useEffect, useState } from "react";
import { BACKEND_URL } from "../FileThongso";

interface Props {
  item: any;
  tatXem: () => void;
  Token: any;
}

export default function XemDiemDanh({ item, tatXem, Token }: Props) {
  const [danhSachCoMat, setDanhSachCoMat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const layChiTietDiemDanh = async () => {
    try {
      const api = await fetch(
        `${BACKEND_URL}/api/lay-chi-tiet-diem-danh/${item._id}`,
        {
          headers: { Authorization: Token, "Content-Type": "application/json" },
        },
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDanhSachCoMat(req.data);
      }
    } catch (err) {
      console.log("Lỗi lấy chi tiết điểm danh", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    layChiTietDiemDanh();
  }, []);

  return (
    <section className="w-full h-full fixed top-0 left-0 flex items-center justify-center z-[10] bg-black/50">
      <div className="w-[500px] max-h-[90vh] bg-white p-[20px] rounded-[10px] relative flex flex-col gap-4 overflow-hidden">
        <h2 className="text-[#114A53] font-bold text-[24px] w-full text-center pr-[20px]">
          {item.tenBuoiDiemDanh}
        </h2>
        <p className="text-center text-black/60 text-[14px]">
          Ngày tạo: {item.ngayTao}
        </p>

        <div className="w-full h-[1px] bg-[#114A53]/20 my-[5px]"></div>

        <div className="flex max-h-[500px]    flex-col gap-2 overflow-y-auto custom-scrollbar h-fit">
          {loading ? (
            <p className="text-center mt-4">Đang tải dữ liệu...</p>
          ) : danhSachCoMat.length === 0 ? (
            <p className="text-center text-sm text-black/50 italic mt-4">
              Không có học viên nào điểm danh.
            </p>
          ) : (
            danhSachCoMat.map((hv, index) => (
              <div
                key={hv.Email}
                className="flex gap-3 items-center p-3 bg-[#f0f7f8] rounded-[5px] border border-[#2A6770]/20"
              >
                <div className="w-[30px] h-[30px] rounded-full bg-[#114A53] text-white flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-[15px] text-[#114A53] truncate">
                    {hv.HoTen}
                  </span>
                  <span className="text-[13px] text-black/60 truncate">
                    {hv.Email}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="w-full flex justify-end mt-2">
          <button
            onClick={tatXem}
            className="px-[30px] py-[10px] rounded-[10px] bg-[#114A53] text-white font-bold transition-all duration-300 hover:scale-105"
          >
            Đóng
          </button>
        </div>
      </div>
    </section>
  );
}
