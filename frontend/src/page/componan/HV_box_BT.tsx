import { div, input } from "framer-motion/client";
import { useState, useRef, useEffect } from "react";
import { BACKEND_URL } from "../FileThongso";

interface HV_box_btProps {
  data: any;
  Chon: number;
  ClickChon: (i: number) => void;
  capNhatDapAn: (text: any) => void;
  dapan: any;
  loai: String;
}

export default function HV_box_bt({
  data,
  ClickChon,
  Chon,
  capNhatDapAn,
  dapan,
  loai,
}: HV_box_btProps) {
  ////////////////////

  //   0: trắc nghiệm
  //   1: Câu trả lời ngắn
  //   2: Tự luận
  //   3: Ghi âm

  const [dangGhiAm, setDangGhiAm] = useState(false);
  const [linkAmThanh, setLinkAmThanh] = useState<string | null>(
    data?.linkAmThanh || null,
  );
  const [fileBlob, setfileBolb] = useState<any | null>();

  // Bộ nhớ tạm (useRef) để giữ file ghi âm mà không làm load lại màn hình
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const cacManhAmThanh = useRef<BlobPart[]>([]);

  const [DapAnTN, setDapAnTN] = useState(dapan?.dapAnHocVien || "");
  const inTL = useRef<HTMLTextAreaElement>(null);

  const chonDapAN = () => {
    if (data?.type === 0) {
      if (DapAnTN !== "") {
        const DapAn = {
          CauHoi: data?.CauHoi,
          type: data?.type,
          a: data?.a || "",
          b: data?.b || "",
          c: data?.c || "",
          d: data?.d || "",
          fileNghe: data?.fileNghe || "",
          anh: data?.anh || "",
          dapAn: data?.dapAn || "",
          dapAnHocVien: DapAnTN || "",
          giaiThich: data?.giaiThich || "",
          fileBlob: fileBlob,
          linkAmThanh: linkAmThanh,
        };
        capNhatDapAn(DapAn);
      }
    } else if (data?.type === 1 || data.type === 2) {
      const input = inTL.current?.value || "";

      if (input !== "") {
        const DapAn = {
          CauHoi: data?.CauHoi,
          type: data?.type,
          a: data?.a || "",
          b: data?.b || "",
          c: data?.c || "",
          d: data?.d || "",
          fileNghe: data?.fileNghe || "",
          anh: data?.anh || "",
          dapAn: data?.dapAn || "",
          dapAnHocVien: input || "",
          giaiThich: data?.giaiThich || "",
          fileBlob: fileBlob,
          linkAmThanh: linkAmThanh,
        };
        capNhatDapAn(DapAn);
      }
    } else {
      const DapAn = {
        CauHoi: data?.CauHoi,
        type: data?.type,
        a: data?.a || "",
        b: data?.b || "",
        c: data?.c || "",
        d: data?.d || "",
        fileNghe: data?.fileNghe || "",
        anh: data?.anh || "",
        dapAn: data?.dapAn || "",
        dapAnHocVien: linkAmThanh || "",
        giaiThich: data?.giaiThich || "",
        fileBlob: fileBlob,
        linkAmThanh: linkAmThanh,
      };
      capNhatDapAn(DapAn);
    }
  };

  useEffect(() => {
    setDapAnTN(dapan?.dapAnHocVien || "");
    setLinkAmThanh(dapan?.linkAmThanh || null);

    if (inTL.current) {
      inTL.current.value = dapan?.dapAnHocVien || "";
    }
  }, [dapan]);

  useEffect(() => {
    console.log(inTL.current?.value || "");
  }, [Chon]);

  // 1. Hàm bắt đầu ghi âm
  const batDauGhiAm = async () => {
    try {
      // Yêu cầu trình duyệt cấp quyền sử dụng Micro
      const luongAmThanh = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Khởi tạo máy ghi âm
      const mayGhiAm = new MediaRecorder(luongAmThanh);
      mediaRecorderRef.current = mayGhiAm;
      cacManhAmThanh.current = []; // Xóa dữ liệu cũ nếu ghi lại

      // Khi máy ghi âm thu được âm thanh, nhét nó vào mảng tạm
      mayGhiAm.ondataavailable = (suKien) => {
        if (suKien.data.size > 0) {
          cacManhAmThanh.current.push(suKien.data);
        }
      };

      // Khi bấm dừng, gộp các mảnh lại thành 1 file Audio hoàn chỉnh (Blob)
      mayGhiAm.onstop = () => {
        const fileAmThanh = new Blob(cacManhAmThanh.current, {
          type: "audio/webm",
        });
        setfileBolb(fileAmThanh);
        // Tạo một đường link ảo trên trình duyệt để nghe lại ngay lập tức
        const duongDanAo = URL.createObjectURL(fileAmThanh);
        setLinkAmThanh(duongDanAo);
      };

      // Bật công tắc bắt đầu ghi
      mayGhiAm.start();
      setDangGhiAm(true);
      setLinkAmThanh(null); // Ẩn cái file cũ đi trong lúc đang ghi cái mới
    } catch (loi) {
      console.error("Lỗi truy cập Micro:", loi);
      alert("Vui lòng cho phép trình duyệt sử dụng Micro của bạn!");
    }
  };

  // 2. Hàm dừng ghi âm
  const dungGhiAm = () => {
    if (mediaRecorderRef.current && dangGhiAm) {
      mediaRecorderRef.current.stop(); // Dừng thu

      // Lệnh Tắt đèn Micro (Quan trọng): Chặn trình duyệt hiển thị dấu chấm đỏ đang quay lén
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      setDangGhiAm(false);
    }
  };
  return (
    <section
      className={`overflow-y-scroll  overflow-hidden flex justify-center  w-full bg-gradient-to-t from-[#A9F9FC] to-[#2F8C8F] h-[calc(100vh-85px)] rounded-[20px] ${data?.type === 2 ? `items-start p-[50px]` : `items-center`}`}
    >
      {data?.type === 0 && (
        <div className="m-[10px] w-[700px] flex-col items-center gap-[10px] h-fit p-[30px] rounded-[20px] bg-white flex justify-center">
          {/* // hình ảnh */}
          {data?.anh !== "" && (
            <div className="w-[400px] h-[300px] overflow-hidden  rounded-[10px] flex justify-center items-center">
              <img
                className="w-full  object-contain"
                src={`${BACKEND_URL}/taiNguyen/${data?.anh}`}
                alt=""
              />
            </div>
          )}

          {/* file âm thanh */}
          {data?.fileNghe !== "" && (
            <audio controls>
              <source
                src={`${BACKEND_URL}/taiNguyen/${data?.fileNghe}`}
                type="audio/mpeg"
              />
            </audio>
          )}

          {/* /// phần câu hỏi */}
          <div className="text-[15px] w-full flex flex-col gap-2 px-[10px] ">
            <p className="">
              câu {Chon + 1} : {data?.CauHoi}
            </p>
            <div
              onClick={() => {
                setDapAnTN("a");
              }}
              className="flex gap-2 items-center mt-[10px]  cursor-pointer w-fit"
            >
              <div className="w-[20px] h-[20px] border border-black/50 rounded-[50%] flex justify-center items-center ">
                {DapAnTN === "a" && (
                  <div className="w-[15px] h-[15px] rounded-[50%] bg-[#2a6770]"></div>
                )}
              </div>
              <p>{data?.a}</p>
            </div>

            <div
              onClick={() => {
                setDapAnTN("b");
              }}
              className="flex gap-2 items-center mt-[10px]  cursor-pointer w-fit"
            >
              <div className="w-[20px] h-[20px] border border-black/50 rounded-[50%] flex justify-center items-center ">
                {DapAnTN === "b" && (
                  <div className="w-[15px] h-[15px] rounded-[50%] bg-[#2a6770]"></div>
                )}
              </div>
              <p>{data?.b}</p>
            </div>

            <div
              onClick={() => {
                setDapAnTN("c");
              }}
              className="flex gap-2 items-center mt-[10px]  cursor-pointer w-fit"
            >
              <div className="w-[20px] h-[20px] border border-black/50 rounded-[50%] flex justify-center items-center ">
                {DapAnTN === "c" && (
                  <div className="w-[15px] h-[15px] rounded-[50%] bg-[#2a6770]"></div>
                )}
              </div>
              <p>{data?.c}</p>
            </div>

            <div
              onClick={() => {
                setDapAnTN("d");
              }}
              className="flex gap-2 items-center mt-[10px]  cursor-pointer w-fit"
            >
              <div className="w-[20px] h-[20px] border border-black/50 rounded-[50%] flex justify-center items-center ">
                {DapAnTN === "d" && (
                  <div className="w-[15px] h-[15px] rounded-[50%] bg-[#2a6770]"></div>
                )}
              </div>
              <p>{data?.d}</p>
            </div>
          </div>
          <div className="w-full mt-[10px] flex justify-end">
            <button
              onClick={() => {
                ClickChon(Chon + 1);
                chonDapAN();
                setDapAnTN("");
              }}
              className="text-[15px] p-[10px] bg-[#2A6770] text-white rounded-[15px] font-medium"
            >
              Lưu
            </button>
          </div>
        </div>
      )}
      {data?.type === 1 && (
        <div className="w-[700px] flex-col items-center gap-[10px] h-fit p-[30px] rounded-[20px] bg-white flex justify-center">
          {data?.anh !== "" && (
            <div className="w-[400px] h-[300px] overflow-hidden  rounded-[10px] flex justify-center items-center">
              <img
                className="w-full  object-contain"
                src={`${BACKEND_URL}/taiNguyen/${data?.anh}`}
                alt=""
              />
            </div>
          )}
          {/* file âm thanh */}
          {data?.fileNghe !== "" && (
            <audio controls>
              <source
                src={`${BACKEND_URL}/taiNguyen/${data?.fileNghe}`}
                type="audio/mpeg"
              />
            </audio>
          )}
          <p className="w-full text-start text-[15px]">
            câu {Chon + 1} : {data?.CauHoi}
          </p>
          <textarea
            ref={inTL}
            defaultValue={dapan?.dapAnHocVien || ""}
            className="p-[10px] h-[100px] bg-[#d7e8ec] w-full rounded-[10px] focus:outline-none"
          />
          <div className="w-full mt-[10px] flex justify-end">
            <button
              onClick={() => {
                ClickChon(Chon + 1);
                chonDapAN();
              }}
              className="text-[15px] p-[10px] bg-[#2A6770] text-white rounded-[15px] font-medium"
            >
              Lưu
            </button>
          </div>
        </div>
      )}
      {data?.type === 2 && (
        <div className="m-[10px] w-[700px]  flex-col items-center gap-[10px] h-fit p-[30px] rounded-[20px] bg-white flex justify-center">
          {data?.anh !== "" && (
            <div className="w-[400px] h-[300px] overflow-hidden  rounded-[10px] flex justify-center items-center">
              <img
                className="w-full  object-contain"
                src={`${BACKEND_URL}/taiNguyen/${data?.anh}`}
                alt=""
              />
            </div>
          )}
          {/* file âm thanh */}
          {data?.fileNghe !== "" && (
            <audio controls>
              <source
                src={`${BACKEND_URL}/taiNguyen/${data?.fileNghe}`}
                type="audio/mpeg"
              />
            </audio>
          )}
          <p className="w-full text-start text-[15px]">
            {" "}
            câu {Chon + 1} : {data?.CauHoi}
          </p>
          <textarea
            ref={inTL}
            defaultValue={dapan?.dapAnHocVien || ""}
            className="p-[10px] h-[300px] bg-[#d7e8ec] w-full rounded-[10px] focus:outline-none"
          />
          <div className="w-full mt-[10px] flex justify-end">
            <button
              onClick={() => {
                ClickChon(Chon + 1);
                chonDapAN();
              }}
              className="text-[15px] p-[10px] bg-[#2A6770] text-white rounded-[15px] font-medium"
            >
              Lưu
            </button>
          </div>
        </div>
      )}
      {data?.type === 3 && (
        <div className="m-[10px] w-[700px]  flex-col items-center gap-[10px] h-fit p-[30px] rounded-[20px] bg-white flex justify-center">
          {data?.anh !== "" && (
            <div className="w-[400px] h-[300px] overflow-hidden  rounded-[10px] flex justify-center items-center">
              <img
                className="w-full  object-contain"
                src={`${BACKEND_URL}/taiNguyen/${data?.anh}`}
                alt=""
              />
            </div>
          )}
          {/* file âm thanh */}
          {data?.fileNghe !== "" && (
            <audio controls>
              <source
                src={`${BACKEND_URL}/taiNguyen/${data?.fileNghe}`}
                type="audio/mpeg"
              />
            </audio>
          )}
          <p className="w-full text-start text-[15px]">
            câu {Chon + 1} : {data?.CauHoi}
          </p>
          {/* ////////////////////////// */}

          <div className="border border-black/30 p-[10px] rounded-[20px] text-[13px] flex flex-col justify-center items-center gap-2">
            <p className="opacity-[0.75]">Nhấn vào mic để ghi âm</p>
            <div
              onClick={dangGhiAm ? dungGhiAm : batDauGhiAm}
              className={`cursor-pointer w-[300px] h-[50px]  rounded-[20px] flex justify-center items-center transition-all duration-300 ${dangGhiAm ? `bg-[#ff1200]` : `bg-[#2A6770]`}`}
            >
              {dangGhiAm ? (
                <div className="h-[28px] w-[28px] bg-white/90 rounded-[8px]"></div>
              ) : (
                <img
                  className="h-[70%]"
                  src="https://img.icons8.com/?size=100&id=PdCTIK38g57b&format=png&color=ffffff"
                  alt=""
                />
              )}
            </div>
            {linkAmThanh && (
              <div className="w-full mt-4 flex flex-col gap-2">
                <p className="text-sm font-bold text-gray-700">Nghe lại:</p>
                <audio src={linkAmThanh} controls className="w-full h-[40px]" />
              </div>
            )}
          </div>
          <div className="w-full mt-[10px] flex justify-end">
            <button
              onClick={() => {
                ClickChon(Chon + 1);
                setLinkAmThanh(null);
                chonDapAN();
              }}
              className="text-[15px] p-[10px] bg-[#2A6770] text-white rounded-[15px] font-medium"
            >
              Lưu
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
