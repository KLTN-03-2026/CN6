import { useRef, useState } from "react";
import { BACKEND_URL } from "../FileThongso";
import Alert from "./aletr";
import BoxXacNhan from "./BoxXacNhan";

interface Box_danhSachLopHocOnline_Props {
  item: any;
  xoa: (id: string) => void;
}

export default function Box_danhSachCongDong({
  item,
  xoa,
}: Box_danhSachLopHocOnline_Props) {
  const Input_Ten = useRef<HTMLInputElement>(null);
  const Input_Link = useRef<HTMLInputElement>(null);

  const [Al_TenCD, setAl_TenCD] = useState(false);
  const [Al_LinkCD, setAl_LinkCD] = useState(false);

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

  const CapNhat = async () => {
    const TenCD = Input_Ten.current?.value.trim() || "";
    const LinkCD = Input_Link.current?.value.trim() || "";
    let check = 0;
    if (TenCD === "") {
      setAl_TenCD(true);
      check++;
    } else setAl_TenCD(false);
    if (LinkCD === "") {
      setAl_LinkCD(true);
      check++;
    } else setAl_LinkCD(false);

    if (check === 0) {
      try {
        const data = {
          tenCD: TenCD,
          linkCD: LinkCD,
        };
        const api = await fetch(
          `${BACKEND_URL}/api/CapNhat-CongDong/${item._id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: Token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );
        const req = await api.json();
        if (req.trangThai === "tb") {
          settb(true);
          settypeTB("err"); // w , err
          setNdTB("Cập nhật lớp học online THẤT BẠI");
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
          setNdTB("Cập nhật lop học online thành công");
        }
      } catch (err) {
        console.log("thêm lớp học thất bại : " + err);
      }
    }
  };
  const [xn, setxn] = useState(false);
  const tatxn = () => {
    setxn(false);
  };
  const xnxoa = () => {
    xoa(item._id);
  };
  return (
    <div className="p-[20px] border border-black/20 rounded-[10px] flex gap-2">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}
      {xn && (
        <BoxXacNhan
          tat={tatxn}
          xoa={xnxoa}
          noiDung="Xác nhận xóa lớp học online"
        />
      )}
      {/* phần tên */}
      <div className="w-[400px]">
        <p className="mb-[5px] font-medium">Tên Lớp học</p>
        <input
          ref={Input_Ten}
          defaultValue={`${item.tenCD}`}
          type="text"
          className={`w-full p-[10px]  rounded-[10px] ${Al_TenCD ? `border border-red-500 bg-red-50` : `bg-[#d7e8ec]`}`}
        />
      </div>
      {/* phần Link */}
      <div className="w-full">
        <p className="mb-[5px] font-medium">Liên kết Lớp học</p>
        <input
          ref={Input_Link}
          defaultValue={`${item.linkCD}`}
          type="text"
          className={`w-full p-[10px]  rounded-[10px] ${Al_LinkCD ? `border border-red-500 bg-red-50` : `bg-[#d7e8ec]`}`}
        />
      </div>
      <div className="w-fit items-end flex gap-1">
        <button
          onClick={() => {
            CapNhat();
          }}
          className="px-[20px] text-nowrap py-[10px]  bg-[#114a53] text-white font-bold rounded-[10px] w-fit shrink-0"
        >
          Cập nhật
        </button>
        <button
          onClick={() => {
            setxn(true);
          }}
          className="px-[20px] text-nowrap py-[10px]  bg-[#730b08] text-white font-bold rounded-[10px] w-fit shrink-0"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
