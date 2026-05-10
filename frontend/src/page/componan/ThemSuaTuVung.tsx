import { eachAxis } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "./aletr";
import { BACKEND_URL } from "../FileThongso";

interface ThemSuaTuVungProps {
  tatThemTV: () => void;
  type: string;
  layTuVung: () => void;
  idTuVung: string;
  idKhoaHoc?: string;
}

export default function ThemSuaTuVung({
  tatThemTV,
  type,
  layTuVung,
  idTuVung,
  idKhoaHoc,
}: ThemSuaTuVungProps) {
  const params = useParams();
  const id = idKhoaHoc || params.id;
  const [Token, setToken] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const inTuVung = useRef<HTMLTextAreaElement>(null);
  const inTenTV = useRef<HTMLInputElement>(null);
  const [alInTuVung, setalInTuVung] = useState(false);
  const [alInTenTV, setalInTenTV] = useState(false);
  const [DataTuVung, setDataTuVung] = useState("");
  const [TenTuVung, setTenTuVung] = useState("");

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const themTuVung = async () => {
    const TuVung = inTuVung.current?.value || "";
    const TenTV = inTenTV.current?.value || "";
    if (TuVung === "") {
      setalInTuVung(true);
    } else setalInTuVung(false);
    if (TenTV === "") {
      setalInTenTV(true);
    } else setalInTenTV(false);
    if (TuVung !== "" && TenTV !== "") {
      setalInTuVung(false);
      setalInTenTV(false);
      const data = {
        tuVung: TuVung,
        TenTuVung: TenTV,
      };
      try {
        const api = await fetch(`${BACKEND_URL}/api/them-TuVung/${id}`, {
          method: "POST",
          headers: { Authorization: Token, "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const req = await api.json();
        if (req.trangThai === "tc") {
          layTuVung();
          tatThemTV();
        } else if (req.trangThai === "hh") {
          settb(true);
          settypeTB("w"); // w , err
          setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
        }
      } catch (err) {
        console.log("them tư vung that bại :" + err);
      }
    }
  };

  const CapNhatTuVung = async () => {
    const TuVung = inTuVung.current?.value || "";
    const TenTV = inTenTV.current?.value || "";
    if (TuVung === "") {
      setalInTuVung(true);
    } else setalInTuVung(false);
    if (TenTV === "") {
      setalInTenTV(true);
    } else setalInTenTV(false);
    if (TuVung !== "" && TenTV !== "") {
      try {
        const data = {
          TenTuVung: inTenTV.current?.value || "",
          tuVung: inTuVung.current?.value || "",
        };
        const api = await fetch(
          `${BACKEND_URL}/api/capNhatTuVung/${idTuVung}`,
          {
            method: "PATCH",
            headers: {
              Authorization: Token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );
        const req = await api.json();
        if (req.trangThai === "tc") {
          layTuVung();
          tatThemTV();
        }
      } catch (err) {
        console.log("cap nhat tu vung that bai : " + err);
      }
    }
  };

  const layChiTietTuVung = async () => {
    try {
      const api = await fetch(
        `${BACKEND_URL}/api/lay-tuvung-chitiet/${idTuVung}`,
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        setTenTuVung(req.data.TenTuVung);
        setDataTuVung(req.data.tuVung);
      }
      console.log("lay chi tiet tu vung thanh cong");
    } catch (err) {
      console.log("lay từ vựng thất bại :" + err);
    }
  };
  useEffect(() => {
    if (type !== "them") {
      layChiTietTuVung();
    }
  });
  return (
    <div className="w-screen h-screen bg-black/50 fixed top-0 left-0 z-20 flex justify-center items-center">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      <img
        onClick={tatThemTV}
        className="cursor-pointer w-[50px] fixed top-[20px] right-[20px] drop-shadow-[0_0_5px_rgb(0,0,0)]"
        src="https://img.icons8.com/?size=100&id=6483&format=png&color=ffffff"
        alt=""
      />
      <div className="flex flex-col gap-3">
        <div className="w-[800px] p-[20px] rounded-[10px] bg-white flex flex-col gap-2">
          <h1 className="w-full text-center font-bold text-[#13474b] text-[25px]">
            {type === "them" ? `Thêm ` : `Sửa `}
            từ vựng của bạn
          </h1>
          <p className="font-medium text-[#13474b]">Tên từ vựng: (*)</p>
          <input
            ref={inTenTV}
            defaultValue={TenTuVung}
            placeholder="nhập tên từ vựng của bạn (VD : từ vựng 01)"
            className={`w-full p-[10px] rounded-[10px] bg-[#d7e8ec] focus:outline-none ${alInTenTV && `border-[2px] border-red-500`}`}
            type="text"
          />
          {alInTenTV && (
            <p className="text-[13px] text-red-500">
              Ô này không được để trống
            </p>
          )}
          <p className="font-medium text-[#13474b]">Từ vựng: (*)</p>
          <p className="w-full opacity-[0.5] text-[15px] text-center">
            nhập từ theo định dạng (Tiếng anh : Tiếng việt) chuyển sang từ khác
            thì enter xuống dòng.
          </p>
          <textarea
            defaultValue={DataTuVung}
            ref={inTuVung}
            placeholder="Nhập từ vựng của bạn:
Ví Dụ:
hello : xin chào
goodbye : tạm biệt
one : một

"
            className={`w-full min-h-[400px] p-[10px] rounded-[10px] bg-[#d7e8ec] focus:outline-none ${alInTuVung && `border-[2px] border-red-500`}`}
          />
          {alInTuVung && (
            <p className="text-[13px] text-red-500">
              Ô này không được để trống
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {type === "them" ? (
            <button
              onClick={() => {
                themTuVung();
              }}
              className="px-[30px] py-[15px] rounded-[20px] text-[18px] bg-[#13474b] text-white font-bold transition-all duration-300 hover:scale-[1.05]"
            >
              Thêm
            </button>
          ) : (
            <button
              onClick={() => {
                CapNhatTuVung();
              }}
              className="px-[30px] py-[15px] rounded-[20px] text-[18px] bg-[#13474b] text-white font-bold transition-all duration-300 hover:scale-[1.05]"
            >
              Cập Nhật
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
