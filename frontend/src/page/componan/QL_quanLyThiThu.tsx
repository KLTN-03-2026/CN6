import { useEffect, useState, useRef } from "react";
import { BACKEND_URL } from "../FileThongso";
import Alert from "./aletr";
import { useNavigate } from "react-router-dom";

export default function QL_quanLyThiThu() {
  const [Token] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const [Tap, setTap] = useState<string>("ALL");
  const [DataThiThu, setDataThiThu] = useState<any[]>([]);
  const [ThemTT, setThemTT] = useState(false);
  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");
  const [loading, setLoading] = useState(false);

  const inTenBoDe = useRef<HTMLInputElement>(null);
  const inTenDe = useRef<HTMLInputElement>(null);
  const [chonKyNang, setChonKyNang] = useState("Listening && Reading");
  const [DrKyNang, setDrKyNang] = useState(false);

  const [errTenBoDe, setErrTenBoDe] = useState(false);
  const [errTenDe, setErrTenDe] = useState(false);

  const navigate = useNavigate();

  const TatThongBao = () => settb(false);

  const layDanhSachThiThu = async () => {
    try {
      setLoading(true);
      const api = await fetch(`${BACKEND_URL}/api/thi-thu`, {
        headers: { Authorization: Token },
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataThiThu(req.data);
      }
    } catch (err) {
      console.log("Lỗi tải danh sách thi thử:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    layDanhSachThiThu();
  }, []);

  const handleThemThiThu = async () => {
    const tenBoDe = inTenBoDe.current?.value || "";
    const tenDe = inTenDe.current?.value || "";

    let hasError = false;

    if (!tenBoDe) {
      setErrTenBoDe(true);
      hasError = true;
    } else {
      setErrTenBoDe(false);
    }

    if (!tenDe) {
      setErrTenDe(true);
      hasError = true;
    } else {
      setErrTenDe(false);
    }

    if (hasError) return;

    try {
      const data = {
        tenBoDe,
        tenDe,
        kyNang: chonKyNang,
      };

      const api = await fetch(`${BACKEND_URL}/api/thi-thu`, {
        method: "POST",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        settb(true);
        settypeTB("ss");
        setNdTB("Thêm thi thử thành công!");
        setThemTT(false);
        layDanhSachThiThu(); // Refresh list
      } else {
        settb(true);
        settypeTB("err");
        setNdTB("Thêm thất bại!");
      }
    } catch (err) {
      console.log("Lỗi thêm thi thử:", err);
    }
  };

  const currentListBanNhap = DataThiThu.filter((item) => {
    const matchRole = Tap === "ALL" || item.kyNang === Tap;
    const matchTrangThai = item.trangThai === "Bản Nháp";
    return matchRole && matchTrangThai;
  });

  const currentListDaTao = DataThiThu.filter((item) => {
    const matchRole = Tap === "ALL" || item.kyNang === Tap;
    const matchTrangThai = item.trangThai === "Đã Tạo";
    return matchRole && matchTrangThai;
  });

  const dsTab = ["ALL", "Listening && Reading", "Speaking && Writing"];

  return (
    <section className="w-full mx-[10px] flex flex-col gap-4 relative mt-[10px]">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      {/* TABS & ADD BUTTON */}
      <div className="flex gap-2 justify-between items-center w-full">
        <div className="text-[#2A6770] font-medium text-[15px] flex gap-2 justify-start items-center flex-1">
          <div
            onClick={() => setThemTT(true)}
            className="shrink-0 cursor-pointer w-[35px] h-[35px] bg-[#114A53] rounded-[50%] flex justify-center items-center transition-all duration-300 hover:scale-[1.05]"
            title="Thêm thi thử mới"
          >
            <img
              className="w-[60%]"
              src="https://img.icons8.com/?size=100&id=3220&format=png&color=f7f7f7"
              alt="Thêm"
            />
          </div>

          <div className="flex gap-2 items-center overflow-x-auto flex-nowrap py-2 custom-scrollbar">
            {dsTab.map((t) => (
              <div
                key={t}
                onClick={() => setTap(t)}
                className={`shrink-0 cursor-pointer px-[15px] py-[10px] rounded-[10px] w-fit border transition-all duration-300 border-black/20 ${Tap === t && "bg-[#d7e8ec]"}`}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOX ĐỀ */}
      <div className="w-full flex flex-col mt-[10px]">
        {loading ? (
          <p className="text-center py-10 text-black/50 italic">
            Đang tải dữ liệu...
          </p>
        ) : (
          <>
            {/* DANH SÁCH BẢN NHÁP */}
            {currentListBanNhap?.length !== 0 && (
              <h3 className="font-bold text-[#114A53] text-[18px] mb-3">
                Bản Nháp
              </h3>
            )}

            <div className="flex flex-wrap gap-4 ">
              {currentListBanNhap.map((item) => (
                <div
                  key={item?._id}
                  className="relative w-[230px] h-[300px] gap-2 flex flex-col items-center bg-gradient-to-t from-[#2F8C8F] to-[#A9F9FC] rounded-2xl shadow-md "
                >
                  <div className="text-[20px] w-[180px] h-[38px] bg-[#0d2a2e] text-white rounded-b-[20px] flex justify-center items-center text-[14px] font-bold text-center px-2 truncate">
                    {item?.tenBoDe}
                  </div>
                  <p className="text-[20px] text-white font-extrabold mt-2 uppercase text-center leading-tight">
                    {item?.kyNang}
                  </p>

                  <p className="text-[14px] text-white font-medium truncate w-full text-center">
                    Đề: {item?.tenDe}
                  </p>
                  <p className="text-[12px] text-white/80 font-medium mt-1">
                    Ngày tạo: {item?.ngayTao}
                  </p>
                  <button
                    onClick={() => navigate(`/QL_chiTietThiThu/${item?._id}`)}
                    className="transition-all duration-300 hover:bg-[#174c54] hover:scale-[1.01] cursor-pointer w-[calc(100%-20px)] absolute bottom-[10px] py-[10px] bg-[#0d2a2e] font-extrabold text-[15px] text-white rounded-[10px]"
                  >
                    CHI TIẾT
                  </button>
                </div>
              ))}
            </div>

            <div className="w-full border border-t-black/20 my-[20px]"></div>

            {/* DANH SÁCH ĐÃ TẠO */}
            <h3 className="font-bold text-[#114A53] text-[18px] mb-[10px] ">
              Đã Tạo
            </h3>
            <div className="flex flex-wrap gap-4">
              {currentListDaTao.map((item) => (
                <div
                  key={item?._id}
                  className="relative w-[230px] h-[300px] gap-2 flex flex-col items-center bg-gradient-to-t from-[#2F8C8F] to-[#A9F9FC] rounded-2xl shadow-md "
                >
                  <div className="text-[20px] w-[180px] h-[38px] bg-[#0d2a2e] text-white rounded-b-[20px] flex justify-center items-center text-[14px] font-bold text-center px-2 truncate">
                    {item?.tenBoDe}
                  </div>
                  <p className="text-[20px] text-white font-extrabold mt-2 uppercase text-center leading-tight">
                    {item?.kyNang}
                  </p>

                  <p className="text-[14px] text-white font-medium truncate w-full text-center">
                    Đề: {item?.tenDe}
                  </p>
                  <p className="text-[12px] text-white/80 font-medium mt-1">
                    Ngày tạo: {item?.ngayTao}
                  </p>
                  <button
                    onClick={() => navigate(`/QL_chiTietThiThu/${item?._id}`)}
                    className="transition-all duration-300 hover:bg-[#174c54] hover:scale-[1.01] cursor-pointer w-[calc(100%-20px)] absolute bottom-[10px] py-[10px] bg-[#0d2a2e] font-extrabold text-[15px] text-white rounded-[10px]"
                  >
                    CHI TIẾT
                  </button>
                </div>
              ))}
              {currentListDaTao?.length === 0 && (
                <p className="text-black/50 italic px-2">
                  Không có đề thi nào đã tạo.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Thêm Thi Thử */}
      {ThemTT && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-[100] flex items-center justify-center">
          <div className="relative flex-col gap-[10px] w-[450px] bg-white rounded-[20px] px-[50px] py-[30px] flex justify-center items-center shadow-lg">
            <img
              onClick={() => setThemTT(false)}
              className="absolute w-[20px] top-[20px] right-[20px] cursor-pointer opacity-60 hover:opacity-100"
              src="https://img.icons8.com/?size=100&id=Emle2kcE82Fp&format=png&color=000000"
              alt="Đóng"
            />
            <h2 className="text-[#114A53] font-extrabold text-[20px] mb-2 uppercase">
              THÊM THI THỬ MỚI
            </h2>

            <div className="w-full mt-2">
              <p className="text-start text-[13px] mb-1 ">Tên Bộ Đề (*)</p>
              <input
                type="text"
                ref={inTenBoDe}
                placeholder="VD: ETS 2024"
                className={`w-full h-[40px] p-[10px] border rounded-[10px] text-[13px] outline-none focus:border-[#2A6770] ${errTenBoDe ? "border-red-500 bg-red-50" : "border-black/25"}`}
              />
            </div>

            <div className="w-full mt-2">
              <p className="text-start text-[13px] mb-1 ">Tên Đề (*)</p>
              <input
                type="text"
                ref={inTenDe}
                placeholder="VD: Đề 01"
                className={`w-full h-[40px] p-[10px] border rounded-[10px] text-[13px] outline-none focus:border-[#2A6770] ${errTenDe ? "border-red-500 bg-red-50" : "border-black/25"}`}
              />
            </div>

            <div className="w-full mt-2">
              <p className="text-start text-[13px] mb-1 ">Kỹ Năng (*)</p>
              {DrKyNang && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDrKyNang(false);
                  }}
                  className="w-screen h-screen fixed  top-0 left-0"
                ></div>
              )}

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDrKyNang(true);
                }}
                className="relative w-full flex items-center h-[40px] px-[10px] border border-black/25 rounded-[10px] text-[13px] outline-none focus:border-[#2A6770] cursor-pointer"
              >
                {chonKyNang}
                {DrKyNang && (
                  <div className="w-full absolute py-[10px] z-10 bg-white border border-black/20 rounded-[10px] top-[40px] left-0 shadow-lg">
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        setChonKyNang("Listening && Reading");
                        setDrKyNang(false);
                      }}
                      className="px-[10px] py-[5px] transition-all duration-300 hover:bg-[#d7e8ec] cursor-pointer"
                    >
                      Listening && Reading
                    </p>
                    <p
                      onClick={(e) => {
                        e.stopPropagation();
                        setChonKyNang("Speaking && Writing");
                        setDrKyNang(false);
                      }}
                      className="px-[10px] py-[5px] transition-all duration-300 hover:bg-[#d7e8ec] cursor-pointer"
                    >
                      Speaking && Writing
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleThemThiThu}
              className="font-extrabold text-white bg-[#287678] w-full h-[43px] rounded-[10px] flex justify-center items-center mt-4 transition-all hover:bg-[#114A53]"
            >
              Tạo Mới
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
