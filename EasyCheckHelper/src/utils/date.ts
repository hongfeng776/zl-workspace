export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getMonthDays = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const getWeekDays = (): string[] => {
  return ['日', '一', '二', '三', '四', '五', '六'];
};

export const getMonthName = (month: number): string => {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return months[month];
};

export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const getPreviousDay = (dateStr: string): string => {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() - 1);
  return formatDate(date);
};

export const calculateStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...new Set(dates)].sort().reverse();
  const today = getToday();
  
  if (sortedDates[0] !== today && sortedDates[0] !== getPreviousDay(today)) {
    return 0;
  }
  
  let streak = 0;
  let currentDate = today;
  
  for (let i = 0; i < sortedDates.length; i++) {
    if (sortedDates[i] === currentDate || (i === 0 && sortedDates[i] === getPreviousDay(today))) {
      streak++;
      currentDate = getPreviousDay(currentDate === today ? currentDate : currentDate);
    } else if (i > 0) {
      break;
    }
  }
  
  return streak;
};

export const getMonthlyDates = (year: number, month: number): string[] => {
  const days = getMonthDays(year, month);
  const dates: string[] = [];
  for (let day = 1; day <= days; day++) {
    dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return dates;
};
