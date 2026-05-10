import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "../FileThongso";
import Alert from "./aletr";

export default function HV_TongQuan() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const { id } = useParams(); // idLopHoc

  const [LopHoc, setLopHoc] = useState<any>({});
  const [TenKhoaHoc, setTenKhoaHoc] = useState("");
  const [ThongKe, setThongKe] = useState<any>(null);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const fetchData = async () => {
    try {
      // 1. Get user Email
      const resTk = await fetch(`${BACKEND_URL}/api/lay-tt-tk`, {
        headers: { Authorization: Token },
      });
      const dataTk = await resTk.json();
      if (dataTk.trangThai === "hh") {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
        return;
      }
      const userEmail = dataTk.data.Email;

      // 2. Get Class Info
      const resLop = await fetch(`${BACKEND_URL}/layChiTietLopHoc/${id}`);
      const dataLop = await resLop.json();
      if (dataLop.trangThai === "tc") {
        setLopHoc(dataLop.data);

        // 3. Get Course Info
        const resKhoa = await fetch(
          `${BACKEND_URL}/ChiTietKhoaHoc/${dataLop.data.idKhoaHoc}`,
        );
        const dataKhoa = await resKhoa.json();
        if (dataKhoa.trangThai === "tc") {
          setTenKhoaHoc(dataKhoa.dulieu.TenKhoaHoc);
        }
      }

      // 4. Get Stats
      const resStats = await fetch(
        `${BACKEND_URL}/api/thong-ke-hoc-vien/${id}`,
        {
          headers: { Authorization: Token },
        },
      );
      const dataStats = await resStats.json();
      if (dataStats.trangThai === "hh") {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
        return;
      }
      if (dataStats.trangThai === "tc") {
        const myStat = dataStats.data.find(
          (item: any) => item.Email === userEmail,
        );
        setThongKe(myStat);
      }
    } catch (err) {
      console.log("Error fetching HV_TongQuan:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const tyLeBaiTap =
    ThongKe && ThongKe.tongSoBaiTap > 0
      ? (ThongKe.soBaiTapHoanThanh / ThongKe.tongSoBaiTap) * 100
      : 0;

  const tyLeDiemDanh =
    ThongKe && ThongKe.tongSoBuoiDiemDanh > 0
      ? (ThongKe.soBuoiCoMat / ThongKe.tongSoBuoiDiemDanh) * 100
      : 0;

  return (
    <section className="w-full flex flex-col gap-4 mt-[10px]">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      {/* Box 1: Thông tin lớp học */}
      <div className="w-full bg-[#2a6770] border border-black/20 rounded-[10px] p-[10px] flex flex-col gap-1 shadow-sm relative overflow-hidden">
        <h2 className="ml-[10px] text-white font-bold text-[22px] border-b border-black/10">
          Thông Tin Lớp Học
        </h2>
        <div className="bg-white  rounded-[10px] p-[20px] grid grid-cols-2 gap-4 mt-2">
          <div className="flex gap-2 items-center">
            <img
              src="https://img.icons8.com/?size=100&id=9456&format=png&color=2A6770"
              className="w-[30px]"
              alt="Class"
            />
            <span className="font-semibold text-[#114A53]">Tên lớp:</span>
            <span className="text-black/80">
              {LopHoc?.TenLop || "Đang tải..."}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <img
              src="https://img.icons8.com/?size=100&id=37303&format=png&color=2A6770"
              className="w-[30px]"
              alt="Course"
            />
            <span className="font-semibold text-[#114A53]">Tên khóa học:</span>
            <span className="text-black/80">{TenKhoaHoc || "Đang tải..."}</span>
          </div>
          <div className="flex gap-2 items-center">
            <img
              src="https://img.icons8.com/?size=100&id=7724&format=png&color=2A6770"
              className="w-[30px]"
              alt="Calendar"
            />
            <span className="font-semibold text-[#114A53]">Lịch học:</span>
            <span className="text-black/80">
              {LopHoc?.LichHoc || "Đang tải..."}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <img
              src="https://img.icons8.com/?size=100&id=10083&format=png&color=2A6770"
              className="w-[30px]"
              alt="Time"
            />
            <span className="font-semibold text-[#114A53]">Giờ học:</span>
            <span className="text-black/80">
              {LopHoc?.GioHoc || "Đang tải..."}
            </span>
          </div>

          <div className="w-full flex gap-2 items-center">
            <img
              src="https://img.icons8.com/?size=100&id=11220&format=png&color=2A6770"
              className="w-[30px]"
              alt="People"
            />
            <span className="font-semibold text-[#114A53]">Sỉ số:</span>
            <span className="text-black/80">
              {LopHoc?.SoLuong || 0} học viên
            </span>
          </div>

          <div className="w-full flex gap-2 items-center">
            <img
              src="https://img.icons8.com/?size=100&id=CdqBys7kti6Y&format=png&color=2A6770"
              className="w-[30px]"
              alt="Time"
            />
            <span className="font-semibold text-[#114A53]">
              Ngày Khai Giảng:
            </span>
            <span className="text-black/80">
              {LopHoc?.DateKhaiGiang || "Đang tải..."}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Box nhỏ chia 2 cột */}
      <div className="w-full grid grid-cols-2 gap-4">
        {/* Cột 1: Bài tập */}
        <div className="bg-white border border-black/20 rounded-[10px] p-[20px] flex flex-col gap-3 shadow-sm relative overflow-hidden">
          <div className="flex gap-3 items-center border-b border-black/10 pb-3">
            <div className="w-[50px] h-[50px] bg-[#2A6770] rounded-[10px] shrink-0 flex items-center justify-center text-white font-bold text-[20px]">
              <img
                src="https://img.icons8.com/?size=100&id=YHijyB5nWl7P&format=png&color=ffffff"
                alt=""
                className="w-[60%]"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-[18px] font-bold text-[#114A53]">
                Tiến độ Bài tập
              </p>
              <p className="text-[14px] text-black/60">
                Thống kê hoàn thành bài tập
              </p>
            </div>
          </div>

          {ThongKe ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-[15px] font-medium text-[#114A53]">
                <span>
                  Đã làm: {ThongKe.soBaiTapHoanThanh}/{ThongKe.tongSoBaiTap} bài
                </span>
                <span>
                  Điểm TB:{" "}
                  <span className="font-bold text-[#740c09]">
                    {ThongKe.diemTrungBinh}
                  </span>
                </span>
              </div>
              <div className="flex justify-between gap-2 items-center">
                <div className="w-full h-[10px] bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2A6770] transition-all duration-500"
                    style={{ width: `${tyLeBaiTap}%` }}
                  ></div>
                </div>
                <p className="text-right text-[13px] font-bold text-[#2A6770]">
                  {tyLeBaiTap.toFixed(0)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center italic text-black/50 mt-2">
              Đang tải dữ liệu...
            </p>
          )}
        </div>

        {/* Cột 2: Điểm danh */}
        <div className="bg-white border border-black/20 rounded-[10px] p-[20px] flex flex-col gap-3 shadow-sm relative overflow-hidden">
          <div className="flex gap-3 items-center border-b border-black/10 pb-3">
            <div className="w-[50px] h-[50px] bg-[#2a6770] rounded-[10px] shrink-0 flex items-center justify-center text-white font-bold text-[20px]">
              <img
                src="https://img.icons8.com/?size=100&id=50897&format=png&color=ffffff"
                alt=""
                className="w-[60%]"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-[18px] font-bold text-[#114A53]">Điểm danh</p>
              <p className="text-[14px] text-black/60">
                Thống kê số buổi có mặt
              </p>
            </div>
          </div>

          {ThongKe ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-[15px] font-medium text-[#114A53]">
                <span>
                  Có mặt: {ThongKe.soBuoiCoMat}/{ThongKe.tongSoBuoiDiemDanh}{" "}
                  buổi
                </span>
                <p className="text-right text-[13px] font-bold text-[#2a6770]">
                  {tyLeDiemDanh.toFixed(0)}%
                </p>
              </div>
              <div className="w-full h-[10px] bg-gray-200 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-[#2a6770] transition-all duration-500"
                  style={{ width: `${tyLeDiemDanh}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-center italic text-black/50 mt-2">
              Đang tải dữ liệu...
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
