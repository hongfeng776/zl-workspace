import { useState, useEffect } from 'react'
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
  
  const [bindPhone, setBindPhone] = useState('')
  const [bindCode, setBindCode] = useState('')
  const [bindCountdown, setBindCountdown] = useState(0)
  const [bindLoading, setBindLoading] = useState(false)
  const [bindCodeLoading, setBindCodeLoading] = useState(false)
  
  const [setPasswordPhone, setSetPasswordPhone] = useState('')
  const [setPasswordCode, setSetPasswordCode] = useState('')
  const [setPasswordCountdown, setSetPasswordCountdown] = useState(0)
  const [setPasswordCodeLoading, setSetPasswordCodeLoading] = useState(false)
  
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()
  
  useEffect(() => {
    if (user?.phone) {
      setSetPasswordPhone(user.phone)
    }
  }, [user])

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

  const handleSendBindCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(bindPhone)) {
      showToast('请输入正确的手机号', 'error')
      return
    }

    setBindCodeLoading(true)
    try {
      await authApi.sendCode(bindPhone, 'bind_phone')
      showToast('验证码发送成功')
      setBindCountdown(60)
      const timer = setInterval(() => {
        setBindCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      showToast(error.response?.data?.message || '发送失败', 'error')
    } finally {
      setBindCodeLoading(false)
    }
  }

  const handleBindPhone = async (e) => {
    e.preventDefault()
    
    if (!/^1[3-9]\d{9}$/.test(bindPhone)) {
      showToast('请输入正确的手机号', 'error')
      return
    }
    
    if (!bindCode || bindCode.length !== 6) {
      showToast('请输入6位验证码', 'error')
      return
    }

    setBindLoading(true)
    try {
      const response = await authApi.bindPhone(bindPhone, bindCode)
      setUser(response.data.user)
      showToast('手机号绑定成功')
      setBindPhone('')
      setBindCode('')
    } catch (error) {
      showToast(error.response?.data?.message || '绑定失败', 'error')
    } finally {
      setBindLoading(false)
    }
  }

  const handleSendSetPasswordCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(setPasswordPhone)) {
      showToast('请输入正确的手机号', 'error')
      return
    }

    setSetPasswordCodeLoading(true)
    try {
      await authApi.sendCode(setPasswordPhone, 'set_password')
      showToast('验证码发送成功')
      setSetPasswordCountdown(60)
      const timer = setInterval(() => {
        setSetPasswordCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      showToast(error.response?.data?.message || '发送失败', 'error')
    } finally {
      setSetPasswordCodeLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
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
      const requestData = { newPassword }
      
      if (user?.hasPassword) {
        if (!oldPassword) {
          showToast('请输入旧密码', 'error')
          setLoading(false)
          return
        }
        requestData.oldPassword = oldPassword
      } else {
        if (!setPasswordCode || setPasswordCode.length !== 6) {
          showToast('请输入6位验证码', 'error')
          setLoading(false)
          return
        }
        requestData.code = setPasswordCode
        requestData.phone = setPasswordPhone
      }
      
      await userApi.changePassword(requestData)
      showToast('密码设置成功')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSetPasswordCode('')
      
      const userInfoResponse = await authApi.getUserInfo()
      setUser(userInfoResponse.data.user)
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
                  {user?.phone ? (
                    <input
                      type="text"
                      className="form-input"
                      value={user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                      disabled
                      style={{ background: '#f5f5f5' }}
                    />
                  ) : (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ color: '#999', fontSize: '14px' }}>未绑定</span>
                      <div style={{ 
                        padding: '16px', 
                        background: '#fff8e6', 
                        borderRadius: '8px', 
                        marginTop: '8px',
                        border: '1px solid #ffe58f'
                      }}>
                        <p style={{ color: '#ad6800', fontSize: '13px', margin: '0 0 12px 0' }}>
                          为了您的账号安全，请绑定手机号
                        </p>
                        <div className="form-group" style={{ marginBottom: '12px' }}>
                          <input
                            type="tel"
                            className="form-input"
                            placeholder="请输入手机号"
                            value={bindPhone}
                            onChange={(e) => setBindPhone(e.target.value.replace(/\D/g, ''))}
                            maxLength={11}
                          />
                        </div>
                        <div className="form-group">
                          <div className="code-input-group">
                            <input
                              type="text"
                              className="form-input"
                              placeholder="请输入验证码"
                              value={bindCode}
                              onChange={(e) => setBindCode(e.target.value.replace(/\D/g, ''))}
                              maxLength={6}
                            />
                            <button
                              type="button"
                              className="code-btn"
                              onClick={handleSendBindCode}
                              disabled={bindCountdown > 0 || bindCodeLoading}
                            >
                              {bindCodeLoading ? '发送中...' : bindCountdown > 0 ? `${bindCountdown}s` : '获取验证码'}
                            </button>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-primary"
                          style={{ width: '100%' }}
                          disabled={bindLoading}
                          onClick={handleBindPhone}
                        >
                          {bindLoading ? <span className="loading"></span> : '绑定手机号'}
                        </button>
                      </div>
                    </div>
                  )}
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
                {!user?.phone ? (
                  <div style={{ 
                    padding: '16px', 
                    background: '#fff8e6', 
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    border: '1px solid #ffe58f'
                  }}>
                    <p style={{ color: '#ad6800', fontSize: '13px', margin: 0 }}>
                      请先在「个人资料」中绑定手机号，然后再设置密码
                    </p>
                  </div>
                ) : user?.hasPassword ? (
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
                ) : (
                  <>
                    <div style={{ 
                      padding: '16px', 
                      background: '#e6f7ff', 
                      borderRadius: '8px', 
                      marginBottom: '16px',
                      border: '1px solid #91d5ff'
                    }}>
                      <p style={{ color: '#0050b3', fontSize: '13px', margin: 0 }}>
                        您的账号还未设置密码，请通过手机验证码设置登录密码
                      </p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">手机号</label>
                      <input
                        type="text"
                        className="form-input"
                        value={user?.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''}
                        disabled
                        style={{ background: '#f5f5f5' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">验证码</label>
                      <div className="code-input-group">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="请输入验证码"
                          value={setPasswordCode}
                          onChange={(e) => setSetPasswordCode(e.target.value.replace(/\D/g, ''))}
                          maxLength={6}
                        />
                        <button
                          type="button"
                          className="code-btn"
                          onClick={handleSendSetPasswordCode}
                          disabled={setPasswordCountdown > 0 || setPasswordCodeLoading}
                        >
                          {setPasswordCodeLoading ? '发送中...' : setPasswordCountdown > 0 ? `${setPasswordCountdown}s` : '获取验证码'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">{user?.hasPassword ? '新密码' : '设置密码'}</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="请设置6-20位密码"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    maxLength={20}
                    disabled={!user?.phone}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">确认{user?.hasPassword ? '新' : ''}密码</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="请再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    maxLength={20}
                    disabled={!user?.phone}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !user?.phone}
                >
                  {loading ? <span className="loading"></span> : (user?.hasPassword ? '修改密码' : '设置密码')}
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
