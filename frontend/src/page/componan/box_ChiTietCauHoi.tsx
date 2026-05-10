import { useEffect, useState } from "react";

interface Box_ChiTietCauHoi_Props {
  items: any;
  index: number;
  xoa: (indexXoa: number) => void;
  xuong: (indexht: number) => void;
  len: (indexht: number) => void;
  sua: (indexht: number) => void;
}

export default function Box_ChiTietCauHoi({
  items,
  index,
  xoa,
  xuong,
  len,
  sua,
}: Box_ChiTietCauHoi_Props) {
  const [Text_type, setText_type] = useState("Trắc nghiệm");
  useEffect(() => {
    if (items?.type === 0) setText_type("Trắc nghiệm");
    else if (items?.type === 1) setText_type("Tự luận ngắn");
    else if (items?.type === 2) setText_type("Tự luận");
    else if (items?.type === 3) setText_type("Ghi âm");
  }, []);

  const [BoxXn, setBoxXn] = useState(false);

  return (
    <div className="w-full bg-white p-[20px] border border-black/20 rounded-[10px] flex flex-col gap-5">
      <div className="flex items-center justify-between relative">
        {/* //////////////////////////////////// box xác nhận xóa */}
        {BoxXn && (
          <div
            onClick={() => {
              setBoxXn(false);
            }}
            className="w-screen  h-screen fixed  top-0 left-0 z-[2]"
          ></div>
        )}

        {BoxXn && (
          <div className="absolute  top-[-100px] right-0 w-fit flex flex-col gap-2 z-[3]  p-[10px] border border-black/20 rounded-[10px] bg-white ">
            <div className="flex  gap-2  justify-between items-center">
              <div className="w-[25px] h-[25px] rounded-[50%] bg-red-100 flex justify-center items-center">
                <img
                  className="w-[60%]"
                  src="https://img.icons8.com/?size=100&id=99933&format=png&color=740c09"
                  alt="xóa"
                />
              </div>
              <p className="text-[13px]">Bạn có chắc muỗn xóa câu hỏi này</p>
            </div>
            <div className="w-full flex justify-end text-[13px] gap-3 ">
              <button
                onClick={() => {
                  setBoxXn(false);
                }}
                className="px-[10px] py-[5px] rounded-[5px] transition-all duration-300 hover:bg-[#d7e8ec]"
              >
                hủy
              </button>
              <button
                onClick={() => {
                  xoa(index);
                  setBoxXn(false);
                }}
                className="px-[10px] py-[5px] bg-red-800 text-white rounded-[5px] transition-all duration-300 hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        )}

        {/* ////////////////////////////// */}
        <div className="flex gap-2">
          <p className="font-medium">{index + 1}</p>
          <p className="text-black/50">{Text_type}</p>
        </div>
        <div className="flex gap-2">
          <button className="w-[25px] h-[25px] rounded-[5px] transition-all duration-300 hover:bg-[#d7e8ec] flex justify-center items-center">
            <img
              onClick={() => {
                len(index);
              }}
              className="w-[60%]"
              src="https://img.icons8.com/?size=100&id=39778&format=png&color=000000"
              alt="lên"
            />
          </button>
          <button className="w-[25px] h-[25px] rounded-[5px] transition-all duration-300 hover:bg-[#d7e8ec] flex justify-center items-center">
            <img
              onClick={() => {
                xuong(index);
              }}
              className="w-[60%]"
              src="https://img.icons8.com/?size=100&id=43830&format=png&color=000000"
              alt="xuống"
            />
          </button>
          <button
            onClick={() => {
              setBoxXn(true);
            }}
            className="w-[25px] h-[25px] rounded-[5px] transition-all duration-300 hover:bg-[#d7e8ec] flex justify-center items-center"
          >
            <img
              className="w-[60%]"
              src="https://img.icons8.com/?size=100&id=99933&format=png&color=000000"
              alt="xóa"
            />
          </button>
          <button
            onClick={() => {
              sua(index);
            }}
            className="w-[25px] h-[25px] rounded-[5px] transition-all duration-300 hover:bg-[#d7e8ec] flex justify-center items-center"
          >
            <img
              className="w-[60%]"
              src="https://img.icons8.com/?size=100&id=114093&format=png&color=000000"
              alt="sửa"
            />
          </button>
        </div>
      </div>
      {/* nội dung câu hỏi */}
      {items.anh !== "" && (
        <div className="w-full justify-center flex ">
          <div className="w-[300px] aspect-[4/3] overflow-hidden  rounded-[20px] flex justify-center items-center">
            <img
              className="w-full  object-contain"
              src={`${items.anh}`}
              alt=""
            />
          </div>
        </div>
      )}
      {items.fileNghe !== "" && (
        <div className="w-full justify-center flex ">
          <audio controls>
            <source src={`${items.fileNghe}`} type="audio/mpeg" />
          </audio>
        </div>
      )}

      <p className="font-medium">{items.CauHoi}</p>
      {items.type === 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex ">
            <div className="w-full flex gap-2 items-center">
              <div
                className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 ${items.dapAn === "a" && `bg-[#2f6169]`}`}
              />
              <p>{items.a}</p>
            </div>
            <div className="w-full flex gap-2 items-center">
              <div
                className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 ${items.dapAn === "b" && `bg-[#2f6169]`}`}
              />
              <p>{items.b}</p>
            </div>
          </div>
          <div className="flex ">
            <div className="w-full flex gap-2 items-center">
              <div
                className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 ${items.dapAn === "c" && `bg-[#2f6169]`}`}
              />
              <p>{items.c}</p>
            </div>
            <div className="w-full flex gap-2 items-center">
              <div
                className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 ${items.dapAn === "d" && `bg-[#2f6169]`}`}
              />
              <p>{items.d}</p>
            </div>
          </div>
        </div>
      )}
      <p>Giải thích</p>
      <div className="p-[10px] w-full rounded-[10px] bg-[#d7e8eca1]">
        {items.giaiThich === "" ? (
          <p>Chưa thêm giải thích</p>
        ) : (
          <p className="whitespace-pre-line">{items.giaiThich}</p>
        )}
      </div>
    </div>
  );
}
