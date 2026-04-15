import { useState } from "react";
import { motion } from "framer-motion";
export default function Teacher() {
  const [chon, setchon] = useState(3);
  return (
    <section className=" mx-[10px] my-[70px] flex flex-col items-center">
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
          {["Đội", "Ngũ", "Giáo", "Viên"].map((word, i) => (
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
          {["Chất ", "Lượng"].map((word, i) => (
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

      <div className="w-full  justify-center flex relative mt-[50px]">
        {/* /////////////thẻ ////////////////// */}

        <div
          onClick={() => {
            setchon(1);
          }}
          className={`w-[290px] p-[10px] flex justify-center items-center z-[3] flex-col cursor-pointer duration-1000 transition-all 
            ${chon === 2 && `absolute z-[2] translate-x-[-280px] scale-[0.8]  opacity-[0.8]`}
            ${chon === 3 && `absolute z-[-2] translate-x-[-550px] scale-[0.6]  opacity-[0.6]`}
            ${chon === 4 && `absolute z-[-2] translate-x-[550px] scale-[0.6]  opacity-[0.6]`}
            ${chon === 5 && `absolute z-[2] translate-x-[280px] scale-[0.8]  opacity-[0.8]`}
          `}
        >
          <img src="/gv5.png" alt="gv1" className="w-[100%]" />
          <p className="text-[#0D2A2E] text-[20px]">Minh Anh</p>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Listening
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Reading
              </p>
            </div>
          </div>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">200 </span> Speaking
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">195 </span> Writing
              </p>
            </div>
          </div>
        </div>

        {/* ////////////////het///////////// */}

        {/* /////////////thẻ ////////////////// */}

        <div
          onClick={() => {
            setchon(2);
          }}
          className={`w-[290px] p-[10px] flex justify-center items-center z-[3] flex-col cursor-pointer  transition-all duration-1000 
            ${chon === 1 && `absolute z-[2] translate-x-[280px] scale-[0.8] opacity-[0.8] `}
            ${chon === 3 && `absolute z-[2] translate-x-[-280px] scale-[0.8] opacity-[0.8] `}
            ${chon === 4 && `absolute z-[-2] translate-x-[-550px] scale-[0.6] opacity-[0.6] `}
            ${chon === 5 && `absolute z-[-2] translate-x-[550px] scale-[0.6] opacity-[0.6] `}
            
            `}
        >
          <img src="/gv4.png" alt="gv1" className="w-[100%]" />
          <p className="text-[#0D2A2E] text-[20px]">Thanh Trúc</p>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Listening
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Reading
              </p>
            </div>
          </div>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">200 </span> Speaking
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">195 </span> Writing
              </p>
            </div>
          </div>
        </div>

        {/* ////////////////het///////////// */}

        {/* /////////////thẻ ////////////////// */}

        <div
          onClick={() => {
            setchon(3);
          }}
          className={`w-[290px] p-[10px] flex justify-center items-center flex-col cursor-pointer transition-all z-[3] duration-1000 
            ${chon === 1 && `absolute  z-[-2] translate-x-[550px] scale-[0.6] opacity-[0.6]`}
            ${chon === 2 && `absolute z-[2] translate-x-[280px] scale-[0.8] opacity-[0.8] `}
            ${chon === 4 && `absolute z-[2] translate-x-[-280px] scale-[0.8] opacity-[0.8] `}
            ${chon === 5 && `absolute z-[-2] translate-x-[-550px] scale-[0.6] opacity-[0.6] `}
            
            `}
        >
          <img src="/gv1.png" alt="gv1" className="w-[100%]" />
          <p className="text-[#0D2A2E] text-[20px]">Daniel Carter</p>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Listening
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Reading
              </p>
            </div>
          </div>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">200 </span> Speaking
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">195 </span> Writing
              </p>
            </div>
          </div>
        </div>

        {/* /////////////thẻ ////////////////// */}

        <div
          onClick={() => {
            setchon(4);
          }}
          className={`w-[290px] p-[10px] flex justify-center items-center flex-col cursor-pointer transition-all z-[3] duration-1000 
            ${chon === 1 && `absolute z-[-2] translate-x-[-550px] scale-[0.6] opacity-[0.6] `}
            ${chon === 2 && `absolute z-[-2] translate-x-[550px] scale-[0.6] opacity-[0.6] `}
            ${chon === 3 && `absolute z-[2] translate-x-[280px] scale-[0.8] opacity-[0.8] `}
            ${chon === 5 && `absolute z-[2] translate-x-[-280px] scale-[0.8] opacity-[0.8] `}
            
            
            `}
        >
          <img src="/gv2.png" alt="gv1" className="w-[100%]" />
          <p className="text-[#0D2A2E] text-[20px]">Thảo Vy</p>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Listening
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Reading
              </p>
            </div>
          </div>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">200 </span> Speaking
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">195 </span> Writing
              </p>
            </div>
          </div>
        </div>

        {/* ////////////////het///////////// */}

        {/* /////////////thẻ ////////////////// */}

        <div
          onClick={() => {
            setchon(5);
          }}
          className={`w-[290px] p-[10px] flex justify-center items-center flex-col cursor-pointer transition-all z-[3] duration-1000 
            ${chon === 1 && `absolute z-[2] translate-x-[-280px] scale-[0.8] opacity-[0.8] `}
            ${chon === 2 && `absolute z-[-2] translate-x-[-550px] scale-[0.6] opacity-[0.6]  `}
            ${chon === 3 && `absolute z-[-2] translate-x-[550px] scale-[0.6] opacity-[0.6] `}
            ${chon === 4 && `absolute z-[2] translate-x-[280px] scale-[0.8] opacity-[0.8] `}
            
            
            
            `}
        >
          <img src="/gv3.png" alt="gv1" className="w-[100%]" />
          <p className="text-[#0D2A2E] text-[20px]">Ngọc Linh</p>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Listening
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">495 </span> Reading
              </p>
            </div>
          </div>

          <div className="w-full flex  justify-around mt-4">
            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">200 </span> Speaking
              </p>
            </div>

            <div className="w-[116px] h-[38px] bg-[#AFD0D9]/50 flex items-center justify-center rounded-[20px] text-[15px] text-[#0D2A2E]">
              <p>
                <span className="font-bold">195 </span> Writing
              </p>
            </div>
          </div>
        </div>

        {/* ////////////////het///////////// */}
      </div>
    </section>
  );
}
