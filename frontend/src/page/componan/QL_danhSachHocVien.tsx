import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "./aletr";
import { BACKEND_URL } from "../FileThongso";

export default function QL_danhSachHocVien() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const { id } = useParams(); // idLopHoc

  const [DataHocVien, setDataHocVien] = useState<any[]>([]);
  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");
  const [loading, setLoading] = useState(true);

  const TatThongBao = () => {
    settb(false);
  };

  const layThongKeHocVien = async () => {
    try {
      setLoading(true);
      const api = await fetch(`${BACKEND_URL}/api/thong-ke-hoc-vien/${id}`, {
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataHocVien(req.data);
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("Lấy thống kê học viên thất bại: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      layThongKeHocVien();
    }
  }, [id]);

  return (
    <section className="w-full relative mt-[10px]">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      <p className="w-full text-center my-[20px] text-[25px] font-bold text-[#114A53]">
        Danh sách Học viên
      </p>

      <div className="flex gap-4 flex-col">
        {loading ? (
          <p className="w-full text-center text-black/60 italic">
            Đang tải dữ liệu...
          </p>
        ) : DataHocVien.length === 0 ? (
          <p className="w-full text-center text-black/60 italic">
            Chưa có học viên nào đăng ký lớp học này.
          </p>
        ) : (
          DataHocVien.map((item, index) => {
            const tyLeBaiTap =
              item.tongSoBaiTap > 0
                ? (item.soBaiTapHoanThanh / item.tongSoBaiTap) * 100
                : 0;
            const tyLeDiemDanh =
              item.tongSoBuoiDiemDanh > 0
                ? (item.soBuoiCoMat / item.tongSoBuoiDiemDanh) * 100
                : 0;

            return (
              <div
                key={item.Email}
                className="p-[15px] flex flex-col gap-3 relative transition-all duration-300 hover:bg-[#d7e8ec] rounded-[10px] border border-black/10 bg-white"
              >
                {/* Header: Info */}
                <div className="flex gap-3 items-center border-b border-black/10 pb-3">
                  <div className="w-[50px] h-[50px] bg-[#2A6770] rounded-[10px] shrink-0 flex items-center justify-center text-white font-bold text-[20px]">
                    <img
                      src="https://img.icons8.com/?size=100&id=BjLaPJ1cFKRo&format=png&color=ffffff"
                      alt=""
                      className="w-[60%]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[18px] font-bold text-[#114A53]">
                      {item.HoTen}
                    </p>
                    <p className="text-[14px] text-black/60">
                      Email: {item.Email} | Năm sinh:{" "}
                      {item.NamSinh || "Chưa cập nhật"} | Nghề nghiệp:{" "}
                      {item.NgheNghiep || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                {/* Body: Stats */}
                <div className="flex gap-6 items-center pt-2">
                  {/* Bài tập */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-[14px] font-medium text-[#114A53]">
                      <span>
                        Bài tập: {item.soBaiTapHoanThanh}/{item.tongSoBaiTap}
                      </span>
                      <span>
                        Điểm TB:{" "}
                        <span className="font-bold text-[#740c09]">
                          {item.diemTrungBinh}
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-[8px] bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2A6770] transition-all duration-500"
                        style={{ width: `${tyLeBaiTap}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Điểm danh */}
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-[14px] font-medium text-[#114A53]">
                      <span>
                        Điểm danh: {item.soBuoiCoMat}/{item.tongSoBuoiDiemDanh}
                      </span>
                      <span>{tyLeDiemDanh.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-[8px] bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2a6770] transition-all duration-500"
                        style={{ width: `${tyLeDiemDanh}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
