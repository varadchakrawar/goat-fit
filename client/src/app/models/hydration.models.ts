export interface HydrationEntry {
  amountMl: number;
  timestamp: string | Date;
  action?: 'add' | 'remove';
}

export interface HydrationLog {
  _id?: string;
  user?: string;
  dateKey?: string;
  dateString?: string;
  glassesLogged?: number;
  glasses?: number;
  totalMl: number;
  dailyGoalMl?: number;
  goalMl?: number;
  glassVolumeMl?: number;
  entries?: HydrationEntry[];
  history?: HydrationEntry[];
  percentage?: number;
  remainingMl?: number;
}
