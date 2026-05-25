import { UserLocation } from '@/types/home';

const BEIJING_CENTER = { lat: 39.9042, lng: 116.4074 };
const SHANGHAI_CENTER = { lat: 31.2304, lng: 121.4737 };
const GUANGZHOU_CENTER = { lat: 23.1291, lng: 113.2644 };
const SHENZHEN_CENTER = { lat: 22.5431, lng: 114.0579 };
const HANGZHOU_CENTER = { lat: 30.2741, lng: 120.1551 };
const CHENGDU_CENTER = { lat: 30.5728, lng: 104.0668 };

const cityCenters: Record<string, { lat: number; lng: number }> = {
  '北京市': BEIJING_CENTER,
  '上海市': SHANGHAI_CENTER,
  '广州市': GUANGZHOU_CENTER,
  '深圳市': SHENZHEN_CENTER,
  '杭州市': HANGZHOU_CENTER,
  '成都市': CHENGDU_CENTER,
};

const beijingDistricts = [
  { name: '东城区', center: { lat: 39.9283, lng: 116.4161 } },
  { name: '西城区', center: { lat: 39.9122, lng: 116.3633 } },
  { name: '朝阳区', center: { lat: 39.9219, lng: 116.4434 } },
  { name: '海淀区', center: { lat: 39.9599, lng: 116.2980 } },
  { name: '丰台区', center: { lat: 39.8583, lng: 116.2869 } },
  { name: '石景山区', center: { lat: 39.9145, lng: 116.2231 } },
];

const shanghaiDistricts = [
  { name: '黄浦区', center: { lat: 31.2304, lng: 121.4737 } },
  { name: '徐汇区', center: { lat: 31.1885, lng: 121.4378 } },
  { name: '长宁区', center: { lat: 31.2204, lng: 121.4244 } },
  { name: '静安区', center: { lat: 31.2287, lng: 121.4482 } },
  { name: '普陀区', center: { lat: 31.2495, lng: 121.3973 } },
  { name: '浦东新区', center: { lat: 31.2304, lng: 121.5060 } },
];

const guangzhouDistricts = [
  { name: '越秀区', center: { lat: 23.1291, lng: 113.2644 } },
  { name: '天河区', center: { lat: 23.1354, lng: 113.3612 } },
  { name: '海珠区', center: { lat: 23.0833, lng: 113.3167 } },
  { name: '白云区', center: { lat: 23.1571, lng: 113.2733 } },
  { name: '番禺区', center: { lat: 22.9384, lng: 113.3848 } },
];

const shenzhenDistricts = [
  { name: '福田区', center: { lat: 22.5431, lng: 114.0579 } },
  { name: '南山区', center: { lat: 22.5333, lng: 113.9333 } },
  { name: '罗湖区', center: { lat: 22.5487, lng: 114.1306 } },
  { name: '宝安区', center: { lat: 22.5542, lng: 113.8845 } },
  { name: '龙岗区', center: { lat: 22.7209, lng: 114.2468 } },
];

const hangzhouDistricts = [
  { name: '西湖区', center: { lat: 30.2741, lng: 120.1551 } },
  { name: '滨江区', center: { lat: 30.2084, lng: 120.2117 } },
  { name: '拱墅区', center: { lat: 30.3190, lng: 120.1490 } },
  { name: '余杭区', center: { lat: 30.3908, lng: 120.2932 } },
];

const chengduDistricts = [
  { name: '锦江区', center: { lat: 30.5728, lng: 104.0668 } },
  { name: '武侯区', center: { lat: 30.6420, lng: 104.0433 } },
  { name: '青羊区', center: { lat: 30.6739, lng: 104.0613 } },
  { name: '高新区', center: { lat: 30.5428, lng: 104.0668 } },
];

const districtData: Record<string, { name: string; center: { lat: number; lng: number } }[]> = {
  '北京市': beijingDistricts,
  '上海市': shanghaiDistricts,
  '广州市': guangzhouDistricts,
  '深圳市': shenzhenDistricts,
  '杭州市': hangzhouDistricts,
  '成都市': chengduDistricts,
};

interface IPLocation {
  lat: number;
  lng: number;
  city: string;
  district: string;
}

const mockIPLocations: IPLocation[] = [
  { lat: 39.9042, lng: 116.4074, city: '北京市', district: '朝阳区' },
  { lat: 31.2304, lng: 121.4737, city: '上海市', district: '浦东新区' },
  { lat: 23.1291, lng: 113.2644, city: '广州市', district: '天河区' },
  { lat: 22.5431, lng: 114.0579, city: '深圳市', district: '南山区' },
  { lat: 30.2741, lng: 120.1551, city: '杭州市', district: '西湖区' },
  { lat: 30.5728, lng: 104.0668, city: '成都市', district: '锦江区' },
];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getNearestCity(lat: number, lng: number): { city: string; distance: number } {
  let nearestCity = '北京市';
  let minDistance = Infinity;

  for (const [city, center] of Object.entries(cityCenters)) {
    const distance = calculateDistance(lat, lng, center.lat, center.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return { city: nearestCity, distance: minDistance };
}

function getNearestDistrict(lat: number, lng: number, city: string): string {
  const districts = districtData[city];
  if (!districts || districts.length === 0) {
    return '市中心';
  }

  let nearestDistrict = districts[0].name;
  let minDistance = Infinity;

  for (const district of districts) {
    const distance = calculateDistance(lat, lng, district.center.lat, district.center.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestDistrict = district.name;
    }
  }

  return nearestDistrict;
}

async function getLocationByIP(): Promise<IPLocation> {
  return new Promise((resolve) => {
    console.log('🌐 尝试通过 IP 定位...');
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockIPLocations.length);
      const location = mockIPLocations[randomIndex];
      console.log(`🌐 IP 定位结果: ${location.city} ${location.district}`);
      resolve(location);
    }, 500);
  });
}

export async function requestLocationPermission(): Promise<boolean> {
  if (!navigator.geolocation) {
    console.warn('⚠️ 浏览器不支持 Geolocation API');
    return false;
  }

  try {
    const result = await new Promise<PermissionState>((resolve, reject) => {
      if ('permissions' in navigator) {
        navigator.permissions
          .query({ name: 'geolocation' as PermissionName })
          .then((status) => resolve(status.state))
          .catch(reject);
      } else {
        resolve('prompt');
      }
    });

    console.log(`📍 定位权限状态: ${result}`);

    if (result === 'granted') {
      return true;
    }

    if (result === 'denied') {
      console.warn('⚠️ 定位权限被拒绝');
      return false;
    }

    return true;
  } catch (error) {
    console.warn('⚠️ 检测定位权限失败:', error);
    return true;
  }
}

export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位功能'));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('定位超时'));
    }, (options?.timeout || 15000) + 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        const errorMessages: Record<number, string> = {
          1: '定位权限被拒绝',
          2: '定位信息不可用',
          3: '定位请求超时',
        };
        reject(new Error(errorMessages[error.code] || '定位失败'));
      },
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 15000,
        maximumAge: options?.maximumAge ?? 0,
      }
    );
  });
}

export async function getCurrentLocation(
  options: { enableHighAccuracy?: boolean; timeout?: number; useIPFallback?: boolean } = {}
): Promise<UserLocation> {
  const { enableHighAccuracy = true, timeout = 15000, useIPFallback = true } = options;

  const hasPermission = await requestLocationPermission();

  if (hasPermission) {
    try {
      console.log('📍 尝试浏览器定位...');
      const position = await getCurrentPosition({ enableHighAccuracy, timeout });
      const { latitude, longitude, accuracy } = position.coords;

      console.log(`📍 浏览器定位成功: 纬度 ${latitude.toFixed(6)}, 经度 ${longitude.toFixed(6)}, 精度 ${accuracy.toFixed(0)}米`);

      if (accuracy > 500) {
        console.warn('⚠️ 定位精度较低，可能不准确');
      }

      const { city, distance: cityDistance } = getNearestCity(latitude, longitude);
      const district = getNearestDistrict(latitude, longitude, city);

      console.log(`📍 位置解析: ${city} ${district}, 距 ${city}中心 ${cityDistance.toFixed(1)}km`);

      return {
        city,
        district,
        address: `当前位置 (精度${accuracy.toFixed(0)}米)`,
        lat: latitude,
        lng: longitude,
      };
    } catch (browserError: any) {
      console.warn('⚠️ 浏览器定位失败:', browserError.message);

      if (!useIPFallback) {
        throw browserError;
      }
    }
  }

  if (useIPFallback) {
    try {
      console.log('🌐 使用 IP 定位作为备选...');
      const ipLocation = await getLocationByIP();
      
      return {
        city: ipLocation.city,
        district: ipLocation.district,
        address: 'IP 定位 (近似位置)',
        lat: ipLocation.lat,
        lng: ipLocation.lng,
      };
    } catch (ipError: any) {
      console.warn('🌐 IP 定位也失败:', ipError.message);
      throw new Error('无法获取位置信息，请手动选择');
    }
  }

  throw new Error('定位失败，请手动选择位置');
}

export function calculateDistanceUtil(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return calculateDistance(lat1, lng1, lat2, lng2);
}

export { calculateDistance };
