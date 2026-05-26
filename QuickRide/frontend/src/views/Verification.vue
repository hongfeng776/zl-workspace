<template>
  <div class="verification-container">
    <div class="verification-header">
      <el-button type="primary" link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <h2>实名认证</h2>
      <span></span>
    </div>

    <div class="verification-content">
      <div v-if="status.verified" class="verified-card">
        <el-icon :size="64" color="#67c23a"><CircleCheck /></el-icon>
        <h3>实名认证成功</h3>
        <p class="name">姓名：{{ status.realName }}</p>
        <p class="id-card">身份证号：{{ status.idCard }}</p>
      </div>

      <div v-else class="form-card">
        <p class="tip">实名认证后可享受更多服务，请填写真实信息</p>

        <el-form :model="form" class="verification-form">
          <el-form-item label="真实姓名">
            <el-input v-model="form.realName" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item label="身份证号">
            <el-input v-model="form.idCard" placeholder="请输入身份证号码" maxlength="18" />
          </el-form-item>

          <div class="upload-section">
            <div class="upload-item">
              <p class="upload-label">身份证人像面</p>
              <el-upload
                class="uploader"
                :show-file-list="false"
                :before-upload="(file) => handleBeforeUpload(file, 'front')"
                :http-request="(file) => handleFileChange(file, 'front')"
                accept="image/*"
              >
                <img v-if="form.idCardFront" :src="form.idCardFront" class="upload-image" />
                <div v-else class="upload-placeholder">
                  <el-icon :size="32"><Plus /></el-icon>
                  <p>点击上传</p>
                </div>
              </el-upload>
            </div>

            <div class="upload-item">
              <p class="upload-label">身份证国徽面</p>
              <el-upload
                class="uploader"
                :show-file-list="false"
                :before-upload="(file) => handleBeforeUpload(file, 'back')"
                :http-request="(file) => handleFileChange(file, 'back')"
                accept="image/*"
              >
                <img v-if="form.idCardBack" :src="form.idCardBack" class="upload-image" />
                <div v-else class="upload-placeholder">
                  <el-icon :size="32"><Plus /></el-icon>
                  <p>点击上传</p>
                </div>
              </el-upload>
            </div>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              :loading="loading"
              @click="handleSubmit"
            >
              提交认证
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, CircleCheck, Plus } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import api from '@/utils/api';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const status = ref({
  verified: false,
  realName: '',
  idCard: '',
  idCardFront: '',
  idCardBack: ''
});

const form = ref({
  realName: '',
  idCard: '',
  idCardFront: '',
  idCardBack: '',
  idCardFrontFile: null as File | null,
  idCardBackFile: null as File | null
});

onMounted(() => {
  fetchStatus();
});

async function fetchStatus() {
  try {
    const res = await api.get('/verification/status');
    status.value = res.data;
  } catch (error) {
    console.error('获取认证状态失败');
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

function handleFileChange(file: any, type: 'front' | 'back') {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (type === 'front') {
      form.value.idCardFront = e.target?.result as string;
      form.value.idCardFrontFile = file.file;
    } else {
      form.value.idCardBack = e.target?.result as string;
      form.value.idCardBackFile = file.file;
    }
  };
  reader.readAsDataURL(file.file);
}

async function handleSubmit() {
  if (!form.value.realName) {
    ElMessage.warning('请输入真实姓名');
    return;
  }
  if (!form.value.idCard || !/^\d{17}[\dXx]$/.test(form.value.idCard)) {
    ElMessage.warning('请输入有效的身份证号码');
    return;
  }
  if (!form.value.idCardFrontFile || !form.value.idCardBackFile) {
    ElMessage.warning('请上传身份证正反面照片');
    return;
  }

  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('realName', form.value.realName);
    formData.append('idCard', form.value.idCard);
    formData.append('idCardFront', form.value.idCardFrontFile);
    formData.append('idCardBack', form.value.idCardBackFile);

    await api.post('/verification/id-card', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    ElMessage.success('认证提交成功');
    if (userStore.userInfo) {
      userStore.userInfo.verified = true;
    }
    fetchStatus();
  } catch (error) {
    console.error('认证失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.verification-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.verification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.verification-header h2 {
  margin: 0;
  font-size: 18px;
}

.verification-content {
  padding: 20px;
}

.verified-card {
  background: white;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
}

.verified-card h3 {
  margin: 20px 0;
  color: #333;
}

.verified-card .name,
.verified-card .id-card {
  color: #666;
  margin: 10px 0;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.tip {
  color: #999;
  font-size: 14px;
  margin-bottom: 20px;
}

.upload-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.upload-item {
  flex: 1;
}

.upload-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.uploader {
  width: 100%;
}

.upload-placeholder {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 30px 10px;
  text-align: center;
  color: #999;
  cursor: pointer;
}

.upload-placeholder:hover {
  border-color: #667eea;
}

.upload-placeholder p {
  margin: 10px 0 0;
  font-size: 14px;
}

.upload-image {
  width: 100%;
  border-radius: 8px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}
</style>
