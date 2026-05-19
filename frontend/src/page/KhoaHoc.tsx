import { param } from "framer-motion/client";
import Footed from "./componan/footed";
import Header from "./componan/header";
import TuVan from "./componan/tuvan";
import { motion } from "framer-motion";
import { data, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Alert from "./componan/aletr";
import ChatBot from "./componan/ChatBot";

export default function KhoaHoc() {
  const { id } = useParams();
  const [Data, setData] = useState<any>(null);
  const [TenKhoaHoc, setTenKhoaHoc] = useState([]);
  const [DsLopHoc, setDsLopHoc] = useState<any[]>([]);
  const [alLopHoc, setalLopHoc] = useState("1");
  const [MoTa, setMoTa] = useState("");

  const [QuyenLoi, setQuyenLoi] = useState("");

  const [KQ, setKQ] = useState("");

  const [PPH, setPPH] = useState("");

  const ChuyenTrang = useNavigate();
  const [soTien, setsoTien] = useState("");

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");
  const moneo = useRef<HTMLDivElement>(null);

  const cuonXuongMoNeo = () => {
    moneo.current?.scrollIntoView({ behavior: "smooth" });
  };

  const layData = async () => {
    try {
      const api = await fetch(`http://localhost:3000/ChiTietKhoaHoc/${id}`);
      const res = await api.json();
      console.log(res);
      if (res.trangThai === "tc") {
        setData(res.dulieu);
        setsoTien(res.dulieu.Gia.toLocaleString("vi-VN"));
        setTenKhoaHoc(res.dulieu.TenKhoaHoc.split(" "));
        setMoTa(res.dulieu.MoTa.replaceAll(".", ".\n\n"));
        setQuyenLoi(res.dulieu.QuyenLoi.replaceAll(".", ".\n\n"));
        setPPH(res.dulieu.PhuongPhap.replaceAll(".", ".\n"));
        setKQ(res.dulieu.KetQua.replaceAll(".", ".\n"));
      } else {
        console.log(res.mess);
      }
    } catch (err) {
      console.log("loi trong qua trinh lay data " + err);
    }
  };

  const layDslop = async () => {
    try {
      const api = await fetch(`http://localhost:3000/lophoc/lay/${id}`);
      const res = await api.json();
      if (res.trangThai === "tc") {
        setDsLopHoc(res.Data);
        setalLopHoc("1");
      } else if (res.trangThai === "ktt") {
        setalLopHoc("2");
      } else alert("loi server :" + res.mess);
    } catch (err) {
      console.log("gui api danh sach lop tb :" + err);
    }
  };

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const ktTrungKhoaHoc = async (id: String) => {
    try {
      const checkToken = localStorage.getItem("E-learningTK");
      let currentToken = Token;
      if (checkToken) {
        try {
          currentToken = JSON.parse(checkToken);
        } catch (e) {
          console.error(e);
        }
      }

      if (!currentToken) {
        settypeTB("err");
        setNdTB("Vui lòng đăng nhập để đăng ký học!");
        batThongBao();
        return;
      }

      const api = await fetch("http://localhost:3000/api/kt-trung-khoa-hoc", {
        method: "GET",
        headers: { Authorization: currentToken, "Content-Type": "application/json" },
      });
      const res = await api.json();
      console.log(res);
      if (res.trangThai) {
        ChuyenTrang(`/XNThanhToan/${id}`);
      } else if (!res.trangThai) {
        settypeTB("w");
        setNdTB(
          "ban hien đang hoc 1 khoa học khác nên không thể học khóa học này",
        );
        batThongBao();
      }
    } catch (err) {
      console.log("ktTrungKhoaHoc thất bại");
    }
  };

  const batThongBao = () => {
    settb(true);
  };
  const TatThongBao = () => {
    settb(false);
  };

  const ktSiSo = async (ma: string) => {
    try {
      const api = await fetch(`http://localhost:3000/api/ktSiSo/${ma}`);
      const res = await api.json();
      console.log(res.mess);
      if (res.mess < 30) {
        ktTrungKhoaHoc(ma);
      } else {
        settypeTB("w");
        setNdTB("lớp đã đầy");
        batThongBao();
      }
    } catch (err) {
      console.log("loi kt sỉ số: " + err);
    }
  };

  useEffect(() => {
    layData();
    layDslop();
  }, [id]);

  return (
    <>
      <Header type="hien" />
      <ChatBot />
      <section className="mx-[20px] bg-[#d8f8ff] h-[680px] rounded-[20px] p-[20px] flex justify-between ">
        <div className="p-[50px] flex flex-col gap-[20px] w-[880.61px] ">
          {TenKhoaHoc.length > 0 && (
            <motion.div
              key={TenKhoaHoc.join("-")}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {},
              }}
              className="flex gap-2 font-extrabold text-[40px]"
            >
              {TenKhoaHoc?.map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    visible: { opacity: 1, y: 0 },
                    hidden: { opacity: 0, y: 20 },
                  }}
                  // Đưa Gradient vào đây để từng từ đều có màu đẹp
                  className="bg-gradient-to-b from-[#287678] to-[#4ADADE] bg-clip-text text-transparent"
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
          )}

          <div className="text-[20px] text-[#2A6770] px-[15px] py-[10px] bg-[rgba(175,208,217,0.5)] w-fit rounded-[10px]">
            Đầu ra :{" "}
            <span className="font-bold text-[#0D2A2E]">{Data?.DauRa}</span>{" "}
          </div>
          <p className="text-[20px] font-normal text-[#0D2A2E] h-[230px] whitespace-pre-line">
            {MoTa}
          </p>
          <p className="text-[23px] font-bold text-[#13474B]">
            → Phù hợp với: {Data?.PhuHop}
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => {
                cuonXuongMoNeo();
              }}
              className="p-[20px] rounded-[20px] bg-[#0D2A2E] text-white font-bold transition-all duration-300 hover:scale-[1.05]"
            >
              DĂNG KÝ HỌC NGAY →
            </button>
            <p className="text-[40px] bg-gradient-to-t from-[#F34641] to-[#8D2926] bg-clip-text text-transparent font-extrabold">
              {soTien} VND
            </p>
          </div>
        </div>
        <div className=" h-full overflow-hidden rounded-[20px] w-fit">
          <img className="h-full w-fit " src={Data?.Image} alt="anh" />
        </div>
      </section>

      {/* ////////////////////QUYỀN LỢI ////////////////////////// */}

      <section className="flex m-[40px] gap-[200px] justify-center items-center">
        <div className="w-[400.69px]">
          <img src="/quyenloi.png" alt="anh" className="h-full" />
        </div>
        <div className="flex flex-col gap-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {},
            }}
            className="flex gap-2 font-extrabold text-[40px]"
          >
            {["Quyền", "Lợi"].map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 20 },
                }}
                // Đưa Gradient vào đây để từng từ đều có màu đẹp
                className="font-extrabold text-[40px] bg-gradient-to-t from-[#4ADADE] to-[#287678] bg-clip-text text-transparent"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>

          <p className="text-[23px] text-[#0D2A2E] leading-7 whitespace-pre-line">
            {QuyenLoi}
          </p>
        </div>
      </section>
      {/* //////////////////////////////////////////////////////////////////////////////// */}

      <section className="py-[50px] mx-[10px] flex gap-[80px] justify-center">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }} // Chỉ chạy 1 lần khi cuộn tới
        >
          <div className="w-[510px]  p-[10px] bg-white border border-black/15 drop-shadow-[0_5px_10px_rgb(0,0,0,0.25)] rounded-[20px]">
            <div className="w-full p-[10px] bg-[#D8F8FF] rounded-[20px]">
              <h2 className="w-full text-[40px] font-extrabold bg-gradient-to-t from-[#4ADADE] to-[#287678] bg-clip-text text-transparent text-center">
                Phương pháp học:
              </h2>
              <p className="leading-[40px] mt-[20px] text-[20px] mx-[10px] whitespace-pre-line">
                {PPH}
              </p>
            </div>
          </div>
        </motion.h2>

        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }} // Chỉ chạy 1 lần khi cuộn tới
        >
          <div className="w-[510px]  p-[10px] bg-white border border-black/15 drop-shadow-[0_5px_10px_rgb(0,0,0,0.25)] rounded-[20px]">
            <div className="w-full p-[10px] bg-[#D8F8FF] rounded-[20px]">
              <h2 className="w-full text-[40px] font-extrabold bg-gradient-to-t from-[#4ADADE] to-[#287678] bg-clip-text text-transparent text-center">
                Kết quả đạt được::
              </h2>
              <p className="leading-[40px] mt-[20px] text-[20px] mx-[10px] whitespace-pre-line">
                {KQ}
              </p>
            </div>
          </div>
        </motion.h2>
      </section>

      {/* ///////////////////////////////////////////////////////////////////// */}

      <section ref={moneo} className="py-[50px] mx-[20px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {},
          }}
          className="flex gap-2 font-extrabold text-[40px] w-full justify-center "
        >
          {["Các", "Lớp", "Sắp", "Diễn", "Ra"].map((word, i) => (
            <motion.span
              key={i}
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 20 },
              }}
              // Đưa Gradient vào đây để từng từ đều có màu đẹp
              className="bg-gradient-to-b from-[#287678] to-[#4ADADE] bg-clip-text text-transparent"
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
        {/* //////////////////////// */}
        <motion.h2
          key={alLopHoc}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }} // Chỉ chạy 1 lần khi cuộn tới
        >
          {/* ////////////////////// */}
          {alLopHoc === "2" ? (
            <p className="w-full text-center my-[50px]">
              hiện khóa học này không có lơp học nào sắp diễn ra :((
            </p>
          ) : (
            <div className="my-[40px] flex flex-col gap-4">
              {DsLopHoc.map((item) => (
                <div
                  key={item._id}
                  className=" w-full flex flex-col justify-between items-center gap-5"
                >
                  <div className=" relative w-[790px]  p-[10px] border border-black/20 rounded-[10px] drop-shadow-[0_0_5px_rgb(0,0,0,0.15)] bg-white flex gap-5 items-center">
                    <div className="p-[5px] w-[60px] h-[60px] text-[20px] font-extrabold bg-[#C3E4EC]  flex justify-center items-center rounded-[5px]">
                      {item.TenLop}
                    </div>
                    <div>
                      <p>Khai giảng : {item.DateKhaiGiang}</p>
                      <p>
                        {item.LichHoc} - ({item.GioHoc}) - sĩ số lớp:{" "}
                        {item.SoLuong}/30
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        const checkToken = localStorage.getItem("E-learningTK");
                        if (!checkToken) {
                          settypeTB("err");
                          setNdTB("Vui lòng đăng nhập để đăng ký học!");
                          batThongBao();
                          return;
                        }
                        try {
                          const parsedToken = JSON.parse(checkToken);
                          if (!parsedToken) {
                            settypeTB("err");
                            setNdTB("Vui lòng đăng nhập để đăng ký học!");
                            batThongBao();
                            return;
                          }
                        } catch (e) {
                          settypeTB("err");
                          setNdTB("Vui lòng đăng nhập để đăng ký học!");
                          batThongBao();
                          return;
                        }

                        ktSiSo(item._id);
                        layDslop();
                      }}
                      className="px-[20px] py-[10px] bg-[#0D2A2E] text-white font-extrabold rounded-[10px] absolute right-[15px] duration-200 transition-all hover:scale-[1.05]"
                    >
                      ĐĂNG KÝ HỌC →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* ////////////////////////////////// */}
        </motion.h2>
      </section>

      {/* ////////////////////////////////////// */}

      <TuVan />

      <Footed />
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
    </>
  );
}
