export default function Box_HV_QL_BaiTap() {
  return (
    <section className="w-full">
      <div className=" flex flex-col gap-3 p-[10px] transition-all duration-300 hover:scale-[1.005] bg-[#13474b] rounded-[10px]">
        <div className="flex gap-3 items-center">
          <div className="w-[50px] h-[50px] bg-[#fcffff] rounded-[50%] flex justify-center items-center">
            <img
              className="w-[60%]"
              src="https://img.icons8.com/?size=100&id=7lq2aqxqdO78&format=png&color=13474b"
              alt=""
            />
          </div>
          <p className="font-bold text-[20px] text-white">bai tap buoi 2</p>
          <div className="px-[10px] py-[5px] items-center rounded-[5px] bg-[#28a653] text-white text-[10px] font-medium flex gap-1">
            <img
              className="w-[18px] h-[18px]"
              src="https://img.icons8.com/?size=100&id=98955&format=png&color=ffffff"
              alt=""
            />
            da nop
          </div>
        </div>
        <div className="w-full px-[20px] py-[10px] bg-white rounded-[10px] flex justify-between">
          <div>
            <p className="opacity-[50%]">ngay nop</p>
            <p className="font-medium">12/12/2024</p>
          </div>
          <div>
            <p className="opacity-[50%]">Han nop</p>
            <p className="font-medium">12/12/2024</p>
          </div>
          <div>
            <p className="opacity-[50%]">diem uoc tinh</p>
            <p className="font-medium">9/10 (25/30)</p>
          </div>
          <div>
            <p className="opacity-[50%]">Diem chinh thuc</p>
            <p className="font-medium">9/10 (25/30)</p>
          </div>
        </div>
      </div>
    </section>
  );
}
