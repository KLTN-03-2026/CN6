interface BoxXacNhanProps {
  xoa: () => void;
  tat: () => void;
  noiDung: string;
}

export default function BoxXacNhan({ xoa, tat, noiDung }: BoxXacNhanProps) {
  return (
    <div className=" z-[3] w-screen h-screen bg-black/50 fixed top-0 left-0 flex justify-center items-center">
      <div className=" flex-col gap-3 w-[400px] h-fit bg-white rounded-[20px] p-[30px] justify-center items-center flex">
        <div className="w-[150px] h-[150px] rounded-[50%] bg-[#fff3e7] flex justify-center items-center">
          <img
            className="w-[70%]"
            src="https://img.icons8.com/?size=100&id=12116&format=png&color=000000"
            alt=""
          />
        </div>
        <p className="font-bold text-[25px] text-[#d83f3a] text-center">
          {noiDung}
        </p>
        <div className="flex w-full font-bold gap-3">
          <button
            onClick={() => {
              tat();
            }}
            className="w-full p-[10px] rounded-[10px] border border-black/50 transition-all duration-300 hover:scale-[1.05]"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              xoa();
            }}
            className="w-full p-[10px] rounded-[10px] bg-red-700 text-white transition-all duration-300 hover:scale-[1.05]"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
