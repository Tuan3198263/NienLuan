const socketIO = require('socket.io');
let io;

// Khởi tạo Socket.io
const initSocketIO = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*', // Hoặc địa chỉ cụ thể của client: 'http://localhost:3000'
      methods: ['GET', 'POST']
    }
  });

  // Xử lý khi có kết nối mới
  io.on('connection', (socket) => {
    console.log('👤 Client đã kết nối:', socket.id);

    // Xử lý khi client ngắt kết nối
    socket.on('disconnect', () => {
      console.log('❌ Client đã ngắt kết nối:', socket.id);
    });

    // Xử lý sự kiện tham gia phòng chat
    socket.on('join_chat_session', (sessionId) => {
      socket.join(`chat_${sessionId}`);
      console.log(`👤 Client ${socket.id} đã tham gia phòng chat ${sessionId}`);
    });

    // Xử lý sự kiện rời phòng chat
    socket.on('leave_chat_session', (sessionId) => {
      socket.leave(`chat_${sessionId}`);
      console.log(`👤 Client ${socket.id} đã rời phòng chat ${sessionId}`);
    });
  });

  return io;
};

// Lấy instance của Socket.io
const getIO = () => {
  if (!io) {
    throw new Error('🔴 Socket.IO chưa được khởi tạo!');
  }
  return io;
};

module.exports = {
  initSocketIO,
  getIO
};