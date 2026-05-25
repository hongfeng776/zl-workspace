import { UserLocation } from '@/types/home';

interface LocationName {
  city: string;
  district: string;
  address: string;
}

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

const districtData: Record<string, { name: string; center: { lat: number; lng: number } }[]> = {
  '北京市': beijingDistricts,
  '上海市': shanghaiDistricts,
};

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

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位功能'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export async function getCurrentLocation(): Promise<UserLocation> {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude, accuracy } = position.coords;

    console.log(`📍 浏览器定位成功: 纬度 ${latitude.toFixed(6)}, 经度 ${longitude.toFixed(6)}, 精度 ${accuracy.toFixed(0)}米`);

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
  } catch (error: any) {
    console.warn('📍 定位失败:', error.message);
    throw error;
  }
}

export { calculateDistance as calculateDistanceUtil };
