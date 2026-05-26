<template>
  <div class="profile-container">
    <div class="profile-header">
      <el-button type="primary" link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>个人中心</h2>
      <span></span>
    </div>

    <div class="profile-card">
      <div class="avatar-section">
        <el-avatar :size="80" :icon="UserFilled" />
        <h3>{{ userStore.userInfo?.nickname || '用户' }}</h3>
        <p>{{ userStore.userInfo?.phone }}</p>
        <el-tag v-if="userStore.userInfo?.verified" type="success" size="small">
          已实名认证
        </el-tag>
        <el-tag v-else type="warning" size="small">
          未实名认证
        </el-tag>
      </div>
    </div>

    <div class="menu-list">
      <div class="menu-item" @click="router.push('/verification')">
        <div class="menu-left">
          <el-icon color="#667eea"><CreditCard /></el-icon>
          <span>实名认证</span>
        </div>
        <div class="menu-right">
          <span v-if="userStore.userInfo?.verified" class="verified-text">已认证</span>
          <span v-else class="unverified-text">去认证</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="menu-item" @click="router.push('/trips')">
        <div class="menu-left">
          <el-icon color="#667eea"><Van /></el-icon>
          <span>我的行程</span>
        </div>
        <div class="menu-right">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="menu-item">
        <div class="menu-left">
          <el-icon color="#667eea"><Wallet /></el-icon>
          <span>我的钱包</span>
        </div>
        <div class="menu-right">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="menu-item" @click="router.push('/appeal')">
        <div class="menu-left">
          <el-icon color="#667eea"><Service /></el-icon>
          <span>账号申诉</span>
        </div>
        <div class="menu-right">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="menu-item">
        <div class="menu-left">
          <el-icon color="#667eea"><Setting /></el-icon>
          <span>设置</span>
        </div>
        <div class="menu-right">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <div class="logout-section">
      <el-button type="danger" size="large" @click="handleLogout">
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowLeft,
  UserFilled,
  CreditCard,
  Van,
  Wallet,
  Service,
  Setting,
  ArrowRight
} from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import api from '@/utils/api';

const router = useRouter();
const userStore = useUserStore();

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    try {
      await api.post('/auth/logout');
    } catch (apiError) {
      console.warn('退出登录接口调用失败，将强制清除本地登录状态');
    }

    userStore.logout();
    ElMessage.success('已退出登录');
    router.push('/login');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出登录失败:', error);
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.profile-header h2 {
  margin: 0;
  font-size: 18px;
}

.profile-card {
  background: white;
  margin: 20px;
  border-radius: 16px;
  padding: 30px;
}

.avatar-section {
  text-align: center;
}

.avatar-section h3 {
  margin: 15px 0 5px;
  color: #333;
}

.avatar-section p {
  margin: 0 0 10px;
  color: #999;
  font-size: 14px;
}

.menu-list {
  background: white;
  margin: 0 20px;
  border-radius: 16px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f9f9f9;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-left span {
  color: #333;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #999;
}

.verified-text {
  color: #67c23a;
  font-size: 14px;
}

.unverified-text {
  color: #e6a23c;
  font-size: 14px;
}

.logout-section {
  padding: 30px 20px;
}

.logout-section .el-button {
  width: 100%;
}
</style>
