import React, { useState } from 'react';
import { Form, Input, Button, Tabs, message } from 'antd';
import { MobileOutlined, MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneForm] = Form.useForm();
  const [emailForm] = Form.useForm();

  const handleSendCode = async (target: string, type: 'phone' | 'email') => {
    if (type === 'phone' && !/^1[3-9]\d{9}$/.test(target)) {
      message.error('请输入正确的手机号');
      return;
    }
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      message.error('请输入正确的邮箱');
      return;
    }

    setCodeLoading(true);
    try {
      if (type === 'phone') {
        await authApi.sendCode({ phone: target, type: 'reset_password' });
      } else {
        await authApi.sendCode({ email: target, type: 'reset_password' });
      }
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
    } catch (error: any) {
      message.error(error.message || '发送失败');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleResetPassword = async (values: {
    code: string;
    newPassword: string;
    confirmPassword: string;
  }, account?: string, method?: 'phone' | 'email') => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      if (method === 'phone') {
        await authApi.resetPassword({
          phone: account,
          code: values.code,
          newPassword: values.newPassword,
        });
      } else {
        await authApi.resetPassword({
          email: account,
          code: values.code,
          newPassword: values.newPassword,
        });
      }
      message.success('密码重置成功，请重新登录');
      navigate('/login');
    } catch (error: any) {
      message.error(error.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  const phoneResetForm = (
    <Form
      form={phoneForm}
      name="phone_reset"
      onFinish={(values) => {
        const phone = phoneForm.getFieldValue('phone');
        handleResetPassword(values, phone, 'phone');
      }}
      size="large"
    >
      <Form.Item
        name="phone"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
        ]}
      >
        <Input prefix={<MobileOutlined />} placeholder="请输入注册时绑定的手机号" />
      </Form.Item>
      <Form.Item
        name="code"
        rules={[{ required: true, message: '请输入验证码' }]}
      >
        <Input
          prefix={<SafetyOutlined />}
          placeholder="请输入验证码"
          maxLength={6}
          suffix={
            <Button
              type="link"
              disabled={countdown > 0}
              loading={codeLoading}
              onClick={() => {
                const phone = phoneForm.getFieldValue('phone');
                handleSendCode(phone, 'phone');
              }}
            >
              {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
            </Button>
          }
        />
      </Form.Item>
      <Form.Item
        name="newPassword"
        rules={[
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码长度不能少于6位' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码（至少6位）" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: '请确认新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          重置密码
        </Button>
      </Form.Item>
    </Form>
  );

  const emailResetForm = (
    <Form
      form={emailForm}
      name="email_reset"
      onFinish={(values) => {
        const email = emailForm.getFieldValue('email');
        handleResetPassword(values, email, 'email');
      }}
      size="large"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱地址' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="请输入注册时绑定的邮箱" />
      </Form.Item>
      <Form.Item
        name="code"
        rules={[{ required: true, message: '请输入验证码' }]}
      >
        <Input
          prefix={<SafetyOutlined />}
          placeholder="请输入验证码"
          maxLength={6}
          suffix={
            <Button
              type="link"
              disabled={countdown > 0}
              loading={codeLoading}
              onClick={() => {
                const email = emailForm.getFieldValue('email');
                handleSendCode(email, 'email');
              }}
            >
              {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
            </Button>
          }
        />
      </Form.Item>
      <Form.Item
        name="newPassword"
        rules={[
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码长度不能少于6位' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码（至少6位）" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: '请确认新密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          重置密码
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="forgot-container">
      <div className="forgot-header">
        <h1>找回密码</h1>
        <p>选择找回方式</p>
      </div>
      <Tabs
        defaultActiveKey="phone"
        items={[
          { key: 'phone', label: '手机号找回', children: phoneResetForm },
          { key: 'email', label: '邮箱找回', children: emailResetForm },
        ]}
      />
      <div className="forgot-footer">
        想起密码了？<a onClick={() => navigate('/login')}>返回登录</a>
      </div>
      <style>{`
        .forgot-container {
          max-width: 400px;
          margin: 100px auto;
          padding: 40px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .forgot-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .forgot-header h1 {
          color: #52c41a;
          margin-bottom: 8px;
        }
        .forgot-header p {
          color: #888;
        }
        .forgot-footer {
          text-align: center;
          margin-top: 16px;
          color: #666;
        }
        .forgot-footer a {
          color: #1890ff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
