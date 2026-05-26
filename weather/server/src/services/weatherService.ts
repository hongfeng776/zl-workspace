interface CurrentWeather {
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

interface HourlyForecast {
  time: string;
  temperature: number;
  weather: string;
  weatherIcon: string;
  windDirection: string;
  windSpeed: number;
  humidity: number;
}

interface DailyForecast {
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

interface AirQuality {
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

interface LifeIndex {
  type: string;
  name: string;
  level: string;
  description: string;
  icon: string;
}

interface HistoryWeather {
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
  sunny: '\u2600\uFE0F',
  cloudy: '\u26C5',
  overcast: '\u2601\uFE0F',
  lightRain: '\uD83C\uDF27\uFE0F',
  moderateRain: '\uD83C\uDF27\uFE0F',
  heavyRain: '\u26C8\uFE0F',
  thundershower: '\u26C8\uFE0F',
  lightSnow: '\uD83C\uDF28\uFE0F',
  moderateSnow: '\uD83C\uDF28\uFE0F',
  heavySnow: '\u2744\uFE0F',
  fog: '\uD83C\uDF2B\uFE0F',
  haze: '\uD83C\uDF2B\uFE0F',
  windy: '\uD83D\uDCA8',
  sand: '\uD83C\uDF2A\uFE0F',
  clear: '\uD83C\uDF19',
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
  clear: '晴',
};

const windDirections = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];

const CACHE_TTL = 5 * 60 * 1000;
const weatherCache: Record<string, { data: any; timestamp: number }> = {};

function getCachedOrGenerate(key: string, generator: () => any): any {
  const now = Date.now();
  const cached = weatherCache[key];
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  const data = generator();
  weatherCache[key] = { data, timestamp: now };
  return data;
}

export function clearCache() {
  for (const key of Object.keys(weatherCache)) {
    delete weatherCache[key];
  }
}

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

export function getCurrentWeather(city: string = '北京市', province: string = '北京市'): CurrentWeather {
  return getCachedOrGenerate(`current_${city}`, () => {
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
  });
}

export function getHourlyForecast(): HourlyForecast[] {
  return getCachedOrGenerate('hourly', () => {
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
        weatherIcon: weatherIcons[weather] || '\u2600\uFE0F',
        windDirection: getWindDirection(),
        windSpeed: Math.round(1 + Math.random() * 12),
        humidity: Math.round(40 + Math.random() * 40),
      });
    }
    return forecast;
  });
}

export function getDailyForecast(): DailyForecast[] {
  return getCachedOrGenerate('daily', () => {
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
        nightWeatherIcon: weatherIcons[nightWeather] || '\uD83C\uDF19',
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
  });
}

export function getAirQuality(): AirQuality {
  return getCachedOrGenerate('air', () => {
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
  });
}

export function getLifeIndices(): LifeIndex[] {
  return getCachedOrGenerate('life', () => {
    const indices = [
      { type: 'dressing', name: '穿衣指数', icon: '\uD83D\uDC55' },
      { type: 'cold', name: '感冒指数', icon: '\uD83E\uDD12' },
      { type: 'sports', name: '运动指数', icon: '\uD83C\uDFC3' },
      { type: 'travel', name: '旅游指数', icon: '\u2708\uFE0F' },
      { type: 'uv', name: '紫外线指数', icon: '\uD83C\uDF1E' },
      { type: 'washCar', name: '洗车指数', icon: '\uD83D\uDE97' },
      { type: 'airing', name: '晾晒指数', icon: '\uD83D\uDC56' },
      { type: 'comfort', name: '舒适度指数', icon: '\uD83D\uDE0A' },
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
  });
}

export function getHistoryWeather(startDate: string, endDate: string): HistoryWeather[] {
  return getCachedOrGenerate(`history_${startDate}_${endDate}`, () => {
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
  });
}
