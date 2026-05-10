import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "./aletr";
import ThemSuaDiemDanh from "./ThemSuaDiemDanh";
import XemDiemDanh from "./XemDiemDanh";
import { BACKEND_URL } from "../FileThongso";

export default function QL_diemDanh() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const { id } = useParams(); // idLopHoc

  const [DataDiemDanh, setDataDiemDanh] = useState<any[]>([]);
  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const [ThemSua, setThemSua] = useState(false);
  const [ShowXem, setShowXem] = useState(false);
  const [SelectedDiemDanh, setSelectedDiemDanh] = useState<any>(null);

  const TatThongBao = () => {
    settb(false);
  };

  const layDanhSachDiemDanh = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/lay-diem-danh/${id}`, {
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataDiemDanh(req.data);
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("Lấy danh sách điểm danh thất bại: " + err);
    }
  };

  useEffect(() => {
    if (id) {
      layDanhSachDiemDanh();
    }
  }, [id]);

  const tatThemSua = () => {
    setThemSua(false);
    layDanhSachDiemDanh(); // Refresh after adding
  };

  const xemChiTiet = (item: any) => {
    setSelectedDiemDanh(item);
    setShowXem(true);
  };

  return (
    <section className="w-full relative mt-[10px]">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      <div className="w-full flex gap-2 items-center relative mb-[40px]">
        <button
          onClick={() => {
            setThemSua(true);
          }}
          className="absolute right-0 w-[35px] h-[35px] flex items-center justify-center font-extrabold bg-[#114A53] rounded-[50%] transition-all duration-300 hover:scale-[1.05]"
          title="Thêm buổi điểm danh"
        >
          <img
            className="w-[50%]"
            src="https://img.icons8.com/?size=100&id=3220&format=png&color=ffffff"
            alt="Thêm"
          />
        </button>
      </div>

      <div className="flex gap-2 flex-col">
        {DataDiemDanh.length === 0 && (
          <p className="w-full text-center text-black/60 italic">
            Chưa có buổi điểm danh nào cho lớp này.
          </p>
        )}
        {DataDiemDanh.toReversed().map((item) => (
          <div
            key={item._id}
            className="p-[10px] flex gap-3 items-center relative transition-all duration-300 hover:bg-[#d7e8ec] rounded-[10px] border border-black/10"
          >
            <div className="w-[50px] h-[50px] bg-[#d7e8ec] rounded-[10px] shrink-0 flex items-center justify-center">
              <img
                className="w-[70%]"
                src="https://img.icons8.com/?size=100&id=MsERXXVyVEs9&format=png&color=2A6770"
                alt="Attendance"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-[18px] font-bold text-[#114A53]">
                {item.tenBuoiDiemDanh}
              </p>
              <p className="text-[14px] text-black/60">
                Ngày tạo: {item.ngayTao}
              </p>
            </div>
            <button
              onClick={() => xemChiTiet(item)}
              className="absolute right-[10px] px-[20px] py-[10px] rounded-[10px] bg-[#2A6770] text-white font-bold transition-all duration-300 hover:bg-[#114A53]"
            >
              Xem
            </button>
          </div>
        ))}
      </div>

      {ThemSua && (
        <ThemSuaDiemDanh
          tatThemSua={tatThemSua}
          idLopHoc={id || ""}
          Token={Token}
        />
      )}

      {ShowXem && SelectedDiemDanh && (
        <XemDiemDanh
          item={SelectedDiemDanh}
          tatXem={() => setShowXem(false)}
          Token={Token}
        />
      )}
    </section>
  );
}
