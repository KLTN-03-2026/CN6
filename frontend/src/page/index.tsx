import Header from "./componan/header";
import Teacher from "./componan/Teacher";
import TuVan from "./componan/tuvan";
import Test from "./componan/test";
import Footed from "./componan/footed";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import DangNhap from "./DanhNhap";
import { useEffect, useState } from "react";
import ChatBot from "./componan/ChatBot";
export default function Index() {
  const [DataKH, setDataKh] = useState<any[]>([]);
  const layDataKh = async () => {
    try {
      const api = await fetch("http://localhost:3000/khoaHoc");
      const req = await api.json();
      setDataKh(req.dulieu);
    } catch (err) {
      console.log("lay danh sach khoa hoc thât bai");
    }
  };

  useEffect(() => {
    layDataKh();
  }, []);

  return (
    <>
      <Header type="hien" />
      <ChatBot />
      {/* ///////////////////phần bìa//////////////// */}
      <section className="w-auto h-[700px] bg-blue-300 mx-3 rounded-[10px] overflow-hidden relative flex justify-center items-center">
        <img
          src="/biaTrangChu.png"
          alt="anh bia"
          className="w-full absolute  z-[0] top-0"
        />
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false }} // Chỉ chạy 1 lần khi cuộn tới
          className="text-5xl font-bold text-[#AFD0D9]"
        >
          <h1 className="relative z-10 text-center font-extrabold text-[65px] bg-gradient-to-br from-[#2A8794] to-[#0D2A2E] bg-clip-text text-transparent   drop-shadow-[0_0_15px_#FFFFFF]">
            Nâng tầm <span className="text-[#C23935]">TOEIC</span>
            <br />
            với<span className="text-[#C23935]"> giáo viên</span> +{" "}
            <span className="text-[#C23935]">AI</span> hỗ trợ
          </h1>
        </motion.h2>
        <button>KHÁM PHÁ NGAY</button>
      </section>

      {/* ///////////phần chế độ học///////////////////////// */}
      <section className=" my-[50px] mx-[10px]">
        <div className="flex flex-col items-center ">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {},
            }}
            className="flex gap-2 font-extrabold text-[40px]"
          >
            {["Học", "2", "Chế", "Độ", "Linh", "Hoạt"].map((word, i) => (
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
        </div>

        <p className="w-full text-center text-[20px]">
          Vừa học với giáo viên, vừa luyện tập với AI → tăng điểm nhanh hơn
        </p>
        <div className="w-full  my-[52px] flex items-center justify-center gap-14">
          {/* ////////////////////// */}
          <div className="w-[600px] h-[396px] bg-white rounded-[10px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
            <div className="m-[10px] w-auto h-[376px] rounded-[10px] bg-gradient-to-br from-[#7CEFFF] to-[#277C88]  flex overflow-hidden">
              <div className="h-auto w-[50%]  m-3 rounded-[10px]">
                <p className="text-[30px] font-extrabold text-[#0D2A2E]">
                  Học <span className="text-[#F34641]">Live</span> cùng <br />{" "}
                  giáo viên
                </p>
                <p className="mt-3 text-[17px]">
                  Tham gia lớp học trực tiếp qua Zoom, tương tác real-time với
                  giáo viên, luyện Speaking và phản xạ tiếng Anh ngay trong buổi
                  học, được giải đáp thắc mắc và sửa lỗi ngay lập tức, giúp bạn
                  hiểu bài nhanh và tiến bộ rõ rệt.
                </p>
              </div>
              <div className="h-auto w-[50%] bg-blue-400 m-3 overflow-hidden rounded-[10px]">
                <img
                  src="/trangchu-hocLive1.png"
                  className="w-full"
                  alt="anh"
                />
              </div>
            </div>
          </div>
          {/* sadfsadfasdfasdfsadf */}
          {/* ////////////////////// */}
          <div className="w-[600px] h-[396px] bg-white rounded-[10px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
            <div className="m-[10px] w-auto h-[376px] rounded-[10px] bg-gradient-to-br from-[#7CEFFF] to-[#277C88]  flex overflow-hidden">
              <div className="h-auto w-[50%] bg-blue-400 m-3 overflow-hidden rounded-[10px]">
                <img src="/trangChu-hocvai.png" className="w-full" alt="anh" />
              </div>

              <div className="h-auto w-[50%]  m-3 rounded-[10px]">
                <p className="text-[30px] font-extrabold text-white">
                  <span className="text-[#F34641]">Tự học </span> thông minh với{" "}
                  <span className="text-[#F34641]">AI</span>
                </p>
                <p className="mt-3 text-[17px] text-white">
                  Học mọi lúc mọi nơi với hệ thống AI thông minh giúp phân tích
                  điểm mạnh, điểm yếu, từ đó gợi ý lộ trình học phù hợp, cung
                  cấp bài luyện TOEIC đa dạng, chấm bài tự động và giải thích
                  chi tiết, giúp bạn cải thiện kỹ năng một cách hiệu quả và liên
                  tục.
                </p>
              </div>
            </div>
          </div>
          {/* sadfsadfasdfasdfsadf */}
        </div>
      </section>

      {/* 
      ///////////////////phần lộ trình////////////////// */}

      <section className="mx-[10px] mt-[100px] flex flex-col justify-center items-center">
        <div className="flex flex-row items-center ">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {},
            }}
            className=" flex gap-2 font-extrabold text-[40px]  whitespace-normal"
          >
            {["Tối", "ưu", "hóa", "lộ", "trình", "với"].map((word, i) => (
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
        </div>

        <div className="flex flex-row items-center ">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {},
            }}
            className=" flex gap-2 font-extrabold text-[40px]  whitespace-normal"
          >
            {["5", "bước", "đơn", "giản"].map((word, i) => (
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
        </div>

        <div className="w-[1380px] h-[1000px] py-[20px]  mt-[50px] relative flex justify-center">
          <div className="w-[5px] h-[960px] bg-black rounded-[5px] absolute"></div>
          <div className=" sticky top-[350px] z-50 w-[30px] h-[30px] bg-[#AFD0D9] rounded-[50%]  drop-shadow-[0_0_5px_rgba(44,130,133,15)] flex justify-center items-center">
            <div className="w-[23px] h-[23px] bg-[#C43F3B] rounded-[50%]"></div>
          </div>

          <div className="w-[30px] h-[30px] bg-black rounded-[50%] absolute  flex justify-center items-center top-[135px]">
            <div className="w-[23px] h-[23px] bg-white rounded-[50%]"></div>
          </div>

          <div className="w-[30px] h-[30px] bg-black rounded-[50%] absolute  flex justify-center items-center top-[323px]">
            <div className="w-[23px] h-[23px] bg-white rounded-[50%]"></div>
          </div>

          <div className="w-[30px] h-[30px] bg-black rounded-[50%] absolute  flex justify-center items-center top-[511.83px]">
            <div className="w-[23px] h-[23px] bg-white rounded-[50%]"></div>
          </div>

          <div className="w-[30px] h-[30px] bg-black rounded-[50%] absolute  flex justify-center items-center top-[700.16px]">
            <div className="w-[23px] h-[23px] bg-white rounded-[50%]"></div>
          </div>

          <div className="w-[30px] h-[30px] bg-black rounded-[50%] absolute  flex justify-center items-center top-[888.5px]">
            <div className="w-[23px] h-[23px] bg-white rounded-[50%]"></div>
          </div>

          {/* ///////////the//////////// */}

          <motion.div
            initial={{ opacity: 0, y: 50, x: -450 }}
            whileInView={{ opacity: 1, y: 0, x: -450 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            viewport={{ once: false }} // Chỉ chạy 1 lần khi cuộn tới
          >
            <div className="w-[397px] h-auto bg-white rounded-[10px] border  drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] absolute top-[67.16px] p-[10px]">
              <p className="text-black font-extrabold text-[23px]">
                Kiểm tra Đầu Vào
              </p>
              <p className="mt-[10px]">
                Bắt đầu với bài kiểm tra đầu vào giúp đánh giá chính xác năng
                lực hiện tại của bạn theo chuẩn TOEIC, từ đó xác định mức điểm
                và kỹ năng cần cải thiện
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, x: 30 }}
            whileInView={{ opacity: 1, y: 0, x: 30 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
            viewport={{ once: false }} // Chỉ chạy 1 lần khi cuộn tới
          >
            <div className="w-[397px] h-auto bg-[#C9D8DA] rounded-[10px] border  drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] absolute top-[255.49px]  p-[10px]">
              <p className="text-black font-extrabold text-[23px]">
                Phân Tích , Thiết Kế Lộ Trình
              </p>
              <p className="mt-[10px]">
                Hệ thống sẽ phân tích chi tiết điểm mạnh – điểm yếu của bạn ở
                từng kỹ năng (Listening, Reading, Vocabulary…), từ đó đề xuất lộ
                trình học cá nhân hóa phù hợp nhất.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, x: -450 }}
            whileInView={{ opacity: 1, y: 0, x: -450 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
            viewport={{ once: false }} // Chỉ chạy 1 lần khi cuộn tới
          >
            <div className="w-[397px] h-auto bg-[#93B0B4] rounded-[10px] border  drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] absolute top-[443.83px]  p-[10px]">
              <p className="text-black font-extrabold text-[23px]">
                Đăng Ký Lớp Học
              </p>
              <p className="mt-[10px]">
                Tham gia các lớp học trực tiếp với giáo viên qua Zoom, được
                hướng dẫn chi tiết, luyện kỹ năng Speaking, tương tác và giải
                đáp thắc mắc ngay trong quá trình học.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, x: 30 }}
            whileInView={{ opacity: 1, y: 0, x: 30 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 2 }}
            viewport={{ once: false }} // Chỉ chạy 1 lần khi cuộn tới
          >
            <div className="w-[397px] h-auto bg-[#5D898F] rounded-[10px] border  drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] absolute top-[632.16px]  p-[10px]">
              <p className="text-white font-extrabold text-[23px]">
                Luyện Đề + AI
              </p>
              <p className="mt-[10px] text-white">
                Thực hành với hệ thống đề thi TOEIC đa dạng, kết hợp AI chấm
                điểm và giải thích chi tiết, giúp bạn hiểu rõ lỗi sai và cải
                thiện nhanh chóng qua từng bài luyện.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50, x: -450 }}
            whileInView={{ opacity: 1, y: 0, x: -450 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 2.5 }}
            viewport={{ once: false }} // Chỉ chạy 1 lần khi cuộn tới
          >
            <div className="w-[397px] h-auto bg-[#276169] rounded-[10px] border  drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] absolute top-[820.5px]  p-[10px]">
              <p className="text-white font-extrabold text-[23px]">
                Thi Thử TOEIC
              </p>
              <p className="mt-[10px] text-white">
                bước vào kỳ thi TOEIC với nền tảng kiến thức vững chắc, kỹ năng
                được rèn luyện đầy đủ và chiến lược làm bài hiệu quả để đạt mục
                tiêu điểm số mong muốn.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Teacher />
      {/* ////// danh sách khóa học */}
      <section className="mx-[10px] text-white bg-gradient-to-t from-[#29646D] to-[#4FC2D3]  px-[20px] py-[30px] rounded-[10px] my-[100px]">
        <div className="flex  items-center text-center w-full justify-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {},
            }}
            className=" flex gap-2 font-extrabold text-[40px]  "
          >
            {[
              "Các",
              "Khóa",
              "Học",
              "Có",
              "Thể",
              "Phù",
              "Hợp",
              "Với",
              "Bạn",
            ].map((word, i) => (
              <motion.span
                key={i}
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 20 },
                }}
                // Đưa Gradient vào đây để từng từ đều có màu đẹp
                className="text-[40px] w-full text-center"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </div>

        <div className="mt-[20px] flex-wrap flex justify-center gap-[30px]  ">
          {/* //////////////////////////// */}

          {DataKH?.map((item, index) => (
            <div>
              {item.trangThai === "Đang Hoạt Động" && (
                <Link
                  key={item._id}
                  to={`/khoahoc/${item._id}`}
                  className="w-[490px] h-[80px] p-[10px] backdrop-blur-sm border bg-white/15 rounded-[10px] border-white/20 flex items-center justify-between transition-all hover:scale-[1.05] duration-500 hover:bg-white/30"
                >
                  <div className="flex flex-row items-center gap-[10px] overflow-hidden">
                    <div className="w-[50px] h-[50px] shrink-0 bg-white rounded-[50%] flex justify-center items-center overflow-hidden  text-center font-extrabold text-[25px] text-[#1A4857]">
                      {index + 1}
                    </div>
                    <p className="font-extrabold text-[25px] truncate overflow-hidden w-full ">
                      {item.TenKhoaHoc}
                    </p>
                  </div>
                  <p className="text-[30px]">→</p>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <TuVan />

      <Footed />
    </>
  );
}
