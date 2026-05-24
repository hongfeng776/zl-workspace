import { Trophy, Target, Flame, Calendar } from 'lucide-react';
import { useCheckinStore } from '@/store/useCheckinStore';

const StatsCard = () => {
  const { getStats } = useCheckinStore();
  const stats = getStats();

  const statItems = [
    { icon: Target, label: '总打卡', value: stats.totalCheckins, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Flame, label: '连续打卡', value: stats.currentStreak, color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Trophy, label: '最长连续', value: stats.longestStreak, color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Calendar, label: '本月打卡', value: stats.monthlyCheckins, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {statItems.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
          <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
            <Icon size={20} className={color} />
          </div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;
