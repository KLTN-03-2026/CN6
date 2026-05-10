import { useEffect, useState } from "react";
import { BACKEND_URL } from "../FileThongso";
import Alert from "./aletr";

interface Props {
  tatThemSua: () => void;
  idLopHoc: string;
  Token: any;
}

export default function ThemSuaDiemDanh({
  tatThemSua,
  idLopHoc,
  Token,
}: Props) {
  const [tenBuoiDiemDanh, setTenBuoiDiemDanh] = useState("");
  const [danhSachChuaDiemDanh, setDanhSachChuaDiemDanh] = useState<any[]>([]);
  const [danhSachCoMat, setDanhSachCoMat] = useState<any[]>([]);

  const [AL_TenDiemDanh, setAL_TenDiemDanh] = useState(false);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const layDanhSachHocVien = async () => {
    try {
      const api = await fetch(
        `${BACKEND_URL}/api/lay-danh-sach-hoc-vien/${idLopHoc}`,
        {
          headers: { Authorization: Token, "Content-Type": "application/json" },
        },
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDanhSachChuaDiemDanh(req.data);
      }
    } catch (err) {
      console.log("Lỗi lấy danh sách học viên", err);
    }
  };

  useEffect(() => {
    layDanhSachHocVien();
  }, []);

  const themHocVienCoMat = (hocvien: any) => {
    setDanhSachCoMat([...danhSachCoMat, hocvien]);
    setDanhSachChuaDiemDanh(
      danhSachChuaDiemDanh.filter((hv) => hv.Email !== hocvien.Email),
    );
  };

  const xoaHocVienCoMat = (hocvien: any) => {
    setDanhSachChuaDiemDanh([...danhSachChuaDiemDanh, hocvien]);
    setDanhSachCoMat(danhSachCoMat.filter((hv) => hv.Email !== hocvien.Email));
  };

  const handleLuu = async () => {
    if (!tenBuoiDiemDanh.trim()) {
      setAL_TenDiemDanh(true);
      return;
    }
    setAL_TenDiemDanh(false);
    try {
      const api = await fetch(`${BACKEND_URL}/api/them-diem-danh/${idLopHoc}`, {
        method: "POST",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({
          tenBuoiDiemDanh: tenBuoiDiemDanh,
          danhSachCoMat: danhSachCoMat.map((hv) => hv.Email),
        }),
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        tatThemSua();
      } else {
        settb(true);
        settypeTB("err");
        setNdTB("Đã có lỗi xảy ra");
      }
    } catch (err) {
      console.log("Lỗi lưu điểm danh", err);
    }
  };

  return (
    <section className="w-full h-full fixed top-0 left-0 flex items-center justify-center z-[10] bg-black/50">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={() => settb(false)} />}
      <div className="w-[800px] max-h-[90vh] bg-white p-[20px] rounded-[10px] relative flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <h2 className="text-[#114A53] font-bold text-[24px] w-full text-center">
          Thêm Buổi Điểm Danh
        </h2>

        <div className="w-full h-[1px] bg-[#114A53]/20 my-[5px]"></div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-[14px] font-medium ml-[10px] text-black/60">
            Tên buổi điểm danh
          </label>
          <input
            type="text"
            placeholder="VD: Điểm danh buổi 1..."
            value={tenBuoiDiemDanh}
            onChange={(e) => setTenBuoiDiemDanh(e.target.value)}
            className={`w-full p-[10px] outline-none rounded-[10px] border ${
              AL_TenDiemDanh
                ? "border-red-500"
                : "border-black/20 focus:border-[#2A6770]"
            } transition-colors bg-white shadow-inner`}
          />
        </div>
        <div className=" w-full h-[500px] overflow-y-auto  p-[10px] border border-black/20 rounded-[10px]">
          <p className="font-bold text-[#114A53] mb-2 text-center border-b border-black/20 pb-3">
            Học viên có mặt
          </p>
          {danhSachCoMat.map((hv) => (
            <div
              key={hv.Email}
              className="flex justify-between items-center p-2 bg-white rounded-[5px] border border-[#2A6770]/30 shadow-sm"
            >
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-[14px] text-[#114A53] truncate">
                  {hv.HoTen}
                </span>
                <span className="text-[12px] text-black/60 truncate">
                  {hv.Email}
                </span>
              </div>
              <button
                onClick={() => xoaHocVienCoMat(hv)}
                className="w-[30px] h-[30px] flex-shrink-0 bg-[#740c09] text-white rounded-[50%] flex items-center justify-center font-bold text-[18px] hover:scale-110 transition-transform"
                title="Bỏ điểm danh"
              >
                -
              </button>
            </div>
          ))}
          {danhSachCoMat.length === 0 && (
            <p className="text-center text-sm text-black/50 italic mt-4">
              Chưa có học viên điểm danh.
            </p>
          )}
          <div className="w-full border border-b-black/20 my-[10px]"></div>
          <p className="font-bold text-[#114A53] mb-2 text-center border-b border-black/20 pb-3">
            Học viên chưa có mặt
          </p>
          {danhSachChuaDiemDanh.map((hv) => (
            <div
              key={hv.Email}
              className="flex justify-between items-center p-2 bg-[#f0f7f8] rounded-[5px] border border-[#2A6770]/20"
            >
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-[14px] text-[#114A53] truncate">
                  {hv.HoTen}
                </span>
                <span className="text-[12px] text-black/60 truncate">
                  {hv.Email}
                </span>
              </div>
              <button
                onClick={() => themHocVienCoMat(hv)}
                className="w-[30px] h-[30px] flex-shrink-0 bg-[#2A6770] text-white rounded-[50%] flex items-center justify-center font-bold text-[18px] hover:scale-110 transition-transform"
                title="Thêm có mặt"
              >
                +
              </button>
            </div>
          ))}
          {danhSachChuaDiemDanh.length === 0 && (
            <p className="text-center text-sm text-black/50 italic mt-4">
              Không còn học viên.
            </p>
          )}
        </div>

        <div className="w-full flex justify-end gap-3 mt-4">
          <button
            onClick={tatThemSua}
            className="px-[20px] py-[10px] rounded-[10px] bg-gray-300 font-bold transition-all duration-300 hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleLuu}
            className="px-[20px] py-[10px] rounded-[10px] bg-[#114A53] text-white font-bold transition-all duration-300 hover:scale-105"
          >
            Lưu Điểm Danh
          </button>
        </div>
      </div>
    </section>
  );
}
