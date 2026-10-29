import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlannerService } from '../../services/planner.service';
import { AuthService } from '../../services/auth.service';
import { WeeklyPlan, DayPlan } from '../../models/planner.models';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="planner-page py-5">
      <div class="container py-lg-4" *ngIf="plan; else loadingView">
        
        <!-- Header & Template Switcher -->
        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
          <div>
            <div class="section-badge">7-DAY ADHERENCE ENGINE</div>
            <h1 class="section-title mb-1">WEEKLY SPLIT <span class="text-neon">PLANNER</span></h1>
            <p class="text-muted-custom small mb-0">
              Schedule, track, and execute your microcycle. Changes persist in MongoDB (or local browser storage in guest demo mode).
            </p>
          </div>

          <!-- Template Switcher & Reset Controls -->
          <div class="d-flex flex-wrap gap-2 align-items-center">
            
            <div class="btn-group" role="group">
              <button
                type="button"
                (click)="switchTemplate('7-day')"
                class="btn goat-btn-sm"
                [class.btn-neon]="is7DayTemplate"
                [class.btn-dark-outline]="!is7DayTemplate"
              >
                7-Day Elite Split
              </button>
              <button
                type="button"
                (click)="switchTemplate('6-day')"
                class="btn goat-btn-sm"
                [class.btn-neon]="!is7DayTemplate"
                [class.btn-dark-outline]="is7DayTemplate"
              >
                6-Day Hypertrophy
              </button>
            </div>

            <button (click)="confirmResetWeek()" class="goat-btn-outline goat-btn-sm text-danger border-danger border-opacity-50">
              ↺ Reset Week
            </button>

          </div>
        </div>

        <!-- Adherence Progress Banner -->
        <div class="goat-card mb-5 p-4 goat-card-glow">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
            <div>
              <div class="text-muted small text-uppercase fw-bold letter-spacing-1">Weekly Training Adherence</div>
              <div class="d-flex align-items-baseline gap-2">
                <span class="font-bebas text-neon display-5">{{ plan.completedCount || 0 }} of 7</span>
                <span class="text-white fs-5 fw-bold">Days Completed</span>
              </div>
            </div>

            <div class="text-md-end">
              <div class="font-bebas text-white display-5">
                {{ plan.adherencePercentage || 0 }}%
              </div>
              <div class="text-muted small">Target: 85%+ Consistency</div>
            </div>
          </div>

          <!-- Adherence Progress Bar -->
          <div class="adherence-track">
            <div
              class="adherence-bar"
              [style.width.%]="plan.adherencePercentage || 0"
            ></div>
          </div>
        </div>

        <!-- 7-Day Schedule Grid -->
        <div class="row g-4">
          <div *ngFor="let day of plan.days; let i = index" class="col-lg-4 col-md-6">
            <div
              class="day-card goat-card h-100 d-flex flex-column justify-content-between p-4"
              [class.day-completed]="day.completed || day.isCompleted"
              [class.rest-day]="day.isRestDay"
            >
              <div>
                
                <!-- Day Header -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="d-flex align-items-center gap-2">
                    <span class="day-dot" [class.dot-done]="day.completed || day.isCompleted" [class.dot-rest]="day.isRestDay"></span>
                    <span class="font-bebas text-white fs-4">{{ day.dayName || day.dayOfWeek }}</span>
                  </div>

                  <span *ngIf="day.isRestDay" class="badge bg-secondary bg-opacity-25 text-info small">
                    RECOVERY
                  </span>
                  <span *ngIf="!day.isRestDay" class="badge-dark small">
                    {{ day.category }}
                  </span>
                </div>

                <!-- Workout Title -->
                <h4 class="text-white font-bebas fs-3 mb-2">
                  {{ day.workoutTitle || day.title }}
                </h4>

                <!-- Key Lifts list -->
                <div *ngIf="day.keyLifts && day.keyLifts.length > 0" class="key-lifts-box mb-3 p-2 rounded small">
                  <div class="text-muted small fw-bold mb-1">KEY MOVEMENTS:</div>
                  <div *ngFor="let lift of day.keyLifts" class="text-soft text-truncate mb-0">
                    &bull; {{ lift }}
                  </div>
                </div>

                <p *ngIf="day.notes" class="text-muted-custom small mb-3">
                  <em>"{{ day.notes }}"</em>
                </p>

              </div>

              <!-- Day Actions -->
              <div class="pt-3 border-top border-secondary border-opacity-10">
                <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                  
                  <!-- Toggle Complete Button -->
                  <button
                    (click)="toggleDay(day.dayIndex !== undefined ? day.dayIndex : i)"
                    class="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                    [class.btn-success]="day.completed || day.isCompleted"
                    [class.btn-outline-secondary]="!(day.completed || day.isCompleted)"
                  >
                    <span *ngIf="day.completed || day.isCompleted">✓ Completed</span>
                    <span *ngIf="!(day.completed || day.isCompleted)">○ Mark Done</span>
                  </button>

                  <!-- Edit Day -->
                  <button
                    (click)="openEditDayModal(day, day.dayIndex !== undefined ? day.dayIndex : i)"
                    class="btn btn-sm btn-dark text-soft border border-secondary border-opacity-50"
                    title="Edit session title or notes"
                  >
                    Edit
                  </button>

                </div>

                <!-- Launch Workout Session Directly -->
                <a
                  *ngIf="!day.isRestDay"
                  [routerLink]="['/active-workout']"
                  [queryParams]="{dayIndex: day.dayIndex !== undefined ? day.dayIndex : i, programSlug: day.programSlug || 'chest-annihilation'}"
                  class="goat-btn-neon goat-btn-sm w-100 text-decoration-none text-center"
                >
                  ⚡ Start Session
                </a>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- Edit Day Modal -->
      <div *ngIf="editingDay" class="custom-modal-backdrop d-flex align-items-center justify-content-center p-3">
        <div class="goat-card p-4 modal-box" style="width: 480px; max-width: 100%;">
          
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="text-white font-bebas fs-4 mb-0">EDIT {{ editingDay.dayName | uppercase }} SCHEDULE</h5>
            <button (click)="editingDay = null" class="btn-close btn-close-white"></button>
          </div>

          <form (ngSubmit)="saveDayEdit()">
            <div class="mb-3">
              <label class="goat-label">Session Title</label>
              <input
                type="text"
                [(ngModel)]="editForm.title"
                name="title"
                required
                class="goat-input"
              />
            </div>

            <div class="mb-3">
              <label class="goat-label">Muscle Category</label>
              <select [(ngModel)]="editForm.category" name="category" class="goat-select">
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs</option>
                <option value="Shoulder">Shoulder</option>
                <option value="Arms">Arms</option>
                <option value="Abs">Abs</option>
                <option value="Full Body">Full Body</option>
                <option value="Home Workout">Home Workout</option>
              </select>
            </div>

            <div class="mb-3 form-check">
              <input
                type="checkbox"
                [(ngModel)]="editForm.isRestDay"
                name="isRestDay"
                id="restDayCheck"
                class="form-check-input"
              />
              <label class="form-check-label text-soft small" for="restDayCheck">
                Designate as Active Recovery / Rest Day
              </label>
            </div>

            <div class="mb-4">
              <label class="goat-label">Athlete Notes & Form Focus</label>
              <textarea
                [(ngModel)]="editForm.notes"
                name="notes"
                rows="3"
                class="goat-input"
                placeholder="E.g. Focus on deep pec stretch and 3s negative eccentric..."
              ></textarea>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button type="button" (click)="editingDay = null" class="goat-btn-outline goat-btn-sm">
                Cancel
              </button>
              <button type="submit" class="goat-btn-neon goat-btn-sm" [disabled]="isSavingDay">
                <span *ngIf="isSavingDay" class="spinner-border spinner-border-sm me-1"></span>
                Save Changes
              </button>
            </div>
          </form>

        </div>
      </div>

      <ng-template #loadingView>
        <div class="text-center py-5">
          <div class="spinner-border text-neon"></div>
          <div class="text-muted small mt-2">Loading weekly split schedule...</div>
        </div>
      </ng-template>

    </div>
  `,
  styles: [`
    .planner-page {
      background: var(--bg-primary);
      min-height: 80vh;
    }

    .adherence-track {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }

    .adherence-bar {
      height: 100%;
      background: var(--accent-neon);
      box-shadow: 0 0 15px var(--accent-neon);
      transition: width 0.4s ease;
    }

    .day-card {
      transition: all 0.25s ease;
      border: 1px solid var(--border-card);
    }

    .day-card.day-completed {
      border-color: rgba(32, 243, 107, 0.5);
      background: rgba(32, 243, 107, 0.04);
    }

    .day-card.rest-day {
      border-color: rgba(56, 189, 248, 0.3);
    }

    .day-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--text-muted);
    }

    .day-dot.dot-done {
      background: var(--accent-neon);
      box-shadow: 0 0 8px var(--accent-neon);
    }

    .day-dot.dot-rest {
      background: var(--status-info);
    }

    .key-lifts-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
    }

    .btn-neon {
      background: var(--accent-neon) !important;
      color: var(--text-dark) !important;
      font-weight: 700;
    }

    .btn-dark-outline {
      background: var(--bg-surface) !important;
      color: var(--text-soft) !important;
      border: 1px solid var(--border-card) !important;
    }

    .custom-modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 1060;
    }

    .modal-box {
      border: 1px solid var(--accent-neon-border);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.9), 0 0 25px rgba(32, 243, 107, 0.2);
    }
  `]
})
export class PlannerComponent implements OnInit {
  private plannerService = inject(PlannerService);
  private cdr = inject(ChangeDetectorRef);
  public auth = inject(AuthService);

  public plan: WeeklyPlan | null = null;
  public is7DayTemplate = true;

  public editingDay: DayPlan | null = null;
  public editingIndex = 0;
  public editForm = {
    title: '',
    category: 'Chest',
    notes: '',
    isRestDay: false
  };
  public isSavingDay = false;

  ngOnInit() {
    this.loadPlan();
  }

  loadPlan() {
    this.plannerService.getWeeklyPlan().subscribe({
      next: (data) => {
        this.plan = data;
        this.is7DayTemplate = !(data.templateName && data.templateName.includes('6-Day'));
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      }
    });
  }

  toggleDay(dayIndex: number) {
    this.plannerService.toggleDayComplete(dayIndex).subscribe({
      next: (updated) => {
        this.plan = updated;
        this.cdr.markForCheck();
      }
    });
  }

  confirmResetWeek() {
    if (confirm('Are you sure you want to reset all workout completions for the current week?')) {
      this.plannerService.resetWeek().subscribe({
        next: (updated) => {
          this.plan = updated;
          this.cdr.markForCheck();
        }
      });
    }
  }

  switchTemplate(type: '7-day' | '6-day') {
    this.plannerService.applyTemplate(type).subscribe({
      next: (updated) => {
        this.plan = updated;
        this.is7DayTemplate = type === '7-day';
        this.cdr.markForCheck();
      }
    });
  }

  openEditDayModal(day: DayPlan, index: number) {
    this.editingDay = day;
    this.editingIndex = index;
    this.editForm = {
      title: day.workoutTitle || day.title,
      category: day.category || 'Chest',
      notes: day.notes || '',
      isRestDay: !!day.isRestDay
    };
  }

  saveDayEdit() {
    if (!this.editingDay) return;
    this.isSavingDay = true;

    this.plannerService
      .updateDay(this.editingIndex, {
        title: this.editForm.title,
        workoutTitle: this.editForm.title,
        category: this.editForm.category,
        notes: this.editForm.notes,
        isRestDay: this.editForm.isRestDay
      })
      .subscribe({
        next: (updated) => {
          this.plan = updated;
          this.isSavingDay = false;
          this.editingDay = null;
        },
        error: () => {
          this.isSavingDay = false;
        }
      });
  }
}
