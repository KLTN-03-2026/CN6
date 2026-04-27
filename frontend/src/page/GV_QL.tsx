import { useState } from "react";
import Header from "./componan/header";
import Sidebar from "./componan/sidebar";

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
      text: "QL. Tài Khoản",
      img: "https://img.icons8.com/?size=100&id=lgyS725ZKMwY&format=png&color=114A53",
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
      text: "Thống kê",
      img: "https://img.icons8.com/?size=100&id=57717&format=png&color=114A53",
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
      </section>
    </>
  );
}
