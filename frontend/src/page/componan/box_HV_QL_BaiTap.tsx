import { div, p } from "framer-motion/client";
import { useEffect, useState } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import Alert from "./aletr";

export default function Box_HV_QL_BaiTap() {
  const [Token, setToken] = useState(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const [Data, setData] = useState<any[]>([]);

  const chuyenTrang = useNavigate();

  const [alData, setalData] = useState(true);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const { id } = useParams();

  const TatThongBao = () => {
    settb(false);
  };

  const layData = async () => {
    try {
      console.log(1);
      const api = await fetch(`http://localhost:3000/api/layBaiTap/${id}`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setalData(false);
        const xacnhanNop = req.data;
        let themVaoData = [];
        for (let i = 0; i < xacnhanNop.length; i++) {
          try {
            if (xacnhanNop[i].trangThai === "Đã Tạo") {
              const api1 = await fetch(
                `http://localhost:3000/api/layBaiTapDaLam/${xacnhanNop[i]._id}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: Token,
                    "Content-Type": "application/json",
                  },
                },
              );
              const req1 = await api1.json();
              if (req1.trangThai === "tc") {
                const dataThem = {
                  _id: xacnhanNop[i]._id,
                  idLopHoc: xacnhanNop[i].idLopHoc,
                  TenBT: xacnhanNop[i].TenBT,
                  EmailNGuoiTao: xacnhanNop[i].EmailNGuoiTao,
                  hanNop: xacnhanNop[i].hanNop,
                  ngayTao: xacnhanNop[i].ngayTao,
                  diemUocTinh: req1.data.diemUocTinh,
                  diemChinhThuc: req1.data.diemChinhThuc,
                  ngayNop: req1.data.ngayNop,
                };
                themVaoData.push(dataThem);
              } else if (req1.trangThai === "hh") {
                settb(true);
                settypeTB("w"); // w , err
                setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
              } else {
                const dataThem = {
                  _id: xacnhanNop[i]._id,
                  idLopHoc: xacnhanNop[i].idLopHoc,
                  TenBT: xacnhanNop[i].TenBT,
                  EmailNGuoiTao: xacnhanNop[i].EmailNGuoiTao,
                  hanNop: xacnhanNop[i].hanNop,
                  ngayTao: xacnhanNop[i].ngayTao,
                  diemUocTinh: "null",
                  diemChinhThuc: "null",
                  ngayNop: "chưa nộp",
                };
                themVaoData.push(dataThem);
              }
            }
          } catch (err) {
            console.log("xac nhan nop that bai : " + err);
          }
        }
        setData(themVaoData);
      } else if (req.trangThai === "ktt") {
        setalData(true);
      }
    } catch (err) {
      console.log("lay data that bai " + err);
    }
  };

  const checkHanNop = (hannop: string) => {
    const dateNow = new Date();

    const han = new Date(hannop);

    if (dateNow > han) return true;
    else return false;
  };

  useEffect(() => {
    layData();
  }, []);
  return (
    <section className="w-full">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      {alData ? (
        <p className="w-full text-center">Hiện chưa có bài tập nào 😘</p>
      ) : (
        <div className="flex flex-col gap-3">
          {Data?.toReversed().map((items) => (
            <div>
              {items.trangThai}
              <div
                onClick={() => {
                  if (
                    items.ngayNop === "chưa nộp" &&
                    checkHanNop(items.hanNop)
                  ) {
                    settb(true);
                    settypeTB("err"); // w , err
                    setNdTB("Bài tập hết hạn nộp bài");
                  } else if (
                    items.ngayNop === "chưa nộp" &&
                    !checkHanNop(items.hanNop)
                  ) {
                    chuyenTrang(`/chiTietBaiTap/${items._id}`);
                  } else {
                    chuyenTrang(`/theChiTietBaiTapDaLam/${items._id}`);
                  }
                }}
                key={items._id}
                className=" cursor-pointer flex flex-col gap-3 p-[10px] transition-all duration-300 hover:scale-[1.005] bg-[#13474b] rounded-[10px]"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-[50px] h-[50px] bg-[#fcffff] rounded-[50%] flex justify-center items-center">
                    <img
                      className="w-[60%]"
                      src="https://img.icons8.com/?size=100&id=7lq2aqxqdO78&format=png&color=13474b"
                      alt=""
                    />
                  </div>
                  <p className="font-bold text-[20px] text-white">
                    {items.TenBT}
                  </p>
                  {items.ngayNop !== "chưa nộp" ? (
                    <div className="px-[10px] py-[5px] items-center rounded-[5px] bg-[#28a653] text-white text-[10px] font-medium flex gap-1">
                      <img
                        className="w-[18px] h-[18px]"
                        src="https://img.icons8.com/?size=100&id=98955&format=png&color=ffffff"
                        alt=""
                      />
                      da nop
                    </div>
                  ) : (
                    <div>
                      {checkHanNop(items.hanNop) && (
                        <div className="px-[10px] py-[5px] items-center rounded-[5px] bg-red-600 text-white text-[10px] font-medium flex gap-1">
                          <img
                            className="w-[18px] h-[18px]"
                            src="https://img.icons8.com/?size=100&id=79023&format=png&color=ffffff"
                            alt=""
                          />
                          đã hết hạn
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="w-full px-[20px] py-[10px] bg-white rounded-[10px] flex justify-between">
                  <div>
                    <p className="opacity-[50%]">ngay nop</p>
                    <p className="font-medium">{items.ngayNop.split("T")[0]}</p>
                  </div>
                  <div>
                    <p className="opacity-[50%]">Han nop</p>

                    <p className="font-medium">{items.hanNop.split("T")[0]}</p>
                  </div>
                  <div>
                    <p className="opacity-[50%]">diem uoc tinh</p>
                    <p className="font-medium">{items.diemUocTinh}/10</p>
                  </div>
                  <div>
                    <p className="opacity-[50%]">Diem chinh thuc</p>
                    <p className="font-medium">{items.diemChinhThuc}/10</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
