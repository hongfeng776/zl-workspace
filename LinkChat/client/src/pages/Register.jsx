import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/Toast'

const Register = () => {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [receivedCode, setReceivedCode] = useState('')
  
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { showToast, ToastComponent } = useToast()

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast('请输入正确的手机号', 'error')
      return
    }

    setCodeLoading(true)
    setReceivedCode('')
    try {
      const response = await authApi.sendCode(phone, 'register')
      if (response.data.code) {
        setReceivedCode(response.data.code)
        showToast(`验证码已发送：${response.data.code}`, 'success')
      } else {
        showToast('验证码发送成功，请注意查收短信')
      }
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
      const response = await authApi.register({
        phone,
        code,
        password
      })
      
      login(response.data.user, response.data.token)
      showToast('注册成功')
      navigate('/')
    } catch (error) {
      showToast(error.response?.data?.message || '注册失败', 'error')
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
            fontSize: '32px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>注册账号</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>加入乐聊，开启快乐聊天</p>
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
            {receivedCode && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px 12px', 
                background: '#e6f7ff', 
                borderRadius: '6px',
                border: '1px solid #91d5ff',
                fontSize: '12px',
                color: '#0050b3'
              }}>
                开发环境验证码：<strong>{receivedCode}</strong>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">设置密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请设置6-20位密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label className="form-label">确认密码</label>
            <input
              type="password"
              className="form-input"
              placeholder="请再次输入密码"
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
            {loading ? <span className="loading"></span> : '注册'}
          </button>
        </form>

        <div className="text-center">
          <span style={{ color: '#666', fontSize: '14px' }}>已有账号？</span>
          <Link to="/login" className="link" style={{ marginLeft: '4px' }}>立即登录</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
