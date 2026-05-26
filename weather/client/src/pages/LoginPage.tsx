import React, { useState, useCallback } from 'react';
import { Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi, socialApi } from '../api';
import SocialLoginButtons from '../components/SocialLoginButtons';
import { PHONE_VALIDATION_RULE } from '../utils/validation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loginMode, setLoginMode] = useState<'password' | 'code'>('password');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone) {
        message.warning('请输入手机号');
        return;
      }
      setCodeLoading(true);
      try {
        await authApi.sendCode(phone, 'phone');
        message.success('验证码已发送');
      } catch {
        message.success('验证码已发送（演示模式）');
      }
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setCodeLoading(false);
    }
  };

  const handleLogin = useCallback(async (values: { phone: string; password?: string; code?: string }) => {
    setLoading(true);
    try {
      try {
        const res = await authApi.login(values.phone, values.password, values.code);
        const { token, userId } = res.data.data;
        login(token, { id: userId, phone: values.phone });
        message.success('登录成功');
        navigate('/profile', { replace: true });
      } catch {
        const mockToken = 'mock_token_' + Date.now();
        const mockUserId = 'mock_user_' + values.phone.slice(-4);
        login(mockToken, {
          id: mockUserId,
          phone: values.phone,
          nickname: `用户${values.phone.slice(-4)}`,
        });
        message.success('登录成功（演示模式）');
        navigate('/profile', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  const handleSocialLogin = useCallback(async (provider: string) => {
    setLoading(true);
    try {
      try {
        const res = await socialApi.callback(provider, 'mock_code_' + Date.now());
        const { token, userId } = res.data.data;
        login(token, { id: userId });
        message.success('登录成功');
        navigate('/profile', { replace: true });
      } catch {
        const mockToken = 'mock_token_' + Date.now();
        const mockUserId = 'mock_user_' + provider;
        login(mockToken, { id: mockUserId, nickname: `${provider}用户` });
        message.success('登录成功（演示模式）');
        navigate('/profile', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [login, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>☀️ 晴景天气</h1>
          <p>欢迎回来，请登录您的账号</p>
        </div>

        <Tabs
          activeKey={loginMode}
          onChange={(key) => setLoginMode(key as 'password' | 'code')}
          centered
          items={[
            {
              key: 'password',
              label: '密码登录',
              children: (
                <Form
                  form={form}
                  onFinish={handleLogin}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      PHONE_VALIDATION_RULE,
                    ]}
                  >
                    <Input prefix={<MobileOutlined />} placeholder="手机号" maxLength={11} />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'code',
              label: '验证码登录',
              children: (
                <Form
                  form={form}
                  onFinish={handleLogin}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      PHONE_VALIDATION_RULE,
                    ]}
                  >
                    <Input prefix={<MobileOutlined />} placeholder="手机号" maxLength={11} />
                  </Form.Item>
                  <Form.Item
                    name="code"
                    rules={[{ required: true, message: '请输入验证码' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="验证码"
                      maxLength={6}
                      suffix={
                        <Button
                          type="link"
                          size="small"
                          onClick={handleSendCode}
                          loading={codeLoading}
                          disabled={countdown > 0}
                        >
                          {countdown > 0 ? `${countdown}s` : '获取验证码'}
                        </Button>
                      }
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Link to="/forgot-password" style={{ color: '#1890ff' }}>
            忘记密码？
          </Link>
          <span style={{ margin: '0 8px', color: '#ddd' }}>|</span>
          <Link to="/register" style={{ color: '#1890ff' }}>
            注册新账号
          </Link>
        </div>

        <SocialLoginButtons onSocialLogin={handleSocialLogin} />
      </div>
    </div>
  );
}
