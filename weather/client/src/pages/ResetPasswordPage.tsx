import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      message.error('无效的重置链接');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleSubmit = async (values: { newPassword: string }) => {
    if (!token) return;
    try {
      setLoading(true);
      await authApi.resetPassword({
        token,
        newPassword: values.newPassword,
      });
      message.success('密码重置成功，请重新登录');
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
          <h1>🔐 重置密码</h1>
          <p>请设置您的新密码</p>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
              { max: 20, message: '密码最多20位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
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
            <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              确认重置
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
