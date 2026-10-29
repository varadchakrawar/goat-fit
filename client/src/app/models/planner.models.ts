import { WorkoutProgram } from './workout.models';

export interface DayPlan {
  dayIndex: number; // 0 = Monday, 6 = Sunday
  dayName: string;
  dayOfWeek?: string;
  title: string;
  workoutTitle?: string;
  category: string;
  program?: WorkoutProgram | string | null;
  programSlug?: string;
  isRestDay: boolean;
  completed?: boolean;
  isCompleted?: boolean;
  completedAt?: string | Date | null;
  notes?: string;
  keyLifts?: string[];
}

export interface WeeklyPlan {
  _id?: string;
  user?: string;
  templateName: string;
  weekStartDate?: string;
  days: DayPlan[];
  completedCount?: number;
  completedDaysCount?: number;
  adherencePercentage?: number;
  adherencePercent?: number;
}
