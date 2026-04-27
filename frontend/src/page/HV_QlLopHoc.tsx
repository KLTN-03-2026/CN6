import { useState } from "react";
import Sidebar from "./componan/sidebar";
import Header from "./componan/header";
import Box_LhOnline from "./componan/box_LhOnline";
import Box_HV_CongDong from "./componan/box_HV_CongDong";
import Hv_QlTuVung from "./componan/box_Hv_QlTuVung";
import Box_HV_BaiTap from "./componan/box_HV_QL_BaiTap";
import Box_HV_QL_BaiTap from "./componan/box_HV_QL_BaiTap";

export default function HV_QlLopHoc() {
  const sidebarData = [
    {
      text: "Lớp học online",
      img: "https://img.icons8.com/?size=100&id=25213&format=png&color=114A53",
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
        {Chon === 0 && <Box_LhOnline />}
        {Chon === 1 && <Box_HV_QL_BaiTap />}
        {Chon === 2 && <Hv_QlTuVung />}
        {Chon === 3 && <Box_HV_CongDong />}
      </section>
    </>
  );
}
