import React from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, EnvironmentOutlined, DownOutlined } from '@ant-design/icons';
import { UserLocation } from '@/types/home';

interface LocationBarProps {
  location: UserLocation;
  onChangeLocation: () => void;
  onSearch: (keyword: string) => void;
}

const LocationBar: React.FC<LocationBarProps> = ({ location, onChangeLocation, onSearch }) => {
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch((e.target as HTMLInputElement).value);
    }
  };

  return (
    <div className="location-bar">
      <div className="location-info" onClick={onChangeLocation}>
        <EnvironmentOutlined className="location-icon" />
        <span className="location-text">
          {location.city} · {location.district}
        </span>
        <DownOutlined className="down-icon" />
      </div>
      <div className="location-search">
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索商家、商品、服务"
          className="search-input"
          allowClear
          onPressEnter={handleSearch}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Button type="primary" icon={<SearchOutlined />} className="search-btn" onClick={() => onSearch('')}>
          搜索
        </Button>
      </div>
      <style>{`
        .location-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .location-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          cursor: pointer;
          padding: 8px 12px;
          background: rgba(255,255,255,0.2);
          border-radius: 6px;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .location-info:hover {
          background: rgba(255,255,255,0.3);
        }
        .location-icon {
          font-size: 18px;
        }
        .location-text {
          font-size: 14px;
          font-weight: 500;
        }
        .down-icon {
          font-size: 10px;
        }
        .location-search {
          flex: 1;
          display: flex;
          gap: 8px;
        }
        .search-input {
          flex: 1;
        }
        .search-input :global(.ant-input) {
          background: rgba(255,255,255,0.9);
        }
        .search-btn {
          background: white;
          color: #52c41a;
          border-color: white;
        }
        .search-btn:hover {
          background: #f6ffed !important;
          color: #52c41a !important;
        }
        @media (max-width: 640px) {
          .location-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .location-info {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationBar;
