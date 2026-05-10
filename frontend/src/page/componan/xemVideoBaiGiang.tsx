import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./header";
import { BACKEND_URL } from "../FileThongso";

export default function XemVideoBaiGiang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState<any>(null);

  interface TypeTinNhan {
    nguoigui: string;
    mess: string;
  }

  // Lịch sử chat được lưu trong state, reset khi reload/out trang
  const [chat, setChat] = useState<TypeTinNhan[]>([
    {
      nguoigui: "AI",
      mess: "Xin chào bạn, mình là trợ lý ảo hỗ trợ bài giảng này. Bạn có câu hỏi nào về nội dung video không?",
    },
  ]);

  const inchat = useRef<HTMLInputElement>(null);
  const moneo = useRef<HTMLDivElement>(null);

  const [chotn, setChotn] = useState(false);
  const [Dau3Cham, setDau3Cham] = useState(1);

  // Fetch dữ liệu video
  const layDataVideo = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/lay-video-chitiet/${id}`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setVideoData(req.data);
      }
    } catch (err) {
      console.log("Lỗi lấy dữ liệu video: ", err);
    }
  };

  useEffect(() => {
    if (id) layDataVideo();
  }, [id]);

  // Tự động cuộn xuống khi có tin nhắn mới
  const cuonXuongMoNeo = () => {
    moneo.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    cuonXuongMoNeo();
  }, [chat]);

  // Animation dấu 3 chấm khi AI đang typing
  const animatio3Cham = () => {
    let intervalId = setInterval(() => {
      if (chotn) {
        setDau3Cham(2);
        setTimeout(() => setDau3Cham(3), 300);
        setTimeout(() => setDau3Cham(1), 600);
      } else {
        clearInterval(intervalId);
      }
    }, 1200);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  };

  const guiTn = async () => {
    if (inchat.current?.value && inchat.current.value.trim() !== "") {
      const noiDungGhi = inchat.current.value;
      inchat.current.value = "";
      setChotn(true);
      animatio3Cham();

      const newchatUser = {
        nguoigui: "toi",
        mess: noiDungGhi,
      };

      setChat((prev) => [...prev, newchatUser]);

      try {
        const data = {
          message: noiDungGhi,
          LichSuChat: chat,
          videoSummary: videoData?.tomtatND || "Không có tóm tắt",
        };

        const api = await fetch(`${BACKEND_URL}/api/chat-video-ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const req = await api.json();
        setChotn(false);

        if (req.trangThai === "tc") {
          const newchatAI = {
            nguoigui: "AI",
            mess: req.mess,
          };
          setChat((prev) => [...prev, newchatAI]);
        } else {
          setChat((prev) => [
            ...prev,
            { nguoigui: "AI", mess: "Lỗi kết nối tới AI. Vui lòng thử lại sau." },
          ]);
        }
      } catch (err) {
        console.log("Lỗi gửi tin nhắn AI: " + err);
        setChotn(false);
      }
    }
  };

  const guiTnKhiEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      guiTn();
    }
  };

  // Helper hàm để render Video
  const renderVideo = (link: string) => {
    if (!link) return null;
    
    // Xử lý link youtube
    if (link.includes("youtube.com") || link.includes("youtu.be")) {
      // get video ID
      let videoId = "";
      if (link.includes("v=")) {
        videoId = link.split("v=")[1].split("&")[0];
      } else if (link.includes("youtu.be/")) {
        videoId = link.split("youtu.be/")[1].split("?")[0];
      }
      return (
        <iframe
          className="w-full aspect-video rounded-[10px]"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }
    
    // Nếu là link thường (cloudinary hoặc mp4)
    return (
      <video controls className="w-full rounded-[10px] bg-black">
        <source src={link} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ thẻ video.
      </video>
    );
  };

  return (
    <>
      <Header type="khien" />
      <section className="mx-[50px] mb-[20px] flex flex-col xl:flex-row gap-5">
        
        {/* CỘT TRÁI: VIDEO VÀ TÓM TẮT */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="w-full flex flex-col gap-4 bg-white border border-black/20 rounded-[10px] p-[20px]">
            
            <h1 className="text-[22px] font-bold text-[#114a53]">
                {videoData?.tenvideobaigiang || "Đang tải bài giảng..."}
              </h1>
            {/* Vùng Video */}
            <div className="w-full rounded-[10px] overflow-hidden drop-shadow-md">
               {renderVideo(videoData?.linkvideo)}
            </div>

           
              
            
          </div>

          <div className="w-full bg-[#d7e8ec] border border-black/20 rounded-[10px] p-[20px]">
            <h2 className="text-[18px] font-bold text-[#114a53] mb-2 flex items-center gap-2">
              
              Tóm tắt nội dung:
            </h2>
            <div className="p-[15px] bg-[#f7fcfc] rounded-[10px] border border-black/10 text-[15px] whitespace-pre-wrap leading-relaxed">
              {videoData?.tomtatND || "Không có tóm tắt."}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: CHATBOT */}
        <div className="w-full xl:w-[400px] h-[calc(100vh-80px)] bg-white border border-black/20 rounded-[10px] overflow-hidden flex flex-col drop-shadow-sm shrink-0 sticky top-[60px]">
          {/* Header Chat */}
          <div className="w-full h-[60px] bg-[#114a53] flex items-center p-[15px] justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[35px] h-[35px] bg-white rounded-[50%] flex items-center justify-center p-1">
                <img className="w-full" src="/logoChatBot.png" alt="AI" />
              </div>
              <div>
                <p className="text-white font-bold leading-tight">Trợ lý EduMate</p>
                <p className="text-white/70 text-[12px] leading-tight">Trực tuyến</p>
              </div>
            </div>
          </div>

          {/* Main Chat */}
          <div className="flex-1 flex flex-col p-[15px] gap-3 overflow-y-auto bg-gradient-to-b from-[#f0f7f8] to-[#ffffff]">
            {chat.map((item, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 w-full ${item.nguoigui === "AI" ? "justify-start" : "justify-end"}`}
              >
                {item.nguoigui === "AI" && (
                  <div className="shrink-0 w-[30px] h-[30px] bg-white border border-[#114a53]/20 rounded-[50%] flex items-center justify-center p-[2px]">
                    <img className="w-full" src="/logoChatBot.png" alt="AI" />
                  </div>
                )}
                <div
                  className={`${
                    item.nguoigui === "AI"
                      ? "bg-[#114a53] text-white"
                      : "bg-[#d7e8ec] text-[#0d343b]"
                  } p-[10px] px-[15px] w-fit rounded-[15px] text-[14.5px] whitespace-pre-wrap break-words max-w-[85%] leading-relaxed`}
                >
                  {item.mess}
                </div>
              </div>
            ))}

            {chotn && (
              <div className="flex items-end gap-2 w-full justify-start">
                <div className="shrink-0 w-[30px] h-[30px] bg-white border border-[#114a53]/20 rounded-[50%] flex items-center justify-center p-[2px]">
                  <img className="w-full" src="/logoChatBot.png" alt="AI" />
                </div>
                <div className="bg-[#114a53] text-white px-[15px] py-[12px] w-fit rounded-[15px] flex items-center justify-center gap-1">
                  <span className={`${Dau3Cham === 1 ? "opacity-100" : "opacity-30"} transition-all duration-300 w-[5px] h-[5px] bg-white rounded-full`}></span>
                  <span className={`${Dau3Cham === 2 ? "opacity-100" : "opacity-30"} transition-all duration-300 w-[5px] h-[5px] bg-white rounded-full`}></span>
                  <span className={`${Dau3Cham === 3 ? "opacity-100" : "opacity-30"} transition-all duration-300 w-[5px] h-[5px] bg-white rounded-full`}></span>
                </div>
              </div>
            )}
            <div ref={moneo}></div>
          </div>

          {/* Input Chat */}
          <div className="p-[15px] bg-white border-t border-black/10 flex gap-2 items-center">
            <input
              onKeyDown={guiTnKhiEnter}
              ref={inchat}
              type="text"
              placeholder="Hỏi về nội dung video..."
              className="flex-1 py-[10px] px-[15px] text-[14px] bg-[#f0f4f5] border-transparent focus:border-[#114a53] focus:ring-0 rounded-[20px] outline-none transition-all duration-300"
            />
            <button
              onClick={guiTn}
              disabled={chotn}
              className="w-[40px] h-[40px] bg-[#114a53] rounded-[50%] flex justify-center items-center shrink-0 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              <img
                src="https://img.icons8.com/?size=100&id=86316&format=png&color=ffffff"
                className="w-[60%] ml-[-2px]"
                alt="Gửi"
              />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
