const mongoose = require('mongoose');

const uri = process.env.DB_URI || 'mongodb+srv://tuanb2113346:123@database.g9qtf.mongodb.net/cosmetics?retryWrites=true&w=majority';

async function connectToDatabase() {
    try {
        // Không cần useNewUrlParser và useUnifiedTopology
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB successfully');
    } catch (err) {
        console.error('❌ Could not connect to MongoDB:', err.message);
        process.exit(1); // Dừng ứng dụng nếu không kết nối được
    }
}

module.exports = connectToDatabase;
