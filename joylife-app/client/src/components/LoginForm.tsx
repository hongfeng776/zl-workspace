import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tabs, message, Alert } from 'antd';
import { LockOutlined, MobileOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import WeChatLogin from './WeChatLogin';
import AlipayLogin from './AlipayLogin';
import request from '@/api/request';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [passwordForm] = Form.useForm();
  const [codeForm] = Form.useForm();
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

  const handlePasswordLogin = async (values: { account: string; password: string }) => {
    setLoading(true);
    try {
      const res: any = await authApi.login({
        account: values.account,
        password: values.password,
        loginType: 'password',
      });
      login(res.data);
      message.success('登录成功');
      navigate('/home');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeLogin = async (values: { account: string; code: string }) => {
    setLoading(true);
    try {
      const res: any = await authApi.login({
        account: values.account,
        code: values.code,
        loginType: 'code',
      });
      login(res.data);
      message.success('登录成功');
      navigate('/home');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (phone: string) => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      message.error('请输入正确的手机号');
      return;
    }

    setCodeLoading(true);
    try {
      const res: any = await authApi.sendCode({ phone, type: 'login' });
      message.success('验证码已发送，请查看后端控制台');
      if (res.data?.code) {
        setLatestCode(res.data.code);
        codeForm.setFieldsValue({ code: res.data.code });
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

  const passwordFormItem = (
    <Form form={passwordForm} name="password_login" onFinish={handlePasswordLogin} size="large">
      <Form.Item
        name="account"
        rules={[{ required: true, message: '请输入手机号' }]}
      >
        <Input prefix={<MobileOutlined />} placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  const codeFormItem = (
    <Form form={codeForm} name="code_login" onFinish={handleCodeLogin} size="large">
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
      <Form.Item
        name="account"
        rules={[{ required: true, message: '请输入手机号' }]}
      >
        <Input prefix={<MobileOutlined />} placeholder="请输入手机号" />
      </Form.Item>
      <Form.Item
        name="code"
        rules={[{ required: true, message: '请输入验证码' }]}
      >
        <Input
          prefix={<SafetyOutlined />}
          placeholder="请输入验证码"
          suffix={
            <Button
              type="link"
              disabled={countdown > 0}
              loading={codeLoading}
              onClick={() => {
                const phone = codeForm.getFieldValue('account');
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
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>乐活生活</h1>
        <p>欢迎回来</p>
      </div>
      <Tabs
        defaultActiveKey="password"
        items={[
          { key: 'password', label: '密码登录', children: passwordFormItem },
          { key: 'code', label: '验证码登录', children: codeFormItem },
        ]}
      />
      <div className="login-footer">
        <a onClick={() => navigate('/forgot-password')}>忘记密码？</a>
        <a onClick={() => navigate('/register')}>注册账号</a>
      </div>
      <div className="third-party-login">
        <p>其他登录方式</p>
        <div className="third-party-icons">
          <WeChatLogin />
          <AlipayLogin />
        </div>
      </div>
      <style>{`
        .login-container {
          max-width: 400px;
          margin: 100px auto;
          padding: 40px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .login-header h1 {
          color: #52c41a;
          margin-bottom: 8px;
        }
        .login-header p {
          color: #888;
        }
        .login-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
        }
        .login-footer a {
          color: #1890ff;
          cursor: pointer;
        }
        .third-party-login {
          margin-top: 30px;
          text-align: center;
        }
        .third-party-login p {
          color: #999;
          margin-bottom: 16px;
        }
        .third-party-icons {
          display: flex;
          justify-content: center;
          gap: 24px;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
