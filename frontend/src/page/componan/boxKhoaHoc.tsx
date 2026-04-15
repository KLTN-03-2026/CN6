import { FlatTree } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "./aletr";

export default function BoxKhoaHoc() {
  const [Token, setToken] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });
  const [Data, setData] = useState<any[]>([]);
  const [al, setal] = useState(false);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const layDataKH = async () => {
    try {
      const api = await fetch("http://localhost:3000/api/ten-id-lopHoc", {
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        setData(req.data);

        setal(false);
      } else if (req.trangThai === "ktt") {
        setal(true);
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("lay data that bai: " + err);
    }
  };

  const ChuyenTrang = useNavigate();

  useEffect(() => {
    layDataKH();
  }, []);

  return (
    <div className="w-full gap-4  flex items-center flex-col">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      {al && (
        <p className="w-full text-center">Bạn chưa đăng ký Khóa học nào :((</p>
      )}

      {Data?.map((item) => (
        <div className="border drop-shadow-[0_5px_5px_rgb(0,0,0,0.25)] relative border-black/20 p-[5px] w-[800px] flex items-center gap-2 bg-white rounded-[10px]">
          <div className="text-[#0D2A2E] w-[55px] h-[55px] bg-[#C3E4EC] rounded-[10px] flex justify-center items-center text-[15px] font-extrabold">
            {item.TenLop}
          </div>
          <p className="font-extrabold text-[18px] text-[#0D2A2E]">
            {item.TenKhoaHoc}
          </p>
          <button
            onClick={() => {
              ChuyenTrang(`/HocVien/QlLopHoc/${item.idLopHoc}`);
            }}
            className="p-[10px] rounded-[10px] bg-[#0D2A2E] text-white font-extrabold text-[13px] absolute right-[10px]"
          >
            VÀO HỌC →
          </button>
          {(item.trangThai === "an" || item.trangThai === "KetThuc") && (
            <div className="w-full h-full absolute bg-black/50 flex items-center justify-center left-[0] rounded-[10px] font-extrabold backdrop-blur-[3px] text-white">
              {item.trangThai === "an" && "LỚP HỌC TẠM THỜI BỊ KHÓA"}
              {item.trangThai === "KetThuc" && "LỚP HỌC ĐÃ KẾT THÚC"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
