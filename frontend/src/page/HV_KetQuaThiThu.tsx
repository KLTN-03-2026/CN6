import { useEffect, useState } from "react";
import Header from "./componan/header";
import Sidebar from "./componan/sidebar";
import { useParams } from "react-router-dom";
import { BACKEND_URL } from "./FileThongso";

export default function HV_KetQuaThiThu() {
  const { id } = useParams();

  const [Token] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [flat, setFlat] = useState<any[]>([]);
  const [sidebarData, setSidebarData] = useState<any[]>([]);
  const [Chon, setChon] = useState(0);

  const getFullUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BACKEND_URL}/${path}`;
  };

  const layData = async () => {
    try {
      setLoading(true);
      if (!Token) return;

      const rAuth = await fetch(`${BACKEND_URL}/api/xacThuc-thongTinTk`, {
        headers: { Authorization: Token },
      });
      const jAuth = await rAuth.json();
      if (
        jAuth.trangThai === "tc" &&
        (jAuth.data?.Email || jAuth.data?.email)
      ) {
        const email = jAuth.data.Email || jAuth.data.email;

        const rDetails = await fetch(
          `${BACKEND_URL}/api/chi-tiet-thi-thu-da-lam?email=${encodeURIComponent(email)}&idThiThu=${id}`,
        );
        const jDetails = await rDetails.json();
        if (jDetails.trangThai === "tc" && jDetails.data?.length > 0) {
          const sorted = jDetails.data.sort((a: any, b: any) => {
            const aFirst = a.noiDungCauHoi?.[0]?.soCau ?? 0;
            const bFirst = b.noiDungCauHoi?.[0]?.soCau ?? 0;
            return aFirst - bFirst;
          });

          const tempFlat: any[] = [];
          sorted.forEach((row: any, rIdx: number) => {
            row.noiDungCauHoi.forEach((q: any, cIdx: number) => {
              const type = Number(row.type ?? q.type ?? 0);
              let isCham = false;
              let dungSai = "";
              let finalDapAnHV = q.dapAn || "";

              if (finalDapAnHV === "Học viên chưa làm bài...") {
                finalDapAnHV = "";
              }

              // Extract correct answer for MCQ
              let correctAns = "";
              if (type !== 1 && type !== 2 && type !== 3) {
                isCham = true;
                const isCorrect = q.loiPheAI === "Chính xác!";
                dungSai = isCorrect ? "dung" : "sai";

                if (isCorrect) {
                  correctAns = finalDapAnHV;
                } else if (q.loiPheAI && q.loiPheAI.includes("Đáp án đúng: ")) {
                  const match = q.loiPheAI.match(/Đáp án đúng:\s*([A-Za-z])/);
                  if (match) {
                    correctAns = match[1].toLowerCase();
                  }
                }
              }

              tempFlat.push({
                rIdx,
                cIdx,
                soCau: q.soCau,
                tenPart: row.tenPart,
                type: type,
                fileNghe: row.fileNghe,
                anh: row.anh,
                noiDungDoc: row.noiDungDoc,
                cauHoi: q.cauHoi,
                a: q.a,
                b: q.b,
                c: q.c,
                d: q.d,
                dapAnHocVien: finalDapAnHV,
                correctAns,
                isCham,
                dungSai,
                giaiThich: q.giaiThich,
                loiPheAI: q.loiPheAI,
              });
            });
          });

          setFlat(tempFlat);

          // Group by part to fix sidebar duplicate headers
          const groupedSidebar: { text: string; slCauHoi: number }[] = [];
          sorted.forEach((row: any) => {
            const partName = row.tenPart || "Phần thi";
            const numQuestions = row.noiDungCauHoi?.length ?? 0;
            const existing = groupedSidebar.find(
              (item) => item.text === partName,
            );
            if (existing) {
              existing.slCauHoi += numQuestions;
            } else {
              groupedSidebar.push({
                text: partName,
                slCauHoi: numQuestions,
              });
            }
          });

          setSidebarData(groupedSidebar);
        }
      }
    } catch (err) {
      console.log("Lỗi lấy chi tiết bài thi đã làm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    layData();
  }, [id]);

  const clickChon = (i: number) => {
    if (i >= 0 && i < flat.length) {
      setChon(i);
    }
  };

  if (loading) {
    return (
      <>
        <Header type="khien" nopbai={() => {}} />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-[50px] h-[50px] border-4 border-[#2f6169] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#2f6169] font-medium">
              Đang tải dữ liệu kết quả...
            </p>
          </div>
        </div>
      </>
    );
  }

  const currentQ = flat[Chon];
  const hasLeftPanel = currentQ && (currentQ.noiDungDoc || currentQ.anh);

  return (
    <>
      <Header type="khien" nopbai={() => {}} />

      <section className="mx-[10px] flex relative gap-3">
        {/* Sidebar bên trái */}
        <Sidebar
          Type="bt"
          data={sidebarData}
          Chon={Chon}
          ClickChon={clickChon}
          dapAN={flat}
        />

        {/* Khu vực hiển thị kết quả */}
        <section className="overflow-hidden flex justify-center w-full bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F] h-[calc(100vh-85px)] rounded-[20px] p-[20px]">
          {currentQ ? (
            <div
              className={`w-full h-full flex transition-all duration-500 gap-6 ${
                hasLeftPanel ? "max-w-[1300px]" : "max-w-[700px] justify-center"
              }`}
            >
              {/* ── BÊN TRÁI: chỉ hiện khi có noiDungDoc hoặc anh ── */}
              {hasLeftPanel && (
                <div className="w-1/2 h-full bg-white rounded-[15px] p-[20px] overflow-y-auto flex flex-col gap-4 shadow-sm scrollbar-hide">
                  {currentQ.anh && (
                    <img
                      className="w-full object-contain rounded-lg border border-black/5"
                      src={getFullUrl(currentQ.anh)}
                      alt="Hình ảnh đề bài"
                    />
                  )}
                  {currentQ.noiDungDoc && (
                    <>
                      <p className="font-bold text-[#2A6770] text-[14px] uppercase tracking-wide">
                        Nội dung bài đọc
                      </p>
                      <div className="text-[15px] leading-[1.8] whitespace-pre-wrap text-black/85 font-serif">
                        {currentQ.noiDungDoc}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── BÊN PHẢI / HOẶC BOX CHÍNH GIỮA (Nếu không có panel trái) ── */}
              <div
                className={`${
                  hasLeftPanel ? "w-1/2" : "w-full"
                } h-full bg-white rounded-[15px] p-[30px] shadow-sm overflow-y-auto flex flex-col justify-between scrollbar-hide`}
              >
                <div className="flex flex-col gap-6">
                  {/* File nghe (nếu có) */}
                  {currentQ.fileNghe !== "" && (
                    <audio key={Chon} controls className="w-full">
                      <source
                        src={getFullUrl(currentQ.fileNghe)}
                        type="audio/mpeg"
                      />
                    </audio>
                  )}

                  {/* Nội dung câu hỏi */}
                  <div className="text-[15px] w-full flex flex-col gap-2">
                    <p className="font-medium text-black">
                      câu hỏi {Chon + 1}: {currentQ.cauHoi}
                    </p>

                    {currentQ.type !== 1 &&
                    currentQ.type !== 2 &&
                    currentQ.type !== 3 ? (
                      /* MCQ Options */
                      <div className="flex flex-col gap-2 mt-[10px]">
                        {(
                          [
                            { key: "a" },
                            { key: "b" },
                            { key: "c" },
                            { key: "d" },
                          ] as const
                        ).map(({ key }) => {
                          const optVal = currentQ[key];
                          if (!optVal) return null;

                          const dAnDung = currentQ.correctAns;
                          const dAnHV = currentQ.dapAnHocVien;

                          return (
                            <div
                              key={key}
                              className={`flex items-center gap-3 p-3 rounded-[15px] transition-all cursor-pointer ${
                                dAnHV === key
                                  ? ""
                                  : "bg-transparent border-black/5 hover:border-[#2A6770]/30"
                              }`}
                            >
                              <div
                                className={`w-[22px] shrink-0 h-[22px] rounded-full border flex items-center justify-center ${
                                  dAnHV === key
                                    ? "border-[#2A6770]"
                                    : "border-black/20"
                                }`}
                              >
                                {dAnHV === key && (
                                  <div className="w-[12px] h-[12px] bg-[#2A6770] rounded-full " />
                                )}
                              </div>
                              <span
                                className={`text-[15px] ${
                                  key === dAnDung
                                    ? "text-green-600 font-medium"
                                    : key === dAnHV
                                      ? "text-red-600 font-medium"
                                      : ""
                                }`}
                              >
                                {optVal}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : currentQ.type === 3 ? (
                      /* Speaking */
                      <div className="border border-black/30 p-[15px] rounded-[20px] w-full flex flex-col justify-center items-center gap-2 mt-[10px]">
                        <p className="text-[13px] text-black/60 font-bold mb-1">
                          Bài nói ghi âm của bạn:
                        </p>
                        {currentQ.dapAnHocVien ? (
                          <audio key={Chon} controls className="w-full">
                            <source
                              src={getFullUrl(currentQ.dapAnHocVien)}
                              type="audio/mpeg"
                            />
                          </audio>
                        ) : (
                          <p className="text-[14px] text-black/40 italic">
                            Học viên không ghi âm bài nói này.
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Writing */
                      <textarea
                        key={Chon}
                        defaultValue={`${currentQ.dapAnHocVien}`}
                        className="p-[15px] h-[150px] bg-[#d7e8ec] w-full rounded-[10px] focus:outline-none text-[15px] mt-[10px]"
                        readOnly
                      />
                    )}
                  </div>

                  {/* Hộp Giải thích & Nhận xét */}
                  <div className="p-[20px] border border-black/20 bg-[#dee9ea20]  rounded-[10px] w-full mt-[10px]">
                    <p className="font-medium text-[#114A53]">
                      Giải thích & Nhận xét:
                    </p>
                    <div className="text-[15px] leading-relaxed text-black/80 mt-1 whitespace-pre-wrap">
                      {currentQ.giaiThich ||
                        "Không có hướng dẫn giải từ giáo viên."}
                      {currentQ.loiPheAI && (
                        <p className="mt-3 pt-3 border-t border-black/10 text-black/80">
                          <strong>Nhận xét từ cú:</strong> {currentQ.loiPheAI}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nút Điều Hướng */}
                <div className="w-full mt-[20px] flex justify-between items-center border-t border-black/20 pt-[15px]">
                  <span className="text-[13px] text-black/40 italic"></span>
                  <button
                    onClick={() => {
                      if (Chon < flat.length - 1) clickChon(Chon + 1);
                    }}
                    disabled={Chon === flat.length - 1}
                    className="text-[15px] px-[24px] py-[10px] bg-[#2A6770] text-white rounded-[15px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Tiếp Theo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center w-full h-full bg-white rounded-[20px]">
              <p className="text-black/40 font-bold">
                Không tìm thấy chi tiết kết quả.
              </p>
            </div>
          )}
        </section>
      </section>
    </>
  );
}
