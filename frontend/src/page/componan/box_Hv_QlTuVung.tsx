import { useEffect, useRef, useState } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import ThemSuaTuVung from "./ThemSuaTuVung";
import BoxDanhSachTuVung from "./boxDanhSachTuVung";
import Alert from "./aletr";

export default function Hv_QlTuVung() {
  const inTeara = useRef<HTMLTextAreaElement>(null);

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const [DataTuVungHV, setDataTuVungHV] = useState<any[]>([]);
  const [DataTuVungTT, setDataTuVungTT] = useState<any[]>([]);
  const [TypeThemSua, setTypeThemSua] = useState("them");
  const [idTuVung, setidTuVung] = useState("");
  const [alTuVung, setAlTuVung] = useState(false);
  const [ThemTv, setThemTV] = useState(false);
  const [chon, setchon] = useState(1);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const { id } = useParams();

  const chuyenTrang = useNavigate();
  const TatThongBao = () => {
    settb(false);
  };

  const them = async () => {
    try {
      const api = await fetch(`http://localhost:3000/api/them-TuVung/${id}`, {
        method: "POST",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({ tuVung: inTeara.current?.value || "" }),
      });
      const req = await api.json();
      if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w"); // w , err
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const layTuVungHocVien = async () => {
    try {
      const api = await fetch(`http://localhost:3000/api/lay-tuVung-hv/${id}`, {
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "ktt") {
        setAlTuVung(true);
      } else if (req.trangThai === "tc") {
        setAlTuVung(false);
        setDataTuVungHV(req.data);
      }
    } catch (err) {
      console.log("lay danh sach tu vung that bai: " + err);
    }
  };

  const layTuVungTrungTam = async () => {
    try {
      const api = await fetch(
        `http://localhost:3000/api/layDanhSachTuVung-Gv/${id}`,
        {
          headers: { Authorization: Token, "Content-Type": "application/json" },
        },
      );
      const req = await api.json();
      if (req.trangThai === "ktt") {
        setAlTuVung(true);
      } else if (req.trangThai === "tc") {
        setAlTuVung(false);
        setDataTuVungTT(req.data);
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w"); // w , err
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("lay danh sach tu vung that bai: " + err);
    }
  };

  const layid = (id: string) => {
    setidTuVung(id);
  };

  const tatThemTV = () => {
    setThemTV(false);
  };

  const suaTuVung = () => {
    setThemTV(true);
    setTypeThemSua("sua");
  };

  useEffect(() => {
    layTuVungHocVien();
    layTuVungTrungTam();
  }, []);

  return (
    <section className="w-full">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      {/* ///////////thẻ tap */}
      <div className="w-full flex gap-2  items-center relative mb-[40px]">
        <div
          onClick={() => {
            setchon(1);
          }}
          className={`p-[10px] cursor-pointer border border-[#2A6770]/20 transition-all duration-300 rounded-[10px] text-[15px] text-[#2A6770] ${chon === 1 && `bg-[rgba(175,208,217,0.5)] `}`}
        >
          Từ vựng của : <span className="font-extrabold">E-Learning</span>
        </div>
        <div
          onClick={() => {
            setchon(2);
          }}
          className={`p-[10px] cursor-pointer border border-[#2A6770]/20 transition-all duration-300  rounded-[10px] text-[15px] text-[#2A6770] ${chon === 2 && `bg-[rgba(175,208,217,0.5)] `}`}
        >
          Từ vựng của : <span className="font-extrabold">Bạn</span>
        </div>

        <button
          onClick={() => {
            setThemTV(true);
            setTypeThemSua("them");
          }}
          className="absolute right-0 w-[35px] h-[35px] flex items-center justify-center font-extrabold  bg-[#114A53] rounded-[50%] "
        >
          <img
            className="w-[50%]"
            src="https://img.icons8.com/?size=100&id=3220&format=png&color=ffffff"
            alt=""
          />
        </button>
      </div>
      {/* ///////////////////main hien tư vung học viên////////////// */}
      {chon === 2 ? (
        <div className="flex gap-2 flex-col">
          {/* ///////// Từ Vựng Học Viên ////////////// */}
          {DataTuVungHV.length === 0 && (
            <p className="w-full text-center">Bạn chưa thêm từ vựng Vào</p>
          )}
          {DataTuVungHV?.toReversed().map((items) => (
            <BoxDanhSachTuVung
              layid={layid}
              suaTuVung={suaTuVung}
              items={items}
              laydata={layTuVungHocVien}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 flex-col">
          {/* ///////////// Từ Vựng Của Trung Tâm */}
          {DataTuVungTT.length === 0 && (
            <p className="w-full text-center">
              Hiện trung tâm chưa thêm từ vựng cho khóa học này
            </p>
          )}
          {DataTuVungTT?.toReversed().map((items) => (
            <div
              key={items._id}
              className={`p-[5px] flex gap-3 items-center relative transition-all duration-300 hover:bg-[#d7e8ec] rounded-[10px]`}
            >
              <div className="w-[40px] h-[40px] bg-[#d7e8ec] rounded-[10px] shrink-0 flex items-center justify-center">
                <img
                  className="w-[70%]"
                  src="https://img.icons8.com/?size=100&id=KeaSSZW47moI&format=png&color=2A6770"
                  alt=""
                />
              </div>
              <p className="text-[18px] font-bold">{items.TenTuVung}</p>
              <button
                onClick={() => {
                  chuyenTrang(`//HocVien/HocTuVung/${items._id}`);
                }}
                className="absolute right-[10px] px-[10px] py-[5px] rounded-[10px] bg-[#2A6770] text-white font-bold"
              >
                Học
              </button>
            </div>
          ))}
        </div>
      )}

      {ThemTv && (
        <ThemSuaTuVung
          layTuVung={layTuVungHocVien}
          type={TypeThemSua}
          tatThemTV={tatThemTV}
          idTuVung={idTuVung}
        />
      )}
    </section>
  );
}
