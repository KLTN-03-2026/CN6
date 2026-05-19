import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "./FileThongso";
import Header from "./componan/header";
import Sidebar from "./componan/sidebar";
import Load from "./componan/load";
import BoxXacNhanNopBai from "./componan/BoxXacNhanNopBai";

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

// --- TOEIC Scaled Score Tables ---
const listeningTable = [
  5, 5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90,
  95, 100, 105, 110, 115, 120, 125, 135, 140, 145, 150, 155, 160, 165, 170, 175,
  180, 185, 190, 195, 200, 210, 215, 220, 225, 230, 235, 240, 245, 250, 255,
  260, 265, 270, 275, 285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335,
  340, 345, 350, 360, 365, 370, 375, 380, 385, 390, 395, 400, 405, 410, 415,
  420, 425, 430, 435, 440, 445, 450, 455, 460, 465, 470, 475, 480, 480, 485,
  485, 490, 490, 495, 495,
];

const readingTable = [
  5, 5, 5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85,
  90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 160, 165, 170,
  175, 180, 185, 190, 195, 200, 205, 210, 215, 225, 230, 235, 240, 245, 250,
  255, 260, 265, 270, 275, 280, 285, 295, 300, 305, 310, 315, 320, 325, 330,
  340, 345, 350, 355, 360, 365, 370, 375, 385, 390, 395, 400, 405, 410, 415,
  420, 430, 435, 440, 445, 450, 455, 460, 465, 470, 475, 475, 480, 485, 485,
  490, 490, 495, 495, 495,
];

const speakingTable = [
  10, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 100, 110, 110, 120, 120, 130, 130,
  140, 140, 150, 150, 160, 160, 160, 170, 170, 170, 180, 180, 180, 190, 190,
  190, 190, 200, 200, 200, 200,
];

const writingTable = [
  10, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 115, 120, 130, 140, 150, 155,
  160, 165, 170, 175, 180, 185, 190, 190, 195, 195, 200,
];

const getMoTaNangLuc = (lr: number, sw: number) => {
  let lr_desc = "";
  if (lr > 0) {
    if (lr >= 900)
      lr_desc =
        "Khả năng nghe đọc xuất sắc, hiểu sát nghĩa các tài liệu phức tạp, giao tiếp chuyên nghiệp.";
    else if (lr >= 750)
      lr_desc =
        "Khả năng nghe đọc rất tốt, có thể làm việc hiệu quả trong môi trường quốc tế.";
    else if (lr >= 600)
      lr_desc =
        "Nắm vững ngữ pháp cơ bản và từ vựng thông dụng, nghe hiểu hội thoại công việc tốt.";
    else if (lr >= 450)
      lr_desc =
        "Hiểu được các đoạn hội thoại và văn bản mức độ trung bình, cần mở rộng từ vựng.";
    else if (lr >= 300)
      lr_desc =
        "Nghe đọc ở mức độ cơ bản, chỉ có thể hiểu các câu đơn giản quen thuộc.";
    else
      lr_desc =
        "Mất gốc hoặc mới bắt đầu làm quen với tiếng Anh, cần xây dựng lại nền tảng.";
  }

  let sw_desc = "";
  if (sw > 0) {
    if (sw >= 350)
      sw_desc =
        "Giao tiếp nói và viết trôi chảy, phản xạ tự nhiên như người bản xứ.";
    else if (sw >= 280)
      sw_desc =
        "Có khả năng thuyết trình và viết email công việc một cách chuyên nghiệp.";
    else if (sw >= 200)
      sw_desc =
        "Giao tiếp được các tình huống hàng ngày, viết văn bản đơn giản khá tốt.";
    else if (sw >= 120)
      sw_desc =
        "Chỉ giao tiếp được các chủ đề quen thuộc, vốn từ vựng nói/viết còn hạn chế.";
    else
      sw_desc =
        "Khả năng diễn đạt còn nhiều khó khăn, cần tập trung phát âm và cấu trúc câu.";
  }

  return `${lr_desc} ${sw_desc}`.trim() || "Đã hoàn thành bài thi thử.";
};

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function HV_LamBaiThiThu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [Token] = useState(() => {
    const c = localStorage.getItem("E-learningTK");
    return c ? JSON.parse(c) : null;
  });

  // dữ liệu
  const [thiThu, setThiThu] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [flat, setFlat] = useState<{ rIdx: number; cIdx: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // đáp án
  const [dapAnArr, setDapAnArr] = useState<string[]>([]);
  const [fileBlobArr, setFileBlobArr] = useState<any[]>([]);
  const [linkArr, setLinkArr] = useState<(string | null)[]>([]);

  // vị trí
  const [viTri, setViTri] = useState(0);

  // phase
  const [phase, setPhase] = useState<"countdown" | "exam" | "result">(
    "countdown",
  );
  const [countDown, setCountDown] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);

  // ghi âm
  const [dangGhiAm, setDangGhiAm] = useState(false);
  const [ghiAmTime, setGhiAmTime] = useState(120);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerGARef = useRef<NodeJS.Timeout | null>(null);
  const intervalGARef = useRef<NodeJS.Timeout | null>(null);

  // nộp / kết quả
  const [boxNop, setBoxNop] = useState(false);
  const [alLoad, setAlLoad] = useState(false);
  const [ketQua, setKetQua] = useState<{
    diem: number;
    score1: number;
    score2: number;
    hoTen: string;
  } | null>(null);

  // audio listening tự động
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedRowRef = useRef<number>(-1);

  // ── lấy dữ liệu ──────────────────────────────────
  const layData = async () => {
    try {
      setLoading(true);
      const [r1, r2] = await Promise.all([
        fetch(`${BACKEND_URL}/api/thi-thu/${id}`).then((r) => r.json()),
        fetch(`${BACKEND_URL}/api/chi-tiet-thi-thu/${id}`).then((r) =>
          r.json(),
        ),
      ]);
      if (r1.trangThai === "tc") setThiThu(r1.data);
      if (r2.trangThai === "tc" && r2.data) {
        const rs: any[] = r2.data;
        setRows(rs);
        const fl: { rIdx: number; cIdx: number }[] = [];
        rs.forEach((row: any, ri: number) => {
          row.noiDungCauHoi?.forEach((_: any, ci: number) =>
            fl.push({ rIdx: ri, cIdx: ci }),
          );
        });
        setFlat(fl);
        const n = fl.length;
        setDapAnArr(Array(n).fill(""));
        setFileBlobArr(Array(n).fill(null));
        setLinkArr(Array(n).fill(null));
        const isLR = r1.data?.kyNang?.toLowerCase() === "listening && reading";
        setTimeLeft(isLR ? 120 * 60 : 80 * 60);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    layData();
  }, [id]);

  // ── countdown ─────────────────────────────────────
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countDown <= 0) {
      setPhase("exam");
      return;
    }
    const t = setTimeout(() => setCountDown((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [countDown, phase]);

  // ── đồng hồ thi ───────────────────────────────────
  useEffect(() => {
    if (phase !== "exam") return;
    if (timeLeft <= 0) {
      xuLyNop();
      return;
    }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft]);

  // Cảnh báo khi người dùng tắt trang, F5 tải lại hoặc nhấn nút quay lại (Back) của trình duyệt
  useEffect(() => {
    if (phase !== "exam") return;

    // 1. Chặn F5 và đóng Tab (beforeunload)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message =
        "Nếu bạn rời khỏi trang hoặc tải lại trang, mọi đáp án đã làm sẽ bị mất!";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 2. Chặn nút Quay lại (Back) của trình duyệt (popstate)
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      const confirmExit = window.confirm(
        "Nếu bạn rời khỏi trang hoặc tải lại trang, mọi đáp án đã làm sẽ bị mất! Bạn có chắc chắn muốn thoát không?",
      );
      if (confirmExit) {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
        window.history.back();
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [phase]);

  // ── thông tin câu hiện tại ────────────────────────
  const isLR = thiThu?.kyNang?.toLowerCase() === "listening && reading";
  const curFlat = flat[viTri];
  const curRow = curFlat ? rows[curFlat.rIdx] : null;
  const curCau = curRow?.noiDungCauHoi?.[curFlat?.cIdx ?? 0];
  const curType = Number(curRow?.type ?? curCau?.type ?? 0);
  const curSoCau = curCau?.soCau ?? 1;
  const isListening = isLR && curSoCau >= 1 && curSoCau <= 100;

  // ── auto play audio listening + chờ 8 giây rồi chuyển câu ──
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isListening || phase !== "exam" || !curRow?.fileNghe) return;
    if (playedRowRef.current === curFlat?.rIdx) return;
    playedRowRef.current = curFlat?.rIdx ?? -1;
    if (audioRef.current) audioRef.current.pause();
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);

    const a = new Audio(getFullUrl(curRow.fileNghe));
    audioRef.current = a;
    a.play().catch(() => {});
    a.onended = () => {
      // chờ 8 giây sau khi phát xong rồi chuyển câu tiếp
      autoAdvanceRef.current = setTimeout(() => {
        setViTri((prev) => {
          const next = prev + 1;
          if (next < flat.length) return next;
          return prev; // câu cuối: không tự chuyển
        });
      }, 8000);
    };
    return () => {
      a.pause();
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [viTri, phase]);

  // ── reset ghi âm khi chuyển câu ──────────────────
  useEffect(() => {
    if (timerGARef.current) clearTimeout(timerGARef.current);
    if (intervalGARef.current) clearInterval(intervalGARef.current);
    setDangGhiAm(false);
    setGhiAmTime(120);
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  }, [viTri]);

  // ── ghi âm ───────────────────────────────────────
  const batDauGhiAm = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      mediaRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setFileBlobArr((p) => {
          const n = [...p];
          n[viTri] = blob;
          return n;
        });
        setLinkArr((p) => {
          const n = [...p];
          n[viTri] = url;
          return n;
        });
        setDapAnArr((p) => {
          const n = [...p];
          n[viTri] = url;
          return n;
        });
      };
      rec.start();
      setDangGhiAm(true);
      setGhiAmTime(120);
      setLinkArr((p) => {
        const n = [...p];
        n[viTri] = null;
        return n;
      });
      intervalGARef.current = setInterval(() => {
        setGhiAmTime((p) => {
          if (p <= 1) {
            dungGhiAm();
            return 0;
          }
          return p - 1;
        });
      }, 1000);
      timerGARef.current = setTimeout(dungGhiAm, 120000);
    } catch {
      alert("Vui lòng cho phép trình duyệt sử dụng Micro!");
    }
  };

  const dungGhiAm = () => {
    if (timerGARef.current) clearTimeout(timerGARef.current);
    if (intervalGARef.current) clearInterval(intervalGARef.current);
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      mediaRef.current.stream.getTracks().forEach((t) => t.stop());
      setDangGhiAm(false);
    }
  };

  const handleTiepTheo = () => {
    const isGroup = (curRow?.noiDungCauHoi?.length || 0) > 1;
    if (isGroup) {
      const nextRowIdx = (curFlat?.rIdx ?? 0) + 1;
      const nextStart = flat.findIndex((f) => f.rIdx === nextRowIdx);
      if (nextStart !== -1) setViTri(nextStart);
      else handleNopBai(false);
    } else {
      if (viTri + 1 < flat.length) setViTri(viTri + 1);
      else handleNopBai(false);
    }
  };

  // ── sidebar data (chỉ Reading: soCau >= 101) ──────
  const readingFlat = isLR
    ? flat.filter((f) => {
        const row = rows[f.rIdx];
        const cau = row?.noiDungCauHoi?.[f.cIdx];
        return (cau?.soCau ?? 1) >= 101;
      })
    : flat;

  const sidebarData: { text: string; slCauHoi: number }[] = [];
  readingFlat.forEach((f) => {
    const row = rows[f.rIdx];
    const partName = row?.tenPart || "Phần thi";
    const existing = sidebarData.find((item) => item.text === partName);
    if (existing) {
      existing.slCauHoi += 1;
    } else {
      sidebarData.push({
        text: partName,
        slCauHoi: 1,
      });
    }
  });

  const dapAnForSidebar = readingFlat.map((f) => {
    const absIdx = flat.findIndex(
      (x) => x.rIdx === f.rIdx && x.cIdx === f.cIdx,
    );
    const row = rows[f.rIdx];
    const cau = row?.noiDungCauHoi?.[f.cIdx];
    return {
      dapAnHocVien: !!dapAnArr[absIdx],
      isCham: false,
      dungSai: "chuaCham",
      soCau: cau?.soCau ?? absIdx + 1,
    };
  });

  const clickChonSidebar = (sidebarIdx: number) => {
    if (isListening) return;
    const f = readingFlat[sidebarIdx];
    if (!f) return;
    const absIdx = flat.findIndex(
      (x) => x.rIdx === f.rIdx && x.cIdx === f.cIdx,
    );
    if (absIdx >= 0) setViTri(absIdx);
  };

  const sidebarChon = readingFlat.findIndex(
    (f) => f.rIdx === curFlat?.rIdx && f.cIdx === curFlat?.cIdx,
  );

  // ── nộp bài ──────────────────────────────────────
  const handleNopBai = (forced: boolean) => {
    const chuaXong = dapAnArr.some((d) => !d || d.trim() === "");
    if (!forced && chuaXong) {
      setBoxNop(true);
      return;
    }
    xuLyNop();
  };

  const xuLyNop = async () => {
    setBoxNop(false);
    setAlLoad(true);
    let email = "";
    let hoTen = "Học viên";
    try {
      const r = await fetch(`${BACKEND_URL}/api/lay-tt-tk`, {
        headers: { Authorization: Token },
      });
      const j = await r.json();
      if (j.trangThai === "tc") {
        email = j.data?.Email || "";
        hoTen = j.data?.HoTen || "Học viên";
      }
    } catch {}

    const aiComments = new Array(flat.length).fill("");

    let diem = 0;
    let score1 = 0;
    let score2 = 0;
    if (isLR) {
      let listeningCorrect = 0;
      let listeningTotal = 0;
      let readingCorrect = 0;
      let readingTotal = 0;

      flat.forEach((f, idx) => {
        const row = rows[f.rIdx];
        const cau = row?.noiDungCauHoi?.[f.cIdx];
        if (!cau) return;

        const soCau = cau.soCau ?? 1;
        const isList = soCau >= 1 && soCau <= 100;
        const isCorrect = dapAnArr[idx] === cau.dapAn;

        if (isList) {
          listeningTotal++;
          if (isCorrect) {
            listeningCorrect++;
          }
        } else {
          readingTotal++;
          if (isCorrect) {
            readingCorrect++;
          }
        }
        aiComments[idx] = isCorrect
          ? "Chính xác!"
          : `Chưa chính xác! (Đáp án đúng: ${cau.dapAn})`;
      });

      const rawListening =
        listeningTotal > 0
          ? Math.round((listeningCorrect / listeningTotal) * 100)
          : 0;
      const rawReading =
        readingTotal > 0
          ? Math.round((readingCorrect / readingTotal) * 100)
          : 0;

      const scaledListening = listeningTable[rawListening] ?? 5;
      const scaledReading = readingTable[rawReading] ?? 5;

      score1 = scaledListening;
      score2 = scaledReading;
      diem = scaledListening + scaledReading;
    } else {
      let speakingAISum = 0;
      let speakingAICount = 0;
      let writingEtsRaw = 0;
      let type2Count = 0;

      for (let i = 0; i < flat.length; i++) {
        const row = rows[flat[i].rIdx];
        const cau = row?.noiDungCauHoi?.[flat[i].cIdx];
        const type = Number(row?.type ?? cau?.type ?? 0);

        if (type === 3) {
          speakingAICount++;
          if (fileBlobArr[i]) {
            try {
              const fd = new FormData();
              fd.append("fileGhiAm", fileBlobArr[i], `sp_${Date.now()}.webm`);
              const up = await fetch(`${BACKEND_URL}/api/uploadAudio`, {
                method: "POST",
                body: fd,
              });
              const uj = await up.json();
              if (uj.trangThai === "tc") {
                dapAnArr[i] = uj.linkAmThanh;
                const cr = await fetch(`${BACKEND_URL}/api/chamDiemSpeaking`, {
                  method: "POST",
                  headers: {
                    Authorization: Token,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    CauHoi: cau?.cauHoi,
                    dapAnHocVien: uj.linkAmThanh,
                    giaiThich: cau?.giaiThich,
                    anh: row?.anh,
                    type,
                    loaiBai: "Thi thử",
                  }),
                });
                const cj = await cr.json();
                if (cj.trangThai === "tc") {
                  speakingAISum += Number(cj.data?.diemUocTinh || 0);
                  aiComments[i] = cj.data?.loiNhanXet || "";
                }
              }
            } catch {}
          } else {
            aiComments[i] = "Học viên chưa làm bài...";
          }
        } else if (type === 1 || type === 2) {
          let aiScore = 0;
          if (dapAnArr[i] && dapAnArr[i].trim() !== "") {
            try {
              const cr = await fetch(`${BACKEND_URL}/api/chamDiemTuLuan`, {
                method: "POST",
                headers: {
                  Authorization: Token,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  CauHoi: cau?.cauHoi,
                  dapAnHocVien: dapAnArr[i],
                  giaiThich: cau?.giaiThich,
                  anh: row?.anh,
                  type,
                  loaiBai: "Thi thử",
                }),
              });
              const cj = await cr.json();
              if (cj.trangThai === "tc") {
                aiScore = Number(cj.data?.diemUocTinh || 0);
                aiComments[i] = cj.data?.loiNhanXet || "";
              }
            } catch {}
          } else {
            aiComments[i] = "Học viên chưa làm bài...";
          }

          if (type === 1) {
            // Viết câu mô tả hình ảnh: ets_task_score = Math.round(aiScore / 2 * 3)
            const etsTaskScore = Math.round((aiScore / 2) * 3);
            writingEtsRaw += etsTaskScore;
          } else if (type === 2) {
            type2Count++;
            if (type2Count <= 2) {
              // Trả lời email / tin nhắn: ets_task_score = Math.round(aiScore / 8 * 4)
              const etsTaskScore = Math.round((aiScore / 8) * 4);
              writingEtsRaw += etsTaskScore;
            } else {
              // Viết bài luận trình bày ý kiến: ets_task_score = Math.round(aiScore / 8 * 5)
              const etsTaskScore = Math.round((aiScore / 8) * 5);
              writingEtsRaw += etsTaskScore;
            }
          }
        }
      }

      // 1. Speaking scaled score calculation
      const avgSpeakingAIScore =
        speakingAICount > 0 ? speakingAISum / speakingAICount : 0;
      const speakingEtsRaw = Math.round((avgSpeakingAIScore / 8) * 38);
      const scaledSpeaking = speakingTable[speakingEtsRaw] ?? 0;

      // 2. Writing scaled score calculation
      const finalWritingEtsRaw = Math.min(28, writingEtsRaw);
      const scaledWriting = writingTable[finalWritingEtsRaw] ?? 0;

      score1 = scaledSpeaking;
      score2 = scaledWriting;
      diem = scaledSpeaking + scaledWriting;
    }

    // Xóa bài cũ trước khi lưu dữ liệu mới
    try {
      await fetch(
        `${BACKEND_URL}/api/thi-thu-da-lam?email=${encodeURIComponent(email)}&idThiThu=${id}`,
        { method: "DELETE" },
      );
      await fetch(
        `${BACKEND_URL}/api/chi-tiet-thi-thu-da-lam?email=${encodeURIComponent(email)}&idThiThu=${id}`,
        { method: "DELETE" },
      );
    } catch (err) {
      console.log("Lỗi xóa bài cũ trước khi lưu:", err);
    }

    try {
      await fetch(`${BACKEND_URL}/api/thi-thu-da-lam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idThiThu: id,
          diem,
          kyNang: thiThu?.kyNang,
          email,
        }),
      });
    } catch {}

    try {
      const detailPayload = rows.map((row, rIdx) => {
        const questionsInRow = row.noiDungCauHoi.map((q: any, cIdx: number) => {
          const flatIdx = flat.findIndex(
            (f) => f.rIdx === rIdx && f.cIdx === cIdx,
          );
          let dapAnHV = "";
          let loiPhe = "";

          if (flatIdx !== -1) {
            dapAnHV = dapAnArr[flatIdx] || "";
            loiPhe = aiComments[flatIdx] || "";
          }

          return {
            soCau: q.soCau,
            cauHoi: q.cauHoi || "",
            a: q.a || "",
            b: q.b || "",
            c: q.c || "",
            d: q.d || "",
            dapAn: dapAnHV,
            giaiThich: q.giaiThich || "",
            loiPheAI: loiPhe,
          };
        });

        return {
          idThiThu: id,
          email: email,
          tenPart: row.tenPart || "",
          type: Number(row.type || 0),
          fileNghe: row.fileNghe || "",
          anh: row.anh || "",
          noiDungDoc: row.noiDungDoc || "",
          noiDungCauHoi: questionsInRow,
        };
      });

      await fetch(`${BACKEND_URL}/api/chi-tiet-thi-thu-da-lam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailPayload),
      });
    } catch (err) {
      console.log("Lỗi lưu chi tiết thi thử đã làm:", err);
    }

    setKetQua({ diem, score1, score2, hoTen });
    setAlLoad(false);
    setPhase("result");
  };

  // ══════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-[50px] h-[50px] border-4 border-[#2f6169] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (phase === "countdown")
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-t from-[#2F8C8F] to-[#A9F9FC] gap-8">
        <p className="text-white text-[20px]">Bài thi sẽ bắt đầu sau</p>
        <div className="w-[160px] h-[160px] rounded-full  flex items-center justify-center">
          <span className="text-[80px] font-extrabold text-white">
            {countDown}
          </span>
        </div>
        <p className="text-white font-bold text-[22px]">
          {thiThu?.tenDe} – {thiThu?.kyNang}
        </p>
        <p className="text-white text-[14px]">
          Thời gian: {isLR ? "120 phút" : "80 phút"} | {flat.length} câu hỏi
        </p>
      </div>
    );

  if (phase === "result" && ketQua)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F]">
        <div className="bg-white rounded-[20px] p-[45px] w-[800px] flex flex-col gap-6 shadow-2xl">
          {/* phần thông tin */}
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1">
              <p className="text-black/50">Chúc mừng</p>
              <h1 className="text-black text-[25px] font-bold">
                {ketQua.hoTen}
              </h1>
              <p className="text-black/50">
                Đã hoàn thành bài thi thử TOEIC:{" "}
                <span className="font-semibold text-black">
                  {thiThu?.tenDe}
                </span>
              </p>
              <h1 className="text-[25px] font-extrabold text-[#114A53] mt-1">
                {isLR
                  ? `L : ${ketQua.score1} | R : ${ketQua.score2}`
                  : `S : ${ketQua.score1} | W : ${ketQua.score2}`}
              </h1>
              <h2 className="text-[22px] font-bold text-black/80 mt-1">
                Tổng điểm:{" "}
                <span className="text-[#2F8C8F] font-extrabold text-[26px]">
                  {ketQua.diem}
                </span>{" "}
                {isLR ? "/ 990" : "/ 400"}
              </h2>
            </div>
            <div className="h-[150px]">
              <img className="h-full" src="/cuChucMung.png" alt="" />
            </div>
          </div>

          {/* phần mô tả năng lực */}
          <div className="p-[15px] bg-[#ebf4f6] rounded-[10px] min-h-[120px] flex flex-col justify-center w-full">
            <p className="font-medium mb-[5px] text-[#114A53]">
              Mô tả năng lực:
            </p>
            <p className="text-black/80 text-[15px] leading-relaxed">
              {getMoTaNangLuc(isLR ? ketQua.diem : 0, isLR ? 0 : ketQua.diem)}
            </p>
          </div>

          {/* các nút điều hướng */}
          <div className="flex gap-4 w-full mt-4">
            <button
              onClick={() => navigate(`/HV_KetQuaThiThu/${id}`)}
              className="flex-1 py-[10px] rounded-[12px] border-2 border-[#2f6169] text-[#2f6169] font-bold hover:bg-[#d7e8ec] transition-all text-[16px] shadow-sm"
            >
              Xem chi tiết
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-[10px] rounded-[12px] bg-[#114a53] text-white font-bold hover:bg-[#287678] transition-all text-[16px] shadow-sm"
            >
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );

  // ─── Phase = exam ────────────────────────────────
  const isGroup = (curRow?.noiDungCauHoi?.length || 0) > 1;
  const startIdx = flat.findIndex((f) => f.rIdx === curFlat?.rIdx);

  return (
    <>
      <Header type="LBT" nopbai={() => handleNopBai(false)} timer={timeLeft} />
      {alLoad && <Load noiDung="Đang chấm điểm, vui lòng chờ..." />}
      {boxNop && (
        <BoxXacNhanNopBai
          noiDung="Bạn chưa hoàn thành tất cả câu hỏi. Có chắc muốn nộp bài?"
          tat={() => setBoxNop(false)}
          nopBai={xuLyNop}
        />
      )}

      <section className="mx-[10px] flex relative gap-3">
        {/* ── Sidebar: ẩn khi listening, chỉ hiện câu Reading ── */}
        {!isListening && (
          <Sidebar
            Type="bt"
            data={sidebarData}
            Chon={sidebarChon}
            ClickChon={clickChonSidebar}
            dapAN={dapAnForSidebar}
          />
        )}

        {/* ── Khu vực làm bài ── */}
        <section className="overflow-hidden flex justify-center w-full bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F] h-[calc(100vh-85px)] rounded-[20px] p-[20px]">
          {curCau ? (
            <div
              className={`w-full h-full flex transition-all duration-500 gap-6 ${curRow.noiDungDoc || curRow.anh ? "max-w-[1300px]" : "max-w-[800px] justify-center"}`}
            >
              {/* ── Bên trái: chỉ hiện khi có noiDungDoc hoặc anh ── */}
              {(curRow.noiDungDoc || curRow.anh) && (
                <div className="w-1/2 h-full bg-white rounded-[10px] p-[20px] overflow-y-auto flex flex-col gap-4 scrollbar-hide">
                  {curRow.anh && (
                    <img
                      src={getFullUrl(curRow.anh)}
                      alt=""
                      className="w-full object-contain"
                    />
                  )}
                  {curRow.noiDungDoc && (
                    <>
                      <p className="font-bold text-[#2A6770] text-[14px]">
                        Nội dung bài đọc
                      </p>
                      <div className="text-[15px] leading-[1.8] whitespace-pre-wrap">
                        {curRow.noiDungDoc}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Bên phải: câu hỏi ── */}
              <div
                className={`${curRow.noiDungDoc || curRow.anh ? "w-1/2" : "w-full"} h-full bg-white rounded-[10px] p-[30px] shadow-xl overflow-y-auto flex flex-col gap-8 scrollbar-hide`}
              >
                {/* File nghe cho các câu không thuộc listening (như Speaking/Writing) */}
                {curRow.fileNghe && !isListening && (
                  <div className="flex flex-col gap-4">
                    <audio
                      controls
                      src={getFullUrl(curRow.fileNghe)}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Loop các câu trong group (hoặc 1 câu đơn) */}
                {(isGroup ? curRow.noiDungCauHoi : [curCau]).map(
                  (cau: any, gi: number) => {
                    const absIdx = isGroup ? startIdx + gi : viTri;
                    const dAnHV = dapAnArr[absIdx] || "";

                    return (
                      <div
                        key={gi}
                        className="flex flex-col gap-4 border-b border-black/5 pb-8 last:border-0 whitespace-pre-wrap"
                      >
                        <p className="text-[17px] font-semibold">
                          Câu {cau.soCau}:{" "}
                          <span className="font-normal">{cau.cauHoi}</span>
                        </p>

                        {/* MCQ */}
                        {curType === 0 && (
                          <div className="grid grid-cols-1 gap-2 mt-[10px]">
                            {(["a", "b", "c", "d"] as const).map((k) =>
                              cau[k] ? (
                                <div
                                  key={k}
                                  onClick={() =>
                                    setDapAnArr((p) => {
                                      const n = [...p];
                                      n[absIdx] = k;
                                      return n;
                                    })
                                  }
                                  className={`flex items-center gap-3 p-3 rounded-[15px] transition-all cursor-pointer ${
                                    dAnHV === k
                                      ? ""
                                      : "bg-transparent border-black/5 hover:border-[#2A6770]/30"
                                  }`}
                                >
                                  <div
                                    className={`w-[22px] shrink-0 h-[22px] rounded-full border flex items-center justify-center ${
                                      dAnHV === k
                                        ? "border-[#2A6770]"
                                        : "border-black/20"
                                    }`}
                                  >
                                    {dAnHV === k && (
                                      <div className="w-[12px] h-[12px] bg-[#2A6770] rounded-full " />
                                    )}
                                  </div>
                                  <span className="text-[15px]">{cau[k]}</span>
                                </div>
                              ) : null,
                            )}
                          </div>
                        )}

                        {/* Tự luận */}
                        {(curType === 1 || curType === 2) && (
                          <textarea
                            rows={curType === 2 ? 6 : 3}
                            value={dAnHV}
                            onChange={(e) =>
                              setDapAnArr((p) => {
                                const n = [...p];
                                n[absIdx] = e.target.value;
                                return n;
                              })
                            }
                            placeholder="Nhập câu trả lời..."
                            className="w-full p-4 rounded-[15px] bg-[#f0f8fa] border-2 border-transparent focus:border-[#2A6770] outline-none transition-all resize-none"
                          />
                        )}

                        {/* Ghi âm */}
                        {curType === 3 && (
                          <div className="flex flex-col gap-3">
                            <div className="border border-black/20 p-[14px] rounded-[20px] flex flex-col items-center gap-3">
                              <p className="text-[13px] text-black/60">
                                Nhấn vào mic để ghi âm
                              </p>
                              <div
                                onClick={dangGhiAm ? dungGhiAm : batDauGhiAm}
                                className={`cursor-pointer w-[300px] h-[50px] rounded-[20px] flex justify-center items-center transition-all ${dangGhiAm ? "bg-[#ff1200]" : "bg-[#2A6770]"}`}
                              >
                                {dangGhiAm ? (
                                  <div className="flex items-center gap-3">
                                    <div className="h-[20px] w-[20px] bg-white/90 rounded-[4px]" />
                                    <span className="text-white font-bold text-[16px]">
                                      {fmt(ghiAmTime)}
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
                              <p className="text-[12px] text-black/50 italic">
                                Thời gian ghi âm tối đa là 2 phút
                              </p>
                            </div>
                            {linkArr[absIdx] && (
                              <audio
                                controls
                                src={linkArr[absIdx]!}
                                className="w-full"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}

                {/* Điều hướng */}
                <div className="mt-auto pt-6 flex justify-between items-center border-t border-black/5">
                  <p className="text-[13px] text-black/40 italic">
                    {isListening
                      ? "Đang làm phần Listening"
                      : `Câu ${viTri + 1} / ${flat.length}`}
                  </p>
                  <div className="flex gap-3">
                    {!isListening && viTri > 0 && (
                      <button
                        onClick={() => setViTri((p) => p - 1)}
                        className="px-5 py-2 border border-[#2A6770] text-[#2A6770] rounded-[10px] font-bold hover:bg-[#d7e8ec] transition-all"
                      >
                        ← Câu trước
                      </button>
                    )}
                    <button
                      onClick={handleTiepTheo}
                      className="px-5 py-2 bg-[#2A6770] text-white rounded-[10px] font-bold hover:bg-[#1f4e55] transition-all"
                    >
                      {viTri >= flat.length - 1 ? "Nộp bài" : "Tiếp Theo →"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white font-medium">Không có câu hỏi nào.</p>
          )}
        </section>
      </section>
    </>
  );
}
