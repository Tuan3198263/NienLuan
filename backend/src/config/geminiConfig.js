const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Lấy API key từ biến môi trường
const API_KEY = process.env.GEMINI_API_KEY;

// Khởi tạo Google Generative AI với API key
const genAI = new GoogleGenerativeAI(API_KEY);

// Cấu hình model Gemini - chỉ sử dụng model gemini-pro
const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash", 
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048, // Giảm xuống để tránh vượt quá giới hạn
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ],
  });
};

module.exports = {
  getGeminiModel
};
