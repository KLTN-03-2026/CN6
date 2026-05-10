import { useEffect, useRef, useState } from "react";
import Header from "./componan/header";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "./FileThongso";
import Alert from "./componan/aletr";

export default function QL_ChamDiemBT() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  // id là idBaiTap, email là email học viên
  const { id, email } = useParams(); 
  const ChuyenTrang = useNavigate();

  const [DataBaiTapDaLam, setDataBaiTapDaLam] = useState<any>(null);
  const [DataChiTiet, setDataChiTiet] = useState<any[]>([]);

  const Input_DiemChinhThuc = useRef<HTMLInputElement>(null);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const layDataBaiTapDaLam = async () => {
    try {
      // Gọi API lấy thông tin bài tập đã làm bằng idBaiTap và email
      const api = await fetch(`${BACKEND_URL}/api/layBaiTapDaLamAdmin/${id}/${email}`, {
        headers: { Authorization: Token },
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataBaiTapDaLam(req.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const layDataChiTietDaLam = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/ChiTietBaiTapDaLamAdmin/${id}/${email}`, {
        headers: { Authorization: Token },
      });
      const req = await await api.json();
      if (req.trangThai === "tc") {
        setDataChiTiet(req.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (id && email) {
      layDataBaiTapDaLam();
      layDataChiTietDaLam();
    }
  }, [id, email]);

  const luuDiemChinhThuc = async () => {
    const diem = Input_DiemChinhThuc.current?.value;
    try {
      const api = await fetch(`${BACKEND_URL}/api/CapNhatDiemChinhThucAdmin/${id}/${email}`, {
        method: "PATCH",
        headers: {
          Authorization: Token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diemChinhThuc: diem }),
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        settb(true);
        settypeTB("tc"); 
        setNdTB("Cập nhật điểm thành công");
      } else {
        settb(true);
        settypeTB("err");
        setNdTB("Cập nhật thất bại");
      }
    } catch (error) {
      console.error(error);
      settb(true);
      settypeTB("err");
      setNdTB("Lỗi khi cập nhật điểm");
    }
  };

  const capNhatGiaiThich = async (idChiTiet: string, giaiThichMoi: string) => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/CapNhatGiaiThichChiTiet/${idChiTiet}`, {
        method: "PATCH",
        headers: {
          Authorization: Token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phanGiaiThich: giaiThichMoi }),
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        settb(true);
        settypeTB("ss"); 
        setNdTB("Lưu giải thích thành công");
      } else {
        settb(true);
        settypeTB("err");
        setNdTB("Lưu thất bại");
      }
    } catch (error) {
      console.error(error);
      settb(true);
      settypeTB("err");
      setNdTB("Lỗi khi lưu giải thích");
    }
  };

  return (
    <>
      <Header type="khien" />
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      <section className="mx-[50px] my-[20px]">
        {/* Phần box trên cùng */}
        <div className="w-full p-[20px] border border-black/20 rounded-[20px] flex flex-col gap-5 bg-white">
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="w-[70px] h-[70px] bg-[#d7e8ec] rounded-[10px] flex justify-center items-center">
                <img
                  className="w-[80%]"
                  src="https://img.icons8.com/?size=100&id=rYkEZD1xSmKa&format=png&color=2f6169"
                  alt="icon"
                />
              </div>
              <div>
                <h1 className="text-[25px] font-bold text-[#306263]">
                  Bài làm của: {DataBaiTapDaLam?.Email || "Đang tải..."}
                </h1>
                <div className="flex gap-4 text-black/70 mt-2">
                  <p>Ngày nộp: {DataBaiTapDaLam?.ngayNop?.split("T")[0] || "---"}</p>
                  <p>|</p>
                  <p>
                    Điểm ước tính:{" "}
                    <span className="font-bold text-[#2f6169]">
                      {DataBaiTapDaLam?.diemUocTinh || "0"}/10
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex flex-col">
                <p className="text-[14px] font-medium text-[#2f6169] mb-1">
                  Điểm chính thức
                </p>
                <input
                  key={DataBaiTapDaLam?.diemChinhThuc}
                  ref={Input_DiemChinhThuc}
                  defaultValue={DataBaiTapDaLam?.diemChinhThuc || ""}
                  type="number"
                  placeholder="Nhập điểm"
                  className="px-[10px] py-[8px] border border-[#2f6169] rounded-[10px] w-[150px] outline-none"
                />
              </div>
              <button
                onClick={luuDiemChinhThuc}
                className="mt-[20px] transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] bg-gradient-to-t from-[#308d90] to-[#a8f8fb] drop-shadow-[0_0_5px_rgb(0,0,0,0.2)] rounded-[10px] text-white font-bold h-[42px] flex items-center"
              >
                Lưu điểm
              </button>
            </div>
          </div>
        </div>

        {/* Phần dấu gạch chân */}
        <div className="border border-b-black/20 my-[20px]"></div>

        {/* Phần danh sách câu hỏi */}
        <div className="w-full flex flex-col gap-5">
          <p className="text-[20px] font-bold text-[#2f6169]">
            Chi tiết bài làm ({DataChiTiet?.length || 0} câu hỏi)
          </p>

          {DataChiTiet?.map((items: any, index: number) => (
            <Box_ChamDiemCauHoi
              key={items._id || index}
              items={items}
              index={index}
              capNhatGiaiThich={capNhatGiaiThich}
            />
          ))}
        </div>
      </section>
    </>
  );
}

// Component cho mỗi câu hỏi
const Box_ChamDiemCauHoi = ({ items, index, capNhatGiaiThich }: any) => {
  // Lấy giải thích của giáo viên
  const [giaiThich, setGiaiThich] = useState(items?.giaiThich || "");
  const [Text_type, setText_type] = useState("Trắc nghiệm");

  useEffect(() => {
    if (items?.type === 0) setText_type("Trắc nghiệm");
    else if (items?.type === 1) setText_type("Tự luận ngắn");
    else if (items?.type === 2) setText_type("Tự luận");
    else if (items?.type === 3) setText_type("Ghi âm");
  }, [items]);

  return (
    <div className="w-full bg-white p-[20px] border border-black/20 rounded-[10px] flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <p className="font-medium text-[16px]">Câu {index + 1}:</p>
        <p className="text-black/50 text-[14px]">({Text_type})</p>
      </div>

      {items.anh && items.anh !== "" && (
        <div className="w-full justify-center flex">
          <div className="w-[300px] aspect-[4/3] overflow-hidden rounded-[20px] flex justify-center items-center">
            <img className="w-full object-contain" src={items.anh} alt="" />
          </div>
        </div>
      )}

      {items.fileNghe && items.fileNghe !== "" && (
        <div className="w-full justify-center flex">
          <audio controls>
            <source src={items.fileNghe} type="audio/mpeg" />
          </audio>
        </div>
      )}

      <p className="font-medium text-[#2f6169] text-[18px]">
        {items?.CauHoi || "Nội dung câu hỏi"}
      </p>

      {/* Hiển thị bài làm của học sinh */}
      <div className="p-[15px] bg-[#f8f9fa] rounded-[10px] border border-black/10">
        <p className="font-medium text-[14px] mb-2">Câu trả lời của học viên:</p>
        
        {items?.type === 0 ? (
          <div className="flex flex-col gap-2 mt-[10px]">
            {['a', 'b', 'c', 'd'].map((opt) => (
              <div key={opt} className="flex gap-2 items-center w-fit">
                <div className="w-[20px] h-[20px] border border-black/50 rounded-[50%] flex justify-center items-center ">
                  {items?.dapAnHocVien === opt && (
                    <div className="w-[15px] h-[15px] rounded-[50%] bg-[#2a6770]"></div>
                  )}
                </div>
                <p
                  className={`${items?.dapAnHocVien === opt && `${items?.dapAn === opt ? `text-green-600 font-medium` : `text-red-600 font-medium`}`} ${items?.dapAn === opt && `text-green-600 font-medium`} `}
                >
                  {items?.[opt]}
                </p>
              </div>
            ))}
          </div>
        ) : items?.type === 3 && items?.dapAnHocVien ? (
          <div className="w-full flex flex-col gap-2 mt-2">
            <audio controls>
              <source
                src={`${BACKEND_URL}/${items?.dapAnHocVien}`}
                type="audio/mpeg"
              />
            </audio>
          </div>
        ) : (
          <p className="text-[15px]">
            {items?.dapAnHocVien || items?.cauTraLoi || "Chưa có câu trả lời"}
          </p>
        )}
      </div>

      {/* Phần giáo viên nhập giải thích/nhận xét */}
      <div className="mt-2 flex flex-col gap-4">
        {/* Lời phê của Cú (Chỉ đọc) */}
        <div>
          <p className="font-medium mb-2">Lời phê của Cú (AI):</p>
          <div className="w-full p-[15px] border border-black/10 rounded-[10px] bg-[#f0f8fa] min-h-[60px]">
            {items?.loipheAI || "AI chưa có nhận xét cho câu này."}
          </div>
        </div>

        {/* Giải thích của Giáo viên (Cho phép nhập) */}
        <div>
          <p className="font-medium mb-2">Giải thích của Giáo viên:</p>
          <textarea
            value={giaiThich}
            onChange={(e) => setGiaiThich(e.target.value)}
            placeholder="Nhập giải thích chi tiết cho câu hỏi này..."
            className="w-full p-[15px] border border-[#164e57] rounded-[10px] bg-[#d7e8ec93] min-h-[100px] outline-none"
          ></textarea>
        </div>
        
        <div className="w-full flex justify-end">
          <button
            onClick={() => capNhatGiaiThich(items?._id || items?.id, giaiThich)}
            className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[8px] border border-[#2f6169] rounded-[10px] text-[#2f6169] font-bold"
          >
            Lưu giải thích
          </button>
        </div>
      </div>
    </div>
  );
};
