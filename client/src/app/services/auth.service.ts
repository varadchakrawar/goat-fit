import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { User, AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../models/auth.models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isGuestSubject = new BehaviorSubject<boolean>(false);
  public isGuest$ = this.isGuestSubject.asObservable();

  // Angular Signals for modern reactive templates
  public currentUserSig = signal<User | null>(null);
  public isGuestSig = signal<boolean>(false);

  constructor() {
    this.initAuthState();
  }

  private initAuthState() {
    const savedUser = localStorage.getItem('goatfit_user');
    const token = localStorage.getItem('goatfit_token');
    const isGuest = localStorage.getItem('goatfit_guest_mode') === 'true';

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        this.currentUserSig.set(user);
        this.isGuestSubject.next(false);
        this.isGuestSig.set(false);

        // Verify with server in background
        this.refreshCurrentUser().subscribe();
      } catch (e) {
        this.clearAuth();
      }
    } else if (isGuest) {
      this.setGuestState(true);
    }
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  public get isGuest(): boolean {
    return this.isGuestSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', credentials).pipe(
      tap((res) => {
        if (res.success && res.token && res.user) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', data).pipe(
      tap((res) => {
        if (res.success && res.token && res.user) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  logout() {
    this.api.post('auth/logout', {}).subscribe({
      next: () => this.clearAuth(),
      error: () => this.clearAuth()
    });
  }

  enterGuestMode() {
    this.clearAuth();
    this.setGuestState(true);
    this.router.navigate(['/dashboard']);
  }

  enableGuestMode() {
    this.enterGuestMode();
  }

  exitGuestMode() {
    this.setGuestState(false);
    this.router.navigate(['/auth']);
  }

  updateProfile(nameOrData?: string | { name?: string; fitnessProfile?: any; profile?: any }, profileData?: UserProfile): Observable<any> {
    let name: string | undefined;
    let profile: any = profileData;

    if (typeof nameOrData === 'object' && nameOrData !== null) {
      name = nameOrData.name;
      profile = nameOrData.fitnessProfile || nameOrData.profile || profileData;
    } else {
      name = nameOrData;
    }

    if (this.isGuest) {
      // Update guest local state
      const guestUser: User = {
        name: name || 'Demo Athlete',
        email: 'guest@goatfit.demo',
        role: 'user',
        profile: {
          ...this.getGuestProfile(),
          ...profile
        }
      };
      localStorage.setItem('goatfit_guest_profile', JSON.stringify(guestUser.profile));
      return of({ success: true, user: guestUser });
    }

    return this.api.put<any>('auth/profile', { name, fitnessProfile: profile, profile }).pipe(
      tap((res) => {
        if (res.success && res.user) {
          this.updateLocalUser(res.user);
        }
      })
    );
  }

  refreshCurrentUser(): Observable<any> {
    return this.api.get<any>('auth/me').pipe(
      tap((res) => {
        if (res.success && res.user) {
          this.updateLocalUser(res.user);
        }
      }),
      catchError((err) => {
        if (err.status === 401) {
          this.clearAuth();
        }
        return of(null);
      })
    );
  }

  public getGuestProfile(): UserProfile {
    const saved = localStorage.getItem('goatfit_guest_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      age: 23,
      gender: 'male',
      heightCm: 178,
      weightKg: 78,
      activityLevel: 'moderate',
      fitnessGoal: 'gain',
      experienceLevel: 'intermediate',
      preferredSplit: '7-day'
    };
  }

  private setSession(token: string, user: User) {
    localStorage.setItem('goatfit_token', token);
    localStorage.setItem('goatfit_user', JSON.stringify(user));
    localStorage.removeItem('goatfit_guest_mode');
    this.currentUserSubject.next(user);
    this.currentUserSig.set(user);
    this.isGuestSubject.next(false);
    this.isGuestSig.set(false);
  }

  private updateLocalUser(user: User) {
    localStorage.setItem('goatfit_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.currentUserSig.set(user);
  }

  private setGuestState(isGuest: boolean) {
    if (isGuest) {
      localStorage.setItem('goatfit_guest_mode', 'true');
      const guestUser: User = {
        name: 'Guest Athlete (Demo Mode)',
        email: 'guest@goatfit.demo',
        role: 'user',
        profile: this.getGuestProfile()
      };
      this.currentUserSubject.next(guestUser);
      this.currentUserSig.set(guestUser);
    } else {
      localStorage.removeItem('goatfit_guest_mode');
      this.currentUserSubject.next(null);
      this.currentUserSig.set(null);
    }
    this.isGuestSubject.next(isGuest);
    this.isGuestSig.set(isGuest);
  }

  private clearAuth() {
    localStorage.removeItem('goatfit_token');
    localStorage.removeItem('goatfit_user');
    localStorage.removeItem('goatfit_guest_mode');
    this.currentUserSubject.next(null);
    this.currentUserSig.set(null);
    this.isGuestSubject.next(false);
    this.isGuestSig.set(false);
  }
}
