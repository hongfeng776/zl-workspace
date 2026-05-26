import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Avatar,
  Dropdown,
  MenuProps,
  Modal,
  message,
  Spin,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  CameraOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useAuth } from '../contexts/AuthContext';
import { userApi, socialApi } from '../api';
import { WeChatIcon, QQIcon, WeiboIcon } from '../components/SocialIcons';

interface SocialAccount {
  id: string;
  provider: string;
  nickname?: string;
  avatar?: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  phone?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  birthday?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [avatarMenuVisible, setAvatarMenuVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProfile();
    fetchSocialAccounts();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userApi.getProfile();
      const profileData = res.data.data as UserProfile;
      setProfile(profileData);
      form.setFieldsValue({
        nickname: profileData.nickname || '',
        birthday: profileData.birthday ? dayjs(profileData.birthday) : null,
        gender: profileData.gender || undefined,
      });
    } catch {
      const mockProfile: UserProfile = {
        id: user?.id || 'mock_user',
        nickname: user?.nickname || '晴景用户',
        avatar: user?.avatar,
        phone: '138****8888',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(mockProfile);
      form.setFieldsValue({
        nickname: mockProfile.nickname,
        birthday: mockProfile.birthday ? dayjs(mockProfile.birthday) : null,
        gender: mockProfile.gender,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialAccounts = async () => {
    try {
      const res = await socialApi.getAccounts();
      setSocialAccounts(res.data.data || []);
    } catch {
      setSocialAccounts([]);
    }
  };

  const handleSave = async (values: { nickname: string; birthday: Dayjs | null; gender?: string }) => {
    try {
      setSaving(true);
      try {
        const res = await userApi.updateProfile({
          nickname: values.nickname,
          birthday: values.birthday ? values.birthday.toISOString() : undefined,
          gender: values.gender,
        });
        const updated = res.data.data;
        setProfile((prev) => prev ? { ...prev, ...updated } : prev);
        updateUser(updated);
        message.success('资料更新成功');
      } catch {
        const updated = {
          nickname: values.nickname,
          birthday: values.birthday?.toISOString(),
          gender: values.gender,
          updatedAt: new Date().toISOString(),
        };
        setProfile((prev) => prev ? { ...prev, ...updated } : null);
        updateUser(updated);
        message.success('资料更新成功（演示模式）');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      message.error('图片大小不能超过5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const avatarUrl = event.target?.result as string;
      try {
        const res = await userApi.updateProfile({ avatar: avatarUrl });
        const updated = res.data.data;
        setProfile((prev) => prev ? { ...prev, ...updated } : prev);
        updateUser(updated);
        message.success('头像更新成功');
      } catch {
        const updated = {
          avatar: avatarUrl,
          updatedAt: new Date().toISOString(),
        };
        setProfile((prev) => prev ? { ...prev, ...updated } : null);
        updateUser(updated);
        message.success('头像更新成功（演示模式）');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    logout();
    message.success('已退出登录');
    setLogoutModalVisible(false);
    navigate('/login');
  };

  const handleBind = async (provider: string) => {
    try {
      try {
        await socialApi.bind(provider, {
          providerId: `mock_${provider}_${Date.now()}`,
        });
        message.success('绑定成功');
        fetchSocialAccounts();
      } catch {
        const mockAccount: SocialAccount = {
          id: `mock_${provider}_id`,
          provider,
          nickname: `${provider}用户`,
          createdAt: new Date().toISOString(),
        };
        setSocialAccounts((prev) => [...prev, mockAccount]);
        message.success('绑定成功（演示模式）');
      }
    } catch {
      message.error('绑定失败，请重试');
    }
  };

  const handleUnbind = async (provider: string) => {
    Modal.confirm({
      title: '确认解绑',
      content: '确定要解除该社交账号的绑定吗？',
      okText: '确认解绑',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          try {
            await socialApi.unbind(provider);
            message.success('解绑成功');
            fetchSocialAccounts();
          } catch {
            setSocialAccounts((prev) => prev.filter((a) => a.provider !== provider));
            message.success('解绑成功（演示模式）');
          }
        } catch {
          message.error('解绑失败，请重试');
        }
      },
    });
  };

  const providerConfig = {
    wechat: { name: '微信', icon: <WeChatIcon />, color: '#07c160' },
    qq: { name: 'QQ', icon: <QQIcon />, color: '#12b7f5' },
    weibo: { name: '微博', icon: <WeiboIcon />, color: '#e6162d' },
  };

  const avatarMenuItems: MenuProps['items'] = [
    {
      key: 'change',
      icon: <CameraOutlined />,
      label: '更换头像',
      onClick: handleAvatarClick,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <Dropdown
            menu={{ items: avatarMenuItems }}
            trigger={['click']}
            open={avatarMenuVisible}
            onOpenChange={setAvatarMenuVisible}
          >
            <div
              className="avatar-large"
              onClick={(e) => e.preventDefault()}
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt="avatar" />
              ) : (
                profile?.nickname?.[0]?.toUpperCase() || 'U'
              )}
            </div>
          </Dropdown>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <div className="user-info">
            <h2>{profile?.nickname || '未设置昵称'}</h2>
            <p>
              {profile?.phone || profile?.email || '未绑定联系方式'}
            </p>
          </div>
        </div>

        <div className="profile-content">
          <div className="section-title">个人资料</div>
          <Form
            form={form}
            onFinish={handleSave}
            layout="vertical"
            style={{ marginBottom: 32 }}
          >
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[
                { required: true, message: '请输入昵称' },
                { min: 2, message: '昵称至少2个字符' },
                { max: 20, message: '昵称最多20个字符' },
              ]}
            >
              <Input placeholder="请输入昵称" maxLength={20} />
            </Form.Item>
            <Form.Item name="birthday" label="生日">
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择生日"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
            <Form.Item name="gender" label="性别">
              <Select
                placeholder="选择性别"
                allowClear
                options={[
                  { value: 'male', label: '男' },
                  { value: 'female', label: '女' },
                  { value: 'other', label: '其他' },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存修改
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="section-title">账号绑定</div>
          <div className="binding-list">
            {(['wechat', 'qq', 'weibo'] as const).map((provider) => {
              const config = providerConfig[provider];
              const bound = socialAccounts.find((a) => a.provider === provider);
              return (
                <div key={provider} className="binding-item">
                  <div className="binding-info">