import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Spin,
  Modal,
  DatePicker,
  Tag,
  Card,
  Empty,
  message,
} from 'antd';
import {
  EnvironmentOutlined,
  ReloadOutlined,
  RiseOutlined,
  SetOutlined,
  DropletOutlined,
  WindOutlined,
  EyeOutlined,
  GaugeOutlined,
  SunOutlined,
  UserOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import {
  weatherApi,
  CurrentWeather,
  HourlyForecast,
  DailyForecast,
  AirQuality,
  LifeIndex,
  HistoryWeather,
} from '../api';
import { useAuth } from '../contexts/AuthContext';

const { RangePicker } = DatePicker;

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality | null>(null);
  const [lifeIndices, setLifeIndices] = useState<LifeIndex[]>([]);
  const [airModalVisible, setAirModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryWeather[]>([]);
  const [historyDateRange, setHistoryDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly'>('daily');

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      const [current, hourly, daily, air, life] = await Promise.all([
        weatherApi.getCurrentWeather(),
        weatherApi.getHourlyForecast(),
        weatherApi.getDailyForecast(),
        weatherApi.getAirQuality(),
        weatherApi.getLifeIndices(),
      ]);
      setCurrentWeather(current);
      setHourlyForecast(hourly);
      setDailyForecast(daily);
      setAirQuality(air);
      setLifeIndices(life);
    } catch (error) {
      message.error('获取天气数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const [current, hourly, daily, air, life] = await Promise.all([
        weatherApi.getCurrentWeather(),
        weatherApi.getHourlyForecast(),
        weatherApi.getDailyForecast(),
        weatherApi.getAirQuality(),
        weatherApi.getLifeIndices(),
      ]);
      setCurrentWeather(current);
      setHourlyForecast(hourly);
      setDailyForecast(daily);
      setAirQuality(air);
      setLifeIndices(life);
      message.success('刷新成功');
    } catch (error) {
      message.error('刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchHistoryWeather = async (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) {
      message.warning('请选择日期范围');
      return;
    }
    const startDate = dates[0].format('YYYY-MM-DD');
    const endDate = dates[1].format('YYYY-MM-DD');
    
    if (dates[1].isBefore(dates[0])) {
      message.warning('结束日期不能早于开始日期');
      return;
    }

    const daysDiff = dates[1].diff(dates[0], 'day');
    if (daysDiff > 365) {
      message.warning('查询范围不能超过365天');
      return;
    }

    try {
      setHistoryLoading(true);
      const data = await weatherApi.getHistoryWeather(startDate, endDate);
      setHistoryData(data);
    } catch (error) {
      message.error('获取历史天气数据失败');
    } finally {
      setHistoryLoading(false);
    }
  };

  const openAirModal = () => {
    setAirModalVisible(true);
  };

  const openHistoryModal = () => {
    setHistoryModalVisible(true);
    if (!historyDateRange) {
      const end = dayjs().subtract(1, 'day');
      const start = dayjs().subtract(7, 'day');
      setHistoryDateRange([start, end]);
      fetchHistoryWeather([start, end]);
    }
  };

  const getAqiLevelColor = (aqi: number) => {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#99004c';
    return '#7e0023';
  };

  const getAqiLevelText = (aqi: number) => {
    if (aqi <= 50) return '优';
    if (aqi <= 100) return '良';
    if (aqi <= 150) return '轻度污染';
    if (aqi <= 200) return '中度污染';
    if (aqi <= 300) return '重度污染';
    return '严重污染';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Spin size="large" tip="加载天气数据中..." style={{ color: '#fff' }} />
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <div className="location-info">
            <EnvironmentOutlined className="location-icon" />
            <span className="location-text">
              {currentWeather?.province} {currentWeather?.city}
            </span>
          </div>
          <div className="header-actions">
            <Button
              type="text"
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={handleRefresh}
              className="action-btn"
            />
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => navigate('/profile')}
              className="action-btn"
            />
          </div>
        </div>

        <div className="current-weather-card">
          <div className="weather-main">
            <div className="weather-icon-large">{currentWeather?.weatherIcon}</div>
            <div className="temperature-info">
              <span className="current-temp">{currentWeather?.temperature}°</span>
              <span className="weather-desc">{currentWeather?.weather}</span>
              <span className="feels-like">体感 {currentWeather?.feelsLike}°</span>
            </div>
          </div>

          <div className="temp-range">
            <span className="high-temp">
              {dailyForecast[0]?.highTemp}°
            </span>
            <span className="temp-separator">/</span>
            <span className="low-temp">
              {dailyForecast[0]?.lowTemp}°
            </span>
          </div>

          <div className="weather-details-grid">
            <div className="detail-item">
              <WindOutlined className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">风力风向</span>
                <span className="detail-value">{currentWeather?.windDirection} {currentWeather?.windLevel}</span>
              </div>
            </div>
            <div className="detail-item">
              <DropletOutlined className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">湿度</span>
                <span className="detail-value">{currentWeather?.humidity}%</span>
              </div>
            </div>
            <div className="detail-item">
              <GaugeOutlined className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">气压</span>
                <span className="detail-value">{currentWeather?.pressure} hPa</span>
              </div>
            </div>
            <div className="detail-item">
              <EyeOutlined className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">能见度</span>
                <span className="detail-value">{currentWeather?.visibility} km</span>
              </div>
            </div>
            <div className="detail-item">
              <SunOutlined className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">紫外线</span>
                <span className="detail-value">强度 {currentWeather?.uvIndex}</span>
              </div>
            </div>
            <div className="detail-item">
              <WindOutlined className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">风速</span>
                <span className="detail-value">{currentWeather?.windSpeed} m/s</span>
              </div>
            </div>
          </div>

          <div className="sunrise-sunset">
            <div className="sun-item">
              <RiseOutlined className="sun-icon" />
              <span className="sun-label">日出</span>
              <span className="sun-time">{currentWeather?.sunrise}</span>
            </div>
            <div className="sun-item">
              <SetOutlined className="sun-icon" />
              <span className="sun-label">日落</span>
              <span className="sun-time">{currentWeather?.sunset}</span>
            </div>
          </div>

          <div className="update-time">
            更新时间: {currentWeather?.updateTime}
          </div>
        </div>

        <div className="forecast-section">
          <div className="section-tabs">
            <div
              className={`tab-item ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              15天预报
            </div>
            <div
              className={`tab-item ${activeTab === 'hourly' ? 'active' : ''}`}
              onClick={() => setActiveTab('hourly')}
            >
              24小时预报
            </div>
          </div>

          {activeTab === 'daily' ? (
            <div className="daily-forecast-scroll">
              <div className="daily-forecast-container">
                {dailyForecast.map((day, index) => (
                  <div key={index} className="daily-forecast-item">
                    <div className="day-name">{day.dayOfWeek}</div>
                    <div className="day-date">{day.date.slice(5)}</div>
                    <div className="day-weather-icon">{day.dayWeatherIcon}</div>
                    <div className="day-weather">{day.dayWeather}</div>
                    <div className="day-temp-range">
                      <span className="day-high">{day.highTemp}°</span>
                      <span className="day-temp-bar">
                        <span
                          className="day-temp-fill"
                          style={{
                            left: `${((day.lowTemp + 20) / 60) * 100}%`,
                            right: `${100 - ((day.highTemp + 20) / 60) * 100}%`,
                          }}
                        />
                      </span>
                      <span className="day-low">{day.lowTemp}°</span>
                    </div>
                    <div className="day-wind">
                      <WindOutlined /> {day.dayWindDirection} {day.dayWindSpeed}级
                    </div>
                    <div className="day-precipitation">
                      <DropletOutlined /> {day.precipitation}mm
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="hourly-forecast-scroll">
              <div className="hourly-forecast-container">
                {hourlyForecast.map((hour, index) => (
                  <div key={index} className="hourly-forecast-item">
                    <div className="hour-time">{hour.time}</div>
                    <div className="hour-weather-icon">{hour.weatherIcon}</div>
                    <div className="hour-temp">{hour.temperature}°</div>
                    <div className="hour-weather">{hour.weather}</div>
                    <div className="hour-wind">
                      <WindOutlined /> {hour.windDirection}
                    </div>
                    <div className="hour-humidity">
                      <DropletOutlined /> {hour.humidity}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="air-quality-card" onClick={openAirModal}>
          <div className="air-quality-header">
            <BarChartOutlined className="section-icon" />
            <span className="section-title">空气质量</span>
            <span className="click-hint">点击查看详情 <InfoCircleOutlined /></span>
          </div>
          <div className="air-quality-content">
            <div className="aqi-display">
              <div
                className="aqi-value"
                style={{ color: airQuality?.aqiColor }}
              >
                {airQuality?.aqi}
              </div>
              <div
                className="aqi-level"
                style={{
                  background: airQuality?.aqiColor,
                  color: airQuality && airQuality.aqi <= 100 ? '#333' : '#fff',
                }}
              >
                {airQuality?.aqiLevel}
              </div>
            </div>
            <div className="air-pollutants-quick">
              <div className="pollutant-quick-item">
                <span className="pollutant-name">PM2.5</span>
                <span className="pollutant-value">{airQuality?.pm25} μg/m³</span>
              </div>
              <div className="pollutant-quick-item">
                <span className="pollutant-name">PM10</span>
                <span className="pollutant-value">{airQuality?.pm10} μg/m³</span>
              </div>
              <div className="pollutant-quick-item">
                <TrophyOutlined className="rank-icon" />
                <span className="rank-text">全国排名 {airQuality?.nationalRank}/{airQuality?.totalCities}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="life-index-section">
          <div className="section-header">
            <InfoCircleOutlined className="section-icon" />
            <span className="section-title">生活指数</span>
          </div>
          <div className="life-index-grid">
            {lifeIndices.map((index, i) => (
              <div key={i} className="life-index-card">
                <div className="life-index-icon">{index.icon}</div>
                <div className="life-index-name">{index.name}</div>
                <div className="life-index-level">{index.level}</div>
                <div className="life-index-desc">{index.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="history-section">
          <div className="section-header" onClick={openHistoryModal}>
            <CalendarOutlined className="section-icon" />
            <span className="section-title">历史天气查询</span>
            <span className="click-hint">点击查询 <ArrowLeftOutlined rotate={180} /></span>
          </div>
          <div className="history-preview">
            <p>支持按日期查询历史天气数据</p>
            <p>展示具体温度范围和天气情况</p>
          </div>
        </div>
      </div>

      <Modal
        title="空气质量详情"
        open={airModalVisible}
        onCancel={() => setAirModalVisible(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        {airQuality && (
          <div className="air-quality-detail">
            <div className="aqi-detail-header">
              <div
                className="aqi-detail-value"
                style={{ color: airQuality.aqiColor }}
              >
                {airQuality.aqi}
              </div>
              <div
                className="aqi-detail-level"
                style={{
                  background: airQuality.aqiColor,
                  color: airQuality.aqi <= 100 ? '#333' : '#fff',
                }}
              >
                {airQuality.aqiLevel}
              </div>
            </div>

            <div className="aqi-rank-info">
              <TrophyOutlined className="rank-icon" />
              <span>
                全国排名 <strong>{airQuality.nationalRank}</strong> / {airQuality.totalCities}
              </span>
            </div>

            <div className="pollutants-grid">
              <div className="pollutant-item">
                <span className="pollutant-label">PM2.5</span>
                <span className="pollutant-data">{airQuality.pm25} μg/m³</span>
              </div>
              <div className="pollutant-item">
                <span className="pollutant-label">PM10</span>
                <span className="pollutant-data">{airQuality.pm10} μg/m³</span>
              </div>
              <div className="pollutant-item">
                <span className="pollutant-label">SO₂</span>
                <span className="pollutant-data">{airQuality.so2} μg/m³</span>
              </div>
              <div className="pollutant-item">
                <span className="pollutant-label">NO₂</span>
                <span className="pollutant-data">{airQuality.no2} μg/m³</span>
              </div>
              <div className="pollutant-item">
                <span className="pollutant-label">CO</span>
                <span className="pollutant-data">{airQuality.co} mg/m³</span>
              </div>
              <div className="pollutant-item">
                <span className="pollutant-label">O₃</span>
                <span className="pollutant-data">{airQuality.o3} μg/m³</span>
              </div>
            </div>

            {airQuality.primaryPollutant !== '无' && (
              <div className="primary-pollutant">
                <span className="pollutant-label">首要污染物</span>
                <Tag color="orange">{airQuality.primaryPollutant}</Tag>
              </div>
            )}

            <div className="health-advice">
              <div className="advice-title">健康建议</div>
              <p>{airQuality.healthAdvice}</p>
            </div>

            <div className="aqi-legend">
              <div className="legend-title">AQI等级说明</div>
              <div className="legend-items">
                <div className="legend-item"><span className="legend-color" style={{ background: '#00e400' }} /> 0-50 优</div>
                <div className="legend-item"><span className="legend-color" style={{ background: '#ffff00' }} /> 51-100 良</div>
                <div className="legend-item"><span className="legend-color" style={{ background: '#ff7e00' }} /> 101-150 轻度</div>
                <div className="legend-item"><span className="legend-color" style={{ background: '#ff0000' }} /> 151-200 中度</div>
                <div className="legend-item"><span className="legend-color" style={{ background: '#99004c' }} /> 201-300 重度</div>
                <div className="legend-item"><span className="legend-color" style={{ background: '#7e0023' }} /> >300 严重</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="历史天气查询"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div className="history-weather-container">
          <div className="history-date-picker">
            <RangePicker
              value={historyDateRange}
              onChange={(dates) => {
                setHistoryDateRange(dates as [Dayjs | null, Dayjs | null]);
                fetchHistoryWeather(dates as [Dayjs | null, Dayjs | null]);
              }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
              style={{ width: '100%' }}
            />
            <Button
              type="primary"
              onClick={() => fetchHistoryWeather(historyDateRange)}
              loading={historyLoading}
              style={{ marginTop: 12 }}
            >
              查询
            </Button>
          </div>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" tip="查询中..." />
            </div>
          ) : historyData.length > 0 ? (
            <div className="history-list">
              {historyData.map((item, index) => (
                <Card key={index} className="history-item-card" size="small">
                  <div className="history-item-header">
                    <span className="history-date">{item.date}</span>
                    <span className="history-weather-icon">{item.weatherIcon}</span>
                    <span className="history-weather">{item.weather}</span>
                  </div>
                  <div className="history-temp-range">
                    <span className="history-high">{item.highTemp}°C</span>
                    <span className="history-temp-separator"> ~ </span>
                    <span className="history-low">{item.lowTemp}°C</span>
                  </div>
                  <div className="history-details">
                    <span><WindOutlined /> {item.windDirection} {item.windSpeed}级</span>
                    <span><DropletOutlined /> 湿度 {item.humidity}%</span>
                    <span><DropletOutlined /> 降水 {item.precipitation}mm</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="暂无历史数据" style={{ padding: 40 }} />
          )}
        </div>
      </Modal>
    </div>
  );
}
