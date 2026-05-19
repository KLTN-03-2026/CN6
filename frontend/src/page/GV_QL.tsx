import { useState } from "react";
import Header from "./componan/header";
import Sidebar from "./componan/sidebar";
import GV_QL_KhoaHoc from "./componan/GV_QL_KhoaHoc";
import QL_LopHoc from "./componan/QL_LopHoc";
import QL_quanLyTuVung from "./componan/QL_quanLyTuVung";
import QL_vidoBaiGiang from "./componan/QL_videoBaiGiang";
import QL_taiKhoan from "./componan/QL_taiKhoan";
import Ql_luyenDe from "./componan/QL_luyenDe";
import QL_quanLyThiThu from "./componan/QL_quanLyThiThu";
import QL_KTDauVao from "./componan/QL_KTDauVao";
import QL_yeuCauTuVan from "./componan/QL_yeuCauTuVan";
import QL_hoaDon from "./componan/QL_hoaDon";
import QL_thongKe from "./componan/QL_thongKe";

export default function GV_QL() {
  const sidebarData = [
    {
      text: "QL. khóa học",
      img: "https://img.icons8.com/?size=100&id=D3DbmOse8wPb&format=png&color=114A53",
    },
    {
      text: "QL. lớp học",
      img: "https://img.icons8.com/?size=100&id=9456&format=png&color=114A53",
    },
    {
      text: "QL. Video Bài Giảng",
      img: "https://img.icons8.com/?size=100&id=vfBptSkYnFAR&format=png&color=114A53",
    },
    {
      text: "QL. Từ Vựng",
      img: "https://img.icons8.com/?size=100&id=35191&format=png&color=114A53",
    },
    {
      text: "QL. Luyện Đề",
      img: "https://img.icons8.com/?size=100&id=7781&format=png&color=114A53",
    },
    {
      text: "QL. Thi thử",
      img: "https://img.icons8.com/?size=100&id=35881&format=png&color=114A53",
    },
    {
      text: "QL. KT đầu vào",
      img: "https://img.icons8.com/?size=100&id=65285&format=png&color=114A53",
    },
    {
      text: "Yêu cầu tư vấn",
      img: "https://img.icons8.com/?size=100&id=JJv3AiVbhvVE&format=png&color=114A53",
    },
    {
      text: "QL. Hóa Đơn",
      img: "https://img.icons8.com/?size=100&id=60638&format=png&color=114A53",
    },
  ];
  const [Chon, setChon] = useState(0);

  const clickChon = (i: number) => {
    setChon(i);
  };
  return (
    <>
      <Header type="khien" />
      <section className="m-[20px] flex relative gap-3">
        <Sidebar
          Type="ql"
          data={sidebarData}
          Chon={Chon}
          ClickChon={clickChon}
        />
        {Chon === 0 && <GV_QL_KhoaHoc />}
        {Chon === 1 && <QL_LopHoc />}
        {Chon === 2 && <QL_vidoBaiGiang />}
        {Chon === 3 && <QL_quanLyTuVung />}

        {Chon === 4 && <Ql_luyenDe />}
        {Chon === 5 && <QL_quanLyThiThu />}
        {Chon === 6 && <QL_KTDauVao />}
        {Chon === 7 && <QL_yeuCauTuVan />}

        {Chon === 8 && <QL_hoaDon />}
      </section>
    </>
  );
}
