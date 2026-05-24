import { create } from 'zustand';
import { CheckinType, CheckinRecord, CheckinStats } from '@/types';
import { getCheckinTypes, saveCheckinTypes, getCheckinRecords, saveCheckinRecords, addCheckinRecord, deleteCheckinRecord } from '@/utils/storage';
import { getToday, formatDate, formatTime, calculateStreak, getMonthlyDates } from '@/utils/date';

interface CheckinState {
  checkinTypes: CheckinType[];
  checkinRecords: CheckinRecord[];
  selectedTypeId: string;
  currentMonth: { year: number; month: number };
  
  loadData: () => void;
  setSelectedTypeId: (id: string) => void;
  addCheckin: (typeId: string, note?: string) => void;
  removeCheckin: (recordId: string) => void;
  addCheckinType: (name: string, emoji: string, color: string) => void;
  updateCheckinType: (id: string, name: string, emoji: string, color: string) => void;
  removeCheckinType: (id: string) => void;
  setCurrentMonth: (year: number, month: number) => void;
  hasCheckedInToday: () => boolean;
  getTodayRecords: () => CheckinRecord[];
  getRecordsByDate: (date: string) => CheckinRecord[];
  getCheckinDates: () => string[];
  getStats: () => CheckinStats;
  getTypeById: (id: string) => CheckinType | undefined;
}

export const useCheckinStore = create<CheckinState>((set, get) => ({
  checkinTypes: [],
  checkinRecords: [],
  selectedTypeId: '1',
  currentMonth: { year: new Date().getFullYear(), month: new Date().getMonth() },

  loadData: () => {
    set({
      checkinTypes: getCheckinTypes(),
      checkinRecords: getCheckinRecords(),
    });
  },

  setSelectedTypeId: (id: string) => set({ selectedTypeId: id }),

  addCheckin: (typeId: string, note?: string) => {
    const now = new Date();
    const newRecord: CheckinRecord = {
      id: Date.now().toString(),
      typeId,
      date: formatDate(now),
      time: formatTime(now),
      note,
      timestamp: now.getTime(),
    };
    const records = addCheckinRecord(newRecord);
    set({ checkinRecords: records });
  },

  removeCheckin: (recordId: string) => {
    const records = deleteCheckinRecord(recordId);
    set({ checkinRecords: records });
  },

  addCheckinType: (name: string, emoji: string, color: string) => {
    const newType: CheckinType = {
      id: Date.now().toString(),
      name,
      emoji,
      color,
      isDefault: false,
    };
    const types = [...get().checkinTypes, newType];
    saveCheckinTypes(types);
    set({ checkinTypes: types });
  },

  updateCheckinType: (id: string, name: string, emoji: string, color: string) => {
    const types = get().checkinTypes.map(t => 
      t.id === id ? { ...t, name, emoji, color } : t
    );
    saveCheckinTypes(types);
    set({ checkinTypes: types });
  },

  removeCheckinType: (id: string) => {
    const types = get().checkinTypes.filter(t => t.id !== id);
    saveCheckinTypes(types);
    set({ checkinTypes: types });
  },

  setCurrentMonth: (year: number, month: number) => {
    set({ currentMonth: { year, month } });
  },

  hasCheckedInToday: () => {
    const today = getToday();
    return get().checkinRecords.some(r => r.date === today);
  },

  getTodayRecords: () => {
    const today = getToday();
    return get().checkinRecords.filter(r => r.date === today);
  },

  getRecordsByDate: (date: string) => {
    return get().checkinRecords.filter(r => r.date === date);
  },

  getCheckinDates: () => {
    return [...new Set(get().checkinRecords.map(r => r.date))];
  },

  getStats: () => {
    const records = get().checkinRecords;
    const checkinDates = [...new Set(records.map(r => r.date))];
    const currentStreak = calculateStreak(checkinDates);
    
    const now = new Date();
    const monthlyDates = getMonthlyDates(now.getFullYear(), now.getMonth());
    const monthlyCheckins = checkinDates.filter(d => monthlyDates.includes(d)).length;
    
    let longestStreak = 0;
    let current = 0;
    const sortedDates = checkinDates.sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        current = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          current++;
        } else {
          current = 1;
        }
      }
      longestStreak = Math.max(longestStreak, current);
    }
    
    return {
      totalCheckins: records.length,
      currentStreak,
      longestStreak,
      monthlyCheckins,
    };
  },

  getTypeById: (id: string) => {
    return get().checkinTypes.find(t => t.id === id);
  },
}));
