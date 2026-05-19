import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./componan/header";
import { BACKEND_URL } from "./FileThongso";
import Box_HV_LuyenDe from "./componan/box_hv_luyende";
import Alert from "./componan/aletr";

// Định nghĩa cấu trúc Part theo kỹ năng
const getDsPart = (kyNang: string) => {
  const kn = kyNang?.toLowerCase();

  if (kn === "listening") {
    return [
      { tenPart: "Part 1", soCau: 6, soCauBatDau: 1 },
      { tenPart: "Part 2", soCau: 25, soCauBatDau: 7 },
      { tenPart: "Part 3", soCau: 39, soCauBatDau: 32 },
      { tenPart: "Part 4", soCau: 30, soCauBatDau: 71 },
    ];
  } else if (kn === "reading") {
    return [
      { tenPart: "Part 5", soCau: 30, soCauBatDau: 1 },
      { tenPart: "Part 6", soCau: 16, soCauBatDau: 31 },
      { tenPart: "Part 7", soCau: 54, soCauBatDau: 47 },
    ];
  } else if (kn === "writing") {
    return [
      { tenPart: "Câu 1-5", soCau: 5, soCauBatDau: 1 },
      { tenPart: "Câu 6-7", soCau: 2, soCauBatDau: 6 },
      { tenPart: "Câu 8", soCau: 1, soCauBatDau: 8 },
    ];
  } else if (kn === "speaking") {
    return [
      { tenPart: "Câu 1-2", soCau: 2, soCauBatDau: 1 },
      { tenPart: "Câu 3-4", soCau: 2, soCauBatDau: 3 },
      { tenPart: "Câu 5-7", soCau: 3, soCauBatDau: 5 },
      { tenPart: "Câu 8-10", soCau: 3, soCauBatDau: 8 },
      { tenPart: "Câu 11", soCau: 1, soCauBatDau: 11 },
    ];
  }
  return [];
};

export default function HV_chiTietLuyenDe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [DataLuyenDe, setDataLuyenDe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const layData = async () => {
    try {
      setLoading(true);
      const api = await fetch(`${BACKEND_URL}/api/luyen-de/${id}`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataLuyenDe(req.data);
      }
    } catch (err) {
      console.log("Lỗi lấy dữ liệu luyện đề:", err);
    } finally {
      setLoading(false);
    }
  };

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  useEffect(() => {
    layData();
  }, [id]);

  const dsPart = getDsPart(DataLuyenDe?.kyNang || "");
  const kiemTra = async (tenPart: string) => {
    console.log("kiểm tra hóa đơn tài khoản");

    try {
      const api = await fetch(`${BACKEND_URL}/api/kt-trung-khoa-hoc`, {
        method: "GET",
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      console.log(req.trangThai);

      if (req.trangThai) {
        settb(true);
        settypeTB("w"); // w , err,ss
        setNdTB("Bạn cần mua khóa học để sử dụng chức năng này");
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w"); // w , err,ss
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      } else if (!req.trangThai) {
        navigate(`/HV_LamBaiLuyenDe/${id}/${encodeURIComponent(tenPart)}`);
      }
    } catch (err) {
      console.log("kiểm tra mua khóa học thất bại : " + err);
    }
  };

  const tongSoCau =
    DataLuyenDe?.kyNang === "Writing"
      ? 8
      : DataLuyenDe?.kyNang === "Speaking"
        ? 11
        : 100;

  return (
    <>
      <Header type="hien" />
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      <section className="mx-[50px] my-[20px]">
        {loading ? (
          <p className="text-center text-black/50 italic py-20 animate-pulse">
            Đang tải...
          </p>
        ) : (
          <>
            {/* ===== THÔNG TIN ĐỀ ===== */}
            <div className="w-full my-[40px] flex gap-10 justify-center ">
              {/* Card đề */}
              <div className="relative w-[220px] h-[270px] shrink-0 gap-2 flex flex-col items-center bg-gradient-to-t from-[#2F8C8F] to-[#A9F9FC] rounded-2xl shadow-md">
                <div className="w-[150px] h-[38px] bg-[#0d2a2e] text-white rounded-b-[20px] flex justify-center items-center text-[16px] font-bold text-center px-2 truncate">
                  {DataLuyenDe?.tenBoDe}
                </div>
                <p className="text-[28px] text-white font-extrabold mt-2 uppercase">
                  {DataLuyenDe?.kyNang}
                </p>
                <p className="text-[18px] text-white font-medium truncate px-2 w-full text-center">
                  {DataLuyenDe?.tenDe}
                </p>
                <p className="text-[14px] text-white/80 font-medium mt-1">
                  {tongSoCau} Câu
                </p>
                <div className="w-[calc(100%-20px)] absolute bottom-[10px] py-[10px] bg-[#0d2a2e50] font-extrabold text-[15px] text-white rounded-[10px] text-center">
                  Luyện Đề
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="flex flex-col gap-3">
                <h2 className="text-[28px] font-bold text-[#0d2a2e]">
                  [{DataLuyenDe?.ngayTao || "N/A"}]<> </>
                  {DataLuyenDe?.tenDe} - {DataLuyenDe?.tenBoDe}
                </h2>
                <p className="text-[15px] text-black/60">
                  Bài kiểm tra kỹ năng:
                </p>
                <div className="flex gap-2 flex-wrap">
                  <div className="px-[15px] py-[8px] rounded-[20px] w-fit text-[#0d2a2e] font-semibold text-[14px] bg-[#d7e8ec] border border-[#2F8C8F]">
                    {DataLuyenDe?.kyNang}
                  </div>
                  <div className="px-[15px] py-[8px] rounded-[20px] w-fit text-[#0d2a2e] font-semibold text-[14px] bg-[#d7e8ec]">
                    {tongSoCau} Câu hỏi
                  </div>
                </div>
              </div>
            </div>

            {/* ===== DANH SÁCH PART ===== */}
            <div className="w-full flex flex-col items-center gap-4 mb-[60px]">
              <div className="w-[900px]">
                <h2 className="w-full text-left text-[22px] font-bold text-[#114A53] mb-[10px]">
                  Danh sách các Part
                </h2>
              </div>

              {dsPart.map((part, idx) => (
                <div
                  key={idx}
                  className="relative p-[15px] flex gap-[15px] items-center w-[900px] border border-black/20 rounded-[12px] bg-white hover:bg-[#f0f9fa] transition-all duration-200"
                >
                  {/* Icon số thứ tự */}
                  <div className="w-[55px] h-[55px] shrink-0 bg-[#d7e8ec] rounded-[10px] flex justify-center items-center">
                    <img
                      className="w-[80%]"
                      src="https://img.icons8.com/?size=100&id=RRYSfrLh1mcE&format=png&color=174c54"
                      alt=""
                    />
                  </div>

                  {/* Tên part & số câu */}
                  <div className="flex flex-col gap-1 flex-1">
                    <p className=" text-[20px] font-bold text-[#0d2a2e]">
                      {part.tenPart}
                    </p>
                    <p className="text-[13px] text-black/50">
                      {part.soCau} câu hỏi · Bắt đầu từ câu {part.soCauBatDau}
                    </p>
                  </div>

                  {/* Nút làm bài */}
                  <button
                    onClick={() => {
                      kiemTra(part.tenPart);
                    }}
                    className="absolute right-[20px] transition-all duration-300 cursor-pointer bg-[#0d2a2e] hover:bg-[#174c54] text-white px-[20px] py-[10px] rounded-[20px] font-semibold text-[14px]"
                  >
                    Làm ngay →
                  </button>
                </div>
              ))}

              {dsPart.length === 0 && !loading && (
                <p className="text-black/40 italic">
                  Không có dữ liệu cho kỹ năng này.
                </p>
              )}
            </div>
          </>
        )}
        <Box_HV_LuyenDe />
      </section>
    </>
  );
}
