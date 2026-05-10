import { useRef, useState } from "react";

interface Box_Ql_ThemLopHoc_Props {
  DataKhoaHoc: any[];
  tat: () => void;
  ThemLh: (
    TenLH: string,
    LichHoc: string,
    GioHoc: string,
    NgayKhaiGiang: string,
    idKhoaHoc: string,
    trangThai: string,
  ) => void;
}

export default function Box_Ql_ThemLopHoc({
  DataKhoaHoc,
  tat,
  ThemLh,
}: Box_Ql_ThemLopHoc_Props) {
  const [ChonKhoaHoc, setChonKhoaHoc] = useState(DataKhoaHoc[0].TenKhoaHoc);
  const [ChonIdKhoHoc, setChonIdKhoaHoc] = useState(DataKhoaHoc[0]._id);
  const [DrKhoaHoc, setDrKhoaHoc] = useState(false);

  const [DrTrangThai, setDrTrangThai] = useState(false);
  const [ChonTrangThai, setChonTrangThai] = useState("Khai Giảng");

  const Input_TenLopHoc = useRef<HTMLInputElement>(null);
  const Input_LichHoc = useRef<HTMLInputElement>(null);
  const Input_GioHoc = useRef<HTMLInputElement>(null);
  const Input_NgayKhaiGiang = useRef<HTMLInputElement>(null);

  const [alIP_TenLopHoc, setalIP_TenLopHoc] = useState(false);
  const [alIP_LichHoc, setalIP_LichHoc] = useState(false);
  const [alIP_GioHoc, setalIP_GioHoc] = useState(false);
  const [alIP_NgayKhaiGiang, setalIP_NgayKhaiGiang] = useState(false);

  const checData = () => {
    const TenLopHoc = Input_TenLopHoc.current?.value.trim() || "";
    const LichHoc = Input_LichHoc.current?.value.trim() || "";
    const GioHoc = Input_GioHoc.current?.value.trim() || "";
    const NgayKhaiGiang = Input_NgayKhaiGiang.current?.value.trim() || "";

    let check = 0;

    if (TenLopHoc === "") {
      setalIP_TenLopHoc(true);
      check++;
    } else setalIP_TenLopHoc(false);

    if (LichHoc === "") {
      setalIP_LichHoc(true);
      check++;
    } else setalIP_LichHoc(false);

    if (GioHoc === "") {
      setalIP_GioHoc(true);
      check++;
    } else setalIP_GioHoc(false);

    if (NgayKhaiGiang === "") {
      setalIP_NgayKhaiGiang(true);
      check++;
    } else setalIP_NgayKhaiGiang(false);

    if (check === 0) {
      ThemLh(
        TenLopHoc,
        LichHoc,
        GioHoc,
        NgayKhaiGiang,
        ChonIdKhoHoc,
        ChonTrangThai,
      );
    }
  };
  return (
    <div className="w-screen h-screen bg-black/50 z-[3]  fixed top-0 left-0 flex justify-center items-center">
      <div className="w-[600px] p-[30px] bg-white rounded-[10px] flex flex-col justify-center items-center gap-2">
        <h2 className="font-bold text-[25px] text-[#13474b]">Thêm Lớp học</h2>
        {/* phần tên lớp học */}
        <div className="w-full">
          <p>Tên Lớp Học</p>
          <input
            placeholder="A197"
            ref={Input_TenLopHoc}
            type="text"
            className={`w-full p-[10px] border   rounded-[10px] ${alIP_TenLopHoc ? `border-red-600 bg-red-50 ` : `border-black/50`}`}
          />
          {alIP_TenLopHoc && (
            <p className="text-[15px] text-red-500 mt-[5px]">
              Ô này không được để trống
            </p>
          )}
        </div>
        {/* /////////////////////////////// */}
        <div className="w-full flex gap-2">
          <div className="w-full">
            <p>Lịch Học</p>
            <input
              placeholder="T2-T3-T4"
              ref={Input_LichHoc}
              type="text"
              className={`w-full p-[10px] border   rounded-[10px] ${alIP_LichHoc ? `border-red-600 bg-red-50 ` : `border-black/50`}`}
            />
            {alIP_LichHoc && (
              <p className="text-[15px] text-red-500 mt-[5px]">
                Ô này không được để trống
              </p>
            )}
          </div>
          <div className="w-full">
            <p>Giờ Học</p>
            <input
              placeholder="19h-20h"
              ref={Input_GioHoc}
              type="text"
              className={`w-full p-[10px] border   rounded-[10px] ${alIP_GioHoc ? `border-red-600 bg-red-50 ` : `border-black/50`}`}
            />
            {alIP_GioHoc && (
              <p className="text-[15px] text-red-500 mt-[5px]">
                Ô này không được để trống
              </p>
            )}
          </div>
        </div>

        {/* phần trạng thái khóa học */}
        <div className="w-full flex gap-2">
          <div className="w-full">
            <p>Trạng thái</p>
            <div
              onClick={() => {
                setDrTrangThai(true);
              }}
              className="w-full cursor-pointer p-[10px] border border-black/50  rounded-[10px] flex justify-between relative"
            >
              <p>{ChonTrangThai}</p>
              <img
                className={`h-[20px] transition-all duration-300  ${DrTrangThai ? `rotate-0` : `rotate-[90deg]`}`}
                src="https://img.icons8.com/?size=100&id=87356&format=png&color=000000"
                alt=""
              />
              {DrTrangThai && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDrTrangThai(false);
                  }}
                  className="w-screen h-screen fixed  top-0 left-0"
                ></div>
              )}
              {DrTrangThai && (
                <div className="z-[2] w-full py-[10px] absolute border border-black/20 left-0 bg-white top-[45px] rounded-[10px] ">
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setChonTrangThai("Khai Giảng");
                      setDrTrangThai(false);
                    }}
                    className="px-[10px] py-[5px] transition-all duration-300 hover:bg-[#d7e8ec] cursor-pointer"
                  >
                    Khai Giảng
                  </p>
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setChonTrangThai("Đang Hoạt Động");
                      setDrTrangThai(false);
                    }}
                    className="px-[10px] py-[5px] transition-all duration-300 hover:bg-[#d7e8ec] cursor-pointer"
                  >
                    Đang Hoạt Động
                  </p>
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setChonTrangThai("Ẩn");
                      setDrTrangThai(false);
                    }}
                    className="px-[10px] py-[5px] transition-all duration-300 hover:bg-[#d7e8ec] cursor-pointer"
                  >
                    Ẩn
                  </p>
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setChonTrangThai("Kết Thúc");
                      setDrTrangThai(false);
                    }}
                    className="px-[10px] py-[5px] transition-all duration-300 hover:bg-[#d7e8ec] cursor-pointer"
                  >
                    Kết Thúc
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="w-full">
            <p>Ngày Khai Giảng</p>
            <input
              placeholder="1/1/2026"
              ref={Input_NgayKhaiGiang}
              type="text"
              className={`w-full p-[10px] border   rounded-[10px] ${alIP_NgayKhaiGiang ? `border-red-600 bg-red-50 ` : `border-black/50`}`}
            />
            {alIP_NgayKhaiGiang && (
              <p className="text-[15px] text-red-500 mt-[5px]">
                Ô này không được để trống
              </p>
            )}
          </div>
        </div>

        {/* //////phần khóa học////// */}
        <div className="w-full">
          <p>Khóa Học</p>
          <div
            onClick={() => {
              setDrKhoaHoc(true);
            }}
            className="w-full cursor-pointer p-[10px] border border-black/50  rounded-[10px] flex justify-between relative"
          >
            <p>{ChonKhoaHoc}</p>
            <img
              className={`h-[20px] transition-all duration-300  ${DrKhoaHoc ? `rotate-0` : `rotate-[90deg]`}`}
              src="https://img.icons8.com/?size=100&id=87356&format=png&color=000000"
              alt=""
            />
            {DrKhoaHoc && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDrKhoaHoc(false);
                }}
                className="w-screen h-screen fixed  top-0 left-0"
              ></div>
            )}
            {DrKhoaHoc && (
              <div className="w-full py-[10px] absolute border border-black/20 left-0 bg-white z-[2] top-[45px] rounded-[10px] ">
                {DataKhoaHoc?.map((item) => (
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      setChonKhoaHoc(item.TenKhoaHoc);
                      setChonIdKhoaHoc(item._id);
                      setDrKhoaHoc(false);
                    }}
                    className="px-[10px] py-[5px] transition-all duration-300 hover:bg-[#d7e8ec] cursor-pointer"
                  >
                    {item.TenKhoaHoc}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* phần nút */}
        <div className="flex gap-2 font-bold w-full mt-[10px]">
          <button
            onClick={() => {
              tat();
            }}
            className="w-full p-[10px] border border-black/50 rounded-[10px] transition-all duration-300 hover:scale-[1.03]"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              checData();
            }}
            className="w-full p-[10px] border border-black/50 rounded-[10px] bg-[#13474b] text-white transition-all duration-300 hover:scale-[1.03]"
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
