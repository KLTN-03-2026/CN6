export default function Test() {
  return (
    // 1. Thẻ Ông Nội: Chứa perspective và thêm class 'group' để bắt sự kiện hover
    <div className="w-[300px] h-[400px] bg-transparent cursor-pointer [perspective:1000px] group">
      {/* 2. Thẻ Cha (Trục xoay): Đặt thời gian xoay 700ms, tự xoay 180 độ khi hover */}
      <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* 3A. Mặt Trước (Front Face) */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col items-center justify-center text-[#0D2A2E]">
          <h2 className="text-4xl font-extrabold mb-4">MẶT TRƯỚC</h2>
          <p>Từ vựng tiếng Anh</p>
        </div>

        {/* 3B. Mặt Sau (Back Face): Bị xoay ngược sẵn 180 độ từ lúc mới sinh ra */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#0D2A2E] rounded-xl shadow-lg flex flex-col items-center justify-center text-white">
          <h2 className="text-4xl font-extrabold mb-4">MẶT SAU</h2>
          <p>Nghĩa của từ</p>
          <button className="mt-5 px-4 py-2 bg-[#C3E4EC] text-[#0D2A2E] font-bold rounded-lg">
            Đã thuộc!
          </button>
        </div>
      </div>
    </div>
  );
}
