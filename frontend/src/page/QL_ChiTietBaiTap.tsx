import { useEffect, useRef, useState } from "react";
import Header from "./componan/header";
import Box_ChiTietCauHoi from "./componan/box_ChiTietCauHoi";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "./FileThongso";
import { floor } from "firebase/firestore/pipelines";
import { div } from "framer-motion/client";
import Alert from "./componan/aletr";
import BoxXacNhan from "./componan/BoxXacNhan";

export default function QL_ChiTietBaiTap() {
  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });
  const [Dr_GiaHan, setDr_GiaHan] = useState(false);
  const [Text_GiaHan, setText_GiaHan] = useState("Gia Hạn");

  const [Dr_TypeCauHoi, setDr_TypeCauHoi] = useState(false);
  const [Text_TypeCauHoi, setText_TypeCauHoi] = useState("Trắc nghiệm");

  const { id } = useParams();

  const [DataCauHoi, setDataCauHoi] = useState<any[]>([]);
  const [DataBaiTap, setDataBaiTap] = useState<any>(null);
  const [DataHVNopBai, setDataHVNopBai] = useState<any[]>([]);

  const [boxThemCauHoi, setboxThemCauHoi] = useState(false);

  const [ChonDA, setChonDa] = useState("a");

  const Input_CauHoi = useRef<HTMLTextAreaElement>(null);
  const Input_LinkAnh = useRef<HTMLInputElement>(null);
  const Input_LinkAmThanh = useRef<HTMLInputElement>(null);
  const Input_DapAnA = useRef<HTMLInputElement>(null);
  const Input_DapAnB = useRef<HTMLInputElement>(null);
  const Input_DapAnC = useRef<HTMLInputElement>(null);
  const Input_DapAnD = useRef<HTMLInputElement>(null);
  const Input_GiaiThich = useRef<HTMLTextAreaElement>(null);
  const Input_tenBT = useRef<HTMLInputElement>(null);

  const [Text_CauHoi, setText_CauHoi] = useState("");
  const [Text_LinkAnh, setText_LinkAnh] = useState("");
  const [Text_LinkAmThanh, setText_LinkAmThanh] = useState("");
  const [Text_DapAnA, setText_DapAnA] = useState("");
  const [Text_DapAnB, setText_DapAnB] = useState("");
  const [Text_DapAnC, setText_DapAnC] = useState("");
  const [Text_DapAnD, setText_DapAnD] = useState("");
  const [Text_GiaiThich, setText_GiaiThich] = useState("");

  const [Al_CauHoi, setAl_CauHoi] = useState(false);
  const [Al_DapAnA, setAl_DapAnA] = useState(false);
  const [Al_DapAnB, setAl_DapAnB] = useState(false);
  const [Al_DapAnC, setAl_DapAnC] = useState(false);
  const [Al_DapAnD, setAl_DapAnD] = useState(false);
  const [Al_GiaiThich, setAl_GiaiThich] = useState(false);
  const [AL_Data_HV, setAL_Data_HV] = useState(false);
  const [Al_tenBT, setAL_TenBT] = useState(false);

  const [Loai, setLoai] = useState("Thêm");
  const [indexCan, setindexCan] = useState(0);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const ChuyenTrang = useNavigate();

  const xoaBaiTap = async () => {
    try {
      const apiXoaBT = await fetch(`${BACKEND_URL}/xoaBaiTap/${id}`, {
        method: "DELETE",
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const reqXoaBT = await apiXoaBT.json();
      if (reqXoaBT.trangThai === "tc") {
        const apiXoaChiTietBaiTap = await fetch(
          `${BACKEND_URL}/xoaChiTieBaiTap/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: Token,
              "Content-Type": "application/json",
            },
          },
        );
        const reqXoaChiTietBaiTap = await apiXoaChiTietBaiTap.json();
        if (reqXoaChiTietBaiTap.trangThai === "tc") {
          ChuyenTrang(-1);
        } else if (reqXoaBT.trangThai === "tb") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Xóa Câu hỏi THẤT BẠI");
        } else if (reqXoaBT.trangThai === "kdtq") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
        } else if (reqXoaBT.trangThai === "hh") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
        }
      } else if (reqXoaBT.trangThai === "tb") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Xóa bài tập THẤT BẠI");
      } else if (reqXoaBT.trangThai === "kdtq") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
      } else if (reqXoaBT.trangThai === "hh") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      }
    } catch (err) {
      console.error("loi khi xoa bài tập :  " + err);
    }
  };

  const GiaoBai = async (trangT: string) => {
    const tenBT = Input_tenBT.current?.value.trim() || "";
    if (tenBT === "") setAL_TenBT(true);
    else {
      setAL_TenBT(false);
      try {
        const dataBT = {
          hanNop: Text_GiaHan,
          trangThai: trangT,
          TenBT: tenBT,
        };
        const apiCapNhatBaiTap = await fetch(
          `${BACKEND_URL}/updateBaiTap/${id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: Token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataBT),
          },
        );
        const reqBaiTap = await apiCapNhatBaiTap.json();
        if (reqBaiTap.trangThai === "tc") {
          const apiXoaChiTietBaiTap = await fetch(
            `${BACKEND_URL}/xoaChiTieBaiTap/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: Token,
                "Content-Type": "application/json",
              },
            },
          );
          const reqXoaChiTietBaiTap = await apiXoaChiTietBaiTap.json();
          if (reqXoaChiTietBaiTap.trangThai === "tc") {
            console.log("check");
            const apiThemChiTietBT = await fetch(
              `${BACKEND_URL}/api/themChiTietBaiTap`,
              {
                method: "POST",
                headers: {
                  Authorization: Token,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(DataCauHoi),
              },
            );
            const reqThemChiTietBT = await apiThemChiTietBT.json();
            if (reqThemChiTietBT.trangThai === "tc") {
              ChuyenTrang(-1);
            } else if (reqThemChiTietBT.trangThai === "tb") {
              settb(true);
              settypeTB("err"); // w , err
              setNdTB("Thêm chi tiết bài tập cũ THẤT BẠI");
            } else if (reqThemChiTietBT.trangThai === "kdtq") {
              settb(true);
              settypeTB("err"); // w , err
              setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
            } else if (reqThemChiTietBT.trangThai === "hh") {
              settb(true);
              settypeTB("err"); // w , err
              setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
            }
          } else if (reqXoaChiTietBaiTap.trangThai === "tb") {
            settb(true);
            settypeTB("err"); // w , err
            setNdTB("xóa chi tiết bài tập cũ THẤT BẠI");
          } else if (reqXoaChiTietBaiTap.trangThai === "kdtq") {
            settb(true);
            settypeTB("err"); // w , err
            setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
          } else if (reqXoaChiTietBaiTap.trangThai === "hh") {
            settb(true);
            settypeTB("err"); // w , err
            setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
          }
        } else if (reqBaiTap.trangThai === "tb") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Cập nhật bài tập THẤT BẠI");
        } else if (reqBaiTap.trangThai === "kdtq") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
        } else if (reqBaiTap.trangThai === "hh") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
        }
      } catch (err) {
        console.error("giao bài tập thất bại :" + err);
      }
    }
  };

  const layDataBT = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/layTTBaiTap/${id}`);
      const req = await api.json();
      setDataBaiTap(req.data);
    } catch (err) {
      console.log("lay data bt thất bại :" + err);
    }
  };

  const layDataCH = async () => {
    try {
      const api = await fetch(
        `${BACKEND_URL}/api/LatDanhSachChiTietBaiTap/${id}`,
      );
      const req = await api.json();
      if (req.trangThai === "tc") {
        setDataCauHoi(req.data);
      }
    } catch (err) {
      console.log("lay data  câu hỏi thất bại : " + err);
    }
  };

  const layDataHV = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/layDsHVdaNopBT/${id}`);
      const req = await api.json();
      if (req.trangThai === "tc") {
        setAL_Data_HV(false);
        setDataHVNopBai(req.data);
      } else if (req.trangThai === "ktt") {
        setAL_Data_HV(true);
      }
    } catch (err) {
      console.log("lấy data học viên thất bại : " + err);
    }
  };

  const ThemLuu = () => {
    const CauHoi = Input_CauHoi.current?.value.trim() || "";
    const LinkAnh = Input_LinkAnh.current?.value.trim() || "";
    const LinkAmThanh = Input_LinkAmThanh.current?.value.trim() || "";
    const DapAnA = Input_DapAnA.current?.value.trim() || "";
    const DapAnB = Input_DapAnB.current?.value.trim() || "";
    const DapAnC = Input_DapAnC.current?.value.trim() || "";
    const DapAnD = Input_DapAnD.current?.value.trim() || "";
    const GiaiThich = Input_GiaiThich.current?.value.trim() || "";

    let check = 0;
    // xác nhận dữ liệu troongs
    if (CauHoi === "") {
      setAl_CauHoi(true);
      check++;
    } else setAl_CauHoi(false);
    if (GiaiThich === "") {
      setAl_GiaiThich(true);
      check++;
    } else setAl_GiaiThich(false);
    if (Text_TypeCauHoi === "Trắc nghiệm") {
      if (DapAnA === "") {
        setAl_DapAnA(true);
        check++;
      } else setAl_DapAnA(false);
      if (DapAnB === "") {
        setAl_DapAnB(true);
        check++;
      } else setAl_DapAnB(false);
      if (DapAnC === "") {
        setAl_DapAnC(true);
        check++;
      } else setAl_DapAnC(false);
      if (DapAnD === "") {
        setAl_DapAnD(true);
        check++;
      } else setAl_DapAnD(false);
    }
    // ////////////////////
    if (check === 0) {
      // Thêm câu hỏi
      let type = 0;
      if (Text_TypeCauHoi === "Trắc nghiệm") type = 0;
      else if (Text_TypeCauHoi === "Tự Luận ngắn") type = 1;
      else if (Text_TypeCauHoi === "Tự luận") type = 2;
      else if (Text_TypeCauHoi === "Ghi âm") type = 3;
      const newCauHoi = {
        idBaiTap: id,
        CauHoi: CauHoi,
        type: type,
        a: DapAnA,
        b: DapAnB,
        c: DapAnC,
        d: DapAnD,
        fileNghe: LinkAmThanh,
        anh: LinkAnh,
        dapAn: ChonDA,
        giaiThich: GiaiThich,
      };
      if (Loai === "Thêm") {
        setDataCauHoi((prev) => [...prev, newCauHoi]);
        setboxThemCauHoi(false);
        reloadInput();
      } else if (Loai === "Chèn") {
        const DataCopy = [...DataCauHoi];
        for (let i = DataCopy.length - 1; i >= indexCan; i--) {
          DataCopy[i + 1] = DataCopy[i];
        }
        DataCopy[indexCan] = newCauHoi;
        setDataCauHoi(DataCopy);
        setboxThemCauHoi(false);
        reloadInput();
      } else if (Loai === "Sửa") {
        const DataCopy = [...DataCauHoi];
        DataCopy[indexCan] = newCauHoi;
        setDataCauHoi(DataCopy);
        setboxThemCauHoi(false);
        reloadInput();
      }
    }
  };

  const reloadInput = () => {
    setText_CauHoi("");
    setText_LinkAnh("");
    setText_LinkAmThanh("");
    setText_DapAnA("");
    setText_DapAnB("");
    setText_DapAnC("");
    setText_DapAnD("");
    setText_GiaiThich("");
  };

  const xoa = (indexXoa: number) => {
    setDataCauHoi((prev) => prev.filter((_, index) => index !== indexXoa));
  };

  const sua = (indexHT: number) => {
    setLoai("Sửa");
    setindexCan(indexHT);
    setText_CauHoi(DataCauHoi[indexHT].CauHoi);
    setText_LinkAnh(DataCauHoi[indexHT].anh);
    setText_LinkAmThanh(DataCauHoi[indexHT].fileNghe);
    setText_DapAnA(DataCauHoi[indexHT].a);
    setText_DapAnB(DataCauHoi[indexHT].b);
    setText_DapAnC(DataCauHoi[indexHT].c);
    setText_DapAnD(DataCauHoi[indexHT].d);
    setText_GiaiThich(DataCauHoi[indexHT].giaiThich);
    setChonDa(DataCauHoi[indexHT].dapAn);
    if (DataCauHoi[indexHT].type === 0) setText_TypeCauHoi("Trắc nghiệm");
    else if (DataCauHoi[indexHT].type === 1) setText_TypeCauHoi("Tự Luận ngắn");
    else if (DataCauHoi[indexHT].type === 2) setText_TypeCauHoi("Tự luận");
    else if (DataCauHoi[indexHT].type === 3) setText_TypeCauHoi("Ghi âm");
    setboxThemCauHoi(true);
  };

  const xuong = (indexHT: number) => {
    if (indexHT + 1 < DataCauHoi.length) {
      const DataCopy = [...DataCauHoi];
      const a = DataCopy[indexHT];
      DataCopy[indexHT] = DataCopy[indexHT + 1];
      DataCopy[indexHT + 1] = a;
      setDataCauHoi(DataCopy);
    }
  };

  const len = (indexHT: number) => {
    if (indexHT - 1 >= 0) {
      const DataCopy = [...DataCauHoi];
      const a = DataCopy[indexHT];
      DataCopy[indexHT] = DataCopy[indexHT - 1];
      DataCopy[indexHT - 1] = a;
      setDataCauHoi(DataCopy);
    }
  };
  const [xn, setxn] = useState(false);
  const tatxn = () => {
    setxn(false);
  };
  useEffect(() => {
    layDataBT();
    layDataCH();
    layDataHV();
  }, []);

  return (
    <>
      <Header type="khien" />
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      {xn && (
        <BoxXacNhan
          tat={tatxn}
          xoa={xoaBaiTap}
          noiDung="Xác nhận xóa bài tập"
        />
      )}
      <section className="  mx-[50px] my-[20px]">
        {/* phần box trên cùng */}
        <div className="w-full p-[20px] border border-black/20 rounded-[20px] flex flex-col gap-5">
          <div className="flex gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="w-[70px] h-[70px] bg-[#d7e8ec] rounded-[10px] flex justify-center items-center">
                <img
                  className="w-[80%]"
                  src="https://img.icons8.com/?size=100&id=rYkEZD1xSmKa&format=png&color=2f6169"
                  alt=""
                />
              </div>
              <div>
                <input
                  key={DataBaiTap}
                  ref={Input_tenBT}
                  defaultValue={`${DataBaiTap?.TenBT || "Tên bài tập"}`}
                  className={`text-[25px] font-bold text-[#306263] p-[5px] border  rounded-[10px] w-[500px] ${Al_tenBT ? `border-red-500 bg-red-50` : `border-black/20`}`}
                  type="text"
                />
                <div className=" flex gap-4 text-black/70">
                  <p>{DataBaiTap?.EmailNGuoiTao || "EmailNGuoiTao"}</p>
                  <p>|</p>
                  <p>
                    ngày tạo / update:{" "}
                    {DataBaiTap?.ngayTao.split("T")[0] || "ngày tạo"}
                  </p>
                  <p>|</p>
                  <p>
                    hạn nộp: {DataBaiTap?.hanNop.split("T")[0] || "hạn nộp"}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[30px] text-[#2f6169] font-bold">
              {DataCauHoi.length} Câu hỏi
            </p>
          </div>
          {/* //////////////////// */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="border border-black/20 px-[20px] py-[10px] rounded-[10px] w-[150px] text-center">
                {DataBaiTap?.trangThai}
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDr_GiaHan(true);
                }}
                className="border border-black/20 px-[20px] py-[10px] rounded-[10px] w-[200px] flex items-center justify-between relative cursor-pointer"
              >
                <p>{Text_GiaHan}</p>
                <img
                  className={`h-[25px] absolute right-[20px] transition-all duration-300 ${Dr_GiaHan ? `rotate-0` : `rotate-[90deg]`}`}
                  src="https://img.icons8.com/?size=100&id=85123&format=png&color=000000"
                  alt=""
                />
                {Dr_GiaHan && (
                  <div className="bg-black">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setDr_GiaHan(false);
                      }}
                      className="w-screen h-screen  fixed z-[2] top-0 left-0"
                    ></div>
                    <div className="w-full border border-black/20 rounded-[10px] py-[10px] z-[3] absolute top-[45px] bg-white left-0">
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDr_GiaHan(false);
                          setText_GiaHan(`3 ngày`);
                        }}
                        className="px-[10px] transition-all duration-300 hover:bg-[#d7e8ec] py-[5px] cursor-pointer"
                      >
                        3 ngày
                      </p>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDr_GiaHan(false);
                          setText_GiaHan(`5 ngày`);
                        }}
                        className="px-[10px] transition-all duration-300 hover:bg-[#d7e8ec] py-[5px] cursor-pointer"
                      >
                        5 ngày
                      </p>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDr_GiaHan(false);
                          setText_GiaHan(`7 ngày`);
                        }}
                        className="px-[10px] transition-all duration-300 hover:bg-[#d7e8ec] py-[5px] cursor-pointer"
                      >
                        7 ngày
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setxn(true);
                }}
                className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] hover:bg-[#fee2e2] rounded-[10px] text-[#8f3533] font-bold"
              >
                Xóa bài tập
              </button>
              <button
                onClick={() => {
                  GiaoBai("Bản Nháp");
                }}
                className="transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px] border border-[#2f6169] rounded-[10px] text-[#2f6169] font-bold"
              >
                Lưu bản nháp
              </button>
              <button
                onClick={() => {
                  GiaoBai("Đã Tạo");
                }}
                className=" transition-all duration-300 hover:scale-[1.05] px-[20px] py-[10px]  bg-gradient-to-t from-[#308d90] to-[#a8f8fb] drop-shadow-[0_0_5px_rgb(0,0,0,0.2)] rounded-[10px] text-white font-bold"
              >
                Giao bài tập
              </button>
            </div>
          </div>
        </div>
        {/* /////////// */}
        {/* phần dấu gạch chân */}
        <div className="border border-b-black/20 my-[20px]"></div>

        <div className="w-full  flex gap-2 ">
          {/* phần danh sách học viên */}
          <div className="w-[350px] border border-black/20 h-fit p-[20px] bg-white rounded-[10px] shrink-0">
            <div className="w-full flex justify-between items-center">
              <p className="font-medium text-[#2f6169]">
                Danh sách học viên đã nộp bài
              </p>
              <p>({DataHVNopBai?.length || "0"}/30)</p>
            </div>
            <div className="border border-b-black/20 my-[10px]"></div>
            {AL_Data_HV && (
              <p className="w-full text-center text-black/75 text-[14px]">
                hiện chưa có Học viên nào nộp bài tập
              </p>
            )}
            {/* hiển thị danh sách học viên */}
            {DataHVNopBai?.toReversed().map((items) => (
              <div
                onClick={() => {
                  ChuyenTrang(`/QL_ChamDiemBT/${id}/${items.Email}`);
                }}
                className="flex-col gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] w-full p-[10px] bg-[#2f6169] text-white rounded-[10px] flex justify-between items-center"
              >
                <div className="w-full">
                  <p className=" font-bold">{items.Email}</p>
                  <p className="text-[14px]">{items.ngayNop.split("T")[0]}</p>
                </div>
                <div className="w-full shrink-0 text-[13px] p-[5px] bg-[#ffffff] rounded-[5px] text-black">
                  <p>Điểm ước tính: ({items.diemUocTinh}/10) </p>
                  <p>Điểm chính thức: ({items.diemChinhThuc}/10) </p>
                </div>
              </div>
            ))}
          </div>
          {/* phần danh sách câu hỏi */}
          <div className="w-full flex flex-col gap-3  ">
            {DataCauHoi?.map((items, index) => (
              <div key={index} className="flex gap-3 flex-col">
                <div
                  onClick={() => {
                    setLoai("Chèn");
                    setboxThemCauHoi(true);
                    setindexCan(index);
                  }}
                  className="w-full relative flex items-center opacity-0 hover:opacity-[1] cursor-pointer transition-all duration-300"
                >
                  {/* đường gạch thêm câu hỏi */}
                  <div className="w-[20px] rounded-[50%] h-[20px] absolute left-0 bg-[#2f6169] flex justify-center items-center ">
                    <img
                      className="w-[60%]"
                      src="https://img.icons8.com/?size=100&id=3220&format=png&color=f7f7f7"
                      alt=""
                    />
                  </div>
                  <div className="w-full h-[5px] bg-[#2f6169] rounded-[5px]"></div>
                </div>
                {/* phần box câu hỏi */}
                <Box_ChiTietCauHoi
                  xuong={xuong}
                  len={len}
                  xoa={xoa}
                  items={items}
                  index={index}
                  sua={sua}
                />
              </div>
            ))}
            <div
              onClick={() => {
                setboxThemCauHoi(true);
                setLoai("Thêm");
              }}
              className="transition-all duration-300 hover:scale-[1.008] border border-black/30 text-[15px] font-medium cursor-pointer text-center rounded-[10px] py-[5px] w-full"
            >
              + Thêm câu hỏi
            </div>
          </div>
        </div>
      </section>
      {/* box thêm câu hỏi */}
      {boxThemCauHoi && (
        <div className="w-screen h-screen bg-black/50 fixed top-0 left-0 z-[2] flex justify-center items-center">
          <div className="w-[1100px] p-[20px] bg-white rounded-[10px]">
            {/* thanh phía trên */}
            <div className="flex justify-between">
              {/*  dr type */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDr_TypeCauHoi(true);
                }}
                className="border border-black/20 px-[20px] py-[10px] rounded-[10px] w-[200px] flex items-center justify-between relative cursor-pointer"
              >
                <p>{Text_TypeCauHoi}</p>
                <img
                  className={`h-[25px] absolute right-[20px] transition-all duration-300 ${Dr_TypeCauHoi ? `rotate-0` : `rotate-[90deg]`}`}
                  src="https://img.icons8.com/?size=100&id=85123&format=png&color=000000"
                  alt=""
                />
                {Dr_TypeCauHoi && (
                  <div className="bg-black">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setDr_TypeCauHoi(false);
                      }}
                      className="w-screen h-screen  fixed z-[2] top-0 left-0"
                    ></div>
                    <div className="w-full border border-black/20 rounded-[10px] py-[10px] z-[3] absolute top-[45px] bg-white left-0">
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDr_TypeCauHoi(false);
                          setText_TypeCauHoi(`Trắc nghiệm`);
                        }}
                        className="px-[10px] transition-all duration-300 hover:bg-[#d7e8ec] py-[5px] cursor-pointer"
                      >
                        Trắc nghiệm
                      </p>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDr_TypeCauHoi(false);
                          setText_TypeCauHoi(`Tự Luận ngắn`);
                        }}
                        className="px-[10px] transition-all duration-300 hover:bg-[#d7e8ec] py-[5px] cursor-pointer"
                      >
                        Tự Luận ngắn
                      </p>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDr_TypeCauHoi(false);
                          setText_TypeCauHoi(`Tự luận`);
                        }}
                        className="px-[10px] transition-all duration-300 hover:bg-[#d7e8ec] py-[5px] cursor-pointer"
                      >
                        Tự luận
                      </p>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          setDr_TypeCauHoi(false);
                          setText_TypeCauHoi(`Ghi âm`);
                        }}
                        className="px-[10px] transition-all duration-300 hover:bg-[#d7e8ec] py-[5px] cursor-pointer"
                      >
                        Ghi âm
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 font-bold">
                <button
                  onClick={() => {
                    setboxThemCauHoi(false);
                    reloadInput();
                  }}
                  className="px-[30px] py-[10px] border border-black/20 rounded-[10px]"
                >
                  hủy
                </button>
                <button
                  onClick={() => {
                    ThemLuu();
                  }}
                  className="px-[30px] py-[10px] bg-[#154e56] text-white rounded-[10px]"
                >
                  {Loai}
                </button>
              </div>
            </div>
            {/* thanh ngang */}
            <div className="w-full border border-black/20 my-[20px]"></div>
            {/* ô câu hỏi */}
            <div>
              <p className="ml-1 mb-1">Cẩu hỏi (*)</p>
              <textarea
                ref={Input_CauHoi}
                defaultValue={`${Text_CauHoi}`}
                placeholder="Nội dung câu hỏi"
                className={`w-full p-[20px] border whitespace-pre-line  rounded-[10px] h-[150px]  ${Al_CauHoi ? `border-red-500 bg-red-50` : `border-[#164e57] bg-[#d7e8ec93]`}`}
                name=""
                id=""
              ></textarea>
            </div>

            <div className="w-full flex gap-2">
              <div className="w-full">
                <p>Link hình ảnh</p>
                <input
                  defaultValue={`${Text_LinkAnh}`}
                  ref={Input_LinkAnh}
                  placeholder="http://"
                  className="p-[10px] w-full border border-[#164e57] rounded-[10px] h-fit bg-[#d7e8ec93]"
                  type="text"
                />
              </div>

              <div className="w-full">
                <p>Link hình âm thanh</p>
                <input
                  defaultValue={`${Text_LinkAmThanh}`}
                  ref={Input_LinkAmThanh}
                  placeholder="http://"
                  className="p-[10px] w-full border border-[#164e57] rounded-[10px] h-fit bg-[#d7e8ec93]"
                  type="text"
                />
              </div>
            </div>

            {/* phần dáp án trắc nghiệm */}
            {Text_TypeCauHoi === "Trắc nghiệm" && (
              <div>
                <div className="w-full border border-black/20 my-[20px]"></div>
                <div className="flex flex-col gap-4 mt-[20px]">
                  <div className="flex gap-2">
                    <div className="w-full flex gap-2 items-center">
                      <div
                        onClick={() => {
                          setChonDa("a");
                        }}
                        className={`w-[20px] h-[20px] shrink-0 rounded-[50%] border-[1px] border-black/30 cursor-pointer ${ChonDA === "a" && `bg-[#2f6169]`}`}
                      />
                      <input
                        defaultValue={`${Text_DapAnA}`}
                        ref={Input_DapAnA}
                        placeholder="Đáp án A (*)"
                        className={`p-[10px] w-full border  rounded-[10px] h-fit ${Al_DapAnA ? `border-red-500 bg-red-50` : `border-[#164e57]`}`}
                        type="text"
                      />
                    </div>
                    <div className="w-full flex gap-2 items-center">
                      <div
                        onClick={() => {
                          setChonDa("b");
                        }}
                        className={`w-[20px] h-[20px] shrink-0 rounded-[50%] border-[1px] border-black/30 cursor-pointer ${ChonDA === "b" && `bg-[#2f6169]`}`}
                      />
                      <input
                        defaultValue={`${Text_DapAnB}`}
                        ref={Input_DapAnB}
                        placeholder="Đáp án B (*)"
                        className={`p-[10px] w-full border  rounded-[10px] h-fit ${Al_DapAnB ? `border-red-500 bg-red-50` : `border-[#164e57]`}`}
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-full flex gap-2 items-center">
                      <div
                        onClick={() => {
                          setChonDa("c");
                        }}
                        className={`w-[20px] h-[20px] shrink-0 rounded-[50%] border-[1px] border-black/30 cursor-pointer ${ChonDA === "c" && `bg-[#2f6169]`}`}
                      />
                      <input
                        ref={Input_DapAnC}
                        defaultValue={`${Text_DapAnC}`}
                        placeholder="Đáp án C (*)"
                        className={`p-[10px] w-full border  rounded-[10px] h-fit ${Al_DapAnC ? `border-red-500 bg-red-50` : `border-[#164e57]`}`}
                        type="text"
                      />
                    </div>
                    <div className="w-full flex gap-2 items-center">
                      <div
                        onClick={() => {
                          setChonDa("d");
                        }}
                        className={`w-[20px] h-[20px] shrink-0 rounded-[50%] border-[1px] border-black/30 cursor-pointer ${ChonDA === "d" && `bg-[#2f6169]`}`}
                      />
                      <input
                        ref={Input_DapAnD}
                        defaultValue={`${Text_DapAnD}`}
                        placeholder="Đáp án D (*)"
                        className={`p-[10px] w-full border  rounded-[10px] h-fit ${Al_DapAnD ? `border-red-500 bg-red-50` : `border-[#164e57]`}`}
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* phần giải thích */}
            <div className="w-full border border-black/20 my-[20px]"></div>

            <div>
              <p className="ml-1 mb-1">Giải thích (*)</p>
              <textarea
                ref={Input_GiaiThich}
                defaultValue={`${Text_GiaiThich}`}
                placeholder="Nội dung giải thích"
                className={`w-full p-[20px] border whitespace-pre-line  rounded-[10px] h-[150px]  ${Al_GiaiThich ? `border-red-500 bg-red-50` : `border-[#164e57] bg-[#d7e8ec93]`}`}
                name=""
                id=""
              ></textarea>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
