import React from 'react';
import { Row, Col } from 'antd';
import { Category } from '@/types/home';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categoryType: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="category-nav">
      <div className="category-title">分类导航</div>
      <Row gutter={[8, 16]} className="category-grid">
        {categories.map((category) => (
          <Col key={category.id} xs={8} sm={8} md={4}>
            <div
              className={`category-item ${activeCategory === category.type ? 'active' : ''}`}
              onClick={() => onSelectCategory(category.type)}
            >
              <div
                className="category-icon"
                style={{ backgroundColor: activeCategory === category.type ? category.color : '#f5f5f5' }}
              >
                <span className="icon-text">{category.icon}</span>
              </div>
              <div className="category-name">{category.name}</div>
            </div>
          </Col>
        ))}
      </Row>
      <style>{`
        .category-nav {
          background: white;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .category-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }
        .category-item {
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .category-item:hover {
          transform: translateY(-2px);
        }
        .category-item.active .category-name {
          color: #52c41a;
          font-weight: 600;
        }
        .category-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          transition: all 0.2s;
        }
        .icon-text {
          font-size: 24px;
        }
        .category-name {
          font-size: 13px;
          color: #666;
          transition: color 0.2s;
        }
      `}</style>
    </div>
  );
};

export default CategoryNav;
