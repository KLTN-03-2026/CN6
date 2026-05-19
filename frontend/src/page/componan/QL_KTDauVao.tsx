import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../FileThongso";
import Alert from "./aletr";

export default function QL_KTDauVao() {
  const [Token] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const [Tap, setTap] = useState("Danh Sách Đề");
  const [SubTap, setSubTap] = useState("Đã Tạo");

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const [DataDe, setDataDe] = useState<any[]>([]);
  const [DataHV, setDataHV] = useState<any[]>([]);
  const [BoxThem, setBoxThem] = useState(false);
  const Input_TenKTDV = useRef<HTMLInputElement>(null);
  const [Al_TenKTDV, setAL_TenKTDV] = useState(false);

  const navigate = useNavigate();

  const TatThongBao = () => settb(false);

  const layDataDe = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/kiem-tra-dau-vao`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataDe(req.data);
      }
    } catch (err) {
      console.log("Lỗi lấy danh sách đề đầu vào:", err);
    }
  };

  const layDataHV = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/kiem-tra-dau-vao-da-lam`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataHV(req.data);
      }
    } catch (err) {
      console.log("Lỗi lấy danh sách học viên đã làm:", err);
    }
  };

  useEffect(() => {
    layDataDe();
    layDataHV();
  }, []);

  const TaoDe = async () => {
    const ten = Input_TenKTDV.current?.value.trim() || "";
    if (ten === "") {
      setAL_TenKTDV(true);
      return;
    }
    setAL_TenKTDV(false);

    try {
      const api = await fetch(`${BACKEND_URL}/api/kiem-tra-dau-vao`, {
        method: "POST",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({ tenKiemTraDauVao: ten }),
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setBoxThem(false);
        // Chuyển sang trang chi tiết (Sẽ tạo sau)
        navigate(`/QL_ChiTietKTDauVao/${req.data._id}`);
      } else {
        settb(true);
        settypeTB("err");
        setNdTB("Thêm thất bại!");
      }
    } catch (err) {
      console.log("Lỗi thêm đề:", err);
    }
  };

  return (
    <section className="w-full mx-[10px] relative mt-[10px]">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      {/* TABS CHÍNH */}
      <div className="flex gap-4 items-center mb-6">
        {["Danh Sách Đề", "Danh Sách HV Đã Làm"].map((t) => (
          <div
            key={t}
            onClick={() => setTap(t)}
            className={`cursor-pointer px-6 py-2 rounded-[15px] font-bold transition-all ${
              Tap === t
                ? "bg-[#114A53] text-white  scale-105"
                : "bg-white text-[#114A53] border border-[#114A53] hover:bg-[#d7e8ec]"
            }`}
          >
            {t}
          </div>
        ))}
      </div>

      {Tap === "Danh Sách Đề" && (
        <>
          <div className="w-full flex justify-start items-center gap-4">
            {/* Nút thêm */}
            <div
              onClick={() => setBoxThem(true)}
              className="cursor-pointer w-[40px] h-[40px] bg-[#114A53] rounded-full flex justify-center items-center shadow-md hover:scale-110 transition-transform"
              title="Thêm đề mới"
            >
              <img
                className="w-[60%]"
                src="https://img.icons8.com/?size=100&id=3220&format=png&color=f7f7f7"
                alt="add"
              />
            </div>

            <div className="flex gap-2">
              {["Đã Tạo", "Bản Nháp"].map((st) => (
                <div
                  key={st}
                  onClick={() => setSubTap(st)}
                  className={`cursor-pointer px-4 py-2 rounded-lg border transition-all ${
                    SubTap === st
                      ? "bg-[#d7e8ec] border-[#114A53] text-[#114A53] "
                      : "border-black/10 hover:border-black/30"
                  }`}
                >
                  {st}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full border-b border-b-black/10 my-6"></div>

          <div className="w-full bg-white border border-black/10 p-6 rounded-2xl shadow-sm">
            <div className="font-bold flex justify-between text-[#114A53] mb-4">
              <p>Thông tin đề kiểm tra</p>
              <p className="w-[300px]">Thời gian tạo / Người tạo</p>
            </div>

            <div className="w-full border-b border-b-black/10 mb-4"></div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {DataDe.toReversed()
                .filter((item) => item.trangThai === SubTap)
                .map((item) => (
                  <div
                    key={item._id}
                    className="p-4 w-full flex gap-4 transition-all hover:bg-[#f0f7f8] rounded-xl border border-transparent hover:border-[#114A53]/20"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-[#d7e8ec] flex justify-center items-center">
                      <img
                        className="w-8"
                        src="https://img.icons8.com/?size=100&id=rYkEZD1xSmKa&format=png&color=114a53"
                        alt="icon"
                      />
                    </div>
                    <div className="w-full flex flex-col justify-center">
                      <p className="text-[22px] font-bold text-[#114A53]">
                        {item.tenKiemTraDauVao}
                      </p>
                    </div>
                    <div className="w-[300px] flex gap-4 shrink-0 justify-between items-center">
                      <div className="text-sm">
                        <p className="font-medium">{item.ngayTao}</p>
                        <p className="text-black/50">{item.emailNguoiTao}</p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/QL_ChiTietKTDauVao/${item._id}`)
                        }
                        className="px-5 py-2 rounded-xl bg-[#114A53] font-bold text-white hover:bg-[#0d2a2e] transition-colors"
                      >
                        Chi tiết →
                      </button>
                    </div>
                  </div>
                ))}

              {DataDe.filter((item) => item.trangThai === SubTap).length ===
                0 && (
                <p className="text-center text-black/40 italic py-10">
                  Danh sách trống
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {Tap === "Danh Sách HV Đã Làm" && (
        <div className="flex flex-col gap-4 mt-[10px]">
          {DataHV.length === 0 ? (
            <p className="p-[40px] text-center italic text-black/40 border border-black/10 rounded-[10px] bg-white">
              Chưa có học viên nào làm bài.
            </p>
          ) : (
            DataHV.toReversed().map((item) => (
              <div
                key={item._id}
                className="p-[20px] border border-black/20 rounded-[10px] bg-white shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="pb-[10px] flex gap-3">
                    <div className="w-[50px] h-[50px] bg-[#114a53] rounded-[5px] flex items-center justify-center shrink-0">
                      <img
                        className="w-[60%]"
                        src="https://img.icons8.com/?size=100&id=85318&format=png&color=ffffff"
                        alt="student"
                      />
                    </div>
                    <div>
                      <p className="text-[20px] font-bold text-[#114a53]">
                        {item.hoten}
                      </p>
                      <p className="text-[14px] text-black/50">
                        {item.ngayTao
                          ? new Date(item.ngayTao).toLocaleString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "Không xác định"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full border-b border-b-black/10 my-[5px]"></div>
                <div className="mt-[10px] font-medium text-[#114a53] flex flex-wrap justify-between gap-5 bg-white p-4 rounded-lg border border-black/20">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs uppercase text-black/40 mb-1">
                      Thông tin liên hệ
                    </p>
                    <p className="font-bold text-lg">{item.email}</p>
                    <p className="text-sm text-black/60">SĐT: {item.sdt}</p>
                  </div>
                  <div className="w-[180px] text-center border-l border-black/10">
                    <p className="text-xs uppercase text-black/40 mb-1">
                      Điểm Listening & Reading
                    </p>
                    <p className="font-bold text-2xl text-[#114a53]">
                      {item.diemLR}
                    </p>
                  </div>
                  <div className="w-[180px] text-center border-l border-black/10">
                    <p className="text-xs uppercase text-black/40 mb-1">
                      Điểm Speaking & Writing
                    </p>
                    <p className="font-bold text-2xl text-[#740c09]">
                      {item.diemSW}
                    </p>
                  </div>
                </div>

                {item.motanangluc && (
                  <div className="mt-3 bg-[#e8f4f6] p-4 rounded-lg border border-[#114a53]/20">
                    <p className="text-xs uppercase  mb-2 font-bold">
                      Đánh giá năng lực
                    </p>
                    <p className="text-sm text-[#114a53] font-medium leading-relaxed">
                      {item.motanangluc}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Thêm Đề */}
      {BoxThem && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex justify-center items-center backdrop-blur-sm">
          <div className="w-[500px] p-8 rounded-2xl bg-white shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
            <h2 className="w-full text-center text-2xl font-black text-[#114A53]">
              THÊM ĐỀ ĐẦU VÀO
            </h2>
            <div className="w-full">
              <p className="text-sm font-bold mb-2 ml-1 text-black/60">
                Tên đề kiểm tra
              </p>
              <input
                ref={Input_TenKTDV}
                type="text"
                autoFocus
                placeholder="Nhập tên đề..."
                className={`focus:outline-none p-4 border rounded-xl w-full transition-all ${
                  Al_TenKTDV
                    ? "border-red-500 bg-red-50"
                    : "border-black/10 focus:border-[#114A53] focus:ring-2 ring-[#114A53]/10"
                }`}
              />
              {Al_TenKTDV && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  Vui lòng nhập tên đề!
                </p>
              )}
            </div>

            <div className="w-full flex gap-3 font-bold">
              <button
                onClick={() => setBoxThem(false)}
                className="flex-1 border-2 border-[#114A53] text-[#114A53] rounded-xl py-3 hover:bg-[#114A53] hover:text-white transition-all"
              >
                HỦY
              </button>
              <button
                onClick={TaoDe}
                className="flex-1 bg-[#114A53] text-white rounded-xl py-3 shadow-lg shadow-[#114A53]/20 hover:bg-[#0d2a2e] transition-all"
              >
                TẠO NGAY
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
