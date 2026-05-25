import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, message, Modal } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  WechatOutlined,
  AlipayCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useAuthStore((state) => state.userInfo);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      onOk: async () => {
        try {
          await authApi.logout();
        } catch (e) {
          // ignore
        }
        logout();
        message.success('已退出登录');
        navigate('/login');
      },
    });
  };

  const handleBindWechat = () => {
    const mockCode = `bind_wx_${Date.now()}`;
    Modal.info({
      title: '绑定微信',
      content: '模拟绑定微信账号',
      onOk: async () => {
        try {
          await authApi.bindThirdParty({ provider: 'wechat', code: mockCode });
          message.success('绑定成功');
        } catch (error: any) {
          message.error(error.message || '绑定失败');
        }
      },
    });
  };

  const handleBindAlipay = () => {
    const mockCode = `bind_alipay_${Date.now()}`;
    Modal.info({
      title: '绑定支付宝',
      content: '模拟绑定支付宝账号',
      onOk: async () => {
        try {
          await authApi.bindThirdParty({ provider: 'alipay', code: mockCode });
          message.success('绑定成功');
        } catch (error: any) {
          message.error(error.message || '绑定失败');
        }
      },
    });
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>乐活生活</h1>
      </div>
      <div className="home-content">
        <Card title="个人信息" className="profile-card">
          <div className="avatar">
            <UserOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          </div>
          <h2>{userInfo?.nickname}</h2>
          <p className="phone">手机号：{userInfo?.phone}</p>
          {userInfo?.email && <p className="email">邮箱：{userInfo.email}</p>}
        </Card>

        <Card title="账号绑定" className="bind-card">
          <div className="bind-item">
            <div className="bind-info">
              <WechatOutlined style={{ fontSize: 24, color: '#07C160' }} />
              <span>微信</span>
            </div>
            {userInfo?.wechatOpenId ? (
              <span className="bound">已绑定</span>
            ) : (
              <Button type="link" onClick={handleBindWechat}>
                绑定
              </Button>
            )}
          </div>
          <div className="bind-item">
            <div className="bind-info">
              <AlipayCircleOutlined style={{ fontSize: 24, color: '#1677FF' }} />
              <span>支付宝</span>
            </div>
            {userInfo?.alipayUserId ? (
              <span className="bound">已绑定</span>
            ) : (
              <Button type="link" onClick={handleBindAlipay}>
                绑定
              </Button>
            )}
          </div>
        </Card>

        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
          size="large"
        >
          退出登录
        </Button>
      </div>
      <style>{`
        .home-container {
          min-height: 100vh;
          background: #f5f5f5;
        }
        .home-header {
          background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
          padding: 60px 20px 40px;
          text-align: center;
        }
        .home-header h1 {
          color: white;
          font-size: 32px;
          margin: 0;
        }
        .home-content {
          max-width: 500px;
          margin: -20px auto 0;
          padding: 20px;
        }
        .profile-card {
          text-align: center;
          margin-bottom: 20px;
        }
        .profile-card .avatar {
          width: 80px;
          height: 80px;
          background: #f6ffed;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .profile-card h2 {
          margin: 0 0 8px;
        }
        .profile-card .phone,
        .profile-card .email {
          color: #666;
          margin: 4px 0;
        }
        .bind-card .bind-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .bind-card .bind-item:last-child {
          border-bottom: none;
        }
        .bind-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bound {
          color: #52c41a;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default Home;
