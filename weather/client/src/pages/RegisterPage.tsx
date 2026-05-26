import React, { useState, useCallback } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MobileOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api';
import { PHONE_VALIDATION_RULE } from '../utils/validation';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSendCode = useCallback(async () => {
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
  }, [form]);

  const handleRegister = useCallback(async (values: { phone: string; code: string; password: string }) => {
    setLoading(true);
    try {
      try {
        const res = await authApi.register(values.phone, values.code, values.password);
        const { token, userId } = res.data.data;
        login(token, { id: userId, phone: values.phone, nickname: `用户${values.phone.slice(-4)}` });
        message.success('注册成功');
        navigate('/profile', { replace: true });
      } catch {
        const mockToken = 'mock_token_' + Date.now();
        const mockUserId = 'mock_user_' + values.phone.slice(-4);
        login(mockToken, {
          id: mockUserId,
          phone: values.phone,
          nickname: `用户${values.phone.slice(-4)}`,
        });
        message.success('注册成功（演示模式）');
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
          <p>创建新账号，开启天气之旅</p>
        </div>

        <Form
          form={form}
          onFinish={handleRegister}
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
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
              { max: 20, message: '密码最多20位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="设置密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          已有账号？
          <Link to="/login" style={{ color: '#1890ff' }}>
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}
