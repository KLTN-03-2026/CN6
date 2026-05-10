import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemSuaVideo from "./ThemSuaVideo";
import BoxDanhSachVideo from "./BoxDanhSachVideo";
import Alert from "./aletr";
import { BACKEND_URL } from "../FileThongso";

export default function QL_vidoBaiGiang() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const [DataKhoaHoc, setDataKhoaHoc] = useState<any[]>([]);
  const [Tap, setTap] = useState<string | null>(null);

  const [DataVideo, setDataVideo] = useState<any[]>([]);
  const [TypeThemSua, setTypeThemSua] = useState("them");
  const [idVideo, setidVideo] = useState("");
  const [ThemVideo, setThemVideo] = useState(false);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const chuyenTrang = useNavigate();
  const TatThongBao = () => {
    settb(false);
  };

  const layDataKhoaHoc = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/khoaHoc`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataKhoaHoc(req.dulieu);
        if (req.dulieu.length > 0) {
          setTap(req.dulieu[0]._id);
        }
      }
    } catch (err) {
      console.log("Lấy data khóa học thất bại: " + err);
    }
  };

  const layDanhSachVideo = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/layDanhSachVideo-tbkh`, {
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "ktt") {
        setDataVideo([]);
      } else if (req.trangThai === "tc") {
        setDataVideo(req.data);
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("w"); // w , err
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("Lấy danh sách video thất bại: " + err);
    }
  };

  const layid = (id: string) => {
    setidVideo(id);
  };

  const tatThemVideo = () => {
    setThemVideo(false);
  };

  const suaVideo = () => {
    setThemVideo(true);
    setTypeThemSua("sua");
  };

  useEffect(() => {
    layDataKhoaHoc();
  }, []);

  useEffect(() => {
    if (Tap) {
      layDanhSachVideo();
    }
  }, [Tap]);

  // Lọc ra các video thuộc khóa học đang chọn
  const videoCuaKhoaHoc =
    DataVideo?.filter((item) => item.idKhoaHoc === Tap) || [];

  return (
    <section className="w-full flex flex-col gap-2 relative mt-[10px]">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      <div className="text-[#2A6770] font-medium text-[15px] flex gap-2 justify-start items-center">
        {/* Nút thêm video cho Khóa học hiện tại */}
        {Tap && (
          <div
            onClick={() => {
              setThemVideo(true);
              setTypeThemSua("them");
            }}
            className="shrink-0 cursor-pointer w-[35px] h-[35px] bg-[#114A53] rounded-[50%] flex justify-center items-center transition-all duration-300 hover:scale-[1.05]"
            title="Thêm video mới"
          >
            <img
              className="w-[60%]"
              src="https://img.icons8.com/?size=100&id=3220&format=png&color=f7f7f7"
              alt="Thêm"
            />
          </div>
        )}

        {/* Danh sách tab Khóa học */}
        <div className="flex w-full gap-2 items-center overflow-x-auto flex-nowrap py-2 custom-scrollbar">
          {DataKhoaHoc?.map((item) => (
            <div
              onClick={() => {
                setTap(item._id);
              }}
              key={item._id}
              className={`shrink-0 cursor-pointer px-[15px] py-[10px] rounded-[10px] w-fit border transition-all duration-300 border-black/20 ${Tap === item._id && "bg-[#d7e8ec]"}`}
            >
              {item.TenKhoaHoc}
            </div>
          ))}
        </div>
      </div>

      {/* Main List */}
      <div className="flex gap-2 flex-col mt-[20px]">
        {!Tap && DataKhoaHoc.length === 0 && (
          <p className="w-full text-center text-black/60 italic">
            Chưa có khóa học nào được tạo.
          </p>
        )}

        {Tap && videoCuaKhoaHoc.length === 0 && (
          <p className="w-full text-center text-black/60 italic">
            Khóa học này chưa có video bài giảng nào.
          </p>
        )}

        {Tap &&
          videoCuaKhoaHoc
            .toReversed()
            .map((items) => (
              <BoxDanhSachVideo
                key={items._id}
                layid={layid}
                suaVideo={suaVideo}
                items={items}
                laydata={layDanhSachVideo}
              />
            ))}
      </div>

      {/* Modal Thêm/Sửa */}
      {ThemVideo && Tap && (
        <ThemSuaVideo
          layVideo={layDanhSachVideo}
          type={TypeThemSua}
          tatThemVideo={tatThemVideo}
          idVideo={idVideo}
          idKhoaHoc={Tap}
        />
      )}
    </section>
  );
}
