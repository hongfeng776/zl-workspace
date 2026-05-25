import React from 'react';
import { Carousel } from 'antd';
import { HotContent } from '@/types/home';

interface HotBannerProps {
  contents: HotContent[];
}

const HotBanner: React.FC<HotBannerProps> = ({ contents }) => {
  return (
    <div className="hot-banner">
      <Carousel autoplay effect="fade" dots={{ className: 'carousel-dots' }}>
        {contents.map((content) => (
          <div key={content.id} className="banner-item">
            <div className="banner-image-wrapper">
              <img
                src={content.image}
                alt={content.title}
                className="banner-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/800x300/52c41a/ffffff?text=${encodeURIComponent(content.title)}`;
                }}
              />
              <div className="banner-overlay">
                <div className="banner-content">
                  <div className="banner-type">
                    {content.type === 'activity' && '🎉 活动'}
                    {content.type === 'discount' && '💰 优惠'}
                    {content.type === 'article' && '📖 推荐'}
                  </div>
                  <h3 className="banner-title">{content.title}</h3>
                  <p className="banner-description">{content.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
      <style>{`
        .hot-banner {
          margin-bottom: 16px;
          border-radius: 8px;
          overflow: hidden;
        }
        .banner-item {
          height: 200px;
        }
        .banner-image-wrapper {
          position: relative;
          height: 100%;
          overflow: hidden;
        }
        .banner-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .banner-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          padding: 40px 20px 20px;
        }
        .banner-content {
          color: white;
        }
        .banner-type {
          display: inline-block;
          padding: 2px 8px;
          background: #52c41a;
          border-radius: 4px;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .banner-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: white;
        }
        .banner-description {
          font-size: 14px;
          margin: 0;
          opacity: 0.9;
        }
        .carousel-dots li button {
          background: rgba(255,255,255,0.5);
        }
        .carousel-dots li.slick-active button {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default HotBanner;
