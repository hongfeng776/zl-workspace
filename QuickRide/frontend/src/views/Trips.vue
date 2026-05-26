<template>
  <div class="trips-container">
    <div class="trips-header">
      <el-button type="primary" link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>我的行程</h2>
      <span></span>
    </div>

    <div class="trips-content">
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <div v-else-if="trips.length === 0" class="empty-state">
        <el-icon :size="64" color="#ccc"><Van /></el-icon>
        <p>暂无行程记录</p>
      </div>

      <div v-else class="trip-list">
        <div class="trip-card" v-for="trip in trips" :key="trip.id" @click="goToDetail(trip.id)">
          <div class="trip-route">
            <div class="location start">
              <span class="dot start-dot"></span>
              <span>{{ trip.startLocation }}</span>
            </div>
            <div class="route-line"></div>
            <div class="location end">
              <span class="dot end-dot"></span>
              <span>{{ trip.endLocation }}</span>
            </div>
          </div>
          <div class="trip-info">
            <div class="trip-left">
              <span class="trip-date">{{ formatDate(trip.createdAt) }}</span>
              <span class="trip-distance" v-if="trip.distance">
                {{ trip.distance }}km
              </span>
              <span class="trip-car" v-if="trip.carType">
                {{ getCarTypeName(trip.carType) }}
              </span>
            </div>
            <div class="trip-right">
              <span class="trip-price">¥{{ trip.price || '0.00' }}</span>
              <el-tag :type="getStatusType(trip.status)" size="small">
                {{ getStatusText(trip.status) }}
              </el-tag>
            </div>
          </div>
          <div class="trip-arrow">
            <el-icon><Right /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Van, Loading, Right } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import api from '@/utils/api';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(true);
const trips = ref<any[]>([]);

onMounted(() => {
  fetchTrips();
});

async function fetchTrips() {
  loading.value = true;
  try {
    if (userStore.trips.length > 0) {
      trips.value = userStore.trips;
    }

    const res = await api.get('/trip/history');
    trips.value = res.data.trips;
    userStore.setTrips(res.data.trips);
  } catch (error) {
    console.error('获取行程失败');
  } finally {
    loading.value = false;
  }
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
  const map: Record<string, string> = {
    express: '快车',
    premium: '专车',
    luxury: '豪华车',
    taxi: '出租车'
  };
  return map[type] || type;
}

function goToDetail(tripId: number) {
  router.push(`/trip/${tripId}`);
}
</script>

<style scoped>
.trips-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.trips-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.trips-header h2 {
  margin: 0;
  font-size: 18px;
}

.trips-content {
  padding: 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.loading-state p,
.empty-state p {
  margin-top: 15px;
}

.trip-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.trip-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.trip-route {
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

.route-line {
  width: 2px;
  height: 20px;
  background: #e4e7ed;
  margin-left: 5px;
}

.location span:last-child {
  color: #333;
  font-size: 14px;
}

.trip-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.trip-left {
  display: flex;
  gap: 15px;
}

.trip-date,
.trip-distance {
  font-size: 12px;
  color: #999;
}

.trip-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trip-price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}
</style>
