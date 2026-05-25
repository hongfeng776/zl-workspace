import React, { useState } from 'react';
import { message, Modal } from 'antd';
import { AlipayCircleOutlined } from '@ant-design/icons';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const AlipayLogin: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const handleAlipayLogin = async () => {
    setLoading(true);
    try {
      const mockCode = `alipay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      Modal.info({
        title: '支付宝登录',
        content: (
          <div>
            <p>模拟支付宝授权登录</p>
            <p style={{ color: '#999', fontSize: '12px' }}>
              实际项目中需要跳转到支付宝授权页面，获取授权码后回调
            </p>
          </div>
        ),
        onOk: async () => {
          try {
            const res: any = await authApi.thirdPartyLogin({
              provider: 'alipay',
              code: mockCode,
            });
            login(res.data);
            message.success('支付宝登录成功');
            navigate('/home');
          } catch (error: any) {
            message.error(error.message || '登录失败');
          }
        },
      });
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="third-party-icon alipay"
      onClick={!loading ? handleAlipayLogin : undefined}
    >
      <AlipayCircleOutlined style={{ fontSize: 28, color: '#1677FF' }} />
      <span>支付宝</span>
      <style>{`
        .third-party-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          padding: 10px;
          border-radius: 8px;
          transition: background 0.3s;
        }
        .third-party-icon:hover {
          background: #f5f5f5;
        }
        .third-party-icon span {
          margin-top: 4px;
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default AlipayLogin;
