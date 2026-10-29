import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { ApiService } from './api.service';
import { WorkoutProgram, Exercise } from '../models/workout.models';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private api = inject(ApiService);

  getPrograms(params?: { category?: string; difficulty?: string; search?: string; sort?: string }): Observable<{ data: WorkoutProgram[]; total: number }> {
    return this.api.get<{ success: boolean; data: WorkoutProgram[]; total: number }>('workouts', params as any).pipe(
      map((res) => ({ data: res.data || [], total: res.total || 0 })),
      catchError(() => of({ data: this.getFallbackPrograms(), total: this.getFallbackPrograms().length }))
    );
  }

  getProgram(idOrSlug: string): Observable<WorkoutProgram> {
    return this.api.get<{ success: boolean; data: WorkoutProgram }>(`workouts/${idOrSlug}`).pipe(
      map((res) => res.data),
      catchError(() => {
        const found = this.getFallbackPrograms().find((p) => p.slug === idOrSlug || p._id === idOrSlug);
        if (found) return of(found);
        throw new Error('Workout program not found.');
      })
    );
  }

  getExercises(params?: { category?: string; equipment?: string; difficulty?: string; search?: string }): Observable<{ data: Exercise[]; total: number }> {
    return this.api.get<{ success: boolean; data: Exercise[]; total: number }>('exercises', params as any).pipe(
      map((res) => ({ data: res.data || [], total: res.total || 0 })),
      catchError(() => of({ data: this.getFallbackExercises(), total: this.getFallbackExercises().length }))
    );
  }

  getExercise(idOrSlug: string): Observable<Exercise> {
    return this.api.get<{ success: boolean; data: Exercise }>(`exercises/${idOrSlug}`).pipe(
      map((res) => res.data),
      catchError(() => {
        const found = this.getFallbackExercises().find((e) => e.slug === idOrSlug || e._id === idOrSlug);
        if (found) return of(found);
        throw new Error('Exercise guide not found.');
      })
    );
  }

  // Presentation-aligned fallback data for instant demo responsiveness
  private getFallbackPrograms(): WorkoutProgram[] {
    return [
      {
        _id: 'prog-1',
        name: 'Chest Annihilation & Upper Pec Sculpt',
        slug: 'chest-annihilation',
        category: 'Chest',
        difficulty: 'Advanced',
        durationMinutes: 52,
        description: 'High-intensity chest destruction engineered for upper clavicular thickness, outer sweep and maximum pectoral hypertrophy.',
        targetMuscles: ['Upper Chest', 'Mid Chest', 'Triceps'],
        equipment: ['Barbell', 'Dumbbells', 'Cables', 'Bench'],
        imageUrl: 'assets/images/image-4-1.jpg',
        isFeatured: true,
        warmup: '5 mins dynamic arm circles, light band pull-aparts, 2 warm-up sets.',
        coolDown: '5 mins doorway chest stretch and nasal parasympathetic breathing.',
        exercises: [
          { exerciseName: 'Barbell Flat Bench Press', order: 1, sets: 4, reps: '8-10', restSeconds: 90, notes: 'Heavy strength driver. Rest 90s between sets.' },
          { exerciseName: 'Incline Dumbbell Press', order: 2, sets: 4, reps: '10-12', restSeconds: 75, notes: 'Target upper shelf. 3-second negative descent.' },
          { exerciseName: 'Cable Rope Tricep Pushdown', order: 3, sets: 4, reps: '12-15', restSeconds: 60, notes: 'Flaring rope at bottom for tricep burnout.' },
          { exerciseName: 'Calisthenics Push-Up Beast', order: 4, sets: 3, reps: 'Failure', restSeconds: 45, notes: 'Finisher burn set to mechanical failure.' }
        ]
      },
      {
        _id: 'prog-2',
        name: 'V-Taper Lat Dominance & Deadlifts',
        slug: 'v-taper-lat-dominance',
        category: 'Back',
        difficulty: 'Advanced',
        durationMinutes: 55,
        description: 'Build a cobra-hood back with heavy conventional pulls, wide vertical pulldowns, and dense thickness builders.',
        targetMuscles: ['Lats', 'Erectors', 'Traps', 'Biceps'],
        equipment: ['Barbell', 'Cables', 'Platform'],
        imageUrl: 'assets/images/image-2-1.jpg',
        isFeatured: true,
        warmup: 'Cat-cow stretches, bird-dogs, glute bridges, light bar deadlifts.',
        coolDown: 'Child’s pose, hanging lat decompression from pull-up bar.',
        exercises: [
          { exerciseName: 'Conventional Barbell Deadlift', order: 1, sets: 4, reps: '6-8', restSeconds: 120, notes: 'Heavy posterior driver. Reset slack each rep.' },
          { exerciseName: 'Wide-Grip Lat Pulldown', order: 2, sets: 4, reps: '10-12', restSeconds: 75, notes: 'Drive elbows down to pockets. Squeeze lats 1 second.' },
          { exerciseName: 'EZ-Bar Preacher Curl', order: 3, sets: 4, reps: '10-12', restSeconds: 60, notes: 'Compound pulling bicep synergy.' }
        ]
      },
      {
        _id: 'prog-3',
        name: '3D Boulder Shoulders & Traps',
        slug: 'boulder-shoulders-traps',
        category: 'Shoulder',
        difficulty: 'Intermediate',
        durationMinutes: 50,
        description: 'Sculpt three-dimensional capped shoulders with military compound pressing and high-rep lateral delt isolation.',
        targetMuscles: ['Anterior Delts', 'Lateral Delts', 'Traps'],
        equipment: ['Barbell', 'Dumbbells'],
        imageUrl: 'assets/images/image-1-1.jpg',
        isFeatured: true,
        exercises: [
          { exerciseName: 'Overhead Barbell Military Press', order: 1, sets: 4, reps: '6-10', restSeconds: 90, notes: 'Strict form overhead drive.' },
          { exerciseName: 'Dumbbell Lateral Raise', order: 2, sets: 4, reps: '12-15', restSeconds: 60, notes: 'Strict lateral tension.' }
        ]
      },
      {
        _id: 'prog-4',
        name: 'Quad Sweep & Hamstring Powerhouse',
        slug: 'quad-sweep-hamstrings',
        category: 'Legs',
        difficulty: 'Advanced',
        durationMinutes: 55,
        description: 'Brutal lower body training attacking quad vastus lateralis, glute drive, and hamstring tendon resilience.',
        targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes'],
        equipment: ['Barbell', 'Rack'],
        imageUrl: 'assets/images/image-6-1.jpg',
        isFeatured: true,
        exercises: [
          { exerciseName: 'Barbell Back Squat', order: 1, sets: 4, reps: '6-10', restSeconds: 120, notes: 'King of leg lifts. Depth below parallel.' },
          { exerciseName: 'Romanian Deadlift (RDL)', order: 2, sets: 4, reps: '8-12', restSeconds: 90, notes: 'Loaded stretch on hamstrings.' }
        ]
      },
      {
        _id: 'prog-5',
        name: 'Home Calisthenics Beast',
        slug: 'home-calisthenics-beast',
        category: 'Home Workout',
        difficulty: 'Beginner',
        durationMinutes: 45,
        description: 'Zero equipment required. Master your own bodyweight with progressive push and core circuits anywhere, anytime.',
        targetMuscles: ['Chest', 'Core', 'Triceps'],
        equipment: ['None'],
        imageUrl: 'assets/images/image-4-1.jpg',
        isFeatured: true,
        exercises: [
          { exerciseName: 'Calisthenics Push-Up Beast', order: 1, sets: 4, reps: '15-20', restSeconds: 45, notes: 'Locked core, pristine tempo.' },
          { exerciseName: 'Hanging Leg Raise', order: 2, sets: 4, reps: '12-15', restSeconds: 60, notes: 'Floor or bar raises.' }
        ]
      }
    ];
  }

  private getFallbackExercises(): Exercise[] {
    return [
      {
        _id: 'ex-1',
        name: 'Barbell Flat Bench Press',
        slug: 'barbell-flat-bench-press',
        category: 'Chest',
        targetMuscles: ['Pectoralis Major', 'Anterior Deltoids'],
        secondaryMuscles: ['Triceps Brachii'],
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        instructions: [
          'Lie flat on the bench with eyes under the bar.',
          'Grip the bar slightly wider than shoulder-width, arching slightly and retracting scapulae.',
          'Lower bar with control to lower sternum.',
          'Drive feet into floor and press explosively back to lockout.'
        ],
        breathingCues: 'Inhale on descent into diaphragm; exhale past the sticking point.',
        movementCues: 'Bend the bar across your chest; tuck elbows at 45-75 degrees.',
        commonMistakes: [
          'Flaring elbows at 90 degrees.',
          'Bouncing bar off the chest.',
          'Raising glutes off the bench.'
        ],
        safetyNotes: 'Always use a thumb-around grip and power rack safety pins.',
        imageUrl: 'assets/images/image-4-1.jpg'
      },
      {
        _id: 'ex-2',
        name: 'Conventional Barbell Deadlift',
        slug: 'conventional-barbell-deadlift',
        category: 'Back',
        targetMuscles: ['Erector Spinae', 'Gluteus Maximus', 'Hamstrings', 'Lats'],
        secondaryMuscles: ['Trapezius', 'Forearms'],
        equipment: 'Barbell',
        difficulty: 'Advanced',
        instructions: [
          'Feet hip-width apart, bar over mid-foot.',
          'Hinge at hips, grip outside knees.',
          'Pull chest tall, squeeze lats, flatten spine.',
          'Push floor away with legs until lockout.'
        ],
        breathingCues: 'Deep belly breath, brace core hard, exhale at lockout.',
        movementCues: 'Leg press the floor; do not jerk with your arms.',
        commonMistakes: [
          'Rounding the lower back.',
          'Hyperextending backward at the top.'
        ],
        safetyNotes: 'Never lift with a rounded spine.',
        imageUrl: 'assets/images/image-6-1.jpg'
      },
      {
        _id: 'ex-3',
        name: 'Barbell Back Squat',
        slug: 'barbell-back-squat',
        category: 'Legs',
        targetMuscles: ['Quadriceps', 'Gluteus Maximus'],
        secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
        equipment: 'Barbell',
        difficulty: 'Advanced',
        instructions: [
          'Rest bar across upper traps.',
          'Feet slightly wider than shoulder-width, toes 15-30 degrees out.',
          'Inhale into core, hinge and descend past parallel.',
          'Drive up through whole foot.'
        ],
        breathingCues: 'Belly breath at top, brace, exhale on the way up.',
        movementCues: 'Spread the floor with your feet.',
        commonMistakes: [
          'Knees caving inward.',
          'Heels lifting off ground.'
        ],
        safetyNotes: 'Always squat in a rack with safety pins set.',
        imageUrl: 'assets/images/image-6-1.jpg'
      }
    ];
  }
}
