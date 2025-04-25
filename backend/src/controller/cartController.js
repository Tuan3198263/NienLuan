const Cart = require('../models/cart');
const Product = require('../models/product');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      return res.status(200).json({ message: 'Giỏ hàng trống', items: [], totalPrice: 0 });
    }

    return res.status(200).json({ cart });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng', error: error.message });
  }
};

// Thêm sản phẩm vào giỏ hàng (Mỗi lần nhấn, số lượng +1)
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: "Sản phẩm hết hàng" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return res.status(400).json({ message: `Kho chỉ còn ${product.stock} sản phẩm` });
      }
      existingItem.quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1, priceAtTime: product.price });
    }

    await cart.save();
    
    // Populate để phản hồi giống /getCart
    const updatedCart = await Cart.findOne({ userId }).populate("items.productId");
    return res.status(200).json({ message: "Thêm vào giỏ hàng thành công", cart: updatedCart });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi thêm vào giỏ hàng", error: error.message });
  }
};

// Giảm số lượng sản phẩm trong giỏ hàng (Mỗi lần nhấn, số lượng -1)
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);

    if (existingItem) {
      if (existingItem.quantity > 1) {
        existingItem.quantity -= 1;
      } else {
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
      }
    }

    await cart.save();

    // Populate để phản hồi giống /getCart
    const updatedCart = await Cart.findOne({ userId }).populate("items.productId");
    return res.status(200).json({ message: "Cập nhật giỏ hàng thành công", cart: updatedCart });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi cập nhật giỏ hàng", error: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeItemFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    await cart.save();

    // Populate để phản hồi giống /getCart
    const updatedCart = await Cart.findOne({ userId }).populate("items.productId");
    return res.status(200).json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công", cart: updatedCart });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi xóa sản phẩm khỏi giỏ hàng", error: error.message });
  }
};