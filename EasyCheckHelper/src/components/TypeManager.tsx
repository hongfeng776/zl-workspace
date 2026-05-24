import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { useCheckinStore } from '@/store/useCheckinStore';
import { CheckinType } from '@/types';

const colorOptions = [
  '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6',
  '#EC4899', '#EF4444', '#06B6D4', '#84CC16',
];

const emojiOptions = ['📚', '💼', '🏃', '📖', '🌅', '🎯', '💪', '🎨', '🎵', '💤', '🍎', '🧘'];

interface TypeManagerProps {
  type: CheckinType | null;
  onClose: () => void;
}

const TypeEditor = ({ type, onClose }: TypeManagerProps) => {
  const { addCheckinType, updateCheckinType } = useCheckinStore();
  const [name, setName] = useState(type?.name || '');
  const [emoji, setEmoji] = useState(type?.emoji || '📝');
  const [color, setColor] = useState(type?.color || '#10B981');

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (type) {
      updateCheckinType(type.id, name.trim(), emoji, color);
    } else {
      addCheckinType(name.trim(), emoji, color);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold">
            {type ? '编辑打卡类型' : '添加打卡类型'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              选择图标
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'bg-emerald-100 ring-2 ring-emerald-500'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              类型名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入打卡类型名称"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              maxLength={10}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              选择颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-md"
              style={{ backgroundColor: color }}
            >
              {emoji}
            </div>
            <span className="ml-3 font-medium text-gray-800">
              {name || '打卡类型'}
            </span>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Check size={20} />
            {type ? '保存修改' : '添加类型'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TypeManager = () => {
  const { checkinTypes, removeCheckinType } = useCheckinStore();
  const [editingType, setEditingType] = useState<CheckinType | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleDelete = (type: CheckinType) => {
    if (type.isDefault) {
      alert('默认类型不能删除');
      return;
    }
    if (confirm(`确定要删除"${type.name}"这个类型吗？`)) {
      removeCheckinType(type.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">打卡类型管理</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus size={16} />
          添加
        </button>
      </div>

      <div className="space-y-2">
        {checkinTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm"
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
                {type.isDefault && (
                  <p className="text-xs text-gray-400">默认类型</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!type.isDefault && (
                <>
                  <button
                    onClick={() => setEditingType(type)}
                    className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(type)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingType) && (
        <TypeEditor
          type={editingType}
          onClose={() => {
            setIsAdding(false);
            setEditingType(null);
          }}
        />
      )}
    </div>
  );
};

export default TypeManager;
