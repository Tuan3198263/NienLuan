<template>
  <div class="chatbot-container" v-if="isLoggedIn">
    <!-- Nút mở/đóng chatbot -->
    <div
      class="chat-button"
      @click="toggleChatbox"
      :class="{ active: isChatboxOpen }"
    >
      <i
        class="fas"
        :class="isChatboxOpen ? 'fa-times' : 'fa-comment-dots'"
      ></i>
      <span v-if="unreadMessages > 0" class="unread-badge">{{
        unreadMessages
      }}</span>
    </div>

    <!-- Chatbox -->
    <div class="chatbox" v-if="isChatboxOpen">
      <div class="chatbox-header">
        <div class="chatbox-title">
          <div class="d-flex align-items-center">
            <i class="fas fa-robot me-2"></i>
            <div>
              <span>Glown</span>
            </div>
          </div>
        </div>
        <div class="chatbox-actions">
          <button
            class="icon-btn"
            @click="showHistory"
            title="Lịch sử chat"
            :class="{ active: showHistoryList }"
          >
            <i class="fas fa-history"></i>
          </button>
          <button
            class="icon-btn"
            title="Bắt đầu cuộc trò chuyện mới"
            @click="handleResetChat"
          >
            <i class="fas fa-redo"></i>
          </button>
          <button class="icon-btn" @click="toggleChatbox" title="Đóng">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="chatbox-body" ref="chatboxBody">
        <div v-if="showHistoryList" class="chat-history-list">
          <h3>Lịch sử trò chuyện</h3>
          <div v-if="chatSessions.length > 0" class="sessions-list">
            <div
              v-for="session in chatSessions"
              :key="session.sessionId"
              @click="loadSession(session.sessionId)"
              class="session-item"
            >
              <div class="session-content">
                <div class="session-preview">
                  {{ getSessionPreview(session) }}
                </div>
                <div class="session-date">
                  {{ formatDate(session.updatedAt) }}
                </div>
              </div>
              <div class="session-actions">
                <button
                  class="delete-btn"
                  @click.stop="deleteSession(session.sessionId)"
                  title="Xóa"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            <button
              class="btn btn-outline-danger btn-sm w-100 mt-3"
              @click="deleteAllSessions"
            >
              <i class="fas fa-trash me-2"></i>Xóa tất cả
            </button>
          </div>
          <div v-else class="no-history">
            <div class="empty-state">
              <i class="fas fa-comment-slash"></i>
              <p>Chưa có cuộc trò chuyện nào</p>
              <button @click="startNewChat" class="btn-start-chat">
                Bắt đầu trò chuyện
              </button>
            </div>
          </div>
        </div>

        <div v-else class="messages">
          <div
            v-for="(message, index) in currentMessages"
            :key="index"
            class="message-wrapper"
            :class="{ 'user-message': message.role === 'user' }"
          >
            <div v-if="message.role === 'assistant'" class="chatbot-icon">
              <i class="fas fa-robot"></i>
            </div>
            <div class="message" :class="message.role">
              <div class="message-content">
                <p v-html="formatMessage(message.content)"></p>

                <!-- Hiển thị danh sách sản phẩm nếu có -->
                <div
                  v-if="message.products && message.products.length > 0"
                  class="product-list"
                >
                  <div class="products-header">
                    <i class="fas fa-shopping-bag"></i>
                    <span>Sản phẩm gợi ý</span>
                  </div>

                  <div class="products-carousel">
                    <div
                      v-for="(product, pIndex) in message.products"
                      :key="`prod-${index}-${pIndex}`"
                      class="product-card"
                      @click="viewProductDetails(product)"
                    >
                      <div class="product-image-container">
                        <img
                          v-if="product.image"
                          :src="product.image"
                          :alt="product.name"
                          class="product-image"
                          @error="handleImageError"
                        />
                        <div v-else class="no-image">
                          <i class="fas fa-image"></i>
                        </div>
                      </div>
                      <div class="product-info">
                        <div class="product-name">
                          {{ truncateText(product.name, 40) }}
                        </div>
                        <div class="product-brand">
                          <small>{{ product.brand.name }}</small>
                        </div>
                        <div class="product-price">{{ product.price }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <small class="message-time">{{
                  formatMessageTime(message.timestamp)
                }}</small>
              </div>
            </div>
          </div>
          <div v-if="isLoading" class="message-wrapper loading-wrapper">
            <div class="chatbot-icon">
              <i class="fas fa-robot"></i>
            </div>
            <div class="typing-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!showHistoryList" class="chatbox-footer">
        <div class="input-container">
          <textarea
            class="chat-input"
            v-model="userMessage"
            @keypress.enter.prevent="sendMessage"
            placeholder="Nhập tin nhắn..."
            :disabled="isLoading"
            rows="1"
            @input="autoResize"
            ref="messageInput"
          ></textarea>
          <button
            class="send-button"
            @click="sendMessage"
            :disabled="!userMessage.trim() || isLoading"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <div v-else class="chatbox-footer history-footer">
        <button class="btn-start-chat" @click="startNewChat">
          <i class="fas fa-plus me-2"></i> Bắt đầu trò chuyện mới
        </button>
      </div>
    </div>

    <!-- Product Detail Modal -->
    <div
      class="product-modal"
      v-if="showProductModal"
      @click="closeProductModal"
    >
      <div class="product-modal-content" @click.stop>
        <div class="product-modal-header">
          <h3>{{ selectedProduct.name }}</h3>
          <button class="close-modal" @click="closeProductModal">×</button>
        </div>
        <div class="product-modal-body">
          <div class="product-modal-image-container">
            <img
              :src="selectedProduct.image"
              :alt="selectedProduct.name"
              class="product-modal-image"
            />
            <div
              class="thumbnail-gallery"
              v-if="selectedProduct.images && selectedProduct.images.length > 1"
            >
              <img
                v-for="(img, imgIndex) in selectedProduct.images"
                :key="imgIndex"
                :src="img"
                :alt="`${selectedProduct.name} - ảnh ${imgIndex + 1}`"
                class="thumbnail-image"
                :class="{ active: selectedProduct.image === img }"
                @click="selectedProduct.image = img"
              />
            </div>
          </div>

          <div class="product-modal-details">
            <div class="product-modal-price">{{ selectedProduct.price }}</div>
            <div class="product-modal-brand">
              <span>Thương hiệu: </span>
              <strong>{{ selectedProduct.brand?.name }}</strong>
            </div>
            <div class="product-modal-category">
              <span>Danh mục: </span>
              <strong>{{ selectedProduct.category }}</strong>
            </div>
          </div>
        </div>
        <div class="product-modal-footer">
          <button class="view-product-btn" @click="goToProductPage">
            <i class="fas fa-shopping-cart me-2"></i>
            Xem chi tiết sản phẩm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { useAuthStore } from "../../store/AuthStore";
import axios from "axios";
import { useToast } from "vue-toastification";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import router from "../../router";

export default {
  name: "Chatbot",
  setup() {
    // Khai báo state
    const authStore = useAuthStore();
    const toast = useToast();
    const isLoggedIn = computed(() => authStore.isAuthenticated);
    const isChatboxOpen = ref(false);
    const userMessage = ref("");
    const currentMessages = ref([]);
    const chatboxBody = ref(null);
    const currentSessionId = ref("");
    const isLoading = ref(false);
    const socket = ref(null);
    const unreadMessages = ref(0);
    const showHistoryList = ref(false);
    const chatSessions = ref([]);
    const messageInput = ref(null);

    // State cho hiển thị chi tiết sản phẩm
    const showProductModal = ref(false);
    const selectedProduct = ref({});

    // Xóa bỏ activeTab và productTabs vì không còn sử dụng tabs

    // Kết nối socket khi component được mount
    onMounted(() => {
      if (isLoggedIn.value) {
        // Khởi tạo kết nối Socket.IO
        socket.value = io("http://localhost:3000");

        // Lắng nghe sự kiện kết nối
        socket.value.on("connect", () => {
          console.log("Socket.IO kết nối thành công");
        });

        // Lắng nghe tin nhắn mới
        socket.value.on("chat_message", (message) => {
          // Thêm tin nhắn mới vào danh sách nếu đang trong cùng phiên chat
          if (!isChatboxOpen.value) {
            unreadMessages.value++; // Tăng số tin nhắn chưa đọc nếu chatbox đang đóng
          }

          // Chỉ xử lý tin nhắn nếu là phiên chat hiện tại
          if (currentSessionId.value) {
            currentMessages.value.push(message);
            scrollToBottom();
          }
        });
      }
    });

    // Xử lý lỗi khi không thể tải hình ảnh
    const handleImageError = (event) => {
      event.target.src = "/images/no-image.png"; // Thay thế bằng ảnh mặc định
    };

    // Cắt ngắn văn bản nếu quá dài
    const truncateText = (text, maxLength) => {
      if (!text) return "";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    };

    // Xem chi tiết sản phẩm
    const viewProductDetails = (product) => {
      selectedProduct.value = { ...product };
      showProductModal.value = true;
    };

    // Đóng modal chi tiết sản phẩm
    const closeProductModal = () => {
      showProductModal.value = false;
    };

    // Chuyển đến trang chi tiết sản phẩm
    const goToProductPage = () => {
      if (selectedProduct.value && selectedProduct.value.slug) {
        router.push(`/product/${selectedProduct.value.slug}`);
        closeProductModal();
        toggleChatbox(); // Đóng chatbot
      } else {
        toast.warning("Không thể xem chi tiết sản phẩm này");
      }
    };

    // Xử lý tự động điều chỉnh kích thước textarea
    const autoResize = () => {
      if (!messageInput.value) return;

      // Reset chiều cao về auto để tính toán lại kích thước cần thiết
      messageInput.value.style.height = "auto";

      // Thiết lập chiều cao mới dựa trên nội dung (scrollHeight)
      const newHeight = Math.min(
        Math.max(30, messageInput.value.scrollHeight),
        100
      );
      messageInput.value.style.height = `${newHeight}px`;
    };

    // Xử lý nút reset cuộc trò chuyện
    const handleResetChat = () => {
      if (!currentMessages.value.length) {
        startNewChat();
        return;
      }

      Swal.fire({
        title: "Bắt đầu cuộc trò chuyện mới?",
        text: "Cuộc trò chuyện hiện tại sẽ được lưu vào lịch sử.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          startNewChat();
        }
      });
    };

    // Tự động cuộn xuống dưới khi có tin nhắn mới
    const scrollToBottom = () => {
      nextTick(() => {
        if (chatboxBody.value) {
          chatboxBody.value.scrollTop = chatboxBody.value.scrollHeight;
        }
      });
    };

    // Xem hoặc tạo phiên chat mới
    const getOrCreateSession = async () => {
      try {
        isLoading.value = true;
        const token = authStore.token;

        // Nếu đã có sessionId, lấy lịch sử chat của phiên đó
        let url = "http://localhost:3000/api/chatbot/session";
        if (currentSessionId.value) {
          url += `?sessionId=${currentSessionId.value}`;
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          currentSessionId.value = response.data.sessionId;
          currentMessages.value = response.data.messages;

          // Tham gia phòng socket của phiên chat này
          socket.value.emit("join_chat_session", currentSessionId.value);

          // Reset tin nhắn chưa đọc khi mở chatbox
          if (isChatboxOpen.value) {
            unreadMessages.value = 0;
          }

          scrollToBottom();
        }
      } catch (error) {
        console.error("Lỗi khi tạo/lấy phiên chat:", error);
        toast.error("Bạn cần đăng nhập để trò chuyện");
      } finally {
        isLoading.value = false;
      }
    };

    // Lấy lịch sử các phiên chat
    const fetchChatSessions = async () => {
      try {
        isLoading.value = true;
        const token = authStore.token;

        const response = await axios.get(
          "http://localhost:3000/api/chatbot/sessions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          chatSessions.value = response.data.sessions;
        }
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử chat:", error);
      } finally {
        isLoading.value = false;
      }
    };

    // Gửi tin nhắn
    const sendMessage = async () => {
      if (!userMessage.value.trim() || isLoading.value) return;

      try {
        isLoading.value = true;
        const token = authStore.token;

        // Nếu chưa có phiên chat, tạo mới
        if (!currentSessionId.value) {
          await getOrCreateSession();
        }

        // Thêm tin nhắn của người dùng vào danh sách hiển thị
        const messageText = userMessage.value;
        currentMessages.value.push({
          role: "user",
          content: messageText,
          timestamp: new Date(),
        });

        // Xóa tin nhắn trong ô nhập và cuộn xuống
        userMessage.value = "";

        // Reset kích thước textarea
        if (messageInput.value) {
          messageInput.value.style.height = "30px";
        }

        scrollToBottom();

        // Gửi tin nhắn đến API
        const response = await axios.post(
          "http://localhost:3000/api/chatbot/message",
          {
            sessionId: currentSessionId.value,
            message: messageText,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Nếu socket không nhận được phản hồi, thêm tin nhắn từ API vào
        if (
          response.data.success &&
          !currentMessages.value.some(
            (msg) =>
              msg.role === "assistant" && msg.content === response.data.reply
          )
        ) {
          currentMessages.value.push({
            role: "assistant",
            content: response.data.reply,
            products: response.data.products || [],
            timestamp: new Date(),
          });
          scrollToBottom();
        }
      } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        toast.error("Không thể gửi tin nhắn");

        // Thêm tin nhắn lỗi
        currentMessages.value.push({
          role: "assistant",
          content:
            "Xin lỗi, tôi không thể trả lời bạn lúc này. Vui lòng thử lại sau.",
          timestamp: new Date(),
        });

        scrollToBottom();
      } finally {
        isLoading.value = false;
      }
    };

    // Hiển thị lịch sử chat
    const showHistory = async () => {
      showHistoryList.value = !showHistoryList.value;

      if (showHistoryList.value) {
        await fetchChatSessions();
      }
    };

    // Tải phiên chat cũ
    const loadSession = async (sessionId) => {
      currentSessionId.value = sessionId;
      showHistoryList.value = false;
      await getOrCreateSession();
    };

    // Bắt đầu chat mới
    const startNewChat = () => {
      currentSessionId.value = "";
      showHistoryList.value = false;
      currentMessages.value = [];
      getOrCreateSession();
    };

    // Xóa phiên chat
    const deleteSession = async (sessionId) => {
      try {
        const result = await Swal.fire({
          title: "Xóa cuộc trò chuyện này?",
          text: "Bạn sẽ không thể khôi phục lại!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
        });

        if (!result.isConfirmed) return;

        const token = authStore.token;

        const response = await axios.delete(
          `http://localhost:3000/api/chatbot/session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Đã xóa cuộc trò chuyện");

          // Nếu đang xem phiên chat bị xóa, bắt đầu phiên chat mới
          if (currentSessionId.value === sessionId) {
            startNewChat();
          }

          // Cập nhật lại danh sách phiên chat
          await fetchChatSessions();
        }
      } catch (error) {
        console.error("Lỗi khi xóa phiên chat:", error);
        toast.error("Không thể xóa cuộc trò chuyện");
      }
    };

    // Xóa tất cả phiên chat
    const deleteAllSessions = async () => {
      try {
        const result = await Swal.fire({
          title: "Xóa tất cả cuộc trò chuyện?",
          text: "Bạn sẽ không thể khôi phục lại!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Xóa tất cả",
          cancelButtonText: "Hủy",
        });

        if (!result.isConfirmed) return;

        const token = authStore.token;

        const response = await axios.delete(
          "http://localhost:3000/api/chatbot/sessions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Đã xóa tất cả cuộc trò chuyện");
          chatSessions.value = [];
          startNewChat();
        }
      } catch (error) {
        console.error("Lỗi khi xóa tất cả phiên chat:", error);
        toast.error("Không thể xóa tất cả cuộc trò chuyện");
      }
    };

    // Định dạng ngày tháng
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000); // Tính khoảng cách theo giây

      if (diff < 60) return "Vừa xong";
      if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
      if (diff < 172800) return "Hôm qua";

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Định dạng thời gian tin nhắn
    const formatMessageTime = (timestamp) => {
      if (!timestamp) return "";

      const date = new Date(timestamp);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Định dạng nội dung tin nhắn với markdown đơn giản
    const formatMessage = (content) => {
      if (!content) return "";
      // Xử lý xuống dòng
      return content.replace(/\n/g, "<br>");
    };

    // Xử lý xem trước phiên chat
    const getSessionPreview = (session) => {
      if (!session.messages || session.messages.length === 0) {
        return "Cuộc trò chuyện mới";
      }

      // Lấy tin nhắn đầu tiên
      const firstMessage = session.messages[0];
      let content = firstMessage.content || "";

      // Cắt ngắn nội dung
      if (content.length > 50) {
        content = content.substring(0, 50) + "...";
      }

      return content;
    };

    // Mở/đóng chatbox
    const toggleChatbox = async () => {
      isChatboxOpen.value = !isChatboxOpen.value;

      // Reset số tin nhắn chưa đọc khi mở chatbox
      if (isChatboxOpen.value) {
        unreadMessages.value = 0;
        showHistoryList.value = false;

        // Nếu chưa có sessionId, tạo mới hoặc lấy phiên chat hiện tại
        if (!currentSessionId.value) {
          await getOrCreateSession();
        }
      }
    };

    // Theo dõi thay đổi của currentMessages để cuộn xuống dưới
    watch(currentMessages, () => {
      scrollToBottom();
    });

    return {
      isLoggedIn,
      isChatboxOpen,
      userMessage,
      currentMessages,
      chatboxBody,
      isLoading,
      showHistoryList,
      chatSessions,
      unreadMessages,
      messageInput,
      showProductModal,
      selectedProduct,
      // Loại bỏ activeTab và productTabs
      toggleChatbox,
      sendMessage,
      formatDate,
      formatMessageTime,
      formatMessage,
      showHistory,
      loadSession,
      startNewChat,
      deleteSession,
      deleteAllSessions,
      getSessionPreview,
      autoResize,
      handleResetChat,
      viewProductDetails,
      closeProductModal,
      goToProductPage,
      handleImageError,
      truncateText,
    };
  },
};
</script>

<style scoped>
/* Chatbot container */
.chatbot-container {
  position: fixed;
  bottom: 10px;
  right: 20px;
  z-index: 1000;
  font-family: "Roboto", sans-serif;
}

/* Chat button */
.chat-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.chat-button i {
  font-size: 24px;
}

.chat-button:hover {
  transform: scale(1.05);
  background-color: #2980b9;
}

.chat-button.active {
  background-color: #2573a7;
}

/* Unread messages badge */
.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* Chatbox */
.chatbox {
  position: absolute;
  bottom: 65px; /* Increased from 75px to create more space */
  right: 0;
  width: 350px;
  height: 500px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  border: 1px solid #e1e8ed;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Chatbox header */
.chatbox-header {
  padding: 12px 16px;
  background-color: #3498db;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chatbox-title {
  display: flex;
  flex-direction: column;
}

.chatbox-title span {
  font-weight: bold;
  font-size: 16px;
}

.chatbox-title small {
  font-size: 12px;
  opacity: 0.8;
}

.chatbox-actions {
  display: flex;
  gap: 10px;
}

.icon-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.icon-btn:hover,
.icon-btn.active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Chatbox body */
.chatbox-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background-color: #ecf0f1;
}

/* Messages */
.messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-wrapper {
  display: flex;
  width: 100%;
  margin-bottom: 4px;
}

.user-message {
  justify-content: flex-end;
}

/* Chatbot icon */
.chatbot-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  margin-top: 5px;
  font-size: 14px;
  flex-shrink: 0;
}

.message {
  max-width: 80%;
  animation: fadeIn 0.3s;
}

.message.user {
  align-self: flex-end;
  margin-left: auto;
}

.message.assistant {
  align-self: flex-start;
  margin-top: 0; /* Điều chỉnh khoảng cách với icon */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  padding: 10px 12px;
  border-radius: 10px;
  position: relative;
  word-wrap: break-word;
}

.message.user .message-content {
  background-color: #3498db;
  color: white;
  border-radius: 10px;
  margin-right: 2px; /* Thêm margin cho tin nhắn người dùng */
}

.message.assistant .message-content {
  background-color: white;
  color: #333;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-top: 0; /* Điều chỉnh vị trí */
  margin-left: 0;
}

.message-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-time {
  font-size: 10px;
  opacity: 0.7;
  display: block;
  margin-top: 4px;
  text-align: right;
}

/* Typing indicator */
.loading-wrapper {
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 3px; /* Điều chỉnh vị trí xuống dưới một chút */
}

.typing-indicator {
  background-color: white;
  padding: 8px 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #3498db;
  border-radius: 50%;
  margin: 0 2px;
  animation: typing 1.5s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

/* Chatbox footer */
.chatbox-footer {
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #e1e8ed;
}

.history-footer {
  display: flex;
  justify-content: center;
}

.input-container {
  display: flex;
  align-items: flex-end;
  background-color: #ecf0f1;
  border-radius: 18px;
  padding: 6px 10px; /* Reduced padding to make the container smaller */
}

.chat-input {
  flex: 1;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 14px;
  max-height: 100px; /* Reduced from 120px */
  min-height: 30px; /* Reduced from 40px */
  resize: none;
  padding: 4px 0;
  line-height: 1.4;
}

.send-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 6px;
  flex-shrink: 0;
}

.send-button:hover {
  background-color: #2980b9;
}

.send-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

/* Chat history list */
.chat-history-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-history-list h3 {
  font-size: 16px;
  margin-bottom: 16px;
  text-align: center;
  color: #2c3e50;
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.session-item {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e1e8ed;
}

.session-item:hover {
  background-color: #f5f8fa;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.session-content {
  flex: 1;
  overflow: hidden;
}

.session-preview {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
  color: #2c3e50;
}

.session-date {
  font-size: 11px;
  color: #7f8c8d;
}

.delete-btn {
  background: none;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

.no-history {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #95a5a6;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin-bottom: 16px;
}

.btn-start-chat {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-start-chat:hover {
  background-color: #2980b9;
}

/* Responsive adjustment for mobile */
@media (max-width: 576px) {
  .chatbox {
    width: 300px;
    height: 450px;
    right: -15px;
  }

  .chat-button {
    width: 50px;
    height: 50px;
  }

  .chat-button i {
    font-size: 20px;
  }
}

/* Styles for product list in chat messages */
.product-list {
  margin-top: 12px;
  border-top: 1px solid #e1e8ed;
  padding-top: 8px;
  width: 100%;
}

.products-header {
  display: flex;
  align-items: center;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
}

.products-header i {
  margin-right: 5px;
  color: #3498db;
}

.products-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 8px;
  scrollbar-width: thin;
  scrollbar-color: #bdc3c7 transparent;
}

.products-carousel::-webkit-scrollbar {
  height: 4px;
}

.products-carousel::-webkit-scrollbar-track {
  background: transparent;
}

.products-carousel::-webkit-scrollbar-thumb {
  background-color: #bdc3c7;
  border-radius: 4px;
}

.product-card {
  flex: 0 0 140px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.product-image-container {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f8f9fa;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: #bdc3c7;
  font-size: 24px;
}

.product-info {
  padding: 8px;
}

.product-name {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  margin-bottom: 4px;
  height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #2c3e50;
}

.product-brand {
  font-size: 10px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.product-price {
  font-weight: 600;
  color: #e74c3c;
  font-size: 12px;
}

/* Product Modal Styles */
.product-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

.product-modal-content {
  background-color: white;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: zoomIn 0.3s;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.product-modal-header {
  padding: 16px;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  transition: color 0.2s;
}

.close-modal:hover {
  color: #e74c3c;
}

.product-modal-body {
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 768px) {
  .product-modal-body {
    flex-direction: row;
  }
}

.product-modal-image-container {
  flex: 1;
  max-width: 100%;
}

@media (min-width: 768px) {
  .product-modal-image-container {
    max-width: 45%;
  }
}

.product-modal-image {
  width: 100%;
  height: auto;
  max-height: 350px;
  object-fit: contain;
  border-radius: 4px;
}

.thumbnail-gallery {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
}

.thumbnail-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
}

.thumbnail-image.active {
  border-color: #3498db;
}

.product-modal-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-modal-price {
  font-size: 24px;
  font-weight: 600;
  color: #e74c3c;
  margin-bottom: 8px;
}

.product-modal-brand,
.product-modal-category {
  font-size: 14px;
  color: #7f8c8d;
}

/* Xóa bỏ các phần CSS liên quan đến tabs */

.product-modal-footer {
  padding: 16px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: center;
}

.view-product-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.view-product-btn:hover {
  background-color: #2980b9;
}

/* Adjust existing chatbox styles for better layout */
.chatbox-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background-color: #ecf0f1;
}

.message.assistant .message-content {
  max-width: 100%;
  width: auto;
  overflow: visible;
}
</style>
