import { useEffect, useState } from "react";
import Header from "./componan/header";
import HV_box_bt from "./componan/HV_box_BT";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "./FileThongso";
import Load from "./componan/load";
import BoxXacNhanNopBai from "./componan/BoxXacNhanNopBai";

const getMoTaNangLuc = (lr: number, sw: number) => {
  let lr_desc = "";
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

  let sw_desc = "";
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

  return `${lr_desc} ${sw_desc}`;
};

export default function HV_lamKtDauVao() {
  //   0: trắc nghiệm
  //   1: Câu trả lời ngắn
  //   2: Tự luận
  //   3: Ghi âm

  ////////// cách tính điểm /////////

  // trắc nghiệm :0.5
  // tự luận ngắn : 0-2
  //tự luận dài: 0-6;
  // ghi âm: 0-8;

  /////phần xử lý lấy dữ liệu
  const [dataCauHoi, setdataCauHoi] = useState<any[]>([]);
  const [alLoad, setalLoad] = useState(false);
  const [diemLR, setdiemLR] = useState("");
  const [diemSW, setdiemSW] = useState("");
  const [chonMT, setchonMT] = useState(0);

  const [hienThiKetQua, setHienThiKetQua] = useState(false);
  const [danhSachGoiY, setDanhSachGoiY] = useState<any[]>([]);
  const [boxXacNhanNop, setBoxXacNhanNop] = useState(false);
  const [timeLeft, setTimeLeft] = useState(35 * 60);

  // countdown
  const [phase, setPhase] = useState<"countdown" | "exam">("countdown");
  const [countDown, setCountDown] = useState(5);
  const [examInfo, setExamInfo] = useState<any>(null);

  const ChuyenTrang = useNavigate();

  const Token = (() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  })();

  const { id } = useParams();

  const layData = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/kiem-tra-dau-vao/${id}`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setExamInfo(req.data);
      }

      const api2 = await fetch(
        `${BACKEND_URL}/api/chi-tiet-kiem-tra-dau-vao/${id}`,
      );
      const req2 = await api2.json();

      if (req2.trangThai === "tc") {
        setdataCauHoi(req2.data);
        const initialDapan = req2.data.map((item: any) => ({
          ...item,
          dapAnHocVien: "",
          fileBlob: "",
        }));
        setdapan(initialDapan);
      }
    } catch (err) {
      console.log("lay data that bai : " + err);
    }
  };

  ////// phần điều khiển vị trí các câu hỏi

  const [Chon, setChon] = useState(0);

  const clickChon = (i: number) => {
    if (i < dataCauHoi.length) {
      setChon(i);
    }
  };

  ///// phần đáp án và nộp đáp án

  const [dapan, setdapan] = useState<any[]>([]);
  // let dapan = Array.from({ length: dataCauHoi.length });

  const capNhatDapAn = (items: any) => {
    let dsdapan = [...dapan];
    dsdapan[Chon] = items;
    setdapan(dsdapan);
    console.log(dapan);
  };

  ////////// cách tính điểm /////////

  // trắc nghiệm :0.5
  // tự luận ngắn : 0-2
  //tự luận dài: 0-6;
  // ghi âm: 0-8;

  const nopbai = () => {
    const isChuaHoanThanh = dapan.some(
      (item) => !item.dapAnHocVien || item.dapAnHocVien.trim() === "",
    );

    if (isChuaHoanThanh) {
      setBoxXacNhanNop(true);
    } else {
      xuLyNopBai();
    }
  };

  const xuLyNopBai = async () => {
    setBoxXacNhanNop(false);
    setalLoad(true);

    let listening_correct = 0;
    const listening_total = 10;
    let reading_correct = 0;
    const reading_total = 15;
    let ai_writing_score = 0;
    let ai_speaking_score = 0;

    let dapanCoPy = [...dapan];

    //// phần tính điểm
    for (let i = 0; i < dapan.length; i++) {
      if (dapanCoPy[i].type === 0) {
        if (dapanCoPy[i].dapAnHocVien === dapanCoPy[i].dapAn) {
          if (i < 10) listening_correct += 1;
          else if (i >= 10 && i < 25) reading_correct += 1;
        }
      } else if (dapanCoPy[i].type === 1 || dapanCoPy[i].type === 2) {
        if (
          !dapanCoPy[i].dapAnHocVien ||
          dapanCoPy[i].dapAnHocVien.trim() === ""
        ) {
          const newDapan = {
            ...dapanCoPy[i],
            loipheAI: "bạn chưa làm câu hỏi này",
          };
          dapanCoPy[i] = newDapan;
        } else {
          try {
            const data = {
              CauHoi: dapanCoPy[i].CauHoi,
              dapAnHocVien: dapanCoPy[i].dapAnHocVien,
              giaiThich: dapanCoPy[i].giaiThich,
              anh: dapanCoPy[i].anh,
              type: dapanCoPy[i].type,
              loaiBai: "Kiểm tra đầu vào",
            };
            const api = await fetch(`${BACKEND_URL}/api/chamDiemTuLuan`, {
              method: "POST",
              headers: {
                Authorization: Token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });
            const req = await api.json();
            if (req.trangThai === "tc") {
              ai_writing_score += Number(req.data.diemUocTinh);
              const newDapan = {
                ...dapanCoPy[i],
                loipheAI: req.data.loiNhanXet,
              };
              dapanCoPy[i] = newDapan;
            }
          } catch (err) {
            ai_writing_score += dapanCoPy[i].type === 1 ? 1 : 3;
            const newDapan = {
              ...dapanCoPy[i],
              loipheAI: "hệ thống chấm điểm đang bị lỗi :((",
            };
            dapanCoPy[i] = newDapan;
          }
        }
      } else if (dapanCoPy[i].type === 3) {
        //// tạo file ghi âm
        if (dapanCoPy[i].dapAnHocVien !== undefined && dapanCoPy[i].fileBlob) {
          let fileChuanDeGui = dapanCoPy[i].fileBlob;

          if (typeof dapanCoPy[i].fileBlob === "string") {
            const response = await fetch(dapanCoPy[i].fileBlob);
            fileChuanDeGui = await response.blob();
          }
          const formData = new FormData();
          const tenFileAo = `bai_speaking_${Date.now()}_${Math.floor(Math.random() * 100)}.webm`;
          formData.append("fileGhiAm", fileChuanDeGui, tenFileAo);
          try {
            const api = await fetch(`${BACKEND_URL}/api/uploadAudio`, {
              method: "POST",
              body: formData,
            });
            const req = await api.json();

            if (req.trangThai === "tc") {
              dapanCoPy[i].dapAnHocVien = req.linkAmThanh;
              try {
                const data = {
                  CauHoi: dapanCoPy[i].CauHoi,
                  dapAnHocVien: req.linkAmThanh,
                  giaiThich: dapanCoPy[i].giaiThich,
                  anh: dapanCoPy[i].anh,
                  type: dapanCoPy[i].type,
                  loaiBai: "Kiểm tra đầu vào",
                };
                const api1 = await fetch(
                  `${BACKEND_URL}/api/chamDiemSpeaking`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: Token,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                  },
                );
                const req1 = await api1.json();
                if (req1.trangThai === "tc") {
                  ai_speaking_score += Number(req1.data.diemUocTinh);
                  const newDapan = {
                    ...dapanCoPy[i],
                    loipheAI: req1.data.loiNhanXet,
                  };
                  dapanCoPy[i] = newDapan;
                  dapanCoPy[i].fileBlob = "";
                  dapanCoPy[i].linkAmThanh = "";
                }
              } catch (err) {
                console.log("gửi ai chấm speaking thất bại " + err);
                ai_speaking_score += 4;
                const newDapan = {
                  ...dapanCoPy[i],
                  loipheAI: "hệ thống chấm điểm đang bị lỗi :((",
                };
                dapanCoPy[i] = newDapan;
                dapanCoPy[i].fileBlob = "";
                dapanCoPy[i].linkAmThanh = "";
              }
            }
          } catch (err) {
            console.log("upload that bại : " + err);
            ai_speaking_score += 4;
            const newDapan = {
              ...dapanCoPy[i],
              loipheAI: "hệ thống chấm điểm đang bị lỗi :((",
            };
            dapanCoPy[i] = newDapan;
            dapanCoPy[i].fileBlob = "";
            dapanCoPy[i].linkAmThanh = "";
          }
        } else {
          const newDapan = {
            ...dapanCoPy[i],
            loipheAI: "bạn chưa làm câu hỏi này",
          };
          dapanCoPy[i] = newDapan;
          dapanCoPy[i].fileBlob = "";
          dapanCoPy[i].linkAmThanh = "";
        }
      }
    }

    const ets_raw_listen = Math.round(
      (listening_correct / listening_total) * 100,
    );
    const ets_raw_read = Math.round((reading_correct / reading_total) * 100);

    const interpolateScore = (ets_raw: number, table: any[]) => {
      if (ets_raw <= table[0].ets_raw) return table[0].scaled;
      if (ets_raw >= table[table.length - 1].ets_raw)
        return table[table.length - 1].scaled;
      for (let i = 0; i < table.length - 1; i++) {
        if (ets_raw >= table[i].ets_raw && ets_raw <= table[i + 1].ets_raw) {
          if (ets_raw === table[i].ets_raw) return table[i].scaled;
          if (ets_raw === table[i + 1].ets_raw) return table[i + 1].scaled;
          const p1 = table[i];
          const p2 = table[i + 1];
          const ratio = (ets_raw - p1.ets_raw) / (p2.ets_raw - p1.ets_raw);
          const val = p1.scaled + ratio * (p2.scaled - p1.scaled);
          return Math.round(val / 5) * 5;
        }
      }
      return 0;
    };

    const listeningTable = [
      { ets_raw: 0, scaled: 5 },
      { ets_raw: 5, scaled: 30 },
      { ets_raw: 10, scaled: 55 },
      { ets_raw: 15, scaled: 80 },
      { ets_raw: 20, scaled: 105 },
      { ets_raw: 25, scaled: 130 },
      { ets_raw: 30, scaled: 160 },
      { ets_raw: 35, scaled: 185 },
      { ets_raw: 40, scaled: 215 },
      { ets_raw: 45, scaled: 240 },
      { ets_raw: 50, scaled: 265 },
      { ets_raw: 55, scaled: 290 },
      { ets_raw: 60, scaled: 310 },
      { ets_raw: 65, scaled: 335 },
      { ets_raw: 70, scaled: 360 },
      { ets_raw: 75, scaled: 380 },
      { ets_raw: 80, scaled: 400 },
      { ets_raw: 85, scaled: 420 },
      { ets_raw: 90, scaled: 440 },
      { ets_raw: 95, scaled: 465 },
      { ets_raw: 100, scaled: 495 },
    ];

    const readingTable = [
      { ets_raw: 0, scaled: 5 },
      { ets_raw: 5, scaled: 25 },
      { ets_raw: 10, scaled: 45 },
      { ets_raw: 15, scaled: 70 },
      { ets_raw: 20, scaled: 95 },
      { ets_raw: 25, scaled: 120 },
      { ets_raw: 30, scaled: 145 },
      { ets_raw: 35, scaled: 170 },
      { ets_raw: 40, scaled: 200 },
      { ets_raw: 45, scaled: 225 },
      { ets_raw: 50, scaled: 250 },
      { ets_raw: 55, scaled: 275 },
      { ets_raw: 60, scaled: 300 },
      { ets_raw: 65, scaled: 325 },
      { ets_raw: 70, scaled: 350 },
      { ets_raw: 75, scaled: 375 },
      { ets_raw: 80, scaled: 400 },
      { ets_raw: 85, scaled: 420 },
      { ets_raw: 90, scaled: 445 },
      { ets_raw: 95, scaled: 470 },
      { ets_raw: 100, scaled: 495 },
    ];

    const listening_scaled = interpolateScore(ets_raw_listen, listeningTable);
    const reading_scaled = interpolateScore(ets_raw_read, readingTable);
    const toeic_lr_score = listening_scaled + reading_scaled;

    let writing_scaled = Math.round((ai_writing_score / 6) * 190) + 10;
    writing_scaled = Math.max(10, Math.min(200, writing_scaled));

    let speaking_scaled = Math.round((ai_speaking_score / 8) * 190) + 10;
    speaking_scaled = Math.max(10, Math.min(200, speaking_scaled));

    const toeic_sw_score = speaking_scaled + writing_scaled;

    setdiemLR(`${toeic_lr_score}`);
    setdiemSW(`${toeic_sw_score}`);

    try {
      const response = await fetch(`${BACKEND_URL}/api/luu-kiem-tra-dau-vao`, {
        method: "POST",
        headers: {
          Authorization: Token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diemLR: toeic_lr_score,
          diemSW: toeic_sw_score,
          motanangluc: getMoTaNangLuc(toeic_lr_score, toeic_sw_score),
        }),
      });
      const data = await response.json();
      console.log("Kết quả lưu DB:", data);
    } catch (err) {
      console.log("Lỗi lưu kết quả", err);
    }

    setalLoad(false);
    setHienThiKetQua(true);
  };

  useEffect(() => {
    if (!hienThiKetQua) return;
    const recalculate = async () => {
      try {
        const apiKH = await fetch(`${BACKEND_URL}/khoaHoc`);
        const resKH = await apiKH.json();
        if (resKH.trangThai === "tc" && resKH.dulieu) {
          let available_courses: any[] = [];

          for (const kh of resKH.dulieu) {
            if (!kh.DauRa || !kh.kyNang || kh.trangThai !== "Đang Hoạt Động")
              continue;

            let raw_lr = null;
            let raw_sw = null;

            if (kh.kyNang === "4KN") {
              const match = kh.DauRa.match(/(\d+)\s*-\s*(\d+)/);
              if (match) {
                raw_lr = parseInt(match[1]);
                raw_sw = parseInt(match[2]);
              }
            } else if (kh.kyNang === "LR") {
              const target = parseInt(kh.DauRa.replace(/[^0-9]/g, ""));
              if (!isNaN(target)) raw_lr = target;
            } else if (kh.kyNang === "SW") {
              const target = parseInt(kh.DauRa.replace(/[^0-9]/g, ""));
              if (!isNaN(target)) raw_sw = target;
            }

            if (raw_lr !== null || raw_sw !== null) {
              available_courses.push({
                ...kh,
                raw_lr,
                raw_sw,
                lr_10:
                  raw_lr !== null
                    ? Math.round((raw_lr / 990) * 100) / 10
                    : null,
                sw_10:
                  raw_sw !== null
                    ? Math.round((raw_sw / 400) * 100) / 10
                    : null,
              });
            }
          }

          let current_lr_raw = parseInt(diemLR) || 0;
          let current_sw_raw = parseInt(diemSW) || 0;
          let goiy: any[] = [];

          let target_lr_max = Infinity;
          let target_sw_max = Infinity;
          let force_priority = "";

          if (chonMT === 1) {
            target_lr_max = 400 + 100;
            force_priority = "LR";
          }
          if (chonMT === 2) {
            target_lr_max = 600 + 100;
            force_priority = "LR";
          }
          if (chonMT === 3) {
            target_lr_max = Infinity;
            force_priority = "LR";
          }
          if (chonMT === 4) {
            target_sw_max = 100 + 25;
            force_priority = "SW";
          }
          if (chonMT === 5) {
            target_sw_max = 180 + 25;
            force_priority = "SW";
          }
          if (chonMT === 6) {
            target_sw_max = Infinity;
            force_priority = "SW";
          }
          if (chonMT === 7) {
            target_lr_max = 350 + 100;
            target_sw_max = 80 + 25;
            force_priority = "";
          }
          if (chonMT === 8) {
            target_lr_max = 500 + 100;
            target_sw_max = 160 + 25;
            force_priority = "";
          }
          if (chonMT === 9) {
            target_lr_max = Infinity;
            target_sw_max = Infinity;
            force_priority = "";
          }

          for (let i = 0; i < 4; i++) {
            if (available_courses.length === 0) break;

            let student_lr_10 = Math.round((current_lr_raw / 990) * 100) / 10;
            let student_sw_10 = Math.round((current_sw_raw / 400) * 100) / 10;

            let priority = "";
            if (force_priority) {
              priority = force_priority;
            } else {
              if (student_lr_10 <= 3 && student_sw_10 <= 3) priority = "ALL";
              else if (student_lr_10 < student_sw_10) priority = "LR";
              else if (student_sw_10 < student_lr_10) priority = "SW";
              else priority = "LR";
            }

            let eligible_courses = [];

            if (priority === "ALL") {
              eligible_courses = available_courses.filter(
                (c) =>
                  c.kyNang === "4KN" &&
                  c.raw_lr > current_lr_raw &&
                  c.raw_sw > current_sw_raw &&
                  c.raw_lr <= target_lr_max &&
                  c.raw_sw <= target_sw_max,
              );
              if (eligible_courses.length === 0 && !force_priority) {
                priority =
                  student_lr_10 < student_sw_10
                    ? "LR"
                    : student_sw_10 < student_lr_10
                      ? "SW"
                      : "LR";
              }
            }

            if (
              priority === "LR" ||
              (force_priority === "ALL" && eligible_courses.length === 0)
            ) {
              let lr_candidates = available_courses.filter(
                (c) =>
                  (c.kyNang === "LR" || c.kyNang === "4KN") &&
                  c.raw_lr > current_lr_raw &&
                  c.raw_lr <= target_lr_max,
              );
              if (force_priority === "ALL")
                eligible_courses = eligible_courses.concat(lr_candidates);
              else eligible_courses = lr_candidates;

              if (eligible_courses.length === 0 && !force_priority)
                priority = "SW";
            }

            if (
              priority === "SW" ||
              (force_priority === "ALL" && eligible_courses.length === 0)
            ) {
              let sw_candidates = available_courses.filter(
                (c) =>
                  (c.kyNang === "SW" || c.kyNang === "4KN") &&
                  c.raw_sw > current_sw_raw &&
                  c.raw_sw <= target_sw_max,
              );
              if (force_priority === "ALL")
                eligible_courses = eligible_courses.concat(sw_candidates);
              else eligible_courses = sw_candidates;

              if (
                eligible_courses.length === 0 &&
                student_lr_10 > student_sw_10 &&
                !force_priority
              ) {
                priority = "LR";
                eligible_courses = available_courses.filter(
                  (c) =>
                    (c.kyNang === "LR" || c.kyNang === "4KN") &&
                    c.raw_lr > current_lr_raw &&
                    c.raw_lr <= target_lr_max,
                );
              }
            }

            if (eligible_courses.length === 0) break;

            eligible_courses.sort((a, b) => {
              let gapA = 0;
              let gapB = 0;
              if (priority === "ALL" || force_priority === "ALL") {
                gapA = a.lr_10 - student_lr_10 + (a.sw_10 - student_sw_10);
                gapB = b.lr_10 - student_lr_10 + (b.sw_10 - student_sw_10);
              } else if (priority === "LR" || force_priority === "LR") {
                gapA = a.lr_10 - student_lr_10;
                gapB = b.lr_10 - student_lr_10;
              } else if (priority === "SW" || force_priority === "SW") {
                gapA = a.sw_10 - student_sw_10;
                gapB = b.sw_10 - student_sw_10;
              }
              return gapA - gapB;
            });

            const best_course = eligible_courses[0];
            goiy.push(best_course);

            available_courses = available_courses.filter(
              (c) => c._id !== best_course._id,
            );

            if (best_course.kyNang === "LR") {
              if (best_course.raw_lr > current_lr_raw)
                current_lr_raw = best_course.raw_lr;
            } else if (best_course.kyNang === "SW") {
              if (best_course.raw_sw > current_sw_raw)
                current_sw_raw = best_course.raw_sw;
            } else if (best_course.kyNang === "4KN") {
              if (best_course.raw_lr > current_lr_raw)
                current_lr_raw = best_course.raw_lr;
              if (best_course.raw_sw > current_sw_raw)
                current_sw_raw = best_course.raw_sw;
            }
          }

          if (goiy.length === 0) {
            goiy = resKH.dulieu
              .filter((kh: any) => kh.trangThai === "Đang Hoạt Động")
              .slice(0, 4);
          }
          setDanhSachGoiY(goiy);
        }
      } catch (err) {
        console.log("loi lay khoa hoc", err);
      }
    };
    recalculate();
  }, [chonMT, hienThiKetQua, diemLR, diemSW]);

  useEffect(() => {
    layData();
  }, []);

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

  useEffect(() => {
    if (hienThiKetQua || alLoad || phase !== "exam") return;
    if (timeLeft <= 0) {
      xuLyNopBai();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, hienThiKetQua, alLoad, phase]);

  if (dataCauHoi.length === 0)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-t from-[#2F8C8F] to-[#A9F9FC]">
        <div className="w-[50px] h-[50px] border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (phase === "countdown")
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-t from-[#2F8C8F] to-[#A9F9FC] gap-8">
        <p className="text-white text-[20px]">Bài kiểm tra đầu vào sẽ bắt đầu sau</p>
        <div className="w-[160px] h-[160px] rounded-full  flex items-center justify-center">
          <span className="text-[80px] font-extrabold text-white">
            {countDown}
          </span>
        </div>
        <p className="text-white font-bold text-[22px]">
          {examInfo?.tenDe || "Kiểm Tra Đầu Vào"}
        </p>
        <p className="text-white text-[14px]">
          Thời gian: 35 phút | {dataCauHoi.length} câu hỏi
        </p>
      </div>
    );

  return (
    <>
      <Header
        type="LBT"
        nopbai={nopbai}
        timer={hienThiKetQua ? undefined : timeLeft}
      />

      <section className="mx-[10px] flex relative gap-3 ">
        {alLoad && <Load noiDung={"Cú đang chấm điểm bạn chờ chút nhé"} />}

        {boxXacNhanNop && (
          <BoxXacNhanNopBai
            noiDung="Bạn chưa hoàn thành tất cả các câu hỏi. Bạn có chắc chắn muốn nộp bài?"
            tat={() => setBoxXacNhanNop(false)}
            nopBai={xuLyNopBai}
          />
        )}

        {!hienThiKetQua && dataCauHoi.length > 0 && (
          <HV_box_bt
            loai={"lamBT"}
            dapan={dapan[Chon]}
            capNhatDapAn={capNhatDapAn}
            data={dataCauHoi[Chon]}
            Chon={Chon}
            ClickChon={clickChon}
          />
        )}

        {/* giao diện kết quả khi hoàn thành */}
        {hienThiKetQua && (
          <div
            className={`  overflow-hidden flex justify-center  w-full bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F] h-[calc(100vh-85px)] rounded-[20px] gap-5 items-center `}
          >
            {/* phần hiển thị kết quả */}
            <div className="w-[800px] p-[45px] rounded-[20px] bg-white">
              {/* phần thông tin */}
              <div className="flex justify-between items-center ">
                <div className="flex flex-col gap-1">
                  <p className="text-black/50">Chúc mừng</p>
                  <h1 className="text-black text-[25px] font-bold">
                    Đinh Văn Ngọc Toàn
                  </h1>
                  <p className="text-black/50">
                    Đã hoàn thành bài kiểm tra đàu vào
                  </p>
                  <h1 className=" text-[25px] font-extrabold text-[#114A53]">
                    L&R : {diemLR} | S&W : {diemSW}
                  </h1>
                </div>
                <div className="h-[150px]">
                  <img className="h-full" src="/cuChucMung.png" alt="" />
                </div>
              </div>
              {/* phần mô tả */}
              <div className="p-[10px] h-[150px] bg-[#ebf4f6] rounded-[10px]">
                <p className="font-medium mb-[10px]">Mô tả năng lực:</p>
                <p className="text-black/80">
                  {getMoTaNangLuc(
                    parseInt(diemLR || "0"),
                    parseInt(diemSW || "0"),
                  )}
                </p>
              </div>
              {/* phần mục tiêu */}
              <p className="text-[27px] bg-gradient-to-t from-[#4ADADE] to-[#287678] bg-clip-text text-transparent mt-[10px] font-extrabold">
                MỤC TIÊU CỦA BẠN
              </p>
              {/* danh sách mục tiêu */}

              <div className="mt-[10px] flex gap-2">
                {/* TOIC Listening & Readin */}
                <div className="w-full p-[10px]  rounded-[10px] bg-[#ebf4f6] flex flex-col items-center gap-2">
                  <p className="font-extrabold text-[#13474B] ">
                    TOIC Listening & Reading
                  </p>
                  <div
                    onClick={() => {
                      setchonMT(1);
                    }}
                    className={`w-full py-[10px] border border-black/20 rounded-[20px] transition-all duration-300 cursor-pointer font-bold text-center flex justify-center items-center ${chonMT === 1 && `bg-[#114A53] text-white`}`}
                  >
                    TOIC LR 350-400{" "}
                  </div>
                  <div
                    onClick={() => {
                      setchonMT(2);
                    }}
                    className={`w-full py-[10px] border border-black/20 rounded-[20px] transition-all duration-300 cursor-pointer font-bold text-center flex justify-center items-center ${chonMT === 2 && `bg-[#114A53] text-white`}`}
                  >
                    TOIC LR 500-600{" "}
                  </div>
                  <div
                    onClick={() => {
                      setchonMT(3);
                    }}
                    className={`w-full py-[10px] border border-black/20 rounded-[20px] transition-all duration-300 cursor-pointer font-bold text-center flex justify-center items-center ${chonMT === 3 && `bg-[#114A53] text-white`}`}
                  >
                    TOIC LR 650-700+{" "}
                  </div>
                </div>
                {/* TOEIC Speaking & Writing TOIC SW 80-100 */}
                <div className="w-full p-[10px]  rounded-[10px] bg-[#ebf4f6] flex flex-col items-center gap-2">
                  <p className="font-extrabold text-[#13474B] ">
                    TOEIC Speaking & Writing
                  </p>
                  <div
                    onClick={() => {
                      setchonMT(4);
                    }}
                    className={`w-full py-[10px] border border-black/20 rounded-[20px] transition-all duration-300 cursor-pointer font-bold text-center flex justify-center items-center ${chonMT === 4 && `bg-[#114A53] text-white`}`}
                  >
                    TOIC SW 80-100{" "}
                  </div>
                  <div
                    onClick={() => {
                      setchonMT(5);
                    }}
                    className={`w-full py-[10px] border border-black/20 rounded-[20px] transition-all duration-300 cursor-pointer font-bold text-center flex justify-center items-center ${chonMT === 5 && `bg-[#114A53] text-white`}`}
                  >
                    TOIC SW 160-180{" "}
                  </div>
                  <div
                    onClick={() => {
                      setchonMT(6);
                    }}
                    className={`w-full py-[10px] border border-black/20 rounded-[20px] transition-all duration-300 cursor-pointer font-bold text-center flex justify-center items-center ${chonMT === 6 && `bg-[#114A53] text-white`}`}
                  >
                    TOIC SW 230-250+{" "}
                  </div>
                </div>
                {/* TOEIC 4 kỹ năng */}
                <div className="w-full p-[10px]  rounded-[10px] bg-[#ebf4f6] flex flex-col items-center gap-2">
                  <p className="font-extrabold text-[#13474B] ">
                    TOEIC 4 kỹ năng
                  </p>
                  <div
                    onClick={() => {
                      setchonMT(7);
                    }}
                    className={`w-full py-[10px] border border-black/20 rounded-[20px] transition-all duration-300 cursor-pointer font-bold text-center flex justify-center items-center ${chonMT === 7 && `bg-[#114A53] text-white`}`}
                  >
                    TOIC LR 350 & SW 80
                  </div>
                  <div
                    onClick={() => {
                      setchonMT(8);
                    }}
                    className={`w-full py-[10px] border border-black/20 rounded-[20px] transition-all duration-300 cursor-pointer font-bold text-center flex justify-center items-center ${chonMT === 8 && `bg-[#114A53] text-white`}`}
                  >
                    TOIC LR 500 & SW 160
                  </div>
                  <div
                    onClick={() => {
                      setchonMT(9);
                    }}
                    className={`w-full py-[10px] border border-black/20 rounded-[20px] transition-all duration-300 cursor-pointer font-bold text-center flex justify-center items-center ${chonMT === 9 && `bg-[#114A53] text-white`}`}
                  >
                    TOIC LR 650+ & SW 230+
                  </div>
                </div>
              </div>
            </div>
            {/* phần hiển thị gợi ý khóa học */}
            <div className="w-[500px] flex flex-col items-center  p-[30px] rounded-[20px] backdrop-blur-sm border items-center bg-white/15 h-[660px] gap-2">
              <h2 className="font-extrabold text-white text-[30px]">
                Lộ Trình Đề Xuất
              </h2>
              <div className="w-full h-full  overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                {danhSachGoiY.map((kh, idx) => (
                  <div
                    key={idx}
                    className="w-full p-[10px] bg-white rounded-[20px]"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-[45px] h-[45px] shrink-0 rounded-[50%] bg-[#d7e8ec] flex justify-center items-center  text-[25px] font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-extrabold text-[#114a53] text-[20px]">
                          {kh.TenKhoaHoc}
                        </p>
                        <p className="text-black/70 text-[15px]">
                          Kết quả đầu ra : {kh.DauRa || "Không xác định"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => ChuyenTrang(`/khoahoc/${kh._id}`)}
                      className="w-full text-center py-[10px] rounded-[20px] bg-[#114A53] text-white font-bold mt-[10px]"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                ))}
                {danhSachGoiY.length === 0 && (
                  <div className="text-white italic text-center w-full mt-10">
                    Chưa có khóa học gợi ý
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
