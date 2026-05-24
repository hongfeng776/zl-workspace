import { Trash2 } from 'lucide-react';
import { useCheckinStore } from '@/store/useCheckinStore';

const RecordList = () => {
  const { checkinRecords, getTypeById, removeCheckin } = useCheckinStore();
  
  const sortedRecords = [...checkinRecords].sort((a, b) => b.timestamp - a.timestamp);
  
  const groupedRecords = sortedRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, typeof checkinRecords>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    return `${month}月${day}日 ${weekDay}`;
  };

  const handleDelete = (recordId: string) => {
    if (confirm('确定要删除这条打卡记录吗？')) {
      removeCheckin(recordId);
    }
  };

  if (sortedRecords.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm text-center">
        <div className="text-5xl mb-4">📝</div>
        <p className="text-gray-500">还没有打卡记录</p>
        <p className="text-gray-400 text-sm mt-1">开始你的第一次打卡吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedRecords).map(([date, records]) => (
        <div key={date} className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            {formatDate(date)}
          </h4>
          <div className="space-y-2">
            {records.map((record) => {
              const type = getTypeById(record.typeId);
              return type ? (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${type.color}20` }}
                    >
                      {type.emoji}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{type.name}</p>
                      <p className="text-xs text-gray-500">{record.time}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordList;
