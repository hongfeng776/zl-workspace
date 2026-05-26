import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { all, get, run } from '../database';

const router = Router();

const serviceCities = [
  {
    id: 'beijing',
    name: '北京',
    code: 'BJ',
    status: 'active',
    coverage: '全市覆盖',
    districts: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '顺义区', '昌平区', '大兴区']
  },
  {
    id: 'shanghai',
    name: '上海',
    code: 'SH',
    status: 'active',
    coverage: '全市覆盖',
    districts: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '浦东新区']
  },
  {
    id: 'guangzhou',
    name: '广州',
    code: 'GZ',
    status: 'active',
    coverage: '全市覆盖',
    districts: ['越秀区', '荔湾区', '海珠区', '天河区', '白云区', '黄埔区', '番禺区', '花都区', '南沙区']
  },
  {
    id: 'shenzhen',
    name: '深圳',
    code: 'SZ',
    status: 'active',
    coverage: '全市覆盖',
    districts: ['福田区', '罗湖区', '南山区', '宝安区', '龙岗区', '盐田区', '龙华区', '坪山区', '光明区']
  },
  {
    id: 'hangzhou',
    name: '杭州',
    code: 'HZ',
    status: 'active',
    coverage: '主城区及周边',
    districts: ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区']
  },
  {
    id: 'chengdu',
    name: '成都',
    code: 'CD',
    status: 'coming',
    coverage: '即将开通',
    districts: ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '高新区', '天府新区']
  }
];

const promotions = [
  {
    id: 1,
    title: '新用户专享',
    subtitle: '首单立减20元',
    description: '新用户注册即可获得20元打车券，首单直接抵扣',
    icon: '🎉',
    type: 'new_user',
    discount: 20,
    minSpend: 20,
    validDays: 30,
    status: 'active',
    createdAt: '2026-05-01T00:00:00.000Z'
  },
  {
    id: 2,
    title: '早高峰特惠',
    subtitle: '工作日早高峰8折',
    description: '每周一至周五 7:00-9:00，打车享受8折优惠',
    icon: '🌅',
    type: 'time_specific',
    discount: 0.8,
    maxDiscount: 10,
    validTime: '7:00-9:00',
    validDays: ['周一', '周二', '周三', '周四', '周五'],
    status: 'active',
    createdAt: '2026-05-10T00:00:00.000Z'
  },
  {
    id: 3,
    title: '晚高峰拼车',
    subtitle: '拼车最高省15元',
    description: '晚高峰拼车出行，与顺路乘客分摊费用，最高立减15元',
    icon: '🚗',
    type: 'carpool',
    discount: 15,
    minSpend: 30,
    validTime: '17:00-19:00',
    status: 'active',
    createdAt: '2026-05-15T00:00:00.000Z'
  },
  {
    id: 4,
    title: '周末出游礼包',
    subtitle: '周末打车享多重优惠',
    description: '周六周日出行，可领取专车优惠券、快车折扣券等多重好礼',
    icon: '🎁',
    type: 'weekend',
    coupons: [
      { type: 'express', discount: 5, minSpend: 20 },
      { type: 'premium', discount: 15, minSpend: 50 }
    ],
    validDays: ['周六', '周日'],
    status: 'active',
    createdAt: '2026-05-20T00:00:00.000Z'
  },
  {
    id: 5,
    title: '端午节出行攻略',
    subtitle: '假期出行更省心',
    description: '端午节期间提前预约用车，享受专属优惠价格，避开出行高峰',
    icon: '🐲',
    type: 'holiday',
    discount: 0.9,
    maxDiscount: 20,
    validDate: '2026-06-10 至 2026-06-12',
    status: 'active',
    createdAt: '2026-05-25T00:00:00.000Z'
  },
  {
    id: 6,
    title: '邀好友得现金',
    subtitle: '多邀多得，上不封顶',
    description: '邀请好友注册并完成首单，即可获得现金奖励，可直接提现',
    icon: '💰',
    type: 'referral',
    reward: 30,
    status: 'active',
    createdAt: '2026-05-01T00:00:00.000Z'
  }
];

const holidayGuides = [
  {
    id: 1,
    title: '2026年端午节出行攻略',
    subtitle: '避峰出行，畅享假期',
    content: '1. 提前规划行程，避开6月10日上午和6月12日下午的出行高峰\n2. 热门景点周边建议选择公共交通或提前预约用车\n3. 假期期间运力紧张，建议提前30分钟预约叫车\n4. 使用预约功能，享受专属优惠价格',
    cover: null,
    date: '2026-06-10 至 2026-06-12',
    tips: [
      { icon: '📅', text: '提前30分钟预约用车' },
      { icon: '🚇', text: '热门景点建议地铁出行' },
      { icon: '⏰', text: '避开上午9-11点高峰' }
    ],
    status: 'published'
  },
  {
    id: 2,
    title: '暑期出行安全提示',
    subtitle: '安全出行，快乐暑假',
    content: '1. 乘车时务必系好安全带\n2. 注意核对司机和车辆信息\n3. 长途出行建议多人结伴\n4. 行程中可分享行程给亲友',
    cover: null,
    date: '2026-07-01 至 2026-08-31',
    tips: [
      { icon: '🔒', text: '系好安全带' },
      { icon: '👀', text: '核对司机信息' },
      { icon: '📤', text: '分享行程给亲友' }
    ],
    status: 'published'
  }
];

router.get('/cities', (req, res) => {
  const { status } = req.query;
  let cities = serviceCities;
  
  if (status) {
    cities = cities.filter(c => c.status === status);
  }
  
  res.json({
    cities: cities.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      status: c.status,
      coverage: c.coverage,
      districts: c.districts
    })),
    total: cities.length
  });
});

router.get('/cities/:id', (req, res) => {
  const city = serviceCities.find(c => c.id === req.params.id);
  if (!city) {
    return res.status(404).json({ message: '城市不存在' });
  }
  res.json({ city });
});

router.get('/promotions', authMiddleware, (req: AuthRequest, res: Response) => {
  const { type } = req.query;
  let activePromotions = promotions.filter(p => p.status === 'active');
  
  if (type) {
    activePromotions = activePromotions.filter(p => p.type === type);
  }
  
  res.json({
    promotions: activePromotions,
    total: activePromotions.length
  });
});

router.get('/promotions/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const promotion = promotions.find(p => p.id === parseInt(req.params.id));
  if (!promotion) {
    return res.status(404).json({ message: '活动不存在' });
  }
  res.json({ promotion });
});

router.get('/holiday-guides', (req, res) => {
  const guides = holidayGuides.filter(g => g.status === 'published');
  res.json({
    guides,
    total: guides.length
  });
});

router.get('/holiday-guides/:id', (req, res) => {
  const guide = holidayGuides.find(g => g.id === parseInt(req.params.id));
  if (!guide) {
    return res.status(404).json({ message: '攻略不存在' });
  }
  res.json({ guide });
});

export default router;
