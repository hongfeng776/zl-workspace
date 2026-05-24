import { Trash2 } from 'lucide-react';
import TypeManager from '@/components/TypeManager';
import { clearAllData } from '@/utils/storage';
import { useCheckinStore } from '@/store/useCheckinStore';

const Settings = () => {
  const { loadData } = useCheckinStore();

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      clearAllData();
      loadData();
      alert('数据已清除');
    }
  };

  return (
    <div className="space-y-6">
      <TypeManager />

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">数据管理</h3>
        <button
          onClick={handleClearData}
          className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
        >
          <Trash2 size={18} />
          清除所有数据
        </button>
      </div>

      <div className="text-center text-sm text-gray-400 py-4">
        <p>便捷打卡助手 v1.0</p>
        <p className="mt-1">数据保存在本地浏览器中</p>
      </div>
    </div>
  );
};

export default Settings;
