import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../FileThongso";
import Alert from "./aletr";

export default function QL_BaiTap() {
  const [Tap, setTap] = useState(`Đã Tạo`);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const TatThongBao = () => {
    settb(false);
  };

  const [DataBaiTap, setDataBaiTap] = useState<any[]>([]);
  const { id } = useParams();
  const [BoxThem, setBoxThem] = useState(false);

  const [chon_Text_HanNop, setchon_Text_HanNop] = useState("3 ngày");
  const [DrHanNop, setDrHanNop] = useState(false);

  const Input_TenBt = useRef<HTMLInputElement>(null);
  const [Al_TenBT, setAL_TenBT] = useState(false);

  const ChuyenTrang = useNavigate();

  const layData = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/layBaiTap/${id}`);
      const req = await api.json();
      if (req.trangThai === "tb") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Lấy danh sách THẤT BẠI");
      } else if (req.trangThai === "tc") {
        setDataBaiTap(req.data);
      }
    } catch (err) {
      console.log("lay data bài tập thất bại :" + err);
    }
  };

  const TaoBt = async () => {
    const tenBT = Input_TenBt.current?.value.trim() || "";
    if (tenBT === "") {
      setAL_TenBT(true);
    } else {
      setAL_TenBT(false);

      const data = {
        TenBT: tenBT,
        hanNop: chon_Text_HanNop,
      };
      try {
        const api = await fetch(`${BACKEND_URL}/api/themBT/${id}`, {
          method: "POST",
          headers: { Authorization: Token, "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const req = await api.json();
        if (req.trangThai === "tb") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Thêm bài tập THẤT BẠI");
        } else if (req.trangThai === "kdtq") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
        } else if (req.trangThai === "hh") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
        } else if (req.trangThai === "tc") {
          ChuyenTrang(`/Ql_ChiTietBaiTap/${req.data._id}`);
        }
      } catch (err) {
        console.log("loi khi them bai tap : " + err);
      }
    }
  };

  useEffect(() => {
    layData();
  }, []);

  return (
    <section className="w-full relative">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      <div className="w-full flex justify-start items-center gap-2">
        {/* nút thêm  */}
        <div
          onClick={() => {
            setBoxThem(true);
          }}
          className="cursor-pointer w-[35px] h-[35px] bg-[#114A53] rounded-[50%] flex justify-center items-center"
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
              setTap(`Đã Tạo`);
            }}
            className={`cursor-pointer border transition-all duration-300 border-black/20 px-[15px] py-[10px] rounded-[10px]  w-fit ${Tap === `Đã Tạo` && `bg-[#d7e8ec]`}`}
          >
            Đã Tạo
          </div>
          <div
            onClick={() => {
              setTap("Bản Nháp");
            }}
            className={`cursor-pointer border transition-all duration-300 border-black/20 px-[15px] py-[10px] rounded-[10px]  w-fit ${Tap === `Bản Nháp` && `bg-[#d7e8ec]`}`}
          >
            Bản Nháp
          </div>
        </div>
      </div>
      {/* đường kẻ */}
      <div className="w-full border-b border-b-black/20 my-[20px]"></div>
      <p className="w-full text-center text-[25px] font-bold text-[#114a53]">
        Danh sách bài tập{" "}
      </p>
      <div className="w-full border border-black/20 p-[20px] rounded-[10px] my-[20px]">
        {/* phần head của bảng */}
        <div className="font-medium flex justify-between">
          <p>Thông tin bài tập</p>
          <p className="w-[300px]">Thời gian tạo</p>
        </div>
        {/* đường kẻ */}
        <div className="w-full border-b border-b-black/20 my-[10px]"></div>
        {/* ô  chứa danh sách */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-350px)]">
          {/* Box Bài tập */}
          {DataBaiTap?.toReversed()
            .filter((items) => items.trangThai === Tap)
            .map((items) => (
              <div
                key={items._id}
                className="p-[10px] w-full flex gap-2 transition-all duration-300 hover:bg-[#d7e8ec] rounded-[10px]"
              >
                <div className="shrink-0 w-[50px] h-[50px] rounded-[10px] bg-[#d7e8ec] flex justify-center items-center">
                  <img
                    className="w-[70%]"
                    src="https://img.icons8.com/?size=100&id=rYkEZD1xSmKa&format=png&color=114a53"
                    alt=""
                  />
                </div>
                <div className="w-full flex flex-col">
                  <p className="text-[18px] font-bold text-[#114a53]">
                    {items.TenBT}
                  </p>
                  <p className="text-[15px] font-light">
                    {items.EmailNGuoiTao}
                  </p>
                </div>
                <div className="w-[280px] flex gap-2 shrink-0 justify-between items-center">
                  <p className="">{items.ngayTao.split("T")[0]}</p>
                  <button
                    onClick={() => {
                      ChuyenTrang(`/Ql_ChiTietBaiTap/${items._id}`);
                    }}
                    className="px-[20px] py-[10px] rounded-[10px] bg-[#114a53] font-bold text-white"
                  >
                    Chi tiết →{" "}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* thêm bài tập */}
      {BoxThem && (
        <div className="w-screen h-screen bg-black/50 top-0 left-0 z-[2] fixed flex justify-center items-center">
          <div className="w-[500px] p-[20px] rounded-[10px] bg-white flex flex-col gap-2 justify-center items-center">
            <h2 className="w-full text-center text-[20px] font-bold text-[#0d2a2e]">
              Thêm Bài Tập
            </h2>
            <div className="w-full">
              <p>Tên bài tập</p>
              <input
                ref={Input_TenBt}
                type="text"
                className={`focus:outline-none p-[10px] border  rounded-[10px] w-full mt-[5px] ${Al_TenBT ? `border-red-500 bg-red-50` : `border-black/20`}`}
              />
            </div>
            <div
              onClick={() => {
                setDrHanNop(true);
              }}
              className="w-full"
            >
              <p>Hạn Nộp</p>
              <div className="p-[10px] mt-[5px] border border-black/20 rounded-[10px] w-full relative">
                <p>{chon_Text_HanNop}</p>
                {DrHanNop && (
                  <div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrHanNop(false);
                      }}
                      className="w-screen h-screen fixed top-0 left-0"
                    ></div>
                    <div className="w-full py-[10px] border border-black/20 absolute top-[45px] rounded-[10px] left-0 bg-white">
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrHanNop(false);
                          setchon_Text_HanNop("3 ngày");
                        }}
                        className="w-full px-[15px] py-[10px] transition-all duration-300 hover:bg-[#d7e8ec] "
                      >
                        3 ngày
                      </p>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrHanNop(false);
                          setchon_Text_HanNop("5 ngày");
                        }}
                        className="w-full px-[15px] py-[10px] transition-all duration-300 hover:bg-[#d7e8ec] "
                      >
                        5 ngày
                      </p>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrHanNop(false);
                          setchon_Text_HanNop("7 ngày");
                        }}
                        className="w-full px-[15px] py-[10px] transition-all duration-300 hover:bg-[#d7e8ec] "
                      >
                        7 ngày
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full flex gap-2 font-bold mt-[5px]">
              <button
                onClick={() => {
                  setBoxThem(false);
                }}
                className="w-full border border-black rounded-[10px] py-[10px]"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  TaoBt();
                }}
                className="w-full bg-[#0d2a2e] rounded-[10px] text-white"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
