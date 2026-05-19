import { useEffect, useState } from "react";
import Header from "./componan/header";
import { BACKEND_URL } from "./FileThongso";
import { useNavigate } from "react-router-dom";
import Alert from "./componan/aletr";

export default function HV_kiemTraDauVao() {
  const [idDeRanDom, setidDeRanDom] = useState("");
  const [Token, setToken] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const chuyenTrang = useNavigate();

  const randomKTDV = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/kiem-tra-dau-vao-random`);
      const res = await api.json();
      if (res.trangThai === "tc") {
        setidDeRanDom(res.data[0]._id);
      }
    } catch (err) {
      console.log("loi khi lay randomKTDV: " + err);
    }
  };

  useEffect(() => {
    randomKTDV();
  }, []);

  const checkXacThuc = async () => {
    if (!Token) {
      settb(true);
      settypeTB("w");
      setNdTB("Bạn cần đăng nhập để bắt đầu làm bài kiểm tra");
      return;
    }
    try {
      const api = await fetch(`${BACKEND_URL}/api/xacThuc-thongTinTk`, {
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "tc") {
        chuyenTrang(`/HV_lamKtDauVao/${idDeRanDom}`);
      } else {
        settb(true);
        settypeTB("w");
        setNdTB("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.log("kiem tra tk that bai : " + err);
      settb(true);
      settypeTB("e");
      setNdTB("Lỗi kết nối đến máy chủ");
    }
  };

  return (
    <>
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      <Header type="hien" nopbai={() => {}} />
      <section className="my-[10px] mx-[20px] flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="w-full  h-[700px] flex items-center justify-center gap-[50px]">
          {/* phần text */}
          <div className=" max-w-[700px] flex flex-col gap-5">
            <h1 className="bg-gradient-to-t from-[#4ADADE] to-[#287678] bg-clip-text text-transparent font-extrabold text-[45px]">
              Kiểm tra trình độ TOEIC của bạn ngay hôm nay
            </h1>
            <p className="text-[20px]">
              Bài test được thiết kế theo chuẩn TOEIC, giúp bạn xác định chính
              xác trình độ hiện tại{" "}
              <span className="font-bold text-[#2D8587] text-[23px]">
                chỉ trong 25-30 phút.
              </span>
            </p>
            <p className="text-[20px]">
              Hệ thống AI sẽ phân tích kết quả và đề xuất lộ trình học phù hợp
              nhất cho bạn.
            </p>
            <div className="text-[20px] flex flex-col gap-2">
              <p>- phù hợp cho cả người mới bắt đầu</p>
              <p>- Kết quả sẽ hiển thị ngay sau khi hoàn thành</p>
              <p>- Bài test hoàn toàn miễn phí</p>
            </div>
            <button
              onClick={checkXacThuc}
              className="p-[20px] rounded-[15px] bg-[#114a53] font-extrabold w-fit text-white mt-[20px] transition-all cursor-pointer hover:scale-[1.02] hover:bg-[#308d8f]"
            >
              BẮT ĐẦU KIỂM TRA NGAY
            </button>
          </div>
          {/* phần ảnh  */}
          <div className="w-[500px] h-fit">
            <img
              className="w-full"
              src="/anhTrangKTDauVao.png"
              alt="anhKTDauVao"
            />
          </div>
        </div>
      </section>
    </>
  );
}
