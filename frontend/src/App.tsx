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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/khoahoc/:id" element={<KhoaHoc />} />
      <Route path="/XNThanhToan/:id" element={<XNThanhToan />} />
      <Route path="/CaiDat" element={<CaiDat />} />
      <Route path="/ChatBot" element={<ChatBot />} />
    </Routes>
  );
}

export default App;
