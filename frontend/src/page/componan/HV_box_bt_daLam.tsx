import { useEffect, useState } from "react";
import { BACKEND_URL } from "../FileThongso";

interface HV_box_bt_DaLamProps {
  data: any;
  Chon: number;
  ClickChon: (i: number) => void;
}

export default function HV_box_bt_DaLam({
  data,
  Chon,
  ClickChon,
}: HV_box_bt_DaLamProps) {
  return (
    <section
      className={`overflow-y-scroll  overflow-hidden flex justify-center  w-full bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F] h-[calc(100vh-85px)] rounded-[20px] ${data?.type === 2 ? `items-start p-[50px]` : `items-center`}`}
    >
      {data?.type === 0 && (
        <div className="m-[10px] w-[700px] flex-col items-center gap-[10px] h-fit p-[30px] rounded-[20px] bg-white flex justify-center">
          {/* // hình ảnh */}
          {data?.anh !== "" && (
            <div className="w-[400px] h-[300px] overflow-hidden  rounded-[10px] flex justify-center items-center">
              <img
                className="w-full  object-contain"
                src={`${BACKEND_URL}/taiNguyen/${data?.anh}`}
                alt=""
              />
            </div>
          )}

          {/* file âm thanh */}
          {data?.fileNghe !== "" && (
            <audio controls>
              <source
                src={`${BACKEND_URL}/taiNguyen/${data?.fileNghe}`}
                type="audio/mpeg"
              />
            </audio>
          )}

          {/* /// phần câu hỏi */}
          <div className="text-[15px] w-full flex flex-col gap-2 px-[10px] ">
            <p className="">
              câu {Chon + 1} : {data?.CauHoi}
            </p>
            <div className="flex gap-2 items-center mt-[10px]  cursor-pointer w-fit">
              <div className="w-[20px] h-[20px] border border-black/50 rounded-[50%] flex justify-center items-center ">
                {data?.dapAnHocVien === "a" && (
                  <div className="w-[15px] h-[15px] rounded-[50%] bg-[#2a6770]"></div>
                )}
              </div>
              <p
                className={`${data?.dapAnHocVien === "a" && `${data?.dapAn === "a" ? `text-green-600 font-medium` : `text-red-600 font-medium`}`} ${data?.dapAn === "a" && `text-green-600 font-medium`} `}
              >
                {data?.a}
              </p>
            </div>

            <div className="flex gap-2 items-center mt-[10px]  cursor-pointer w-fit">
              <div className="w-[20px] h-[20px] border border-black/50 rounded-[50%] flex justify-center items-center ">
                {data?.dapAnHocVien === "b" && (
                  <div className="w-[15px] h-[15px] rounded-[50%] bg-[#2a6770]"></div>
                )}
              </div>
              <p
                className={`${data?.dapAnHocVien === "b" && `${data?.dapAn === "b" ? `text-green-600 font-medium` : `text-red-600 font-medium`}`} ${data?.dapAn === "b" && `text-green-600 font-medium`} `}
              >
                {data?.b}
              </p>
            </div>

            <div className="flex gap-2 items-center mt-[10px]  cursor-pointer w-fit">
              <div className="w-[20px] h-[20px] border border-black/50 rounded-[50%] flex justify-center items-center ">
                {data?.dapAnHocVien === "c" && (
                  <div className="w-[15px] h-[15px] rounded-[50%] bg-[#2a6770]"></div>
                )}
              </div>
              <p
                className={`${data?.dapAnHocVien === "c" && `${data?.dapAn === "c" ? `text-green-600 font-medium` : `text-red-600 font-medium`}`} ${data?.dapAn === "c" && `text-green-600 font-medium`} `}
              >
                {data?.c}
              </p>
            </div>

            <div className="flex gap-2 items-center mt-[10px]  cursor-pointer w-fit">
              <div className="w-[20px] h-[20px] border border-black/50 rounded-[50%] flex justify-center items-center ">
                {data?.dapAnHocVien === "d" && (
                  <div className="w-[15px] h-[15px] rounded-[50%] bg-[#2a6770]"></div>
                )}
              </div>
              <p
                className={`${data?.dapAnHocVien === "d" && `${data?.dapAn === "d" ? `text-green-600 font-medium` : `text-red-600 font-medium`}`} ${data?.dapAn === "d" && `text-green-600 font-medium`} `}
              >
                {data?.d}
              </p>
            </div>
          </div>
          <div className="p-[20px] border border-black/50  rounded-[10px] w-full mt-[10px]">
            <p className="font-medium">Giải thích</p>
            <p className="text-[15px]">
              {data?.giaiThich ||
                "Giáo viên chưa thêm giải thích cho câu hỏi này"}
            </p>
          </div>
          <div className="w-full mt-[10px] flex justify-end">
            <button
              onClick={() => {
                ClickChon(Chon + 1);
              }}
              className="text-[15px] p-[10px] bg-[#2A6770] text-white rounded-[15px] font-medium"
            >
              Tiếp Theo
            </button>
          </div>
        </div>
      )}
      {data?.type === 1 && (
        <div className="w-[700px] flex-col items-center gap-[10px] h-fit p-[30px] rounded-[20px] bg-white flex justify-center">
          {data?.anh !== "" && (
            <div className="w-[400px] h-[300px] overflow-hidden  rounded-[10px] flex justify-center items-center">
              <img
                className="w-full  object-contain"
                src={`${BACKEND_URL}/taiNguyen/${data?.anh}`}
                alt=""
              />
            </div>
          )}
          {/* file âm thanh */}
          {data?.fileNghe !== "" && (
            <audio controls>
              <source
                src={`${BACKEND_URL}/taiNguyen/${data?.fileNghe}`}
                type="audio/mpeg"
              />
            </audio>
          )}
          <p className="w-full text-start text-[15px]">
            câu {Chon + 1} : {data?.CauHoi}
          </p>
          <textarea
            key={data?._id}
            defaultValue={`${data?.dapAnHocVien}`}
            className="p-[10px] h-[100px] bg-[#d7e8ec] w-full rounded-[10px] focus:outline-none"
          />
          <div className="p-[20px] border border-black/50  rounded-[10px] w-full mt-[10px]">
            <p className="font-medium">Giải thích</p>
            <p className="text-[15px]">
              {data?.giaiThich ||
                "Giáo viên chưa thêm giải thích cho câu hỏi này"}
            </p>
            <p className="font-medium">Nhận xét của Cú</p>
            <p className="text-[15px]">
              {data?.loipheAI ||
                "Cú đang sốt nên chưa nhận xét được câu hỏi này :(("}
            </p>
          </div>
          <div className="w-full mt-[10px] flex justify-end">
            <button
              onClick={() => {
                ClickChon(Chon + 1);
              }}
              className="text-[15px] p-[10px] bg-[#2A6770] text-white rounded-[15px] font-medium"
            >
              Tiếp Theo
            </button>
          </div>
        </div>
      )}
      {data?.type === 2 && (
        <div className="m-[10px] w-[700px]  flex-col items-center gap-[10px] h-fit p-[30px] rounded-[20px] bg-white flex justify-center">
          {data?.anh !== "" && (
            <div className="w-[400px] h-[300px] overflow-hidden  rounded-[10px] flex justify-center items-center">
              <img
                className="w-full  object-contain"
                src={`${BACKEND_URL}/taiNguyen/${data?.anh}`}
                alt=""
              />
            </div>
          )}
          {/* file âm thanh */}
          {data?.fileNghe !== "" && (
            <audio controls>
              <source
                src={`${BACKEND_URL}/taiNguyen/${data?.fileNghe}`}
                type="audio/mpeg"
              />
            </audio>
          )}
          <p className="w-full text-start text-[15px]">
            {" "}
            câu {Chon + 1} : {data?.CauHoi}
          </p>
          <textarea
            key={data?._id}
            defaultValue={`${data?.dapAnHocVien}`}
            className="p-[10px] h-[300px] bg-[#d7e8ec] w-full rounded-[10px] focus:outline-none"
          />
          <div className="p-[20px] border border-black/50  rounded-[10px] w-full mt-[10px]">
            <p className="font-medium">Giải thích</p>
            <p className="text-[15px]">
              {data?.giaiThich ||
                "Giáo viên chưa thêm giải thích cho câu hỏi này"}
            </p>
            <p className="font-medium">Nhận xét của Cú</p>
            <p className="text-[15px]">
              {data?.loipheAI ||
                "Cú đang sốt nên chưa nhận xét được câu hỏi này :(("}
            </p>
          </div>
          <div className="w-full mt-[10px] flex justify-end">
            <button
              onClick={() => {
                ClickChon(Chon + 1);
              }}
              className="text-[15px] p-[10px] bg-[#2A6770] text-white rounded-[15px] font-medium"
            >
              Tiếp Theo
            </button>
          </div>
        </div>
      )}
      {data?.type === 3 && (
        <div className="m-[10px] w-[700px]  flex-col items-center gap-[10px] h-fit p-[30px] rounded-[20px] bg-white flex justify-center">
          {data?.anh !== "" && (
            <div className="w-[400px] h-[300px] overflow-hidden  rounded-[10px] flex justify-center items-center">
              <img
                className="w-full  object-contain"
                src={`${BACKEND_URL}/taiNguyen/${data?.anh}`}
                alt=""
              />
            </div>
          )}
          {/* file âm thanh */}
          {data?.fileNghe !== "" && (
            <audio controls>
              <source
                src={`${BACKEND_URL}/taiNguyen/${data?.fileNghe}`}
                type="audio/mpeg"
              />
            </audio>
          )}
          <p className="w-full text-start text-[15px]">
            câu {Chon + 1} : {data?.CauHoi}
          </p>
          {/* ////////////////////////// */}

          <div className="border border-black/30 p-[10px] rounded-[20px] text-[13px] flex flex-col justify-center items-center gap-2">
            {data?.dapAnHocVien && (
              <div className="w-full flex flex-col gap-2">
                <audio key={data._id} controls>
                  <source
                    src={`${BACKEND_URL}/${data?.dapAnHocVien}`}
                    type="audio/mpeg"
                  />
                </audio>
              </div>
            )}
          </div>
          <div className="p-[20px] border border-black/50  rounded-[10px] w-full mt-[10px]">
            <p className="font-medium">Giải thích</p>
            <p className="text-[15px]">
              {data?.giaiThich ||
                "Giáo viên chưa thêm giải thích cho câu hỏi này"}
            </p>
            <p className="font-medium">Nhận xét của Cú</p>
            <p className="text-[15px]">
              {data?.loipheAI ||
                "Cú đang sốt nên chưa nhận xét được câu hỏi này :(("}
            </p>
          </div>
          <div className="w-full mt-[10px] flex justify-end">
            <button
              onClick={() => {
                ClickChon(Chon + 1);
              }}
              className="text-[15px] p-[10px] bg-[#2A6770] text-white rounded-[15px] font-medium"
            >
              Tiếp Theo
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
