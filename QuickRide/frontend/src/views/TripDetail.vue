<template>
  <div class="trip-detail-container">
    <div class="header">
      <el-button type="primary" link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>行程详情</h2>
      <span></span>
    </div>

    <div class="content">
      <div v-if="loading" class="loading">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <div v-else-if="!trip" class="empty">
        <el-icon :size="64" color="#ccc"><Van /></el-icon>
        <p>行程不存在</p>
      </div>

      <div v-else class="detail-content">
        <div class="route-card">
          <div class="route-info">
            <div class="location start">
              <span class="dot start-dot"></span>
              <span class="location-text">{{ trip.startLocation }}</span>
            </div>
            <div class="route-line"></div>
            <div class="location end">
              <span class="dot end-dot"></span>
              <span class="location-text">{{ trip.endLocation }}</span>
            </div>
          </div>
          <div class="route-meta">
            <span v-if="trip.distance">{{ trip.distance }}公里</span>
            <span v-if="trip.duration">约{{ trip.duration }}分钟</span>
            <el-tag :type="getStatusType(trip.status)" size="small">
              {{ getStatusText(trip.status) }}
            </el-tag>
          </div>
        </div>

        <div class="price-card">
          <div class="price-label">行程费用</div>
          <div class="price-value">¥{{ trip.price || '0.00' }}</div>
          <div class="price-time">{{ formatDate(trip.createdAt) }}</div>
        </div>

        <div class="driver-card" v-if="trip.driver">
          <h3 class="section-title">司机信息</h3>
          <div class="driver-info">
            <el-avatar :size="64" :icon="UserFilled" />
            <div class="driver-detail">
              <div class="driver-name">
                <h4>{{ trip.driver.name }}</h4>
                <el-rate v-model="driverRating" disabled show-score text-color="#ff9900" />
              </div>
              <p class="driver-car">{{ trip.driver.carModel }} · {{ trip.driver.carNumber }}</p>
              <p class="driver-stats">已完成{{ trip.driver.orderCount }}单 · 平均{{ trip.driver.rating }}分</p>
            </div>
          </div>

          <div class="driver-reviews" v-if="trip.driver.reviews && trip.driver.reviews.length > 0">
            <h4>用户评价</h4>
            <div class="review-item" v-for="review in trip.driver.reviews" :key="review.id">
              <div class="review-header">
                <span class="review-user">{{ review.userName }}</span>
                <el-rate v-model="review.rating" disabled size="small" />
              </div>
              <p class="review-content" v-if="review.content">{{ review.content }}</p>
              <span class="review-time">{{ formatDate(review.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="review-card" v-if="trip.status === 'completed' && !trip.rating">
          <h3 class="section-title">评价司机</h3>
          <div class="rating-input">
            <span class="rating-label">服务评分：</span>
            <el-rate v-model="reviewRating" show-score />
          </div>
          <div class="review-input">
            <el-input
              v-model="reviewContent"
              type="textarea"
              :rows="3"
              placeholder="请输入您的评价内容（选填）"
            />
          </div>
          <el-button
            type="primary"
            class="submit-btn"
            @click="submitReview"
            :loading="submitting"
            :disabled="!reviewRating"
          >
            提交评价
          </el-button>
        </div>

        <div class="review-card" v-if="trip.rating">
          <h3 class="section-title">我的评价</h3>
          <div class="my-review">
            <el-rate v-model="trip.rating" disabled show-score />
            <p v-if="trip.review" class="review-text">{{ trip.review }}</p>
          </div>
        </div>

        <div class="trip-info-card">
          <h3 class="section-title">行程信息</h3>
          <div class="info-item">
            <span class="info-label">车型</span>
            <span class="info-value">{{ getCarTypeName(trip.carType) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">下单时间</span>
            <span class="info-value">{{ formatFullDate(trip.createdAt) }}</span>
          </div>
          <div class="info-item" v-if="trip.completedAt">
            <span class="info-label">完成时间</span>
            <span class="info-value">{{ formatFullDate(trip.completedAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">行程编号</span>
            <span class="info-value">#{{ trip.id }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, Loading, Van, UserFilled } from '@element-plus/icons-vue';
import api from '@/utils/api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const submitting = ref(false);
const trip = ref<any>(null);
const reviewRating = ref(0);
const reviewContent = ref('');

const driverRating = computed(() => trip.value?.driver?.rating || 0);

const carTypeNames: Record<string, string> = {
  express: '快车',
  premium: '专车',
  luxury: '豪华车',
  taxi: '出租车'
};

onMounted(() => {
  fetchTripDetail();
});

async function fetchTripDetail() {
  const tripId = route.params.id;
  if (!tripId) {
    router.back();
    return;
  }

  try {
    const res = await api.get(`/trip/${tripId}`);
    trip.value = res.data.trip;
  } catch (error) {
    ElMessage.error('获取行程详情失败');
  } finally {
    loading.value = false;
  }
}

async function submitReview() {
  if (!reviewRating.value) {
    ElMessage.warning('请选择评分');
    return;
  }

  submitting.value = true;
  try {
    await api.post(`/trip/${route.params.id}/review`, {
      rating: reviewRating.value,
      review: reviewContent.value
    });
    ElMessage.success('评价成功');
    trip.value.rating = reviewRating.value;
    trip.value.review = reviewContent.value;
  } catch (error) {
    ElMessage.error('评价失败');
  } finally {
    submitting.value = false;
  }
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    completed: 'success',
    ongoing: 'primary',
    cancelled: 'info'
  };
  return map[status] || 'info';
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    completed: '已完成',
    ongoing: '进行中',
    cancelled: '已取消'
  };
  return map[status] || status;
}

function getCarTypeName(type: string) {
  return carTypeNames[type] || type;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' +
           date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
}

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>

<style scoped>
.trip-detail-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header h2 {
  margin: 0;
  font-size: 18px;
}

.content {
  padding: 20px;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.loading p,
.empty p {
  margin-top: 15px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.route-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.route-info {
  margin-bottom: 15px;
}

.location {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.start-dot {
  background: #67c23a;
}

.end-dot {
  background: #f56c6c;
}

.location-text {
  font-size: 15px;
  color: #333;
}

.route-line {
  width: 2px;
  height: 20px;
  background: #e4e7ed;
  margin-left: 5px;
}

.route-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
}

.price-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  text-align: center;
}

.price-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.price-value {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 8px;
}

.price-time {
  font-size: 13px;
  opacity: 0.8;
}

.section-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
}

.driver-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.driver-info {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.driver-detail {
  flex: 1;
}

.driver-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.driver-name h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.driver-car {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #666;
}

.driver-stats {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.driver-reviews h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

.review-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.review-user {
  font-size: 13px;
  color: #333;
}

.review-content {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.review-time {
  font-size: 11px;
  color: #999;
}

.review-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.rating-label {
  font-size: 14px;
  color: #333;
}

.submit-btn {
  width: 100%;
  margin-top: 15px;
  height: 44px;
}

.my-review {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.review-text {
  margin: 10px 0 0 0;
  font-size: 14px;
  color: #666;
}

.trip-info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
}
</style>
