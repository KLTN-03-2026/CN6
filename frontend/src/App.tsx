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
    </Routes>
  );
}

export default App;
