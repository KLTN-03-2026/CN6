import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";

import { Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./page/index";
import KhoaHoc from "./page/KhoaHoc";
import XNThanhToan from "./page/xnThanhToan";
import CaiDat from "./page/CaiDat";
import ChatBot from "./page/componan/ChatBot";
import HocVien_QlHocTap from "./page/HocVien_QLhocTap";
import HV_QlLopHoc from "./page/HV_QlLopHoc";
import HocTuVung from "./page/HocTuVung";
import Test from "./page/componan/test";
import HV_ChiTietBaiTap from "./page/HV_ChiTietBaiTap";
import Hv_baiTapDaLam from "./page/HV_baiTapDaLam";
import Admin_QL from "./page/Admin_QL";
import ThemChinhSuaKH from "./page/ThemChinhSuaKH";
import Ql_ChiTietLopHoc from "./page/Ql_ChiTietLopHoc";
import QL_ChiTietBaiTap from "./page/QL_ChiTietBaiTap";
import QL_ChamDiemBT from "./page/QL_ChamDiemBT";
import XemVideoBaiGiang from "./page/componan/xemVideoBaiGiang";
import QL_chiTietLuyenDe from "./page/QL_chiTietLuyenDe";
import HV_luyenDe from "./page/HV_luyenDe";
import HV_chiTietLuyenDe from "./page/HV_chiTietLuyenDe";
import HV_LamBaiLuyenDe from "./page/HV_LamBaiLuyenDe";
import QL_chiTietThiThu from "./page/QL_chiTietThiThu";
import HV_thiThu from "./page/HV_thiThu";
import QL_ChiTietKTDauVao from "./page/QL_ChiTietKTDauVao";
import HV_kiemTraDauVao from "./page/HV_kiemTraDauVao";
import HV_lamKtDauVao from "./page/HV_lamKtDauVao";
import HV_chiTietThiThu from "./page/HV_chiTietThiThu";
import HV_LamBaiThiThu from "./page/HV_LamBaiThiThu";
import HV_KetQuaThiThu from "./page/HV_KetQuaThiThu";
import GV_QL from "./page/GV_QL";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/khoahoc/:id" element={<KhoaHoc />} />
      <Route path="/XNThanhToan/:id" element={<XNThanhToan />} />
      <Route path="/CaiDat" element={<CaiDat />} />
      <Route path="/HocVien/QlHocTap" element={<HocVien_QlHocTap />} />
      <Route path="/HocVien/QlLopHoc/:id" element={<HV_QlLopHoc />} />
      <Route path="/HocVien/HocTuVung/:id" element={<HocTuVung />} />
      <Route path="/Test" element={<Test />} />
      <Route path="/chiTietBaiTap/:id" element={<HV_ChiTietBaiTap />} />
      <Route path="/theChiTietBaiTapDaLam/:id" element={<Hv_baiTapDaLam />} />
      <Route path="/admin/QL" element={<Admin_QL />} />
      <Route path="/giangVien/QL" element={<GV_QL />} />
      <Route path="/ThemChinhSuaKH/:id" element={<ThemChinhSuaKH />} />
      <Route path="/Ql_ChiTietLopHoc/:id" element={<Ql_ChiTietLopHoc />} />
      <Route path="/Ql_ChiTietBaiTap/:id" element={<QL_ChiTietBaiTap />} />
      <Route path="/QL_ChamDiemBT/:id/:email" element={<QL_ChamDiemBT />} />
      <Route path="/XemVideoBaiGiang/:id" element={<XemVideoBaiGiang />} />
      <Route path="/QL_chiTietLuyenDe/:id" element={<QL_chiTietLuyenDe />} />
      <Route path="/HV_luyenDe" element={<HV_luyenDe />} />
      <Route path="/HV_chiTietLuyenDe/:id" element={<HV_chiTietLuyenDe />} />
      <Route
        path="/HV_LamBaiLuyenDe/:id/:tenPart"
        element={<HV_LamBaiLuyenDe />}
      />
      <Route path="/QL_chiTietThiThu/:id" element={<QL_chiTietThiThu />} />
      <Route path="/HV_ThiThu" element={<HV_thiThu />} />
      <Route path="/QL_ChiTietKTDauVao/:id" element={<QL_ChiTietKTDauVao />} />
      <Route path="/HV_kiemTraDauVao" element={<HV_kiemTraDauVao />} />
      <Route path="/HV_lamKtDauVao/:id" element={<HV_lamKtDauVao />} />
      <Route path="/HV_chiTietThiThu/:id" element={<HV_chiTietThiThu />} />
      <Route path="/HV_LamBaiThiThu/:id" element={<HV_LamBaiThiThu />} />
      <Route path="/HV_KetQuaThiThu/:id" element={<HV_KetQuaThiThu />} />
    </Routes>
  );
}

export default App;
