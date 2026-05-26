import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { feedApi } from '../utils/api'
import { useToast } from '../components/Toast'

const Feed = () => {
  const { user, token } = useAuthStore()
  const { showToast, ToastComponent } = useToast()
  const navigate = useNavigate()

  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const observerRef = useRef()
  const pullStartY = useRef(0)
  const pullDistance = useRef(0)
  const feedContainerRef = useRef()

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'contact', label: '联系人动态' },
    { key: 'official', label: '公众号' },
    { key: 'video', label: '视频号' }
  ]

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  const fetchFeed = useCallback(async (refresh = false, search = false) => {
    if (loading && !refresh) return
    
    setLoading(true)
    if (refresh) {
      setRefreshing(true)
    }

    try {
      const currentPage = refresh ? 1 : page
      let response
      
      if (search && searchKeyword.trim()) {
        response = await feedApi.searchFeed(searchKeyword.trim(), activeTab, currentPage, 10)
      } else {
        response = await feedApi.getFeed(activeTab, currentPage, 10)
      }
      
      const { data, hasMore: more } = response.data
      
      if (refresh) {
        setPosts(data)
        setPage(2)
      } else {
        setPosts(prev => [...prev, ...data])
        setPage(prev => prev + 1)
      }
      setHasMore(more)
    } catch (error) {
      console.error('获取信息流失败:', error)
      showToast('加载失败，请重试')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, activeTab, loading, searchKeyword, showToast])

  useEffect(() => {
    if (token) {
      feedApi.seedData().catch(() => {})
      fetchFeed(true)
    }
  }, [token])

  useEffect(() => {
    if (!loading) {
      fetchFeed(true)
    }
  }, [activeTab])

  useEffect(() => {
    if (isSearching && searchKeyword.trim()) {
      fetchFeed(true, true)
    } else if (!isSearching && !searchKeyword.trim()) {
      fetchFeed(true)
    }
  }, [isSearching, searchKeyword])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !refreshing) {
          fetchFeed(false, isSearching)
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, refreshing, fetchFeed, isSearching])

  const handleRefresh = () => {
    if (!refreshing) {
      fetchFeed(true, isSearching)
    }
  }

  const handleTouchStart = (e) => {
    if (feedContainerRef.current?.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e) => {
    if (feedContainerRef.current?.scrollTop === 0 && pullStartY.current) {
      const currentY = e.touches[0].clientY
      pullDistance.current = Math.max(0, currentY - pullStartY.current)
      
      if (pullDistance.current > 80 && !refreshing) {
        handleRefresh()
        pullStartY.current = 0
        pullDistance.current = 0
      }
    }
  }

  const handleTouchEnd = () => {
    pullStartY.current = 0
    pullDistance.current = 0
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setIsSearching(true)
  }

  const clearSearch = () => {
    setSearchKeyword('')
    setIsSearching(false)
    setShowSearch(false)
  }

  const handleShare = async (post, e) => {
    e.stopPropagation()
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
      
      setPosts(prev => prev.map(p => 
        p._id === post._id ? { ...p, shares: p.shares + 1 } : p
      ))
    } catch (error) {
      if (error.name !== 'AbortError') {
        showToast('分享失败，请重试')
      }
    }
  }

  const handleLike = async (post, e) => {
    e.stopPropagation()
    try {
      const response = await feedApi.likePost(post._id)
      setPosts(prev => prev.map(p => 
        p._id === post._id ? { ...p, likes: response.data.likes } : p
      ))
      showToast('点赞成功')
    } catch (error) {
      showToast('点赞失败，请重试')
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
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '800px',
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
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>乐聊</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setShowSearch(!showSearch)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '8px'
              }}
            >
              🔍
            </button>
            <Link to="/profile" className="link" style={{ fontSize: '14px' }}>
              我的
            </Link>
          </div>
        </div>

        {showSearch && (
          <form onSubmit={handleSearch} style={{
            maxWidth: '800px',
            margin: '12px auto 0',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索信息流内容..."
              style={{
                flex: 1,
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '24px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '10px 20px', borderRadius: '24px' }}
            >
              搜索
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className="btn"
                style={{ padding: '10px 20px', borderRadius: '24px' }}
              >
                取消
              </button>
            )}
          </form>
        )}

        <div style={{
          maxWidth: '800px',
          margin: '16px auto 0',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 20px',
                border: 'none',
                borderRadius: '20px',
                backgroundColor: activeTab === tab.key ? '#667eea' : '#f0f0f0',
                color: activeTab === tab.key ? 'white' : '#666',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? '600' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main 
        ref={feedContainerRef}
        style={{ 
          flex: 1, 
          padding: '16px 24px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {refreshing && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#999',
              fontSize: '14px'
            }}>
              <div style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                border: '2px solid #ddd',
                borderTopColor: '#667eea',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginRight: '8px',
                verticalAlign: 'middle'
              }} />
              正在刷新...
            </div>
          )}

          {posts.length === 0 && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ fontSize: '16px' }}>
                {isSearching ? '没有找到相关内容' : '暂无内容，下拉刷新试试'}
              </p>
            </div>
          )}

          {posts.map(post => (
            <div
              key={post._id}
              onClick={() => navigate(`/post/${post._id}`)}
              className="card"
              style={{ 
                marginBottom: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {post.authorName?.charAt(0) || '用'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {post.authorName}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {getTypeIcon(post.type)}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {formatTime(post.createdAt)}
                  </span>
                </div>
              </div>

              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 8px 0',
                lineHeight: '1.4'
              }}>
                {post.title}
              </h3>

              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.6',
                margin: '0 0 12px 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {post.content}
              </p>

              {post.cover && (
                <div style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  position: 'relative'
                }}>
                  <img
                    src={post.cover}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  {post.type === 'video' && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '50px',
                      height: '50px',
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px'
                    }}>
                      ▶
                    </div>
                  )}
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '12px'
                }}>
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '4px 10px',
                        background: '#f0f2ff',
                        color: '#667eea',
                        borderRadius: '12px',
                        fontSize: '12px'
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
                paddingTop: '12px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <span style={{ fontSize: '13px', color: '#999' }}>
                    👁️ {post.views}
                  </span>
                  <span style={{ fontSize: '13px', color: '#999' }}>
                    💬 {post.comments}
                  </span>
                  <span style={{ fontSize: '13px', color: '#999' }}>
                    ❤️ {post.likes}
                  </span>
                </div>
                <button
                  onClick={(e) => handleShare(post, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  📤 分享 <span style={{ color: '#999' }}>({post.shares})</span>
                </button>
              </div>
            </div>
          ))}

          <div ref={observerRef} style={{
            textAlign: 'center',
            padding: '20px',
            color: '#999',
            fontSize: '14px'
          }}>
            {loading && !refreshing ? (
              <span>加载更多中...</span>
            ) : hasMore ? (
              <span>上拉加载更多</span>
            ) : posts.length > 0 ? (
              <span>没有更多内容了</span>
            ) : null}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Feed
