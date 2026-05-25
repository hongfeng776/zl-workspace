import React, { useState } from 'react';
import { Modal, Tabs, Radio, Slider, Button, Space } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { UserLocation } from '@/types/home';
import { cities } from '@/data/mockData';

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: UserLocation) => void;
  currentRadius: number;
  onRadiusChange: (radius: number) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  currentRadius,
  onRadiusChange,
}) => {
  const [selectedCity, setSelectedCity] = useState('北京市');
  const [selectedDistrict, setSelectedDistrict] = useState('朝阳区');
  const [radius, setRadius] = useState(currentRadius);

  const cityData = cities.find((c) => c.name === selectedCity);
  const districts = cityData?.districts || [];

  const handleConfirm = () => {
    onSelectLocation({
      city: selectedCity,
      district: selectedDistrict,
      address: `${selectedCity}${selectedDistrict}`,
      lat: 39.9142,
      lng: 116.4074,
    });
    onRadiusChange(radius);
    onClose();
  };

  const handleAutoLocate = () => {
    onSelectLocation({
      city: '北京市',
      district: '朝阳区',
      address: '建国路88号（当前定位）',
      lat: 39.9142,
      lng: 116.4074,
    });
    onRadiusChange(radius);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="modal-title">
          <EnvironmentOutlined />
          <span>切换定位</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="auto" onClick={handleAutoLocate}>
          📍 自动定位
        </Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>
          确认
        </Button>,
      ]}
      width={520}
      className="location-modal"
    >
      <div className="modal-content">
        <Tabs
          defaultActiveKey="city"
          items={[
            {
              key: 'city',
              label: '选择城市',
              children: (
                <div className="city-selector">
                  <div className="section-label">选择城市</div>
                  <div className="city-grid">
                    {cities.map((city) => (
                      <div
                        key={city.name}
                        className={`city-item ${selectedCity === city.name ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCity(city.name);
                          setSelectedDistrict(city.districts[0]);
                        }}
                      >
                        {city.name}
                      </div>
                    ))}
                  </div>
                  <div className="section-label">选择区域</div>
                  <div className="district-grid">
                    {districts.map((district) => (
                      <div
                        key={district}
                        className={`district-item ${selectedDistrict === district ? 'active' : ''}`}
                        onClick={() => setSelectedDistrict(district)}
                      >
                        {district}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              key: 'radius',
              label: '搜索半径',
              children: (
                <div className="radius-selector">
                  <div className="section-label">设置搜索半径</div>
                  <div className="radius-display">
                    当前半径：<span className="radius-value">{radius} 公里</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={radius}
                    onChange={setRadius}
                    marks={{
                      1: '1km',
                      3: '3km',
                      5: '5km',
                      10: '10km',
                    }}
                  />
                  <div className="radius-presets">
                    <Space>
                      <Button
                        size="small"
                        type={radius === 1 ? 'primary' : 'default'}
                        onClick={() => setRadius(1)}
                      >
                        1公里
                      </Button>
                      <Button
                        size="small"
                        type={radius === 3 ? 'primary' : 'default'}
                        onClick={() => setRadius(3)}
                      >
                        3公里
                      </Button>
                      <Button
                        size="small"
                        type={radius === 5 ? 'primary' : 'default'}
                        onClick={() => setRadius(5)}
                      >
                        5公里
                      </Button>
                      <Button
                        size="small"
                        type={radius === 10 ? 'primary' : 'default'}
                        onClick={() => setRadius(10)}
                      >
                        10公里
                      </Button>
                    </Space>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
      <style>{`
        .modal-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
        }
        .modal-content {
          max-height: 60vh;
          overflow-y: auto;
        }
        .section-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 12px;
          margin-top: 16px;
          font-weight: 500;
        }
        .section-label:first-child {
          margin-top: 0;
        }
        .city-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .city-item {
          padding: 10px;
          text-align: center;
          border: 1px solid #e8e8e8;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        .city-item:hover {
          border-color: #52c41a;
          color: #52c41a;
        }
        .city-item.active {
          background: #52c41a;
          color: white;
          border-color: #52c41a;
        }
        .district-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .district-item {
          padding: 8px;
          text-align: center;
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
        }
        .district-item:hover {
          border-color: #52c41a;
          color: #52c41a;
        }
        .district-item.active {
          background: #f6ffed;
          color: #52c41a;
          border-color: #52c41a;
        }
        .radius-display {
          text-align: center;
          margin: 20px 0;
          font-size: 16px;
          color: #333;
        }
        .radius-value {
          color: #52c41a;
          font-size: 24px;
          font-weight: bold;
        }
        .radius-presets {
          margin-top: 16px;
          display: flex;
          justify-content: center;
        }
      `}</style>
    </Modal>
  );
};

export default LocationModal;
