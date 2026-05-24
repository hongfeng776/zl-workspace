export interface CheckinType {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isDefault: boolean;
}

export interface CheckinRecord {
  id: string;
  typeId: string;
  date: string;
  time: string;
  note?: string;
  timestamp: number;
}

export interface CheckinStats {
  totalCheckins: number;
  currentStreak: number;
  longestStreak: number;
  monthlyCheckins: number;
}
