// controller/shippingAddressController.js
const ShippingAddress = require('../models/shippingAddress');

const updateShippingAddress = async (req, res) => {
  try {
    const { fullName, phone, address, city, district, ward, cityName, districtName, wardName } = req.body;
    const userId = req.user.userId; // Lấy userId từ token

    // Tạo một đối tượng chỉ chứa các trường có giá trị
    const updateFields = {};

    if (fullName) updateFields.fullName = fullName;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (city) updateFields.city = city; // Lưu mã city
    if (district) updateFields.district = district; // Lưu mã district
    if (ward) updateFields.ward = ward; // Lưu mã ward
    if (cityName) updateFields.cityName = cityName; // Lưu tên city
    if (districtName) updateFields.districtName = districtName; // Lưu tên district
    if (wardName) updateFields.wardName = wardName; // Lưu tên ward

    // Tìm và cập nhật hoặc tạo mới địa chỉ nhận hàng
    const addressData = await ShippingAddress.findOneAndUpdate(
      { userId: userId }, // Tìm theo userId
      updateFields, // Cập nhật với các trường có giá trị
      { 
        new: true,  // Trả về document đã được cập nhật
        upsert: true,  // Nếu không tìm thấy document thì tạo mới
      });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật địa chỉ thành công!',
      data: addressData,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật địa chỉ:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật địa chỉ.',
    });
  }
};



const getShippingAddress = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy userId từ token

    // Tìm địa chỉ của người dùng
    const addressData = await ShippingAddress.findOne({ userId: userId });

    return res.status(200).json({
      success: true,
      message: addressData
        ? 'Lấy thông tin địa chỉ thành công!'
        : 'Chưa có địa chỉ được lưu!', // Nếu không có địa chỉ, thông báo cho người dùng
      data: addressData || null, // Nếu không có địa chỉ, trả về null
    });
  } catch (error) {
    console.error('Lỗi khi lấy địa chỉ:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy địa chỉ.',
    });
  }
};


module.exports = {
  updateShippingAddress,
   getShippingAddress, // Thêm phương thức lấy thông tin địa chỉ
};
