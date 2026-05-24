import { CheckinType } from '@/types';

export const defaultCheckinTypes: CheckinType[] = [
  { id: '1', name: '学习', emoji: '📚', color: '#10B981', isDefault: true },
  { id: '2', name: '工作', emoji: '💼', color: '#3B82F6', isDefault: true },
  { id: '3', name: '运动', emoji: '🏃', color: '#F59E0B', isDefault: true },
  { id: '4', name: '阅读', emoji: '📖', color: '#8B5CF6', isDefault: true },
  { id: '5', name: '早起', emoji: '🌅', color: '#EC4899', isDefault: true },
];
