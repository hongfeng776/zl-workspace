import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import request from '@/api/request';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm();
  const [latestCode, setLatestCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestCode = async () => {
      try {
        const res: any = await request.get('/auth/latest-code');
        if (res.data?.code) {
          setLatestCode(res.data.code);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchLatestCode();
    const interval = setInterval(fetchLatestCode, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendCode = async (phone: string) => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      message.error('请输入正确的手机号');
      return;
    }

    setCodeLoading(true);
    try {
      const res: any = await authApi.sendCode({ phone, type: 'register' });
      message.success('验证码已发送，请查看后端控制台');
      if (res.data?.code) {
        setLatestCode(res.data.code);
        form.setFieldsValue({ code: res.data.code });
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
    } catch (error: any) {
      message.error(error.message || '发送失败');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleRegister = async (values: {
    nickname: string;
    phone: string;
    password: string;
    confirmPassword: string;
    email?: string;
    code: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const res: any = await authApi.register({
        nickname: values.nickname,
        phone: values.phone,
        password: values.password,
        email: values.email,
        code: values.code,
      });
      login(res.data);
      message.success('注册成功');
      navigate('/home');
    } catch (error: any) {
      message.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-header">
        <h1>乐活生活</h1>
        <p>创建新账号</p>
      </div>
      {latestCode && (
        <Alert
          message={`最新验证码: ${latestCode}`}
          description="该验证码仅用于测试，生产环境请通过短信/邮件获取"
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      <Form form={form} name="register" onFinish={handleRegister} size="large">
        <Form.Item
          name="nickname"
          rules={[{ required: true, message: '请输入昵称' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="请输入昵称" maxLength={20} />
        </Form.Item>
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input prefix={<MobileOutlined />} placeholder="请输入手机号" maxLength={11} />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度不能少于6位' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请输入密码（至少6位）" />
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
          <Input.Password prefix={<LockOutlined />} placeholder="请确认密码" />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            { type: 'email', message: '请输入正确的邮箱地址' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="请输入邮箱（选填）" />
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
                  const phone = form.getFieldValue('phone');
                  handleSendCode(phone);
                }}
              >
                {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
              </Button>
            }
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            注册
          </Button>
        </Form.Item>
      </Form>
      <div className="register-footer">
        已有账号？<a onClick={() => navigate('/login')}>立即登录</a>
      </div>
      <style>{`
        .register-container {
          max-width: 400px;
          margin: 50px auto;
          padding: 40px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .register-header h1 {
          color: #52c41a;
          margin-bottom: 8px;
        }
        .register-header p {
          color: #888;
        }
        .register-footer {
          text-align: center;
          margin-top: 16px;
          color: #666;
        }
        .register-footer a {
          color: #1890ff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default RegisterForm;
