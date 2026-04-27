import { text } from "framer-motion/client";
import Header from "./componan/header";
import Sidebar from "./componan/sidebar";
import BoxKhoaHoc from "./componan/boxKhoaHoc";
import { useState } from "react";
import Box_HV_CongDong from "./componan/box_HV_CongDong";

export default function HocVien_QlHocTap() {
  const sidebarData = [
    {
      text: "Khóa học",
      img: "https://img.icons8.com/?size=100&id=D3DbmOse8wPb&format=png&color=114A53",
    },
    {
      text: "Luyện đề",
      img: "https://img.icons8.com/?size=100&id=LCBYuARjvqTG&format=png&color=114A53",
    },
    {
      text: "Thi thử",
      img: "https://img.icons8.com/?size=100&id=pua6WTrdnc9N&format=png&color=114A53",
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

        {/* /////////////////main /////////////////////// */}
        {Chon === 0 && <BoxKhoaHoc />}
      </section>
    </>
  );
}
