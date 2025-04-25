const axios = require('axios');
const Order = require('../models/order'); 
const Cart = require('../models/cart'); 
const Product = require('../models/product');  // Import model sản phẩm
// Import module emailController
const { sendOrderDeliveredEmail } = require('../controller/emailController');
const eventEmitter = require("../events/event.js"); // Import eventEmitter


//tạo đơn (có kết nối với GHN)
exports.createOrder = async (req, res) => {
  try {
    const { shippingInfo, insurance_value, shipping_fee_input } = req.body;
    const userId = req.user.userId;

    // Lấy giỏ hàng của người dùng
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng của bạn trống.' });
    }

     // Kiểm tra số lượng trong kho trước khi tạo đơn hàng
    for (let item of cart.items) {
      const product = await Product.findById(item.productId);  // Lấy sản phẩm từ DB

      if (!product) {
        return res.status(404).json({ message: `Sản phẩm với ID ${item.productId} không tồn tại.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho, không đủ số lượng bạn yêu cầu.`,
        });
      }
    }


    // Chuẩn bị dữ liệu gửi đến GHN
    const ghnBody = {
      payment_type_id: 2,
      required_note: 'KHONGCHOXEMHANG',
      to_name: shippingInfo.fullName,
      to_phone: shippingInfo.phone,
      to_address: shippingInfo.address,
      to_ward_name: shippingInfo.wardName,
      to_district_name: shippingInfo.districtName,
      to_province_name: shippingInfo.cityName,
      length: 12,
      width: 12,
      height: 12,
      weight: 1500,
      insurance_value: insurance_value || 0,
      service_type_id: 2,
      items: req.body.items, // Dữ liệu từ frontend, không cần map lại
    };

    // Gửi request đến GHN
    const ghnResponse = await axios.post(
      'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create',
      ghnBody,
      {
        headers: {
          'token': '8be47059-f262-11ef-a653-3600c660ea00',
          'Content-Type': 'application/json',
          'ShopId': '196030',
        },
      }
    );

    //console.log("GHN Response:", JSON.stringify(ghnResponse.data, null, 2));

    const totalFee = ghnResponse?.data?.data?.total_fee || 0;
    const estimatedDeliveryDate = ghnResponse?.data?.data?.expected_delivery_time || null;



    // Tính giảm giá phí vận chuyển
    const discount = shipping_fee_input ? shipping_fee_input - totalFee : 0;
  // Tạo đơn hàng trong MongoDB
    const order = new Order({
    userId,
    shippingInfo,
    shippingFeeDetails: {
        mainFee: shipping_fee_input,
        discount: discount,
        finalFee: totalFee
    },
    items: cart.items,
    totalPrice: cart.totalPrice + totalFee, // Cộng phí ship cuối cùng vào tổng giá trị đơn hàng
    orderCode: ghnResponse?.data?.data?.order_code || null, // Mã đơn hàng từ GHN
    status: 'pending',
    estimatedDeliveryDate: estimatedDeliveryDate,
    });

    await order.save();

      // Phát sự kiện khi tạo đơn hàng
    eventEmitter.emit("orderCreated", order);


    return res.status(201).json({
      message: 'Đơn hàng đã được tạo thành công.',
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Lỗi khi tạo đơn hàng.',
      error: error.message,
    });
  }
};

// lấy danh sách đơn hàng của user
exports.getOrdersByStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    let query = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
        .populate({
          path: 'items.productId',
          select: 'name price images' // Lấy thêm thông tin sản phẩm
        })
        .sort({ orderDate: -1 }); // Sắp xếp theo ngày mới nhất (giảm dần)

    return res.status(200).json({
      message: 'Lấy danh sách đơn hàng thành công.',
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Lỗi khi lấy danh sách đơn hàng.',
      error: error.message,
    });
  }
};

// lấy theo orderCode
exports.getOrderByCode = async (req, res) => {
  try {
    const { orderCode } = req.params; // Lấy orderCode từ params
    const userId = req.user.userId; // Lấy userId từ token

    // Tìm đơn hàng theo orderCode và kiểm tra quyền truy cập
    const order = await Order.findOne({ orderCode })
      .populate({
        path: 'items.productId',
        populate: {
          path: 'brand', // Populate thêm thương hiệu
          select: 'name' // Chỉ lấy trường name của thương hiệu
        }
      });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    // Kiểm tra xem user hiện tại có phải chủ sở hữu của đơn hàng không
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập đơn hàng này.' });
    }

    return res.status(200).json({
      message: 'Lấy chi tiết đơn hàng thành công.',
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Lỗi khi lấy chi tiết đơn hàng.',
      error: error.message,
    });
  }
};

// Định nghĩa ánh xạ trạng thái từ API vào mô hình của bạn
const statusMapping = {
    ready_to_pick: 'pending',
    picking: 'processed',
    money_collect_picking: 'processed',
    picked: 'processed',
    storing: 'processed',
    transporting: 'shipped',
    sorting: 'shipped',
    delivering: 'shipped',
    money_collect_delivering: 'shipped',
    delivered: 'delivered',
    delivery_fail: 'shipped',
    waiting_to_return: 'returned',
    return: 'returned',
    return_transporting: 'returned',
    return_sorting: 'returned',
    returning: 'returned',
    return_fail: 'returned',
    returned: 'returned',
    exception: 'canceled',
    cancel: 'canceled',
    damage: 'canceled',
    lost: 'canceled'
};

// cập nhật trạng thái đơn từ webhook
exports.updateOrderStatusFromWebhook = async (req, res) => {
    try {
        const { OrderCode, Status, Time } = req.body;

        if (!OrderCode || !Status) {
            return res.status(400).json({ message: "Thiếu dữ liệu cần thiết từ webhook." });
        }

        // Tìm đơn hàng theo mã OrderCode
        const order = await Order.findOne({ orderCode: OrderCode }).populate('userId');

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
        }

        // Kiểm tra và ánh xạ trạng thái
        const mappedStatus = statusMapping[Status];

        if (!mappedStatus) {
            return res.status(400).json({ message: `Trạng thái '${Status}' không hợp lệ.` });
        }

        // Cập nhật trạng thái đơn hàng
        order.status = mappedStatus;
        order.updatedAt = new Date(Time);
        await order.save();

        console.log(`✅ Đơn hàng ${OrderCode} đã được cập nhật trạng thái: [GHN '${Status}' => Hệ thống: '${mappedStatus}']`);

        // Giảm số lượng sản phẩm trong kho khi đơn hàng được giao thành công
        if (mappedStatus === 'delivered') {
            try {
                // Cập nhật số lượng tồn kho
                for (const item of order.items) {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        product.stock -= item.quantity;
                        await product.save();
                        console.log(`📦 Đã giảm ${item.quantity} sản phẩm ${product.name} trong kho, còn lại: ${product.stock}`);
                    }
                }
                console.log(`✅ Đã cập nhật số lượng tồn kho cho đơn hàng ${OrderCode}`);
            } catch (stockError) {
                console.error(`❌ Lỗi khi cập nhật số lượng tồn kho cho đơn hàng ${OrderCode}:`, stockError.message);
            }


              // Phát sự kiện "orderDelivered" khi đơn hàng giao thành công
            eventEmitter.emit('orderDelivered', order); // Phát sự kiện với đối tượng đơn hàng
            
            // Gửi email thông báo
            try {
                const userEmail = order.userId?.email;
                if (userEmail) {
                    await sendOrderDeliveredEmail(userEmail, OrderCode);
                    console.log(`📩 Email đã được gửi đến ${userEmail} cho đơn hàng ${OrderCode}`);
                } else {
                    console.warn(`⚠️ Không tìm thấy email cho đơn hàng ${OrderCode}, bỏ qua gửi email.`);
                }
            } catch (emailError) {
                console.error(`❌ Lỗi khi gửi email cho đơn hàng ${OrderCode}:`, emailError.message);
            }
        }

        return res.status(200).json({ 
            message: "Đơn hàng đã được cập nhật thành công.", 
            order 
        });

    } catch (error) {
        console.error("❌ Lỗi khi xử lý webhook:", error);
        return res.status(500).json({ message: "Lỗi khi xử lý webhook.", error: error.message });
    }
};


// lấy danh sách đơn hàng (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { sortBy = 'orderDate', sortOrder = 'desc' } = req.query;

    // Xây dựng sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Thực hiện query với populate
    const orders = await Order.find()
      .populate({
        path: 'userId',
        select: 'email username fullName phone' // Chỉ lấy các trường cần thiết
      })
      .populate({
        path: 'items.productId',
        select: 'name price images' // Chỉ lấy các trường cần thiết của sản phẩm
      })
      .sort(sortOptions);

    return res.status(200).json({
      message: 'Lấy danh sách đơn hàng thành công',
      data: {
        orders
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    return res.status(500).json({
      message: 'Đã xảy ra lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};


// Hủy đơn hàng (chỉ khi trạng thái là 'pending')
exports.cancelOrder = async (req, res) => {
    try {
        const { orderCode } = req.params;
        const userId = req.user.userId;

        // Tìm đơn hàng
        const order = await Order.findOne({ orderCode, userId });
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
        }

        // Chỉ cho phép hủy nếu trạng thái là 'pending'
        if (order.status !== 'pending') {
            return res.status(400).json({ message: "Chỉ có thể hủy đơn hàng khi đang ở trạng thái 'pending'." });
        }

        // Gửi request hủy đơn đến GHN
        const ghnResponse = await axios.post(
            'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel',
            { order_codes: [orderCode] },
            {
                headers: {
                    'token': '8be47059-f262-11ef-a653-3600c660ea00',
                    'Content-Type': 'application/json',
                    'ShopId': '196030',
                },
            }
        );

        const cancelResult = ghnResponse?.data?.data?.[0];
        if (!cancelResult || !cancelResult.result) {
            return res.status(400).json({ message: `Không thể hủy đơn hàng: ${cancelResult?.message || 'Lỗi không xác định'}` });
        }

        // Cập nhật trạng thái đơn hàng trong hệ thống
        order.status = 'canceled';
        await order.save();

         // Phát sự kiện khi hủy đơn hàng
        eventEmitter.emit("orderCanceled", order);


        return res.status(200).json({
            message: "Đơn hàng đã được hủy thành công.",
            order
        });
    } catch (error) {
        console.error("❌ Lỗi khi hủy đơn hàng:", error);
        return res.status(500).json({ message: "Lỗi khi hủy đơn hàng.", error: error.message });
    }
};

// Hủy đơn hàng từ phía admin (không cần xác thực userId)
exports.cancelOrderByAdmin = async (req, res) => {
    try {
        const { orderCode } = req.params;

        // Tìm đơn hàng không cần kiểm tra userId
        const order = await Order.findOne({ orderCode });
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
        }

        // Gửi request hủy đơn đến GHN
        const ghnResponse = await axios.post(
            'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel',
            { order_codes: [orderCode] },
            {
                headers: {
                    'token': '8be47059-f262-11ef-a653-3600c660ea00',
                    'Content-Type': 'application/json',
                    'ShopId': '196030',
                },
            }
        );

        const cancelResult = ghnResponse?.data?.data?.[0];
        if (!cancelResult || !cancelResult.result) {
            return res.status(400).json({ message: `Không thể hủy đơn hàng: ${cancelResult?.message || 'Lỗi không xác định'}` });
        }

        // Cập nhật trạng thái đơn hàng trong hệ thống
        order.status = 'canceled';
        await order.save();

        // Admin không cần phát emit sự kiện

        return res.status(200).json({
            message: "Admin đã hủy đơn hàng thành công.",
            order
        });
    } catch (error) {
        console.error("❌ Lỗi khi admin hủy đơn hàng:", error);
        return res.status(500).json({ message: "Lỗi khi admin hủy đơn hàng.", error: error.message });
    }
};






