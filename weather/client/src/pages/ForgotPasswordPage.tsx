import React, { useState } from 'react';
import { Form, Input, Button, message, Tabs } from 'antd';
import { MobileOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { PHONE_VALIDATION_RULE } from '../utils/validation';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resetType, setResetType] = useState<'phone' | 'email'>('phone');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSendCode = async () => {
    try {
      const target = form.getFieldValue(resetType);
      if (!target) {
        message.warning(`请输入${resetType === 'phone' ? '手机号' : '邮箱'}`);
        return;
      }
      setCodeLoading(true);
      await authApi.requestReset(target, resetType);
      message.success('验证码已发送');
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
    } catch {
      // Error handled by interceptor
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSubmit = async (values: { phone?: string; email?: string; code: string; newPassword: string }) => {
    try {
      setLoading(true);
      await authApi.resetPassword({
        target: values.phone || values.email,
        code: values.code,
        newPassword: values.newPassword,
        type: resetType,
      });
      message.success('密码重置成功');
      navigate('/login');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔐 找回密码</h1>
          <p>通过验证方式重置您的密码</p>
        </div>

        <Tabs
          activeKey={resetType}
          onChange={(key) => setResetType(key as 'phone' | 'email')}
          centered
          items={[
            {
              key: 'phone',
              label: '手机验证',
              children: (
                <Form
                  form={form}
                  onFinish={handleSubmit}
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
                    <Input prefix={<MobileOutlined />} placeholder="手机号" />
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
                    name="newPassword"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 6, message: '密码至少6位' },
                      { max: 20, message: '密码最多20位' },
                    ]}
                  >
                    <Input.Password placeholder="新密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                      重置密码
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'email',
              label: '邮箱验证',
              children: (
                <Form
                  form={form}
                  onFinish={handleSubmit}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入正确的邮箱' },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="邮箱" />
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
                    name="newPassword"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 6, message: '密码至少6位' },
                      { max: 20, message: '密码最多20位' },
                    ]}
                  >
                    <Input.Password placeholder="新密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                      重置密码
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#1890ff' }}>
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
}
