import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../FileThongso";
import { useParams } from "react-router-dom";
import Alert from "./aletr";
import { div } from "framer-motion/client";
import Box_danhSachLopHocOnline from "./box_danhSachLopHocOnline";

export default function QL_LopHocOnline() {
  const Input_TenLopHoc = useRef<HTMLInputElement>(null);
  const Input_LinkLopHoc = useRef<HTMLInputElement>(null);

  const [DataLinkLop, setDataLinkLop] = useState<any[]>([]);
  const [AlLinkLop, setAlLinkLop] = useState(false);

  const [Al_TenLopHoc, setAl_TenLopHoc] = useState(false);
  const [Al_LinkLopHoc, setAl_LinkLopHoc] = useState(false);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const TatThongBao = () => {
    settb(false);
  };

  const [Token, setToken] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    return null;
  });

  const { id } = useParams();

  const ThemLopHocOnline = async () => {
    const TenLopHoc = Input_TenLopHoc.current?.value.trim() || "";
    const LinkLopHoc = Input_LinkLopHoc.current?.value.trim() || "";
    let check = 0;
    if (TenLopHoc === "") {
      setAl_TenLopHoc(true);
      check++;
    } else setAl_TenLopHoc(false);
    if (LinkLopHoc === "") {
      setAl_LinkLopHoc(true);
      check++;
    } else setAl_LinkLopHoc(false);

    if (check === 0) {
      try {
        const data = {
          tenLH: TenLopHoc,
          linkLop: LinkLopHoc,
        };
        const api = await fetch(`${BACKEND_URL}/api/them-lopHocon/${id}`, {
          method: "POST",
          headers: { Authorization: Token, "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const req = await api.json();
        if (req.trangThai === "tb") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Thêm lớp học online THẤT BẠI");
        } else if (req.trangThai === "kdtq") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
        } else if (req.trangThai === "hh") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
        } else if (req.trangThai === "tc") {
          settb(true);
          settypeTB("ss"); // w , err
          setNdTB("Thêm lop học online thành công");
          layData();
        }
      } catch (err) {
        console.log("thêm lớp học thất bại : " + err);
      }
    }
  };

  const layData = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/lay-lopHocon/${id}`);
      const req = await api.json();
      if (req.trangThai === "tb") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("lấy danh sách lớp học online THẤT BẠI");
      } else if (req.trangThai === "tc") {
        setAlLinkLop(false);
        setDataLinkLop(req.data);
      } else if (req.trangThai === "ktt") {
        setAlLinkLop(true);
      }
    } catch (err) {
      console.log("lay danh sach lop học online thát bại : " + err);
    }
  };

  const xoa = async (idlopon: string) => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/Xoa-lopHocOn/${idlopon}`, {
        method: "DELETE",
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "tb") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Xóa lớp học online THẤT BẠI");
      } else if (req.trangThai === "kdtq") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Bạn không đủ quyền hạn để sử dụng chức năng này");
      } else if (req.trangThai === "hh") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Phiên đăng nhập hết hạn vui lòng đăng nhập lại");
      } else if (req.trangThai === "tc") {
        settb(true);
        settypeTB("ss"); // w , err
        setNdTB("Xóa lop học online thành công");
        layData();
      }
    } catch (err) {
      console.log("xóa lớp học thất bại : " + err);
    }
  };

  useEffect(() => {
    layData();
  }, []);
  return (
    <section className="w-full">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      <div className="w-full flex flex-col gap-2">
        <h2 className="text-[20px] font-bold text-center w-full text-[#114a53]">
          Thêm liên kết lớp học online
        </h2>
        <div className="flex gap-2 items-end border border-black/20 rounded-[10px] mt-[10px] p-[10px]">
          {/* phần tên */}
          <div className="w-[400px]">
            <p className="mb-[5px] ">Tên Lớp học</p>
            <input
              ref={Input_TenLopHoc}
              placeholder="Buổi 2"
              type="text"
              className={`w-full p-[10px]  rounded-[10px] ${Al_TenLopHoc ? `border border-red-500 bg-red-50` : `bg-[#d7e8ec]`}`}
            />
          </div>
          {/* phần Link */}
          <div className="w-full">
            <p className="mb-[5px] ">Liên kết Lớp học</p>
            <input
              ref={Input_LinkLopHoc}
              placeholder="htttp://abc"
              type="text"
              className={`w-full p-[10px]  rounded-[10px] ${Al_LinkLopHoc ? `border border-red-500 bg-red-50` : `bg-[#d7e8ec]`}`}
            />
          </div>

          <button
            onClick={() => {
              ThemLopHocOnline();
            }}
            className="px-[20px] h-fit py-[10px] bg-[#114a53] text-white font-bold rounded-[10px]"
          >
            Thêm
          </button>
        </div>
      </div>
      {/* dduowng kẻ */}
      <div className="w-full border-b border-b-black/20 my-[20px]"></div>
      {/* danh sách lớp học online */}
      <h2 className="my-[10px] text-[20px] font-bold text-center w-full text-[#114a53]">
        Liên kết lớp học online
      </h2>
      {/* phần danh sách liên kết */}
      {AlLinkLop ? (
        <p className="w-full text-center">
          hiện không có liên kết khóa học nào
        </p>
      ) : (
        <div className=" flex flex-col gap-3">
          {DataLinkLop?.map((item) => (
            <Box_danhSachLopHocOnline key={item._id} xoa={xoa} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
