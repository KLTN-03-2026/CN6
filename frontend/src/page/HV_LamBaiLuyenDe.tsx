import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./componan/header";
import Sidebar from "./componan/sidebar";
import { BACKEND_URL } from "./FileThongso";
import Load from "./componan/load";

const getFullUrl = (url: string) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

// ============================================================
// Trang chính
// ============================================================
export default function HV_LamBaiLuyenDe() {
  const { id, tenPart } = useParams<{ id: string; tenPart: string }>();
  const navigate = useNavigate();

  const [Token] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    return check ? JSON.parse(check) : null;
  });

  const tenPartHienThi = decodeURIComponent(tenPart || "");

  // Danh sách rows của part
  const [rows, setRows] = useState<any[]>([]);
  // Flatten: mỗi phần tử là { rowIdx, cauIdx }
  const [flatCauHoi, setFlatCauHoi] = useState<
    { rowIdx: number; cauIdx: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dangCham, setDangCham] = useState(false);

  const [viTri, setViTri] = useState(0);

  // Đáp án học viên
  const [dapAnHocVien, setDapAnHocVien] = useState<string[]>([]);
  // Blob ghi âm từng câu
  const [fileBlobArr, setFileBlobArr] = useState<any[]>([]);
  // Link âm thanh nghe lại từng câu
  const [linkAmThanhArr, setLinkAmThanhArr] = useState<(string | null)[]>([]);
  // Đã chấm chưa
  const [daDuocCham, setDaDuocCham] = useState<boolean[]>([]);
  // Nhận xét AI
  const [nhanXetAI, setNhanXetAI] = useState<string[]>([]);

  const layData = async () => {
    try {
      setLoading(true);
      const api = await fetch(`${BACKEND_URL}/api/chi-tiet-luyen-de/${id}`);
      const req = await api.json();
      if (req.trangThai === "tc" && req.data) {
        const partRows = req.data.filter(
          (r: any) =>
            r.tenPart === tenPartHienThi ||
            (r.tenPart === "Writing" && tenPartHienThi.startsWith("Câu")),
        );
        setRows(partRows);

        const flat: { rowIdx: number; cauIdx: number }[] = [];
        partRows.forEach((r: any, ri: number) => {
          r.noiDungCauHoi?.forEach((_: any, ci: number) => {
            flat.push({ rowIdx: ri, cauIdx: ci });
          });
        });
        setFlatCauHoi(flat);
        const len = flat.length;
        setDapAnHocVien(Array(len).fill(""));
        setFileBlobArr(Array(len).fill(null));
        setLinkAmThanhArr(Array(len).fill(null));
        setDaDuocCham(Array(len).fill(false));
        setNhanXetAI(Array(len).fill(""));
      }
    } catch (err) {
      console.log("Lỗi lấy dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    layData();
  }, [id, tenPart]);

  const curFlat = flatCauHoi[viTri];
  const curRow = curFlat ? rows[curFlat.rowIdx] : null;
  // type đọc từ row (cấp chung) hoặc từ câu con nếu có
  const curCau = curRow?.noiDungCauHoi?.[curFlat?.cauIdx ?? 0];
  const curType = Number(curRow?.type ?? curCau?.type ?? 0);

  const sidebarData = [
    {
      text: tenPartHienThi,
      slCauHoi: flatCauHoi.length,
    },
  ];

  const clickChon = (i: number) => {
    if (i >= 0 && i < flatCauHoi.length) setViTri(i);
  };

  // ---- Ghi âm ----
  const [dangGhiAm, setDangGhiAm] = useState(false);
  const [thoiGianGhiAm, setThoiGianGhiAm] = useState(120);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const cacManhAmThanh = useRef<BlobPart[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset ghi âm khi chuyển câu
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDangGhiAm(false);
    setThoiGianGhiAm(120);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  }, [viTri]);

  const batDauGhiAm = async () => {
    try {
      const luong = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mayGhiAm = new MediaRecorder(luong);
      mediaRecorderRef.current = mayGhiAm;
      cacManhAmThanh.current = [];
      mayGhiAm.ondataavailable = (e) => {
        if (e.data.size > 0) cacManhAmThanh.current.push(e.data);
      };
      mayGhiAm.onstop = () => {
        const blob = new Blob(cacManhAmThanh.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setFileBlobArr((prev) => {
          const n = [...prev];
          n[viTri] = blob;
          return n;
        });
        setLinkAmThanhArr((prev) => {
          const n = [...prev];
          n[viTri] = url;
          return n;
        });
        setDapAnHocVien((prev) => {
          const n = [...prev];
          n[viTri] = url;
          return n;
        });
      };
      mayGhiAm.start();
      setDangGhiAm(true);
      setThoiGianGhiAm(120);
      setLinkAmThanhArr((prev) => {
        const n = [...prev];
        n[viTri] = null;
        return n;
      });

      intervalRef.current = setInterval(() => {
        setThoiGianGhiAm((prev) => {
          if (prev <= 1) {
            dungGhiAm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Dừng ghi âm sau 2 phút
      timeoutRef.current = setTimeout(() => {
        dungGhiAm();
      }, 120000);
    } catch {
      alert("Vui lòng cho phép trình duyệt sử dụng Micro của bạn!");
    }
  };

  const dungGhiAm = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setDangGhiAm(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ---- Chấm ----
  const handleCham = async (idx: number = viTri) => {
    const cau = flatCauHoi[idx];
    const row = rows[cau.rowIdx];
    const targetCau = row.noiDungCauHoi[cau.cauIdx];
    const targetType = Number(row.type ?? targetCau.type ?? 0);

    if (!targetCau) return;

    // MCQ → chấm ngay
    if (targetType === 0) {
      setDaDuocCham((prev) => {
        const n = [...prev];
        n[idx] = true;
        return n;
      });
      return;
    }

    setDangCham(true);
    try {
      let dAnHV = dapAnHocVien[idx] || "";

      // Kiểm tra nếu học viên chưa làm bài đối với Speaking và Writing
      const isSpeakingUnanswered = targetType === 3 && !fileBlobArr[idx];
      const isWritingUnanswered =
        (targetType === 1 || targetType === 2) && (!dAnHV || !dAnHV.trim());

      if (isSpeakingUnanswered || isWritingUnanswered) {
        setNhanXetAI((prev) => {
          const n = [...prev];
          n[idx] =
            "Học viên chưa làm bài câu hỏi này. Điểm số: 0/8. Nhận xét: Không nhận diện được câu trả lời từ học viên.";
          return n;
        });
        setDaDuocCham((prev) => {
          const n = [...prev];
          n[idx] = true;
          return n;
        });
        setDangCham(false);
        return;
      }

      // Nếu là ghi âm, upload file trước
      if (targetType === 3) {
        const blob = fileBlobArr[idx];
        if (blob) {
          const fd = new FormData();
          fd.append("fileGhiAm", blob, `speaking_${Date.now()}.webm`);
          const up = await fetch(`${BACKEND_URL}/api/uploadAudio`, {
            method: "POST",
            body: fd,
          });
          const upReq = await up.json();
          if (upReq.trangThai === "tc") dAnHV = upReq.linkAmThanh;
        }
      }

      const endpoint =
        targetType === 3
          ? `${BACKEND_URL}/api/chamDiemSpeaking`
          : `${BACKEND_URL}/api/chamDiemTuLuan`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({
          CauHoi: targetCau.cauHoi,
          dapAnHocVien: dAnHV,
          giaiThich: targetCau.giaiThich,
          anh: row?.anh || "",
          type: targetType,
          loaiBai: "Luyện đề",
        }),
      });
      const resJson = await res.json();
      setNhanXetAI((prev) => {
        const n = [...prev];
        n[idx] =
          resJson.trangThai === "tc"
            ? resJson.data?.loiNhanXet || "Cú chưa có nhận xét."
            : "Hệ thống chấm điểm đang bị lỗi :((";
        return n;
      });
    } catch {
      setNhanXetAI((prev) => {
        const n = [...prev];
        n[idx] = "Hệ thống chấm điểm đang bị lỗi :((";
        return n;
      });
    } finally {
      setDangCham(false);
      setDaDuocCham((prev) => {
        const n = [...prev];
        n[idx] = true;
        return n;
      });
    }
  };

  const handleTiepTheo = () => {
    const isGroup = curRow && (curRow.noiDungCauHoi?.length || 0) > 1;
    if (isGroup) {
      // Nếu là group, nhảy đến câu đầu tiên của row tiếp theo
      const nextRowIdx = (curFlat?.rowIdx ?? 0) + 1;
      const nextStartIdx = flatCauHoi.findIndex((f) => f.rowIdx === nextRowIdx);
      if (nextStartIdx !== -1) {
        setViTri(nextStartIdx);
      } else {
        navigate(-1);
      }
    } else {
      if (viTri + 1 < flatCauHoi.length) setViTri(viTri + 1);
      else navigate(-1);
    }
  };

  const dapAnForSidebar = flatCauHoi.map((cau, i) => {
    const row = rows[cau.rowIdx];
    const itemCau = row.noiDungCauHoi[cau.cauIdx];
    const isCham = daDuocCham[i];
    const type = Number(row.type ?? itemCau?.type ?? 0);
    const dAnHV = dapAnHocVien[i] || "";
    const dAnDung = itemCau?.dapAn;

    let dungSai = "chuaCham";
    if (isCham) {
      if (type === 0) {
        dungSai = dAnHV === dAnDung ? "dung" : "sai";
      } else {
        dungSai = "dung";
      }
    }

    return {
      dapAnHocVien: dAnHV ? true : false,
      isCham: isCham,
      dungSai: dungSai,
      soCau: itemCau?.soCau,
    };
  });

  // Ref textarea tự luận
  const inTL = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (inTL.current) inTL.current.value = dapAnHocVien[viTri] || "";
  }, [viTri]);

  const isDaDuocCham = daDuocCham[viTri];
  const dapAnDung = curCau?.dapAn;
  const dapAnHV = dapAnHocVien[viTri] || "";

  return (
    <>
      <Header type="khien" nopbai={() => navigate(-1)} />
      {dangCham && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#114A53]"></div>
        </div>
      )}

      <section className="mx-[10px] flex relative gap-3">
        {loading ? (
          <p className="w-full text-center py-20 text-black/50 italic animate-pulse">
            Đang tải câu hỏi...
          </p>
        ) : (
          <>
            <Sidebar
              Type="bt"
              data={sidebarData}
              Chon={viTri}
              ClickChon={clickChon}
              dapAN={dapAnForSidebar}
            />

            {/* ===== KHU VỰC LÀM BÀI ===== */}
            <section className="overflow-hidden flex justify-center w-full bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F] h-[calc(100vh-85px)] rounded-[20px] p-[20px]">
              {curCau && (
                <div
                  className={`w-full h-full  flex transition-all duration-500 gap-6 ${curRow.noiDungDoc || curRow.anh ? "max-w-[1300px]" : "max-w-[800px] justify-center"}`}
                >
                  {/* BOX BÊN TRÁI: Media/Reading (Chỉ hiện nếu có media/anh hoặc noiDungDoc) */}
                  {(curRow.noiDungDoc || curRow.anh) && (
                    <div className="w-1/2 h-full bg-white rounded-[10px] p-[20px] overflow-y-auto flex flex-col gap-6 scrollbar-hide">
                      {curRow.anh && (
                        <div className="w-full rounded-[15px] overflow-hidden shadow-md border border-black/5">
                          <img
                            src={getFullUrl(curRow.anh)}
                            alt="context"
                            className="w-full object-contain"
                          />
                        </div>
                      )}
                      {curRow.noiDungDoc && (
                        <div className="text-[16px] leading-[1.8] text-black whitespace-pre-wrap  bg-white p-6 rounded-[20px] shadow-inner">
                          {curRow.noiDungDoc}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BOX BÊN PHẢI: Câu hỏi và trả lời */}
                  <div
                    className={`${curRow.noiDungDoc || curRow.anh ? "w-1/2" : "w-full"} h-full bg-white backdrop-blur-sm rounded-[10px] p-[30px] shadow-xl border border-white/50 overflow-y-auto flex flex-col gap-8 scrollbar-hide`}
                  >
                    {/* File nghe cho câu đơn hoặc câu nhóm (nếu có) */}
                    {curRow.fileNghe && (
                      <div className="flex flex-col gap-4 mb-4">
                        <audio
                          controls
                          src={getFullUrl(curRow.fileNghe)}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Loop qua các câu hỏi trong Group (hoặc chỉ 1 câu nếu lẻ) */}
                    {(curRow.noiDungCauHoi.length > 1
                      ? curRow.noiDungCauHoi
                      : [curCau]
                    ).map((cau: any, idxInGroup: number) => {
                      const startIdx = flatCauHoi.findIndex(
                        (f) => f.rowIdx === curFlat?.rowIdx,
                      );
                      const absIdx =
                        curRow.noiDungCauHoi.length > 1
                          ? startIdx + idxInGroup
                          : viTri;
                      const isCham = daDuocCham[absIdx];
                      const dAnHV = dapAnHocVien[absIdx] || "";
                      const dAnDung = cau.dapAn;

                      return (
                        <div
                          key={idxInGroup}
                          className="flex flex-col gap-4 border-b border-black/5 pb-8 last:border-0"
                        >
                          <p className="text-[17px]  ]">
                            câu hỏi {cau.soCau}:{" "}
                            <span className="font-normal">{cau.cauHoi}</span>
                          </p>

                          {/* MCQ Options */}
                          {curType === 0 && (
                            <div className="grid grid-cols-1 gap-3">
                              {(["a", "b", "c", "d"] as const).map(
                                (key) =>
                                  cau[key] && (
                                    <div
                                      key={key}
                                      onClick={() =>
                                        !isCham &&
                                        setDapAnHocVien((prev) => {
                                          const n = [...prev];
                                          n[absIdx] = key;
                                          return n;
                                        })
                                      }
                                      className={`flex items-center gap-3 p-3 rounded-[15px]  transition-all cursor-pointer ${
                                        dAnHV === key
                                          ? ""
                                          : "bg-transparent border-black/5 hover:border-[#2A6770]/30"
                                      }`}
                                    >
                                      <div
                                        className={`w-[22px] shrink-0 h-[22px] rounded-full border flex items-center justify-center ${dAnHV === key ? "border-[#2A6770]" : "border-black/20"}`}
                                      >
                                        {dAnHV === key && (
                                          <div className="w-[12px] h-[12px] bg-[#2A6770] rounded-full " />
                                        )}
                                      </div>
                                      <span
                                        className={`text-[15px] ${isCham ? (key === dAnDung ? "text-green-600 font-medium " : key === dAnHV ? "text-red-600 font-medium" : "") : ""}`}
                                      >
                                        {cau[key]}
                                      </span>
                                    </div>
                                  ),
                              )}
                            </div>
                          )}

                          {/* Textarea for Type 1 & 2 */}
                          {(curType === 1 || curType === 2) && (
                            <textarea
                              disabled={isCham}
                              placeholder="Nhập câu trả lời của bạn..."
                              defaultValue={dAnHV}
                              onChange={(e) =>
                                setDapAnHocVien((prev) => {
                                  const n = [...prev];
                                  n[absIdx] = e.target.value;
                                  return n;
                                })
                              }
                              className={`w-full p-4 rounded-[15px] bg-[#f0f8fa] border-2 border-transparent focus:border-[#2A6770] focus:outline-none transition-all ${curType === 2 ? "h-[200px]" : "h-[80px]"}`}
                            />
                          )}

                          {/* Speaking for Type 3 */}
                          {curType === 3 && (
                            <div className="flex flex-col gap-[10px]">
                              <div className="border border-black/30 p-[10px] rounded-[20px] text-[13px] flex flex-col justify-center items-center gap-2">
                                <p className="opacity-[0.75]">
                                  Nhấn vào mic để ghi âm
                                </p>
                                <div
                                  onClick={dangGhiAm ? dungGhiAm : batDauGhiAm}
                                  className={`cursor-pointer w-[300px] h-[50px]  rounded-[20px] flex justify-center items-center transition-all duration-300 ${dangGhiAm ? `bg-[#ff1200]` : `bg-[#2A6770]`}`}
                                >
                                  {dangGhiAm ? (
                                    <div className="flex items-center gap-3">
                                      <div className="h-[20px] w-[20px] bg-white/90 rounded-[4px] shadow-sm"></div>
                                      <span className="text-white font-bold text-[16px] tracking-widest">
                                        {formatTime(thoiGianGhiAm)}
                                      </span>
                                    </div>
                                  ) : (
                                    <img
                                      className="h-[70%]"
                                      src="https://img.icons8.com/?size=100&id=PdCTIK38g57b&format=png&color=ffffff"
                                      alt=""
                                    />
                                  )}
                                </div>
                                <p className=" text-black/75 italic  text-[13px]">
                                  Lưu ý: Thời gian ghi âm tối đa là 2 phút
                                </p>
                              </div>
                              {linkAmThanhArr[absIdx] && (
                                <audio
                                  controls
                                  src={linkAmThanhArr[absIdx]!}
                                  className="w-full"
                                />
                              )}
                            </div>
                          )}

                          {/* Feedback */}
                          {isCham && (
                            <div className="mt-2 bg-[#f0f8fa] p-4 rounded-[15px] border border-black/20">
                              <p className="font-bold text-[#2A6770] text-sm mb-1">
                                Giải thích & Nhận xét:
                              </p>
                              <p className="text-[14px] whitespace-pre-wrap">
                                {cau.giaiThich || "Không có giải thích."}
                              </p>
                              {nhanXetAI[absIdx] && (
                                <div>
                                  <p className="font-bold text-[#2A6770] text-sm mb-1 mt-2 ">
                                    nhận xét của cú Cú:
                                  </p>
                                  <p className="text-[14px] whitespace-pre-wrap">
                                    {nhanXetAI[absIdx]}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Nút Chấm của từng câu (nếu là Group) */}
                          {curRow.noiDungCauHoi.length > 1 && !isCham && (
                            <button
                              onClick={() => handleCham(absIdx)}
                              className="mt-2 w-fit px-6 py-2 bg-[#2A6770] text-white rounded-[10px] text-sm font-bold  hover:scale-105 transition-all"
                            >
                              Chấm câu này
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* Nút Điều hướng chung ở cuối box bên phải */}
                    <div className="mt-auto pt-6 flex justify-between items-center border-t border-black/5">
                      <p className="text-sm text-black/40  italic">
                        Hoàn thành bài tập để xem nhận xét chi tiết
                      </p>
                      <div className="flex gap-3">
                        {/* Nếu là Single, hiện nút Chấm ở đây */}
                        {curRow.noiDungCauHoi.length <= 1 && !isDaDuocCham && (
                          <button
                            onClick={() => handleCham(viTri)}
                            disabled={dangCham}
                            className="px-5 py-2 bg-[#2A6770] text-white rounded-[10px] font-bold  hover:bg-[#1f4e55] transition-all disabled:opacity-50"
                          >
                            {dangCham ? "Đang chấm..." : "Chấm bài"}
                          </button>
                        )}
                        <button
                          onClick={handleTiepTheo}
                          className="px-5 py-2 bg-[#2A6770] text-white rounded-[10px] font-bold  hover:bg-[#1f4e55] transition-all"
                        >
                          Tiếp Theo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!curCau && (
                <p className="text-white font-medium">
                  Không có câu hỏi nào trong part này.
                </p>
              )}
            </section>
          </>
        )}
      </section>
    </>
  );
}
