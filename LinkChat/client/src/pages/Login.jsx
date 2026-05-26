import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/Toast'

const Login = () => {
  const [loginType, setLoginType] = useState('password')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeLoading, setCodeLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { showToast, ToastComponent } = useToast()

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast('请输入正确的手机号', 'error')
      return
    }

    setCodeLoading(true)
    try {
      await authApi.sendCode(phone, 'login')
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

    setLoading(true)
    try {
      let response
      if (loginType === 'password') {
        if (!password) {
          showToast('请输入密码', 'error')
          return
        }
        response = await authApi.login(phone, password)
      } else {
        if (!code) {
          showToast('请输入验证码', 'error')
          return
        }
        response = await authApi.loginCode(phone, code)
      }
      
      login(response.data.user, response.data.token)
      showToast('登录成功')
      navigate('/')
    } catch (error) {
      showToast(error.response?.data?.message || '登录失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleThirdPartyLogin = async (platform) => {
    const mockOpenId = `${platform}_${Date.now()}`
    try {
      const response = await authApi.thirdPartyLogin({
        platform,
        openId: mockOpenId,
        nickname: `${platform === 'wechat' ? '微信' : 'QQ'}用户`,
        avatar: ''
      })
      login(response.data.user, response.data.token)
      
      if (!response.data.user.phone) {
        showToast('登录成功，请先绑定手机号', 'info')
        navigate('/profile')
      } else {
        showToast('登录成功')
        navigate('/')
      }
    } catch (error) {
      showToast(error.response?.data?.message || '登录失败', 'error')
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
          }}>乐聊</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>快乐聊天，快乐生活</p>
        </div>

        <div style={{ 
          display: 'flex', 
          marginBottom: '24px',
          background: '#f5f5f5',
          borderRadius: '8px',
          padding: '4px'
        }}>
          <button
            onClick={() => setLoginType('password')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              background: loginType === 'password' ? 'white' : 'transparent',
              cursor: 'pointer',
              fontWeight: loginType === 'password' ? '600' : '400',
              boxShadow: loginType === 'password' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            密码登录
          </button>
          <button
            onClick={() => setLoginType('code')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              background: loginType === 'code' ? 'white' : 'transparent',
              cursor: 'pointer',
              fontWeight: loginType === 'code' ? '600' : '400',
              boxShadow: loginType === 'code' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            验证码登录
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">手机号</label>
            <input
              type="tel"
              className="form-input"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
            />
          </div>

          {loginType === 'password' ? (
            <div className="form-group">
              <label className="form-label">密码</label>
              <input
                type="password"
                className="form-input"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">验证码</label>
              <div className="code-input-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
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
          )}

          {loginType === 'password' && (
            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link to="/forgot-password" className="link" style={{ fontSize: '14px' }}>
                忘记密码？
              </Link>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ marginBottom: '16px' }}
          >
            {loading ? <span className="loading"></span> : '登录'}
          </button>
        </form>

        <div className="divider">
          <span>其他登录方式</span>
        </div>

        <div className="social-buttons">
          <button 
            className="social-btn wechat"
            onClick={() => handleThirdPartyLogin('wechat')}
            title="微信登录"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
            </svg>
          </button>
          <button 
            className="social-btn qq"
            onClick={() => handleThirdPartyLogin('qq')}
            title="QQ登录"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.28 1.025.114 0 .573-.432.573-.432s-.058.19-.058.665c0 .43.229 1.01.758 1.01.39 0 1.125-.834 1.125-.834s.455 1.093 1.842 1.093c.968 0 1.546-.558 1.546-.558s.455.558 1.546.558c1.387 0 1.842-1.093 1.842-1.093s.736.834 1.125.834c.529 0 .758-.58.758-1.01 0-.475-.058-.665-.058-.665s.459.432.573.432c.11 0 .28-.36.28-1.025 0-2.514-2.164-6.954-2.164-6.954V9.325C18.293 3.364 14.268 2 12.003 2z"/>
            </svg>
          </button>
        </div>

        <div className="text-center" style={{ marginTop: '24px' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>还没有账号？</span>
          <Link to="/register" className="link" style={{ marginLeft: '4px' }}>立即注册</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
