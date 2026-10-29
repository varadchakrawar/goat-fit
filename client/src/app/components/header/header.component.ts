import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="goat-header sticky-top">
      <div class="container-fluid px-lg-4">
        <div class="d-flex align-items-center justify-content-between py-2">
          
          <!-- Logo & Brand -->
          <a routerLink="/" class="d-flex align-items-center gap-2 text-decoration-none brand-link">
            <div class="brand-logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#20F36B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="#20F36B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 2V15" stroke="#20F36B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <div class="brand-name font-bebas">GOAT <span class="text-neon">FIT</span></div>
              <div class="brand-tagline">BE YOUR OWN GOAT</div>
            </div>
          </a>

          <!-- Desktop Navigation -->
          <nav class="d-none d-xl-flex align-items-center gap-1 nav-links-container">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-pill">Home</a>
            <a routerLink="/workouts" routerLinkActive="active" class="nav-pill">Workouts</a>
            <a routerLink="/exercises" routerLinkActive="active" class="nav-pill">Exercises</a>
            <a routerLink="/planner" routerLinkActive="active" class="nav-pill">Weekly Split</a>
            <a routerLink="/nutrition" routerLinkActive="active" class="nav-pill">Nutrition & TDEE</a>
            <a routerLink="/hydration" routerLinkActive="active" class="nav-pill">Hydration</a>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-pill">Dashboard</a>
          </nav>

          <!-- Action Controls & Rest Timer Trigger -->
          <div class="d-flex align-items-center gap-2">
            
            <!-- Global Rest Timer Trigger -->
            <button
              (click)="timer.toggleOpen()"
              class="timer-trigger-btn"
              [class.timer-running]="timer.isRunning()"
              title="Toggle Rest Timer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="d-none d-sm-inline">Timer</span>
              <span *ngIf="timer.isRunning()" class="timer-badge">{{ timer.timeLeft() }}s</span>
            </button>

            <!-- User Auth State or Demo Mode -->
            <ng-container *ngIf="auth.currentUserSig() as user; else loggedOutView">
              <div class="dropdown">
                <button class="user-profile-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <div class="avatar-circle">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="d-none d-md-inline user-name-label text-truncate" style="max-width: 110px;">
                    {{ user.name }}
                  </span>
                  <span *ngIf="auth.isGuestSig()" class="badge-guest-pill">DEMO</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end goat-dropdown">
                  <li class="px-3 py-2 border-bottom border-secondary border-opacity-25">
                    <div class="fw-bold text-white small">{{ user.name }}</div>
                    <div class="text-muted small text-truncate" style="max-width: 200px;">{{ user.email }}</div>
                    <div *ngIf="auth.isGuestSig()" class="mt-1">
                      <span class="badge bg-warning text-dark" style="font-size: 0.65rem;">Guest Demo Session</span>
                    </div>
                  </li>
                  <li><a class="dropdown-item" routerLink="/dashboard">Athlete Dashboard</a></li>
                  <li><a class="dropdown-item" routerLink="/planner">My Weekly Split</a></li>
                  <li><a class="dropdown-item" routerLink="/hydration">Hydration Log</a></li>
                  <li><a class="dropdown-item" routerLink="/nutrition">My Macro Profile</a></li>
                  <li><hr class="dropdown-divider border-secondary border-opacity-25"></li>
                  <li>
                    <button *ngIf="auth.isGuestSig()" (click)="auth.exitGuestMode()" class="dropdown-item text-warning">
                      Create Real Account
                    </button>
                    <button *ngIf="!auth.isGuestSig()" (click)="auth.logout()" class="dropdown-item text-danger">
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </ng-container>

            <ng-template #loggedOutView>
              <div class="d-flex align-items-center gap-2">
                <button (click)="auth.enterGuestMode()" class="guest-btn d-none d-sm-inline-flex" title="Explore without creating account">
                  Guest Demo
                </button>
                <a routerLink="/auth" class="goat-btn-neon goat-btn-sm text-decoration-none">
                  Sign In
                </a>
              </div>
            </ng-template>

            <!-- Mobile Hamburger Toggle -->
            <button
              class="mobile-nav-toggle d-xl-none"
              (click)="toggleMobileMenu()"
              aria-label="Toggle navigation"
            >
              <svg *ngIf="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              <svg *ngIf="mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

        </div>

        <!-- Mobile Drawer Menu -->
        <div *ngIf="mobileMenuOpen" class="mobile-drawer d-xl-none py-3 border-top border-secondary border-opacity-25">
          <nav class="d-flex flex-column gap-2">
            <a routerLink="/" (click)="mobileMenuOpen = false" class="mobile-nav-link">Home</a>
            <a routerLink="/workouts" (click)="mobileMenuOpen = false" class="mobile-nav-link">Workouts Catalogue</a>
            <a routerLink="/exercises" (click)="mobileMenuOpen = false" class="mobile-nav-link">Exercise Library</a>
            <a routerLink="/planner" (click)="mobileMenuOpen = false" class="mobile-nav-link">Weekly Split Planner</a>
            <a routerLink="/nutrition" (click)="mobileMenuOpen = false" class="mobile-nav-link">Nutrition & TDEE Calculator</a>
            <a routerLink="/hydration" (click)="mobileMenuOpen = false" class="mobile-nav-link">Hydration Tracker</a>
            <a routerLink="/dashboard" (click)="mobileMenuOpen = false" class="mobile-nav-link">Athlete Dashboard</a>
            <div class="pt-2 border-top border-secondary border-opacity-25 d-flex gap-2">
              <button *ngIf="!auth.isAuthenticated" (click)="auth.enterGuestMode(); mobileMenuOpen = false" class="goat-btn-outline goat-btn-sm w-100">
                Explore Demo Mode
              </button>
            </div>
          </nav>
        </div>

      </div>
    </header>
  `,
  styles: [`
    .goat-header {
      background: rgba(8, 10, 9, 0.94);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      z-index: 1040;
    }

    .brand-link:hover .brand-logo-icon {
      transform: scale(1.05);
      filter: drop-shadow(0 0 10px rgba(32, 243, 107, 0.5));
    }

    .brand-logo-icon {
      transition: transform 0.2s ease, filter 0.2s ease;
    }

    .brand-name {
      font-size: 1.6rem;
      line-height: 1;
      letter-spacing: 0.04em;
      color: var(--text-white);
    }

    .brand-tagline {
      font-size: 0.625rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.15em;
    }

    .nav-pill {
      color: var(--text-soft);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .nav-pill:hover {
      color: var(--accent-neon);
      background: rgba(32, 243, 107, 0.08);
    }

    .nav-pill.active {
      color: var(--text-dark);
      background: var(--accent-neon);
      box-shadow: 0 0 15px rgba(32, 243, 107, 0.35);
    }

    .curriculum-pill {
      border: 1px dashed var(--accent-neon-border);
      color: var(--accent-neon);
    }

    .curriculum-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent-neon);
      margin-right: 4px;
      animation: pulseGlow 1.5s infinite;
    }

    .timer-trigger-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-soft);
      font-size: 0.825rem;
      font-weight: 600;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .timer-trigger-btn:hover {
      border-color: var(--accent-neon);
      color: var(--accent-neon);
    }

    .timer-trigger-btn.timer-running {
      border-color: var(--accent-neon);
      color: var(--accent-neon);
      background: rgba(32, 243, 107, 0.12);
      box-shadow: 0 0 12px rgba(32, 243, 107, 0.3);
    }

    .timer-badge {
      background: var(--accent-neon);
      color: var(--text-dark);
      font-weight: 800;
      font-size: 0.725rem;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
    }

    .guest-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-subtle);
      color: var(--text-soft);
      font-size: 0.825rem;
      font-weight: 600;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .guest-btn:hover {
      border-color: var(--accent-neon);
      color: var(--text-white);
    }

    .user-profile-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      color: var(--text-white);
      padding: 0.3rem 0.6rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .avatar-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--accent-neon);
      color: var(--text-dark);
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
    }

    .badge-guest-pill {
      background: #f59e0b;
      color: #080A09;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }

    .goat-dropdown {
      background: var(--bg-card);
      border: 1px solid var(--border-card);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
    }

    .mobile-nav-toggle {
      background: none;
      border: 1px solid var(--border-card);
      color: var(--text-white);
      border-radius: 8px;
      padding: 0.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .mobile-nav-link {
      color: var(--text-soft);
      text-decoration: none;
      font-size: 1rem;
      font-weight: 600;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
    }

    .mobile-nav-link:hover {
      background: rgba(32, 243, 107, 0.08);
      color: var(--accent-neon);
    }
  `]
})
export class HeaderComponent {
  public auth = inject(AuthService);
  public timer = inject(TimerService);
  public mobileMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
