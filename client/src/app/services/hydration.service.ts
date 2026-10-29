import { Injectable, inject } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { HydrationLog } from '../models/hydration.models';

@Injectable({
  providedIn: 'root'
})
export class HydrationService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  private readonly GUEST_STORAGE_KEY = 'goatfit_guest_hydration';
  private readonly GUEST_HISTORY_KEY = 'goatfit_guest_hydration_history';

  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTodayHydration(): Observable<HydrationLog> {
    if (this.auth.isGuest) {
      return of(this.getGuestTodayLog());
    }

    return this.api.get<{ success: boolean; data: HydrationLog }>('hydration/today').pipe(
      map((res) => this.calculateVirtuals(res.data)),
      catchError(() => of(this.getGuestTodayLog()))
    );
  }

  logWater(amountMl: number = 250): Observable<HydrationLog> {
    if (this.auth.isGuest) {
      const log = this.getGuestTodayLog();
      log.totalMl += amountMl;
      const gVol = log.glassVolumeMl || 250;
      log.glasses = Math.round(log.totalMl / gVol);
      log.glassesLogged = log.glasses;
      log.history = log.history || [];
      log.history.push({
        amountMl,
        timestamp: new Date().toISOString(),
        action: 'add'
      });
      this.saveGuestTodayLog(log);
      return of(this.calculateVirtuals(log));
    }

    return this.api.post<{ success: boolean; data: HydrationLog }>('hydration/log', {
      amountMl,
      volumeMl: amountMl
    }).pipe(
      map((res) => this.calculateVirtuals(res.data))
    );
  }

  removeWater(amountMl: number = 250): Observable<HydrationLog> {
    if (this.auth.isGuest) {
      const log = this.getGuestTodayLog();
      log.totalMl = Math.max(0, log.totalMl - amountMl);
      const gVol = log.glassVolumeMl || 250;
      log.glasses = Math.max(0, Math.round(log.totalMl / gVol));
      log.glassesLogged = log.glasses;
      log.history = log.history || [];
      log.history.push({
        amountMl,
        timestamp: new Date().toISOString(),
        action: 'remove'
      });
      this.saveGuestTodayLog(log);
      return of(this.calculateVirtuals(log));
    }

    return this.api.post<{ success: boolean; data: HydrationLog }>('hydration/remove', {
      amountMl,
      volumeMl: amountMl
    }).pipe(
      map((res) => this.calculateVirtuals(res.data))
    );
  }

  updateGoal(goalMl: number): Observable<HydrationLog> {
    if (this.auth.isGuest) {
      const log = this.getGuestTodayLog();
      log.goalMl = goalMl;
      log.dailyGoalMl = goalMl;
      this.saveGuestTodayLog(log);
      return of(this.calculateVirtuals(log));
    }

    return this.api.put<{ success: boolean; data: HydrationLog }>('hydration/goal', {
      goalMl,
      dailyGoalMl: goalMl
    }).pipe(
      map((res) => this.calculateVirtuals(res.data))
    );
  }

  getHydrationHistory(): Observable<HydrationLog[]> {
    if (this.auth.isGuest) {
      const historyStr = localStorage.getItem(this.GUEST_HISTORY_KEY);
      const history: HydrationLog[] = historyStr ? JSON.parse(historyStr) : [this.getGuestTodayLog()];
      return of(history.map((h) => this.calculateVirtuals(h)));
    }

    return this.api.get<{ success: boolean; data: HydrationLog[] }>('hydration/history').pipe(
      map((res) => (res.data || []).map((h) => this.calculateVirtuals(h))),
      catchError(() => of([this.getGuestTodayLog()]))
    );
  }

  private calculateVirtuals(log: HydrationLog): HydrationLog {
    const goal = log.goalMl || log.dailyGoalMl || 2000;
    const total = log.totalMl || 0;
    const percentage = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;
    const remaining = Math.max(0, goal - total);
    const gCount = log.glasses !== undefined ? log.glasses : log.glassesLogged || Math.round(total / 250);

    return {
      ...log,
      goalMl: goal,
      dailyGoalMl: goal,
      totalMl: total,
      glasses: gCount,
      glassesLogged: gCount,
      percentage,
      remainingMl: remaining
    };
  }

  private getGuestTodayLog(): HydrationLog {
    const todayStr = this.getTodayString();
    const saved = localStorage.getItem(this.GUEST_STORAGE_KEY);

    if (saved) {
      try {
        const parsed: HydrationLog = JSON.parse(saved);
        // Midnight reset check: if stored date is not today, archive previous day to history!
        if (parsed.dateString === todayStr || parsed.dateKey === todayStr) {
          return this.calculateVirtuals(parsed);
        } else {
          this.archiveToGuestHistory(parsed);
        }
      } catch (e) {}
    }

    const freshLog: HydrationLog = {
      dateString: todayStr,
      dateKey: todayStr,
      glasses: 4, // 1000ml starter for guest preview
      glassesLogged: 4,
      totalMl: 1000,
      goalMl: 2000,
      dailyGoalMl: 2000,
      glassVolumeMl: 250,
      history: []
    };
    this.saveGuestTodayLog(freshLog);
    return this.calculateVirtuals(freshLog);
  }

  private saveGuestTodayLog(log: HydrationLog) {
    localStorage.setItem(this.GUEST_STORAGE_KEY, JSON.stringify(log));
  }

  private archiveToGuestHistory(oldLog: HydrationLog) {
    try {
      const historyStr = localStorage.getItem(this.GUEST_HISTORY_KEY);
      const history: HydrationLog[] = historyStr ? JSON.parse(historyStr) : [];
      history.unshift(oldLog);
      localStorage.setItem(this.GUEST_HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
    } catch (e) {}
  }
}
