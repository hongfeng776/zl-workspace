import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { userApi, authApi } from '../utils/api'
import { useToast } from '../components/Toast'

const Profile = () => {
  const { user, setUser, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!nickname.trim()) {
      showToast('请输入昵称', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await userApi.updateProfile({ nickname })
      setUser(response.data.user)
      showToast('个人信息更新成功')
    } catch (error) {
      showToast(error.response?.data?.message || '更新失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (!oldPassword) {
      showToast('请输入旧密码', 'error')
      return
    }
    
    if (!newPassword || newPassword.length < 6) {
      showToast('新密码长度不能少于6位', 'error')
      return
    }
    
    if (newPassword !== confirmPassword) {
      showToast('两次输入的新密码不一致', 'error')
      return
    }

    setLoading(true)
    try {
      await userApi.changePassword(oldPassword, newPassword)
      showToast('密码修改成功')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      showToast(error.response?.data?.message || '修改失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {ToastComponent}
      
      <header style={{
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}>乐聊</Link>
          
          <Link to="/" className="link" style={{ fontSize: '14px' }}>
            返回首页
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
            textAlign: 'center'
          }}>账号设置</h1>

          <div style={{ 
            display: 'flex', 
            marginBottom: '24px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                background: activeTab === 'profile' ? 'white' : 'transparent',
                color: activeTab === 'profile' ? '#333' : 'white',
                cursor: 'pointer',
                fontWeight: activeTab === 'profile' ? '600' : '400',
                transition: 'all 0.3s ease'
              }}
            >
              个人资料
            </button>
            <button
              onClick={() => setActiveTab('password')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                background: activeTab === 'password' ? 'white' : 'transparent',
                color: activeTab === 'password' ? '#333' : 'white',
                cursor: 'pointer',
                fontWeight: activeTab === 'password' ? '600' : '400',
                transition: 'all 0.3s ease'
              }}
            >
              修改密码
            </button>
          </div>

          <div className="card">
            {activeTab === 'profile' ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">手机号</label>
                  <input
                    type="text"
                    className="form-input"
                    value={user?.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定'}
                    disabled
                    style={{ background: '#f5f5f5' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">昵称</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="请输入昵称"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">安全验证</label>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '14px 16px',
                    background: '#f5f5f5',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: user?.securityVerified ? '#2ed573' : '#999' }}>
                      {user?.securityVerified ? '已设置' : '未设置'}
                    </span>
                    <Link to="/security-verify" className="link" style={{ fontSize: '14px' }}>
                      {user?.securityVerified ? '查看' : '去设置'}
                    </Link>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <span className="loading"></span> : '保存修改'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">旧密码</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="请输入旧密码"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">新密码</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="请设置6-20位新密码"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    maxLength={20}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">确认新密码</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="请再次输入新密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    maxLength={20}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <span className="loading"></span> : '修改密码'}
                </button>
              </form>
            )}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link 
              to="/delete-account" 
              style={{ 
                color: '#ff4757', 
                fontSize: '14px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              注销账号
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
