import { Injectable, inject } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { WorkoutSession, SessionStats } from '../models/session.models';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  private readonly GUEST_STORAGE_KEY = 'goatfit_guest_sessions';

  recordSession(sessionData: Partial<WorkoutSession>): Observable<{ success: boolean; data: WorkoutSession }> {
    if (this.auth.isGuest) {
      const guestSession: WorkoutSession = {
        _id: 'guest-session-' + Date.now(),
        programName: sessionData.programName || sessionData.workoutTitle || 'Custom Workout',
        workoutTitle: sessionData.workoutTitle || sessionData.programName || 'Custom Workout',
        durationMinutes: sessionData.durationMinutes || 45,
        totalVolumeKg: sessionData.totalVolumeKg || 0,
        completed: true,
        isCompleted: true,
        notes: sessionData.notes || '',
        exercises: sessionData.exercises || sessionData.completedExercises || [],
        completedExercises: sessionData.completedExercises || sessionData.exercises || [],
        createdAt: new Date().toISOString()
      };

      const existing = this.getGuestSessions();
      existing.unshift(guestSession);
      localStorage.setItem(this.GUEST_STORAGE_KEY, JSON.stringify(existing));
      return of({ success: true, data: guestSession });
    }

    return this.api.post<{ success: boolean; data: WorkoutSession }>('sessions', sessionData);
  }

  getSessions(params?: { page?: number; limit?: number }): Observable<{ data: WorkoutSession[]; total: number }> {
    if (this.auth.isGuest) {
      const list = this.getGuestSessions();
      return of({ data: list, total: list.length });
    }

    return this.api.get<{ success: boolean; data: WorkoutSession[]; total: number }>('sessions', params as any).pipe(
      map((res) => ({ data: res.data || [], total: res.total || 0 })),
      catchError(() => {
        const list = this.getGuestSessions();
        return of({ data: list, total: list.length });
      })
    );
  }

  getStats(): Observable<SessionStats> {
    if (this.auth.isGuest) {
      return of(this.computeGuestStats());
    }

    return this.api.get<{ success: boolean; data: SessionStats }>('sessions/stats').pipe(
      map((res) => res.data),
      catchError(() => of(this.computeGuestStats()))
    );
  }

  private getGuestSessions(): WorkoutSession[] {
    const saved = localStorage.getItem(this.GUEST_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }

    const initialGuestSessions: WorkoutSession[] = [
      {
        _id: 'demo-s1',
        programName: 'Chest Annihilation & Upper Pec Sculpt',
        workoutTitle: 'Chest Annihilation & Upper Pec Sculpt',
        durationMinutes: 52,
        totalVolumeKg: 4680,
        completed: true,
        isCompleted: true,
        notes: 'Pristine top set on incline press. Chest pump was otherworldly.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        _id: 'demo-s2',
        programName: 'V-Taper Lat Dominance & Deadlifts',
        workoutTitle: 'V-Taper Lat Dominance & Deadlifts',
        durationMinutes: 55,
        totalVolumeKg: 6240,
        completed: true,
        isCompleted: true,
        notes: 'Deadlifts moved effortlessly at 150kg. Strict lockout.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];
    localStorage.setItem(this.GUEST_STORAGE_KEY, JSON.stringify(initialGuestSessions));
    return initialGuestSessions;
  }

  private computeGuestStats(): SessionStats {
    const sessions = this.getGuestSessions();
    const totalWorkouts = sessions.length;
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalVolumeKg = sessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);

    return {
      totalWorkouts,
      totalMinutes,
      totalVolumeKg,
      workoutsThisWeek: sessions.length,
      recentSessions: sessions.slice(0, 5)
    };
  }
}
