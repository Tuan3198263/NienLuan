const { getGeminiModel } = require('../config/geminiConfig');
const ChatHistory = require('../models/chatHistory');
const Product = require('../models/product');
const Category = require('../models/category');
const Brand = require('../models/brand');
const Order = require('../models/order');
const { v4: uuidv4 } = require('uuid');
const { getIO } = require('../utils/socketManager');

// Tạo system prompt ban đầu cho chatbot
const getSystemPrompt = async () => {
  try {
    // Lấy tất cả danh mục sản phẩm
    const categories = await Category.find({ status: 'active' });
    const categoryNames = categories.map(cat => cat.name).join(', ');
    
    // Lấy tất cả thương hiệu
    const brands = await Brand.find({});
    const brandNames = brands.map(brand => brand.name).join(', ');
    
    // Lấy tổng số sản phẩm trong hệ thống
    const productCount = await Product.countDocuments({ active: true });
    
    // Lấy 15 sản phẩm nổi bật để cung cấp ví dụ
    const featuredProducts = await Product.find({ featured: true, active: true })
      .populate('category', 'name')
      .populate('brand', 'name')
      .limit(15);
    
    let featuredProductsInfo = '';
    if (featuredProducts && featuredProducts.length > 0) {
      featuredProductsInfo = 'Một số sản phẩm nổi bật của cửa hàng:\n';
      featuredProducts.forEach((product, index) => {
        featuredProductsInfo += `${index + 1}. ${product.name} - ${product.brand?.name || 'Không rõ thương hiệu'} - ${product.category?.name || 'Không rõ danh mục'} - Giá: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}\n`;
      });
    }

    // Tạo system prompt
    return `Bạn là trợ lý ảo thông minh của cửa hàng mỹ phẩm Glown. Hãy trả lời các câu hỏi của khách hàng một cách lịch sự, chuyên nghiệp, hữu ích và thân thiện.
  
Thông tin về cửa hàng:
- Tên cửa hàng: Glown 🌟
- Chuyên về: Mỹ phẩm, chăm sóc da, chăm sóc cá nhân, trang điểm, phụ kiện
- Số lượng sản phẩm: ${productCount} sản phẩm đang được bán
- Các danh mục sản phẩm: ${categoryNames}
- Các thương hiệu: ${brandNames}
- Website: glown.vn
- Chính sách đổi trả: 30 ngày
- Phí vận chuyển: giảm từ 5-25k khi đặt hàng
- Đơn hàng tối đa 5 triệu VNĐ
- Chỉ được đánh giá khi đã mua sản phẩm
- Phương thức thanh toán: chỉ hỗ trợ thanh toán bằng tiền mặt COD
- Thời gian giao hàng từ 2-5 ngày tùy khu vực

Tính năng của website:
- Đăng nhập/đăng ký tài khoản
- Chỉnh sửa thông tin cá nhân (tên, email, mật khẩu,ảnh đại diện,avatar v.v.)
- Thêm/sửa/xóa địa chỉ giao hàng
- Yêu thích sản phẩm (lưu sản phẩm vào mục yêu thích)
- Đánh giá sản phẩm (chỉ khi đã mua)
- Thêm sản phẩm vào giỏ hàng và thanh toán
- Theo dõi trạng thái đơn hàng thông qua mã đơn (orderCode)
- Tra cứu lịch sử đơn hàng
- Tìm kiếm sản phẩm bằng danh mục, từ khóa
- Lọc sản phẩm theo thương hiệu, giá
- Lưu lại lịch sử đơn hàng
- Đặt hàng nhanh chóng
- Trò chuyện với trợ lý ảo để được hỗ trợ

Trạng thái đơn hàng:
- pending: đơn hàng mới, đang chờ xác nhận
- processed: đơn hàng đã được xác nhận, nhân viên đang xử lý
- shipped: đơn hàng đang được vận chuyển
- delivered: đơn hàng đã giao thành công
- canceled: đơn hàng đã bị hủy
- returned: đơn hàng đã được trả lại

${featuredProductsInfo}

Hướng dẫn:
1. Trả lời ngắn gọn, rõ ràng, thân thiện và chuyên nghiệp.
2. Sử dụng emoji phù hợp trong câu trả lời để tạo sự thân thiện (như 😊, ✨, 🌿, 💫, 💆‍♀️).
3. Khi được hỏi về sản phẩm, hãy sử dụng thông tin sản phẩm chính xác đã được cung cấp.
4. Luôn ưu tiên giới thiệu sản phẩm có trong cửa hàng nếu được hỏi về loại sản phẩm cụ thể.
5. Khi giới thiệu thành phần sản phẩm, hãy nêu rõ công dụng của thành phần đó và phù hợp với loại da nào.
6. Khi được hỏi về giá cả, hãy đề xuất sản phẩm theo nhiều mức giá khác nhau nếu có thể.
7. Khi khách hỏi về loại da, đưa ra gợi ý phù hợp với từng loại da.
8. Khi được hỏi về tính năng của website, giải thích chi tiết cách sử dụng.
9. Khi khách hàng hỏi về trạng thái đơn hàng, hướng dẫn họ cách tra cứu bằng mã đơn hàng.
10. Kết thúc bằng câu hỏi xem bạn có thể giúp gì thêm không.

Hãy trả lời bằng tiếng Việt, trừ khi khách hàng hỏi bằng tiếng Anh.`;
  } catch (error) {
    console.error('Lỗi khi tạo system prompt:', error);
    
    // Trả về prompt mặc định nếu có lỗi
    return `Bạn là trợ lý ảo thông minh của cửa hàng mỹ phẩm Glown. Hãy trả lời các câu hỏi của khách hàng một cách lịch sự, chuyên nghiệp và hữu ích.
    
Hãy sử dụng emoji phù hợp trong câu trả lời để tạo sự thân thiện (như 😊, ✨, 🌿, 💫, 💆‍♀️).
    
Hãy trả lời bằng tiếng Việt, trừ khi khách hàng hỏi bằng tiếng Anh.`;
  }
};

// Tạo hoặc lấy phiên chat
exports.createOrGetSession = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ token xác thực
    let { sessionId } = req.query;

    // Nếu không có sessionId, tạo mới
    if (!sessionId) {
      sessionId = uuidv4();
      // Tạo phiên chat mới với message chào mừng
      await ChatHistory.create({
        userId,
        sessionId,
        messages: [{
          role: 'assistant',
          content: 'Xin chào! Tôi là trợ lý ảo của Glown. Tôi có thể giúp gì cho bạn!'
        }]
      });
    }

    // Lấy lịch sử chat
    const chatHistory = await ChatHistory.findOne({ userId, sessionId });

    if (!chatHistory) {
      return res.status(404).json({ message: 'Không tìm thấy phiên chat' });
    }

    return res.status(200).json({ 
      success: true, 
      sessionId, 
      messages: chatHistory.messages 
    });
  } catch (error) {
    console.error('Lỗi khi tạo/lấy phiên chat:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xác định các loại sản phẩm phổ biến để phục vụ tìm kiếm
const productTypes = [
  'kem đánh răng', 'kem dưỡng', 'kem chống nắng', 'kem nền', 'sữa rửa mặt',
  'serum', 'mặt nạ', 'son', 'phấn', 'nước tẩy trang', 'nước hoa hồng',
  'tẩy tế bào chết', 'dầu gội', 'dầu xả', 'sữa tắm', 'kem dưỡng thể',
  'mascara', 'phấn mắt', 'kẻ mắt', 'kẻ mày', 'toner', 'kem dưỡng ẩm','túi đeo','bàn chải','Gel', 'kính mát', 'đồ chơi','máy sấy tóc'
];

// Tìm kiếm sản phẩm dựa trên từ khóa
const searchProducts = async (keyword) => {
  if (!keyword) return [];
  
  // Làm sạch từ khóa tìm kiếm
  const cleanKeyword = keyword.toLowerCase()
    .replace(/\?/g, '')  // Loại bỏ dấu hỏi
    .replace(/có bán|có sản phẩm|bán|cung cấp/gi, ''); // Loại bỏ các từ không cần thiết
  
  // Tách từ khóa để tìm kiếm chính xác hơn
  const keywords = cleanKeyword.split(/\s+/).filter(word => word.length > 2);
  
  // Xác định loại sản phẩm từ câu hỏi
  let productTypeMatches = [];
  productTypes.forEach(type => {
    if (cleanKeyword.includes(type)) {
      productTypeMatches.push(type);
    }
  });
  
  // Nếu tìm được loại sản phẩm cụ thể, ưu tiên sử dụng nó
  let searchConditions = [];
  if (productTypeMatches.length > 0) {
    // Sắp xếp theo độ dài để lấy loại sản phẩm cụ thể nhất (dài nhất)
    const longestMatch = productTypeMatches.sort((a, b) => b.length - a.length)[0];
    console.log(`Tìm thấy loại sản phẩm: ${longestMatch}`);
    
    searchConditions = [{
      $or: [
        { name: { $regex: longestMatch, $options: 'i' } },
        { description: { $regex: longestMatch, $options: 'i' } },
        { 'category.name': { $regex: longestMatch, $options: 'i' } }
      ]
    }];
  } else if (keywords.length > 0) {
    // Nếu không tìm thấy loại sản phẩm cụ thể, sử dụng các từ khóa
    searchConditions = keywords.map(word => ({
      $or: [
        { name: { $regex: word, $options: 'i' } },
        { description: { $regex: word, $options: 'i' } },
        { ingredients: { $regex: word, $options: 'i' } },
        { usage: { $regex: word, $options: 'i' } }
      ]
    }));
  } else {
    return []; // Không tìm được từ khóa phù hợp
  }
  
  
  // Tìm kiếm sản phẩm dựa trên các điều kiện
  const products = await Product.find({
    active: true,
    $and: searchConditions
  })
  .populate('category', 'name')
  .populate({
    path: 'brand',
    select: 'name logo description' // Lấy thêm thông tin về thương hiệu
  })
  .limit(5); // Giới hạn số kết quả trả về
  
  return products;
};

// Kiểm tra xem người dùng đang hỏi về sự tồn tại của sản phẩm nào đó
const isProductExistenceQuery = (message) => {
  const existenceKeywords = [
    'có bán', 'có sản phẩm', 'có loại', 'có hàng', 
    'bán không', 'có không', 'bán loại', 'có cung cấp',
    'có... không', 'có ... không', 'cửa hàng có'
  ];
  
  message = message.toLowerCase();
  return existenceKeywords.some(keyword => message.includes(keyword));
};

// Tìm kiếm sản phẩm dựa trên tin nhắn hỏi về sự tồn tại
const searchProductsByExistenceQuery = async (message) => {
  // Xác định các loại sản phẩm được nhắc đến trong tin nhắn
  let mentionedTypes = [];
  productTypes.forEach(type => {
    if (message.toLowerCase().includes(type)) {
      mentionedTypes.push(type);
    }
  });
  
  // Sắp xếp theo độ dài để lấy loại cụ thể nhất (dài nhất) trước
  mentionedTypes.sort((a, b) => b.length - a.length);
  
  if (mentionedTypes.length === 0) {
    return [];
  }
  
  console.log("Các loại sản phẩm được nhắc đến:", mentionedTypes);
  
  // Tìm sản phẩm dựa trên loại sản phẩm đầu tiên và dài nhất
  const products = await Product.find({
    active: true,
    $or: [
      { name: { $regex: mentionedTypes[0], $options: 'i' } },
      { description: { $regex: mentionedTypes[0], $options: 'i' } }
    ]
  })
  .populate('category', 'name')
  .populate({
    path: 'brand',
    select: 'name logo description'
  })
  .limit(4);
  
  return { products, productType: mentionedTypes[0] };
};

// Tìm kiếm sản phẩm theo tên chính xác
const searchExactProduct = async (productName) => {
  if (!productName) return null;
  
  // Tìm kiếm sản phẩm có tên tương tự nhất
  const product = await Product.findOne({
    active: true,
    name: { $regex: new RegExp(productName, 'i') }
  })
  .populate('category', 'name')
  .populate({
    path: 'brand',
    select: 'name logo description'
  });
  
  return product;
};

// Tìm kiếm sản phẩm theo danh mục
const searchProductsByCategory = async (categoryName) => {
  // Tìm danh mục dựa trên tên
  const category = await Category.findOne({ 
    name: { $regex: categoryName, $options: 'i' },
    status: 'active'
  });
  
  if (!category) return [];
  
  // Tìm sản phẩm trong danh mục
  const products = await Product.find({
    category: category._id,
    active: true
  })
  .populate('category', 'name')
  .populate({
    path: 'brand',
    select: 'name logo description'
  })
  .limit(4); // Hiển thị ít hơn để không quá nhiều thông tin
  
  return products;
};

// Tìm kiếm sản phẩm theo thương hiệu
const searchProductsByBrand = async (brandName) => {
  const brand = await Brand.findOne({ 
    name: { $regex: brandName, $options: 'i' } 
  });
  
  if (!brand) return [];
  
  const products = await Product.find({
    active: true,
    brand: brand._id
  })
  .populate('category', 'name')
  .populate({
    path: 'brand',
    select: 'name logo description'
  })
  .limit(4);
  
  return products;
};

// Tìm kiếm sản phẩm cho loại da cụ thể
const searchProductsForSkinType = async (skinType) => {
  // Từ khóa đặc trưng cho loại da khác nhau
  const skinTypeKeywords = {
    'da khô': ['khô', 'da khô', 'hydrating', 'dưỡng ẩm sâu', 'phục hồi'],
    'da dầu': ['dầu', 'da dầu', 'oil control', 'kiểm soát dầu', 'nhờn'],
    'da hỗn hợp': ['hỗn hợp', 'da hỗn hợp', 'balance', 'cân bằng'],
    'da nhạy cảm': ['nhạy cảm', 'da nhạy cảm', 'sensitive', 'dịu nhẹ', 'không kích ứng'],
    'da mụn': ['mụn', 'da mụn', 'acne', 'trị mụn'],
    'da lão hóa': ['lão hóa', 'da lão hóa', 'anti-aging', 'wrinkle', 'nếp nhăn']
  };
  
  // Xác định loại da từ câu hỏi
  let targetSkinType = 'da thường';
  for (const [type, keywords] of Object.entries(skinTypeKeywords)) {
    if (keywords.some(word => skinType.toLowerCase().includes(word))) {
      targetSkinType = type;
      break;
    }
  }
  
  // Tìm các sản phẩm phù hợp với loại da
  const products = await Product.find({
    active: true,
    $or: [
      { description: { $regex: targetSkinType, $options: 'i' } },
      { usage: { $regex: targetSkinType, $options: 'i' } }
    ]
  })
  .populate('category', 'name')
  .populate({
    path: 'brand',
    select: 'name logo description'
  })
  .limit(4);
  
  return {products, skinType: targetSkinType};
};

// Định dạng thông tin sản phẩm cho việc hiển thị
const formatProductInfo = (products) => {
  if (!products || products.length === 0) return [];
  
  return products.map(product => {
    const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
    
    return {
      id: product._id,
      name: product.name,
      price: formattedPrice,
      rawPrice: product.price,
      brand: {
        name: product.brand?.name || 'Chưa cập nhật',
        logo: product.brand?.logo || null,
        description: product.brand?.description || null
      },
      category: product.category?.name || 'Chưa cập nhật',
      image: imageUrl,
      images: product.images || [],
      description: product.description || '',
      ingredients: product.ingredients || '',
      usage: product.usage || '',
      slug: product.slug || ''
    };
  });
};

// Kiểm tra xem người dùng đang hỏi về sản phẩm không
const isProductQuery = (message) => {
  const productKeywords = [
    'sản phẩm', 'mua', 'bán', 'giá', 'hàng', 'gợi ý',
    'kem', 'serum', 'mặt nạ', 'toner', 'sữa rửa mặt',
    'có bán', 'bao nhiêu tiền', 'bao nhiêu', 'giá cả',
    'son', 'phấn', 'nước hoa', 'dưỡng da', 'thương hiệu',
    'nhãn hiệu', 'brand', 'sản xuất', 'loại da', 'chống nắng',
    'tẩy trang', 'làm sạch', 'dưỡng ẩm', 'chăm sóc'
  ];
  
  message = message.toLowerCase();
  return productKeywords.some(keyword => message.includes(keyword.toLowerCase()));
};

// Kiểm tra xem tin nhắn có yêu cầu về danh mục không
const extractCategoryFromMessage = (message) => {
  const commonCategories = [
    'sữa rửa mặt', 'tẩy trang', 'serum', 'kem dưỡng', 'mặt nạ',
    'chống nắng', 'tẩy tế bào chết', 'toner', 'nước hoa hồng'
  ];
  
  message = message.toLowerCase();
  for (const category of commonCategories) {
    if (message.includes(category.toLowerCase())) {
      return category;
    }
  }
  
  return null;
};

// Tạo văn bản mô tả sản phẩm cho chatbot
const createProductDescription = (product) => {
  return `
🎁 ${product.name}
💰 Giá: ${product.price}
🏷️ Thương hiệu: ${product.brand}
📋 Danh mục: ${product.category}

🔍 Mô tả: ${product.description}

🌿 Thành phần: ${product.ingredients}

📝 Cách dùng: ${product.usage}
  `;
};

// Kiểm tra xem tin nhắn có yêu cầu tra cứu đơn hàng không
const isOrderQuery = (message) => {
  const orderKeywords = [
    'tình trạng đơn hàng', 'trạng thái đơn hàng', 'đơn hàng của tôi',
    'theo dõi đơn hàng', 'kiểm tra đơn hàng', 'tra cứu đơn hàng',
    'tra mã đơn', 'mã đơn hàng', 'đơn của tôi', 'đơn hàng số',
    'track order', 'order status', 'đơn đặt hàng', 'đơn', 'đơn này','mã đơn','mã đơn hàng','mã đơn hàng của tôi','tình trạng', 'trạng thái đơn'
  ];
  
  message = message.toLowerCase();
  return orderKeywords.some(keyword => message.includes(keyword.toLowerCase()));
};

// Tìm kiếm mã đơn hàng trong tin nhắn
const extractOrderCode = (message) => {
  // Tìm mã đơn hàng có dạng: chữ cái + số, độ dài từ 6-8 ký tự
  const orderCodePattern = /\b[A-Za-z0-9]{6,8}\b/g;
  const matches = message.match(orderCodePattern);
  
  if (matches && matches.length > 0) {
    // Trả về mã đơn hàng có dạng đúng nhất (ưu tiên chữ cái + số)
    return matches.find(code => /^[A-Za-z]/.test(code)) || matches[0];
  }
  
  return null;
};

// Tìm kiếm đơn hàng theo mã
const searchOrderByCode = async (orderCode) => {
  if (!orderCode) return null;
  
  try {
    const order = await Order.findOne({ orderCode: orderCode.toUpperCase() })
      .populate({
        path: 'items.productId',
        select: 'name images price'
      });
    
    return order;
  } catch (error) {
    console.error('Lỗi khi tìm kiếm đơn hàng:', error);
    return null;
  }
};

// Định dạng thông tin đơn hàng cho việc hiển thị
const formatOrderInfo = (order) => {
  if (!order) return null;
  
  const statusMap = {
    'pending': 'Chờ xác nhận',
    'processed': 'Đã xác nhận, đang xử lý',
    'shipped': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'canceled': 'Đã hủy',
    'returned': 'Đã trả hàng'
  };
  
  const orderDate = new Date(order.orderDate).toLocaleDateString('vi-VN');
  const estimatedDelivery = order.estimatedDeliveryDate 
    ? new Date(order.estimatedDeliveryDate).toLocaleDateString('vi-VN') 
    : 'Chưa xác định';
  
  const formattedPrice = new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(order.totalPrice);
  
  return {
    orderCode: order.orderCode,
    status: statusMap[order.status] || 'Không xác định',
    rawStatus: order.status,
    date: orderDate,
    estimatedDelivery: estimatedDelivery,
    totalPrice: formattedPrice,
    items: order.items.map(item => ({
      name: item.productId?.name || 'Sản phẩm không xác định',
      quantity: item.quantity,
      price: new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(item.priceAtTime)
    })),
    shippingInfo: {
      fullName: order.shippingInfo.fullName,
      address: `${order.shippingInfo.address}, ${order.shippingInfo.wardName}, ${order.shippingInfo.districtName}, ${order.shippingInfo.cityName}`
    }
  };
};

// Gửi tin nhắn đến chatbot và nhận phản hồi
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ token xác thực
    const { sessionId, message } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ message: 'Thiếu nội dung tin nhắn hoặc sessionId' });
    }

    // Tìm lịch sử chat
    let chatHistory = await ChatHistory.findOne({ userId, sessionId });
    if (!chatHistory) {
      // Nếu không tìm thấy, tạo mới
      chatHistory = await ChatHistory.create({
        userId,
        sessionId,
        messages: []
      });
    }

    // Thêm tin nhắn của người dùng vào lịch sử
    chatHistory.messages.push({
      role: 'user',
      content: message
    });
    
    await chatHistory.save();

    // Kiểm tra các loại yêu cầu từ tin nhắn
    let productInfoList = [];
    let orderInfo = null;
    let contextInfo = '';
    let additionalPrompt = '';
    
    // Phân tích yêu cầu người dùng
    const userQuery = message.toLowerCase();
    
    // Kiểm tra xem có phải là yêu cầu về đơn hàng không
    if (isOrderQuery(userQuery)) {
      const orderCode = extractOrderCode(message);
      if (orderCode) {
        const order = await searchOrderByCode(orderCode);
        if (order) {
          orderInfo = formatOrderInfo(order);
          contextInfo = `Thông tin đơn hàng #${orderCode}`;
          additionalPrompt = `Người dùng đang tra cứu thông tin đơn hàng có mã: ${orderCode}. Đã tìm thấy đơn hàng. Vui lòng trả lời với thông tin chi tiết về trạng thái đơn hàng này.`;
        } else {
          contextInfo = `Không tìm thấy đơn hàng #${orderCode}`;
          additionalPrompt = `Người dùng đang tra cứu thông tin đơn hàng có mã: ${orderCode}, nhưng không tìm thấy đơn hàng này. Vui lòng thông báo lịch sự rằng mã đơn hàng không tồn tại và đề xuất kiểm tra lại mã đơn hàng.`;
        }
      } else {
        contextInfo = `Yêu cầu tra cứu đơn hàng`;
        additionalPrompt = `Người dùng đang yêu cầu tra cứu đơn hàng, nhưng không cung cấp mã đơn hàng. Vui lòng hướng dẫn họ cách tra cứu đơn hàng bằng cách cung cấp mã đơn hàng (orderCode).`;
      }
    } 
    
    // Kiểm tra các trường hợp đặc biệt về sản phẩm
    const isSkinTypeQuery = /loại da|da (khô|dầu|hỗn hợp|nhạy cảm|mụn|lão hóa)/.test(userQuery);
    const isExactProductQuery = /"([^"]+)"/.exec(userQuery) || /'([^']+)'/.exec(userQuery);
    const isBrandQuery = /thương hiệu|brand|nhãn hiệu|hãng/.test(userQuery);
    const isExistenceQuery = isProductExistenceQuery(userQuery);

    // Chỉ xử lý các yêu cầu về sản phẩm nếu không phải là yêu cầu về đơn hàng
    if (!orderInfo) {
      // Ưu tiên xử lý truy vấn theo thứ tự:
      // sản phẩm cụ thể -> tồn tại sản phẩm -> loại da -> thương hiệu -> danh mục -> từ khóa chung
      if (isExactProductQuery) {
        const productName = isExactProductQuery[1];
        const product = await searchExactProduct(productName);
        if (product) {
          productInfoList = formatProductInfo([product]);
          contextInfo = `Thông tin chi tiết về sản phẩm "${product.name}"`;
        }
      } else if (isExistenceQuery) {
        const { products, productType } = await searchProductsByExistenceQuery(message);
        if (products && products.length > 0) {
          productInfoList = formatProductInfo(products);
          contextInfo = `Cửa hàng có sản phẩm ${productType}`;
        } else {
          // Nếu không tìm thấy sản phẩm nhưng xác định được loại sản phẩm
          if (productType) {
            contextInfo = `Không tìm thấy sản phẩm ${productType}`;
          }
        }
      } else if (isSkinTypeQuery) {
        const { products, skinType } = await searchProductsForSkinType(userQuery);
        if (products && products.length > 0) {
          productInfoList = formatProductInfo(products);
          contextInfo = `Sản phẩm phù hợp với ${skinType}`;
        }
      } else if (isBrandQuery) {
        // Tìm tên thương hiệu trong câu hỏi
        const brands = await Brand.find({});
        const brandMatch = brands.find(brand => 
          userQuery.includes(brand.name.toLowerCase())
        );
        
        if (brandMatch) {
          const products = await searchProductsByBrand(brandMatch.name);
          if (products.length > 0) {
            productInfoList = formatProductInfo(products);
            contextInfo = `Sản phẩm từ thương hiệu ${brandMatch.name}`;
          }
        }
      } else {
        // Kiểm tra xem có hỏi về danh mục cụ thể không
        const categoryName = extractCategoryFromMessage(message);
        if (categoryName) {
          const categoryProducts = await searchProductsByCategory(categoryName);
          if (categoryProducts && categoryProducts.length > 0) {
            productInfoList = formatProductInfo(categoryProducts);
            contextInfo = `Sản phẩm thuộc danh mục ${categoryName}`;
          }
        }
      }
      
      // Nếu các phương pháp trên không tìm thấy sản phẩm, thử tìm theo từ khóa
      if (productInfoList.length === 0 && isProductQuery(message)) {
        const products = await searchProducts(message);
        if (products && products.length > 0) {
          productInfoList = formatProductInfo(products);
          contextInfo = `Sản phẩm liên quan đến yêu cầu của bạn`;
        }
      }
    }

    // Lấy system prompt
    const systemPrompt = await getSystemPrompt();

    try {
      // Lấy model Gemini
      const model = getGeminiModel();
      
      // Lấy lịch sử chat để cung cấp ngữ cảnh (giới hạn 5 tin nhắn gần nhất)
      let recentMessages = [];
      if (chatHistory.messages.length > 0) {
        recentMessages = chatHistory.messages
          .slice(-5)
          .map(msg => `${msg.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${msg.content}`)
          .join('\n');
      }
      
      // Kết hợp thông tin hướng dẫn và tin nhắn người dùng
      let prompt = `${systemPrompt}\n\n`;
      
      if (recentMessages) {
        prompt += `Các tin nhắn gần đây để tham khảo:\n${recentMessages}\n\n`;
      }
      
      prompt += `Người dùng hỏi: ${message}\n\n`;
      
      // Thêm thông tin về đơn hàng nếu có
      if (orderInfo) {
        prompt += additionalPrompt + '\n\n';
        prompt += `Thông tin đơn hàng:\n`;
        prompt += `- Mã đơn: ${orderInfo.orderCode}\n`;
        prompt += `- Ngày đặt: ${orderInfo.date}\n`;
        prompt += `- Trạng thái: ${orderInfo.status}\n`;
        prompt += `- Tổng tiền: ${orderInfo.totalPrice}\n`;
        
        if (orderInfo.estimatedDelivery && orderInfo.rawStatus !== 'pending' && orderInfo.rawStatus !== 'canceled') {
          prompt += `- Dự kiến giao hàng: ${orderInfo.estimatedDelivery}\n`;
        }
        
        prompt += `- Địa chỉ giao hàng: ${orderInfo.shippingInfo.address}\n`;
        prompt += `- Người nhận: ${orderInfo.shippingInfo.fullName}\n\n`;
        
        prompt += `Sản phẩm trong đơn hàng:\n`;
        orderInfo.items.forEach((item, index) => {
          prompt += `${index + 1}. ${item.name} - Số lượng: ${item.quantity} - Giá: ${item.price}\n`;
        });
        
        prompt += `\nVui lòng giải thích trạng thái đơn hàng cho khách hàng một cách rõ ràng và thân thiện. Sử dụng emoji để làm sinh động câu trả lời. Nếu đơn hàng đang trong quá trình vận chuyển, hãy giải thích thêm về thời gian dự kiến giao hàng.`;
      }
      // Thêm thông tin về trạng thái sản phẩm được tìm thấy
      else if (isExistenceQuery) {
        if (productInfoList.length > 0) {
          prompt += `Người dùng đang hỏi về sự tồn tại của sản phẩm. Cửa hàng CÓ bán sản phẩm loại này. Đã tìm thấy ${productInfoList.length} sản phẩm phù hợp với yêu cầu.\n\n`;
        } else {
          prompt += `Người dùng đang hỏi về sự tồn tại của sản phẩm. Cửa hàng KHÔNG BÁN sản phẩm loại này hoặc hiện không có trong kho. Vui lòng thông báo lịch sự rằng cửa hàng không có sản phẩm này.\n\n`;
        }
      }
      
      // Thêm thông tin sản phẩm nếu có
      else if (productInfoList.length > 0) {
        prompt += `${contextInfo}:\n\n`;
        
        productInfoList.forEach((product, index) => {
          prompt += `Sản phẩm ${index + 1}: ${product.name}\n`;
          prompt += `- Giá: ${product.price}\n`;
          prompt += `- Thương hiệu: ${product.brand.name}\n`;
          prompt += `- Danh mục: ${product.category}\n`;
          prompt += `- Mô tả: ${product.description.substring(0, 200)}${product.description.length > 200 ? '...' : ''}\n`;
          if (product.ingredients) {
            prompt += `- Thành phần chính: ${product.ingredients.substring(0, 200)}${product.ingredients.length > 200 ? '...' : ''}\n`;
          }
          if (product.usage) {
            prompt += `- Cách sử dụng: ${product.usage.substring(0, 200)}${product.usage.length > 200 ? '...' : ''}\n`;
          }
          prompt += '\n';
        });
        
        prompt += `Vui lòng giới thiệu chi tiết về các sản phẩm trên, sử dụng emoji để làm sinh động câu trả lời. Giải thích công dụng chính và thành phần nổi bật phù hợp với nhu cầu của người dùng. Nhấn mạnh ưu điểm của từng sản phẩm. Đồng thời, nhắc người dùng rằng họ có thể xem hình ảnh sản phẩm bên dưới tin nhắn này.`;
      } else {
        prompt += `Không tìm thấy sản phẩm cụ thể nào phù hợp với yêu cầu. Vui lòng trả lời chung về chủ đề này, có sử dụng các emoji phù hợp, và đề xuất người dùng thử tìm kiếm với từ khóa khác. Nếu câu hỏi không liên quan đến sản phẩm, hãy trả lời theo hướng dẫn ban đầu.`;
      }
      
      prompt += `\n\nTrả lời:`;
      
      console.log("🤖 Đang gọi Gemini API với prompt...");
      
      // Gọi API 
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();
      
      console.log("✅ Đã nhận phản hồi từ Gemini API");

      // Thêm phản hồi của AI vào lịch sử với thông tin sản phẩm/đơn hàng kèm theo
      const responseObject = {
        role: 'assistant',
        content: aiResponse,
      };
      
      // Thêm thông tin sản phẩm nếu có
      if (productInfoList.length > 0) {
        responseObject.products = productInfoList;
      }
      
      // Thêm thông tin đơn hàng nếu có
      if (orderInfo) {
        responseObject.orderInfo = orderInfo;
      }
      
      chatHistory.messages.push(responseObject);

      // Lưu lịch sử chat
      await chatHistory.save();

      // Phát sự kiện socket.io để cập nhật realtime
      const io = getIO();
      io.to(`chat_${sessionId}`).emit('chat_message', {
        ...responseObject,
        timestamp: new Date()
      });

      return res.status(200).json({
        success: true,
        reply: aiResponse,
        sessionId,
        products: productInfoList,
        orderInfo: orderInfo,
        hasProductInfo: productInfoList.length > 0,
        hasOrderInfo: !!orderInfo
      });
    } catch (genError) {
      console.error('Lỗi khi gọi Gemini API:', genError);
      
      // Trả về tin nhắn lỗi thân thiện
      const errorMessage = "Xin lỗi, tôi đang gặp vấn đề kỹ thuật. Vui lòng thử lại sau hoặc liên hệ với nhân viên cửa hàng để được hỗ trợ trực tiếp.";
      
      chatHistory.messages.push({
        role: 'assistant',
        content: errorMessage
      });

      // Lưu lịch sử chat
      await chatHistory.save();

      return res.status(200).json({
        success: true,
        reply: errorMessage,
        sessionId,
        error: true
      });
    }
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn đến chatbot:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy tất cả phiên chat của người dùng
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Tìm tất cả phiên chat của người dùng, chỉ trả về thông tin cơ bản
    const sessions = await ChatHistory.find(
      { userId }, 
      { sessionId: 1, createdAt: 1, updatedAt: 1, 'messages.0.content': 1 }
    ).sort({ updatedAt: -1 });
    
    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phiên chat:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa một phiên chat
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;
    
    const result = await ChatHistory.deleteOne({ userId, sessionId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiên chat' });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Đã xóa phiên chat thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa phiên chat:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa tất cả phiên chat của người dùng
exports.deleteAllSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await ChatHistory.deleteMany({ userId });
    
    return res.status(200).json({
      success: true,
      message: `Đã xóa ${result.deletedCount} phiên chat`
    });
  } catch (error) {
    console.error('Lỗi khi xóa tất cả phiên chat:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa tất cả cuộc trò chuyện trong hệ thống (admin only)
exports.deleteAllConversations = async (req, res) => {
  try {
    // Xóa toàn bộ dữ liệu trong collection
    const result = await ChatHistory.deleteMany({});
    
    return res.status(200).json({
      success: true,
      message: `Đã xóa toàn bộ ${result.deletedCount} cuộc trò chuyện trong hệ thống`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Lỗi khi xóa tất cả cuộc trò chuyện:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy tổng số cuộc trò chuyện
exports.getConversationsCount = async (req, res) => {
  try {
    const total = await ChatHistory.countDocuments();
    
    return res.status(200).json({
      success: true,
      total
    });
  } catch (error) {
    console.error('Lỗi khi đếm cuộc trò chuyện:', error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
