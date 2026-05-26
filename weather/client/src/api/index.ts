import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

let tokenSource = { current: null as string | null };

export function setAuthToken(token: string | null) {
  tokenSource.current = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getAuthToken(): string | null {
  return tokenSource.current || localStorage.getItem('token');
}

export function clearAuthToken() {
  tokenSource.current = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

interface ApiError extends Error {
  isNetworkError?: boolean;
  skipGlobalHandler?: boolean;
}

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token?.startsWith('mock_') && config.skipGlobalHandler) {
      return Promise.reject({
        isMockMode: true,
        message: '演示模式，跳过真实请求',
        config,
      });
    }

    if (token && !token.startsWith('mock_')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config as InternalAxiosRequestConfig;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 0 && res.code !== undefined) {
      const err: ApiError = new Error(res.message || '请求失败');
      err.name = 'ApiError';
      if (!response.config.skipGlobalHandler) {
        message.error(res.message || '请求失败');
      }
      return Promise.reject(err);
    }
    return response;
  },
  (error: AxiosError & { isMockMode?: boolean }) => {
    if (error.isMockMode) {
      return Promise.reject(error);
    }

    const err: ApiError = new Error();
    err.name = 'NetworkError';
    err.isNetworkError = true;

    const currentToken = getAuthToken();
    const isMockToken = currentToken?.startsWith('mock_');

    if (error.response?.status === 401 && !isMockToken) {
      clearAuthToken();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      if (!error.config?.skipGlobalHandler) {
        message.warning('登录已过期，请重新登录');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
      return Promise.reject(err);
    }

    if (error.response?.status === 401 && isMockToken) {
      return Promise.reject({
        ...err,
        isMockMode: true,
        message: '演示模式，无需认证',
      });
    }

    if (!error.config?.skipGlobalHandler) {
      const errorMsg = (error.response?.data as any)?.message || '网络错误，请检查网络连接';
      message.error(errorMsg);
    }

    return Promise.reject(err);
  }
);

declare module 'axios' {
  interface AxiosRequestConfig {
    skipGlobalHandler?: boolean;
  }
}

export const authApi = {
  sendCode: (target: string, type: 'phone' | 'email') =>
    api.post('/auth/send-code', { target, type }, { skipGlobalHandler: true }),

  register: (phone: string, code: string, password: string) =>
    api.post('/auth/register', { phone, code, password }, { skipGlobalHandler: true }),

  login: (phone: string, password?: string, code?: string) =>
    api.post('/auth/login', { phone, password, code }, { skipGlobalHandler: true }),

  requestReset: (target: string, type: 'phone' | 'email') =>
    api.post('/auth/request-reset', { target, type }, { skipGlobalHandler: true }),

  resetPassword: (data: {
    target?: string;
    code?: string;
    token?: string;
    newPassword: string;
    type?: 'phone' | 'email';
  }) => api.post('/auth/reset-password', data, { skipGlobalHandler: true }),
};

export const userApi = {
  getProfile: () => api.get('/user/profile', { skipGlobalHandler: true }),
  updateProfile: (data: {
    nickname?: string;
    avatar?: string;
    birthday?: string;
    gender?: string;
  }) => api.put('/user/profile', data, { skipGlobalHandler: true }),
};

export const socialApi = {
  getAuthUrl: (provider: string) =>
    api.get(`/social/${provider}/url`),

  callback: (provider: string, code: string) =>
    api.get(`/social/${provider}/callback`, { params: { code } }, { skipGlobalHandler: true }),

  getAccounts: () => api.get('/social/accounts', { skipGlobalHandler: true }),

  bind: (provider: string, data: {
    providerId: string;
    nickname?: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
  }) => api.post(`/social/${provider}/bind`, data, { skipGlobalHandler: true }),

  unbind: (provider: string) =>
    api.delete(`/social/${provider}/unbind`, { skipGlobalHandler: true }),
};

export interface CurrentWeather {
  city: string;
  province: string;
  temperature: number;
  feelsLike: number;
  weather: string;
  weatherIcon: string;
  humidity: number;
  windDirection: string;
  windSpeed: number;
  windLevel: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  updateTime: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weather: string;
  weatherIcon: string;
  windDirection: string;
  windSpeed: number;
  humidity: number;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  dayWeather: string;
  nightWeather: string;
  dayWeatherIcon: string;
  nightWeatherIcon: string;
  highTemp: number;
  lowTemp: number;
  dayWindDirection: string;
  nightWindDirection: string;
  dayWindSpeed: number;
  nightWindSpeed: number;
  precipitation: number;
  humidity: number;
  sunrise: string;
  sunset: string;
}

export interface AirQuality {
  aqi: number;
  aqiLevel: string;
  aqiColor: string;
  pm25: number;
  pm10: number;
  so2: number;
  no2: number;
  co: number;
  o3: number;
  nationalRank: number;
  totalCities: number;
  primaryPollutant: string;
  healthAdvice: string;
}

export interface LifeIndex {
  type: string;
  name: string;
  level: string;
  description: string;
  icon: string;
}

export interface HistoryWeather {
  date: string;
  highTemp: number;
  lowTemp: number;
  weather: string;
  weatherIcon: string;
  windDirection: string;
  windSpeed: number;
  humidity: number;
  precipitation: number;
}

const weatherIcons: Record<string, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  overcast: '☁️',
  lightRain: '🌧️',
  moderateRain: '🌧️',
  heavyRain: '⛈️',
  thundershower: '⛈️',
  lightSnow: '🌨️',
  moderateSnow: '🌨️',
  heavySnow: '❄️',
  fog: '🌫️',
  haze: '🌫️',
  windy: '💨',
  sand: '🌪️',
};

const weatherNames: Record<string, string> = {
  sunny: '晴',
  cloudy: '多云',
  overcast: '阴',
  lightRain: '小雨',
  moderateRain: '中雨',
  heavyRain: '大雨',
  thundershower: '雷阵雨',
  lightSnow: '小雪',
  moderateSnow: '中雪',
  heavySnow: '大雪',
  fog: '雾',
  haze: '霾',
  windy: '大风',
  sand: '沙尘暴',
};

const windDirections = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];

function getRandomWeather(): string {
  const weathers = ['sunny', 'cloudy', 'overcast', 'lightRain', 'moderateRain', 'lightSnow', 'fog', 'haze'];
  return weathers[Math.floor(Math.random() * weathers.length)];
}

function getWindDirection(): string {
  return windDirections[Math.floor(Math.random() * windDirections.length)];
}

function getWindLevel(speed: number): string {
  if (speed < 1) return '0级';
  if (speed < 6) return '1级';
  if (speed < 12) return '2级';
  if (speed < 20) return '3级';
  if (speed < 29) return '4级';
  if (speed < 39) return '5级';
  if (speed < 50) return '6级';
  if (speed < 62) return '7级';
  return '8级以上';
}

function getAqiLevel(aqi: number): { level: string; color: string } {
  if (aqi <= 50) return { level: '优', color: '#00e400' };
  if (aqi <= 100) return { level: '良', color: '#ffff00' };
  if (aqi <= 150) return { level: '轻度污染', color: '#ff7e00' };
  if (aqi <= 200) return { level: '中度污染', color: '#ff0000' };
  if (aqi <= 300) return { level: '重度污染', color: '#99004c' };
  return { level: '严重污染', color: '#7e0023' };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayOfWeek(date: Date): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getDay()];
}

export function generateMockCurrentWeather(city: string = '北京市', province: string = '北京市'): CurrentWeather {
  const now = new Date();
  const baseTemp = 15 + Math.random() * 20;
  const weather = getRandomWeather();
  
  return {
    city,
    province,
    temperature: Math.round(baseTemp),
    feelsLike: Math.round(baseTemp + (Math.random() - 0.5) * 5),
    weather: weatherNames[weather],
    weatherIcon: weatherIcons[weather],
    humidity: Math.round(30 + Math.random() * 50),
    windDirection: getWindDirection(),
    windSpeed: Math.round(2 + Math.random() * 15),
    windLevel: getWindLevel(2 + Math.random() * 15),
    pressure: Math.round(1000 + Math.random() * 30),
    visibility: Math.round(5 + Math.random() * 20),
    uvIndex: Math.round(Math.random() * 11),
    sunrise: '05:30',
    sunset: '19:15',
    updateTime: now.toLocaleString('zh-CN'),
  };
}

export function generateMockHourlyForecast(): HourlyForecast[] {
  const forecast: HourlyForecast[] = [];
  const now = new Date();
  const baseTemp = 15 + Math.random() * 10;

  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hourVariation = Math.sin(((time.getHours() - 6) / 24) * Math.PI * 2) * 8;
    const weather = i >= 6 && i <= 18 ? getRandomWeather() : (Math.random() > 0.7 ? 'cloudy' : 'clear');
    
    forecast.push({
      time: `${String(time.getHours()).padStart(2, '0')}:00`,
      temperature: Math.round(baseTemp + hourVariation + (Math.random() - 0.5) * 2),
      weather: weatherNames[weather] || '晴',
      weatherIcon: weatherIcons[weather] || '☀️',
      windDirection: getWindDirection(),
      windSpeed: Math.round(1 + Math.random() * 12),
      humidity: Math.round(40 + Math.random() * 40),
    });
  }
  return forecast;
}

export function generateMockDailyForecast(): DailyForecast[] {
  const forecast: DailyForecast[] = [];
  const now = new Date();
  const baseTemp = 15 + Math.random() * 10;

  for (let i = 0; i < 15; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dayVariation = Math.sin((i / 15) * Math.PI) * 5;
    const dayWeather = getRandomWeather();
    const nightWeather = Math.random() > 0.5 ? dayWeather : 'clear';

    forecast.push({
      date: formatDate(date),
      dayOfWeek: i === 0 ? '今天' : i === 1 ? '明天' : getDayOfWeek(date),
      dayWeather: weatherNames[dayWeather],
      nightWeather: weatherNames[nightWeather] || '晴',
      dayWeatherIcon: weatherIcons[dayWeather],
      nightWeatherIcon: weatherIcons[nightWeather] || '🌙',
      highTemp: Math.round(baseTemp + dayVariation + 5 + Math.random() * 3),
      lowTemp: Math.round(baseTemp + dayVariation - 5 + Math.random() * 3),
      dayWindDirection: getWindDirection(),
      nightWindDirection: getWindDirection(),
      dayWindSpeed: Math.round(2 + Math.random() * 10),
      nightWindSpeed: Math.round(1 + Math.random() * 8),
      precipitation: Math.round(Math.random() * 100 * 10) / 10,
      humidity: Math.round(40 + Math.random() * 40),
      sunrise: '05:30',
      sunset: '19:15',
    });
  }
  return forecast;
}

export function generateMockAirQuality(): AirQuality {
  const aqi = Math.round(20 + Math.random() * 180);
  const aqiInfo = getAqiLevel(aqi);
  
  return {
    aqi,
    aqiLevel: aqiInfo.level,
    aqiColor: aqiInfo.color,
    pm25: Math.round(10 + Math.random() * 150),
    pm10: Math.round(20 + Math.random() * 200),
    so2: Math.round(5 + Math.random() * 50),
    no2: Math.round(10 + Math.random() * 80),
    co: Math.round((0.5 + Math.random() * 2) * 10) / 10,
    o3: Math.round(30 + Math.random() * 120),
    nationalRank: Math.round(1 + Math.random() * 300),
    totalCities: 337,
    primaryPollutant: aqi > 100 ? (Math.random() > 0.5 ? 'PM2.5' : '臭氧') : '无',
    healthAdvice: aqi <= 50 
      ? '空气质量令人满意，基本无空气污染' 
      : aqi <= 100 
        ? '空气质量可接受，极少数异常敏感人群应减少户外活动'
        : aqi <= 150
          ? '敏感人群症状会有轻度加剧，健康人群出现刺激症状'
          : aqi <= 200
            ? '进一步加剧易感人群症状，可能对健康人群心脏、呼吸系统有影响'
            : '心脏病和肺病患者症状显著加剧，运动耐受力降低，健康人群普遍出现症状',
  };
}

export function generateMockLifeIndices(): LifeIndex[] {
  const indices = [
    { type: 'dressing', name: '穿衣指数', icon: '👕' },
    { type: 'cold', name: '感冒指数', icon: '🤒' },
    { type: 'sports', name: '运动指数', icon: '🏃' },
    { type: 'travel', name: '旅游指数', icon: '✈️' },
    { type: 'uv', name: '紫外线指数', icon: '🌞' },
    { type: 'washCar', name: '洗车指数', icon: '🚗' },
    { type: 'airing', name: '晾晒指数', icon: '👖' },
    { type: 'comfort', name: '舒适度指数', icon: '😊' },
  ];

  const levels = ['适宜', '较适宜', '一般', '较不宜', '不宜'];
  const descriptions: Record<string, string[]> = {
    dressing: ['天气较热，建议穿着轻薄透气的衣物', '温度适中，建议穿着单层衬衫或薄外套', '天气较冷，建议穿着厚外套或毛衣'],
    cold: ['感冒发生几率低，注意保持良好的生活习惯', '感冒发生几率较高，注意防护', '感冒发生几率高，尽量避免去人群密集的场所'],
    sports: ['天气较好，适宜进行户外运动', '可以进行适当的户外运动，注意补充水分', '天气条件一般，建议减少户外运动'],
    travel: ['天气较好，适宜出行游玩', '适合旅游，注意携带防晒用品', '天气条件一般，出行请做好防护准备'],
    uv: ['紫外线很强，外出需涂抹高倍数防晒霜，戴遮阳帽', '紫外线较强，外出需涂抹防晒霜，避免长时间暴晒', '紫外线较弱，适当防晒即可'],
    washCar: ['天气较好，适宜洗车', '较适宜洗车，未来天气条件不错', '可能有降水，不太适宜洗车'],
    airing: ['天气较好，适宜晾晒衣物', '可以晾晒，注意观察天气变化', '空气湿度较大，不太适宜晾晒'],
    comfort: ['温度湿度适宜，体感舒适', '天气条件不错，体感较舒适', '天气条件一般，体感可能不太舒适'],
  };

  return indices.map(index => {
    const levelIndex = Math.floor(Math.random() * 3);
    return {
      ...index,
      level: levels[levelIndex],
      description: descriptions[index.type][levelIndex],
    };
  });
}

export function generateMockHistoryWeather(startDate: string, endDate: string): HistoryWeather[] {
  const history: HistoryWeather[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const baseTemp = 15 + Math.random() * 10;

  const current = new Date(start);
  let dayOffset = 0;
  while (current <= end) {
    const dayVariation = Math.sin((dayOffset / 30) * Math.PI * 2) * 5;
    const weather = getRandomWeather();

    history.push({
      date: formatDate(current),
      highTemp: Math.round(baseTemp + dayVariation + 5 + Math.random() * 3),
      lowTemp: Math.round(baseTemp + dayVariation - 5 + Math.random() * 3),
      weather: weatherNames[weather],
      weatherIcon: weatherIcons[weather],
      windDirection: getWindDirection(),
      windSpeed: Math.round(2 + Math.random() * 10),
      humidity: Math.round(40 + Math.random() * 40),
      precipitation: Math.round(Math.random() * 50 * 10) / 10,
    });

    current.setDate(current.getDate() + 1);
    dayOffset++;
  }
  return history;
}

export const weatherApi = {
  getCurrentWeather: async (city?: string) => {
    try {
      const res = await api.get('/weather/current', { params: { city }, skipGlobalHandler: true });
      return res.data.data as CurrentWeather;
    } catch {
      return generateMockCurrentWeather();
    }
  },

  getHourlyForecast: async (city?: string) => {
    try {
      const res = await api.get('/weather/hourly', { params: { city }, skipGlobalHandler: true });
      return res.data.data as HourlyForecast[];
    } catch {
      return generateMockHourlyForecast();
    }
  },

  getDailyForecast: async (city?: string) => {
    try {
      const res = await api.get('/weather/daily', { params: { city }, skipGlobalHandler: true });
      return res.data.data as DailyForecast[];
    } catch {
      return generateMockDailyForecast();
    }
  },

  getAirQuality: async (city?: string) => {
    try {
      const res = await api.get('/weather/air', { params: { city }, skipGlobalHandler: true });
      return res.data.data as AirQuality;
    } catch {
      return generateMockAirQuality();
    }
  },

  getLifeIndices: async (city?: string) => {
    try {
      const res = await api.get('/weather/life', { params: { city }, skipGlobalHandler: true });
      return res.data.data as LifeIndex[];
    } catch {
      return generateMockLifeIndices();
    }
  },

  getHistoryWeather: async (startDate: string, endDate: string, city?: string) => {
    try {
      const res = await api.get('/weather/history', { params: { startDate, endDate, city }, skipGlobalHandler: true });
      return res.data.data as HistoryWeather[];
    } catch {
      return generateMockHistoryWeather(startDate, endDate);
    }
  },
};

export default api;
