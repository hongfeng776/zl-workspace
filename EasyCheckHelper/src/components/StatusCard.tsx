import { Flame, CheckCircle2 } from 'lucide-react';
import { useCheckinStore } from '@/store/useCheckinStore';
import { getToday } from '@/utils/date';

const StatusCard = () => {
  const { hasCheckedInToday, getStats, getTodayRecords, getTypeById } = useCheckinStore();
  const stats = getStats();
  const todayRecords = getTodayRecords();
  const hasCheckedIn = hasCheckedInToday();

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[today.getDay()];

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-emerald-100 text-sm">{dateStr} {weekDay}</p>
          <p className="text-2xl font-bold mt-1">今日打卡</p>
        </div>
        <div className="flex items-center bg-white/20 rounded-full px-3 py-1.5">
          <Flame size={16} className="text-orange-300 mr-1" />
          <span className="font-semibold text-sm">{stats.currentStreak} 天</span>
        </div>
      </div>

      {hasCheckedIn ? (
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <CheckCircle2 size={20} className="mr-2" />
            <span className="font-medium">已完成打卡 ✨</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {todayRecords.map((record) => {
              const type = getTypeById(record.typeId);
              return type ? (
                <span
                  key={record.id}
                  className="bg-white/20 px-2 py-1 rounded-lg text-sm flex items-center"
                >
                  <span className="mr-1">{type.emoji}</span>
                  {type.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <p className="text-emerald-100">还没有打卡，选择下方类型开始打卡吧！</p>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
