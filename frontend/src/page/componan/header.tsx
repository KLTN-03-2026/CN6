import { Link, useNavigate } from "react-router-dom";
import DangNhap from "../DanhNhap";
import { use, useEffect, useState } from "react";
import { floor } from "firebase/firestore/pipelines";
import { div } from "framer-motion/client";
import Alert from "./aletr";

export default function Header() {
  const ChuyenTrang = useNavigate();
  const [DN, setDN] = useState(false);
  const [drKh, setdrKh] = useState(false);

  const [avata, setavata] = useState(false);
  const [dsKH, setdsKH] = useState<any[]>([]);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return false;
  });

  const dangnhap1 = (text: any) => {
    setToken(text);
  };

  useEffect(() => {
    localStorage.setItem("E-learningTK", JSON.stringify(Token));
  }, [Token]);
  const tat = () => {
    setDN(false);
  };
  const dangxuat = () => {
    try {
      localStorage.removeItem("E-learningTK");
      setToken(null);
      settb(true);
      settypeTB("ss");
      setNdTB("Đăng xuất thành công");
    } catch (err) {
      alert("dang xuat that bai: " + err);
    }
  };

  const layKhoaHoc = async () => {
    try {
      const api = await fetch("http://localhost:3000/khoaHoc");
      const res = await api.json();

      if (res.trangThai === "tc") {
        setdsKH(res.dulieu);
      } else console.log("lay khoa hoc that bai" + res.mess);
    } catch (err) {
      console.log("loi api lay khoa hoc" + err);
    }
  };

  const TatThongBao = () => {
    settb(false);
  };

  useEffect(() => {
    layKhoaHoc();
  }, []);

  return (
    <>
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      <div className="w-[100%] h-[50px] flex items-center px-[15px] justify-between my-[10px]  ">
        <img
          onClick={() => {
            ChuyenTrang("/");
          }}
          src="/logo.svg"
          alt="logo"
          className="h-[33px] cursor-pointer"
        />
        <div className="flex gap-10 text-[#13474b] items-center relative">
          <p
            onClick={() => {
              setdrKh(!drKh);
            }}
            className="cursor-pointer transition-all  hover:border-b border-b-[#13474b] font-medium flex items-center gap-1 justify-center"
          >
            khóa học{" "}
          </p>
          {drKh && (
            <ul className="absolute top-[30px] z-[50] bg-white py-[10px] border-black/25 border rounded-[10px] flex flex-col gap-2 ">
              {dsKH.map((item) => (
                <li
                  onClick={() => {
                    ChuyenTrang(`/khoahoc/${item._id}`);
                  }}
                  className="cursor-pointer  hover:bg-[#13474b]/25 transition-all py-[5px] px-[10px]"
                >
                  {item.TenKhoaHoc}
                </li>
              ))}
            </ul>
          )}
          {drKh && (
            <div
              onClick={() => {
                setdrKh(!drKh);
              }}
              className="fixed z-[30]  w-screen left-0 h-screen top-0"
            ></div>
          )}
          <Link
            className="transition-all  hover:border-b border-b-[#13474b] font-medium"
            to={`#`}
          >
            kiểm tra đầu vào
          </Link>
          <Link
            className="transition-all  hover:border-b border-b-[#13474b] font-medium"
            to={`#`}
          >
            luyện đề
          </Link>
          <Link
            className="transition-all  hover:border-b border-b-[#13474b] font-medium"
            to={`#`}
          >
            Thi Thử
          </Link>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="bg-[#114a53] px-[20px] py-[10px] text-white rounded-[15px] text-[15px] font-medium"
            onClick={() => {
              if (Token !== null) ChuyenTrang("#");
              else setDN(true);
            }}
          >
            Bắt đầu
          </button>
          {Token !== null && (
            <img
              onClick={() => {
                setavata(!avata);
              }}
              className="w-[35px] h-[35px]"
              src="https://img.icons8.com/?size=100&id=4Sf2GPOpTPre&format=png&color=13474B"
              alt="avata"
            />
          )}
        </div>
        {avata && (
          <div
            onClick={() => {
              setavata(!avata);
            }}
            className="fixed z-[30]  w-screen left-0 h-screen top-0"
          ></div>
        )}
        {avata && (
          <div className="w-[140px] flex flex-col  py-[10px] absolute bg-white border border-black/25 rounded-[20px] right-3 top-[60px] z-50">
            <Link
              className="px-[20px] border-b-black/25 border-b py-[5px] transition-all duration-300 hover:bg-[#114a53]/25"
              to={`/CaiDat`}
            >
              Cài đặt
            </Link>
            <div
              onClick={() => {
                dangxuat();
                setavata(false);
              }}
              className="px-[20px] py-[5px] cursor-pointer transition-all duration-300 hover:bg-[#c23935]/25"
            >
              Đăng Xuất
            </div>
          </div>
        )}
      </div>
      {DN && <DangNhap dangnhap1={dangnhap1} tat={tat} />}
    </>
  );
}
