//src/config/emailConfig.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',  // Đây phải là "gmail", không phải "Mail"
    port: 465, // hoặc 587
    secure: true, // true nếu dùng port 465, false nếu dùng 587
    auth: {
        user: process.env.EMAIL_USER,  // Địa chỉ email của bạn
        pass: process.env.EMAIL_PASS,  // Mật khẩu ứng dụng của bạn
  },
});

module.exports = transporter;