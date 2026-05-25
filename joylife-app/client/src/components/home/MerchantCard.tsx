import React from 'react';
import { Card, Rate, Tag } from 'antd';
import { StarFilled, EnvironmentOutlined } from '@ant-design/icons';
import { Merchant } from '@/types/home';

interface MerchantCardProps {
  merchant: Merchant;
}

const priceLevelText = (level: number) => '¥'.repeat(level);

const MerchantCard: React.FC<MerchantCardProps> = ({ merchant }) => {
  return (
    <Card
      hoverable
      className="merchant-card"
      cover={
        <div className="merchant-image-wrapper">
          <img
            alt={merchant.name}
            src={merchant.image}
            className="merchant-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/400x200/f6ffed/52c41a?text=${encodeURIComponent(merchant.name)}`;
            }}
          />
          {merchant.isHot && (
            <div className="hot-badge">🔥 热门</div>
          )}
          {merchant.promotion && (
            <div className="promotion-badge">🎁 {merchant.promotion}</div>
          )}
        </div>
      }
    >
      <Card.Meta
        title={
          <div className="merchant-title">
            <span className="merchant-name">{merchant.name}</span>
            {!merchant.isOpen && <Tag color="default">休息中</Tag>}
          </div>
        }
        description={
          <div className="merchant-info">
            <div className="merchant-meta">
              <span className="category-tag">{merchant.category}</span>
              <div className="rating-info">
                <Rate disabled allowHalf defaultValue={merchant.rating} className="rating-stars" />
                <span className="rating-text">{merchant.rating}</span>
                <span className="review-count">({merchant.reviewCount})</span>
              </div>
            </div>
            <div className="merchant-location">
              <EnvironmentOutlined />
              <span className="distance">{merchant.distance < 1 ? `${Math.round(merchant.distance * 1000)}m` : `${merchant.distance.toFixed(1)}km`}</span>
              <span className="address">· {merchant.address}</span>
            </div>
            <div className="merchant-tags">
              <span className="price-level">{priceLevelText(merchant.priceLevel)}</span>
              <span className="avg-price">人均 ¥{merchant.avgPrice}</span>
            </div>
            <div className="tag-list">
              {merchant.tags.slice(0, 3).map((tag, index) => (
                <Tag key={index} color="green" className="tag-item">
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        }
      />
      <style>{`
        .merchant-card {
          margin-bottom: 16px;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .merchant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        .merchant-image-wrapper {
          position: relative;
          height: 180px;
          overflow: hidden;
        }
        .merchant-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .merchant-card:hover .merchant-image {
          transform: scale(1.05);
        }
        .hot-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .promotion-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          background: rgba(82, 196, 26, 0.9);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .merchant-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .merchant-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .merchant-info {
          margin-top: 8px;
        }
        .merchant-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .category-tag {
          color: #666;
          font-size: 13px;
        }
        .rating-info {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rating-stars {
          font-size: 12px;
        }
        .rating-text {
          color: #fa8c16;
          font-weight: 600;
          font-size: 14px;
        }
        .review-count {
          color: #999;
          font-size: 12px;
        }
        .merchant-location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .distance {
          color: #52c41a;
          font-weight: 500;
        }
        .address {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .merchant-tags {
          display: flex;
          gap: 12px;
          margin-bottom: 8px;
        }
        .price-level {
          color: #ff4d4f;
          font-weight: 500;
        }
        .avg-price {
          color: #666;
        }
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .tag-item {
          margin: 0;
        }
      `}</style>
    </Card>
  );
};

export default MerchantCard;
