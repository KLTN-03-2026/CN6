import { useState } from "react";

export default function ChatBot() {
  const [chuyenDong, setchuyenDong] = useState(0);
  const [ChatBot, setChatBot] = useState(false);

  const click = async () => {
    await setchuyenDong(1);
  };
  return (
    <>
      <div
        onClick={() => {
          setchuyenDong(1);
        }}
        className={`fixed bottom-[30px] right-[30px]  w-[70px] h-[70px] bg-[#97c6c7] rounded-[50%] drop-shadow-[0_5px_5px_rgb(0,0,0,0.2)] hover:scale-[1.05]  transition-all duration-300 ${chuyenDong === 1 ? `scale-[0.5]}` : `scale-0`} `}
      ></div>
    </>
  );
}
