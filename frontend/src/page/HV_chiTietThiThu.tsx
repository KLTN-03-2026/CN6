import { useEffect, useState } from "react";
import Header from "./componan/header";
import { BACKEND_URL } from "./FileThongso";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "./componan/aletr";

export default function HV_chiTietThiThu() {
  const { id } = useParams();
  const chuyenTrang = useNavigate();

  const [Token] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const [dataThiThu, setDataThiThu] = useState<any>(null);
  const [daLam, setDaLam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");
  const TatThongBao = () => settb(false);

  const layData = async () => {
    try {
      setLoading(true);
      // 1. Lấy thông tin đề thi
      const r1 = await fetch(`${BACKEND_URL}/api/thi-thu/${id}`);
      const j1 = await r1.json();
      if (j1.trangThai === "tc") setDataThiThu(j1.data);

      // 2. Kiểm tra xem user đã làm chưa
      if (Token) {
        const r2 = await fetch(`${BACKEND_URL}/api/xacThuc-thongTinTk`, {
          headers: { Authorization: Token },
        });
        const j2 = await r2.json();
        const email = j2.data?.Email || j2.data?.email;
        if (j2.trangThai === "tc" && email) {
          const r3 = await fetch(
            `${BACKEND_URL}/api/thi-thu-da-lam?email=${encodeURIComponent(email)}&idThiThu=${id}`,
          );
          const j3 = await r3.json();
          if (j3.trangThai === "tc" && j3.data?.length > 0) {
            setDaLam(j3.data[0]);
          }
        }
      }
    } catch (err) {
      console.log("Lỗi lấy dữ liệu chi tiết thi thử:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    layData();
  }, [id]);

  const isLR = dataThiThu?.kyNang?.toLowerCase() === "listening && reading";

  const thoiGianPhut = isLR ? 120 : 80;
  const soCau = isLR
    ? "200 câu (Listening & Reading)"
    : "19 câu (Speaking && Writing)";

  const handleBatDau = async () => {
    if (!Token) {
      settb(true);
      settypeTB("w");
      setNdTB("Bạn cần đăng nhập để bắt đầu làm bài thi thử!");
      return;
    }
    try {
      // Bước 1: Kiểm tra phiên đăng nhập còn hiệu lực không
      const r = await fetch(`${BACKEND_URL}/api/xacThuc-thongTinTk`, {
        headers: { Authorization: Token },
      });
      const j = await r.json();
      if (j.trangThai !== "tc") {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
        return;
      }

      // Bước 2: Kiểm tra đã mua khóa học chưa
      const rKH = await fetch(`${BACKEND_URL}/api/kt-trung-khoa-hoc`, {
        method: "GET",
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const jKH = await rKH.json();

      if (jKH.trangThai === "hh") {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
      } else if (jKH.trangThai) {
        // trangThai = true => chưa mua khóa học
        settb(true);
        settypeTB("w");
        setNdTB("Bạn cần mua khóa học để sử dụng chức năng này!");
      } else {
        // !trangThai => đã mua khóa học, cho vào làm bài
        chuyenTrang(`/HV_LamBaiThiThu/${id}`);
      }
    } catch {
      settb(true);
      settypeTB("err");
      setNdTB("Lỗi kết nối đến máy chủ!");
    }
  };

  const handleXemChiTiet = () => {
    chuyenTrang(`/HV_KetQuaThiThu/${id}`);
  };

  if (loading) {
    return (
      <>
        <Header type="hien" nopbai={() => {}} />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-[50px] h-[50px] border-4 border-[#2f6169] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#2f6169] font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      <Header type="hien" nopbai={() => {}} />

      <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#f0f9fa] via-white to-[#e6f4f5] flex items-center justify-center px-[20px] py-[40px]">
        <div className="w-full max-w-[1100px] flex items-center gap-[60px] flex-wrap justify-center">
          {/* ---- Phần nội dung bên trái ---- */}
          <div className="flex-1 min-w-[320px] max-w-[600px] flex flex-col gap-6">
            {/* Tag kỹ năng */}
            <div className="flex gap-2 flex-wrap">
              <span className="px-[14px] py-[6px] rounded-full bg-[#d7e8ec] text-[#2f6169] text-[13px] font-bold uppercase tracking-wide">
                {dataThiThu?.kyNang || "Thi Thử TOEIC"}
              </span>
              <span className="px-[14px] py-[6px] rounded-full bg-[#114a53]/10 text-[#114a53] text-[13px] font-bold">
                {dataThiThu?.tenBoDe}
              </span>
            </div>

            {/* Tiêu đề lớn */}
            <h1 className="font-extrabold text-[42px] leading-tight bg-gradient-to-b from-[#4ADADE] to-[#1a6b70] bg-clip-text text-transparent">
              Thi thử TOEIC đầy đủ
            </h1>

            <p className="text-[18px] text-black/70 leading-relaxed">
              Luyện thi TOEIC theo đúng format thi thật.
            </p>
            <p className="text-[16px] text-black/60 leading-relaxed">
              Bài thi thử được thiết kế sát với đề thi TOEIC chính thức, giúp
              bạn làm quen với cấu trúc và độ khó thật của bài thi. Hệ thống sẽ
              chấm điểm tự động và phân tích chi tiết kết quả sau khi hoàn
              thành.
            </p>

            {/* Thông tin nhanh */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: "https://img.icons8.com/?size=100&id=83976&format=png&color=155259",
                  label: "Thời gian",
                  value: `${thoiGianPhut} phút`,
                },
                {
                  icon: "https://img.icons8.com/?size=100&id=84394&format=png&color=155259",
                  label: "Số câu hỏi",
                  value: soCau,
                },
                {
                  icon: "https://img.icons8.com/?size=100&id=16421&format=png&color=155259",
                  label: "Kết quả",
                  value: "Ngay lập tức",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white border border-black/20 rounded-[14px] p-[16px] flex flex-col gap-1 shadow-sm"
                >
                  <img
                    className="text-[22px] w-[35px]"
                    src={`${item.icon}`}
                  ></img>
                  <p className="text-[11px] text-black/50 font-medium">
                    {item.label}
                  </p>
                  <p className="text-[13px] font-bold text-[#2f6169]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Thông tin đề */}
            <div className="bg-white border border-black/20 rounded-[16px] p-[20px] flex flex-col gap-3 shadow-sm">
              <p className="font-bold text-[#2f6169] text-[15px] mb-1">
                Thông tin đề thi
              </p>
              {[
                { label: "Tên đề:", value: dataThiThu?.tenDe },
                { label: "Bộ đề:", value: dataThiThu?.tenBoDe },
                { label: "Kỹ năng:", value: dataThiThu?.kyNang },
                { label: "Ngày tạo:", value: dataThiThu?.ngayTao },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex gap-2 items-center text-[14px]"
                >
                  <span className="text-black/50 min-w-[90px]">{r.label}</span>
                  <span className="font-semibold text-black/80">
                    {r.value || "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Kết quả cũ (nếu đã làm) */}
            {daLam && (
              <div className="bg-[#d5f5f775] border border-black/20 rounded-[16px] p-[20px] flex items-center justify-between gap-4 shadow-sm">
                <div className="flex flex-col gap-1">
                  <p className="text-[13px] text-black/50 font-medium">
                    Kết quả lần trước
                  </p>
                  <p className="text-[28px] font-extrabold text-[#2f6169]">
                    {daLam.diem}{" "}
                    <span className="text-[16px] font-medium text-black/40">
                      điểm
                    </span>
                  </p>
                  <p className="text-[12px] text-black/40">
                    Ngày thi: {daLam.ngayTao}
                  </p>
                </div>
                <div className="w-[60px] h-[60px] rounded-full bg-[#2f6169]/10 flex items-center justify-center text-[28px]">
                  <img
                    className="w-[60%]"
                    src="https://img.icons8.com/?size=100&id=9761&format=png&color=226c6f"
                    alt=""
                  />
                </div>
              </div>
            )}

            {/* Nút hành động */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleBatDau}
                className="flex-1 min-w-[200px] py-[16px] rounded-[14px] bg-gradient-to-r from-[#114a53] to-[#287678] text-white font-extrabold text-[16px] shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {daLam ? "KIỂM TRA LẠI" : " BẮT ĐẦU THI THỬ NGAY"}
              </button>

              {daLam && (
                <button
                  onClick={handleXemChiTiet}
                  className="px-[24px] py-[16px] rounded-[14px] border-2 border-[#2f6169] text-[#2f6169] font-bold text-[15px] hover:bg-[#d7e8ec] transition-all duration-300 cursor-pointer"
                >
                  XEM CHI TIẾT
                </button>
              )}
            </div>
          </div>

          {/* ---- Phần ảnh bên phải ---- */}
          <div className="w-[420px] shrink-0 hidden lg:block">
            <div className="relative">
              {/* Vòng trang trí */}
              <div className="absolute -top-[20px] -right-[20px] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#4ADADE]/20 to-[#287678]/10 blur-[40px]" />
              <div className="absolute -bottom-[20px] -left-[20px] w-[150px] h-[150px] rounded-full bg-gradient-to-br from-[#114a53]/20 to-[#4ADADE]/10 blur-[30px]" />

              {/* Card nổi */}
              <div className="relative bg-white rounded-[24px] shadow-2xl p-[30px] flex flex-col gap-5 border border-black/20">
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#d7e8ec] to-[#a8f8fb]/50 rounded-[16px] flex items-center justify-center">
                  <span className="text-[60px] font-bold text-[#155259]">
                    {dataThiThu?.tenDe}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    {
                      icon: "https://img.icons8.com/?size=100&id=40902&format=png&color=267174",
                      text: "Sát với đề thi TOEIC thật",
                    },
                    {
                      icon: "https://img.icons8.com/?size=100&id=40902&format=png&color=267174",
                      text: "Chấm điểm tự động sau khi nộp",
                    },
                    {
                      icon: "https://img.icons8.com/?size=100&id=40902&format=png&color=267174",
                      text: "Phân tích lỗi sai chi tiết từng câu",
                    },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <img
                        className="text-[16px] w-[25px]"
                        src={`${item.icon}`}
                      ></img>
                      <p className="text-[14px] text-black/70 font-medium">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Badge trạng thái */}
                <div
                  className={`w-full text-center py-[10px] rounded-[10px] font-bold text-[13px] ${
                    daLam
                      ? "bg-[#d7f0e6] text-[#1a7a4a]"
                      : "bg-[#d7e8ec] text-[#2f6169]"
                  }`}
                >
                  {daLam ? "Bạn đã làm bài này" : "Chưa làm bài"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
