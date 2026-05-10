import { useState } from "react";
import Sidebar from "./componan/sidebar";
import Header from "./componan/header";
import TT_LopHoc from "./componan/TT_LopHoc";
import QL_LopHocOnline from "./componan/QL_LopHocOnline";
import QL_CongDong from "./componan/QL_CongDong";
import QL_BaiTap from "./componan/QL_BaiTap";
import QL_diemDanh from "./componan/QL_diemDanh";
import QL_danhSachHocVien from "./componan/QL_danhSachHocVien";

export default function Ql_ChiTietLopHoc() {
  const [Chon, setChon] = useState(0);

  const clickChon = (i: number) => {
    setChon(i);
  };

  const sidebarData = [
    {
      text: "Thông tin lớp",
      img: "https://img.icons8.com/?size=100&id=37303&format=png&color=114A53",
    },

    {
      text: "Lớp Học Online",
      img: "https://img.icons8.com/?size=100&id=9456&format=png&color=114A53",
    },
    {
      text: "Bài tập",
      img: "https://img.icons8.com/?size=100&id=YHijyB5nWl7P&format=png&color=114A53",
    },
    {
      text: "Cộng đồng",
      img: "https://img.icons8.com/?size=100&id=11220&format=png&color=114A53",
    },
    {
      text: "Điểm danh",
      img: "https://img.icons8.com/?size=100&id=50897&format=png&color=114A53",
    },
    {
      text: "Danh sách học viên",
      img: "https://img.icons8.com/?size=100&id=BjLaPJ1cFKRo&format=png&color=114A53",
    },
  ];
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
        {Chon === 0 && <TT_LopHoc />}
        {Chon === 1 && <QL_LopHocOnline />}
        {Chon === 2 && <QL_BaiTap />}
        {Chon === 3 && <QL_CongDong />}
        {Chon === 4 && <QL_diemDanh />}
        {Chon === 5 && <QL_danhSachHocVien />}
      </section>
    </>
  );
}
