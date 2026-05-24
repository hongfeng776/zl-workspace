import { useState } from 'react';
import { Check } from 'lucide-react';
import { useCheckinStore } from '@/store/useCheckinStore';

const CheckinButton = () => {
  const { addCheckin, selectedTypeId, getTypeById } = useCheckinStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const selectedType = getTypeById(selectedTypeId);

  const handleCheckin = () => {
    if (isAnimating || !selectedType) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      addCheckin(selectedTypeId);
      setShowSuccess(true);
      setIsAnimating(false);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 1500);
    }, 500);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCheckin}
        disabled={isAnimating}
        className={`w-full py-5 rounded-2xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${
          isAnimating
            ? 'scale-95 opacity-80'
            : 'hover:scale-[1.02] active:scale-95'
        }`}
        style={{
          background: selectedType 
            ? `linear-gradient(135deg, ${selectedType.color}, ${selectedType.color}dd)`
            : 'linear-gradient(135deg, #10B981, #059669)',
        }}
      >
        {isAnimating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            打卡中...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            {selectedType && <span className="mr-2 text-xl">{selectedType.emoji}</span>}
            {showSuccess ? '打卡成功！' : '立即打卡'}
          </span>
        )}
      </button>

      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="absolute text-2xl animate-ping"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  transform: `rotate(${i * 45}deg) translateY(-40px)`,
                }}
              >
                ✨
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckinButton;
