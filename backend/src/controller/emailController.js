// controller/emailController.js
const transporter = require('../config/emailConfig');
const Order = require('../models/order'); // Import model Order

exports.sendOrderDeliveredEmail = async (userEmail, orderCode) => {
  try {
    // 🔍 Lấy thông tin đơn hàng từ DB và populate productId để lấy tên & hình ảnh
    const order = await Order.findOne({ orderCode }).populate('items.productId');

    if (!order) {
      return { success: false, message: `Order ${orderCode} not found` };
    }

    // 📦 Tạo danh sách sản phẩm trong email
    const productListHTML = order.items.map(item => {
      const product = item.productId;
      const productImage = product?.images?.length ? product.images[0] : 'https://via.placeholder.com/100'; // Ảnh mặc định nếu không có
      return `
        <tr>
          <td><img src="${productImage}" alt="${product?.name || 'Sản phẩm'}" width="50"></td>
          <td>${product?.name || 'N/A'}</td>
          <td>${item.quantity}</td>
          <td>${item.priceAtTime.toLocaleString()} VNĐ</td>
        </tr>
      `;
    }).join('');

    // 🚚 Thêm phí vận chuyển
    const shippingFee = order.shippingFeeDetails?.finalFee || 0;
    const shippingFeeHTML = `
      <tr>
        <td colspan="3" style="text-align:right;"><strong>Phí vận chuyển:</strong></td>
        <td>${shippingFee.toLocaleString()} VNĐ</td>
      </tr>
    `;

    // 💰 Thêm tổng thanh toán
    const totalPriceHTML = `
      <tr>
        <td colspan="3" style="text-align:right;"><strong>Tổng thanh toán:</strong></td>
        <td><strong>${order.totalPrice.toLocaleString()} VNĐ</strong></td>
      </tr>
    `;

    // 📧 Tạo nội dung email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Đơn hàng #${orderCode} của bạn đã được giao thành công 🎉`,
      html: `
        <p>Xin chào,</p>
        <p>Đơn hàng <strong>#${orderCode}</strong> của bạn đã được giao thành công! 🎉</p>
        <p>Chi tiết đơn hàng:</p>
        <table border="1" cellspacing="0" cellpadding="8">
          <tr>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá</th>
          </tr>
          ${productListHTML}
          ${shippingFeeHTML} 
          ${totalPriceHTML}  
        </table>
        <p>Cảm ơn bạn đã mua sắm với chúng tôi.</p>
        <p>Trân trọng,<br> Đội ngũ hỗ trợ</p>
      `,
    };

    // Gửi email thực tế
    await transporter.sendMail(mailOptions);

    return { success: true, message: `Email sent to ${userEmail} for order #${orderCode}` };
  } catch (error) {
    return { success: false, message: 'Email sending failed', error };
  }
};