const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dbAdapter = require('../utils/dbAdapter');
const auth = require('../middleware/auth');

const mockPosts = [
  {
    type: 'contact',
    title: '今天天气真好！',
    content: '阳光明媚，适合出去走走。大家周末有什么计划吗？要不要一起去爬山？好久没有运动了，感觉身体都要生锈了。',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    authorName: '张三',
    likes: 24,
    comments: 8,
    views: 156,
    shares: 3,
    tags: ['生活', '周末'],
    createdAt: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    type: 'contact',
    title: '新入手了一款相机',
    content: '终于买到了心心念念的相机，接下来要好好学习摄影了。有没有大佬推荐一些入门教程？',
    cover: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
    authorName: '李四',
    likes: 56,
    comments: 12,
    views: 234,
    shares: 8,
    tags: ['摄影', '器材'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    type: 'official',
    title: '【乐聊官方】新版本发布，支持语音消息',
    content: '亲爱的用户，乐聊最新版本已上线！本次更新带来了期待已久的语音消息功能，让沟通更便捷。还优化了消息送达速度，快来体验吧！',
    cover: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
    authorName: '乐聊官方',
    likes: 1256,
    comments: 89,
    views: 12580,
    shares: 256,
    tags: ['官方公告', '更新'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
  },
  {
    type: 'official',
    title: '安全提醒：谨防网络诈骗',
    content: '近期有不法分子冒充客服进行诈骗，请提高警惕。官方不会通过私信要求您提供密码或验证码。如有疑问请联系官方客服。',
    cover: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop',
    authorName: '安全中心',
    likes: 890,
    comments: 45,
    views: 8900,
    shares: 180,
    tags: ['安全', '提醒'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  {
    type: 'video',
    title: '超治愈的猫咪日常',
    content: '家里的小橘猫今天又在晒太阳了，看它慵懒的样子真是治愈一切不开心。',
    cover: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    authorName: '萌宠达人',
    likes: 2345,
    comments: 156,
    views: 25600,
    shares: 567,
    tags: ['萌宠', '猫咪'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    type: 'video',
    title: '三分钟教你做手冲咖啡',
    content: '今天给大家分享一个简单的手冲咖啡教程，新手也能轻松上手，让你每天都能喝到好喝的咖啡。',
    cover: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    authorName: '咖啡师小王',
    likes: 1890,
    comments: 89,
    views: 18900,
    shares: 345,
    tags: ['咖啡', '教程'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36)
  },
  {
    type: 'contact',
    title: '打卡网红书店',
    content: '今天去了最近很火的那家书店，环境真的太棒了！很适合安静地看书或者办公。',
    cover: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop',
    authorName: '王五',
    likes: 89,
    comments: 23,
    views: 567,
    shares: 12,
    tags: ['读书', '探店'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
  },
  {
    type: 'official',
    title: '用户满意度调查问卷',
    content: '为了给您提供更好的服务，我们诚邀您参与本次用户满意度调查。完成问卷即可获得专属勋章奖励！',
    cover: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    authorName: '产品团队',
    likes: 456,
    comments: 67,
    views: 4560,
    shares: 89,
    tags: ['活动', '调查'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60)
  },
  {
    type: 'video',
    title: '城市夜景延时摄影',
    content: '花了一晚上拍的城市夜景，从黄昏到深夜，看看有没有你熟悉的角落。',
    cover: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    authorName: '城市记录者',
    likes: 3456,
    comments: 234,
    views: 34560,
    shares: 789,
    tags: ['城市', '摄影'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72)
  },
  {
    type: 'contact',
    title: '周末烘焙作品',
    content: '第一次尝试做戚风蛋糕，虽然有点开裂但是味道还不错！继续加油～',
    cover: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    authorName: '小厨娘',
    likes: 167,
    comments: 45,
    views: 890,
    shares: 23,
    tags: ['烘焙', '美食'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 80)
  }
];

router.get('/seed', async (req, res) => {
  try {
    const count = await dbAdapter.Post.countDocuments({});
    if (count === 0) {
      const user = await dbAdapter.User.findOne({});
      const authorId = user ? user._id : new mongoose.Types.ObjectId();
      
      const posts = mockPosts.map(post => ({
        ...post,
        author: authorId
      }));
      
      await dbAdapter.Post.insertMany(posts);
      res.json({ message: '模拟数据已插入', count: mockPosts.length });
    } else {
      res.json({ message: '数据已存在，跳过插入' });
    }
  } catch (error) {
    console.error('插入模拟数据失败:', error);
    res.status(500).json({ message: '插入模拟数据失败' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { type, page = 1, pageSize = 10 } = req.query;
    
    const query = { isActive: true };
    if (type && type !== 'all') {
      query.type = type;
    }

    const total = await dbAdapter.Post.countDocuments(query);
    const result = await dbAdapter.Post.find(query);
    
    let posts;
    if (dbAdapter.isUsingMemory()) {
      posts = result.skip((page - 1) * pageSize).limit(parseInt(pageSize)).select();
    } else {
      posts = await result
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
        .select('-__v');
    }

    res.json({
      data: posts,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      hasMore: page * pageSize < total
    });
  } catch (error) {
    console.error('获取信息流失败:', error);
    res.status(500).json({ message: '获取信息流失败' });
  }
});

router.get('/search', auth, async (req, res) => {
  try {
    const { keyword, type, page = 1, pageSize = 10 } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ message: '搜索关键词不能为空' });
    }

    const query = { 
      isActive: true,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
        { tags: { $regex: keyword, $options: 'i' } }
      ]
    };
    
    if (type && type !== 'all') {
      query.type = type;
    }

    const total = await dbAdapter.Post.countDocuments(query);
    const result = await dbAdapter.Post.find(query);
    
    let posts;
    if (dbAdapter.isUsingMemory()) {
      posts = result.skip((page - 1) * pageSize).limit(parseInt(pageSize)).select();
    } else {
      posts = await result
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
        .select('-__v');
    }

    res.json({
      data: posts,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      hasMore: page * pageSize < total
    });
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({ message: '搜索失败' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await dbAdapter.Post.findById(req.params.id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({ message: '内容不存在' });
    }

    const incView = req.query.incView !== 'false';
    if (incView) {
      post.views += 1;
      await dbAdapter.save(post);
    }

    res.json({ data: post });
  } catch (error) {
    console.error('获取详情失败:', error);
    res.status(500).json({ message: '获取详情失败' });
  }
});

router.post('/:id/share', auth, async (req, res) => {
  try {
    const post = await dbAdapter.Post.findById(req.params.id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({ message: '内容不存在' });
    }

    post.shares += 1;
    await dbAdapter.save(post);

    res.json({ 
      message: '分享成功',
      shares: post.shares,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/post/${post._id}`
    });
  } catch (error) {
    console.error('分享失败:', error);
    res.status(500).json({ message: '分享失败' });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await dbAdapter.Post.findById(req.params.id);
    
    if (!post || !post.isActive) {
      return res.status(404).json({ message: '内容不存在' });
    }

    post.likes += 1;
    await dbAdapter.save(post);

    res.json({ 
      message: '点赞成功',
      likes: post.likes
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ message: '点赞失败' });
  }
});

module.exports = router;
