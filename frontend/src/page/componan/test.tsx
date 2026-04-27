import { useState } from "react";

export default function Test() {
  const [mang1, setmang1] = useState([
    {
      cauHoi: "câu hỏi 1",
      dapAn: "đáp án 1",
    },
    {
      cauHoi: "câu hỏi 2",
      dapAn: "đáp án 2",
    },
    {
      cauHoi: "câu hỏi 3",
      dapAn: "đáp án 3",
    },
  ]);

  setmang1((mang2) => {
    return mang2.map((item) => {
      return;
    });
  });
  return (
    // 1. Thẻ Ông Nội: Chứa perspective và thêm class 'group' để bắt sự kiện hover
    <>
      {mang1.map((items) => (
        <div className="w-fit border border-black/50 p-[10px]">
          <p>câu hỏi : {items.cauHoi} </p>
          <p>đáp án : {items.dapAn}</p>
        </div>
      ))}
    </>
  );
}
