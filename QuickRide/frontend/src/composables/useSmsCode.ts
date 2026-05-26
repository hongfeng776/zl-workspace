import { ref, computed, Ref } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/utils/api';

interface UseSmsCodeOptions {
  autoFillTarget?: Ref<string>;
  autoFillDelay?: number;
}

export function useSmsCode(options: UseSmsCodeOptions = {}) {
  const { autoFillTarget, autoFillDelay = 300 } = options;

  const countdown = ref(0);
  const sending = ref(false);
  const receivedCode = ref('');
  let countdownTimer: number | null = null;

  const canSend = computed(() => countdown.value === 0 && !sending.value);
  const isTestEnv = computed(() => import.meta.env.DEV);

  function startCountdown(seconds: number = 60) {
    countdown.value = seconds;
    
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }

    countdownTimer = window.setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        if (countdownTimer) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
      }
    }, 1000);
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    countdown.value = 0;
  }

  async function sendCode(phone: string, type: 'register' | 'login' | 'reset' = 'register'): Promise<string | null> {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      ElMessage.warning('请输入有效的手机号');
      return null;
    }

    if (!canSend.value) {
      return null;
    }

    sending.value = true;

    try {
      const res = await api.post('/auth/send-code', { phone, type });
      
      const code = res.data?.code;
      
      if (code && code.length === 4) {
        receivedCode.value = code;
        console.log(`[测试环境] 验证码: ${code}`);

        if (autoFillTarget) {
          setTimeout(() => {
            autoFillTarget.value = code;
            ElMessage.success(`验证码已发送，已自动填充: ${code}`);
          }, autoFillDelay);
        } else {
          ElMessage.success(`验证码已发送（测试环境：${code}）`);
        }
      } else {
        ElMessage.success(res.data?.message || '验证码已发送');
      }

      startCountdown(60);
      return code || null;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '验证码发送失败，请稍后重试';
      
      if (error.response?.status === 429) {
        const match = errorMsg.match(/请(\d+)秒后再试/);
        if (match) {
          startCountdown(parseInt(match[1]));
        }
      }
      
      console.error('[验证码] 发送失败:', errorMsg);
      return null;
    } finally {
      sending.value = false;
    }
  }

  function verifyCodeFormat(code: string): boolean {
    if (!code) {
      ElMessage.warning('请输入验证码');
      return false;
    }
    if (code.length !== 4) {
      ElMessage.warning('请输入4位验证码');
      return false;
    }
    if (!/^\d{4}$/.test(code)) {
      ElMessage.warning('验证码只能是数字');
      return false;
    }
    return true;
  }

  return {
    countdown,
    sending,
    canSend,
    receivedCode,
    isTestEnv,
    sendCode,
    startCountdown,
    stopCountdown,
    verifyCodeFormat
  };
}
