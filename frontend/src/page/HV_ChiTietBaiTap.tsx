import { useEffect, useState } from "react";
import Header from "./componan/header";
import Sidebar from "./componan/sidebar";
import HV_box_bt from "./componan/HV_box_BT";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL, HEADER_txt } from "./FileThongso";
import { number } from "framer-motion";
import Load from "./componan/load";

export default function HV_ChiTietBaiTap() {
  //   0: trắc nghiệm
  //   1: Câu trả lời ngắn
  //   2: Tự luận
  //   3: Ghi âm

  ////////// cách tính điểm /////////

  // trắc nghiệm :0.5
  // tự luận ngắn : 0-2
  //tự luận dài: 0-6;
  // ghi âm: 0-8;

  /////phần xử lý lấy dữ liệu
  const [dataCauHoi, setdataCauHoi] = useState<any[]>([]);
  const [sidebarData, setsidebarData] = useState<any[]>([]);
  const [alLoad, setalLoad] = useState(false);

  const ChuyenTrang = useNavigate();

  const [Token, setToken] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const { id } = useParams();

  const layData = async () => {
    try {
      const api = await fetch(
        `http://localhost:3000/api/LatDanhSachChiTietBaiTap/${id}`,
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        setdataCauHoi(req.data);
        setdapan(req.data);

        const sidebar = [
          {
            text: `Câu hỏi`,
            slCauHoi: Number(req.data.length),
          },
        ];
        console.log(req.data.length);
        setsidebarData(sidebar);
        console.log("lay datta thanh cong");
      }
    } catch (err) {
      console.log("lay data that bai : " + err);
    }
  };

  ////// phần điều khiển vị trí các câu hỏi

  const [Chon, setChon] = useState(0);

  const clickChon = (i: number) => {
    if (i < dataCauHoi.length) {
      setChon(i);
    }
  };

  ///// phần đáp án và nộp đáp án

  const [dapan, setdapan] = useState<any[]>([]);
  // let dapan = Array.from({ length: dataCauHoi.length });

  const capNhatDapAn = (items: any) => {
    let dsdapan = [...dapan];
    dsdapan[Chon] = items;
    setdapan(dsdapan);
    console.log(dapan);
  };

  ////////// cách tính điểm /////////

  // trắc nghiệm :0.5
  // tự luận ngắn : 0-2
  //tự luận dài: 0-6;
  // ghi âm: 0-8;

  const nopbai = async () => {
    let diem = 0;
    let thangDiem = 0;
    let dapanCoPy = [...dapan];
    setalLoad(true);

    //// phần tính điểm
    for (let i = 0; i < dapan.length; i++) {
      if (dapanCoPy[i].type === 0) {
        if (dapanCoPy[i].dapAnHocVien === dapanCoPy[i].dapAn) {
          diem = diem + 0.5;
        }
        thangDiem = thangDiem + 0.5;
      } else if (dapanCoPy[i].type === 1 || dapanCoPy[i].type === 2) {
        if (dapanCoPy[i].type === 1) thangDiem = thangDiem + 2;
        else if (dapanCoPy[i].type === 2) thangDiem = thangDiem + 6;
        try {
          const data = {
            CauHoi: dapanCoPy[i].CauHoi,
            dapAnHocVien: dapanCoPy[i].dapAnHocVien,
            giaiThich: dapanCoPy[i].giaiThich,
            anh: dapanCoPy[i].anh,
            type: dapanCoPy[i].type,
          };
          const api = await fetch(`${BACKEND_URL}/api/chamDiemTuLuan`, {
            method: "POST",
            headers: {
              Authorization: Token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          const req = await api.json();
          if (req.trangThai === "tc") {
            diem = diem + Number(req.data.diemUocTinh);
            const newDapan = {
              ...dapanCoPy[i],
              loipheAI: req.data.loiNhanXet,
            };
            dapanCoPy[i] = newDapan;
          }
        } catch (err) {
          if (dapanCoPy[i].type === 1) diem = diem + 1;
          else if (dapanCoPy[i].type === 2) diem = diem + 3;
          const newDapan = {
            ...dapanCoPy[i],
            loipheAI: "hệ thống chấm điểm đang bị lỗi :((",
          };
          dapanCoPy[i] = newDapan;
        }
      } else if (dapanCoPy[i].type === 3) {
        //// tạo file ghi âm
        thangDiem = thangDiem + 8;

        if (dapanCoPy[i].dapAnHocVien !== undefined) {
          let fileChuanDeGui = dapanCoPy[i].fileBlob;

          if (typeof dapanCoPy[i].fileBlob === "string") {
            const response = await fetch(dapanCoPy[i].fileBlob);
            fileChuanDeGui = await response.blob();
          }
          const formData = new FormData();
          const tenFileAo = `bai_speaking_${Date.now()}_${Math.floor(Math.random() * 100)}.webm`;
          formData.append("fileGhiAm", fileChuanDeGui, tenFileAo);
          try {
            const api = await fetch(`${BACKEND_URL}/api/uploadAudio`, {
              method: "POST",
              body: formData,
            });
            const req = await api.json();
            console.log("upload thành công ");

            if (req.trangThai === "tc") {
              dapanCoPy[i].dapAnHocVien = req.linkAmThanh;
              try {
                const data = {
                  CauHoi: dapanCoPy[i].CauHoi,
                  dapAnHocVien: req.linkAmThanh,
                  giaiThich: dapanCoPy[i].giaiThich,
                  anh: dapanCoPy[i].anh,
                  type: dapanCoPy[i].type,
                };
                console.log(0);
                const api1 = await fetch(
                  `${BACKEND_URL}/api/chamDiemSpeaking`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: Token,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                  },
                );
                console.log(1);
                const req1 = await api1.json();
                if (req1.trangThai === "tc") {
                  diem = diem + Number(req1.data.diemUocTinh);
                  const newDapan = {
                    ...dapanCoPy[i],
                    loipheAI: req1.data.loiNhanXet,
                  };
                  dapanCoPy[i] = newDapan;
                  dapanCoPy[i].fileBlob = "";
                  dapanCoPy[i].linkAmThanh = "";
                }
              } catch (err) {
                console.log("gửi ai chấm speaking thất bại " + err);
                diem = diem + 4;
                const newDapan = {
                  ...dapanCoPy[i],
                  loipheAI: "hệ thống chấm điểm đang bị lỗi :((",
                };
                dapanCoPy[i] = newDapan;
                dapanCoPy[i].fileBlob = "";
                dapanCoPy[i].linkAmThanh = "";
              }
            }
          } catch (err) {
            console.log("upload that bại : " + err);

            diem = diem + 4;
            const newDapan = {
              ...dapanCoPy[i],
              loipheAI: "hệ thống chấm điểm đang bị lỗi :((",
            };
            dapanCoPy[i] = newDapan;
            dapanCoPy[i].fileBlob = "";
            dapanCoPy[i].linkAmThanh = "";
          }
        } else {
          const newDapan = {
            ...dapanCoPy[i],
            loipheAI: "bạn chưa trả lời câu hỏi này",
          };
          dapanCoPy[i] = newDapan;
          dapanCoPy[i].fileBlob = "";
          dapanCoPy[i].linkAmThanh = "";
        }
      }
      // 2. ÉP KIỂU: Nếu biến đang là chữ (link ảo) -> Tải nó thành file Blob thật
    }
    console.log(dapanCoPy);

    const diemtong = Math.floor((diem / thangDiem) * 10);
    console.log(diem);
    console.log(thangDiem);
    console.log(diemtong);

    //// phần nộp bài tập tổng quát
    try {
      const api = await fetch(`http://localhost:3000/api/nopBaiTap/${id}`, {
        method: "POST",
        headers: { Authorization: Token, "Content-Type": "application/json" },
        body: JSON.stringify({ diemUocTinh: diemtong }),
      });
      const req = await api.json();

      if (req.trangThai === "tc") {
        setalLoad(false);
        console.log("nop bai tap thanh cong");
        try {
          const api1 = await fetch(
            `http://localhost:3000/api/theChiTietBaiTapDaLam/${id}`,
            {
              method: "POST",
              headers: {
                Authorization: Token,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dapanCoPy),
            },
          );
          const req1 = await api1.json();
          if (req1.trangThai === "tc")
            console.log("them chi tiet bai tap da lam thanh cong");
          ChuyenTrang(-1);
        } catch (err) {
          console.log(
            "loi trong qua trinh them chi tiết bài tập dã làm :" + err,
          );
        }
      }
    } catch (err) {
      console.log("loi trong qua trinh them bai tap da lam :" + err);
    }
  };

  useEffect(() => {
    layData();
  }, []);

  return (
    <>
      <Header type="LBT" nopbai={nopbai} />

      <section className="mx-[10px] flex relative gap-3 ">
        {alLoad && <Load noiDung={"Cú đang chấm điểm bạn chờ chút nhé"} />}

        <Sidebar
          Type="bt"
          data={sidebarData}
          Chon={Chon}
          ClickChon={clickChon}
          dapAN={dapan}
        />
        <HV_box_bt
          loai={"lamBT"}
          dapan={dapan[Chon]}
          capNhatDapAn={capNhatDapAn}
          data={dataCauHoi[Chon]}
          Chon={Chon}
          ClickChon={clickChon}
        />
      </section>
    </>
  );
}
