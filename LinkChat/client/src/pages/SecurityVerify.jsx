import { useState } from 'react'
import { Link } from 'react-router-dom'
import { userApi } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/Toast'

const defaultQuestions = [
  '你的出生地是哪里？',
  '你的小学名称是什么？',
  '你的第一个宠物叫什么名字？',
  '你最喜欢的电影是什么？',
  '你的母亲的名字是什么？',
  '你的父亲的名字是什么？'
]

const SecurityVerify = () => {
  const { user, setUser } = useAuthStore()
  const [step, setStep] = useState(user?.securityVerified ? 'verify' : 'setup')
  const [selectedQuestions, setSelectedQuestions] = useState(['', '', ''])
  const [answers, setAnswers] = useState(['', '', ''])
  const [verifyAnswers, setVerifyAnswers] = useState(['', '', ''])
  const [loading, setLoading] = useState(false)
  
  const { showToast, ToastComponent } = useToast()

  const handleQuestionChange = (index, question) => {
    const newQuestions = [...selectedQuestions]
    newQuestions[index] = question
    setSelectedQuestions(newQuestions)
  }

  const handleAnswerChange = (index, answer) => {
    const newAnswers = [...answers]
    newAnswers[index] = answer
    setAnswers(newAnswers)
  }

  const handleVerifyAnswerChange = (index, answer) => {
    const newAnswers = [...verifyAnswers]
    newAnswers[index] = answer
    setVerifyAnswers(newAnswers)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    for (let i = 0; i < 3; i++) {
      if (!selectedQuestions[i]) {
        showToast(`请选择第${i + 1}个安全问题`, 'error')
        return
      }
      if (!answers[i].trim()) {
        showToast(`请输入第${i + 1}个问题的答案`, 'error')
        return
      }
    }

    const questions = selectedQuestions.map((question, index) => ({
      question,
      answer: answers[index]
    }))

    setLoading(true)
    try {
      await userApi.securityVerify(questions)
      setUser({ ...user, securityVerified: true })
      showToast('安全验证设置成功')
      setStep('verify')
    } catch (error) {
      showToast(error.response?.data?.message || '设置失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    
    for (let i = 0; i < 3; i++) {
      if (!verifyAnswers[i].trim()) {
        showToast(`请输入第${i + 1}个问题的答案`, 'error')
        return
      }
    }

    setLoading(true)
    try {
      await userApi.securityCheck(verifyAnswers)
      showToast('安全验证通过')
    } catch (error) {
      showToast(error.response?.data?.message || '验证失败', 'error')
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
          maxWidth: '600px',
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
          }}>安全验证</h1>

          <div className="card">
            {step === 'setup' ? (
              <>
                <p style={{ 
                  color: '#666', 
                  fontSize: '14px', 
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  设置安全问题，用于账号安全验证
                </p>
                
                <form onSubmit={handleSubmit}>
                  {[0, 1, 2].map((index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <label className="form-label">安全问题 {index + 1}</label>
                      <select
                        className="form-input"
                        value={selectedQuestions[index]}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        style={{ marginBottom: '12px' }}
                      >
                        <option value="">请选择安全问题</option>
                        {defaultQuestions
                          .filter(q => !selectedQuestions.includes(q) || selectedQuestions[index] === q)
                          .map((question, i) => (
                            <option key={i} value={question}>{question}</option>
                          ))
                        }
                      </select>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="请输入答案"
                        value={answers[index]}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? <span className="loading"></span> : '设置安全问题'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div style={{ 
                  background: '#e8f5e9', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>✅</span>
                  <span style={{ color: '#2e7d32', fontSize: '14px' }}>
                    您已设置安全验证
                  </span>
                </div>

                <form onSubmit={handleVerify}>
                  {user?.securityQuestions?.map((q, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <label className="form-label">{q.question}</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="请输入答案"
                        value={verifyAnswers[index]}
                        onChange={(e) => handleVerifyAnswerChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ marginBottom: '16px' }}
                  >
                    {loading ? <span className="loading"></span> : '验证'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep('setup')}
                  >
                    重新设置
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default SecurityVerify
