import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../utils/api'
import { useToast } from '../components/Toast'

const ForgotPassword = () => {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast('请输入正确的手机号', 'error')
      return
    }

    setCodeLoading(true)
    try {
      await authApi.sendCode(phone, 'reset_password')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast('请输入正确的手机号', 'error')
      return
    }
    
    if (!code) {
      showToast('请输入验证码', 'error')
      return
    }
    
    if (!password || password.length < 6) {
      showToast('密码长度不能少于6位', 'error')
      return
    }
    
    if (password !== confirmPassword) {
      showToast('两次输入的密码不一致', 'error')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword({
        phone,
        code,
        password
      })
      
      showToast('密码重置成功')
      navigate('/login')
    } catch (error) {
      showToast(error.response?.data?.message || '重置失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {ToastComponent}
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            color: '#333',
            marginBottom: '8px'
          }}>重置密码</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>请输入手机号和验证码</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">手机号</label>
            <input
              type="tel"
              className="form-input"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={11}
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

          <div className="form-group">
            <label className="form-label">新密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请设置6-20位新密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            style={{ marginBottom: '16px' }}
          >
            {loading ? <span className="loading"></span> : '重置密码'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="link" style={{ fontSize: '14px' }}>
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
