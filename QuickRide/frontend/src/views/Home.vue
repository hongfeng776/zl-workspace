<template>
  <div class="home-container">
    <div class="home-header">
      <div class="user-info">
        <el-avatar :size="48" :icon="UserFilled" />
        <div class="user-detail">
          <h2>{{ userStore.userInfo?.nickname || '用户' }}</h2>
          <p>{{ userStore.userInfo?.phone }}</p>
        </div>
        <el-button type="primary" link @click="router.push('/profile')">
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="home-content">
      <div class="quick-actions">
        <div class="action-card" @click="router.push('/trips')">
          <el-icon :size="32" color="#667eea"><Van /></el-icon>
          <span>我的行程</span>
        </div>
        <div class="action-card" @click="router.push('/verification')">
          <el-icon :size="32" :color="userStore.userInfo?.verified ? '#67c23a' : '#e6a23c'">
            <CreditCard />
          </el-icon>
          <span>{{ userStore.userInfo?.verified ? '已实名' : '实名认证' }}</span>
        </div>
        <div class="action-card" @click="router.push('/profile')">
          <el-icon :size="32" color="#667eea"><Wallet /></el-icon>
          <span>我的钱包</span>
        </div>
        <div class="action-card" @click="router.push('/appeal')">
          <el-icon :size="32" color="#667eea"><Service /></el-icon>
          <span>账号申诉</span>
        </div>
      </div>

      <div class="trip-card">
        <div class="trip-header">
          <h3>快捷出行</h3>
        </div>
        <div class="trip-form">
          <div class="location-input">
            <el-icon color="#67c23a"><Location /></el-icon>
            <el-input v-model="startLocation" placeholder="请输入起点" />
          </div>
          <div class="location-divider">
            <el-icon color="#999"><Sort /></el-icon>
          </div>
          <div class="location-input">
            <el-icon color="#f56c6c"><Location /></el-icon>
            <el-input v-model="endLocation" placeholder="请输入终点" />
          </div>
          <el-button type="primary" class="book-btn" size="large">
            立即叫车
          </el-button>
        </div>
      </div>

      <div class="recent-trips" v-if="userStore.trips.length > 0">
        <div class="section-header">
          <h3>最近行程</h3>
          <el-button type="primary" link @click="router.push('/trips')">查看全部</el-button>
        </div>
        <div class="trip-list">
          <div class="trip-item" v-for="trip in userStore.trips.slice(0, 3)" :key="trip.id">
            <div class="trip-info">
              <div class="trip-locations">
                <span class="start">{{ trip.startLocation }}</span>
                <el-icon><Right /></el-icon>
                <span class="end">{{ trip.endLocation }}</span>
              </div>
              <div class="trip-meta">
                <span>{{ trip.createdAt }}</span>
                <span class="price">¥{{ trip.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  UserFilled,
  Setting,
  Van,
  CreditCard,
  Wallet,
  Service,
  Location,
  Sort,
  Right
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const startLocation = ref('');
const endLocation = ref('');

onMounted(() => {
  if (!userStore.userInfo) {
    userStore.fetchUserInfo();
  }
});
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-header {
  padding: 40px 20px 20px;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-detail h2 {
  font-size: 20px;
  margin: 0;
}

.user-detail p {
  margin: 5px 0 0;
  opacity: 0.9;
  font-size: 14px;
}

.home-content {
  background: #f5f7fa;
  border-radius: 24px 24px 0 0;
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-card span {
  font-size: 12px;
  color: #666;
}

.trip-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.trip-header {
  margin-bottom: 20px;
}

.trip-header h3 {
  margin: 0;
  color: #333;
}

.location-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.location-divider {
  text-align: center;
  padding: 10px 0;
}

.book-btn {
  width: 100%;
  margin-top: 20px;
  height: 48px;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.recent-trips {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.trip-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.trip-item {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.trip-locations {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  margin-bottom: 10px;
}

.trip-locations .start,
.trip-locations .end {
  flex: 1;
  color: #333;
}

.trip-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.trip-meta .price {
  color: #f56c6c;
  font-weight: 600;
}
</style>
