import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi, userApi } from '../utils/api'
import { useToast } from '../components/Toast'

const DeleteAccount = () => {
  const { user, logout } = useAuthStore()
  const [code, setCode] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()

  const handleSendCode = async () => {
    if (!user?.phone) {
      showToast('未绑定手机号', 'error')
      return
    }

    setCodeLoading(true)
    try {
      await authApi.sendCode(user.phone, 'delete_account')
      showToast('验证码发送成功')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
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
      setCodeLoading(false)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    
    if (!confirmed) {
      showToast('请确认已了解注销后果', 'error')
      return
    }
    
    if (!code) {
      showToast('请输入验证码', 'error')
      return
    }

    setLoading(true)
    try {
      await userApi.deleteAccount(code)
      logout()
      showToast('账号已注销')
      navigate('/login')
    } catch (error) {
      showToast(error.response?.data?.message || '注销失败', 'error')
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
          maxWidth: '500px',
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
          
          <Link to="/profile" className="link" style={{ fontSize: '14px' }}>
            返回设置
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            color: 'white',
            marginBottom: '24px',
            textAlign: 'center'
          }}>注销账号</h1>

          <div className="card">
            <div style={{ 
              background: '#fff3cd', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px'
            }}>
              <h4 style={{ 
                color: '#856404', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠️</span>
                重要提示
              </h4>
              <ul style={{ 
                color: '#856404', 
                fontSize: '14px',
                paddingLeft: '20px',
                lineHeight: '2'
              }}>
                <li>账号注销后，您的所有数据将被永久删除</li>
                <li>注销后无法恢复，请谨慎操作</li>
                <li>您的聊天记录、个人资料将全部清除</li>
                <li>注销后该手机号可以重新注册</li>
              </ul>
            </div>

            <form onSubmit={handleDelete}>
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
                <label className="form-label">验证码</label>
                <div className="code-input-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="请输入验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                  />
                  <button
                    type="button"
                    className="code-btn"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || codeLoading}
                  >
                    {codeLoading ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>

              <div style={{ 
                marginBottom: '24px',
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333',
                  lineHeight: '1.5'
                }}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  我已了解并确认注销账号的后果，自愿申请注销账号
                </label>
              </div>

              <button 
                type="submit" 
                className="btn"
                disabled={loading || !confirmed}
                style={{ 
                  background: '#ff4757',
                  color: 'white'
                }}
              >
                {loading ? <span className="loading"></span> : '确认注销'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DeleteAccount
