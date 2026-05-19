import { useEffect, useState, useMemo } from "react";
import { BACKEND_URL } from "../FileThongso";
import Alert from "./aletr";

export default function QL_thongKe() {
  const [Token] = useState<any>(() => {
    const check = localStorage.getItem("E-learningTK");
    if (check) return JSON.parse(check);
    else return null;
  });

  const [DataKhoaHoc, setDataKhoaHoc] = useState<any[]>([]);
  const [DataLopHoc, setDataLopHoc] = useState<any[]>([]);
  const [DataHoaDon, setDataHoaDon] = useState<any[]>([]);
  const [DataTaiKhoan, setDataTaiKhoan] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<string>("Tổng quan");
  const [timeRange, setTimeRange] = useState<string>("Tất Cả");
  const [loading, setLoading] = useState(false);

  const [tb, settb] = useState(false);
  const [ndTB, setNdTB] = useState("");
  const [typeTB, settypeTB] = useState("w");

  const [TongSoHV, setTongHV] = useState(0);

  const [phanTramHV, setPhanTramHV] = useState(0);
  const [phanTramDL, setPhanTramDL] = useState(0);
  const [phanTramKhac, setPhanTramKhac] = useState(0);

  const [TongTien, setTongTien] = useState(0);

  const TatThongBao = () => settb(false);

  const timeOptions = [
    "Tất Cả",
    "7 ngày",
    "14 ngày",
    "1 tháng",
    "3 tháng",
    "6 tháng",
    "1 năm",
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Courses
      const resKH = await fetch(`${BACKEND_URL}/khoaHoc`);
      const reqKH = await resKH.json();
      if (reqKH.trangThai === "tc") setDataKhoaHoc(reqKH.dulieu);

      // Fetch Classes
      const resLH = await fetch(`${BACKEND_URL}/layDanhSachLopHoc`);
      const reqLH = await resLH.json();
      if (reqLH.trangThai === "tc") setDataLopHoc(reqLH.data);

      // Fetch Invoices and associated accounts
      const resHD = await fetch(`${BACKEND_URL}/api/hoadon-hoat-dong`, {
        headers: { Authorization: Token },
      });
      const reqHD = await resHD.json();
      if (reqHD.trangThai === "tc") {
        console.log("Raw Invoices from API:", reqHD.dataLH?.length);
        setDataHoaDon(reqHD.dataLH || []);
        setDataTaiKhoan(reqHD.dataTK || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu thống kê:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();

    const getLimitDays = (range: string) => {
      if (range === "Tất Cả") return Infinity;
      if (range === "7 ngày") return 7;
      if (range === "14 ngày") return 14;
      if (range === "1 tháng") return 30;
      if (range === "3 tháng") return 90;
      if (range === "6 tháng") return 180;
      if (range === "1 năm") return 365;
      return Infinity;
    };

    const limitDays = getLimitDays(timeRange);

    const parseDate = (dateVal: any) => {
      if (!dateVal) return new Date(0);
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) return d;
      
      try {
        const str = String(dateVal).trim();
        if (str.includes("/")) {
          const parts = str.split(" ");
          let datePart = "";
          let timePart = "";
          
          if (parts[0].includes("/")) {
            datePart = parts[0];
            timePart = parts[1] || "00:00:00";
          } else if (parts[1] && parts[1].includes("/")) {
            datePart = parts[1];
            timePart = parts[0] || "00:00:00";
          }
          
          if (datePart) {
            const [day, month, year] = datePart.split("/");
            const formattedDay = day.padStart(2, "0");
            const formattedMonth = month.padStart(2, "0");
            return new Date(`${year}-${formattedMonth}-${formattedDay}T${timePart}`);
          }
        }
        return new Date(0);
      } catch (e) {
        return new Date(0);
      }
    };

    // Lọc dữ liệu
    const filteredHoaDon = DataHoaDon.filter((hd) => {
      const hdDate = parseDate(hd.Time);
      const diffDays = (now.getTime() - hdDate.getTime()) / (1000 * 3600 * 24);
      
      const isWithinTime = limitDays === Infinity || diffDays <= limitDays;
      
      // So sánh tên khóa học linh hoạt hơn (trim và không phân biệt hoa thường)
      const currentTab = activeTab.trim().toLowerCase();
      const hdCourse = (hd.TenKhoaHoc || "").trim().toLowerCase();
      const isCorrectCourse = currentTab === "tổng quan" || hdCourse === currentTab;
      
      // Backend đã lọc hóa đơn theo trạng thái lớp học, nên ở đây ta lấy hết
      return isWithinTime && isCorrectCourse;
    });

    console.log("Stats update - ActiveTab:", activeTab, "Filtered count:", filteredHoaDon.length);

    const uniqueStudentEmails = Array.from(
      new Set(filteredHoaDon.map((hd) => hd.Email))
    ).filter(email => !!email);
    
    const totalStudents = uniqueStudentEmails.length;

    const totalRevenue = filteredHoaDon.reduce(
      (sum, hd) => sum + (Number(hd.Gia) || 0),
      0,
    );

    const filteredLopHoc = DataLopHoc.filter((lh) => {
       const lhDate = parseDate(lh.ngayTao);
       const diffDays = (now.getTime() - lhDate.getTime()) / (1000 * 3600 * 24);
       const isWithinTime = limitDays === Infinity || diffDays <= limitDays;
 
       if (activeTab === "Tổng quan") return isWithinTime;
       const course = DataKhoaHoc.find((kh) => kh.TenKhoaHoc === activeTab);
       return lh.idKhoaHoc === course?._id && isWithinTime;
     });
     
     const totalClasses = filteredLopHoc.length;
     const activeClasses = filteredLopHoc.filter(
       (lh) => {
         const status = (lh.trangThai || "").trim().toLowerCase();
         return status === "đang mở" || status === "hoạt động" || status === "đang hoạt động" || status === "khai giảng";
       }
     ).length;
 
     const fillRates = filteredLopHoc
       .map((lh) => {
         // Chỉ đếm số học viên đăng ký TRONG khoảng thời gian đã lọc
         const count = filteredHoaDon.filter(
           (hd) => hd.TenLop === lh.TenLop
         ).length;
         const percentage = Math.min(Math.round((count / 30) * 100), 100);
         return {
           tenLop: lh.TenLop,
           tenKhoaHoc:
             DataKhoaHoc.find((kh) => kh._id === lh.idKhoaHoc)?.TenKhoaHoc || "",
           count,
           percentage,
         };
       })
       .sort((a, b) => b.percentage - a.percentage);
 
     // Tính toán đối tượng học viên
     const studentAccounts = DataTaiKhoan.filter((tk) =>
       uniqueStudentEmails.includes(tk?.Email)
     );
 
     const occupations: { [key: string]: number } = {
       "Học sinh & Sinh Viên": 0,
       "Đã đi làm": 0,
       "Khác": 0,
     };
 
     studentAccounts.forEach((tk) => {
       const job = tk.NgheNghiep || "Khác";
       if (occupations.hasOwnProperty(job)) {
         occupations[job]++;
       } else {
         occupations["Khác"]++;
       }
     });
 
     const totalStatsStudents = studentAccounts.length || 1;
     const phanTramHV = (occupations["Học sinh & Sinh Viên"] / totalStatsStudents) * 100;
     const phanTramDL = (occupations["Đã đi làm"] / totalStatsStudents) * 100;
     const phanTramKhac = (occupations["Khác"] / totalStatsStudents) * 100;
 
     return {
       totalStudents,
       totalRevenue,
       totalClasses,
       activeClasses,
       fillRates,
       phanTramHV,
       phanTramDL,
       phanTramKhac,
     };
   }, [DataHoaDon, DataLopHoc, DataTaiKhoan, DataKhoaHoc, activeTab, timeRange]);

  return (
    <section className="w-full mx-[10px] flex flex-col gap-6 relative mt-[10px] animate-in fade-in duration-500">
      {tb && <Alert type={typeTB} noiDung={ndTB} tat={TatThongBao} />}

      <div className="flex gap-2 justify-between items-center w-full bg-white p-2 rounded-[15px] border border-black/20 shadow-sm">
        <div className="flex gap-2 items-center overflow-x-auto flex-nowrap py-1 custom-scrollbar flex-1 px-2">
          <div
            onClick={() => setActiveTab("Tổng quan")}
            className={`shrink-0 cursor-pointer px-[20px] py-[10px] rounded-[10px] w-fit border transition-all duration-300 font-bold ${
              activeTab === "Tổng quan"
                ? "bg-[#d7e8ec] text-[#114A53] border-[#114A53]"
                : "bg-white text-black/40 border-transparent hover:bg-black/5"
            }`}
          >
            Tổng quan
          </div>
          {DataKhoaHoc.map((kh) => (
            <div
              key={kh._id}
              onClick={() => setActiveTab(kh.TenKhoaHoc)}
              className={`shrink-0 cursor-pointer px-[20px] py-[10px] rounded-[10px] w-fit border transition-all duration-300 font-bold ${
                activeTab === kh.TenKhoaHoc
                  ? "bg-[#d7e8ec] text-[#114A53] border-[#114A53]"
                  : "bg-white text-black/40 border-transparent hover:bg-black/5"
              }`}
            >
              {kh.TenKhoaHoc}
            </div>
          ))}
        </div>

        <div className="relative shrink-0 mr-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none bg-white border border-black/20 rounded-[10px] px-[20px] py-[10px] pr-[40px] font-bold text-[#114A53] outline-none focus:border-[#114A53] cursor-pointer shadow-sm transition-all hover:bg-black/5"
          >
            {timeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="absolute right-[15px] top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="#114A53"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] border border-black/20 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
          <p className="text-[#114A53] font-bold uppercase text-sm tracking-wider mb-2">
            Total Students (Tổng học viên)
          </p>
          <p className="text-[28px] font-bold text-[#114A53]">
            {stats.totalStudents} Students
          </p>
          <p className="text-sm text-black/40 mt-1 font-medium italic">
            đăng ký trong giai đoạn này
          </p>
        </div>

        <div className="bg-white p-6 rounded-[20px] border border-black/20 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
          <p className="text-[#114A53] font-bold uppercase text-sm tracking-wider mb-2">
            Total Classes (Tổng lớp học)
          </p>
          <p className="text-[28px] font-bold text-[#114A53]">
            {stats.totalClasses} Classes
          </p>
          <p className="text-sm text-black/40 mt-1 font-medium italic">
            {stats.activeClasses} đang hoạt động
          </p>
        </div>

        <div className="bg-white p-6 rounded-[20px] border border-black/20 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
          <p className="text-[#114A53] font-bold uppercase text-sm tracking-wider mb-2">
            Total Revenue (Tổng doanh thu)
          </p>
          <p className="text-[28px] font-bold text-[#730b08]">
            {stats.totalRevenue.toLocaleString()} VND
          </p>
          <p className="text-sm text-black/40 mt-1 font-medium italic">
            tổng học phí thu được
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white p-6 rounded-[20px] border border-black/20 shadow-sm h-fit">
          <div className="flex flex-col items-center mb-8">
            <h3 className="text-[18px] font-bold text-[#114A53] uppercase tracking-wide">
              Avg Fill Rate (Tỷ lệ lấp đầy các lớp)
            </h3>
          </div>
          <div className="flex flex-col gap-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.fillRates.length > 0 ? (
              stats.fillRates.map((lh, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-[#114A53] text-[16px]">
                      {lh.tenLop} | {lh.tenKhoaHoc}
                    </p>
                    <p className="font-bold text-[#114A53]">{lh.percentage}%</p>
                  </div>
                  <div className="w-full h-[12px] bg-[#d7e8ec]/30 border border-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#a37c7c] transition-all duration-1000"
                      style={{ width: `${lh.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-10 italic text-black/30">
                Không có dữ liệu lớp học
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[20px] h-fit border border-black/20 shadow-sm ">
          <div className="flex flex-col items-center mb-8">
            <h3 className="text-[18px] font-bold text-[#114A53] uppercase tracking-wide">
              Đối tượng học phổ biến
            </h3>
          </div>
          <div className="w-full h-[12px] overflow-hidden border flex border-black/20 rounded-[10px] bg-[#f2f2f2]">
            <div
              className="h-full shrink-0 transition-all duration-1000 bg-[#748284]"
              style={{ width: `${stats.phanTramHV}%` }}
            ></div>
            <div
              className="h-full shrink-0 transition-all duration-1000 bg-[#94bbbc]"
              style={{ width: `${stats.phanTramDL}%` }}
            ></div>
            <div
              className="h-full transition-all duration-1000 bg-[#a97673]"
              style={{ width: `${stats.phanTramKhac}%` }}
            ></div>
          </div>
          <div className="mt-[20px] flex flex-col gap-4">
            <div className="flex gap-2 justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="w-[15px] h-[15px] rounded-[50%] bg-[#869597]"></div>
                <p className="font-medium text-black/70">Học sinh & Sinh viên</p>
              </div>
              <p className="font-bold text-[#114A53]">{Math.round(stats.phanTramHV)}%</p>
            </div>
            <div className="flex gap-2 justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="w-[15px] h-[15px] rounded-[50%] bg-[#94bbbc]"></div>
                <p className="font-medium text-black/70">Đã đi làm</p>
              </div>
              <p className="font-bold text-[#114A53]">{Math.round(stats.phanTramDL)}%</p>
            </div>
            <div className="flex gap-2 justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="w-[15px] h-[15px] rounded-[50%] bg-[#a97673]"></div>
                <p className="font-medium text-black/70">Khác</p>
              </div>
              <p className="font-bold text-[#114A53]">{Math.round(stats.phanTramKhac)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[20px]"></div>

      {loading && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#114A53]"></div>
        </div>
      )}
    </section>
  );
}
