export interface Exercise {
  _id?: string;
  name: string;
  slug: string;
  category: string;
  targetMuscles: string[];
  secondaryMuscles?: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  breathingCues?: string;
  movementCues?: string;
  commonMistakes?: string[];
  safetyNotes?: string;
  defaultSets?: number;
  defaultReps?: string;
  defaultRestSeconds?: number;
  imageUrl?: string;
}

export interface WorkoutExercise {
  exercise?: Exercise | string;
  exerciseName: string;
  order: number;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutProgram {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  category: 'Chest' | 'Back' | 'Shoulder' | 'Arms' | 'Legs' | 'Abs' | 'Full Body' | 'Home Workout';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  targetMuscles?: string[];
  equipment?: string[];
  imageUrl?: string;
  warmup?: string;
  coolDown?: string;
  exercises: WorkoutExercise[];
  isFeatured?: boolean;
  trainingObjective?: string;
}
