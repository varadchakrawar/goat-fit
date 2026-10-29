import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';
import { PlannerService } from '../../services/planner.service';
import { WorkoutProgram } from '../../models/workout.models';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="workout-detail-page py-5">
      <div class="container py-lg-4" *ngIf="program; else loadingView">
        
        <!-- Breadcrumb & Back -->
        <div class="mb-4 d-flex align-items-center gap-2">
          <a routerLink="/workouts" class="goat-btn-outline goat-btn-sm text-decoration-none">
            &larr; Back to Catalogue
          </a>
          <span class="text-muted small">/ {{ program.category }} / {{ program.name }}</span>
        </div>

        <!-- Hero Card -->
        <div class="goat-card mb-5 p-0 overflow-hidden">
          <div class="row g-0">
            <div class="col-lg-5">
              <div class="detail-hero-img-wrap h-100">
                <img
                  [src]="program.imageUrl || 'assets/images/image-4-1.jpg'"
                  [alt]="program.name"
                  class="detail-hero-img"
                  onerror="this.src='assets/images/chest-program.jpg'"
                />
              </div>
            </div>
            <div class="col-lg-7 p-4 p-md-5 d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span class="badge-neon">{{ program.difficulty }}</span>
                  <span class="badge-dark">{{ program.category }}</span>
                  <span class="badge bg-secondary bg-opacity-25 text-soft">⏱ ~{{ program.durationMinutes }} Minutes</span>
                </div>

                <h1 class="font-bebas text-white display-4 mb-3">{{ program.name }}</h1>
                <p class="text-soft fs-5 mb-4">{{ program.description }}</p>

                <!-- Key Specs Grid -->
                <div class="row g-3 mb-4">
                  <div class="col-sm-6">
                    <div class="spec-box p-3 rounded">
                      <div class="text-muted small text-uppercase">Training Objective</div>
                      <div class="fw-bold text-white small">{{ program.trainingObjective || 'Maximum Hypertrophy & Overload' }}</div>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="spec-box p-3 rounded">
                      <div class="text-muted small text-uppercase">Target Muscles</div>
                      <div class="fw-bold text-neon small">
                        {{ program.targetMuscles ? program.targetMuscles.join(', ') : 'Chest, Shoulders, Triceps' }}
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="spec-box p-3 rounded">
                      <div class="text-muted small text-uppercase">Required Equipment</div>
                      <div class="fw-bold text-white small">
                        {{ program.equipment ? program.equipment.join(', ') : 'Barbell, Dumbbells, Bench' }}
                      </div>
                    </div>
                  </div>
                  <div class="col-sm-6">
                    <div class="spec-box p-3 rounded">
                      <div class="text-muted small text-uppercase">Total Movements</div>
                      <div class="fw-bold text-white small">{{ program.exercises.length }} Planned Exercises</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action CTAs -->
              <div class="d-flex flex-wrap gap-3 pt-3 border-top border-secondary border-opacity-25">
                <a
                  [routerLink]="['/active-workout']"
                  [queryParams]="{programSlug: program.slug}"
                  class="goat-btn-neon fs-6 px-4 py-2 text-decoration-none"
                >
                  ⚡ START THIS WORKOUT SESSION
                </a>
                <button (click)="openAddToPlanModal()" class="goat-btn-outline fs-6 px-4 py-2">
                  + Add to Weekly Split
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Warm-up & Cool-down Section -->
        <div class="row g-4 mb-5">
          <div class="col-md-6">
            <div class="goat-card h-100 p-4">
              <div class="d-flex align-items-center gap-2 mb-2 text-neon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                </svg>
                <h5 class="font-bebas text-white fs-4 mb-0">WARM-UP PROTOCOL (5–8 MINS)</h5>
              </div>
              <p class="text-muted-custom small mb-0">
                {{ program.warmup || '5-10 mins dynamic shoulder dislocates with light band, thoracic extension foam rolling, and 2 ramp-up pyramid sets before working loads.' }}
              </p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="goat-card h-100 p-4">
              <div class="d-flex align-items-center gap-2 mb-2 text-neon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                </svg>
                <h5 class="font-bebas text-white fs-4 mb-0">COOL-DOWN & MOBILITY (5 MINS)</h5>
              </div>
              <p class="text-muted-custom small mb-0">
                {{ program.coolDown || '5 mins deep doorway chest stretches, lat hangs from pull-up bar, and nasal diaphragmatic breathing to switch off sympathetic fight-or-flight.' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Exercise Sequence Breakdown -->
        <div class="mb-5">
          <div class="section-badge mb-2">EXERCISE SEQUENCE</div>
          <h2 class="font-bebas text-white fs-2 mb-4">PRESCRIBED MOVEMENTS & LOADING</h2>

          <div class="d-flex flex-column gap-3">
            <div *ngFor="let ex of program.exercises; let i = index" class="goat-card p-3 p-md-4">
              <div class="row align-items-center g-3">
                
                <div class="col-auto">
                  <div class="exercise-order-badge font-bebas fs-3">
                    0{{ i + 1 }}
                  </div>
                </div>

                <div class="col">
                  <h4 class="text-white mb-1">{{ ex.exerciseName }}</h4>
                  <div class="d-flex flex-wrap gap-3 text-muted small">
                    <span class="text-neon fw-bold">{{ ex.sets }} Working Sets</span>
                    <span>&bull;</span>
                    <span class="text-white fw-semibold">{{ ex.reps }} Reps</span>
                    <span>&bull;</span>
                    <span>Rest: {{ ex.restSeconds || 60 }}s</span>
                  </div>
                  <p *ngIf="ex.notes" class="text-muted-custom small mt-2 mb-0">
                    💡 <em>{{ ex.notes }}</em>
                  </p>
                </div>

                <div class="col-md-auto d-flex gap-2">
                  <a
                    [routerLink]="['/active-workout']"
                    [queryParams]="{programSlug: program.slug}"
                    class="goat-btn-neon goat-btn-sm text-decoration-none"
                  >
                    Lift Now
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Add to Weekly Split Modal -->
      <div *ngIf="showAddModal" class="custom-modal-backdrop d-flex align-items-center justify-content-center p-3">
        <div class="goat-card p-4 modal-box" style="width: 440px; max-width: 100%;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="text-white font-bebas fs-4 mb-0">ASSIGN TO WEEKLY SPLIT</h5>
            <button (click)="showAddModal = false" class="btn-close btn-close-white"></button>
          </div>
          <p class="text-muted-custom small mb-3">
            Select which day of your 7-day schedule to assign <strong>{{ program?.name }}</strong> to:
          </p>

          <div class="mb-3">
            <label class="goat-label">Target Day</label>
            <select [(ngModel)]="selectedDayIndex" class="goat-select">
              <option *ngFor="let day of weekDays; let i = index" [value]="i">
                {{ day }}
              </option>
            </select>
          </div>

          <div *ngIf="planSaveFeedback" class="p-2 mb-3 rounded small text-center text-neon bg-success bg-opacity-10 border border-success border-opacity-25">
            {{ planSaveFeedback }}
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button (click)="showAddModal = false" class="goat-btn-outline goat-btn-sm">
              Cancel
            </button>
            <button (click)="confirmAddToPlan()" class="goat-btn-neon goat-btn-sm" [disabled]="isSavingToPlan">
              <span *ngIf="isSavingToPlan" class="spinner-border spinner-border-sm me-1"></span>
              Save Day
            </button>
          </div>
        </div>
      </div>

      <ng-template #loadingView>
        <div class="text-center py-5">
          <div class="spinner-border text-neon"></div>
          <div class="text-muted small mt-2">Loading workout program details...</div>
        </div>
      </ng-template>

    </div>
  `,
  styles: [`
    .workout-detail-page {
      background: var(--bg-primary);
      min-height: 80vh;
    }

    .detail-hero-img-wrap {
      min-height: 320px;
      overflow: hidden;
    }

    .detail-hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .spec-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
    }

    .exercise-order-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(32, 243, 107, 0.1);
      border: 1px solid var(--accent-neon-border);
      color: var(--accent-neon);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .custom-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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
export class WorkoutDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private plannerService = inject(PlannerService);
  private cdr = inject(ChangeDetectorRef);

  public program: WorkoutProgram | null = null;
  public showAddModal = false;
  public selectedDayIndex = 0;
  public isSavingToPlan = false;
  public planSaveFeedback = '';
  public weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const idOrSlug = params.get('idOrSlug');
      if (idOrSlug) {
        this.workoutService.getProgram(idOrSlug).subscribe({
          next: (prog) => {
            this.program = prog;
            this.cdr.markForCheck();
          },
          error: () => this.router.navigate(['/workouts'])
        });
      }
    });
  }

  openAddToPlanModal() {
    this.showAddModal = true;
    this.planSaveFeedback = '';
    this.cdr.markForCheck();
  }

  confirmAddToPlan() {
    if (!this.program) return;
    this.isSavingToPlan = true;
    this.cdr.markForCheck();

    this.plannerService
      .updateDay(Number(this.selectedDayIndex), {
        title: this.program.name,
        workoutTitle: this.program.name,
        category: this.program.category,
        programSlug: this.program.slug,
        isRestDay: false
      })
      .subscribe({
        next: () => {
          this.isSavingToPlan = false;
          this.planSaveFeedback = `Successfully assigned to ${this.weekDays[this.selectedDayIndex]}!`;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.showAddModal = false;
            this.cdr.markForCheck();
          }, 1200);
        },
        error: () => {
          this.isSavingToPlan = false;
          this.cdr.markForCheck();
        }
      });
  }
}
