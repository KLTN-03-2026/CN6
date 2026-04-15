import { useEffect, useRef, useState } from "react";
import Header from "./componan/header";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { div } from "framer-motion/client";
import Alert from "./componan/aletr";

export default function XNThanhToan() {
  const [chon, setchon] = useState(1);
  const [XacNhan, setXacNhan] = useState(false);
  const [alXN, setalXN] = useState(false);
  const [Data, setData] = useState<any>(null);
  const inSdt = useRef<HTMLInputElement>(null);
  const [DataTT, setDataTT] = useState<any>(null);
  const [soTien, setsoTien] = useState("");

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  ////id lớp học
  const { id } = useParams();
  const chuyenTrang = useNavigate();

  /////api XacNhan

  const layData = async () => {
    try {
      const api = await fetch(`http://localhost:3000/XNThanhToan/${id}`, {
        method: "GET",
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });

      const res = await api.json();

      if (res.trangThai !== "tc") {
        alert(res.mess);
      } else {
        setData(res.data);
        setsoTien(res.data.datakh.Gia.toLocaleString("vi-VN"));
      }
    } catch (err) {
      console.log("loi api lay data");
    }
  };

  const UpDaTe = async () => {
    try {
      const sdt = inSdt.current?.value || "";
      const api = await fetch(`http://localhost:3000/XNThanhToan/update`, {
        method: "PATCH",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({ sdt: sdt }),
      });

      const res = await api.json();

      if (res.trangThai !== "tc") alert(res.mess);
      else {
        console.log("cap nhat sdt thanh cong");
        settb(true);
        settypeTB("ss");
        setNdTB("Cập Nhật số điện thoại thành công");
      }
    } catch (err) {
      console.log("cap nhat that bai");
    }
  };

  const handlePayment = async () => {
    const response = await fetch("http://localhost:3000/api/tao-don-hang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Data.datakh.Gia,
        description: "Toic Nen Tang",
      }),
    });
    const data = await response.json();
    if (data.trangThai === "tc") {
      setDataTT(data.data);
    }
    console.log(data);
  };

  const themHoaDon = async () => {
    try {
      const date = new Date();
      const vietnamTime = date.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
      const data = {
        maHoaDon: DataTT.ghiChu,
        idKhoaHoc: Data.datakh._id,
        idLopHoc: Data.datalop._id,
        email: Data.datatk.Email,
        TenKhoaHoc: Data.datakh.TenKhoaHoc,
        TenLop: Data.datalop.TenLop,
        Gia: Data.datakh.Gia,
        Time: vietnamTime,
      };
      const api = await fetch("http://localhost:3000/api/them-hoa-don", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const res = await api.json();
    } catch (err) {
      console.log("them hoa don that bai: " + err);
    }
  };

  const guiHoaDonEmail = async () => {
    try {
      const date = new Date();
      const vietnamTime = date.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
      const data = {
        email: Data.datatk.Email,
        HoTen: Data.datatk.HoTen,
        sdt: Data.datatk.sdt,
        NamSinh: Data.datatk.NamSinh,
        NgheNghiep: Data.datatk.NgheNghiep,
        TenKhoaHoc: Data.datakh.TenKhoaHoc,
        Gia: soTien,
        TenLop: Data.datalop.TenLop,
        Time: vietnamTime,
      };
      const api = await fetch("http://localhost:3000/api/gui-hoaDon-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const res = await api.json();
    } catch (err) {
      console.log("gửi hóa đơn thất bại");
    }
  };

  useEffect(() => {
    let intervalId: any;
    console.log(0);
    if (DataTT && DataTT.orderCode) {
      intervalId = setInterval(async () => {
        try {
          const api = await fetch(
            `http://localhost:3000/KTdonHang/${DataTT.orderCode}`,
          );
          console.log(0);
          const res = await api.json();
          if (res.trangThai === "tc") {
            clearInterval(intervalId);
            setDataTT(null);
            themHoaDon();
            guiHoaDonEmail();
            capNhatSiSO();
            setchon(3);
          } else if (res.trangThai === "tb") {
            console.log("chua thanh toan");
          }
        } catch (err) {
          console.log("loi goi api ktTT: " + err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [DataTT]);

  const TatThongBao = () => {
    settb(false);
  };

  const capNhatSiSO = async () => {
    try {
      const api = await fetch(
        `http://localhost:3000/api/cap-nhat-si-so/${id}`,
        {
          method: "PATCH",
        },
      );
      const req = await api.json();
    } catch (err) {
      console.log("cap nhat si so that bai : " + err);
    }
  };

  useEffect(() => {
    layData();
  }, []);

  return (
    <>
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      <Header type="hien" />
      {chon === 1 && (
        <div>
          <div className="mx-[30px] my-[30px] flex gap-[30px] text-[15px]">
            {/* //////////////////////Thông tin////////////////// */}
            <div className="w-full p-[30px] border rounded-[10px] flex flex-col gap-[10px] h-fit drop-shadow-[0_0_5px_rgb(0,0,0,0.15)] bg-white">
              <h1 className="text-[20px] w-full text-center font-bold">
                Thông Tin Của Bạn
              </h1>
              <div className="p-[10px] bg-[#d8f8ff] rounded-[10px] text-[15px] text-[#13474B]">
                Khóa học và tất cả quyền lợi đi kèm sẽ được thêm vào tài khoản
                này sau khi quá trình thanh toán thành công!
              </div>
              <p>Email (*)</p>
              <p className="p-[10px] text-[rgba(0,0,0,0.7)] border border-black/20 rounded-[10px] focus:outline-none">
                {Data?.datatk?.Email}
              </p>
              <p className="text-[12px] text-[rgba(0,0,0,0.5)]">
                Địa chỉ email của bạn là bắt buộc để nhận biên lai, kích hoạt
                khóa học và các cập nhật quan trọng. Vui lòng đảm bảo địa chỉ
                email của bạn chính xác để tránh thất lạc thông tin thiết yếu.
              </p>
              <p>Số Điện Thoại (*)</p>
              <input
                type="text"
                className="p-[10px] border border-black/20 rounded-[10px] focus:outline-none"
                placeholder="diền số điện thoại của bạn vào đây"
                defaultValue={`${Data?.datatk?.sdt || ""}`}
                ref={inSdt}
              />
              <div className="flex gap-2 cursor-pointer">
                <div
                  onClick={() => {
                    setXacNhan(!XacNhan);
                  }}
                  className="overflow-hidden w-[20px] h-[20px] border border-black/20 rounded-[5px]"
                >
                  <div
                    className={`w-full h-full flex justify-center items-center transition-all duration-300 ${XacNhan ? `bg-[#13474b]` : `bg-white`}`}
                  >
                    <img
                      className={` transition-all duration-300 ${XacNhan ? `w-[70%] opacity-[1]` : `w-[50%] opacity-0`}`}
                      src="https://img.icons8.com/?size=100&id=7690&format=png&color=FFFFFF"
                      alt=""
                    />
                  </div>
                </div>

                <p className="text-[12px]">
                  xác nhận đã đọc và đồng ý với{" "}
                  <a className="underline font-bold text-[#13474b]" href="#">
                    Điều kiện & Điều khoản
                  </a>{" "}
                  của của E-learning
                </p>
              </div>
              <button
                onClick={() => {
                  if (XacNhan) {
                    //////
                    if ((inSdt.current?.value || "") !== Data.datatk.sdt) {
                      UpDaTe();
                    }
                    handlePayment();
                    setalXN(false);
                    setchon(2);
                  } else {
                    setalXN(true);
                  }
                }}
                className="w-full py-[10px] rounded-[10px] bg-[#13474b] text-white font-bold"
              >
                Tiếp tục thanh toán →
              </button>
              {alXN && (
                <p className="text-red-500 w-full text-center">
                  Vui lòng đọc Và xác nhận các điều khoản trước khi thanh toán
                </p>
              )}
            </div>

            {/* ///////////////////////////// chi tiết đơn hàng/////////////////////// */}

            <div className="w-full p-[30px] border rounded-[10px] flex flex-col gap-[10px] h-fit text-[15px] drop-shadow-[0_0_5px_rgb(0,0,0,0.15)] bg-white">
              <h1 className="text-[20px] w-full text-center font-bold">
                Chi tiết đơn hàng
              </h1>
              <p>Sản Phẩm :</p>
              <div className="p-[10px] rounded-[10px] w-full text-[rgba(0,0,0,0.75)]  border border-black/20 ">
                {Data?.datakh.TenKhoaHoc}
              </div>
              <p>thông tin sản phẩm:</p>
              <div className="flex text-[rgba(0,0,0,0.75)]">
                <p className="w-full">lớp : {Data?.datalop.TenLop}</p>
                <p className="w-full">
                  khai giảng : {Data?.datalop.DateKhaiGiang}
                </p>
              </div>
              <div className="flex text-[rgba(0,0,0,0.75)]">
                <p className="w-full">lịch học: {Data?.datalop.LichHoc}</p>
                <p className="w-full">Giờ học: {Data?.datalop.GioHoc}</p>
              </div>
              <p>Tổng Tiền:</p>
              <p className="w-full p-[10px] bg-[#D8F8FF] text-[25px] rounded-[10px] font-extrabold text-[#13474B]">
                {soTien} VNĐ
              </p>
            </div>
          </div>
        </div>
      )}
      {chon === 2 && (
        <div>
          <div className="mx-[30px] my-[30px] flex gap-[30px] text-[15px]">
            {/* //////////////////////Thông tin////////////////// */}
            <div className="text-[15px] w-full p-[30px] border rounded-[10px] flex flex-col gap-[10px] h-fit drop-shadow-[0_0_5px_rgb(0,0,0,0.15)] bg-white">
              <h1 className="text-[20px] w-full text-center font-bold">
                Thông Tin Thanh Toán
              </h1>
              <div className="p-[10px] rounded-[10px] bg-[rgba(215,232,236,0.5)] flex gap-5">
                <div className="w-[170px] h-[170px] border border-black/20 rounded-[10px] flex justify-center items-center overflow-hidden">
                  <QRCodeSVG value={DataTT?.qrCode || ""} size={200} />
                </div>
                <div className="flex flex-col gap-[13px] justify-center">
                  <p className="text-[15px]">
                    <span className="font-bold">Mã ngân hàng: </span>
                    {DataTT?.maNganHang || ""}
                  </p>

                  <p className="text-[15px]">
                    <span className="font-bold">Số tài khoản: </span>
                    {DataTT?.soTK || ""}
                  </p>

                  <p className="text-[15px]">
                    <span className="font-bold">Tên chủ tài khoản: </span>
                    {DataTT?.tenTK || ""}
                  </p>

                  <p className="text-[15px]">
                    <span className="font-bold">Nội dung Chuyển khoản: </span>
                    {DataTT?.ghiChu || ""}
                  </p>
                  <p className="text-[15px]">
                    <span className="font-bold">Số tiền cần chuyển: </span>
                    {soTien} VNĐ
                  </p>
                </div>
              </div>
              <p>Hướng dẫn thanh toán:</p>

              <p className="text-black/80">
                1. Mở ứng dụng ngân hàng trên thiết bị di động của bạn
              </p>
              <p className="text-black/80">
                2. Trên ứng dụng, chọn tính năng Quét mã QR
              </p>
              <p className="text-black/80">
                3. Quét mã QR bên trên và thanh toán
              </p>
              <div className="p-[10px] bg-[#d8f8ff] rounded-[10px] text-[15px] text-[#13474B]">
                Sau khi bạn thanh toán thành công, vui lòng chờ trong 5 phút để
                hệ thống xử lý đơn hàng. Nếu quá thời gian trên mà chưa nhận
                được phản hồi, vui lòng cung câp hình ảnh thanh toán cho các bạn
                tư vấn tuyển sinh để được xác nhận đơn hàng!
              </div>
            </div>

            {/* ///////////////////////////// chi tiết đơn hàng/////////////////////// */}

            <div className="w-full p-[30px] border rounded-[10px] flex flex-col gap-[10px] h-fit text-[15px] drop-shadow-[0_0_5px_rgb(0,0,0,0.15)] bg-white">
              <h1 className="text-[20px] w-full text-center font-bold border-b border-b-black/15 pb-[10px]">
                Thông Tin Của Bạn
              </h1>
              <p className="font-medium">Thông Tin Học Viên:</p>
              <div className="flex text-black/80 justify-between">
                <p>Tài khoản E-learning</p>
                <p>{Data?.datatk.Email}</p>
              </div>
              <div className="flex text-black/80 justify-between">
                <p>Tên: </p>
                <p>{Data?.datatk.HoTen}</p>
              </div>
              <div className="flex text-black/80 justify-between">
                <p>Số Điện Thoại</p>
                <p>{Data?.datatk.sdt}</p>
              </div>
              <div className="flex text-black/80 justify-between border-b border-b-black/15 pb-[10px]">
                <p>Email:</p>
                <p>{Data?.datatk.Email}</p>
              </div>
              <p className="font-medium">sản phẩm:</p>
              <div className="flex text-black/80 justify-between border-b border-b-black/15 pb-[10px]">
                <p>{Data?.datakh.TenKhoaHoc}</p>
                <p>{Data?.datalop.TenLop}</p>
              </div>
              <p className="font-medium">Tổng tiền:</p>
              <p className="text-[25px] font-extrabold text-[#13474B]">
                {soTien} VNĐ
              </p>
            </div>
          </div>
        </div>
      )}
      {chon === 3 && (
        <div className=" p-[150px]  flex flex-col items-center gap-7 justify-center ">
          <div className="  flex flex-col items-center gap-7 justify-center">
            <h1 className="text-[35px] font-extrabold text-[#13474b] w-full text-center">
              Thanh Toán Thành công
            </h1>
            <img src="/sucsess.gif" alt="" />
            <div className="p-[10px] w-full text-center bg-[#d8f8ff] rounded-[10px] text-[15px] text-[#13474B]">
              Hóa đơn sẻ sớm được gửi vào tài khoản email của bạn
            </div>
            <button
              onClick={() => {
                chuyenTrang("/");
              }}
              className="w-full  py-[10px] rounded-[10px] bg-[#13474b] text-white font-bold transition-all duration-300 hover:scale-[1.03] "
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      )}

      {chon === 4 && (
        <div className=" border-[#114a53]/50 p-[20px] border-[5px] relative w-[1000px]">
          <img
            className="absolute w-[200px] top-[20px]"
            src="/logo.svg"
            alt=""
          />

          <div className="border-b border-b-black/50 pb-[20px]">
            <h1 className="text-center font-bold">HÓA ĐƠN GIÁ TRỊ GIA TĂNG</h1>
            <p className="text-center">
              (Bản thể hiện của hóa đơn điện tử từ máy tính tiền)
            </p>
            <p className="text-center">thời gian : 12/12/2026</p>
          </div>
          {/* /////////////////////////////// */}
          <p className="mt-[20px]">
            Đơn Vị Bán :{" "}
            <span className="font-bold">TRUNG TÂM ANH NGỮ E-LEARNING</span>
          </p>
          <div className="flex">
            <p className="w-full mt-[10px]">
              Số Tài Khoản : <span className="font-bold">0334604948</span>
            </p>
            <p className="w-full mt-[10px]">
              Mở Tại : <span className="font-bold">MbBank Điện Biên Phủ</span>
            </p>
          </div>
          <p className="mt-[10px]">
            Địa CHỉ :{" "}
            <span className="font-bold">
              số 10 - dũng sĩ thanh khê/ đà nẵng
            </span>
          </p>
          <p className="mt-[10px] border-b border-b-black/50 pb-[20px]">
            Số Điện Thoại : <span className="font-bold">0334604948</span>
          </p>

          {/* /////////////////////////// */}
          <p className="mt-[20px]">
            Họ Tên Người Mua Hàng :{" "}
            <span className="font-bold">Đinh Văn Ngọc Toàn</span>
          </p>
          <div className="flex">
            <p className="w-full mt-[10px]">
              Email :{" "}
              <span className="font-bold">dinhvanngoctoan@gmail.com</span>
            </p>
            <p className="w-full mt-[10px]">
              Số điện Thoại : <span className="font-bold">0334604948</span>
            </p>
          </div>
          <div className="flex">
            <p className="w-full mt-[10px]">
              Năm Sinh : <span className="font-bold">2004</span>
            </p>
            <p className="w-full mt-[10px]">
              Nghề Nghiệp :{" "}
              <span className="font-bold">Học Sinh & sinh viên</span>
            </p>
          </div>
          <p className="w-full mt-[10px]">
            Hình Thức Thanh Toán :{" "}
            <span className="font-bold">Chuyển Khoản</span>
          </p>
          {/* ////////////////////////// */}
          <div className="mt-[20px] w-full flex text-center font-bold">
            <p className=" border p-[5px] w-[150px] border-black">STT</p>
            <p className="w-full border p-[5px] border-black">
              Tên Hàng Hóa & dịch Vụ
            </p>
            <p className="w-full border p-[5px] border-black">Đơn Vị Tính</p>
            <p className="w-full border p-[5px] border-black">Số Lượng</p>
            <p className="w-[400px] border p-[5px] border-black">Đơn Giá</p>
            <p className="w-full border p-[5px] border-black">Thành Tiền</p>
          </div>
          {/* /////////// */}
          <div className=" w-full flex text-center ">
            <p className="w-[150px] border p-[5px] border-black">1</p>
            <p className="w-full border p-[5px] border-black">
              Toic Nền Tảng /a197
            </p>
            <p className="w-full border p-[5px] border-black">Khóa Học</p>
            <p className="w-full border p-[5px] border-black">1</p>
            <p className="w-[400px] border p-[5px] border-black">3.500</p>
            <p className="w-full border p-[5px] border-black">3.500</p>
          </div>
          <div className="w-full border p-[5px] border-black flex justify-between ">
            <p className="font-bold">Tổng Hóa Đơn:</p>
            <p>3.500 VNĐ</p>
          </div>
          {/* ///////////// */}
          <div className="h-[130px] w-full mt-[20px] flex font-bold">
            <div className="w-full text-center">Người Mua Hàng</div>
            <div className="w-full text-center">Người Mua Hàng</div>
            <div className="w-full text-center">Người Mua Hàng</div>
          </div>
        </div>
      )}
    </>
  );
}
