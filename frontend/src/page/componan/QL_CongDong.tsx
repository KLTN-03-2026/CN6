import { useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../FileThongso";
import { useParams } from "react-router-dom";
import Alert from "./aletr";
import { div } from "framer-motion/client";
import Box_danhSachLopHocOnline from "./box_danhSachLopHocOnline";
import Box_danhSachCongDong from "./box_danhSachCongDong";

export default function QL_CongDong() {
  const Input_TenCD = useRef<HTMLInputElement>(null);
  const Input_LinkCD = useRef<HTMLInputElement>(null);

  const [DataLinCD, setDataLinCD] = useState<any[]>([]);
  const [AlLinkCD, setAlLinkCD] = useState(false);

  const [Al_TenCD, setAl_TenCD] = useState(false);
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

  const ThemCD = async () => {
    const TenCD = Input_TenCD.current?.value.trim() || "";
    const LinkCD = Input_LinkCD.current?.value.trim() || "";
    let check = 0;
    if (TenCD === "") {
      setAl_TenCD(true);
      check++;
    } else setAl_TenCD(false);
    if (LinkCD === "") {
      setAl_LinkLopHoc(true);
      check++;
    } else setAl_LinkLopHoc(false);

    if (check === 0) {
      try {
        const data = {
          tenCD: TenCD,
          linkCD: LinkCD,
        };
        const api = await fetch(`${BACKEND_URL}/api/them-CongDong/${id}`, {
          method: "POST",
          headers: { Authorization: Token, "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const req = await api.json();
        if (req.trangThai === "tb") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Thêm Cộng Đồng THẤT BẠI");
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
          setNdTB("Thêm Cộng Đồng thành công");
          layData();
        }
      } catch (err) {
        console.log("thêm lớp học thất bại : " + err);
      }
    }
  };

  const layData = async () => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/lay-CongDong/${id}`);
      const req = await api.json();
      if (req.trangThai === "tb") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("lấy danh sách Cộng Đồng THẤT BẠI");
      } else if (req.trangThai === "tc") {
        setAlLinkCD(false);
        setDataLinCD(req.data);
      } else if (req.trangThai === "ktt") {
        setAlLinkCD(true);
      }
    } catch (err) {
      console.log("lay danh sach lop học online thát bại : " + err);
    }
  };

  const xoa = async (idlopon: string) => {
    try {
      const api = await fetch(`${BACKEND_URL}/api/Xoa-CongDong/${idlopon}`, {
        method: "DELETE",
        headers: { Authorization: Token, "Content-Type": "application/json" },
      });
      const req = await api.json();
      if (req.trangThai === "tb") {
        settb(true);
        settypeTB("err"); // w , err
        setNdTB("Xóa Cộng Đồng THẤT BẠI");
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
        setNdTB("Xóa Cộng Đồng thành công");
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
          Thêm liên kết Cộng Đồng
        </h2>
        <div className="flex gap-2 items-end border border-black/20 rounded-[10px] mt-[10px] p-[10px]">
          {/* phần tên */}
          <div className="w-[400px]">
            <p className="mb-[5px] ">Tên Cộng đồng</p>
            <input
              ref={Input_TenCD}
              placeholder="Buổi 2"
              type="text"
              className={`w-full p-[10px]  rounded-[10px] ${Al_TenCD ? `border border-red-500 bg-red-50` : `bg-[#d7e8ec]`}`}
            />
          </div>
          {/* phần Link */}
          <div className="w-full">
            <p className="mb-[5px] ">Liên kết Cộng đồng</p>
            <input
              ref={Input_LinkCD}
              placeholder="htttp://abc"
              type="text"
              className={`w-full p-[10px]  rounded-[10px] ${Al_LinkLopHoc ? `border border-red-500 bg-red-50` : `bg-[#d7e8ec]`}`}
            />
          </div>

          <button
            onClick={() => {
              ThemCD();
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
        Liên kết Cộng Đồng
      </h2>
      {/* phần danh sách liên kết */}
      {AlLinkCD ? (
        <p className="w-full text-center">
          hiện không có liên kết Cộng Đồng nào
        </p>
      ) : (
        <div className=" flex flex-col gap-3">
          {DataLinCD?.map((item) => (
            <Box_danhSachCongDong key={item._id} xoa={xoa} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
