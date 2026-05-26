<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-section">
        <el-icon :size="48" color="#667eea"><Van /></el-icon>
        <h1>注册账号</h1>
        <p>加入捷行出行，开启便捷之旅</p>
      </div>

      <el-form :model="form" class="register-form">
        <el-form-item>
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
            maxlength="11"
            :prefix-icon="Phone"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.code"
            placeholder="请输入验证码"
            maxlength="4"
            :prefix-icon="Key"
          >
            <template #append>
              <el-button
                :disabled="!canSend || !isValidPhone"
                :loading="sending"
                @click="handleSendCode"
              >
                {{ sending ? '发送中' : countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.nickname"
            placeholder="请输入昵称（选填）"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请设置密码（选填）"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            立即注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Phone, Key, Lock, User, Van } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useSmsCode } from '@/composables/useSmsCode';
import api from '@/utils/api';

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);

const form = ref({
  phone: '',
  code: '',
  nickname: '',
  password: ''
});

const codeRef = ref('');

const { countdown, sending, canSend, sendCode, verifyCodeFormat } = useSmsCode({
  autoFillTarget: codeRef
});

const isValidPhone = computed(() => /^1[3-9]\d{9}$/.test(form.value.phone));

watch(codeRef, (newCode) => {
  if (newCode && newCode.length === 4) {
    form.value.code = newCode;
  }
});

async function handleSendCode() {
  await sendCode(form.value.phone, 'register');
}

async function handleRegister() {
  if (!form.value.phone || !form.value.code) {
    ElMessage.warning('请填写必填信息');
    return;
  }

  if (!verifyCodeFormat(form.value.code)) {
    return;
  }

  loading.value = true;
  try {
    const res = await api.post('/auth/register', form.value);
    userStore.setToken(res.data.token);
    userStore.setUserInfo(res.data.user);
    ElMessage.success('注册成功');
    router.push('/home');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-section h1 {
  font-size: 24px;
  margin: 10px 0 5px;
  color: #333;
}

.logo-section p {
  color: #999;
  font-size: 14px;
}

.register-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.register-btn:hover {
  opacity: 0.9;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
  margin-left: 5px;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
