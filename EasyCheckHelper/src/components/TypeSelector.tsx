import { useCheckinStore } from '@/store/useCheckinStore';

const TypeSelector = () => {
  const { checkinTypes, selectedTypeId, setSelectedTypeId } = useCheckinStore();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">选择打卡类型</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {checkinTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedTypeId(type.id)}
            className={`flex flex-col items-center min-w-[70px] p-3 rounded-xl transition-all duration-200 ${
              selectedTypeId === type.id
                ? 'bg-emerald-50 border-2 border-emerald-500 scale-105'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl mb-1">{type.emoji}</span>
            <span
              className={`text-xs font-medium ${
                selectedTypeId === type.id ? 'text-emerald-600' : 'text-gray-600'
              }`}
            >
              {type.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypeSelector;
