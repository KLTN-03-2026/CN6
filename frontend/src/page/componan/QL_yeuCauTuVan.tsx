import { useEffect, useState } from "react";
import { BACKEND_URL } from "../FileThongso";
import Alert from "./aletr";

export default function QL_yeuCauTuVan() {
  const [Token] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const [Tap, setTap] = useState<string>("Chưa tư vấn");
  const [DataTuVan, setDataTuVan] = useState<any[]>([]);
  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const TatThongBao = () => settb(false);

  const layDanhSachTuVan = async () => {
    try {
      setLoading(true);
      const api = await fetch(`${BACKEND_URL}/api/tuvan`, {
        headers: { Authorization: Token },
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataTuVan(req.data);
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("Lỗi tải danh sách yêu cầu tư vấn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    layDanhSachTuVan();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/tuvan/${id}`, {
        method: "PATCH",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({ trangThai: newStatus }),
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        settb(true);
        settypeTB("ss");
        setNdTB("Cập nhật trạng thái thành công!");
        layDanhSachTuVan();
      } else {
        settb(true);
        settypeTB("err");
        setNdTB("Cập nhật thất bại!");
      }
    } catch (err) {
      console.log("Lỗi cập nhật trạng thái:", err);
    }
  };

  const currentList = DataTuVan.filter((item) => {
    const matchStatus = item.trangThai === Tap;
    const term = searchTerm.toLowerCase();
    const matchSearch =
      item.HoTen?.toLowerCase().includes(term) ||
      item.Email?.toLowerCase().includes(term) ||
      item.Sdt?.includes(term);
    return matchStatus && matchSearch;
  });

  const [editStatus, setEditStatus] = useState<{ [key: string]: string }>({});
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  return (
    <section className="w-full mx-[10px] flex flex-col gap-2 relative mt-[10px]">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      {/* TABS & SEARCH */}
      <div className="flex gap-2 justify-between items-center w-full">
        <div className="flex gap-2 items-center overflow-x-auto flex-nowrap py-2 custom-scrollbar flex-1">
          {["Chưa tư vấn", "Đang Tư Vấn", "Đã tư vấn"].map((st) => (
            <div
              key={st}
              onClick={() => setTap(st)}
              className={`shrink-0 cursor-pointer px-[20px] py-[10px] rounded-[10px] w-fit border transition-all duration-300 border-black/20 font-medium ${
                Tap === st
                  ? "bg-[#d7e8ec] text-[#114A53] border-[#114A53]"
                  : "bg-white text-black/60"
              }`}
            >
              {st}
            </div>
          ))}
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

      {openDropdownId && (
        <div
          onClick={() => {
            setOpenDropdownId(null);
          }}
          className="w-screen h-screen fixed top-0 left-0 z-[2]"
        ></div>
      )}

      <div className="flex flex-col gap-4 mt-[10px]">
        {currentList.length === 0 ? (
          <p className="p-[40px] text-center italic text-black/40 border border-black/10 rounded-[10px]">
            Không có yêu cầu tư vấn nào trong mục này.
          </p>
        ) : (
          currentList.toReversed().map((item) => {
            const currentStatus = editStatus[item._id] || item.trangThai;

            return (
              <div
                key={item._id}
                className="p-[20px] border border-black/20 rounded-[10px] bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="pb-[10px] flex gap-3">
                    <div className="w-[50px] h-[50px] bg-[#114a53] rounded-[5px] flex items-center justify-center shrink-0">
                      <img
                        className="w-[60%]"
                        src="https://img.icons8.com/?size=100&id=7857&format=png&color=ffffff"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="text-[20px] font-bold text-[#114a53]">
                        {item.HoTen}
                        <span className="text-[14px] text-black/50 ml-2">
                          - {item.Sdt}
                        </span>
                      </p>
                      <p className="text-[14px] text-black/50">{item.Email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      onClick={() => setOpenDropdownId(item._id)}
                      className="w-[180px] cursor-pointer z-[3] p-[10px] rounded-[10px] border border-black/20 relative bg-white text-sm"
                    >
                      {currentStatus}
                      {openDropdownId === item._id && (
                        <div className="absolute w-full top-[45px] left-0 py-[5px] border border-black/20 rounded-[10px] bg-white shadow-lg z-[10]">
                          {["Chưa tư vấn", "Đang Tư Vấn", "Đã tư vấn"].map(
                            (st) => (
                              <p
                                key={st}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditStatus({
                                    ...editStatus,
                                    [item._id]: st,
                                  });
                                  setOpenDropdownId(null);
                                }}
                                className="px-[10px] py-[8px] cursor-pointer hover:bg-[#d7e8ec] transition-all text-sm"
                              >
                                {st}
                              </p>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleUpdateStatus(item._id, currentStatus)
                      }
                      className="px-[20px] py-[5px] bg-[#114a53] rounded-[10px] font-bold text-white transition-all hover:bg-[#0d2f35]"
                    >
                      Lưu
                    </button>
                  </div>
                </div>

                <div className="w-full border-b border-b-black/10 my-[5px]"></div>
                <div className="mt-[10px] font-medium text-[#114a53] flex justify-between gap-10">
                  <p className="flex-1">
                    Nghề nghiệp:{" "}
                    <span className="font-normal text-black/75">
                      {item.NgheNghiep || "Chưa cập nhật"}
                    </span>
                  </p>
                  <p className="flex-1">
                    Quan tâm:{" "}
                    <span className="font-normal text-black/75">
                      {item.QuanTam}
                    </span>
                  </p>
                  <p className="shrink-0 text-black/40 text-xs">
                    Năm sinh: {item.NamSinh || "N/A"}
                  </p>
                </div>
                <p className="font-medium text-[#114a53] mt-[8px] text-sm">
                  Nội dung:
                </p>
                <div className="mt-[5px] p-[12px] border border-black/10 rounded-[10px] bg-[#d7e8ec]/30 text-sm whitespace-pre-wrap italic text-black/80">
                  {item.NoiDung}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
