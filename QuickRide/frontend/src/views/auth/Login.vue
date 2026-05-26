<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <el-icon :size="48" color="#667eea"><Van /></el-icon>
        <h1>捷行出行</h1>
        <p>便捷出行每一天</p>
      </div>

      <el-tabs v-model="loginType" class="login-tabs">
        <el-tab-pane label="验证码登录" name="code">
          <el-form :model="codeForm" class="login-form">
            <el-form-item>
              <el-input
                v-model="codeForm.phone"
                placeholder="请输入手机号"
                maxlength="11"
                :prefix-icon="Phone"
              />
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="codeForm.code"
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
              <el-button
                type="primary"
                class="login-btn"
                :loading="loading"
                @click="handleCodeLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="密码登录" name="password">
          <el-form :model="passwordForm" class="login-form">
            <el-form-item>
              <el-input
                v-model="passwordForm.phone"
                placeholder="请输入手机号"
                maxlength="11"
                :prefix-icon="Phone"
              />
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="login-btn"
                :loading="loading"
                @click="handlePasswordLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="login-links">
        <router-link to="/register">注册账号</router-link>
        <span class="divider">|</span>
        <router-link to="/reset-password">忘记密码</router-link>
        <span class="divider">|</span>
        <router-link to="/appeal">账号申诉</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Phone, Key, Lock, Van } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useSmsCode } from '@/composables/useSmsCode';
import api from '@/utils/api';

const router = useRouter();
const userStore = useUserStore();

const loginType = ref('code');
const loading = ref(false);

const codeForm = ref({
  phone: '',
  code: ''
});

const passwordForm = ref({
  phone: '',
  password: ''
});

const codeRef = ref('');

const { countdown, sending, canSend, sendCode, verifyCodeFormat } = useSmsCode({
  autoFillTarget: codeRef
});

const isValidPhone = computed(() => /^1[3-9]\d{9}$/.test(codeForm.value.phone));

watch(codeRef, (newCode) => {
  if (newCode && newCode.length === 4) {
    codeForm.value.code = newCode;
  }
});

async function handleSendCode() {
  await sendCode(codeForm.value.phone, 'login');
}

async function handleCodeLogin() {
  if (!codeForm.value.phone || !codeForm.value.code) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  if (!verifyCodeFormat(codeForm.value.code)) {
    return;
  }

  loading.value = true;
  try {
    const res = await api.post('/auth/login', {
      phone: codeForm.value.phone,
      code: codeForm.value.code
    });
    userStore.setToken(res.data.token);
    userStore.setUserInfo(res.data.user);
    userStore.setTrips(res.data.trips);
    ElMessage.success('登录成功');
    router.push('/home');
  } finally {
    loading.value = false;
  }
}

function handlePasswordLogin() {
  if (!passwordForm.value.phone || !passwordForm.value.password) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  loading.value = true;
  api.post('/auth/login', {
    phone: passwordForm.value.phone,
    password: passwordForm.value.password
  })
    .then((res) => {
      userStore.setToken(res.data.token);
      userStore.setUserInfo(res.data.user);
      userStore.setTrips(res.data.trips);
      ElMessage.success('登录成功');
      router.push('/home');
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
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
  font-size: 28px;
  margin: 10px 0 5px;
  color: #333;
}

.logo-section p {
  color: #999;
  font-size: 14px;
}

.login-tabs {
  margin-bottom: 20px;
}

.login-form {
  margin-top: 20px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.login-btn:hover {
  opacity: 0.9;
}

.login-links {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.login-links a {
  color: #667eea;
  text-decoration: none;
}

.login-links a:hover {
  text-decoration: underline;
}

.divider {
  margin: 0 10px;
  color: #ddd;
}
</style>
