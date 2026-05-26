import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { feedApi } from '../utils/api'
import { useToast } from '../components/Toast'

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await feedApi.getPostDetail(id)
        setPost(response.data.data)
      } catch (error) {
        console.error('获取详情失败:', error)
        showToast('加载失败，请重试')
      } finally {
        setLoading(false)
      }
    }

    fetchPostDetail()
  }, [id, showToast])

  const handleBack = () => {
    navigate(-1)
  }

  const handleShare = async () => {
    if (!post) return
    
    try {
      const response = await feedApi.sharePost(post._id)
      const shareUrl = response.data.shareUrl
      
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        showToast('分享链接已复制到剪贴板')
      }
      
      setPost(prev => ({ ...prev, shares: prev.shares + 1 }))
    } catch (error) {
      if (error.name !== 'AbortError') {
        showToast('分享失败，请重试')
      }
    }
  }

  const handleLike = async () => {
    if (!post || liked) return
    
    try {
      const response = await feedApi.likePost(post._id)
      setPost(prev => ({ ...prev, likes: response.data.likes }))
      setLiked(true)
      showToast('点赞成功')
    } catch (error) {
      showToast('点赞失败，请重试')
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'contact': return '联系人动态'
      case 'official': return '公众号'
      case 'video': return '视频号'
      default: return '动态'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'contact': return '👤'
      case 'official': return '📢'
      case 'video': return '🎬'
      default: return '📄'
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #ddd',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ color: '#999', fontSize: '14px' }}>加载中...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <p style={{ fontSize: '16px', marginBottom: '24px' }}>内容不存在或已被删除</p>
          <button
            onClick={handleBack}
            className="btn btn-primary"
          >
            返回上一页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f5f5f5'
    }}>
      {ToastComponent}

      <header style={{
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f0f0'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          ← 返回
        </button>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {post.title}
          </h1>
        </div>
        <button
          onClick={handleShare}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '14px' }}
        >
          📤 分享
        </button>
      </header>

      <main style={{ flex: 1, padding: '24px' }}>
        <article style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              {post.authorName?.charAt(0) || '用'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{ fontWeight: '600', fontSize: '15px' }}>
                  {post.authorName}
                </span>
                <span style={{
                  padding: '2px 8px',
                  background: '#f0f2ff',
                  color: '#667eea',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}>
                  {getTypeIcon(post.type)} {getTypeLabel(post.type)}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: '#999' }}>
                {formatTime(post.createdAt)}
              </span>
            </div>
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 20px 0',
            lineHeight: '1.4'
          }}>
            {post.title}
          </h2>

          {post.cover && (
            <div style={{
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              {post.type === 'video' && post.videoUrl ? (
                <video
                  src={post.videoUrl}
                  controls
                  poster={post.cover}
                  style={{
                    width: '100%',
                    maxHeight: '450px',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
              ) : (
                <img
                  src={post.cover}
                  alt={post.title}
                  style={{
                    width: '100%',
                    maxHeight: '450px',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
              )}
            </div>
          )}

          <div style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#333',
            marginBottom: '24px'
          }}>
            {post.content}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #f0f0f0'
            }}>
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: '6px 14px',
                    background: '#f0f2ff',
                    color: '#667eea',
                    borderRadius: '16px',
                    fontSize: '13px'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '20px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', gap: '32px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                👁️ 阅读 {post.views}
              </span>
              <span style={{ fontSize: '14px', color: '#666' }}>
                💬 评论 {post.comments}
              </span>
              <span style={{ fontSize: '14px', color: '#666' }}>
                ❤️ 点赞 {post.likes}
              </span>
              <span style={{ fontSize: '14px', color: '#666' }}>
                📤 分享 {post.shares}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleLike}
                disabled={liked}
                style={{
                  padding: '10px 20px',
                  border: liked ? '1px solid #e0e0e0' : '1px solid #667eea',
                  borderRadius: '24px',
                  background: liked ? '#f5f5f5' : 'white',
                  color: liked ? '#999' : '#667eea',
                  fontSize: '14px',
                  cursor: liked ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {liked ? '已点赞' : '❤️ 点赞'}
              </button>
              <button
                onClick={handleShare}
                className="btn btn-primary"
                style={{ padding: '10px 20px', borderRadius: '24px' }}
              >
                📤 分享
              </button>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}

export default PostDetail
