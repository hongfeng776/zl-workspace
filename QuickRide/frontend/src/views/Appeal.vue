<template>
  <div class="appeal-container">
    <div class="appeal-header">
      <el-button type="primary" link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>账号申诉</h2>
      <span></span>
    </div>

    <div class="appeal-content">
      <div class="appeal-card">
        <p class="tip">提交申诉材料，我们将在3个工作日内处理</p>

        <el-form :model="form" class="appeal-form">
          <el-form-item label="手机号">
            <el-input v-model="form.phone" placeholder="请输入注册手机号" maxlength="11" />
          </el-form-item>
          <el-form-item label="真实姓名">
            <el-input v-model="form.realName" placeholder="请输入真实姓名（选填）" />
          </el-form-item>
          <el-form-item label="申诉原因">
            <el-input
              v-model="form.reason"
              type="textarea"
              :rows="4"
              placeholder="请详细描述您的问题或申诉原因"
            />
          </el-form-item>
          <el-form-item label="补充材料">
            <el-upload
              multiple
              :show-file-list="true"
              :limit="3"
              :before-upload="handleBeforeUpload"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              action="#"
              :auto-upload="false"
              accept="image/*"
            >
              <el-button type="primary" plain>
                <el-icon><Upload /></el-icon>
                上传图片
              </el-button>
              <template #tip>
                <div class="el-upload__tip">
                  最多上传3张图片，单张不超过5MB
                </div>
              </template>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              :loading="loading"
              @click="handleSubmit"
            >
              提交申诉
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="appeals.length > 0" class="history-card">
        <h3>申诉记录</h3>
        <div class="appeal-list">
          <div class="appeal-item" v-for="item in appeals" :key="item.id">
            <div class="appeal-header-item">
              <span class="reason">{{ item.reason }}</span>
              <el-tag :type="getStatusType(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </el-tag>
            </div>
            <p class="date">{{ item.createdAt }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Upload } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import api from '@/utils/api';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const appeals = ref<any[]>([]);
const uploadedFiles = ref<File[]>([]);

const form = ref({
  phone: '',
  realName: '',
  reason: ''
});

onMounted(() => {
  if (userStore.userInfo) {
    form.value.phone = userStore.userInfo.phone;
  }
  if (userStore.isLoggedIn) {
    fetchAppeals();
  }
});

async function fetchAppeals() {
  try {
    const res = await api.get('/appeal/list');
    appeals.value = res.data.appeals;
  } catch (error) {
    console.error('获取申诉列表失败');
  }
}

function handleBeforeUpload(file: File) {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!');
    return false;
  }
  return true;
}

function handleFileChange(file: any) {
  if (file.raw) {
    uploadedFiles.value.push(file.raw);
  }
}

function handleFileRemove(file: any) {
  const index = uploadedFiles.value.findIndex((f) => f.name === file.name);
  if (index > -1) {
    uploadedFiles.value.splice(index, 1);
  }
}

async function handleSubmit() {
  if (!form.value.phone) {
    ElMessage.warning('请输入手机号');
    return;
  }
  if (!form.value.reason) {
    ElMessage.warning('请填写申诉原因');
    return;
  }

  loading.value = true;
  try {
    await api.post('/appeal/submit', {
      ...form.value,
      materials: uploadedFiles.value.map((f) => f.name)
    });

    ElMessage.success('申诉提交成功');
    form.value.reason = '';
    form.value.realName = '';
    uploadedFiles.value = [];
  } catch (error) {
    console.error('申诉提交失败');
  } finally {
    loading.value = false;
  }
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    resolved: 'success',
    rejected: 'danger'
  };
  return map[status] || 'info';
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    rejected: '已拒绝'
  };
  return map[status] || status;
}
</script>

<style scoped>
.appeal-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.appeal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.appeal-header h2 {
  margin: 0;
  font-size: 18px;
}

.appeal-content {
  padding: 20px;
}

.appeal-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.tip {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.history-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.history-card h3 {
  margin: 0 0 20px;
  color: #333;
}

.appeal-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.appeal-item {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.appeal-header-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.appeal-header-item .reason {
  color: #333;
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.appeal-item .date {
  margin: 0;
  color: #999;
  font-size: 12px;
}
</style>
