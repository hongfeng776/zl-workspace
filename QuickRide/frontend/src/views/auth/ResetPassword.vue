<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="logo-section">
        <el-icon :size="48" color="#667eea"><Van /></el-icon>
        <h1>重置密码</h1>
        <p>通过手机号验证找回账号</p>
      </div>

      <el-form :model="form" class="reset-form">
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
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="reset-btn"
            :loading="loading"
            @click="handleReset"
          >
            确认重置
          </el-button>
        </el-form-item>
      </el-form>

      <div class="reset-footer">
        <router-link to="/login">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Phone, Key, Lock, Van } from '@element-plus/icons-vue';
import { useSmsCode } from '@/composables/useSmsCode';
import api from '@/utils/api';

const router = useRouter();

const loading = ref(false);

const form = ref({
  phone: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
});

const codeRef = computed({
  get: () => form.value.code,
  set: (val) => { form.value.code = val; }
});

const { countdown, sending, canSend, sendCode, verifyCodeFormat } = useSmsCode({
  autoFillTarget: codeRef as any
});

const isValidPhone = computed(() => /^1[3-9]\d{9}$/.test(form.value.phone));

async function handleSendCode() {
  await sendCode(form.value.phone, 'reset');
}

function handleReset() {
  if (!form.value.phone || !form.value.code || !form.value.newPassword || !form.value.confirmPassword) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  if (!verifyCodeFormat(form.value.code)) {
    return;
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致');
    return;
  }

  if (form.value.newPassword.length < 6) {
    ElMessage.warning('密码长度不能少于6位');
    return;
  }

  loading.value = true;
  api.post('/auth/reset-password', {
    phone: form.value.phone,
    code: form.value.code,
    newPassword: form.value.newPassword
  })
    .then(() => {
      ElMessage.success('密码重置成功，请使用新密码登录');
      router.push('/login');
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style scoped>
.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.reset-card {
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

.reset-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.reset-btn:hover {
  opacity: 0.9;
}

.reset-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.reset-footer a {
  color: #667eea;
  text-decoration: none;
}

.reset-footer a:hover {
  text-decoration: underline;
}
</style>
