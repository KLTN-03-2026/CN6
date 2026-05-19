import { useEffect, useRef, useState } from "react";
import Header from "./componan/header";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "./FileThongso";
import Alert from "./componan/aletr";
import StickyBox from "react-sticky-box";
import BoxXacNhan from "./componan/BoxXacNhan";

export default function QL_chiTietThiThu() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const { id } = useParams();

  const [DataThiThu, setDataThiThu] = useState<any>(null);

  // States for alerts/notifications
  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");
  const [Al_tenDe, setAL_TenDe] = useState(false);

  const Input_tenDe = useRef<HTMLInputElement>(null);
  const Input_tenBoDe = useRef<HTMLInputElement>(null);
  


  const navigate = useNavigate();

  const TatThongBao = () => {
    settb(false);
  };

  const [boxXacNhan, setBoxXacNhan] = useState(false);

  const layDataLD = async () => {
    try {
      // 1. Lấy thông tin luyện đề
      const api = await fetch(`${BACKEND_URL}/api/thi-thu/${id}`);
      const req = await api.json();
      if (req.trangThai !== "tc") return;
      setDataThiThu(req.data);

      // 2. Lấy chi tiết câu hỏi
      const api2 = await fetch(`${BACKEND_URL}/api/chi-tiet-thi-thu/${id}`);
      const req2 = await api2.json();
      if (req2.trangThai === "tc" && req2.data && req2.data.length > 0) {
        // Đã có data → hiển thị
        setDataCauHoi(req2.data);
      } else {
        // Chưa có → khởi tạo mặc định
        TaoData(req.data.kyNang);
      }
    } catch (err) {
      console.log("lay data thi thu thất bại :" + err);
    }
  };

  useEffect(() => {
    layDataLD();
  }, [id]);

  // Kiểm tra xác thực thất bại
  const kiemTraHH = (j: any): boolean => {
    if (j?.trangThai === "hh") {
      settb(true);
      settypeTB("err");
      setNdTB("Đăng nhập hết hạn, vui lòng đăng nhập lại!");
      return true;
    }
    return false;
  };

  const xoaLuyenDe = () => {
    // Mở box xác nhận, chưa xóa ngay
    setBoxXacNhan(true);
  };

  const doXoa = async () => {
    setBoxXacNhan(false);
    try {
      // 1. Xóa toàn bộ câu hỏi trong ChiTietThiThu theo idThiThu
      const r1 = await fetch(`${BACKEND_URL}/api/chi-tiet-thi-thu/${id}`, {
        method: "DELETE",
        headers: { Authorization: Token },
      });
      const j1 = await r1.json();
      if (kiemTraHH(j1)) return;
      if (j1.trangThai !== "tc") {
        settb(true);
        settypeTB("err");
        setNdTB("Xóa chi tiết thi thử thất bại!");
        return;
      }
      // 2. Xóa thi thử trong bảng ThiThu
      const r2 = await fetch(`${BACKEND_URL}/api/thi-thu/${id}`, {
        method: "DELETE",
        headers: { Authorization: Token },
      });
      const j2 = await r2.json();
      if (kiemTraHH(j2)) return;
      if (j2.trangThai !== "tc") {
        settb(true);
        settypeTB("err");
        setNdTB("Xóa thi thử thất bại!");
        return;
      }
      navigate(-1);
    } catch (err) {
      console.log("Lỗi xóa thi thử:", err);
      settb(true);
      settypeTB("err");
      setNdTB("Đã xảy ra lỗi khi xóa!");
    }
  };

  const luuTrangThai = async (trangT: string) => {
    const tenDe = Input_tenDe.current?.value?.trim() || "";
    const tenBoDe = Input_tenBoDe.current?.value?.trim() || "";
    if (!tenDe || !tenBoDe) {
      settb(true);
      settypeTB("err");
      setNdTB("Tên đề và tên bộ đề không được để trống!");
      return;
    }

    // Kiểm tra đầy đủ giải thích và đáp án khi xuất bản
    if (trangT === "Đã Tạo") {
      const skill = DataThiThu?.kyNang?.toLowerCase();
      const chuaXong = DataCauHoi.some((row: any) =>
        row.noiDungCauHoi?.some((q: any) => {
          const checkGiaiThich = !q.giaiThich || q.giaiThich.trim() === "";
          const checkDapAn = skill === "listening && reading" && !q.dapAn;
          return checkGiaiThich || checkDapAn;
        }),
      );
      if (chuaXong) {
        settb(true);
        settypeTB("w");
        setNdTB(
          "Vui lòng điền đầy đủ nội dung giải thích và chọn đáp án đúng!",
        );
        return;
      }
    }

    try {
      // 1. Cập nhật tên + trạng thái vào bảng ThiThu
      const r1 = await fetch(`${BACKEND_URL}/api/thi-thu/${id}`, {
        method: "PATCH",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({ tenBoDe, tenDe, trangThai: trangT }),
      });
      const j1 = await r1.json();
      if (kiemTraHH(j1)) return;
      if (j1.trangThai !== "tc") {
        settb(true);
        settypeTB("err");
        setNdTB("Cập nhật thi thử thất bại!");
        return;
      }
      // 2. Xóa toàn bộ câu hỏi cũ trong ChiTietThiThu
      const r2 = await fetch(`${BACKEND_URL}/api/chi-tiet-thi-thu/${id}`, {
        method: "DELETE",
        headers: { Authorization: Token },
      });
      const j2 = await r2.json();
      if (kiemTraHH(j2)) return;
      if (j2.trangThai !== "tc") {
        settb(true);
        settypeTB("err");
        setNdTB("Xóa câu hỏi cũ thất bại!");
        return;
      }
      // 3. Thêm toàn bộ DataCauHoi vào ChiTietThiThu
      const dataToSave = DataCauHoi.map((item) => ({ ...item, idThiThu: id }));

      const r3 = await fetch(`${BACKEND_URL}/api/chi-tiet-thi-thu`, {
        method: "POST",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });
      const j3 = await r3.json();
      if (kiemTraHH(j3)) return;
      if (j3.trangThai !== "tc") {
        settb(true);
        settypeTB("err");
        setNdTB("Lưu câu hỏi thất bại!");
        return;
      }
      settb(true);
      settypeTB("ss");
      setNdTB(
        trangT === "Đã Tạo"
          ? "Xuất bản thành công!"
          : "Lưu bản nháp thành công!",
      );
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      console.log("Lỗi lưu thi thử:", err);
      settb(true);
      settypeTB("err");
      setNdTB("Đã xảy ra lỗi!");
    }
  };

  const [DataCauHoi, setDataCauHoi] = useState<any[]>([]);
  const TaoData = (skill: string) => {
    const kyNang = skill.toLowerCase();
    let DataCauHoi_Copy: any[] = [];
    console.log(kyNang);
    if (kyNang === "listening && reading") {
      let socau = 1;
      // thêm dữ liệu part 1
      for (let i = 0; i < 6; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 1",
          fileNghe: "",
          anh: "",
          type: 0,
          noiDungDoc: "",
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau++;
      }
      // thêm dữ liệu part 2
      for (let i = 0; i < 25; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 2",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 0,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",

              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        socau++;

        DataCauHoi_Copy.push(newdata);
      }
      // thêm part 3
      for (let i = 0; i < 13; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 3",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 0,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",

              a: "",
              b: "",
              c: "",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "",

              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 2,
              cauHoi: "",

              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        socau = socau + 3;

        DataCauHoi_Copy.push(newdata);
      }
      /// part 4
      for (let i = 0; i < 10; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 4",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 0,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",

              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "",

              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 2,
              cauHoi: "",

              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        socau = socau + 3;

        DataCauHoi_Copy.push(newdata);
      }
      // thêm part 5

      for (let i = 0; i < 30; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 5",
          fileNghe: "",
          anh: "",
          type: 0,
          noiDungDoc: "",
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau++;
      }
      //thêm part 6
      for (let i = 0; i < 4; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 6",
          fileNghe: "",
          anh: "",
          type: 0,
          noiDungDoc: "",
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 2,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 3,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau = socau + 4;
      }
      // thêm part 7 đoạn đơn 2 câu //////////////////
      for (let i = 0; i < 4; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 7",
          fileNghe: "",
          anh: "",
          type: 0,
          noiDungDoc: "",
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau = socau + 2;
      }
      // thêm part 7 3 câu
      for (let i = 0; i < 3; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 7",
          fileNghe: "",
          anh: "",
          type: 0,
          noiDungDoc: "",
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 2,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau = socau + 3;
      }
      // thêm part 7 4 câu
      for (let i = 0; i < 3; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 7",
          fileNghe: "",
          anh: "",
          type: 0,
          noiDungDoc: "",
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 2,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 3,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau = socau + 4;
      }
      // part 7 doạn đôi
      for (let i = 0; i < 2; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 7",
          fileNghe: "",
          anh: "",
          type: 0,
          noiDungDoc: "",
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 2,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 3,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + +4,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau = socau + 5;
      }
      // part 7 đoạn ba
      for (let i = 0; i < 3; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Part 7",
          fileNghe: "",
          anh: "",
          type: 0,
          noiDungDoc: "",
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 2,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 3,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + +4,
              cauHoi: "",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau = socau + 5;
      }
    } else if (kyNang === "speaking && writing") {
      let socau = 1;
      for (let i = 0; i < 2; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Speaking(Câu 1-2)",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 3,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau++;
      }
      // câu 3-4: link hình ảnh, nội dung câu hỏi, giải thích
      for (let i = 0; i < 2; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Câu 3-4",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 3,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau++;
      }
      // câu 5-7: nội dung bài đọc, lần lượt nội dung câu hỏi & giải thích của 3 câu
      for (let i = 0; i < 3; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Câu 5-7",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 3,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau++;
      }
      // câu 8-10: nội dung bài đọc, link hình ảnh, lần lượt nội dung câu hỏi & giải thích của 3 câu

      const newdata = {
        idThiThu: id,
        tenPart: "Câu 8-10",
        fileNghe: "",
        anh: "",
        noiDungDoc: "",
        type: 3,
        noiDungCauHoi: [
          {
            soCau: socau,
            cauHoi: "",
            a: "",
            b: "",
            c: "",
            d: "",
            dapAn: "",
            giaiThich: "",
          },
          {
            soCau: socau + 1,
            cauHoi: "",
            a: "",
            b: "",
            c: "",
            d: "",
            dapAn: "",
            giaiThich: "",
          },
          {
            soCau: socau + 2,
            cauHoi: "",
            a: "",
            b: "",
            c: "",
            d: "",
            dapAn: "",
            giaiThich: "",
          },
        ],
      };
      DataCauHoi_Copy.push(newdata);
      socau += 3;

      // câu 11: chỉ nội dung câu hỏi
      const newdata11 = {
        idThiThu: id,
        tenPart: "Câu 11",
        fileNghe: "",
        anh: "",
        noiDungDoc: "",
        type: 3,
        noiDungCauHoi: [
          {
            soCau: socau,
            cauHoi: "",
            a: "",
            b: "",
            c: "",
            d: "",
            dapAn: "",
            giaiThich: "",
          },
        ],
      };
      DataCauHoi_Copy.push(newdata11);
      socau++;
      // câu 1-5: có link hình ảnh, nội dung câu hỏi, giải thích
      for (let i = 0; i < 5; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Writing (Câu 1-5)",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 1,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau++;
      }
      // câu 6-7: có nội dung câu hỏi, nội dung bài đọc, giải thích
      for (let i = 0; i < 2; i++) {
        const newdata = {
          idThiThu: id,
          tenPart: "Câu 6-7",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 2,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "",
              a: "",
              b: "",
              c: "",
              d: "",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau++;
      }
      // câu 8: chỉ có nội dung câu hỏi, giải thích
      const newdata8 = {
        idThiThu: id,
        tenPart: "Câu 8",
        fileNghe: "",
        anh: "",
        noiDungDoc: "",
        type: 2,
        noiDungCauHoi: [
          {
            soCau: socau,
            cauHoi: "",
            a: "",
            b: "",
            c: "",
            d: "",
            dapAn: "",
            giaiThich: "",
          },
        ],
      };
      DataCauHoi_Copy.push(newdata8);
    }
    setDataCauHoi(DataCauHoi_Copy);
  };

  const boxChoncauhoi = () => {
    let cauhoi: { part: string; slCau: number }[] = [];
    const kyNang = DataThiThu?.kyNang?.toLowerCase();

    if (kyNang === "listening && reading") {
      cauhoi = [
        { part: "Part 1", slCau: 6 },
        { part: "Part 2", slCau: 25 },
        { part: "Part 3", slCau: 39 },
        { part: "Part 4", slCau: 30 },
        { part: "Part 5", slCau: 30 },
        { part: "Part 6", slCau: 16 },
        { part: "Part 7", slCau: 54 },
      ];
    } else if (kyNang === "speaking && writing") {
      cauhoi = [
        { part: "Speaking(Câu 1-2)", slCau: 2 },
        { part: "Câu 3-4", slCau: 2 },
        { part: "Câu 5-7", slCau: 3 },
        { part: "Câu 8-10", slCau: 3 },
        { part: "Câu 11", slCau: 1 },
        { part: "Writing (Câu 1-5)", slCau: 5 },
        { part: "Câu 6-7", slCau: 2 },
        { part: "Câu 8", slCau: 1 },
      ];
    }

    let tongSoCauTruoc = 0;

    return (
      <StickyBox
        offsetTop={70}
        offsetBottom={20}
        className="w-[350px] border border-black/20 h-fit p-[20px] bg-white rounded-[10px] sticky ofse shrink-0"
      >
        <div className="w-full flex justify-center items-center">
          <p className="font-medium text-[#2f6169]">
            Danh sách câu hỏi các part
          </p>
        </div>
        <div className="border border-b-black/20 my-[10px]"></div>

        {cauhoi.map((item, index) => {
          const startIndex = tongSoCauTruoc;
          tongSoCauTruoc += item.slCau;

          return (
            <div
              key={index}
              className="w-full pb-[15px] mb-[10px] border-b border-b-black/10 last:border-b-0 last:mb-0 last:pb-0"
            >
              <p className="font-bold text-[#2f6169] mb-2">{item.part}</p>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // tập hợp soCau đã được nhập đủ giải thích
                  const soCauDaLuu = new Set<number>();
                  DataCauHoi.forEach((row: any) => {
                    const allDone = row.noiDungCauHoi?.every(
                      (q: any) => q.giaiThich && q.giaiThich.trim() !== "",
                    );
                    if (allDone) {
                      row.noiDungCauHoi.forEach((q: any) =>
                        soCauDaLuu.add(q.soCau),
                      );
                    }
                  });

                  return Array.from({ length: item.slCau }).map((_, i) => {
                    const soCau = startIndex + i + 1;
                    const daLuu = soCauDaLuu.has(soCau);
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          const el = document.getElementById(`cau-${soCau}`);
                          if (el)
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        }}
                        className={`w-[35px] h-[35px] flex justify-center items-center rounded-[5px] text-[13px] font-medium cursor-pointer transition-all ${
                          daLuu
                            ? "bg-[#2f6169] text-white hover:bg-[#4aa4a7]"
                            : "bg-[#d7e8ec] text-[#2f6169] hover:bg-[#4aa4a7] hover:text-white"
                        }`}
                      >
                        {soCau}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          );
        })}

        {cauhoi.length === 0 && (
          <p className="text-center text-black/50 italic py-4">
            Đang tải cấu trúc đề...
          </p>
        )}
      </StickyBox>
    );
  };

  const [alPart, setalPart] = useState("");

  // ====== state & logic box sửa câu hỏi ======
  const [boxSua, setBoxSua] = useState(false);
  const [indexSua, setIndexSua] = useState(0);
  const [dataSua, setDataSua] = useState<any>(null);

  // states lỗi validate
  const [errFileNghe, setErrFileNghe] = useState(false);
  const [errAnh, setErrAnh] = useState(false);
  const [errNoiDungDoc, setErrNoiDungDoc] = useState(false);
  const [errGiaiThich, setErrGiaiThich] = useState<boolean[]>([]);
  const [errDapAn, setErrDapAn] = useState<boolean[]>([]);

  // ref cho các trường chung
  const ref_fileNghe = useRef<HTMLInputElement>(null);
  const ref_anh = useRef<HTMLInputElement>(null);
  const ref_noiDungDoc = useRef<HTMLTextAreaElement>(null);

  const getFieldVisibility = (skill: string | undefined, qNum: number) => {
    const isLR = skill?.toLowerCase() === "listening && reading";
    const isSW = skill?.toLowerCase() === "speaking && writing";
    
    let showAudio = false;
    let showImage = true;
    let showNoiDungDoc = true;
    let showABCD = false;
    let showCauHoi = true;
    let showGiaiThich = true;
    let requireAudio = false;

    if (isLR) {
      showABCD = true;
      showAudio = qNum <= 100;
      requireAudio = qNum <= 100; // Bắt buộc với Listening
      
      if (qNum <= 6) {
        // Part 1
        showNoiDungDoc = false;
        showCauHoi = false;
      } else if (qNum <= 31) {
        // Part 2
        showImage = false;
        showNoiDungDoc = false;
        showCauHoi = false;
      } else if (qNum <= 70) {
        // Part 3
        showNoiDungDoc = false;
      } else if (qNum <= 100) {
        // Part 4
        showNoiDungDoc = false;
      } else if (qNum <= 130) {
        // Part 5
        showImage = false;
        showNoiDungDoc = false;
      } else {
        // Part 6, 7
      }
    } else if (isSW) {
      showABCD = false;
      
      if (qNum <= 2) {
        showImage = false;
      } else if (qNum <= 4) {
        showNoiDungDoc = false;
      } else if (qNum <= 7) {
        showImage = false;
        showNoiDungDoc = false;
      } else if (qNum <= 10) {
        // keep as is
      } else if (qNum === 11) {
        showImage = false;
      } else if (qNum <= 16) {
        showNoiDungDoc = false;
      } else if (qNum <= 18) {
        // keep as is
      } else if (qNum === 19) {
        showImage = false;
      }
    }

    return { showAudio, requireAudio, showImage, showNoiDungDoc, showABCD, showCauHoi, showGiaiThich };
  };

  const moBoxSua = (idx: number) => {
    setIndexSua(idx);
    setDataSua(DataCauHoi[idx]);
    setErrFileNghe(false);
    setErrAnh(false);
    setErrNoiDungDoc(false);
    setErrGiaiThich([]);
    setErrDapAn([]);
    setBoxSua(true);
  };

  const luuSua = () => {
    if (!dataSua) return;
    const skill = DataThiThu?.kyNang?.toLowerCase();
    const firstSoCau = dataSua.noiDungCauHoi?.[0]?.soCau ?? 1;
    const visibility = getFieldVisibility(skill, firstSoCau);

    const valFileNghe = ref_fileNghe.current?.value?.trim() ?? dataSua.fileNghe;
    const valAnh = ref_anh.current?.value?.trim() ?? dataSua.anh;
    const valNoiDungDoc = ref_noiDungDoc.current?.value?.trim() ?? dataSua.noiDungDoc;

    let hasErr = false;
    
    if (visibility.requireAudio && !valFileNghe) {
      setErrFileNghe(true);
      hasErr = true;
    } else setErrFileNghe(false);

    // Vẫn giữ lại validation cũ cho các trường này nếu chúng được hiển thị
    const needAnh =
      (skill === "listening && reading" &&
        (firstSoCau <= 6 ||
          (firstSoCau >= 62 && firstSoCau <= 70) ||
          (firstSoCau >= 92 && firstSoCau <= 100))) ||
      (skill === "speaking && writing" &&
        [3, 4, 8, 9, 10].includes(firstSoCau)) ||
      (skill === "speaking && writing" && firstSoCau >= 12 && firstSoCau <= 16);
      
    const needNoiDungDoc =
      (skill === "listening && reading" && firstSoCau >= 131) ||
      (skill === "speaking && writing" &&
        firstSoCau >= 17 &&
        firstSoCau <= 18) ||
      (skill === "speaking && writing" && firstSoCau <= 2);

    if (visibility.showImage && needAnh && !valAnh) {
      setErrAnh(true);
      hasErr = true;
    } else setErrAnh(false);

    if (visibility.showNoiDungDoc && needNoiDungDoc && !valNoiDungDoc) {
      setErrNoiDungDoc(true);
      hasErr = true;
    } else setErrNoiDungDoc(false);

    // kiểm tra giải thích
    if (visibility.showGiaiThich) {
      const errGT = dataSua.noiDungCauHoi.map((q: any) => !q.giaiThich?.trim());
      setErrGiaiThich(errGT);
      if (errGT.some(Boolean)) hasErr = true;
    }

    // kiểm tra đáp án đúng
    if (visibility.showABCD) {
      const errDA = dataSua.noiDungCauHoi.map((q: any) => !q.dapAn);
      setErrDapAn(errDA);
      if (errDA.some(Boolean)) hasErr = true;
    }

    if (hasErr) return;

    const newItem = {
      ...dataSua,
      fileNghe: visibility.showAudio ? valFileNghe : "",
      anh: visibility.showImage ? valAnh : "",
      noiDungDoc: visibility.showNoiDungDoc ? valNoiDungDoc : "",
    };
    setDataCauHoi((prev) =>
      prev.map((item, i) => (i === indexSua ? newItem : item)),
    );
    setBoxSua(false);
    setDataSua(null);
  };

  const updateCauHoiSua = (qIdx: number, field: string, val: string) => {
    setDataSua((prev: any) => ({
      ...prev,
      noiDungCauHoi: prev.noiDungCauHoi.map((q: any, i: number) =>
        i === qIdx ? { ...q, [field]: val } : q,
      ),
    }));
  };

  const inPrat = (index: number) => {
    const skill = DataThiThu?.kyNang?.toLowerCase();
    if (skill === "listening && reading") {
      if (index === 1) {
        return (
          <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
            Part 1
          </p>
        );
      } else if (index === 7) {
        return (
          <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
            Part 2
          </p>
        );
      } else if (index === 32) {
        return (
          <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
            Part 3
          </p>
        );
      } else if (index === 45) {
        return (
          <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
            Part 4
          </p>
        );
      } else if (index === 55) {
        return (
          <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
            Part 5
          </p>
        );
      } else if (index === 85) {
        return (
          <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
            Part 6
          </p>
        );
      } else if (index === 89) {
        return (
          <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
            Part 7
          </p>
        );
      }
      return;
    } else if (skill === "speaking && writing") {
      if (index === 1) {
        return (
          <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
            Speaking
          </p>
        );
      } else if (index === 10) {
        return (
          <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
            Writing
          </p>
        );
      }
    }
    return;
  };

  const BoxCauHoi = (items: any, index: number) => {
    // const [HienThemSua, setHienThemSua] = useState(false);

    return (
      <div>
        {inPrat(index + 1)}
        {/* {HienThemSua && (
          <div className="w-screen h-screen bg-black/50 z-[2] fixed top-0 left-0 flex justify-center items-center">
            <div className="p-[20px] bg-white w-[700px] shrink-0 rounded-[10px]">
              <h1 className="w-full text-center text-[20px] font-bold text-[#2f6169] ">
                Cập nhật câu
              </h1>
              <p>{index}</p>
            </div>
          </div>
        )} */}
        <div
          id={`cau-${items.noiDungCauHoi?.[0]?.soCau}`}
          key={items}
          onClick={() => moBoxSua(index)}
          className="w-full transition-all duration-300 hover:bg-[#e6f0f3] cursor-pointer bg-white p-[20px] border border-black/20 rounded-[10px] flex flex-col gap-5"
        >
          {/* nội dung câu hỏi */}
          {items.anh !== "" && (
            <div className="w-full justify-center flex ">
              <div className="w-[300px] aspect-[4/3] overflow-hidden  rounded-[20px] flex justify-center items-center">
                <img
                  className="w-full  object-contain"
                  src={`${items.anh}`}
                  alt=""
                />
              </div>
            </div>
          )}
          {items.fileNghe !== "" && (
            <div className="w-full justify-center flex ">
              <audio controls>
                <source src={`${items.fileNghe}`} type="audio/mpeg" />
              </audio>
            </div>
          )}
          {items.noiDungDoc !== "" && (
            <p className="w-full whitespace-pre-wrap">{items.noiDungDoc}</p>
          )}
          {items.noiDungCauHoi?.map((items2: any) => (
            <div className=" flex flex-col gap-2">
              <p className="font-medium">
                Câu hỏi {items2.soCau} : {items2.cauHoi}
              </p>
              {items.type === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex ">
                    <div className="w-full flex gap-2 items-center">
                      <div
                        className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 ${items2.dapAn === "a" ? "bg-[#2f6169]" : ""}`}
                      />
                      <p>{items2.a}</p>
                    </div>
                    <div className="w-full flex gap-2 items-center">
                      <div
                        className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 ${items2.dapAn === "b" ? "bg-[#2f6169]" : ""}`}
                      />
                      <p>{items2.b}</p>
                    </div>
                  </div>
                  <div className="flex ">
                    <div className="w-full flex gap-2 items-center">
                      <div
                        className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 ${items2.dapAn === "c" ? "bg-[#2f6169]" : ""}`}
                      />
                      <p>{items2.c}</p>
                    </div>
                    <div className="w-full flex gap-2 items-center">
                      <div
                        className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 ${items2.dapAn === "d" ? "bg-[#2f6169]" : ""}`}
                      />
                      <p>{items2.d}</p>
                    </div>
                  </div>
                </div>
              )}
              <p>Giải thích</p>
              <div className="p-[10px] w-full rounded-[10px] bg-[#d7e8eca1]">
                {items2.giaiThich === "" ? (
                  <p>Chưa thêm giải thích</p>
                ) : (
                  <p className="whitespace-pre-line">{items2.giaiThich}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  //   ////////////////////MAIN ////////////////////////////

  return (
    <>
      <Header type="khien" />
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      {boxXacNhan && (
        <BoxXacNhan
          xoa={doXoa}
          tat={() => setBoxXacNhan(false)}
          noiDung={`Bạn có chắc chắn muốn xóa luyện đề?`}
        />
      )}

      {/* ====== BOX SỬA CÂU HỎI ====== */}
      {boxSua && dataSua && (
        <div className="w-screen h-screen bg-black/50 fixed top-0 left-0 z-[20] flex justify-center items-center">
          <div className="w-[900px] max-h-[88vh] overflow-y-auto bg-white rounded-[15px] p-[25px] flex flex-col gap-4 shadow-2xl">
            {/* tiêu đề */}
            <div className="flex justify-between items-center">
              <h2 className="text-[18px] font-bold text-[#2f6169]">
                {dataSua.tenPart} — Câu {dataSua.noiDungCauHoi?.[0]?.soCau}
                {dataSua.noiDungCauHoi?.length > 1
                  ? ` → ${dataSua.noiDungCauHoi[dataSua.noiDungCauHoi.length - 1]?.soCau}`
                  : ""}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBoxSua(false);
                    setDataSua(null);
                  }}
                  className="px-[20px] py-[8px] border border-black/20 rounded-[8px] font-medium hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={luuSua}
                  className="px-[20px] py-[8px] bg-[#154e56] text-white rounded-[8px] font-medium hover:bg-[#0d2f35]"
                >
                  Lưu
                </button>
              </div>
            </div>
            <div className="border-b border-black/10" />

            {(() => {
              const visibility = getFieldVisibility(
                DataThiThu?.kyNang?.toLowerCase(),
                dataSua.noiDungCauHoi?.[0]?.soCau ?? 1
              );
              return (
                <>
                  {/* --- Link âm thanh --- */}
                  {visibility.showAudio && (
                    <div>
                      <p className="text-[13px] font-medium mb-1">
                        Link âm thanh {visibility.requireAudio ? "(*)" : ""}
                      </p>
                      <input
                        ref={ref_fileNghe}
                        defaultValue={dataSua.fileNghe}
                        placeholder="http://..."
                        className={`w-full p-[10px] border rounded-[8px] text-[13px] outline-none focus:border-[#2f6169] ${
                          errFileNghe
                            ? "border-red-500 bg-red-50"
                            : "border-[#164e57] bg-[#d7e8ec20]"
                        }`}
                      />
                      {errFileNghe && (
                        <p className="text-red-500 text-[12px] mt-1">
                          Link âm thanh không được để trống
                        </p>
                      )}
                    </div>
                  )}

                  {/* --- Link hình ảnh --- */}
                  {visibility.showImage && (
                    <div>
                      <p className="text-[13px] font-medium mb-1">
                        Link hình ảnh{errAnh ? " (*)" : ""}
                      </p>
                      <input
                        ref={ref_anh}
                        defaultValue={dataSua.anh}
                        placeholder="http://..."
                        className={`w-full p-[10px] border rounded-[8px] text-[13px] outline-none focus:border-[#2f6169] ${
                          errAnh
                            ? "border-red-500 bg-red-50"
                            : "border-[#164e57] bg-[#d7e8ec20]"
                        }`}
                      />
                      {errAnh && (
                        <p className="text-red-500 text-[12px] mt-1">
                          Link hình ảnh không được để trống
                        </p>
                      )}
                    </div>
                  )}

                  {/* --- Nội dung bài đọc --- */}
                  {visibility.showNoiDungDoc && (
                    <div>
                      <p className="text-[13px] font-medium mb-1">
                        Nội dung bài đọc{errNoiDungDoc ? " (*)" : ""}
                      </p>
                      <textarea
                        ref={ref_noiDungDoc}
                        defaultValue={dataSua.noiDungDoc}
                        rows={5}
                        placeholder="Nhập nội dung đoạn văn..."
                        className={`w-full p-[10px] border rounded-[8px] text-[13px] outline-none focus:border-[#2f6169] resize-none ${
                          errNoiDungDoc
                            ? "border-red-500 bg-red-50"
                            : "border-[#164e57] bg-[#d7e8ec20]"
                        }`}
                      />
                      {errNoiDungDoc && (
                        <p className="text-red-500 text-[12px] mt-1">
                          Nội dung bài đọc không được để trống
                        </p>
                      )}
                    </div>
                  )}
                </>
              );
            })()}

            {/* --- Từng câu hỏi --- */}
            {dataSua.noiDungCauHoi?.map((q: any, qIdx: number) => {
              const visibility = getFieldVisibility(
                DataThiThu?.kyNang?.toLowerCase(),
                dataSua.noiDungCauHoi?.[0]?.soCau ?? 1
              );
              return (
                <div
                  key={qIdx}
                  className="border border-black/10 rounded-[10px] p-[15px] flex flex-col gap-3 bg-white"
                >
                  <p className="font-bold text-[#2f6169] text-[15px]">
                    Câu {q.soCau}
                  </p>

                  {visibility.showCauHoi && (
                    <div>
                      <p className="text-[13px] font-medium mb-1">
                        Nội dung câu hỏi
                      </p>
                      <textarea
                        value={q.cauHoi}
                        onChange={(e) =>
                          updateCauHoiSua(qIdx, "cauHoi", e.target.value)
                        }
                        rows={3}
                        className="w-full p-[10px] border border-[#164e57] rounded-[8px] text-[13px] bg-[#d7e8ec20] outline-none focus:border-[#2f6169] resize-none"
                      />
                    </div>
                  )}

                  {visibility.showABCD && (
                    <div className="grid grid-cols-2 gap-2">
                      {(["a", "b", "c", "d"] as const).map((k) => (
                        <div key={k} className="flex gap-2 items-center">
                          <div
                            onClick={() => updateCauHoiSua(qIdx, "dapAn", k)}
                            className={`w-[18px] h-[18px] shrink-0 rounded-full border cursor-pointer ${
                              q.dapAn === k
                                ? "bg-[#2f6169] border-[#2f6169]"
                                : errDapAn[qIdx]
                                  ? "bg-red-50 border-red-500 "
                                  : "border-black/30"
                            }`}
                          />
                          <input
                            value={q[k] || ""}
                            onChange={(e) =>
                              updateCauHoiSua(qIdx, k, e.target.value)
                            }
                            placeholder={`Đáp án ${k.toUpperCase()}`}
                            className="w-full p-[8px] border border-black/20 rounded-[6px] text-[13px] outline-none focus:border-[#2f6169]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {visibility.showGiaiThich && (
                    <div>
                      <p className="text-[13px] font-medium mb-1">
                        Giải thích (*)
                      </p>
                      <textarea
                        value={q.giaiThich}
                        onChange={(e) =>
                          updateCauHoiSua(qIdx, "giaiThich", e.target.value)
                        }
                        rows={3}
                        className={`w-full p-[10px] border rounded-[8px] text-[13px] outline-none focus:border-[#2f6169] resize-none ${
                          errGiaiThich[qIdx]
                            ? "border-red-500 bg-red-50"
                            : "border-black/20"
                        }`}
                      />
                      {errGiaiThich[qIdx] && (
                        <p className="text-red-500 text-[12px] mt-1">
                          Giải thích không được để trống
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <section className="mx-[50px] my-[20px]">
        {/* phần box trên cùng */}
        <div className="w-full p-[20px] border border-black/20 rounded-[20px] flex flex-col gap-5">
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="w-[70px] h-[70px] bg-[#d7e8ec] rounded-[10px] flex justify-center items-center shrink-0">
                <img
                  className="w-[80%]"
                  src="https://img.icons8.com/?size=100&id=rYkEZD1xSmKa&format=png&color=2f6169"
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center">
                <input
                  key={DataThiThu ? DataThiThu._id : "loading"}
                  ref={Input_tenDe}
                  defaultValue={`${DataThiThu?.tenDe ? DataThiThu.tenDe : "Tên luyện đề"}`}
                  className={`text-[25px] font-bold text-[#306263] p-[5px] border rounded-[10px] w-[500px] outline-none ${Al_tenDe ? "border-red-500 bg-red-50" : "border-black/20"}`}
                  type="text"
                  placeholder="Nhập tên luyện đề"
                />
                <div className="flex gap-4 mt-1 ml-1 text-black/70">
                  <p className="font-bold">
                    Kỹ năng:{" "}
                    <span className="uppercase text-[#2f6169]">
                      {DataThiThu?.kyNang || "N/A"}
                    </span>
                  </p>
                  <p>|</p>
                  <p>
                    Ngày tạo / Update: {DataThiThu?.ngayTao || "Đang tải..."}
                  </p>
                </div>
              </div>
            </div>
            <input
              key={DataThiThu ? DataThiThu._id : "loading-bode"}
              ref={Input_tenBoDe}
              defaultValue={`${DataThiThu?.tenBoDe || ""}`}
              className={`text-[25px] text-right shrink-0 font-bold text-[#306263] p-[5px] border rounded-[10px] w-[250px] outline-none ${Al_tenDe ? "border-red-500 bg-red-50" : "border-black/10"}`}
              placeholder="Nhập tên bộ đề"
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              <div className="border border-black/20 px-[20px] py-[10px] rounded-[10px] min-w-[150px] text-center font-bold bg-white text-[#2A6770]">
                {DataThiThu?.trangThai || "Bản Nháp"}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={xoaLuyenDe}
                className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] hover:bg-[#fee2e2] rounded-[10px] text-[#8f3533] font-bold"
              >
                Xóa luyện đề
              </button>
              <button
                onClick={() => luuTrangThai("Bản Nháp")}
                className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] border border-[#2f6169] rounded-[10px] text-[#2f6169] font-bold hover:bg-[#f0f7f8]"
              >
                Lưu bản nháp
              </button>
              <button
                onClick={() => luuTrangThai("Đã Tạo")}
                className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] bg-gradient-to-t from-[#308d90] to-[#a8f8fb] drop-shadow-[0_0_5px_rgb(0,0,0,0.2)] rounded-[10px] text-white font-bold"
              >
                Xuất bản
              </button>
            </div>
          </div>
        </div>
        {/* đường kẻ */}
        <div className="border border-b-black/20 my-[20px]"></div>

        {/* Nhập link âm thanh chung cho đề */}

        {/* box câu hỏi */}
        <div className="w-full flex gap-4 items-start">
          {boxChoncauhoi()}
          <div className="w-full flex flex-col gap-2">

            {DataCauHoi?.map((items, index) => BoxCauHoi(items, index))}
          </div>
        </div>
      </section>
    </>
  );
}
