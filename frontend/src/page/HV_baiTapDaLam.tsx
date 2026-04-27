import { useEffect, useState } from "react";
import { BACKEND_URL } from "./FileThongso";
import Header from "./componan/header";
import Sidebar from "./componan/sidebar";
import HV_box_bt from "./componan/HV_box_BT";
import { data, useParams } from "react-router-dom";
import HV_box_bt_DaLam from "./componan/HV_box_bt_daLam";

export default function Hv_baiTapDaLam() {
  const [Data, setData] = useState<any[]>([]);
  const [Token, setToken] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });
  const { id } = useParams();

  const [Chon, setChon] = useState(0);
  const [sidebarData, setsidebarData] = useState<any[]>([]);

  const clickChon = (i: number) => {
    if (i < Data.length) {
      setChon(i);
    }
  };

  const layData = async () => {
    try {
      const api = await fetch(
        `${BACKEND_URL}/api/xemtheChiTietBaiTapDaLam/${id}`,
        {
          method: "GET",
          headers: { Authorization: Token, "Content-Type": "application/json" },
        },
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        setData(req.data);
        console.log("lay data thành công");
        const sidebar = [
          {
            text: "part 1",
            slCauHoi: Number(req.data.length),
          },
        ];
        console.log(req.data.length);
        setsidebarData(sidebar);
      }
    } catch (err) {
      console.log("lay data that bai : " + err);
    }
  };
  const nopbai = () => {};

  useEffect(() => {
    layData();
  }, []);
  return (
    <>
      <Header nopbai={nopbai} type="khien" />

      <section className="mx-[10px] flex relative gap-3 ">
        <Sidebar
          Type="bt"
          data={sidebarData}
          Chon={Chon}
          ClickChon={clickChon}
          dapAN={Data}
        />
        <HV_box_bt_DaLam data={Data[Chon]} Chon={Chon} ClickChon={clickChon} />
      </section>
    </>
  );
}
