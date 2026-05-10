import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../FileThongso";
import { useParams, useNavigate } from "react-router-dom";
import Alert from "./aletr";
import BoxXacNhan from "./BoxXacNhan";

export default function TT_LopHoc() {
  const [DataKhoaHoc, setDataKhoaHoc] = useState<any[]>([]);
  const [DataLopHoc, setDataLopHoc] = useState<any>(null);
  const Input_TenLopHoc = useRef<HTMLInputElement>(null);
  const Input_LichHoc = useRef<HTMLInputElement>(null);
  const Input_GioHoc = useRef<HTMLInputElement>(null);
  const Input_NgayKhaiGiang = useRef<HTMLInputElement>(null);

  const [alIP_TenLopHoc, setalIP_TenLopHoc] = useState(false);
  const [alIP_LichHoc, setalIP_LichHoc] = useState(false);
  const [alIP_GioHoc, setalIP_GioHoc] = useState(false);
  const [alIP_NgayKhaiGiang, setalIP_NgayKhaiGiang] = useState(false);

  const [ChonTrangThai, setChonTrangThai] = useState("Khai Giảng");

  const [DrTrangThai, setDrTrangThai] = useState(false);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const [showXacNhan, setShowXacNhan] = useState(false);
  const navigate = useNavigate();

  const TatThongBao = () => {
    settb(false);
  };

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const { id } = useParams();

  const XoaLopHoc = async () => {
    try {
      const api = await fetch(
        `${BACKEND_URL}/api/xoa-lop-hoc-toan-dien/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: Token },
        },
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        settb(true);
        settypeTB("ss");
        setNdTB("Xóa lớp học thành công!");
        setShowXacNhan(false);
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else if (req.trangThai === "kdtq") {
        settb(true);
        settypeTB("err");
        setNdTB("Bạn không đủ quyền hạn để xóa lớp học");
        setShowXacNhan(false);
      } else {
        settb(true);
        settypeTB("err");
        setNdTB("Xóa lớp học thất bại");
        setShowXacNhan(false);
      }
    } catch (err) {
      console.log("xóa lớp học lỗi: " + err);
    }
  };

  const layDataLopHoc = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/layChiTietLopHoc/${id}`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataLopHoc(req.data);
        setChonTrangThai(req.data.trangThai);
      }
      console.log(req.data);
    } catch (err) {
      console.log("lay data lớp học thất bại : " + err);
    }
  };

  const update = async (
    trangThai: string,
    DateKhaiGiang: string,
    LichHoc: string,
    GioHoc: string,
    TenLop: string,
  ) => {
    try {
      const data = {
        trangThai: trangThai,
        DateKhaiGiang: DateKhaiGiang,
        LichHoc: LichHoc,
        GioHoc: GioHoc,
        TenLop: TenLop,
      };
      const api = await fetch(`${BACKEND_URL}/CapNhatLopHoc/${id}`, {
        method: "PATCH",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const req = await api.json();

      if (req.trangThai === "tb") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Thêm khóa học THẤT BẠI");
      } else if (req.trangThai === "kdtq") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      } else if (req.trangThai === "tc") {
        settb(true);
        settypeTB("ss"); // w , err
        setNdTB("Cập nhật khóa học thành công");
        layDataLopHoc();
      }
    } catch (err) {
      console.log("update thất bại : " + err);
    }
  };

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
      //      trangThai: string,
      // DateKhaiGiang: string,
      // LichHoc: string,
      // GioHoc: string,
      // TenLop: string,
      update(ChonTrangThai, NgayKhaiGiang, LichHoc, GioHoc, TenLopHoc);
    }
  };

  useEffect(() => {
    layDataLopHoc();
  }, []);

  return (
    <div className="w-full h-fit bg-[#2a6770] border border-black/20 rounded-[10px] p-[10px] flex flex-col gap-1 shadow-sm relative overflow-hidden">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      {showXacNhan && (
        <BoxXacNhan
          xoa={XoaLopHoc}
          tat={() => setShowXacNhan(false)}
          noiDung="Bạn có chắc chắn muốn xóa lớp học này và TOÀN BỘ dữ liệu liên quan?"
        />
      )}
      <h2 className="ml-[10px] text-white font-bold text-[22px] border-b border-black/10">
        Thông Tin Lớp Học
      </h2>
      <div className="bg-white rounded-[10px] p-[20px] flex flex-col gap-4 mt-2">
        <div className="flex gap-2">
          {/* tên lớp */}
          <div className="w-full flex gap-2 items-center  text-[#114A53]">
            <img
              src="https://img.icons8.com/?size=100&id=9456&format=png&color=2A6770"
              className="w-[30px]"
              alt="Class"
            />
            <p className="shrink-0 font-bold">Tên Lớp: </p>
            <input
              key={DataLopHoc}
              defaultValue={`${DataLopHoc?.TenLop || " "}`}
              placeholder="A197"
              ref={Input_TenLopHoc}
              type="text"
              className={`w-full p-[10px]    rounded-[10px] ${alIP_TenLopHoc ? `border-red-600 bg-red-50 ` : ``}`}
            />
          </div>
          {/* trạng thái */}
          <div className="w-full flex gap-2 items-center  text-[#114A53]">
            <img
              src="https://img.icons8.com/?size=100&id=bRxSFOADhDax&format=png&color=2A6770"
              className="w-[30px]"
              alt="Class"
            />
            <p className="shrink-0 font-bold">Trạng thái: </p>
            <div
              onClick={() => {
                setDrTrangThai(true);
              }}
              className="w-full cursor-pointer p-[10px]  rounded-[10px] flex justify-between relative"
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
        </div>

        {/* /////////////////////////////// */}
        <div className="w-full flex gap-2">
          <div className="w-full flex  gap-2 items-center">
            <img
              src="https://img.icons8.com/?size=100&id=7724&format=png&color=2A6770"
              className="w-[30px]"
              alt="Calendar"
            />
            <p className="shrink-0 font-bold text-[#114A53]">Lịch Học: </p>
            <input
              key={DataLopHoc}
              defaultValue={`${DataLopHoc?.LichHoc || " "}`}
              placeholder="T2-T3-T4"
              ref={Input_LichHoc}
              type="text"
              className={`w-full p-[10px]    rounded-[10px] ${alIP_LichHoc ? ` border border-red-600 bg-red-50 ` : ``}`}
            />
          </div>
          <div className="w-full flex  gap-2 items-center">
            <img
              src="https://img.icons8.com/?size=100&id=10083&format=png&color=2A6770"
              className="w-[30px]"
              alt="Time"
            />
            <p className="shrink-0 font-bold text-[#114A53]">Giờ Học: </p>
            <input
              key={DataLopHoc}
              defaultValue={`${DataLopHoc?.GioHoc || " "}`}
              placeholder="19h-20h"
              ref={Input_GioHoc}
              type="text"
              className={`w-full p-[10px]    rounded-[10px] ${alIP_GioHoc ? ` border border-red-600 bg-red-50 ` : ``}`}
            />
          </div>
        </div>

        {/* phần trạng thái khóa học */}
        <div className="w-full flex gap-2">
          <div className="w-full flex  gap-2 items-center">
            <img
              src="https://img.icons8.com/?size=100&id=CdqBys7kti6Y&format=png&color=2A6770"
              className="w-[30px]"
              alt="Time"
            />
            <p className="shrink-0 font-bold text-[#114A53]">
              Ngày Khai Giảng:{" "}
            </p>
            <input
              key={DataLopHoc}
              defaultValue={`${DataLopHoc?.DateKhaiGiang || " "}`}
              placeholder="1/1/2026"
              ref={Input_NgayKhaiGiang}
              type="text"
              className={`w-full p-[10px]    rounded-[10px] ${alIP_NgayKhaiGiang ? ` border border-red-600 bg-red-50 ` : ``}`}
            />
          </div>
          <div className="w-full flex  gap-2 items-center flex gap-2">
            <img
              src="https://img.icons8.com/?size=100&id=11220&format=png&color=2A6770"
              className="w-[30px]"
              alt="People"
            />
            <p className="shrink-0 font-bold text-[#114A53]">
              Số lượng Học Viên:{" "}
            </p>
            <div
              key={DataLopHoc}
              className={`w-full p-[10px]    rounded-[10px] `}
            >
              {DataLopHoc?.SoLuong}
            </div>
          </div>
        </div>

        {/* //////phần khóa học////// */}

        {/* phần nút */}
        <div className="flex gap-2 font-bold w-full mt-[10px]">
          <button
            onClick={() => setShowXacNhan(true)}
            className="w-full p-[10px] border bg-[#740c09] text-white rounded-[10px] transition-all duration-300 hover:scale-[1.03]"
          >
            Xóa
          </button>
          <button
            onClick={() => {
              checData();
            }}
            className="w-full p-[10px] border border-black/50 rounded-[10px] bg-[#13474b] text-white transition-all duration-300 hover:scale-[1.03]"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
