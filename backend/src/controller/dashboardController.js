const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const Category = require('../models/category');
const Brand = require('../models/brand');

const getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalCategories = await Category.countDocuments();
        const totalBrands = await Brand.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const canceledOrders = await Order.countDocuments({ status: "canceled" });
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

        // Tổng doanh thu
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const revenueAmount = totalRevenue[0]?.total || 0;

        // Doanh thu trung bình mỗi đơn hàng
        const avgOrderValue = totalOrders > 0 ? revenueAmount / totalOrders : 0;

        // Tỷ lệ hủy đơn
        const cancelRate = totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0;

        // Số đơn theo tháng
        const ordersByMonth = await Order.aggregate([
            { $group: { 
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                count: { $sum: 1 },
                revenue: { $sum: "$totalPrice" }
            } }
        ]);

        // Số đơn theo ngày trong tháng hiện tại
        const ordersByDay = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: { day: { $dayOfMonth: "$createdAt" } }, count: { $sum: 1 } } }
        ]);

        // Sản phẩm bán chạy nhất (top 5)
        const topSellingProducts = await Order.aggregate([
            { $unwind: "$items" },
            { 
                $group: { 
                    _id: "$items.productId", 
                    totalSold: { $sum: "$items.quantity" } 
                } 
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { 
                $lookup: { 
                    from: "products", 
                    localField: "_id", 
                    foreignField: "_id", 
                    as: "productInfo" 
                } 
            },
            { $unwind: "$productInfo" },
            { 
                $project: { 
                    _id: 0, 
                    name: "$productInfo.name", 
                    totalSold: 1, 
                    image: { $arrayElemAt: ["$productInfo.images", 0] } // Lấy ảnh đầu tiên
                } 
            }
        ]);


        // Sản phẩm tồn kho & sắp hết hàng
        const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });
        const totalStock = await Product.aggregate([
            { $group: { _id: null, totalStock: { $sum: "$stock" } } }
        ]);


        // Top khách hàng VIP (chi tiêu nhiều nhất)
        const topCustomers = await Order.aggregate([
            { $group: { _id: "$userId", totalSpent: { $sum: "$totalPrice" } } },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userInfo" } },
            { $unwind: "$userInfo" },
            { $project: { _id: 0, name: "$userInfo.name", email: "$userInfo.email", totalSpent: 1 } }
        ]);

        // Sản phẩm chưa bán được
        const unsoldProducts = await Product.countDocuments({ sold: { $eq: 0 } });

        res.json({
            totalProducts,
            totalCategories,
            totalBrands,
            totalOrders,
            totalRevenue: revenueAmount,
            avgOrderValue,
            cancelRate,
            ordersByMonth,
            ordersByDay,
            totalUsers,
            pendingOrders,
            canceledOrders,
            newUsersThisMonth,
            topSellingProducts,
            lowStockProducts,
            totalStock: totalStock[0]?.totalStock || 0,
            topCustomers,
            unsoldProducts
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu dashboard", error });
    }
};

module.exports = { getDashboardStats };