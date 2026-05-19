export default function Footed() {
  return (
    <footer className="mx-[10px] flex-wrap flex gap-[50px] mt-[100px]  border-t-[1px] border-t-[#0D2A2E] py-[50px] w-full justify-center">
      {/* //////////////////////////////////////////d */}
      <div className="gap-3 flex flex-col w-[420px]">
        <h2 className="text-[23px] text-[#2F8C8F] font-extrabold">
          TRUNG TÂM ANH NGỮ E-LEARNING
        </h2>
        <p className="text-[18px]">
          <span className="font-bold">cơ sở 1:</span> số 10 - dũng sĩ thanh khê/
          đà nẵng
        </p>
        <p className="text-[18px]">
          <span className="font-bold">cơ sở 2:</span> Số 5, ngõ 128 phố Vọng,
          Hai Bà Trưng, Hà Nội 
        </p>
        <p className="text-[18px]">
          <span className="font-bold">cơ sở 3:</span> Ngõ 1/23 P. Văn Hội, Đông
          Ngạc, Bắc Từ Liêm, Hà Nội
        </p>
      </div>
      {/* //////////////////////////////////////////d */}
      <div className="gap-3 flex flex-col w-[420px]">
        <h2 className="text-[23px] text-[#2F8C8F] font-extrabold">
          CÔNG TY CỔ PHẦN CÔNG NGHỆ <br /> E- LEARNING
        </h2>
        <p className="text-[18px]">
          <span className="font-bold">Hotline:</span> 0123456789
        </p>
        <p className="text-[18px]">
          <span className="font-bold">giãi quyết lỗi, test online : </span>{" "}
          0987654321
        </p>
        <p className="text-[18px]">
          <span className="font-bold">email: </span> elearning@gmail.com
        </p>
        <p className="text-[18px]">
          <span className="font-bold">thời gian làm việc: </span> 8h-21h (t2-t7)
        </p>
      </div>
      {/* //////////////////////////////////////////d */}

      <div className="gap-3 flex flex-col w-[420px]">
        <h2 className="text-[23px] text-[#2F8C8F] font-extrabold">FANPAGE</h2>
        <a
          className="w-full bg-[#2D5B88] p-[10px] text-white  rounded-[15px] flex justify-between"
          href="https://www.facebook.com/"
        >
          <p>E-learning</p>
          <p>→</p>
        </a>
      </div>
    </footer>
  );
}
