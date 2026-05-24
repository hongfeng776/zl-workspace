import { CheckinType, CheckinRecord } from '@/types';
import { defaultCheckinTypes } from '@/data/defaultTypes';

const TYPES_KEY = 'easycheck_types';
const RECORDS_KEY = 'easycheck_records';

export const getCheckinTypes = (): CheckinType[] => {
  try {
    const stored = localStorage.getItem(TYPES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultCheckinTypes;
  } catch {
    return defaultCheckinTypes;
  }
};

export const saveCheckinTypes = (types: CheckinType[]): void => {
  localStorage.setItem(TYPES_KEY, JSON.stringify(types));
};

export const getCheckinRecords = (): CheckinRecord[] => {
  try {
    const stored = localStorage.getItem(RECORDS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch {
    return [];
  }
};

export const saveCheckinRecords = (records: CheckinRecord[]): void => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
};

export const addCheckinRecord = (record: CheckinRecord): CheckinRecord[] => {
  const records = getCheckinRecords();
  records.push(record);
  saveCheckinRecords(records);
  return records;
};

export const deleteCheckinRecord = (recordId: string): CheckinRecord[] => {
  const records = getCheckinRecords().filter(r => r.id !== recordId);
  saveCheckinRecords(records);
  return records;
};

export const clearAllData = (): void => {
  localStorage.removeItem(TYPES_KEY);
  localStorage.removeItem(RECORDS_KEY);
};
