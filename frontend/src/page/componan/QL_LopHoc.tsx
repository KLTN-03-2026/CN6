import { useEffect, useState } from "react";
import { BACKEND_URL } from "../FileThongso";
import Box_Ql_ThemLopHoc from "./Box_Ql_ThemLopHoc";
import Alert from "./aletr";
import { useNavigate } from "react-router-dom";

export default function QL_LopHoc() {
  const [DataKhoaHoc, setDataKhoaHoc] = useState<any[]>([]);
  const [DataLopHoc, setDataLopHoc] = useState<any[]>([]);
  const [Tap, setTap] = useState(0);
  const [ThemLH, setThemLH] = useState(false);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const ChuyenTrang = useNavigate();

  const TatThongBao = () => {
    settb(false);
  };

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const layDataKhoaHoc = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/khoaHoc`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataKhoaHoc(req.dulieu);
      }
    } catch (err) {
      console.log("lay data khóa học thất bại: " + err);
    }
  };
  const layDataLopHoc = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/layDanhSachLopHoc`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataLopHoc(req.data);
      }
    } catch (err) {
      console.log("lay data lớp học thất bại : " + err);
    }
  };

  const tatThemLH = () => {
    setThemLH(false);
  };

  const themLH = async (
    TenLH: string,
    LichHoc: string,
    GioHoc: string,
    NgayKhaiGiang: string,
    idKhoaHoc: string,
    trangThai: string,
  ) => {
    try {
      console.log(idKhoaHoc);
      const data = {
        idKhoaHoc: idKhoaHoc,
        trangThai: trangThai,
        DateKhaiGiang: NgayKhaiGiang,
        LichHoc: LichHoc,
        TenLop: TenLH,
        GioHoc: GioHoc,
      };
      const api = await fetch(`${BACKEND_URL}/lophoc/them`, {
        method: "POST",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const req = await api.json();
      if (req.trangThai === "tb") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Thêm khóa học THẤT BẠI");
      } else if (req.trangThai === "kdtq") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      } else if (req.trangThai === "tc") {
        tatThemLH();
        settb(true);
        settypeTB("ss"); // w , err
        setNdTB("Thêm khóa học thành công");
        layDataLopHoc();
      }
    } catch (err) {
      console.log("thêm khóa học thất bại: " + err);
    }
  };

  useEffect(() => {
    layDataKhoaHoc();
    layDataLopHoc();
  }, []);

  return (
    <section className=" w-full mx-[10px] flex flex-col gap-2 relative">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      {/*  thanh điều hướng khóa học */}
      {ThemLH && (
        <Box_Ql_ThemLopHoc
          ThemLh={themLH}
          tat={tatThemLH}
          DataKhoaHoc={DataKhoaHoc}
        />
      )}

      <div className=" text-[#2A6770] font-medium text-[15px] flex gap-2  justify-start  ">
        <div
          onClick={() => {
            setThemLH(true);
          }}
          className="mt-[5px] shrink-0 cursor-pointer w-[35px] h-[35px] bg-[#114A53] rounded-[50%] flex justify-center items-center "
        >
          <img
            className="w-[60%]"
            src="https://img.icons8.com/?size=100&id=3220&format=png&color=f7f7f7"
            alt=""
          />
        </div>
        <div className="flex w-full  gap-2 items-center  overflow-hidden flex-wrap ">
          <div
            onClick={() => {
              setTap(0);
            }}
            className={`cursor-pointer border transition-all duration-300 border-black/20 px-[15px] py-[10px] rounded-[10px]  w-fit ${Tap === 0 && `bg-[#d7e8ec]`}`}
          >
            All
          </div>

          {DataKhoaHoc?.map((item) => (
            <div
              onClick={() => {
                setTap(item._id);
              }}
              key={item._id}
              className={`shrink-0 cursor-pointer px-[15px] py-[10px] rounded-[10px]  w-fit border transition-all duration-300 border-black/20 ${Tap === item._id && `bg-[#d7e8ec]`}`}
            >
              {item.TenKhoaHoc}
            </div>
          ))}
        </div>
      </div>
      {/* box các tap */}
      {Tap === 0 && (
        <div className="mt-[20px] flex flex-col gap-2">
          {DataLopHoc?.toReversed().map((item) => (
            <div className="transition-all duration-300 hover:bg-[#d7e8ec] w-full  border border-black/20 rounded-[10px] p-[5px] flex gap-2 items-center relative">
              <div className="w-[45px] h-[45px] rounded-[10px] bg-[#d7e8ec] flex justify-center items-center">
                <img
                  className="w-[60%]"
                  src="https://img.icons8.com/?size=100&id=l8zWwajs8mXC&format=png&color=114A53"
                  alt=""
                />
              </div>
              <p className="font-bold text-[20px] text-[#114a53]">
                {item.TenLop}
              </p>
              <div className="absolute right-[8px] flex gap-2">
                <div className="px-[15px] py-[10px] w-[155px] rounded-[10px] font-medium bg-[#d7e8ec]">
                  {item.trangThai}
                </div>
                <button
                  onClick={() => {
                    ChuyenTrang(`/Ql_ChiTietLopHoc/${item._id}`);
                  }}
                  className="px-[10px] py-[10px] bg-[#114a53] rounded-[10px] text-white font-bold"
                >
                  Chi tiết →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {Tap !== 0 && (
        <div className="mt-[20px] flex flex-col gap-[3px]  ">
          {DataLopHoc?.toReversed().map((item) => (
            <div>
              {item.idKhoaHoc === Tap && (
                <div className="transition-all duration-300 hover:bg-[#d7e8ec] w-full  border border-black/20 rounded-[10px] p-[5px] flex gap-2 items-center relative">
                  <div className="w-[45px] h-[45px] rounded-[10px] bg-[#d7e8ec] flex justify-center items-center">
                    <img
                      className="w-[60%]"
                      src="https://img.icons8.com/?size=100&id=l8zWwajs8mXC&format=png&color=114A53"
                      alt=""
                    />
                  </div>
                  <p className="font-bold text-[20px] text-[#114a53]">
                    {item.TenLop}
                  </p>
                  <div className="absolute right-[8px] flex gap-2">
                    <div className="px-[15px] py-[10px] w-[155px] rounded-[10px] font-medium bg-[#d7e8ec]">
                      {item.trangThai}
                    </div>
                    <button
                      onClick={() => {
                        ChuyenTrang(`/Ql_ChiTietLopHoc/${item._id}`);
                      }}
                      className="px-[10px] py-[10px] bg-[#114a53] rounded-[10px] text-white font-bold"
                    >
                      Chi tiết →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
