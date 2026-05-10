import { useEffect, useRef, useState } from "react";
import Header from "./componan/header";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "./FileThongso";
import Alert from "./componan/aletr";
import { div, p } from "framer-motion/client";
import StickyBox from "react-sticky-box";

export default function QL_chiTietLuyenDe() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const { id } = useParams();

  const [DataLuyenDe, setDataLuyenDe] = useState<any>(null);

  // States for alerts/notifications
  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");
  const [Al_tenDe, setAL_TenDe] = useState(false);

  const Input_tenDe = useRef<HTMLInputElement>(null);
  const Input_tenBoDe = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const TatThongBao = () => {
    settb(false);
  };

  const layDataLD = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/luyen-de/${id}`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataLuyenDe(req.data);
        TaoData(req.data.kyNang);
      }
    } catch (err) {
      console.log("lay data luyen de thất bại :" + err);
    }
  };

  useEffect(() => {
    layDataLD();
  }, [id]);

  const xoaLuyenDe = async () => {
    // API xóa chưa làm, để đó hoặc hiển thị alert
    settb(true);
    settypeTB("w");
    setNdTB("Chức năng xóa luyện đề đang phát triển");
  };

  const luuTrangThai = async (trangT: string) => {
    // API cập nhật chưa làm, để đó hoặc hiển thị alert
    settb(true);
    settypeTB("ss");
    setNdTB(`Đã chuyển trạng thái thành: ${trangT} (Chức năng mẫu)`);
  };

  const [DataCauHoi, setDataCauHoi] = useState<any[]>([]);
  const TaoData = (skill: string) => {
    const kyNang = skill.toLowerCase();
    let DataCauHoi_Copy: any[] = [];
    console.log(kyNang);
    if (kyNang === "listening") {
      let socau = 1;
      // thêm dữ liệu part 1
      for (let i = 0; i < 6; i++) {
        const newdata = {
          idLuyenDe: id,
          tenPart: "Part 1",
          fileNghe: "",
          anh: "",
          type: 0,
          noiDungDoc: "",
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "Chưa nhập....",
              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        DataCauHoi_Copy.push(newdata);
        socau++;
      }
      // thêm dữ liệu part 2
      for (let i = 0; i < 25; i++) {
        const newdata = {
          idLuyenDe: id,
          tenPart: "Part 2",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 0,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "Chưa nhập....",

              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        socau++;

        DataCauHoi_Copy.push(newdata);
      }
      // thêm part 3
      for (let i = 0; i < 13; i++) {
        const newdata = {
          idLuyenDe: id,
          tenPart: "Part 3",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 0,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "Chưa nhập....",

              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "Chưa nhập....",

              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 2,
              cauHoi: "Chưa nhập....",

              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        socau = socau + 3;

        DataCauHoi_Copy.push(newdata);
      }
      /// part 4
      for (let i = 0; i < 10; i++) {
        const newdata = {
          idLuyenDe: id,
          tenPart: "Part 4",
          fileNghe: "",
          anh: "",
          noiDungDoc: "",
          type: 0,
          noiDungCauHoi: [
            {
              soCau: socau,
              cauHoi: "Chưa nhập....",

              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 1,
              cauHoi: "Chưa nhập....",

              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
            {
              soCau: socau + 2,
              cauHoi: "Chưa nhập....",

              a: "(A)",
              b: "(B)",
              c: "(C)",
              d: "(D)",
              dapAn: "",
              giaiThich: "",
            },
          ],
        };
        socau = socau + 3;

        DataCauHoi_Copy.push(newdata);
      }
    }
    setDataCauHoi(DataCauHoi_Copy);
  };

  const boxChoncauhoi = () => {
    let cauhoi: { part: string; slCau: number }[] = [];
    const kyNang = DataLuyenDe?.kyNang?.toLowerCase();

    if (kyNang === "listening") {
      cauhoi = [
        { part: "Part 1", slCau: 6 },
        { part: "Part 2", slCau: 25 },
        { part: "Part 3", slCau: 39 },
        { part: "Part 4", slCau: 30 },
      ];
    } else if (kyNang === "reading") {
      cauhoi = [
        { part: "Part 5", slCau: 30 },
        { part: "Part 6", slCau: 16 },
        { part: "Part 7", slCau: 54 },
      ];
    } else if (kyNang === "speaking") {
      cauhoi = [
        { part: "Câu 1-2", slCau: 2 },
        { part: "Câu 3-4", slCau: 2 },
        { part: "Câu 5-7", slCau: 3 },
        { part: "Câu 8-10", slCau: 3 },
        { part: "Câu 11", slCau: 1 },
      ];
    } else if (kyNang === "writing") {
      cauhoi = [
        { part: "Câu 1-5", slCau: 5 },
        { part: "Câu 6-7", slCau: 2 },
        { part: "Câu 8", slCau: 1 },
      ];
    }

    let tongSoCauTruoc = 0;

    return (
      <StickyBox
        offsetTop={70}
        offsetBottom={20}
        className="w-[350px] border border-black/20 h-fit p-[20px] bg-white rounded-[10px] sticky ofse shrink-0"
      >
        <div className="w-full flex justify-center items-center">
          <p className="font-medium text-[#2f6169]">
            Danh sách câu hỏi các part
          </p>
        </div>
        <div className="border border-b-black/20 my-[10px]"></div>

        {cauhoi.map((item, index) => {
          const startIndex = tongSoCauTruoc;
          tongSoCauTruoc += item.slCau;

          return (
            <div
              key={index}
              className="w-full pb-[15px] mb-[10px] border-b border-b-black/10 last:border-b-0 last:mb-0 last:pb-0"
            >
              <p className="font-bold text-[#2f6169] mb-2">{item.part}</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: item.slCau }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[35px] h-[35px] flex justify-center items-center rounded-[5px]  text-[13px] text-[#2f6169] bg-[#d7e8ec] font-medium cursor-pointer transition-all hover:bg-[#4aa4a7] hover:text-white"
                  >
                    {startIndex + i + 1}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {cauhoi.length === 0 && (
          <p className="text-center text-black/50 italic py-4">
            Đang tải cấu trúc đề...
          </p>
        )}
      </StickyBox>
    );
  };

  const [alPart, setalPart] = useState("");

  const inPrat = (index: number) => {
    if (index === 1) {
      return (
        <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
          Part 1
        </p>
      );
    } else if (index === 7) {
      return (
        <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
          Part 2
        </p>
      );
    } else if (index === 32) {
      return (
        <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
          Part 3
        </p>
      );
    } else if (index === 45) {
      return (
        <p className="my-[10px] text-[25px] font-bold text-[#2f6169] border-t-black/20 border-b border-b-black/20">
          Part 4
        </p>
      );
    }
    return;
  };

  //   ////////////////////MAIN ////////////////////////////

  return (
    <>
      <Header type="khien" />
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      <section className="mx-[50px] my-[20px]">
        {/* phần box trên cùng */}
        <div className="w-full p-[20px] border border-black/20 rounded-[20px] flex flex-col gap-5">
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="w-[70px] h-[70px] bg-[#d7e8ec] rounded-[10px] flex justify-center items-center shrink-0">
                <img
                  className="w-[80%]"
                  src="https://img.icons8.com/?size=100&id=rYkEZD1xSmKa&format=png&color=2f6169"
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center">
                <input
                  key={DataLuyenDe ? DataLuyenDe._id : "loading"}
                  ref={Input_tenDe}
                  defaultValue={`${DataLuyenDe?.tenDe ? DataLuyenDe.tenDe : "Tên luyện đề"}`}
                  className={`text-[25px] font-bold text-[#306263] p-[5px] border rounded-[10px] w-[500px] outline-none ${Al_tenDe ? "border-red-500 bg-red-50" : "border-black/20"}`}
                  type="text"
                  placeholder="Nhập tên luyện đề"
                />
                <div className="flex gap-4 mt-1 ml-1 text-black/70">
                  <p className="font-bold">
                    Kỹ năng:{" "}
                    <span className="uppercase text-[#2f6169]">
                      {DataLuyenDe?.kyNang || "N/A"}
                    </span>
                  </p>
                  <p>|</p>
                  <p>
                    Ngày tạo / Update: {DataLuyenDe?.ngayTao || "Đang tải..."}
                  </p>
                </div>
              </div>
            </div>
            <input
              key={DataLuyenDe ? DataLuyenDe._id : "loading-bode"}
              ref={Input_tenBoDe}
              defaultValue={`${DataLuyenDe?.tenBoDe || ""}`}
              className={`text-[25px] text-right shrink-0 font-bold text-[#306263] p-[5px] border rounded-[10px] w-[250px] outline-none ${Al_tenDe ? "border-red-500 bg-red-50" : "border-black/10"}`}
              placeholder="Nhập tên bộ đề"
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              <div className="border border-black/20 px-[20px] py-[10px] rounded-[10px] min-w-[150px] text-center font-bold bg-white text-[#2A6770]">
                {DataLuyenDe?.trangThai || "Bản Nháp"}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={xoaLuyenDe}
                className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] hover:bg-[#fee2e2] rounded-[10px] text-[#8f3533] font-bold"
              >
                Xóa luyện đề
              </button>
              <button
                onClick={() => luuTrangThai("Bản Nháp")}
                className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] border border-[#2f6169] rounded-[10px] text-[#2f6169] font-bold hover:bg-[#f0f7f8]"
              >
                Lưu bản nháp
              </button>
              <button
                onClick={() => luuTrangThai("Đã Tạo")}
                className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] bg-gradient-to-t from-[#308d90] to-[#a8f8fb] drop-shadow-[0_0_5px_rgb(0,0,0,0.2)] rounded-[10px] text-white font-bold"
              >
                Xuất bản
              </button>
            </div>
          </div>
        </div>
        <div className="border border-b-black/20 my-[20px]"></div>
        <div className="w-full flex gap-4 items-start">
          {boxChoncauhoi()}
          <div className="w-full flex flex-col gap-2">
            {DataCauHoi?.map((items, index) => (
              <div>
                {inPrat(index + 1)}
                <div
                  key={items}
                  className="w-full bg-white p-[20px] border border-black/20 rounded-[10px] flex flex-col gap-5"
                >
                  {/* nội dung câu hỏi */}
                  {items.anh !== "" && (
                    <div className="w-full justify-center flex ">
                      <div className="w-[300px] aspect-[4/3] overflow-hidden  rounded-[20px] flex justify-center items-center">
                        <img
                          className="w-full  object-contain"
                          src={`${items.anh}`}
                          alt=""
                        />
                      </div>
                    </div>
                  )}
                  {items.fileNghe !== "" && (
                    <div className="w-full justify-center flex ">
                      <audio controls>
                        <source src={`${items.fileNghe}`} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}
                  {items.noiDungDoc !== "" && (
                    <p className="w-full whitespace-prev-line"></p>
                  )}
                  {items.noiDungCauHoi?.map((items2: any) => (
                    <div className=" flex flex-col gap-2">
                      <p className="font-medium">
                        Câu hỏi {items2.soCau} : {items2.cauHoi}
                      </p>
                      {items.type === 0 && (
                        <div className="flex flex-col gap-4">
                          <div className="flex ">
                            <div className="w-full flex gap-2 items-center">
                              <div
                                className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 `}
                              />
                              <p>{items2.a}</p>
                            </div>
                            <div className="w-full flex gap-2 items-center">
                              <div
                                className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 `}
                              />
                              <p>{items2.b}</p>
                            </div>
                          </div>
                          <div className="flex ">
                            <div className="w-full flex gap-2 items-center">
                              <div
                                className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30`}
                              />
                              <p>{items2.c}</p>
                            </div>
                            <div className="w-full flex gap-2 items-center">
                              <div
                                className={`w-[15px] h-[15px] shrink-0 rounded-[50%] border-[1px] border-black/30 `}
                              />
                              <p>{items2.d}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <p>Giải thích</p>
                      <div className="p-[10px] w-full rounded-[10px] bg-[#d7e8eca1]">
                        {items2.giaiThich === "" ? (
                          <p>Chưa thêm giải thích</p>
                        ) : (
                          <p className="whitespace-pre-line"></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
