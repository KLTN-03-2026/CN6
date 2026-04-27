// const fs = require('fs');
// const path = require('path');
// const OpenAI = require('openai'); // Dùng thư viện OpenAI để gọi NVIDIA (Rất xịn!)
// const { type } = require('os');
// require('dotenv').config();

// // Khởi tạo máy chủ kết nối đến NVIDIA NIM
// const openai = new OpenAI({
//   apiKey: process.env.NVIDIA_API_KEY, // NHỚ DÁN KEY MỚI VÀO FILE .ENV NHÉ!
//   baseURL: 'https://integrate.api.nvidia.com/v1', // Trỏ đường truyền về NVIDIA thay vì ChatGPT
// });

// const test = async()=>{
//   try {
//     const type=2;
//     const giaiThich="";
//     const CauHoi ="What is the man doing in the picture? "
//     const dapAnHocVien ='he is play game'
//     const anh ='anh_TT/meo-lam-bai-thi-toeic-p1.png'
//     let khoangDiem = type == 1 ? "từ 0 đến 2" : "từ 0 đến 6";

//     const noiDungGuiDi = [];

//     // Xử lý File Ảnh sang Base64
//     if (anh !== "") {
//       const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
//       const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
//       const anhBase64 = fs.readFileSync(duongDanAnhThat).toString('base64');
//       const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;
      
//       noiDungGuiDi.push({
//         type: "image_url",
//         image_url: { url: dataUrl }
//       });
//     }

//     // Xử lý Prompt
//     const yeuCau = `
//      Bạn là một giám khảo chấm thi tiếng Anh chuẩn TOEIC/IELTS phần Writing (Tự luận).
      
//       THÔNG TIN BÀI THI:
//       - Câu hỏi: "${CauHoi}"
//       - Hình ảnh đính kèm: (Học viên sẽ miêu tả dựa trên hình ảnh được cung cấp nếu có).
//       - Yêu cầu/Giải thích của giáo viên: "${giaiThich}"

//       BÀI LÀM CỦA HỌC VIÊN:
//       "${dapAnHocVien}"

//       NHIỆM VỤ:
//       Hãy đọc bài làm của học viên, phân tích độ chuẩn xác về ngữ pháp, từ vựng và sự liên quan đến câu hỏi cũng như hình ảnh của đề thi.
      
//       QUAN TRỌNG: Hãy trả về kết quả ĐÚNG theo định dạng JSON sau, không bọc markdown, không kèm theo bất kỳ chữ nào khác:
//       {
//         "diemUocTinh": "Số điểm ${khoangDiem}",
//         "loiNhanXet": "Lời nhận xét chi tiết bằng tiếng Việt để học viên có thể cải thiện (ngắn gọn nhất có thể, đúng trọng tâm),(LƯU Ý QUAN TRỌNG: Viết liền trên 1 dòng duy nhất, tuyệt đối KHÔNG sử dụng ký tự xuống dòng ở đây)"
//       }
//     `;
//     noiDungGuiDi.push({ type: "text", text: yeuCau });

//     console.log("⏳ Đang nhờ NVIDIA NIM (Llama 3.2 Vision) chấm bài...");

//     // Gọi API của NVIDIA
//     const ketQua = await openai.chat.completions.create({
//       model: "meta/llama-3.2-90b-vision-instruct", // Trỏ đúng tên model bạn vừa xem
//       messages: [{ role: "user", content: noiDungGuiDi }],
//       temperature: 0.2, 
//       max_tokens: 512,
//     });

//     const phanHoiTuAI = ketQua.choices[0].message.content;
    
//     // Dọn dẹp JSON
//     let chuoiJsonSach = phanHoiTuAI.replace(/```json|```/g, "").trim();
//     chuoiJsonSach = chuoiJsonSach.replace(/[\r\n\t]+/g, " "); 
//     const ketQuaHoanChinh = JSON.parse(chuoiJsonSach);
    
//     console.log("🎯 KẾT QUẢ TỪ NVIDIA:", ketQuaHoanChinh);

//     // return res.status(200).json({ trangThai: "tc", data: ketQuaHoanChinh });

//   } catch (loi) {
//     console.error("❌ Lỗi hệ thống NVIDIA NIM:", loi.message);
//     // res.status(500).json({ trangThai: "tb", loi: "Hệ thống AI đang bận." });
//   }
// };
// test();

const fs = require('fs');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai'); // Nhúng thư viện Mistral
require('dotenv').config();
const express = require('express');
const app= express();
const port = 3000;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const cors = require('cors');

const multer = require('multer');

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const Groq = require('groq-sdk');
const OpenAI = require('openai');


// Khởi tạo máy chủ kết nối đến Mistral
const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});


const wav = require('node-wav');
const { PitchDetector } = require('pitchy');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const bocBangWhisper = async (duongDanFile) => {
  try {
    console.log("Đang gửi file .webm cho Whisper bóc băng...");
    const duongDanAudioThat = path.join(__dirname, '../backend/', duongDanFile); 
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(duongDanAudioThat),
      model: "whisper-large-v3", // Sử dụng model Whisper V2/V3 mới nhất
      response_format: "verbose_json", // Bắt buộc để lấy được timestamp
      timestamp_granularities: ["word"], // Yêu cầu bóc tách thời gian từng từ một
    });

    console.log("✅ Whisper bóc băng hoàn tất!");
    
    return transcription;
    

  } catch (error) {
    console.error("❌ Lỗi khi gọi Whisper API:", error.message);
    throw error;
  }
};

module.exports = { bocBangWhisper };

// --- 1. TRẠM CHUYỂN ĐỔI ÂM THANH (FFMPEG) ---
const chuyenDoiWebmSangWav = (duongDanWebmGoc, duongDanWavDich) => {
  return new Promise((resolve, reject) => {
    ffmpeg(duongDanWebmGoc)
      .audioChannels(1) 
      .audioFrequency(16000) 
      .audioCodec('pcm_s16le') // Ép chuẩn PCM 16-bit cho thư viện wav đọc
      .on('end', () => resolve(duongDanWavDich))
      .on('error', (err) => reject(err))
      .save(duongDanWavDich);
  });
};

// --- 2. HÀM TÍNH TOÁN TOÁN HỌC ---
const tinhDoLechChuan = (mangSo) => {
  if (mangSo.length === 0) return 0;
  const trungBinh = mangSo.reduce((a, b) => a + b) / mangSo.length;
  const phuongSai = mangSo.reduce((a, b) => a + Math.pow(b - trungBinh, 2), 0) / mangSo.length;
  return Math.sqrt(phuongSai);
};

// --- 3. TRẠM ĐO LƯỜNG NGỮ ĐIỆU (PITCHY) ---
const phanTichNguDieuBangJS = async (duongDanWav) => {
  try {
    console.log("Đang dùng JS thuần đo lường sóng âm...");
    
    // Đọc trực tiếp file WAV vừa được FFmpeg sinh ra
    const buffer = fs.readFileSync(duongDanWav);
    const result = wav.decode(buffer);
    
    const audioData = result.channelData[0]; 
    const sampleRate = result.sampleRate;

    const doDaiKhung = 2048; 
    const detector = PitchDetector.forFloat32Array(doDaiKhung);
    const mangCaoDo = [];

    for (let i = 0; i < audioData.length - doDaiKhung; i += doDaiKhung) {
      const khungAmThanh = audioData.slice(i, i + doDaiKhung);
      const [pitch, clarity] = detector.findPitch(khungAmThanh, sampleRate);
      
      if (clarity > 0.8 && pitch > 50 && pitch < 500) {
        mangCaoDo.push(pitch);
      }
    }

    const doLechChuanF0 = tinhDoLechChuan(mangCaoDo);
    
    let nhanXet = "Chưa xác định";
    if (doLechChuanF0 < 20) {
      nhanXet = "Giọng đọc khá đều đều (Monotone), chưa có sự nhấn nhá trọng âm câu.";
    } else {
      nhanXet = "Giọng đọc có ngữ điệu tốt, trầm bổng và tự nhiên.";
    }

    console.log(`✅ Tính toán xong! Độ biến thiên cao độ (F0 SD): ${doLechChuanF0.toFixed(2)} Hz`);
    return {
      f0_SD: doLechChuanF0.toFixed(2),
      nhanXetNguDieu: nhanXet
    };

  } catch (error) {
    console.error("❌ Lỗi khi phân tích sóng âm bằng JS:", error);
    throw error;
  }
};

// --- 4. LUỒNG CHẠY TEST TỔNG THỂ ---
const chayThuHeThong = async (fileWebmGoc) => {
  try {
    // Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn
    
    const fileWavDich = fileWebmGoc.replace('.webm', '.wav'); 

    console.log("⏳ BƯỚC 1: Đang ép kiểu file .webm sang .wav...");
    await chuyenDoiWebmSangWav(fileWebmGoc, fileWavDich);
    console.log("✅ Ép kiểu thành công!");

    console.log("⏳ BƯỚC 2: Đưa file .wav chuẩn vào thư viện đo sóng âm...");
    const ketQua = await phanTichNguDieuBangJS(fileWavDich); 
    
    console.log("🎯 KẾT QUẢ CUỐI CÙNG:");
    return ketQua;

  } catch (error) {
    console.error("❌ Luồng chạy thất bại:", error);
  }
};

const test = async()=> {
  try {
    
    
    const CauHoi ="What is the man doing in the picture? ";
    const dapAnHocVien='taiNguyen/fileGhiAm_HV/bai_speaking_1777200512438_48.webm';
    const giaiThich="";
    const anh="anh_TT/meo-lam-bai-thi-toeic-p1.png";
    const type=2;
    let khoangDiem = type == 1 ? "từ 0 đến 2" : "từ 0 đến 6";
    const nguDieu = await chayThuHeThong(dapAnHocVien);
    const Whisper = await bocBangWhisper(dapAnHocVien);
    console.log(nguDieu);
    console.log(Whisper);
    const noiDungGuiDi = [];

    // 1. Ép file ảnh sang Base64
    if (anh !== "") {
      const duongDanAnhThat = path.join(__dirname, '../backend/taiNguyen', anh);
      const mimeTypeAnh = anh.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const anhBase64 = fs.readFileSync(duongDanAnhThat).toString('base64');
      const dataUrl = `data:${mimeTypeAnh};base64,${anhBase64}`;
      
      noiDungGuiDi.push({
        type: "image_url",
        imageUrl: dataUrl // Theo chuẩn SDK của Mistral
      });
    }

    // 2. Chuẩn bị Prompt
    const yeuCau = `Bạn là một giám khảo chấm thi tiếng Anh chuẩn TOEIC/IELTS.
      THÔNG TIN BÀI THI:
        - Câu hỏi: "${CauHoi}"
        - Hình ảnh đính kèm: có thể có hoặc không.
        - Yêu cầu/Giải thích của giáo viên: "${giaiThich}"

      DỮ LIỆU BÀI LÀM CỦA HỌC VIÊN:
        - Nội dung học viên đã nói: "${Whisper.text}"
        - Đánh giá ngữ điệu giọng nói: "${nguDieu.nhanXetNguDieu}"

      Dựa vào nội dung bóc băng và đánh giá ngữ điệu, hãy phân tích độ trôi chảy, ngữ pháp, từ vựng và sự liên quan đến đề thi.
      
      QUAN TRỌNG: Hãy trả về kết quả ĐÚNG theo định dạng JSON sau, không bọc markdown, không kèm chữ nào khác:
      {
        "diemUocTinh": "Số điểm từ 0-8",
        "loiNhanXet": "Lời nhận xét chi tiết bằng tiếng Việt để học viên có thể cải thiện (ngắn gọn nhất có thể, đúng trọng tâm),(LƯU Ý QUAN TRỌNG: Viết liền trên 1 dòng duy nhất, tuyệt đối KHÔNG sử dụng ký tự xuống dòng ở đây)"
      }`;
      
    noiDungGuiDi.push({ type: "text", text: yeuCau });

    console.log("⏳ Đang nhờ Pixtral 12B (Mistral AI) chấm bài...");

    // 3. Đạp ga gọi API Mistral
    const ketQua = await client.chat.complete({
      model: "pixtral-12b-2409", // Cỗ máy Vision cực xịn của Mistral
      messages: [{ role: "user", content: noiDungGuiDi }],
      temperature: 0.2,
      responseFormat: { type: "json_object" } // Bắt buộc Mistral trả về JSON 100% sạch
    });

    const phanHoiTuAI = ketQua.choices[0].message.content;
    
    // 4. Dọn dẹp JSON an toàn
    let chuoiJsonSach = phanHoiTuAI.replace(/```json|```/g, "").trim();
    chuoiJsonSach = chuoiJsonSach.replace(/[\r\n\t]+/g, " "); 
    const ketQuaHoanChinh = JSON.parse(chuoiJsonSach);
    
    console.log("🎯 KẾT QUẢ TỪ MISTRAL:", ketQuaHoanChinh);

    // return res.status(200).json({ trangThai: "tc", data: ketQuaHoanChinh });

  } catch (loi) {
    console.error("❌ Lỗi hệ thống Mistral:", loi.message);
    // res.status(500).json({ trangThai: "tb", loi: "Hệ thống AI đang bận." });
  }
};
test()