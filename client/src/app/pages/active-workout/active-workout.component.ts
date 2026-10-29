import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';
import { SessionService } from '../../services/session.service';
import { TimerService } from '../../services/timer.service';
import { WorkoutProgram, Exercise } from '../../models/workout.models';
import { SessionExercise } from '../../models/session.models';

@Component({
  selector: 'app-active-workout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="active-session-page py-5">
      <div class="container py-lg-4" *ngIf="program; else loadingView">
        
        <!-- Live Status Bar -->
        <div class="goat-card mb-4 p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          
          <div class="d-flex align-items-center gap-3">
            <span class="live-pulse-badge">
              <span class="pulse-ring"></span>
              LIVE SESSION
            </span>
            <div>
              <div class="font-bebas text-white fs-4 mb-0">{{ program.name }}</div>
              <div class="text-muted small">Exercise {{ currentExIndex + 1 }} of {{ exercisesList.length }}</div>
            </div>
          </div>

          <!-- Session Elapsed Timer & Rest Trigger -->
          <div class="d-flex align-items-center gap-3">
            <div class="text-end">
              <div class="font-bebas text-neon fs-3">{{ formatSessionTime(elapsedSeconds) }}</div>
              <div class="text-muted small" style="font-size: 0.65rem;">SESSION TIME</div>
            </div>

            <button (click)="triggerRest(currentEx?.restSeconds || 60)" class="goat-btn-outline goat-btn-sm text-neon">
              ⏱ Rest {{ currentEx?.restSeconds || 60 }}s
            </button>

            <button (click)="confirmDiscard()" class="btn btn-sm btn-outline-danger">
              Discard
            </button>
          </div>

        </div>

        <!-- Main Workout Stage -->
        <div class="row g-4 mb-4" *ngIf="currentEx">
          
          <!-- Left: Current Movement Guidance -->
          <div class="col-lg-5">
            <div class="goat-card h-100 p-4">
              
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge-dark">{{ currentEx.category }}</span>
                <span class="badge-neon">Rest: {{ currentEx.restSeconds || 60 }}s</span>
              </div>

              <h2 class="font-bebas text-white fs-2 mb-3">{{ currentEx.exerciseName }}</h2>

              <div class="p-3 rounded spec-box mb-3 small">
                <div class="text-neon fw-bold mb-1">Target Scheme</div>
                <div class="text-white">{{ currentEx.sets }} Sets &bull; {{ currentEx.reps }} Reps</div>
              </div>

              <!-- Movement Form Cue -->
              <div *ngIf="currentExerciseDetail?.movementCues" class="p-3 rounded cue-box mb-3 small">
                💡 <strong>Technique Cue:</strong> {{ currentExerciseDetail?.movementCues }}
              </div>

              <!-- Step-by-Step Instructions -->
              <div *ngIf="currentExerciseDetail?.instructions" class="mb-3">
                <div class="text-muted small text-uppercase fw-bold mb-2">Execution Steps</div>
                <ol class="ps-3 text-soft small mb-0 d-flex flex-column gap-1">
                  <li *ngFor="let step of currentExerciseDetail?.instructions">
                    {{ step }}
                  </li>
                </ol>
              </div>

            </div>
          </div>

          <!-- Right: Sets & Reps Logger -->
          <div class="col-lg-7">
            <div class="goat-card p-4 h-100 d-flex flex-column justify-content-between">
              
              <div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h4 class="font-bebas text-white fs-3 mb-0">LOG WORKING SETS</h4>
                  <button (click)="addSet()" class="btn btn-sm btn-dark text-neon border-neon">
                    + Add Set
                  </button>
                </div>

                <!-- Sets Table -->
                <div class="table-responsive">
                  <table class="table table-dark table-borderless align-middle sets-table mb-4">
                    <thead>
                      <tr class="text-muted small text-uppercase">
                        <th style="width: 15%;">Set</th>
                        <th style="width: 30%;">Weight (kg)</th>
                        <th style="width: 30%;">Reps</th>
                        <th style="width: 25%;" class="text-end">Done</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let st of currentSessionExercise?.sets; let sIdx = index" [class.set-completed-row]="st.completed">
                        <td class="font-bebas text-white fs-5">0{{ sIdx + 1 }}</td>
                        <td>
                          <div class="input-group input-group-sm">
                            <input
                              type="number"
                              [(ngModel)]="st.weightKg"
                              (change)="calculateLiveVolume()"
                              min="0"
                              max="500"
                              step="2.5"
                              class="form-control goat-input text-center py-1"
                              placeholder="0"
                            />
                            <span class="input-group-text bg-dark text-muted border-secondary border-opacity-50 small">kg</span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="number"
                            [(ngModel)]="st.reps"
                            (change)="calculateLiveVolume()"
                            min="1"
                            max="100"
                            class="form-control goat-input text-center py-1"
                            placeholder="10"
                          />
                        </td>
                        <td class="text-end">
                          <button
                            (click)="toggleSetDone(st)"
                            class="btn btn-sm btn-set-check"
                            [class.checked]="st.completed"
                            title="Mark set done & trigger rest"
                          >
                            <span *ngIf="st.completed">✓</span>
                            <span *ngIf="!st.completed">○</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Live Volume Tonnage Counter -->
                <div class="d-flex justify-content-between align-items-center p-3 rounded spec-box mb-3">
                  <div class="text-muted small text-uppercase">Accumulated Session Tonnage</div>
                  <div class="font-bebas text-neon fs-3">{{ liveTotalVolumeKg }} KG</div>
                </div>

              </div>

              <!-- Exercise Navigation Controls -->
              <div class="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25">
                <button
                  (click)="prevExercise()"
                  [disabled]="currentExIndex === 0"
                  class="goat-btn-outline goat-btn-sm"
                >
                  &larr; Previous Lift
                </button>

                <button
                  *ngIf="currentExIndex < exercisesList.length - 1"
                  (click)="nextExercise()"
                  class="goat-btn-neon goat-btn-sm"
                >
                  Next Lift &rarr;
                </button>

                <button
                  *ngIf="currentExIndex === exercisesList.length - 1"
                  (click)="finishWorkout()"
                  class="goat-btn-neon goat-btn-sm bg-success text-dark fw-bold border-success"
                >
                  🏆 Complete Workout
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      <!-- Completion Summary Modal -->
      <div *ngIf="showFinishModal" class="custom-modal-backdrop d-flex align-items-center justify-content-center p-3">
        <div class="goat-card p-4 p-md-5 modal-box text-center" style="width: 520px; max-width: 100%;">
          
          <div class="finish-trophy mb-3 font-bebas text-neon display-3">🏆</div>
          <h2 class="font-bebas text-white display-5 mb-2">WORKOUT CRUSHED!</h2>
          <p class="text-muted-custom small mb-4">
            Beast mode confirmed. Session duration and total tonnage logged to your athletic history.
          </p>

          <div class="row g-3 mb-4">
            <div class="col-4">
              <div class="p-3 spec-box rounded">
                <div class="text-muted small text-uppercase">Duration</div>
                <div class="font-bebas text-white fs-3">{{ Math.round(elapsedSeconds / 60) }}m</div>
              </div>
            </div>
            <div class="col-4">
              <div class="p-3 spec-box rounded">
                <div class="text-muted small text-uppercase">Volume</div>
                <div class="font-bebas text-neon fs-3">{{ liveTotalVolumeKg }}kg</div>
              </div>
            </div>
            <div class="col-4">
              <div class="p-3 spec-box rounded">
                <div class="text-muted small text-uppercase">Lifts Done</div>
                <div class="font-bebas text-white fs-3">{{ exercisesList.length }}</div>
              </div>
            </div>
          </div>

          <div class="mb-4 text-start">
            <label class="goat-label">Session Notes (Optional)</label>
            <textarea
              [(ngModel)]="sessionNotes"
              rows="2"
              class="goat-input"
              placeholder="How did your top sets feel today? (e.g., Hit 90kg for 8 clean reps)"
            ></textarea>
          </div>

          <div class="d-flex justify-content-center gap-3">
            <button (click)="saveAndExit()" class="goat-btn-neon fs-6 px-4 py-2" [disabled]="isSavingSession">
              <span *ngIf="isSavingSession" class="spinner-border spinner-border-sm me-1"></span>
              Save & Return to Dashboard
            </button>
          </div>

        </div>
      </div>

      <ng-template #loadingView>
        <div class="text-center py-5">
          <div class="spinner-border text-neon"></div>
          <div class="text-muted small mt-2">Loading session protocol...</div>
        </div>
      </ng-template>

    </div>
  `,
  styles: [`
    .active-session-page {
      background: var(--bg-primary);
      min-height: 85vh;
    }

    .live-pulse-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(32, 243, 107, 0.15);
      border: 1px solid var(--accent-neon-border);
      color: var(--accent-neon);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
    }

    .pulse-ring {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-neon);
      box-shadow: 0 0 10px var(--accent-neon);
      animation: pulse 1s infinite;
    }

    .spec-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
    }

    .cue-box {
      background: rgba(32, 243, 107, 0.06);
      border-left: 3px solid var(--accent-neon);
      color: var(--text-soft);
    }

    .sets-table th {
      background: transparent;
      border-bottom: 1px solid var(--border-card);
    }

    .sets-table td {
      background: transparent;
      padding: 0.5rem 0.25rem;
    }

    .set-completed-row td {
      opacity: 0.8;
    }

    .btn-set-check {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-muted);
      border-radius: 8px;
      width: 36px;
      height: 36px;
      font-size: 1rem;
      font-weight: bold;
    }

    .btn-set-check.checked {
      background: var(--accent-neon);
      border-color: var(--accent-neon);
      color: var(--text-dark);
      box-shadow: 0 0 10px rgba(32, 243, 107, 0.4);
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
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.9), 0 0 30px rgba(32, 243, 107, 0.3);
    }
  `]
})
export class ActiveWorkoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private sessionService = inject(SessionService);
  private timerService = inject(TimerService);
  private cdr = inject(ChangeDetectorRef);

  public Math = Math;
  public program: WorkoutProgram | null = null;
  public currentExIndex = 0;
  public exercisesList: any[] = [];
  public currentEx: any = null;
  public currentExerciseDetail: Exercise | null = null;

  public sessionExercises: SessionExercise[] = [];
  public currentSessionExercise: SessionExercise | null = null;

  public elapsedSeconds = 0;
  private sessionTimerInterval: any = null;
  public liveTotalVolumeKg = 0;

  public showFinishModal = false;
  public sessionNotes = '';
  public isSavingSession = false;
  private passedDayIndex: number | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const slug = params['programSlug'] || 'chest-annihilation';
      if (params['dayIndex'] !== undefined) {
        this.passedDayIndex = parseInt(params['dayIndex'], 10);
      }
      this.loadProgram(slug);
    });

    this.startSessionTimer();
  }

  loadProgram(slug: string) {
    this.workoutService.getProgram(slug).subscribe({
      next: (prog) => {
        this.program = prog;
        this.exercisesList = prog.exercises || [];
        this.initSessionExercises();
        this.selectExercise(0);
        this.cdr.markForCheck();
      },
      error: () => {
        this.router.navigate(['/workouts']);
      }
    });
  }

  initSessionExercises() {
    this.sessionExercises = this.exercisesList.map((ex) => ({
      exerciseName: ex.exerciseName,
      sets: Array.from({ length: ex.sets || 4 }, (_, idx) => ({
        setNumber: idx + 1,
        reps: 10,
        weightKg: 60,
        completed: false
      }))
    }));
  }

  selectExercise(idx: number) {
    this.currentExIndex = idx;
    this.currentEx = this.exercisesList[idx];
    this.currentSessionExercise = this.sessionExercises[idx];
    this.cdr.markForCheck();

    // Load full details for cues
    if (this.currentEx) {
      const slug = this.currentEx.exerciseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      this.workoutService.getExercise(slug).subscribe({
        next: (ex) => {
          this.currentExerciseDetail = ex;
          this.cdr.markForCheck();
        },
        error: () => {
          this.currentExerciseDetail = null;
          this.cdr.markForCheck();
        }
      });
    }
  }

  nextExercise() {
    if (this.currentExIndex < this.exercisesList.length - 1) {
      this.selectExercise(this.currentExIndex + 1);
    }
  }

  prevExercise() {
    if (this.currentExIndex > 0) {
      this.selectExercise(this.currentExIndex - 1);
    }
  }

  addSet() {
    if (!this.currentSessionExercise) return;
    const nextNum = this.currentSessionExercise.sets.length + 1;
    const lastSet = this.currentSessionExercise.sets[this.currentSessionExercise.sets.length - 1];
    this.currentSessionExercise.sets.push({
      setNumber: nextNum,
      weightKg: lastSet ? lastSet.weightKg : 60,
      reps: lastSet ? lastSet.reps : 10,
      completed: false
    });
  }

  toggleSetDone(set: any) {
    set.completed = !set.completed;
    this.calculateLiveVolume();
    if (set.completed) {
      // Trigger floating rest timer!
      this.triggerRest(this.currentEx?.restSeconds || 60);
    }
  }

  triggerRest(seconds: number) {
    this.timerService.start(seconds);
  }

  calculateLiveVolume() {
    let vol = 0;
    this.sessionExercises.forEach((ex) => {
      ex.sets.forEach((st) => {
        if (st.completed && st.weightKg && st.reps) {
          vol += st.weightKg * st.reps;
        }
      });
    });
    this.liveTotalVolumeKg = Math.round(vol);
  }

  startSessionTimer() {
    this.sessionTimerInterval = setInterval(() => {
      this.elapsedSeconds++;
    }, 1000);
  }

  formatSessionTime(totalSecs: number): string {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  finishWorkout() {
    this.calculateLiveVolume();
    this.showFinishModal = true;
  }

  saveAndExit() {
    if (!this.program) return;
    this.isSavingSession = true;

    if (this.sessionTimerInterval) {
      clearInterval(this.sessionTimerInterval);
    }

    const duration = Math.max(1, Math.round(this.elapsedSeconds / 60));

    this.sessionService
      .recordSession({
        programName: this.program.name,
        workoutTitle: this.program.name,
        muscleGroup: this.program.category,
        durationMinutes: duration,
        totalVolumeKg: this.liveTotalVolumeKg,
        exercises: this.sessionExercises,
        notes: this.sessionNotes,
        ...(this.passedDayIndex !== null && { dayIndex: this.passedDayIndex } as any)
      })
      .subscribe({
        next: () => {
          this.isSavingSession = false;
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.isSavingSession = false;
          this.router.navigate(['/dashboard']);
        }
      });
  }

  confirmDiscard() {
    if (confirm('Discard this workout session without saving?')) {
      if (this.sessionTimerInterval) clearInterval(this.sessionTimerInterval);
      this.router.navigate(['/workouts']);
    }
  }
}
