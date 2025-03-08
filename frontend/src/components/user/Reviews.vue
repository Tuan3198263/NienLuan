<template>
  <div class="container py-4">
    <!-- Phần tổng quan đánh giá -->
    <div class="mb-4">
      <h2 class="fs-2 fw-semibold">Đánh giá</h2>
      <div class="d-flex align-items-center mt-2">
        <span class="fs-1 fw-bold">{{ averageRating }}/5</span>
        <div class="ms-4">
          <div class="d-flex align-items-center">
            <i
              v-for="star in fullStars"
              :key="'full-' + star"
              class="fas fa-star text-pink-500"
            ></i>
            <i
              v-if="hasHalfStar"
              class="fas fa-star-half-alt text-pink-500"
            ></i>
          </div>
          <span class="text-muted">{{ totalReviews }} Đánh giá</span>
        </div>
      </div>
    </div>

    <!-- Phần thanh đánh giá chi tiết -->
    <div class="mb-5">
      <div
        v-for="rating in ratings"
        :key="rating.value"
        class="d-flex align-items-center mt-1"
      >
        <span class="text-muted fs-6 fw-medium">{{ rating.value }}</span>
        <div class="progress w-100 mx-2" style="height: 8px">
          <div
            class="progress-bar bg-pink-500"
            :style="{ width: rating.percentage + '%' }"
          ></div>
        </div>
        <span class="text-muted fs-6 fw-medium">{{ rating.count }}</span>
      </div>
    </div>

    <!-- Thông báo quyền đánh giá nếu người dùng có lượt đánh giá -->
    <div
      v-if="canReview"
      class="alert alert-info d-flex justify-content-between align-items-center mb-4"
    >
      <span>
        {{ eligibilityMessage }} - Còn {{ remainingReviews }} lượt đánh giá.
      </span>
      <div
        @click="showReviewForm = true"
        style="cursor: pointer; display: inline-block"
      >
        <i class="fas fa-star text-warning fs-4" title="Đánh giá sản phẩm"></i>
      </div>
    </div>

    <!-- Form đánh giá -->
    <div v-if="showReviewForm" class="card p-3 shadow-sm rounded">
      <h5 class="mb-3">Viết đánh giá</h5>

      <div class="mb-3">
        <label class="form-label fw-bold">Số sao:</label>
        <select v-model="review.rating" class="form-select w-50">
          <option v-for="star in 5" :key="star" :value="star">
            {{ star }} ⭐
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold">Nội dung đánh giá:</label>
        <textarea
          v-model="review.comment"
          class="form-control"
          rows="3"
          placeholder="Nhập nội dung đánh giá..."
          @input="checkReviewLength"
        ></textarea>

        <!-- Cảnh báo khi nội dung quá dài -->
        <div v-if="review.comment.length > 250" class="text-danger mt-2">
          Nội dung quá dài! Tối đa 250 ký tự.
        </div>
      </div>

      <!-- Button Section -->
      <div class="d-flex justify-content-end">
        <button
          class="btn btn-success px-4 me-2"
          @click="submitReview"
          :disabled="review.comment.length === 0 || review.comment.length > 250"
        >
          <i class="fas fa-paper-plane"></i> Gửi
        </button>
        <button
          class="btn btn-outline-secondary btn-sm"
          @click="showReviewForm = false"
        >
          Hủy
        </button>
      </div>
    </div>

    <!--đánh giá của người dùng-->
    <div class="mt-4">
      <div
        v-for="review in paginatedReviews"
        :key="review.id"
        class="position-relative d-flex align-items-start mb-4 review-container"
        :class="{ 'opacity-50': review.status === 'hidden' && isAdmin }"
      >
        <!-- Nút ẩn (chỉ admin thấy) -->
        <button
          v-if="isAdmin && review.status === 'active'"
          @click="hideReview(review.id)"
          class="btn btn-sm position-absolute top-0 end-0 text-secondary"
          title="Ẩn đánh giá"
        >
          <i class="fas fa-eye-slash"></i>
        </button>

        <!-- Nút hiện bình luận (chỉ admin thấy) -->
        <button
          v-if="isAdmin && review.status === 'hidden'"
          @click="showReview(review.id)"
          class="btn btn-sm position-absolute top-0 end-0 text-secondary"
          title="Hiện đánh giá"
        >
          <i class="fas fa-eye"></i>
        </button>

        <img
          :alt="'Profile picture of ' + review.name"
          class="rounded-circle me-3 review-avatar"
          height="50"
          width="50"
          :src="review.avatar"
        />
        <div class="review-content">
          <div class="d-flex align-items-center mb-1">
            <span class="fw-bold">{{ review.name }}</span>
            <span class="text-muted ms-3 fs-6">
              {{ review.date }}
              <span
                v-if="review.status === 'hidden'"
                class="text-danger fw-medium"
              >
                *Đánh giá bị ẩn*
              </span>
            </span>
          </div>
          <div class="d-flex align-items-center mb-2">
            <span v-for="star in 5" :key="star">
              <i
                v-if="star <= Math.floor(review.rating)"
                class="fas fa-star text-pink-500"
              ></i>
              <i
                v-else-if="star - 1 < review.rating && review.rating % 1 !== 0"
                class="fas fa-star-half-alt text-pink-500"
              ></i>
              <i v-else class="fas fa-star text-secondary"></i>
            </span>

            <!-- Nhãn "Đã mua sản phẩm" -->
            <span
              class="badge text-success ms-2"
              title="Người dùng đã mua sản phẩm này"
            >
              <i class="fas fa-check-circle"></i> Đã mua sản phẩm
            </span>
          </div>

          <p
            class="text-muted review-text"
            v-if="review.status === 'active' || isAdmin"
          >
            {{ review.comment }}
          </p>
        </div>
      </div>

      <!-- Nút phân trang -->
      <nav v-if="totalPages > 1">
        <ul class="pagination justify-content-center mt-4">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="prevPage">Trước</button>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <button class="page-link" @click="currentPage = page">
              {{ page }}
            </button>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
            <button class="page-link" @click="nextPage">Tiếp theo</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useAuthStore } from "../../store/AuthStore";
import Swal from "sweetalert2"; // Import SweetAlert2
import { useToast } from "vue-toastification"; // Import useToast

const authStore = useAuthStore();
const Toast = useToast();
const isAdmin = computed(() => authStore.role === "admin");

const ratings = ref([]);
const reviews = ref([]);
const averageRating = ref(0);
const totalReviews = ref(0);

const fullStars = ref(0);
const hasHalfStar = ref(false);
const currentPage = ref(1);
const reviewsPerPage = 3; // Mỗi trang hiển thị 3 đánh giá

// Biến kiểm tra quyền đánh giá
const canReview = ref(false);
const eligibilityMessage = ref("");
const remainingReviews = ref(0);
const showReviewForm = ref(false);
const review = ref({ rating: 5, comment: "" });
const isSubmitting = ref(false); // Thêm state loading

const props = defineProps({
  productId: String,
});

// Kiểm tra đăng nhập (token)
const checkAuth = () => {
  if (!authStore.isAuthenticated()) {
    return false; // Trả về false nếu chưa đăng nhập
  }
  return true; // Trả về true nếu đã đăng nhập
};

// Lấy danh sách đánh giá hiện tại theo trang
const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * reviewsPerPage;
  const end = start + reviewsPerPage;
  return reviews.value.slice(start, end);
});

// Tổng số trang
const totalPages = computed(() =>
  Math.ceil(reviews.value.length / reviewsPerPage)
);

// Chuyển trang
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Lấy tổng quan đánh giá
const fetchReviewSummary = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/reviews/average/${props.productId}`
    );
    const data = response.data;

    averageRating.value = parseFloat(data.averageRating) || 0;
    totalReviews.value = data.reviewCount || 0;

    fullStars.value = Math.floor(averageRating.value);
    hasHalfStar.value = averageRating.value % 1 !== 0;

    ratings.value = Object.keys(data.ratingBreakdown)
      .map((key) => ({
        value: key,
        count: data.ratingBreakdown[key],
        percentage:
          totalReviews.value > 0
            ? (data.ratingBreakdown[key] / totalReviews.value) * 100
            : 0,
      }))
      .reverse();
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tổng quan đánh giá:", error);
  }
};

// Lấy danh sách đánh giá
const fetchReviews = async () => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/reviews/${props.productId}`
    );

    if (response.data.reviews) {
      reviews.value = response.data.reviews.map((review) => ({
        id: review._id,
        name: review.userId.fullName,
        avatar: review.userId.avatar,
        stars: Math.floor(review.rating),
        halfStar: review.rating % 1 !== 0,
        rating: review.rating,
        comment: review.comment,
        status: review.status, // Lấy trạng thái hidden/active
        date: `${new Date(review.createdAt).toLocaleDateString("vi-VN", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        })} lúc ${new Date(review.createdAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      }));
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đánh giá:", error);
  }
};

// Kiểm tra quyền đánh giá của người dùng
const checkReviewEligibility = async () => {
  // Kiểm tra nếu người dùng chưa đăng nhập
  if (!checkAuth()) {
    canReview.value = false;
    eligibilityMessage.value = "Bạn cần đăng nhập để có thể đánh giá.";
    remainingReviews.value = 0;
    return; // Nếu chưa đăng nhập, dừng lại và không gửi yêu cầu API
  }

  try {
    const response = await axios.get(
      `http://localhost:3000/api/reviews/eligibility/${props.productId}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );
    canReview.value = response.data.canReview;
    eligibilityMessage.value = response.data.message;
    remainingReviews.value = response.data.remainingReviews;
  } catch (error) {
    console.error("Lỗi khi kiểm tra quyền đánh giá:", error);
  }
};

// Ẩn đánh giá
const hideReview = async (reviewId) => {
  Swal.fire({
    title: "Xác nhận ẩn đánh giá?",
    text: "Bạn có chắc chắn muốn ẩn đánh giá này không?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ẩn",
    cancelButtonText: "Hủy",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.put(
          `http://localhost:3000/api/reviews/hide/${reviewId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );

        const review = reviews.value.find((r) => r.id === reviewId);
        if (review) review.status = "hidden";

        Toast.success("Đánh giá đã được ẩn");
      } catch (error) {
        console.error("Lỗi khi ẩn đánh giá:", error);
        Toast.error("Không thể ẩn đánh giá. Vui lòng thử lại!");
      }
    }
  });
};

// Hiện đánh giá
const showReview = async (reviewId) => {
  Swal.fire({
    title: "Xác nhận hiện đánh giá?",
    text: "Bạn có chắc chắn muốn hiện lại đánh giá này không?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Hiện",
    cancelButtonText: "Hủy",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.put(
          `http://localhost:3000/api/reviews/unhide/${reviewId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );

        const review = reviews.value.find((r) => r.id === reviewId);
        if (review) review.status = "active";

        Toast.success("Đánh giá đã được hiển thị");
      } catch (error) {
        console.error("Lỗi khi hiện lại đánh giá:", error);
        Toast.error("Không thể hiện đánh giá. Vui lòng thử lại!");
      }
    }
  });
};

const submitReview = async () => {
  if (isSubmitting.value) return; // Ngăn chặn submit nhiều lần

  const confirmResult = await Swal.fire({
    title: "Xác nhận gửi đánh giá",
    text: "Bạn có chắc muốn gửi đánh giá này?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Gửi",
    cancelButtonText: "Hủy",
  });

  if (!confirmResult.isConfirmed) return; // Nếu nhấn "Hủy" thì thoát

  try {
    isSubmitting.value = true;

    // Hiển thị thông báo loading (không dùng await)
    Swal.fire({
      title: "Vui lòng chờ...",
      html: "Đang xử lý đánh giá của bạn",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await axios.post(
      "http://localhost:3000/api/reviews/add",
      {
        productId: props.productId,
        rating: review.value.rating,
        comment: review.value.comment,
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    // Đóng thông báo loading
    Swal.close();

    if (response.data.success) {
      await Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Đánh giá của bạn đã được gửi",
        timer: 2000,
        showConfirmButton: false,
      });
      currentPage.value = 1; // Đặt lại trang về 1

      showReviewForm.value = false;
      review.value = { rating: 5, comment: "" };

      // Thêm dòng này để cập nhật số lượng đánh giá còn lại
      await checkReviewEligibility();

      fetchReviews();
      fetchReviewSummary();
    } else {
      throw new Error(response.data.message || "Gửi đánh giá thất bại");
    }
  } catch (error) {
    Swal.close(); // Đảm bảo đóng loading

    Swal.fire({
      icon: "error",
      title: "Lỗi!",
      text: error.response?.data?.message || error.message || "Có lỗi xảy ra",
      confirmButtonColor: "#3085d6",
    });
  } finally {
    isSubmitting.value = false; // Reset trạng thái loading
  }
};

onMounted(() => {
  fetchReviewSummary();
  fetchReviews();
  checkReviewEligibility();
});
</script>

<style scoped>
.text-pink-500 {
  color: #e91e63;
}
.progress-bar {
  background-color: #e91e63;
}

.review-container {
  max-width: 100%; /* Giữ phần đánh giá không tràn ra ngoài */
  word-break: break-word; /* Ngăn nội dung tràn khỏi khung */
  overflow: hidden; /* Ẩn nội dung tràn */
}

.review-avatar {
  flex-shrink: 0; /* Không cho hình ảnh thu nhỏ khi nội dung dài */
}

.review-content {
  max-width: 100%;
  word-break: break-word;
  overflow-wrap: break-word;
}

.review-text {
  max-width: 100%; /* Đảm bảo văn bản không tràn ra ngoài */
  white-space: normal; /* Đảm bảo văn bản tự xuống dòng */
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination .page-item {
  list-style: none;
  margin: 0 5px;
}

.pagination .page-link {
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #ddd;
  color: #007bff;
  cursor: pointer;
  border-radius: 4px;
}

.pagination .page-item.disabled .page-link {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  color: white;
}

.pagination .page-link:hover {
  background-color: #0056b3;
  color: white;
}
</style>
