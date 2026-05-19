import { useEffect, useRef, useState } from "react";
import Header from "./componan/header";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "./FileThongso";
import Alert from "./componan/aletr";
import StickyBox from "react-sticky-box";
import BoxXacNhan from "./componan/BoxXacNhan";

export default function QL_ChiTietKTDauVao() {
  const [Token] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const { id } = useParams();
  const navigate = useNavigate();

  const [DataKTDV, setDataKTDV] = useState<any>(null);
  const [DataCauHoi, setDataCauHoi] = useState<any[]>([]);

  // States for alerts/notifications
  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");
  const [Al_tenKTDV, setAL_TenKTDV] = useState(false);

  const Input_tenKTDV = useRef<HTMLInputElement>(null);
  const [boxXacNhan, setBoxXacNhan] = useState(false);

  const TatThongBao = () => settb(false);

  const layData = async () => {
    try {
      // 1. Lấy thông tin đề kiểm tra đầu vào
      const api = await fetch(`${BACKEND_URL}/api/kiem-tra-dau-vao/${id}`);
      const req = await api.json();
      if (req.trangThai !== "tc") return;
      setDataKTDV(req.data);

      // 2. Lấy chi tiết câu hỏi
      const api2 = await fetch(
        `${BACKEND_URL}/api/chi-tiet-kiem-tra-dau-vao/${id}`,
      );
      const req2 = await api2.json();
      if (req2.trangThai === "tc" && req2.data && req2.data.length > 0) {
        setDataCauHoi(req2.data);
      } else {
        // Chưa có -> khởi tạo mặc định
        TaoData();
      }
    } catch (err) {
      console.log("Lấy data kiểm tra đầu vào thất bại:", err);
    }
  };

  useEffect(() => {
    layData();
  }, [id]);

  const kiemTraHH = (j: any): boolean => {
    if (j?.trangThai === "hh") {
      settb(true);
      settypeTB("err");
      setNdTB("Đăng nhập hết hạn, vui lòng đăng nhập lại!");
      return true;
    }
    return false;
  };

  const doXoa = async () => {
    setBoxXacNhan(false);
    try {
      const r = await fetch(`${BACKEND_URL}/api/kiem-tra-dau-vao/${id}`, {
        method: "DELETE",
        headers: { Authorization: Token },
      });
      const j = await r.json();
      if (kiemTraHH(j)) return;
      if (j.trangThai === "tc") {
        navigate(-1);
      } else {
        settb(true);
        settypeTB("err");
        setNdTB("Xóa thất bại!");
      }
    } catch (err) {
      console.log("Lỗi xóa:", err);
    }
  };

  const luuTrangThai = async (trangT: string) => {
    const ten = Input_tenKTDV.current?.value?.trim() || "";
    if (!ten) {
      setAL_TenKTDV(true);
      settb(true);
      settypeTB("err");
      setNdTB("Tên đề không được để trống!");
      return;
    }
    setAL_TenKTDV(false);

    // Kiểm tra đầy đủ nội dung khi xuất bản
    if (trangT === "Đã Tạo") {
      const chuaHoanThanh = DataCauHoi.some(
        (item, idx) =>
          item.CauHoi.trim() === "" ||
          (item.type === 0 && item.dapAn === "") ||
          (idx < 10 && (!item.fileNghe || item.fileNghe.trim() === "")),
      );
      if (chuaHoanThanh) {
        settb(true);
        settypeTB("w");
        setNdTB(
          "Vui lòng điền đầy đủ nội dung câu hỏi, đáp án và file nghe (câu 1-10)!",
        );
        return;
      }
    }

    try {
      // 1. Cập nhật tên + trạng thái
      const r1 = await fetch(`${BACKEND_URL}/api/kiem-tra-dau-vao/${id}`, {
        method: "PATCH",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({ tenKiemTraDauVao: ten, trangThai: trangT }),
      });
      const j1 = await r1.json();
      if (kiemTraHH(j1)) return;

      // 2. Xóa câu hỏi cũ
      await fetch(`${BACKEND_URL}/api/chi-tiet-kiem-tra-dau-vao/${id}`, {
        method: "DELETE",
        headers: { Authorization: Token },
      });

      // 3. Thêm mới
      const r3 = await fetch(`${BACKEND_URL}/api/chi-tiet-kiem-tra-dau-vao`, {
        method: "POST",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify(
          DataCauHoi.map((item) => ({ ...item, idKiemTraDauVao: id })),
        ),
      });
      const j3 = await r3.json();
      if (j3.trangThai === "tc") {
        settb(true);
        settypeTB("ss");
        setNdTB(
          trangT === "Đã Tạo"
            ? "Xuất bản thành công!"
            : "Lưu bản nháp thành công!",
        );
        setTimeout(() => navigate(-1), 1200);
      }
    } catch (err) {
      console.log("Lỗi lưu:", err);
    }
  };

  const TaoData = () => {
    let DataCauHoi_Copy: any[] = [];
    // 25 câu trắc nghiệm (type 0)
    for (let i = 1; i <= 25; i++) {
      DataCauHoi_Copy.push({
        idKiemTraDauVao: id,
        CauHoi: ``,
        type: 0,
        a: "(A) ",
        b: "(B) ",
        c: "(C) ",
        d: "(D) ",
        fileNghe: "",
        anh: "",
        dapAn: "",
      });
    }
    // 1 câu tự luận ngắn (type 1)
    DataCauHoi_Copy.push({
      idKiemTraDauVao: id,
      CauHoi: "",
      type: 2,
      a: "",
      b: "",
      c: "",
      d: "",
      fileNghe: "",
      anh: "",
      dapAn: "",
    });
    // 1 câu ghi âm (type 3)
    DataCauHoi_Copy.push({
      idKiemTraDauVao: id,
      CauHoi: "",
      type: 3,
      a: "",
      b: "",
      c: "",
      d: "",
      fileNghe: "",
      anh: "",
      dapAn: "",
    });
    setDataCauHoi(DataCauHoi_Copy);
  };

  // ====== state & logic box sửa câu hỏi ======
  const [boxSua, setBoxSua] = useState(false);
  const [indexSua, setIndexSua] = useState(0);
  const [dataSua, setDataSua] = useState<any>(null);
  const [errDapAn, setErrDapAn] = useState(false);
  const [errCauHoi, setErrCauHoi] = useState(false);
  const [errFileNghe, setErrFileNghe] = useState(false);

  const getQuestionTypeText = (index: number) => {
    if (index >= 0 && index <= 9) return "Listening";
    if (index >= 10 && index <= 24) return "Reading";
    if (index === 25) return "Writing";
    if (index === 26) return "Speaking";
    return "Unknown";
  };

  const moBoxSua = (idx: number) => {
    setIndexSua(idx);
    setDataSua({ ...DataCauHoi[idx] });
    setErrDapAn(false);
    setErrCauHoi(false);
    setErrFileNghe(false);
    setBoxSua(true);
  };

  const updateCauHoiSua = (field: string, val: any) => {
    setDataSua((prev: any) => ({ ...prev, [field]: val }));
  };

  const luuSua = () => {
    if (!dataSua) return;

    let check = false;
    if (dataSua.type === 0 && dataSua.dapAn === "") {
      setErrDapAn(true);
      check = true;
    }

    if (dataSua.CauHoi.trim() === "") {
      setErrCauHoi(true);
      check = true;
    }

    if (
      indexSua < 10 &&
      (!dataSua.fileNghe || dataSua.fileNghe.trim() === "")
    ) {
      setErrFileNghe(true);
      check = true;
    }

    if (check) return;

    setDataCauHoi((prev) =>
      prev.map((item, i) => (i === indexSua ? dataSua : item)),
    );
    setBoxSua(false);
  };

  const boxChoncauhoi = () => {
    const soCauDaLuu = new Set(
      DataCauHoi.filter(
        (item) =>
          item.CauHoi.trim() !== "" && (item.type !== 0 || item.dapAn !== ""),
      ).map((_, i) => i + 1),
    );

    return (
      <StickyBox offsetTop={100} offsetBottom={20}>
        <div className="w-[250px] p-[20px] bg-white border border-black/20 rounded-[10px] flex flex-col gap-4">
          <p className="font-bold text-[#2f6169] text-[18px] border-b border-black/10 pb-2">
            DANH SÁCH CÂU
          </p>
          <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {DataCauHoi.map((_, i) => {
              const soCau = i + 1;
              return (
                <div
                  key={i}
                  onClick={() => {
                    const el = document.getElementById(`cau-${i}`);
                    if (el)
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }}
                  className={`w-[35px] h-[35px] flex justify-center items-center rounded-[5px] text-[13px] font-medium cursor-pointer transition-all ${
                    DataCauHoi[i].CauHoi.trim() !== "" &&
                    (i >= 10 || DataCauHoi[i].fileNghe.trim() !== "")
                      ? "bg-[#2f6169] text-white hover:bg-[#4aa4a7]"
                      : "bg-[#d7e8ec] text-[#2f6169] hover:bg-[#4aa4a7] hover:text-white"
                  }`}
                >
                  {soCau}
                </div>
              );
            })}
          </div>
        </div>
      </StickyBox>
    );
  };

  const BoxCauHoi = (item: any, index: number) => {
    return (
      <div
        key={index}
        id={`cau-${index}`}
        onClick={() => moBoxSua(index)}
        className="w-full transition-all duration-300 hover:bg-[#f0f7f8] cursor-pointer bg-white p-[20px] border border-black/20 rounded-[10px] flex flex-col gap-4 mb-4"
      >
        <div className="flex items-center gap-3">
          <div className=" text-black   rounded-full flex justify-center items-center font-medium text-[18px]">
            {index + 1}
          </div>
          <p className=" text-black/80 uppercase text-[14px] tracking-wider">
            {getQuestionTypeText(index)}
          </p>
        </div>

        {item.anh && (
          <div className="w-full flex justify-center">
            <img
              src={item.anh}
              alt=""
              className="max-w-[300px] rounded-[10px] shadow-sm"
            />
          </div>
        )}
        {item.fileNghe && (
          <div className="w-full flex justify-center">
            <audio controls className="h-8">
              <source src={item.fileNghe} type="audio/mpeg" />
            </audio>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="font-medium text-[16px]">
            {item.CauHoi || `Câu hỏi ${getQuestionTypeText(index)}...`}
          </p>
          {item.type === 0 && (
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 mt-2">
              {["a", "b", "c", "d"].map((k) => (
                <div key={k} className="flex gap-2 items-center">
                  <div
                    className={`w-[12px] h-[12px] rounded-full border border-black/30 ${item.dapAn === k ? "bg-[#2f6169]" : ""}`}
                  />
                  <p
                    className={`text-[14px] ${item.dapAn === k ? "font-bold text-[#2f6169]" : "text-black/60"}`}
                  >
                    {(item as any)[k] || k.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header type="khien" />
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      {boxXacNhan && (
        <BoxXacNhan
          xoa={doXoa}
          tat={() => setBoxXacNhan(false)}
          noiDung="Bạn có chắc chắn muốn xóa đề kiểm tra đầu vào này?"
        />
      )}

      {/* ====== BOX SỬA CÂU HỎI ====== */}
      {boxSua && dataSua && (
        <div className="w-screen h-screen bg-black/50 fixed top-0 left-0 z-[100] flex justify-center items-center">
          <div className="w-[800px] max-h-[90vh] overflow-y-auto bg-white rounded-[15px] p-[25px] flex flex-col gap-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-black/10 pb-3">
              <h2 className="text-[18px] font-bold text-[#2f6169]">
                CHỈNH SỬA CÂU {indexSua + 1} ({getQuestionTypeText(indexSua)})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setBoxSua(false)}
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

            <div className="flex flex-col gap-4">
              <div
                className={
                  indexSua < 10
                    ? "grid grid-cols-2 gap-4"
                    : "grid grid-cols-1 gap-4"
                }
              >
                <div>
                  <p className="text-[13px] font-medium mb-1">Link hình ảnh</p>
                  <input
                    value={dataSua.anh}
                    onChange={(e) => updateCauHoiSua("anh", e.target.value)}
                    className="w-full p-[10px] border border-black/20 rounded-[8px] text-[13px] outline-none focus:border-[#2f6169]"
                    placeholder="URL..."
                  />
                </div>
                {indexSua < 10 && (
                  <div>
                    <p className="text-[13px] font-medium mb-1">
                      Link file nghe <span className="text-red-500">*</span>
                    </p>
                    <input
                      value={dataSua.fileNghe}
                      onChange={(e) => {
                        updateCauHoiSua("fileNghe", e.target.value);
                        setErrFileNghe(false);
                      }}
                      className={`w-full p-[10px] border rounded-[8px] text-[13px] outline-none focus:border-[#2f6169] ${errFileNghe ? "border-red-500 bg-red-50" : "border-black/20"}`}
                      placeholder="URL..."
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-[13px] font-medium mb-1">Nội dung câu hỏi</p>
                <textarea
                  value={dataSua.CauHoi}
                  onChange={(e) => {
                    updateCauHoiSua("CauHoi", e.target.value);
                    setErrCauHoi(false);
                  }}
                  className={`w-full p-[10px] border rounded-[8px] text-[13px] outline-none focus:border-[#2f6169] resize-none ${errCauHoi ? "border-red-500 bg-red-50" : "border-black/20"}`}
                  rows={3}
                  placeholder="Nhập nội dung..."
                />
              </div>

              {dataSua.type === 0 && (
                <div
                  className={`grid grid-cols-2 gap-4 bg-[#f8fcfd] p-4 rounded-[10px] border-2 transition-all `}
                >
                  {["a", "b", "c", "d"].map((k) => (
                    <div key={k} className="flex gap-2 items-center">
                      <div
                        onClick={() => {
                          updateCauHoiSua("dapAn", k);
                          setErrDapAn(false);
                        }}
                        className={`w-[18px] h-[18px] shrink-0 rounded-full border border-black/10 cursor-pointer transition-all ${
                          dataSua.dapAn === k
                            ? "bg-[#2f6169] border-[#2f6169]"
                            : errDapAn
                              ? "border-red-500 bg-red-50"
                              : "border-black/30"
                        }`}
                      />
                      <input
                        value={(dataSua as any)[k]}
                        onChange={(e) => updateCauHoiSua(k, e.target.value)}
                        placeholder={`Đáp án ${k.toUpperCase()}`}
                        className="w-full p-[8px] border border-black/10 rounded-[6px] text-[13px] outline-none focus:border-[#2f6169]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="mx-[50px] my-[20px]">
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
                  key={DataKTDV ? DataKTDV._id : "loading"}
                  ref={Input_tenKTDV}
                  defaultValue={`${DataKTDV?.tenKiemTraDauVao ? DataKTDV.tenKiemTraDauVao : "Tên luyện đề"}`}
                  className={`text-[25px] font-bold text-[#306263] p-[5px] border rounded-[10px] w-[500px] outline-none ${Al_tenKTDV ? "border-red-500 bg-red-50" : "border-black/20"}`}
                  type="text"
                  placeholder="Nhập tên luyện đề"
                />
                <div className="flex gap-4 mt-1 ml-1 text-black/70">
                  <p className="font-bold">
                    Kỹ năng:{" "}
                    <span className="uppercase text-[#2f6169]">
                      {DataKTDV?.kyNang || "N/A"}
                    </span>
                  </p>
                  <p>|</p>
                  <p>Ngày tạo / Update: {DataKTDV?.ngayTao || "Đang tải..."}</p>
                </div>
              </div>
            </div>
            <div
              className={`text-[30px] text-right shrink-0 font-bold text-[#306263] p-[5px]  rounded-[10px] w-[250px] outline-none `}
            >
              {DataCauHoi.length} Câu hỏi
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              <div className="border border-black/20 px-[20px] py-[10px] rounded-[10px] min-w-[150px] text-center font-bold bg-white text-[#2A6770]">
                {DataKTDV?.trangThai || "Bản Nháp"}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBoxXacNhan(true)}
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
        {/* Top Header Box */}

        <div className="border-b border-black/10 my-[25px]"></div>

        {/* Content Area */}
        <div className="w-full flex gap-6 items-start">
          {boxChoncauhoi()}
          <div className="flex-1 flex flex-col">
            {DataCauHoi.map((item, index) => BoxCauHoi(item, index))}
            {DataCauHoi.length === 0 && (
              <div className="w-full py-20 text-center text-black/30 italic">
                Đang tải dữ liệu câu hỏi...
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
