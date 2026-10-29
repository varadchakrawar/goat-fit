export interface SetLog {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface SessionExercise {
  exerciseId?: string;
  exerciseName: string;
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutSession {
  _id?: string;
  user?: string;
  program?: string;
  programName: string;
  workoutTitle?: string;
  muscleGroup?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  durationMinutes: number;
  totalVolumeKg?: number;
  completed?: boolean;
  isCompleted?: boolean;
  notes?: string;
  exercises?: SessionExercise[];
  completedExercises?: SessionExercise[];
  createdAt?: string;
}

export interface SessionStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalVolumeKg: number;
  workoutsThisWeek: number;
  recentSessions: WorkoutSession[];
}
