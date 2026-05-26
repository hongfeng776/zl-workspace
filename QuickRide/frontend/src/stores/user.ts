import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/utils/api';

interface UserInfo {
  id: number;
  phone: string;
  nickname: string;
  avatar?: string;
  verified: boolean;
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const userInfo = ref<UserInfo | null>(null);
  const trips = ref<any[]>([]);

  const isLoggedIn = computed(() => !!token.value);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  function setTrips(tripList: any[]) {
    trips.value = tripList;
  }

  function logout() {
    token.value = null;
    userInfo.value = null;
    trips.value = [];
    localStorage.removeItem('token');
  }

  async function fetchUserInfo() {
    try {
      const res = await api.get('/auth/profile');
      setUserInfo(res.data.user);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }

  return {
    token,
    userInfo,
    trips,
    isLoggedIn,
    setToken,
    setUserInfo,
    setTrips,
    logout,
    fetchUserInfo
  };
});
