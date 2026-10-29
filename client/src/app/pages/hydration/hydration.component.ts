import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HydrationService } from '../../services/hydration.service';
import { AuthService } from '../../services/auth.service';
import { HydrationLog } from '../../models/hydration.models';

@Component({
  selector: 'app-hydration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hydration-page py-5">
      <div class="container">
        <!-- Header Banner -->
        <div class="row align-items-center mb-5">
          <div class="col-lg-8">
            <span class="badge bg-primary-subtle text-primary border border-primary px-3 py-2 mb-2 text-uppercase fw-bold tracking-wider">
              <i class="bi bi-droplet-fill me-1"></i> Athletic Hydration Matrix
            </span>
            <h1 class="display-4 fw-black text-white text-uppercase tracking-tight mb-2">
              WATER FUEL <span class="text-primary">&amp; RECOVERY</span>
            </h1>
            <p class="text-secondary lead mb-0">
              Optimal cellular hydration amplifies muscular pump, speeds lactic acid clearance, and sustains peak anaerobic output.
            </p>
          </div>
          <div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <div *ngIf="auth.isGuest" class="alert alert-dark border-secondary d-inline-flex align-items-center mb-0 p-2">
              <i class="bi bi-info-circle text-warning me-2 fs-5"></i>
              <div class="text-start">
                <small class="d-block text-white fw-bold">Demo Mode Active</small>
                <small class="text-secondary">Tracking saved locally in browser</small>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Main Tracking Card -->
          <div class="col-lg-7">
            <div class="card bg-card border-secondary h-100 shadow-lg">
              <div class="card-body p-4 p-md-5">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h3 class="card-title text-white fw-bold mb-0">
                    <i class="bi bi-water text-primary me-2"></i> Today's Intake
                  </h3>
                  <span class="text-secondary small">{{ todayDisplay }}</span>
                </div>

                <!-- Big Circular / Metric Summary -->
                <div class="row align-items-center mb-5 g-4">
                  <div class="col-sm-6 text-center text-sm-start">
                    <div class="display-3 fw-black text-primary mb-0 font-monospace">
                      {{ todayLog.totalMl }} <span class="fs-4 text-secondary">ml</span>
                    </div>
                    <div class="text-white fw-semibold mb-1">
                      Goal: {{ todayLog.dailyGoalMl || todayLog.goalMl || 2000 }} ml
                    </div>
                    <div class="text-secondary small">
                      <span *ngIf="(todayLog.remainingMl || 0) > 0" class="text-warning">
                        <i class="bi bi-exclamation-circle me-1"></i> {{ todayLog.remainingMl }} ml remaining
                      </span>
                      <span *ngIf="(todayLog.remainingMl || 0) <= 0" class="text-success fw-bold">
                        <i class="bi bi-check-circle-fill me-1"></i> Goal Achieved! Peak Hydration!
                      </span>
                    </div>
                  </div>

                  <div class="col-sm-6 text-center">
                    <div class="circular-progress-wrap mx-auto">
                      <div class="progress-circle" [style.--percent]="(todayLog.percentage || 0) + '%'">
                        <div class="circle-inner">
                          <span class="fs-2 fw-black text-white font-monospace">{{ todayLog.percentage || 0 }}%</span>
                          <span class="small text-secondary">of target</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 8-Glass Visual Grid -->
                <div class="glass-section mb-4 p-4 rounded-3 bg-dark border border-secondary">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="text-white fw-bold mb-0">
                      Standard 250ml Glasses ({{ glassesFilled }}/{{ totalGlassesTarget }})
                    </h5>
                    <small class="text-secondary">Click glass to toggle/log</small>
                  </div>

                  <div class="row row-cols-4 row-cols-sm-4 row-cols-md-8 g-3 text-center">
                    <div class="col" *ngFor="let g of glassList; let i = index">
                      <button 
                        type="button"
                        class="glass-btn btn w-100 p-2 position-relative"
                        [class.filled]="i < glassesFilled"
                        [class.btn-outline-secondary]="i >= glassesFilled"
                        [class.btn-success]="i < glassesFilled"
                        (click)="onGlassClick(i)"
                        [title]="'Glass ' + (i + 1) + ' (250 ml)'"
                      >
                        <i class="bi bi-cup-straw fs-2 d-block mb-1"></i>
                        <span class="badge" [class.bg-dark]="i < glassesFilled" [class.bg-secondary]="i >= glassesFilled">
                          #{{ i + 1 }}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Quick Action Buttons -->
                <div class="quick-actions mb-4">
                  <label class="form-label text-secondary small fw-bold text-uppercase">Quick Volume Actions</label>
                  <div class="d-flex flex-wrap gap-2">
                    <button class="btn btn-primary fw-bold px-3 py-2" (click)="addWater(250)" [disabled]="loading">
                      <i class="bi bi-plus-lg me-1"></i> +1 Glass (250ml)
                    </button>
                    <button class="btn btn-outline-primary fw-bold px-3 py-2" (click)="addWater(100)" [disabled]="loading">
                      <i class="bi bi-plus-lg me-1"></i> +100 ml
                    </button>
                    <button class="btn btn-outline-primary fw-bold px-3 py-2" (click)="addWater(500)" [disabled]="loading">
                      <i class="bi bi-plus-lg me-1"></i> +500 ml Bottle
                    </button>
                    <button class="btn btn-outline-danger px-3 py-2 ms-auto" (click)="undoWater(250)" [disabled]="loading || todayLog.totalMl <= 0">
                      <i class="bi bi-arrow-counterclockwise me-1"></i> Undo Glass
                    </button>
                  </div>
                </div>

                <!-- Goal Setting Form -->
                <div class="goal-adjust p-3 bg-dark rounded border border-secondary">
                  <form (ngSubmit)="saveGoal()" class="row g-2 align-items-center">
                    <div class="col-auto">
                      <label class="text-white small fw-bold"><i class="bi bi-sliders me-1"></i> Daily Target:</label>
                    </div>
                    <div class="col-sm-4">
                      <div class="input-group input-group-sm">
                        <input 
                          type="number" 
                          class="form-control bg-black text-white border-secondary" 
                          [(ngModel)]="newGoalMl" 
                          name="newGoalMl"
                          min="1000" 
                          max="8000" 
                          step="100"
                        />
                        <span class="input-group-text bg-secondary border-secondary text-white">ml</span>
                      </div>
                    </div>
                    <div class="col-auto">
                      <button type="submit" class="btn btn-sm btn-outline-light" [disabled]="loading">
                        Update Target
                      </button>
                    </div>
                    <div class="col-12 mt-1" *ngIf="goalMessage">
                      <small class="text-success"><i class="bi bi-check me-1"></i>{{ goalMessage }}</small>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>

          <!-- Hydration Intelligence & History Sidebar -->
          <div class="col-lg-5">
            <!-- Athletic Science Card -->
            <div class="card bg-card border-secondary mb-4 shadow">
              <div class="card-body p-4">
                <h4 class="text-white fw-bold mb-3">
                  <i class="bi bi-lightning-charge-fill text-warning me-2"></i> Athletic Water Rules
                </h4>
                <ul class="list-unstyled text-secondary small mb-3 space-y-2">
                  <li class="mb-2">
                    <strong class="text-white">Pre-Workout:</strong> Ingest 500ml of water 2 hours prior to lifting to ensure maximal cellular volume and synovial joint lubrication.
                  </li>
                  <li class="mb-2">
                    <strong class="text-white">Intra-Workout:</strong> Sip 200–300ml every 15–20 minutes during intense sets to prevent heart rate elevation and electrolyte depletion.
                  </li>
                  <li class="mb-2">
                    <strong class="text-white">Post-Workout:</strong> Consume 1.5x of weight lost in sweat over the subsequent 2 hours.
                  </li>
                </ul>

                <div class="alert alert-secondary bg-dark border-secondary text-secondary small mb-0">
                  <i class="bi bi-shield-exclamation text-warning me-1"></i>
                  <strong>Clinical Notice:</strong> Hydration needs vary according to ambient temperature, humidity, sweat rate, body mass, and training volume.
                </div>
              </div>
            </div>

            <!-- 7-Day History Card -->
            <div class="card bg-card border-secondary shadow">
              <div class="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
                <h5 class="text-white fw-bold mb-0">
                  <i class="bi bi-calendar3 me-2 text-primary"></i> Recent Intake Logs
                </h5>
                <button class="btn btn-sm btn-outline-secondary" (click)="loadHistory()">
                  <i class="bi bi-arrow-clockwise"></i>
                </button>
              </div>
              <div class="card-body p-0">
                <div *ngIf="historyLogs.length === 0" class="p-4 text-center text-secondary small">
                  No historical records recorded yet. Start logging above!
                </div>
                <div class="list-group list-group-flush" *ngIf="historyLogs.length > 0">
                  <div *ngFor="let item of historyLogs" class="list-group-item bg-transparent border-secondary text-white py-3 px-4">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <span class="fw-bold">{{ item.dateKey || item.dateString || 'Today' }}</span>
                      <span class="badge" [class.bg-success]="(item.percentage || 0) >= 100" [class.bg-secondary]="(item.percentage || 0) < 100">
                        {{ item.totalMl }} ml ({{ item.percentage || 0 }}%)
                      </span>
                    </div>
                    <div class="progress bg-dark" style="height: 6px;">
                      <div 
                        class="progress-bar bg-primary" 
                        role="progressbar" 
                        [style.width]="(item.percentage || 0) + '%'"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hydration-page {
      min-height: 80vh;
      background-color: var(--goat-black, #080A09);
    }
    .bg-card {
      background-color: var(--goat-charcoal, #101411);
    }
    .circular-progress-wrap {
      width: 140px;
      height: 140px;
    }
    .progress-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(var(--goat-green, #20F36B) var(--percent, 0%), #1c241e var(--percent, 0%));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(32, 243, 107, 0.2);
    }
    .circle-inner {
      width: 110px;
      height: 110px;
      background-color: var(--goat-charcoal, #101411);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .glass-btn {
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border-radius: 8px;
    }
    .glass-btn.filled {
      background-color: rgba(32, 243, 107, 0.2);
      border: 1px solid var(--goat-green, #20F36B);
      color: var(--goat-green, #20F36B);
    }
    .glass-btn:hover {
      transform: translateY(-2px);
    }
  `]
})
export class HydrationComponent implements OnInit {
  hydrationService = inject(HydrationService);
  auth = inject(AuthService);

  todayLog: HydrationLog = {
    totalMl: 0,
    dailyGoalMl: 2000,
    goalMl: 2000,
    glassesLogged: 0,
    glasses: 0,
    percentage: 0,
    remainingMl: 2000,
    entries: []
  };

  historyLogs: HydrationLog[] = [];
  todayDisplay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  loading = false;
  newGoalMl = 2000;
  goalMessage = '';

  totalGlassesTarget = 8;
  glassList = Array(8).fill(0);

  get glassesFilled(): number {
    const total = this.todayLog.totalMl || 0;
    const gVol = this.todayLog.glassVolumeMl || 250;
    return Math.min(this.totalGlassesTarget, Math.floor(total / gVol));
  }

  ngOnInit(): void {
    this.loadToday();
    this.loadHistory();
  }

  private cdr = inject(ChangeDetectorRef);

  loadToday(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.hydrationService.getTodayHydration().subscribe({
      next: (log) => {
        this.todayLog = log;
        this.newGoalMl = log.dailyGoalMl || log.goalMl || 2000;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadHistory(): void {
    this.hydrationService.getHydrationHistory().subscribe({
      next: (logs) => {
        this.historyLogs = logs;
        this.cdr.markForCheck();
      }
    });
  }

  addWater(amountMl: number = 250): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.hydrationService.logWater(amountMl).subscribe({
      next: (log) => {
        this.todayLog = log;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadHistory();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  undoWater(amountMl: number = 250): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.hydrationService.removeWater(amountMl).subscribe({
      next: (log) => {
        this.todayLog = log;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadHistory();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onGlassClick(index: number): void {
    if (index < this.glassesFilled) {
      // If clicking an already filled glass, undo one glass
      this.undoWater(250);
    } else {
      // Fill one glass
      this.addWater(250);
    }
  }

  saveGoal(): void {
    if (!this.newGoalMl || this.newGoalMl < 500) return;
    this.loading = true;
    this.cdr.markForCheck();
    this.hydrationService.updateGoal(this.newGoalMl).subscribe({
      next: (log) => {
        this.todayLog = log;
        this.goalMessage = 'Goal updated!';
        setTimeout(() => (this.goalMessage = ''), 3000);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
