import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCheckinStore } from '@/store/useCheckinStore';
import { getMonthDays, getFirstDayOfMonth, getWeekDays, getMonthName, getToday } from '@/utils/date';

const Calendar = () => {
  const { currentMonth, setCurrentMonth, getCheckinDates, getRecordsByDate, getTypeById } = useCheckinStore();
  const { year, month } = currentMonth;
  
  const checkinDates = getCheckinDates();
  const today = getToday();
  
  const daysInMonth = getMonthDays(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weekDays = getWeekDays();
  
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const goToPrevMonth = () => {
    if (month === 0) {
      setCurrentMonth(year - 1, 11);
    } else {
      setCurrentMonth(year, month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setCurrentMonth(year + 1, 0);
    } else {
      setCurrentMonth(year, month + 1);
    }
  };

  const formatDay = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day: number) => formatDay(day) === today;
  const hasCheckin = (day: number) => checkinDates.includes(formatDay(day));

  const getCheckinEmojis = (day: number) => {
    const records = getRecordsByDate(formatDay(day));
    return records.slice(0, 3).map(r => {
      const type = getTypeById(r.typeId);
      return type?.emoji;
    }).filter(Boolean);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h3 className="font-semibold text-gray-800">
          {year}年 {getMonthName(month)}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative ${
              day
                ? isToday(day)
                  ? 'bg-emerald-500 text-white font-bold'
                  : hasCheckin(day)
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'hover:bg-gray-50 text-gray-700'
                : ''
            }`}
          >
            {day && (
              <>
                <span className={isToday(day) ? 'text-white' : ''}>{day}</span>
                {hasCheckin(day) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {getCheckinEmojis(day).map((emoji, i) => (
                      <span key={i} className="text-[8px]">{emoji}</span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
