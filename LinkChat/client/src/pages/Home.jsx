import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../utils/api'
import { useToast } from '../components/Toast'

const Home = () => {
  const { user, token, logout, setUser } = useAuthStore()
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await authApi.getUserInfo()
        setUser(response.data.user)
      } catch (error) {
        console.error('获取用户信息失败')
      }
    }

    if (token) {
      fetchUserInfo()
    }
  }, [token, setUser])

  const handleLogout = () => {
    logout()
    showToast('已退出登录')
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
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>乐聊</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/profile" className="link" style={{ fontSize: '14px' }}>
              账号设置
            </Link>
            <button 
              onClick={handleLogout}
              className="link"
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {!user?.phone && (
            <div style={{ 
              marginBottom: '24px',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #fff8e6 0%, #fffbe6 100%)',
              borderRadius: '12px',
              border: '1px solid #ffe58f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ color: '#ad6800', fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                  🔔 账号安全提醒
                </h3>
                <p style={{ color: '#ad6800', fontSize: '13px', margin: 0 }}>
                  您的账号尚未绑定手机号，为了账号安全，请尽快绑定
                </p>
              </div>
              <Link 
                to="/profile" 
                className="btn btn-primary"
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '14px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                去绑定
              </Link>
            </div>
          )}

          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold'
              }}>
                {user?.nickname?.charAt(0) || '乐'}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
                  你好，{user?.nickname || '乐聊用户'}
                </h2>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  欢迎回来！开始你的快乐聊天吧
                </p>
                {user?.phone && (
                  <p style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>
                    手机号：{user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              快捷操作
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <Link to="/profile" style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#333',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e9ecef'
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚙️</div>
                <div style={{ fontWeight: '500' }}>账号设置</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  修改个人信息
                </div>
              </Link>
              
              <Link to="/security-verify" style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#333',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e9ecef'
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔐</div>
                <div style={{ fontWeight: '500' }}>安全验证</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  设置安全问题
                </div>
              </Link>
              
              <Link to="/profile" style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#333',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e9ecef'
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔑</div>
                <div style={{ fontWeight: '500' }}>修改密码</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  更改登录密码
                </div>
              </Link>
              
              <Link to="/delete-account" style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#333',
                transition: 'all 0.3s ease'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e9ecef'
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗑️</div>
                <div style={{ fontWeight: '500' }}>注销账号</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  永久删除账号
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
