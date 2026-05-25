import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Button, Select, Empty, Spin, message } from 'antd';
import { FilterOutlined, ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import LocationBar from '@/components/home/LocationBar';
import CategoryNav from '@/components/home/CategoryNav';
import MerchantCard from '@/components/home/MerchantCard';
import LocationModal from '@/components/home/LocationModal';
import HotBanner from '@/components/home/HotBanner';
import { UserLocation } from '@/types/home';
import { categories, mockMerchants, hotContents, defaultLocation } from '@/data/mockData';
import { getCurrentLocation } from '@/utils/geolocation';

const { Option } = Select;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.userInfo);

  const [location, setLocation] = useState<UserLocation>(defaultLocation);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [radius, setRadius] = useState(3);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price' | 'default'>('default');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const initLocation = async () => {
      setLocating(true);
      try {
        const currentLocation = await getCurrentLocation({
          enableHighAccuracy: true,
          timeout: 15000,
          useIPFallback: true,
        });
        setLocation(currentLocation);
        if (currentLocation.address.includes('IP 定位')) {
          message.info(`已通过 IP 定位到 ${currentLocation.city} ${currentLocation.district}，可点击切换`);
        } else {
          message.success('定位成功');
        }
      } catch (error: any) {
        console.warn('📍 定位失败:', error.message);
        message.warning({
          content: '自动定位失败，已使用默认位置，可点击定位图标手动选择',
          duration: 5,
        });
      } finally {
        setLocating(false);
      }
    };

    const timer = setTimeout(() => {
      setLoading(false);
      initLocation();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAutoLocate = async () => {
    setLocating(true);
    message.loading({ content: '正在获取位置...', key: 'locating', duration: 0 });
    try {
      const currentLocation = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        useIPFallback: true,
      });
      setLocation(currentLocation);
      if (currentLocation.address.includes('IP 定位')) {
        message.success({ 
          content: `已通过 IP 定位到 ${currentLocation.city} ${currentLocation.district}`, 
          key: 'locating' 
        });
      } else {
        message.success({ content: '定位成功', key: 'locating' });
      }
    } catch (error: any) {
      console.warn('📍 手动定位失败:', error.message);
      message.error({ 
        content: '定位失败，请手动选择位置', 
        key: 'locating' 
      });
    } finally {
      setLocating(false);
    }
  };

  const filteredMerchants = useMemo(() => {
    let result = [...mockMerchants];

    if (activeCategory !== 'all') {
      result = result.filter((m) => m.categoryType === activeCategory);
    }

    result = result.filter((m) => m.distance <= radius);

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(lowerKeyword) ||
          m.category.toLowerCase().includes(lowerKeyword) ||
          m.tags.some((t) => t.toLowerCase().includes(lowerKeyword))
      );
    }

    switch (sortBy) {
      case 'distance':
        result.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        result.sort((a, b) => a.avgPrice - b.avgPrice);
        break;
      default:
        result.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
    }

    return result;
  }, [activeCategory, radius, sortBy, keyword]);

  const handleSearch = (value: string) => {
    setKeyword(value);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoLogin = () => {
    navigate('/login');
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">乐活生活</span>
          </div>
          <div className="header-right">
            {user ? (
              <div className="user-info">
                <span className="welcome-text">你好，{user.nickname}</span>
                <Button type="link" onClick={handleLogout}>
                  退出登录
                </Button>
              </div>
            ) : (
              <Button type="primary" size="small" onClick={handleGoLogin}>
                登录/注册
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="home-content">
        <div className="location-wrapper">
          <LocationBar
            location={location}
            onChangeLocation={() => setLocationModalVisible(true)}
            onSearch={handleSearch}
          />
          {locating && (
            <div className="locating-tip">
              <Spin size="small" />
              <span>正在获取位置...</span>
            </div>
          )}
        </div>

        <HotBanner contents={hotContents} />

        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <div className="filter-bar">
          <div className="filter-left">
            <Button
              type={activeCategory === 'all' ? 'primary' : 'default'}
              size="small"
              onClick={() => setActiveCategory('all')}
            >
              全部
            </Button>
            <Select
              value={sortBy}
              size="small"
              onChange={setSortBy}
              className="sort-select"
            >
              <Option value="default">综合排序</Option>
              <Option value="distance">距离最近</Option>
              <Option value="rating">评分最高</Option>
              <Option value="price">价格最低</Option>
            </Select>
          </div>
          <div className="filter-right">
            <span className="radius-info">
              <FilterOutlined /> {radius}km内
            </span>
            <Button
              type="text"
              size="small"
              icon={<EnvironmentOutlined />}
              onClick={handleAutoLocate}
              loading={locating}
            >
              重新定位
            </Button>
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              刷新
            </Button>
          </div>
        </div>

        <div className="merchants-section">
          <div className="section-header">
            <h2 className="section-title">
              {activeCategory === 'all' ? '推荐商家' : `${categories.find((c) => c.type === activeCategory)?.name || ''}`}
            </h2>
            <span className="result-count">
              共找到 {filteredMerchants.length} 家
            </span>
          </div>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" tip="加载中..." />
            </div>
          ) : filteredMerchants.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredMerchants.map((merchant) => (
                <Col key={merchant.id} xs={24} sm={12} md={8} lg={8}>
                  <MerchantCard merchant={merchant} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="暂无符合条件的商家"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => setRadius(10)}>
                扩大搜索范围
              </Button>
            </Empty>
          )}
        </div>
      </div>

      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelectLocation={setLocation}
        currentRadius={radius}
        onRadiusChange={setRadius}
      />

      <style>{`
        .home-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f6ffed 0%, #f0f5f0 200px, #f5f5f5 400px);
        }
        .home-header {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .logo-icon {
          font-size: 24px;
        }
        .logo-text {
          font-size: 20px;
          font-weight: 600;
          color: #52c41a;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .welcome-text {
          color: #666;
          font-size: 14px;
        }
        .home-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
        }
        .location-wrapper {
          position: relative;
        }
        .locating-tip {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255,255,255,0.95);
          padding: 8px 16px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
          z-index: 10;
        }
        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .filter-left {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .sort-select {
          min-width: 120px;
        }
        .filter-right {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .radius-info {
          color: #666;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .merchants-section {
          background: white;
          border-radius: 8px;
          padding: 16px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .section-title {
          margin: 0;
          font-size: 18px;
          color: #333;
        }
        .result-count {
          color: #999;
          font-size: 13px;
        }
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 0;
        }
        @media (max-width: 640px) {
          .welcome-text {
            display: none;
          }
          .filter-bar {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          .filter-right {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
