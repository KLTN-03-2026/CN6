import React, { useState, useRef, useEffect } from "react";
import Header from "./header";

export default function ChatBot() {
  const [chuyenDong, setchuyenDong] = useState(0);
  const [ChatBot, setChatBot] = useState(false);
  const [drXoa, setdrXoa] = useState(false);
  const [Dau3Cham, setDau3Cham] = useState(1);
  const [chotn, setChotn] = useState(false);

  interface TypeTinNhan {
    nguoigui: string;
    mess: string;
  }

  const [chat, setChat] = useState<TypeTinNhan[]>(() => {
    const check = localStorage.getItem("E-learning-ChatBot");
    if (check) return JSON.parse(check);
    else {
      const newchat = {
        nguoigui: "AI",
        mess: "Xin chào bạn, mình sẵn sàng hỗ trợ bạn về các khóa học. Bạn cần thông tin gì?",
      };
      return [newchat];
    }
  });

  const moneo = useRef<HTMLDivElement>(null);

  const cuonXuongMoNeo = () => {
    moneo.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    cuonXuongMoNeo();
  }, [chat]);

  useEffect(() => {
    cuonXuongMoNeo();
  }, []);

  useEffect(() => {
    localStorage.setItem("E-learning-ChatBot", JSON.stringify(chat));
  }, [chat]);

  const inchat = useRef<HTMLInputElement>(null);

  const click = async () => {
    setchuyenDong(1);

    setTimeout(() => {
      setchuyenDong(0);
    }, 300);
  };

  const animatio3Cham = () => {
    let intervalId = setInterval(() => {
      if (chotn) {
        setDau3Cham(2);
        setTimeout(() => {
          setDau3Cham(3);
        }, 500);
        setTimeout(() => {
          setDau3Cham(1);
        }, 1000);
      } else {
        clearInterval(intervalId);
      }
    }, 2000);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  };

  const guiTn = async () => {
    if (inchat.current?.value || "" !== "") {
      setChotn(true);
      animatio3Cham();
      const newchat = {
        nguoigui: "toi",
        mess: inchat.current?.value || "",
      };

      setChat((prev) => [...prev, newchat]);

      try {
        const data = {
          message: inchat.current?.value || "",
          LichSuChat: chat,
        };
        inchat.current!.value = "";

        const api = await fetch("http://localhost:3000/api/tap-tn-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const req = await api.json();
        setChotn(false);

        if (req.trangThai === "tc") {
          const newchat = {
            nguoigui: "AI",
            mess: req.mess,
          };
          setChat((prev) => [...prev, newchat]);
        } else {
          const newchat = {
            nguoigui: "AI",
            mess: "Xin lỗi, hệ thống tư vấn đang quá tải. Bạn thử lại sau vài giây nhé!",
          };
          setChat((prev) => [...prev, newchat]);
        }
      } catch (err) {
        console.log("loi Fe chatbot ai: " + err);
      }
    }
  };

  const xoaLichSuChat = () => {
    localStorage.removeItem("E-learning-ChatBot");
    const newchat = {
      nguoigui: "AI",
      mess: "Xin chào bạn, mình sẵn sàng hỗ trợ bạn về các khóa học. Bạn cần thông tin gì?",
    };
    setChat([newchat]);
  };

  const guiTnKhiEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      guiTn();
    }
  };

  return (
    <>
      {drXoa && (
        <div
          onClick={() => {
            setdrXoa(false);
          }}
          className="w-screen h-screen  fixed z-[10]"
        ></div>
      )}

      {/* ///////phần icon ////// */}
      <div
        onClick={() => {
          click();
          setTimeout(() => {
            setChatBot(!ChatBot);
          }, 200);
        }}
        className={`z-[11] cursor-pointer fixed bottom-[30px] flex justify-center items-center right-[30px]  w-[65px] h-[65px] bg-gradient-to-t border-[3px] border-[#114a53] from-[#728889] to-[#ededed] rounded-[20px] drop-shadow-[0_5px_5px_rgb(0,0,0,0.3)]   transition-all duration-200 ${chuyenDong === 1 ? `scale-[0.9]` : `scale-1`} `}
      >
        <img className="w-[90%]" src="/logoChatBot.png" alt="" />
      </div>

      {/* ////////////////PHẦN BOX CHAT//////// */}
      {/* KHUNG */}
      {ChatBot && (
        <div className=" z-[11] overflow-hidden w-[350px] drop-shadow-[0_5px_5px_rgb(0,0,0,0.3)]  bg-gradient-to-t from-[#ededed] to-[#afd1d3] fixed bottom-[110px] right-[30px] rounded-[10px] ">
          {/* HEAD */}
          {drXoa && (
            <div
              onClick={() => {
                setdrXoa(false);
              }}
              className="w-full h-full absolute z-[11]"
            ></div>
          )}

          <div className="w-full h-[50px] bg-[#114a53] flex items-center p-[10px] justify-between">
            <div className="flex items-center gap-2">
              <div className="w-[35px] h-[35px] bg-white rounded-[50%] flex items-center justify-center">
                <img className="w-[100%]" src="/logoChatBot.png" alt="" />
              </div>
              <p className="text-white font-bold">EduMate</p>
            </div>

            <div className="flex items-center gap-2">
              <p
                onClick={() => {
                  setdrXoa(true);
                }}
                className=" cursor-pointer text-white flex justify-center items-center text-[20px]"
              >
                ...
              </p>
              {drXoa && (
                <div
                  onClick={() => {
                    xoaLichSuChat();
                    setdrXoa(false);
                  }}
                  className=" text-[14px] absolute py-[10px] transition-all duration-300 hover:bg-red-100 cursor-pointer px-[15px] bg-white border border-black/20 rounded-[10px] top-[40px] right-[25px] z-[12]"
                >
                  Xóa lịch sử chat
                </div>
              )}

              <img
                onClick={() => {
                  setChatBot(false);
                }}
                className="w-[20px] cursor-pointer"
                src="https://img.icons8.com/?size=100&id=79023&format=png&color=ffffff"
                alt=""
              />
            </div>
          </div>
          {/* MAIN */}
          <div className="  gap-3 flex flex-col p-[10px] overflow-x-hidden overflow-y-auto relative w-full  h-[350px] ">
            {/* ///chat //// */}

            {chat?.map((item, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 w-full ${item.nguoigui === "ai" ? `justify-start` : `justify-end`}`}
              >
                {item.nguoigui === "AI" && (
                  <div className="shrink-0 w-[30px] h-[30px] bg-white rounded-[50%] flex items-center justify-center">
                    <img className="w-[100%]" src="/logoChatBot.png" alt="" />
                  </div>
                )}

                <div
                  className={` ${item.nguoigui === "AI" ? `bg-[#114a53] text-white ` : `bg-white text-black `}  p-[10px]  w-fit rounded-[10px] whitespace-normal break-words max-w-full`}
                >
                  {item.mess}
                </div>
              </div>
            ))}
            {chotn && (
              <div className="flex gap-2 items-end">
                <div className="shrink-0 w-[30px] h-[30px] bg-white rounded-[50%] flex items-center justify-center">
                  <img className="w-[100%]" src="/logoChatBot.png" alt="" />
                </div>
                <div className="bg-[#114a53] text-white px-[10px] py-[15px]  w-fit rounded-[10px] whitespace-normal break-words max-w-full  gap-1  flex items-center justify-center">
                  <span
                    className={`${Dau3Cham === 1 ? `opacity-[1]` : `opacity-[0.25]`}  transition-all duration-300 flex items-center w-[5px] h-[5px] bg-white rounded-[50%]`}
                  ></span>
                  <span
                    className={`${Dau3Cham === 2 ? `opacity-[1]` : `opacity-[0.25]`}  transition-all duration-300 flex items-center w-[5px] h-[5px] bg-white rounded-[50%]`}
                  ></span>
                  <span
                    className={`${Dau3Cham === 3 ? `opacity-[1]` : `opacity-[0.25]`}  transition-all duration-300 flex items-center w-[5px] h-[5px] bg-white rounded-[50%]`}
                  ></span>
                </div>
              </div>
            )}

            <div ref={moneo}></div>

            {/* ///// */}
          </div>

          {/* INPUT */}

          <div className=" p-[10px]  gap-2 flex w-full overflow-hidden ">
            <input
              onKeyDown={guiTnKhiEnter}
              ref={inchat}
              type="text"
              placeholder="nhập câu hỏi của bạn"
              className="w-full py-[5px] px-[10px] text-[15px] border rounded-[10px] border-[#114a53]/50 bg-white/75 focus: outline-none"
            />
            <button
              onClick={() => {
                guiTn();
                setChotn(true);
              }}
              className="w-[30px] h-[30px] bg-[#114a53] rounded-[50%] shrink-0 flex justify-center items-center"
            >
              <img
                src="https://img.icons8.com/?size=100&id=86316&format=png&color=ffffff"
                className="w-[70%]"
                alt=""
              />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
