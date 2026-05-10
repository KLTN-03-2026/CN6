import { useEffect, useState } from "react";
import { BACKEND_URL } from "../FileThongso";
import Alert from "./aletr";
import DangKy from "./dangky";
import QL_danhSachTK from "./QL_danhSachTK";
import { p } from "framer-motion/client";

export default function QL_taiKhoan() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const [Tap, setTap] = useState<string>("Học Viên");
  const [DataTaiKhoan, setDataTaiKhoan] = useState<any[]>([]);
  const [ThemTK, setThemTK] = useState(false);
  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");
  const [loading, setLoading] = useState(false);

  // local state for editing VaiTro
  // key: id taikhoan, value: selected vaitro
  const [editVaiTro, setEditVaiTro] = useState<{ [key: string]: string }>({});
  
  // state for search functionality
  const [searchTerm, setSearchTerm] = useState("");

  const TatThongBao = () => settb(false);

  const layDanhSachTaiKhoan = async () => {
    try {
      setLoading(true);
      const api = await fetch(`${BACKEND_URL}/api/lay-danh-sach-tai-khoan`, {
        headers: { Authorization: Token },
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataTaiKhoan(req.data);
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("Lỗi tải danh sách tài khoản:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    layDanhSachTaiKhoan();
  }, []);

  const handleLuuVaiTro = async (id: string, newVaiTro: string) => {
    if (newVaiTro === "Đang Tải ...") {
      settb(true);
      settypeTB("err");
      setNdTB("Vui lòng chọn vai trò!");
      return;
    }
    try {
      const api = await fetch(`${BACKEND_URL}/api/cap-nhat-vai-tro/${id}`, {
        method: "PATCH",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({ VaiTro: newVaiTro }),
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        settb(true);
        settypeTB("ss");
        setNdTB("Cập nhật vai trò thành công!");
        layDanhSachTaiKhoan();

        // Remove from edit state
        const newEditVaiTro = { ...editVaiTro };
        delete newEditVaiTro[id];
        setEditVaiTro(newEditVaiTro);
      } else {
        settb(true);
        settypeTB("err");
        setNdTB("Cập nhật thất bại!");
      }
    } catch (err) {
      console.log("Lỗi cập nhật vai trò:", err);
    }
  };

  const currentList = DataTaiKhoan.filter((item) => {
    const matchRole = item.VaiTro === Tap;
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      item.HoTen?.toLowerCase().includes(term) || 
      item.Email?.toLowerCase().includes(term) || 
      item.sdt?.includes(term);
    return matchRole && matchSearch;
  });

  return (
    <section className="w-full flex flex-col gap-2 relative mt-[10px]">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      {/* TABS & ADD BUTTON & SEARCH */}
      <div className="flex gap-2 justify-between items-center w-full">
        <div className="text-[#2A6770] font-medium text-[15px] flex gap-2 justify-start items-center flex-1">
          <div
            onClick={() => setThemTK(true)}
            className="shrink-0 cursor-pointer w-[35px] h-[35px] bg-[#114A53] rounded-[50%] flex justify-center items-center transition-all duration-300 hover:scale-[1.05]"
            title="Thêm tài khoản mới"
          >
            <img
              className="w-[60%]"
              src="https://img.icons8.com/?size=100&id=3220&format=png&color=f7f7f7"
              alt="Thêm"
            />
          </div>

          <div className="flex gap-2 items-center overflow-x-auto flex-nowrap py-2 custom-scrollbar">
            <div
              onClick={() => setTap("Học Viên")}
              className={`shrink-0 cursor-pointer px-[15px] py-[10px] rounded-[10px] w-fit border transition-all duration-300 border-black/20 ${Tap === "Học Viên" && "bg-[#d7e8ec]"}`}
            >
              Học Viên
            </div>
            <div
              onClick={() => setTap("Giảng Viên")}
              className={`shrink-0 cursor-pointer px-[15px] py-[10px] rounded-[10px] w-fit border transition-all duration-300 border-black/20 ${Tap === "Giảng Viên" && "bg-[#d7e8ec]"}`}
            >
              Giảng Viên
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-[300px] shrink-0 relative">
          <input
            type="text"
            placeholder="Tìm kiếm họ tên, email, sđt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-[10px] pl-[40px] border border-black/20 rounded-[10px] outline-none focus:border-[#2A6770] bg-white transition-all shadow-sm"
          />
          <img
            src="https://img.icons8.com/?size=100&id=132&format=png&color=000000"
            alt="Search"
            className="w-[20px] absolute left-[12px] top-[12px] opacity-40"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full mt-[20px] bg-white rounded-[10px] border border-black/10  shadow-sm">
        <div className="w-full gap-2 flex p-[15px] rounded-t-[10px] bg-[#114a53] text-white font-bold text-[17px]">
          <p className="w-full">Họ Tên/ Email</p>
          <p className="w-[250px]  text-center shrink-0 ">SĐT</p>

          <p className="w-[100px] shrink-0  text-center">Năm Sinh</p>
          <p className="w-[200px] text-center  shrink-0">Nghề Nghiệp</p>
          <p className="w-[150px] text-center shrink-0 ">Vai Trò</p>
          <p className="w-[100px] shrink-0  text-center">Hành động</p>
        </div>
        {currentList.length === 0 && (
          <p className="p-[20px] text-center italic text-black/50">
            Không có tài khoản nào trong danh sách.
          </p>
        )}
        {currentList?.toReversed().map((item) => (
          <QL_danhSachTK luuVaiTro={handleLuuVaiTro} items={item} />
        ))}
        <div className="w-full h-[20px] bg-[#114a53] rounded-b-[10px]"></div>
      </div>

      {/* Modal Thêm Tài Khoản (Đăng Ký) */}
      {ThemTK && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-[100] flex items-center justify-center">
          <DangKy
            tat={() => setThemTK(false)}
            dangNhap={(email, mk) => {
              settb(true);
              settypeTB("ss");
              setNdTB("Thêm tài khoản thành công!");
              setThemTK(false);
              layDanhSachTaiKhoan();
            }}
          />
        </div>
      )}
    </section>
  );
}
