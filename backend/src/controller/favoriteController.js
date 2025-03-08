const Favorite = require('../models/favorite'); // Import model Favorite
const Product = require('../models/product'); // Import model Product

// API để Thêm hoặc Xóa sản phẩm yêu thích
exports.toggleFavorite = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId; // Lấy userId từ token

  if (!productId) {
    return res.status(400).json({ message: "productId là bắt buộc." });
  }

  try {
    // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
    const existingFavorite = await Favorite.findOne({ userId, productId });

    if (existingFavorite) {
      // Nếu đã có trong danh sách yêu thích, xóa sản phẩm
      await Favorite.deleteOne({ userId, productId });
      return res.status(200).json({ message: "Bạn đã bỏ yêu thích sản phẩm" });
    } else {
      // Nếu chưa có trong danh sách yêu thích, thêm sản phẩm vào
      const newFavorite = new Favorite({
        userId,
        productId,
      });
      await newFavorite.save();
      return res.status(201).json({ message: "Bạn đã yêu thích sản phẩm" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Có lỗi xảy ra." });
  }
};

// API để Lấy danh sách sản phẩm yêu thích của người dùng
exports.getFavorites = async (req, res) => {
  const userId = req.user.userId; // Lấy userId từ token

  try {
    // Lấy danh sách các productId từ collection Favorite
    const favoriteProducts = await Favorite.find({ userId }).populate('productId');

    // Trả về danh sách sản phẩm yêu thích (trống nếu không có sản phẩm yêu thích)
    const products = favoriteProducts.map(fav => fav.productId); // Lấy thông tin sản phẩm đã được populate
    
    return res.status(200).json(products); // Trả về danh sách sản phẩm, nếu không có sẽ trả về mảng trống
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Có lỗi xảy ra." });
  }
};


// API để kiểm tra trạng thái yêu thích của một sản phẩm
exports.checkFavoriteStatus = async (req, res) => {
  const { productId } = req.params; // Lấy productId từ params
  const userId = req.user.userId; // Lấy userId từ token

  if (!productId) {
    return res.status(400).json({ message: "productId là bắt buộc." });
  }

  try {
    // Kiểm tra xem sản phẩm có trong danh sách yêu thích của người dùng không
    const existingFavorite = await Favorite.findOne({ userId, productId });

    if (existingFavorite) {
      return res.status(200).json({ isFavorite: true }); // Trả về trạng thái yêu thích là true
    } else {
      return res.status(200).json({ isFavorite: false }); // Trả về trạng thái yêu thích là false
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Có lỗi xảy ra." });
  }
};

exports.getFavoriteCountById = async (req, res) => {
  const { productId } = req.params;

  try {
    // Đếm số lượng yêu thích của sản phẩm dựa trên productId
    const favoriteCount = await Favorite.countDocuments({ productId });

    return res.status(200).json({ productId, favoriteCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Có lỗi xảy ra." });
  }
};
