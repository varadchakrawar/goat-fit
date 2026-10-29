import { Injectable, inject } from '@angular/core';
import { Observable, of, tap, map, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { WeeklyPlan, DayPlan } from '../models/planner.models';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  private readonly GUEST_STORAGE_KEY = 'goatfit_guest_weekly_plan';

  getWeeklyPlan(): Observable<WeeklyPlan> {
    if (this.auth.isGuest) {
      return of(this.getGuestPlan());
    }

    return this.api.get<{ success: boolean; data: WeeklyPlan }>('planner').pipe(
      map((res) => this.computeAdherence(res.data)),
      catchError(() => of(this.getGuestPlan()))
    );
  }

  updateDay(dayIndex: number, dayData: Partial<DayPlan>): Observable<WeeklyPlan> {
    if (this.auth.isGuest) {
      const plan = this.getGuestPlan();
      if (plan.days[dayIndex]) {
        plan.days[dayIndex] = {
          ...plan.days[dayIndex],
          ...dayData,
          workoutTitle: dayData.workoutTitle || dayData.title || plan.days[dayIndex].workoutTitle,
          title: dayData.title || dayData.workoutTitle || plan.days[dayIndex].title
        };
        this.saveGuestPlan(plan);
      }
      return of(this.computeAdherence(plan));
    }

    return this.api.put<{ success: boolean; data: WeeklyPlan }>(`planner/day/${dayIndex}`, dayData).pipe(
      map((res) => this.computeAdherence(res.data))
    );
  }

  toggleDayComplete(dayIndex: number): Observable<WeeklyPlan> {
    if (this.auth.isGuest) {
      const plan = this.getGuestPlan();
      if (plan.days[dayIndex]) {
        const current = plan.days[dayIndex].completed || plan.days[dayIndex].isCompleted;
        plan.days[dayIndex].completed = !current;
        plan.days[dayIndex].isCompleted = !current;
        plan.days[dayIndex].completedAt = !current ? new Date().toISOString() : null;
        this.saveGuestPlan(plan);
      }
      return of(this.computeAdherence(plan));
    }

    return this.api.patch<{ success: boolean; data: WeeklyPlan }>(`planner/day/${dayIndex}/toggle-complete`).pipe(
      map((res) => this.computeAdherence(res.data))
    );
  }

  resetWeek(): Observable<WeeklyPlan> {
    if (this.auth.isGuest) {
      const plan = this.getGuestPlan();
      plan.days.forEach((d) => {
        d.completed = false;
        d.isCompleted = false;
        d.completedAt = null;
      });
      this.saveGuestPlan(plan);
      return of(this.computeAdherence(plan));
    }

    return this.api.post<{ success: boolean; data: WeeklyPlan }>('planner/reset-week', {}).pipe(
      map((res) => this.computeAdherence(res.data))
    );
  }

  applyTemplate(templateType: '7-day' | '6-day'): Observable<WeeklyPlan> {
    if (this.auth.isGuest) {
      const plan = templateType === '6-day' ? this.create6DayTemplate() : this.createDefault7DayPlan();
      this.saveGuestPlan(plan);
      return of(this.computeAdherence(plan));
    }

    return this.api.post<{ success: boolean; data: WeeklyPlan }>('planner/template', {
      templateType,
      templateName: templateType === '6-day' ? 'six-day' : 'default-7day'
    }).pipe(
      map((res) => this.computeAdherence(res.data))
    );
  }

  private computeAdherence(plan: WeeklyPlan): WeeklyPlan {
    const completed = plan.days ? plan.days.filter((d) => d.completed || d.isCompleted).length : 0;
    const percentage = Math.round((completed / 7) * 100);
    return {
      ...plan,
      completedCount: completed,
      adherencePercentage: percentage,
      adherencePercent: percentage
    };
  }

  private getGuestPlan(): WeeklyPlan {
    const saved = localStorage.getItem(this.GUEST_STORAGE_KEY);
    if (saved) {
      try {
        return this.computeAdherence(JSON.parse(saved));
      } catch (e) {}
    }
    const defaultPlan = this.createDefault7DayPlan();
    this.saveGuestPlan(defaultPlan);
    return this.computeAdherence(defaultPlan);
  }

  private saveGuestPlan(plan: WeeklyPlan) {
    localStorage.setItem(this.GUEST_STORAGE_KEY, JSON.stringify(plan));
  }

  public createDefault7DayPlan(): WeeklyPlan {
    return {
      templateName: '7-Day GOAT Elite Split',
      days: [
        {
          dayIndex: 0,
          dayName: 'Monday',
          title: 'Chest Annihilation & Upper Pec Sculpt',
          workoutTitle: 'Chest Annihilation & Upper Pec Sculpt',
          category: 'Chest',
          programSlug: 'chest-annihilation',
          isRestDay: false,
          completed: true,
          isCompleted: true,
          keyLifts: ['Barbell Incline Bench Press', 'Flat Barbell Bench Press', 'Cable Pec Flyes']
        },
        {
          dayIndex: 1,
          dayName: 'Tuesday',
          title: 'V-Taper Lat Dominance & Deadlifts',
          workoutTitle: 'V-Taper Lat Dominance & Deadlifts',
          category: 'Back',
          programSlug: 'v-taper-lat-dominance',
          isRestDay: false,
          completed: true,
          isCompleted: true,
          keyLifts: ['Conventional Deadlift', 'Wide-Grip Lat Pulldown', 'Barbell Bent-Over Row']
        },
        {
          dayIndex: 2,
          dayName: 'Wednesday',
          title: 'Active Recovery & Mobility',
          workoutTitle: 'Active Recovery & Mobility',
          category: 'Full Body',
          programSlug: 'active-recovery-mobility',
          isRestDay: true,
          completed: false,
          isCompleted: false,
          keyLifts: ['Thoracic Spine Foam Rolling', 'Hamstring Flossing', 'Light Incline Walk']
        },
        {
          dayIndex: 3,
          dayName: 'Thursday',
          title: '3D Boulder Shoulders & Traps',
          workoutTitle: '3D Boulder Shoulders & Traps',
          category: 'Shoulder',
          programSlug: 'boulder-shoulders-traps',
          isRestDay: false,
          completed: false,
          isCompleted: false,
          keyLifts: ['Overhead Barbell Military Press', 'Dumbbell Lateral Raises', 'Barbell Shrugs']
        },
        {
          dayIndex: 4,
          dayName: 'Friday',
          title: 'Guns Hypertrophy (Biceps & Triceps)',
          workoutTitle: 'Guns Hypertrophy (Biceps & Triceps)',
          category: 'Arms',
          programSlug: 'guns-hypertrophy',
          isRestDay: false,
          completed: false,
          isCompleted: false,
          keyLifts: ['EZ-Bar Preacher Curls', 'Close-Grip Bench Press', 'Cable Rope Tricep Pushdowns']
        },
        {
          dayIndex: 5,
          dayName: 'Saturday',
          title: 'Quad Sweep & Hamstring Powerhouse',
          workoutTitle: 'Quad Sweep & Hamstring Powerhouse',
          category: 'Legs',
          programSlug: 'quad-sweep-hamstrings',
          isRestDay: false,
          completed: false,
          isCompleted: false,
          keyLifts: ['Barbell Back Squat', 'Romanian Deadlift', 'Bulgarian Split Squat']
        },
        {
          dayIndex: 6,
          dayName: 'Sunday',
          title: 'Rest / Recovery',
          workoutTitle: 'Rest / Recovery',
          category: 'Full Body',
          programSlug: 'rest-recovery',
          isRestDay: true,
          completed: false,
          isCompleted: false,
          keyLifts: ['Complete Rest', 'Nasal Diaphragmatic Breathing', 'Hydration Optimization']
        }
      ]
    };
  }

  public create6DayTemplate(): WeeklyPlan {
    return {
      templateName: '6-Day Hypertrophy & Power Split',
      days: [
        {
          dayIndex: 0,
          dayName: 'Monday',
          title: 'Upper Body Power',
          workoutTitle: 'Upper Body Power',
          category: 'Full Body',
          programSlug: 'upper-body-power',
          isRestDay: false,
          completed: false,
          keyLifts: ['Heavy Barbell Bench', 'Weighted Pull-ups', 'Overhead Military Press']
        },
        {
          dayIndex: 1,
          dayName: 'Tuesday',
          title: 'Lower Body Hypertrophy',
          workoutTitle: 'Lower Body Hypertrophy',
          category: 'Legs',
          programSlug: 'lower-body-hypertrophy',
          isRestDay: false,
          completed: false,
          keyLifts: ['Front Squats', 'Romanian Deadlifts', 'Walking Lunges']
        },
        {
          dayIndex: 2,
          dayName: 'Wednesday',
          title: 'Active Recovery & Mobility',
          workoutTitle: 'Active Recovery & Mobility',
          category: 'Full Body',
          programSlug: 'active-recovery-mobility',
          isRestDay: true,
          completed: false,
          keyLifts: ['Light Walk', 'Foam Rolling', 'Dynamic Hip Openers']
        },
        {
          dayIndex: 3,
          dayName: 'Thursday',
          title: 'Push Hypertrophy',
          workoutTitle: 'Push Hypertrophy',
          category: 'Chest',
          programSlug: 'push-hypertrophy',
          isRestDay: false,
          completed: false,
          keyLifts: ['Incline Dumbbell Press', 'Dumbbell Lateral Raises', 'Tricep Dips']
        },
        {
          dayIndex: 4,
          dayName: 'Friday',
          title: 'Pull Hypertrophy',
          workoutTitle: 'Pull Hypertrophy',
          category: 'Back',
          programSlug: 'pull-hypertrophy',
          isRestDay: false,
          completed: false,
          keyLifts: ['Chest-Supported Rows', 'Lat Pulldowns', 'Incline Bicep Curls']
        },
        {
          dayIndex: 5,
          dayName: 'Saturday',
          title: 'Legs & Core Sculpt',
          workoutTitle: 'Legs & Core Sculpt',
          category: 'Legs',
          programSlug: 'legs-core-sculpt',
          isRestDay: false,
          completed: false,
          keyLifts: ['Leg Press', 'Hamstring Curls', 'Hanging Leg Raises']
        },
        {
          dayIndex: 6,
          dayName: 'Sunday',
          title: 'Rest & Complete Recovery',
          workoutTitle: 'Rest & Complete Recovery',
          category: 'Full Body',
          programSlug: 'rest-recovery',
          isRestDay: true,
          completed: false,
          keyLifts: ['Rest', 'Nasal Breathing', 'Hydration Focus']
        }
      ]
    };
  }
}
