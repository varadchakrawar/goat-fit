import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerService } from '../../services/timer.service';

@Component({
  selector: 'app-rest-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Rest Timer Widget -->
    <div
      *ngIf="timer.isOpen()"
      class="floating-timer-container"
      [class.timer-alert]="timer.isFinished()"
      role="region"
      aria-label="Rest Period Timer"
    >
      <div class="timer-card">
        
        <!-- Header & Close -->
        <div class="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom border-secondary border-opacity-25">
          <div class="d-flex align-items-center gap-2">
            <span class="timer-pulse-dot" [class.active]="timer.isRunning()"></span>
            <span class="fw-bold text-white small text-uppercase letter-spacing-1">Rest Interval</span>
          </div>
          <button (click)="timer.dismiss()" class="timer-close-btn" aria-label="Dismiss Rest Timer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Timer Display & Progress -->
        <div class="text-center py-2">
          <div class="timer-digits font-bebas" [class.text-neon]="timer.isRunning()" [class.text-warning]="timer.isFinished()">
            {{ formatTime(timer.timeLeft()) }}
          </div>
          
          <div class="timer-progress-track mt-1 mb-2">
            <div
              class="timer-progress-bar"
              [style.width.%]="timer.progressPercentage"
              [class.bar-finished]="timer.isFinished()"
            ></div>
          </div>

          <div *ngIf="timer.isFinished()" class="finish-banner animate-bounce">
            REST COMPLETE — ATTACK NEXT SET!
          </div>
        </div>

        <!-- Preset Chips -->
        <div class="d-flex justify-content-center gap-1 mb-3">
          <button
            *ngFor="let s of [30, 60, 90, 120]"
            (click)="timer.setPreset(s)"
            class="preset-btn"
            [class.active]="timer.initialDuration() === s"
          >
            {{ s }}s
          </button>
        </div>

        <!-- Controls -->
        <div class="d-flex align-items-center justify-content-center gap-2">
          <button
            *ngIf="!timer.isRunning() && !timer.isPaused()"
            (click)="timer.start(timer.timeLeft() > 0 ? timer.timeLeft() : 60)"
            class="goat-btn-neon goat-btn-sm w-100"
          >
            Start Rest
          </button>

          <button
            *ngIf="timer.isRunning() && !timer.isPaused()"
            (click)="timer.pause()"
            class="goat-btn-outline goat-btn-sm w-50"
          >
            Pause
          </button>

          <button
            *ngIf="timer.isPaused()"
            (click)="timer.resume()"
            class="goat-btn-neon goat-btn-sm w-50"
          >
            Resume
          </button>

          <button
            (click)="timer.reset()"
            class="goat-btn-outline goat-btn-sm"
            title="Reset timer to initial seconds"
          >
            Reset
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .floating-timer-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1050;
      width: 280px;
      max-width: calc(100vw - 32px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(32, 243, 107, 0.2);
      border-radius: 16px;
      overflow: hidden;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .timer-card {
      background: var(--bg-card);
      border: 1px solid var(--accent-neon-border);
      border-radius: 16px;
      padding: 1.25rem;
    }

    .floating-timer-container.timer-alert .timer-card {
      border-color: #f59e0b;
      box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
    }

    .timer-pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-muted);
    }

    .timer-pulse-dot.active {
      background: var(--accent-neon);
      box-shadow: 0 0 10px var(--accent-neon);
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .timer-close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 2px;
      border-radius: 4px;
    }

    .timer-close-btn:hover {
      color: var(--text-white);
    }

    .timer-digits {
      font-size: 3.5rem;
      line-height: 1;
      letter-spacing: 0.05em;
    }

    .timer-progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }

    .timer-progress-bar {
      height: 100%;
      background: var(--accent-neon);
      transition: width 0.25s linear;
      box-shadow: 0 0 8px var(--accent-neon);
    }

    .timer-progress-bar.bar-finished {
      background: #f59e0b;
      box-shadow: 0 0 10px #f59e0b;
    }

    .finish-banner {
      font-size: 0.75rem;
      font-weight: 800;
      color: #f59e0b;
      letter-spacing: 0.05em;
    }

    .preset-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-subtle);
      color: var(--text-soft);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .preset-btn:hover, .preset-btn.active {
      border-color: var(--accent-neon);
      color: var(--accent-neon);
      background: rgba(32, 243, 107, 0.12);
    }
  `]
})
export class RestTimerComponent {
  public timer = inject(TimerService);

  formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
