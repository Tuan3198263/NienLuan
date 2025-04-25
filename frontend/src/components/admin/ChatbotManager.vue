<template>
  <div class="chatbot-manager">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">Quản lý Trò chuyện</h4>
      <div class="statistics">
        <span class="badge bg-info fs-6 me-3">
          <i class="fas fa-comments me-1"></i> Tổng:
          {{ totalConversations }} cuộc trò chuyện
        </span>
        <button
          @click="deleteAllConversations"
          class="btn btn-danger"
          :disabled="loading || totalConversations === 0"
        >
          <i class="fas fa-trash me-1"></i> Xóa tất cả cuộc trò chuyện
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-2">Đang xử lý...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";

export default {
  name: "ChatbotManager",
  setup() {
    const loading = ref(false);
    const totalConversations = ref(0);
    const toast = useToast();

    // Lấy tổng số cuộc trò chuyện
    const fetchConversationsCount = async () => {
      loading.value = true;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/chatbot/conversations/count"
        );
        totalConversations.value = response.data.total;
      } catch (error) {
        console.error("Lỗi khi lấy số cuộc trò chuyện:", error);
        toast.error("Không thể tải dữ liệu cuộc trò chuyện");
      } finally {
        loading.value = false;
      }
    };

    // Xóa tất cả cuộc trò chuyện sử dụng SweetAlert2
    const deleteAllConversations = async () => {
      // Sử dụng SweetAlert2 thay vì confirm mặc định
      const result = await Swal.fire({
        title: "Xác nhận xóa",
        text: "Bạn có chắc chắn muốn xóa TẤT CẢ cuộc trò chuyện? Hành động này không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa tất cả",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        loading.value = true;
        try {
          await axios.delete(
            "http://localhost:3000/api/chatbot/conversations/all"
          );

          // Thông báo thành công bằng SweetAlert2
          await Swal.fire({
            title: "Đã xóa!",
            text: "Tất cả cuộc trò chuyện đã được xóa thành công.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          totalConversations.value = 0;
        } catch (error) {
          console.error("Lỗi khi xóa cuộc trò chuyện:", error);

          // Thông báo lỗi bằng SweetAlert2
          await Swal.fire({
            title: "Lỗi!",
            text: "Không thể xóa cuộc trò chuyện.",
            icon: "error",
          });
        } finally {
          loading.value = false;
        }
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      fetchConversationsCount();
    });

    return {
      loading,
      totalConversations,
      deleteAllConversations,
    };
  },
};
</script>

<style scoped>
.chatbot-manager {
  padding: 20px 0;
}
</style>
