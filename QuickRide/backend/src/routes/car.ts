import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const carTypes = [
  {
    id: 'express',
    name: '快车',
    icon: '🚗',
    description: '经济实惠，满足日常出行需求',
    features: ['即时叫车', '平价出行', '车型丰富'],
    suitableFor: ['日常通勤', '短途出行', '经济出行'],
    pricing: {
      basePrice: 12,
      perKm: 2.5,
      perMinute: 0.5,
      minPrice: 12,
      description: '起步价12元，含3公里8分钟，超出后计费'
    },
    available: true
  },
  {
    id: 'premium',
    name: '专车',
    icon: '🚙',
    description: '舒适出行，尊享品质服务',
    features: ['专业司机', '舒适车型', '免费矿泉水'],
    suitableFor: ['商务出行', '接送客户', '家庭出游'],
    pricing: {
      basePrice: 20,
      perKm: 3.8,
      perMinute: 0.8,
      minPrice: 20,
      description: '起步价20元，含3公里8分钟，超出后计费'
    },
    available: true
  },
  {
    id: 'luxury',
    name: '豪华车',
    icon: '🏎️',
    description: '高端车型，极致体验',
    features: ['豪车品牌', '专属司机', 'VIP服务'],
    suitableFor: ['重要场合', '高端商务', '特殊礼遇'],
    pricing: {
      basePrice: 50,
      perKm: 8.0,
      perMinute: 1.5,
      minPrice: 50,
      description: '起步价50元，含3公里8分钟，超出后计费'
    },
    available: true
  },
  {
    id: 'taxi',
    name: '出租车',
    icon: '🚕',
    description: '巡游出租车，招手即停',
    features: ['打表计费', '正规出租车', '即时出发'],
    suitableFor: ['即时用车', '短途出行', '熟悉路线'],
    pricing: {
      basePrice: 14,
      perKm: 2.8,
      perMinute: 0.6,
      minPrice: 14,
      description: '起步价14元，含3公里，超出后按里程计费'
    },
    available: true
  }
];

router.get('/types', (req, res) => {
  res.json({
    carTypes: carTypes.map(ct => ({
      id: ct.id,
      name: ct.name,
      icon: ct.icon,
      description: ct.description,
      features: ct.features,
      suitableFor: ct.suitableFor,
      available: ct.available
    }))
  });
});

router.get('/types/:id', (req, res) => {
  const carType = carTypes.find(ct => ct.id === req.params.id);
  if (!carType) {
    return res.status(404).json({ message: '车型不存在' });
  }
  res.json({ carType });
});

router.get('/pricing', (req, res) => {
  res.json({
    pricingList: carTypes.map(ct => ({
      id: ct.id,
      name: ct.name,
      icon: ct.icon,
      basePrice: ct.pricing.basePrice,
      perKm: ct.pricing.perKm,
      perMinute: ct.pricing.perMinute,
      minPrice: ct.pricing.minPrice,
      description: ct.pricing.description
    }))
  });
});

router.post('/estimate', authMiddleware, (req: AuthRequest, res: Response) => {
  const { distance, duration, carTypeId } = req.body;

  if (!distance || distance <= 0) {
    return res.status(400).json({ message: '请输入有效的里程' });
  }

  const estimates = carTypes.filter(ct => ct.available).map(ct => {
    const baseDistance = 3;
    const baseDuration = 8;
    
    const extraDistance = Math.max(0, distance - baseDistance);
    const extraDuration = Math.max(0, (duration || 15) - baseDuration);
    
    const price = ct.pricing.basePrice + 
                  extraDistance * ct.pricing.perKm + 
                  extraDuration * ct.pricing.perMinute;
    
    const finalPrice = Math.max(ct.pricing.minPrice, Math.round(price * 100) / 100);
    
    return {
      carTypeId: ct.id,
      carTypeName: ct.name,
      icon: ct.icon,
      estimate: finalPrice,
      range: {
        min: Math.round(finalPrice * 0.9 * 100) / 100,
        max: Math.round(finalPrice * 1.1 * 100) / 100
      },
      breakdown: {
        basePrice: ct.pricing.basePrice,
        distanceFee: Math.round(extraDistance * ct.pricing.perKm * 100) / 100,
        durationFee: Math.round(extraDuration * ct.pricing.perMinute * 100) / 100
      }
    };
  });

  if (carTypeId) {
    const specificEstimate = estimates.find(e => e.carTypeId === carTypeId);
    if (!specificEstimate) {
      return res.status(404).json({ message: '车型不存在或暂不可用' });
    }
    return res.json({ estimate: specificEstimate });
  }

  res.json({ estimates });
});

export default router;
