import { useState } from "react";
import Sidebar from "./componan/sidebar";
import Header from "./componan/header";
import Box_LhOnline from "./componan/box_LhOnline";
import Box_HV_CongDong from "./componan/box_HV_CongDong";
import Hv_QlTuVung from "./componan/box_Hv_QlTuVung";
import Box_HV_BaiTap from "./componan/box_HV_QL_BaiTap";
import Box_HV_QL_BaiTap from "./componan/box_HV_QL_BaiTap";
import HV_videoBaiGiang from "./componan/HV_videoBaiGiang";
import HV_TongQuan from "./componan/HV_TongQuan";

export default function HV_QlLopHoc() {
  const sidebarData = [
    {
      text: "Tổng quan",
      img: "https://img.icons8.com/?size=100&id=10576&format=png&color=114A53",
    },
    {
      text: "Lớp học online",
      img: "https://img.icons8.com/?size=100&id=25213&format=png&color=114A53",
    },
    {
      text: "Video bài Giảng",
      img: "https://img.icons8.com/?size=100&id=vfBptSkYnFAR&format=png&color=114A53",
    },
    {
      text: "Bài tập về nhà",
      img: "https://img.icons8.com/?size=100&id=YHijyB5nWl7P&format=png&color=114A53",
    },
    {
      text: "Từ Vựng",
      img: "https://img.icons8.com/?size=100&id=dZn7spIXQZmY&format=png&color=114A53",
    },
    {
      text: "Cộng Đồng",
      img: "https://img.icons8.com/?size=100&id=9542&format=png&color=114A53",
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
        {Chon === 0 && <HV_TongQuan />}
        {Chon === 1 && <Box_LhOnline />}
        {Chon === 2 && <HV_videoBaiGiang />}
        {Chon === 3 && <Box_HV_QL_BaiTap />}
        {Chon === 4 && <Hv_QlTuVung />}
        {Chon === 5 && <Box_HV_CongDong />}
      </section>
    </>
  );
}
