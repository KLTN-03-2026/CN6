interface BoxXacNhanNopBaiProps {
  nopBai: () => void;
  tat: () => void;
  noiDung: string;
}

export default function BoxXacNhanNopBai({ nopBai, tat, noiDung }: BoxXacNhanNopBaiProps) {
  return (
    <div className=" z-[100] w-screen h-screen bg-black/50 fixed top-0 left-0 flex justify-center items-center">
      <div className=" flex-col gap-3 w-[400px] h-fit bg-white rounded-[20px] p-[30px] justify-center items-center flex">
        <div className="w-[150px] h-[150px] rounded-[50%] bg-[#e7f5ff] flex justify-center items-center">
          <img
            className="w-[70%]"
            src="https://img.icons8.com/?size=100&id=12116&format=png&color=114A53"
            alt=""
          />
        </div>
        <p className="font-bold text-[20px] text-[#114A53] text-center">
          {noiDung}
        </p>
        <div className="flex w-full font-bold gap-3 mt-4">
          <button
            onClick={tat}
            className="w-full p-[10px] rounded-[10px] border border-black/50 transition-all duration-300 hover:scale-[1.05]"
          >
            Hủy
          </button>
          <button
            onClick={nopBai}
            className="w-full p-[10px] rounded-[10px] bg-[#114A53] text-white transition-all duration-300 hover:scale-[1.05]"
          >
            Nộp bài
          </button>
        </div>
      </div>
    </div>
  );
}
