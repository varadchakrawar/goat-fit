import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PlannerService } from '../../services/planner.service';
import { HydrationService } from '../../services/hydration.service';
import { NutritionService } from '../../services/nutrition.service';
import { SessionService } from '../../services/session.service';
import { WeeklyPlan, DayPlan } from '../../models/planner.models';
import { HydrationLog } from '../../models/hydration.models';
import { NutritionProfile } from '../../models/nutrition.models';
import { WorkoutSession } from '../../models/session.models';
import { User } from '../../models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-page py-5">
      <div class="container">
        <!-- Top Athlete Banner -->
        <div class="card bg-card border-secondary mb-4 p-4 shadow-lg position-relative overflow-hidden">
          <div class="glow-orb"></div>
          <div class="row align-items-center position-relative z-1">
            <div class="col-lg-8">
              <div class="d-flex align-items-center gap-3 mb-2 flex-wrap">
                <span class="badge bg-primary text-black fw-black px-3 py-2 text-uppercase">
                  <i class="bi bi-shield-shaded me-1"></i> ATHLETE COMMAND
                </span>
                <span *ngIf="auth.isGuest" class="badge bg-warning text-black fw-bold px-3 py-2">
                  <i class="bi bi-person-fill-gear me-1"></i> Guest Demo Mode
                </span>
                <span *ngIf="!auth.isGuest && user?.role" class="badge bg-dark border border-secondary text-secondary px-3 py-2 text-uppercase">
                  Role: {{ user?.role }}
                </span>
              </div>
              <h1 class="display-5 fw-black text-white text-uppercase tracking-tight mb-2">
                WELCOME, <span class="text-primary">{{ athleteName }}</span>
              </h1>
              <p class="text-secondary lead mb-0">
                Your daily metrics, weekly split adherence, hydration fuel, and clinical macro targets in one synchronized dashboard.
              </p>
            </div>
            <div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <button class="btn btn-outline-light me-2 px-3 py-2" (click)="openProfileModal()">
                <i class="bi bi-person-gear me-1"></i> Edit Profile
              </button>
              <button *ngIf="auth.isGuest" class="btn btn-primary px-3 py-2 fw-bold" routerLink="/auth">
                <i class="bi bi-box-arrow-in-right me-1"></i> Create Account
              </button>
            </div>
          </div>
        </div>

        <!-- 4 Key Performance Metric Tiles -->
        <div class="row g-3 mb-4">
          <!-- Tile 1: Weekly Adherence -->
          <div class="col-sm-6 col-xl-3">
            <div class="card bg-card border-secondary h-100 p-3 shadow-sm hover-lift">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-secondary small fw-bold text-uppercase">Weekly Split Adherence</span>
                <span class="badge bg-primary-subtle text-primary border border-primary">
                  <i class="bi bi-calendar-check"></i>
                </span>
              </div>
              <div class="d-flex align-items-baseline gap-2 mb-2">
                <span class="display-6 fw-black text-white font-monospace">{{ plan?.adherencePercentage || 0 }}%</span>
                <span class="text-secondary small">({{ plan?.completedCount || 0 }}/7 days)</span>
              </div>
              <div class="progress bg-dark mb-2" style="height: 6px;">
                <div class="progress-bar bg-primary" [style.width]="(plan?.adherencePercentage || 0) + '%'"></div>
              </div>
              <a routerLink="/planner" class="text-primary small text-decoration-none fw-bold mt-auto">
                Open 7-Day Split <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>

          <!-- Tile 2: Hydration Intake -->
          <div class="col-sm-6 col-xl-3">
            <div class="card bg-card border-secondary h-100 p-3 shadow-sm hover-lift">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-secondary small fw-bold text-uppercase">Daily Hydration</span>
                <span class="badge bg-info-subtle text-info border border-info">
                  <i class="bi bi-droplet-fill"></i>
                </span>
              </div>
              <div class="d-flex align-items-baseline gap-2 mb-2">
                <span class="display-6 fw-black text-white font-monospace">{{ hydration?.totalMl || 0 }}</span>
                <span class="text-secondary small">/ {{ hydration?.dailyGoalMl || 2000 }} ml</span>
              </div>
              <div class="progress bg-dark mb-2" style="height: 6px;">
                <div class="progress-bar bg-info" [style.width]="(hydration?.percentage || 0) + '%'"></div>
              </div>
              <a routerLink="/hydration" class="text-info small text-decoration-none fw-bold mt-auto">
                Log Water <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>

          <!-- Tile 3: Calorie & Macro Target -->
          <div class="col-sm-6 col-xl-3">
            <div class="card bg-card border-secondary h-100 p-3 shadow-sm hover-lift">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-secondary small fw-bold text-uppercase">TDEE Target</span>
                <span class="badge bg-warning-subtle text-warning border border-warning">
                  <i class="bi bi-fire"></i>
                </span>
              </div>
              <div class="d-flex align-items-baseline gap-2 mb-2">
                <span class="display-6 fw-black text-white font-monospace">{{ nutrition?.targetCalories || 2400 }}</span>
                <span class="text-secondary small">kcal / day</span>
              </div>
              <div class="small text-secondary mb-2 text-truncate">
                P: {{ nutrition?.macroGrams?.protein || 210 }}g | C: {{ nutrition?.macroGrams?.carbs || 270 }}g | F: {{ nutrition?.macroGrams?.fats || 53 }}g
              </div>
              <a routerLink="/nutrition" class="text-warning small text-decoration-none fw-bold mt-auto">
                Calculate &amp; Adjust <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>

          <!-- Tile 4: Workout Sessions -->
          <div class="col-sm-6 col-xl-3">
            <div class="card bg-card border-secondary h-100 p-3 shadow-sm hover-lift">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="text-secondary small fw-bold text-uppercase">Tonnage Volume</span>
                <span class="badge bg-success-subtle text-success border border-success">
                  <i class="bi bi-trophy-fill"></i>
                </span>
              </div>
              <div class="d-flex align-items-baseline gap-2 mb-2">
                <span class="display-6 fw-black text-white font-monospace">{{ totalVolumeTonnage }}</span>
                <span class="text-secondary small">kg lifted</span>
              </div>
              <div class="small text-secondary mb-2">
                {{ sessions.length }} total recorded sessions
              </div>
              <a routerLink="/workouts" class="text-success small text-decoration-none fw-bold mt-auto">
                Browse Workouts <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Left Column: Today's Scheduled Session Card -->
          <div class="col-lg-7">
            <div class="card bg-card border-secondary mb-4 shadow">
              <div class="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
                <h4 class="text-white fw-bold mb-0">
                  <i class="bi bi-activity text-primary me-2"></i> Today's Scheduled Training
                </h4>
                <span class="badge bg-primary text-black fw-bold text-uppercase">{{ todayDayName }}</span>
              </div>
              <div class="card-body p-4">
                <div *ngIf="todayDayPlan; else noTodayWorkout">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span class="badge bg-secondary mb-2 text-uppercase">{{ todayDayPlan.category || 'General' }}</span>
                      <h3 class="text-white fw-black mb-1">{{ todayDayPlan.workoutTitle || todayDayPlan.title }}</h3>
                      <p class="text-secondary small mb-0">{{ todayDayPlan.notes || 'Focus on controlled eccentric contractions and progressive overload.' }}</p>
                    </div>
                    <div class="text-end">
                      <span *ngIf="todayDayPlan.completed || todayDayPlan.isCompleted" class="badge bg-success fs-6 py-2 px-3">
                        <i class="bi bi-check2-circle me-1"></i> Completed
                      </span>
                    </div>
                  </div>

                  <!-- Quick Action Buttons for Today -->
                  <div class="d-flex flex-wrap gap-2 mt-4 pt-3 border-top border-secondary">
                    <button 
                      class="btn btn-primary fw-black px-4 py-2"
                      (click)="launchTodayWorkout()"
                    >
                      <i class="bi bi-play-circle-fill me-2"></i> START WORKOUT
                    </button>
                    <button 
                      class="btn btn-outline-light px-3 py-2"
                      (click)="toggleTodayComplete()"
                    >
                      <i class="bi" [class.bi-check-circle]="!(todayDayPlan.completed || todayDayPlan.isCompleted)" [class.bi-x-circle]="todayDayPlan.completed || todayDayPlan.isCompleted"></i>
                      {{ (todayDayPlan.completed || todayDayPlan.isCompleted) ? 'Mark Incomplete' : 'Quick Check Off' }}
                    </button>
                    <a routerLink="/planner" class="btn btn-outline-secondary px-3 py-2 ms-auto">
                      <i class="bi bi-pencil-square me-1"></i> Edit in Split
                    </a>
                  </div>
                </div>

                <ng-template #noTodayWorkout>
                  <div class="text-center py-4 text-secondary">
                    <i class="bi bi-moon-stars display-4 text-secondary d-block mb-2"></i>
                    <h5 class="text-white">Active Recovery / Rest Day</h5>
                    <p class="small mb-3">No high-intensity workout scheduled for today. Focus on mobility, hydration, and nutrition replenishment.</p>
                    <a routerLink="/workouts" class="btn btn-sm btn-outline-primary">Browse Alternate Workouts</a>
                  </div>
                </ng-template>
              </div>
            </div>

            <!-- Recent Workout Session Logs -->
            <div class="card bg-card border-secondary shadow">
              <div class="card-header bg-dark border-secondary d-flex justify-content-between align-items-center py-3">
                <h4 class="text-white fw-bold mb-0">
                  <i class="bi bi-clock-history text-primary me-2"></i> Recent Completed Workouts
                </h4>
                <button class="btn btn-sm btn-outline-secondary" (click)="loadSessions()">
                  <i class="bi bi-arrow-clockwise"></i>
                </button>
              </div>
              <div class="card-body p-0">
                <div *ngIf="sessions.length === 0" class="text-center py-5 text-secondary">
                  <i class="bi bi-journal-x fs-1 d-block mb-2"></i>
                  <p class="mb-0">No workout sessions logged yet.</p>
                  <small>Start a workout from the catalogue to record volume, sets, and duration!</small>
                </div>

                <div class="list-group list-group-flush" *ngIf="sessions.length > 0">
                  <div *ngFor="let s of sessions.slice(0, 5)" class="list-group-item bg-transparent border-secondary text-white py-3 px-4">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <h5 class="fw-bold mb-0 text-white">{{ s.workoutTitle || s.programName }}</h5>
                      <span class="badge bg-primary text-black font-monospace">
                        {{ s.totalVolumeKg || 0 }} kg volume
                      </span>
                    </div>
                    <div class="d-flex justify-content-between text-secondary small">
                      <span><i class="bi bi-stopwatch me-1"></i> {{ s.durationMinutes || 45 }} mins</span>
                      <span><i class="bi bi-check-all text-success me-1"></i> {{ (s.exercises || s.completedExercises || []).length }} exercises completed</span>
                      <span><i class="bi bi-calendar-event me-1"></i> {{ s.createdAt | date:'shortDate' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Quick Athlete Links & Profile Insights -->
          <div class="col-lg-5">
            <!-- Athlete Profile Snapshot -->
            <div class="card bg-card border-secondary mb-4 shadow">
              <div class="card-header bg-dark border-secondary py-3">
                <h5 class="text-white fw-bold mb-0">
                  <i class="bi bi-person-badge text-primary me-2"></i> Biometric Profile
                </h5>
              </div>
              <div class="card-body p-4">
                <div class="row g-3 text-center mb-3">
                  <div class="col-4">
                    <div class="p-2 rounded bg-dark border border-secondary">
                      <small class="text-secondary d-block">Age</small>
                      <strong class="text-white fs-5 font-monospace">{{ profile.age || 22 }}</strong>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 rounded bg-dark border border-secondary">
                      <small class="text-secondary d-block">Weight</small>
                      <strong class="text-white fs-5 font-monospace">{{ profile.weightKg || 75 }} kg</strong>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 rounded bg-dark border border-secondary">
                      <small class="text-secondary d-block">Height</small>
                      <strong class="text-white fs-5 font-monospace">{{ profile.heightCm || 175 }} cm</strong>
                    </div>
                  </div>
                </div>

                <div class="p-3 bg-dark rounded border border-secondary mb-3">
                  <div class="d-flex justify-content-between small text-secondary mb-1">
                    <span>Goal:</span>
                    <strong class="text-white text-uppercase">{{ profile.fitnessGoal || 'Hypertrophy / Gain' }}</strong>
                  </div>
                  <div class="d-flex justify-content-between small text-secondary mb-1">
                    <span>Activity Level:</span>
                    <strong class="text-white text-capitalize">{{ profile.activityLevel || 'Moderate' }}</strong>
                  </div>
                  <div class="d-flex justify-content-between small text-secondary">
                    <span>Experience:</span>
                    <strong class="text-white text-capitalize">{{ profile.experienceLevel || 'Intermediate' }}</strong>
                  </div>
                </div>

                <button class="btn btn-outline-primary w-100 py-2 btn-sm fw-bold" (click)="openProfileModal()">
                  <i class="bi bi-sliders me-1"></i> Update Biometrics
                </button>
              </div>
            </div>

            <!-- Quick Navigation Hub -->
            <div class="card bg-card border-secondary shadow">
              <div class="card-header bg-dark border-secondary py-3">
                <h5 class="text-white fw-bold mb-0">
                  <i class="bi bi-grid-fill text-primary me-2"></i> Athletic Training Hub
                </h5>
              </div>
              <div class="card-body p-3">
                <div class="d-grid gap-2">
                  <a routerLink="/workouts" class="btn btn-dark text-start border-secondary py-2 d-flex align-items-center">
                    <i class="bi bi-collection-play-fill text-primary me-3 fs-5"></i>
                    <div>
                      <div class="text-white fw-bold">Workout Catalogue</div>
                      <small class="text-secondary">Explore 8+ strength, hypertrophy, and home splits</small>
                    </div>
                  </a>
                  <a routerLink="/exercises" class="btn btn-dark text-start border-secondary py-2 d-flex align-items-center">
                    <i class="bi bi-book-half text-primary me-3 fs-5"></i>
                    <div>
                      <div class="text-white fw-bold">Exercise Library</div>
                      <small class="text-secondary">Form cues, safety notes, and anatomy breakdown</small>
                    </div>
                  </a>
                  <a routerLink="/planner" class="btn btn-dark text-start border-secondary py-2 d-flex align-items-center">
                    <i class="bi bi-calendar-week-fill text-primary me-3 fs-5"></i>
                    <div>
                      <div class="text-white fw-bold">Weekly Split Planner</div>
                      <small class="text-secondary">Customize your 7-day or 6-day periodization</small>
                    </div>
                  </a>
                  <a routerLink="/nutrition" class="btn btn-dark text-start border-secondary py-2 d-flex align-items-center">
                    <i class="bi bi-pie-chart-fill text-primary me-3 fs-5"></i>
                    <div>
                      <div class="text-white fw-bold">TDEE &amp; Macro Calculator</div>
                      <small class="text-secondary">Mifflin-St Jeor clinical calorie and macro distribution</small>
                    </div>
                  </a>
                  <a routerLink="/hydration" class="btn btn-dark text-start border-secondary py-2 d-flex align-items-center">
                    <i class="bi bi-droplet-half text-primary me-3 fs-5"></i>
                    <div>
                      <div class="text-white fw-bold">Hydration Tracker</div>
                      <small class="text-secondary">Log 250ml glasses toward 2,000ml cellular target</small>
                    </div>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- Edit Profile Modal Backdrop -->
    <div *ngIf="showProfileModal" class="modal-backdrop fade show"></div>
    <div *ngIf="showProfileModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-card border-secondary text-white">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-person-gear text-primary me-2"></i> Update Athlete Profile
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="showProfileModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label text-secondary small">Athlete Name</label>
              <input type="text" class="form-control bg-dark text-white border-secondary" [(ngModel)]="editName">
            </div>
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label text-secondary small">Age</label>
                <input type="number" class="form-control bg-dark text-white border-secondary" [(ngModel)]="editProfile.age">
              </div>
              <div class="col-6">
                <label class="form-label text-secondary small">Weight (kg)</label>
                <input type="number" class="form-control bg-dark text-white border-secondary" [(ngModel)]="editProfile.weightKg">
              </div>
            </div>
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label text-secondary small">Height (cm)</label>
                <input type="number" class="form-control bg-dark text-white border-secondary" [(ngModel)]="editProfile.heightCm">
              </div>
              <div class="col-6">
                <label class="form-label text-secondary small">Fitness Goal</label>
                <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="editProfile.fitnessGoal">
                  <option value="gain">Hypertrophy / Bulk</option>
                  <option value="maintain">Maintain Conditioning</option>
                  <option value="lose">Fat Loss / Cut</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label text-secondary small">Experience Level</label>
              <select class="form-select bg-dark text-white border-secondary" [(ngModel)]="editProfile.experienceLevel">
                <option value="beginner">Beginner (&lt; 1 Year)</option>
                <option value="intermediate">Intermediate (1–3 Years)</option>
                <option value="advanced">Advanced (3+ Years)</option>
              </select>
            </div>
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-outline-secondary" (click)="showProfileModal = false">Cancel</button>
            <button type="button" class="btn btn-primary fw-bold" (click)="saveProfileChanges()">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      min-height: 85vh;
      background-color: var(--goat-black, #080A09);
    }
    .bg-card {
      background-color: var(--goat-charcoal, #101411);
    }
    .hover-lift {
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
    }
    .hover-lift:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(32, 243, 107, 0.12);
    }
    .glow-orb {
      position: absolute;
      top: -60px;
      right: -60px;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(32, 243, 107, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  plannerService = inject(PlannerService);
  hydrationService = inject(HydrationService);
  nutritionService = inject(NutritionService);
  sessionService = inject(SessionService);
  router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  plan: WeeklyPlan | null = null;
  hydration: HydrationLog | null = null;
  nutrition: NutritionProfile | null = null;
  sessions: WorkoutSession[] = [];

  todayDayIndex = 0;
  todayDayName = 'Monday';
  todayDayPlan: DayPlan | null = null;

  showProfileModal = false;
  editName = '';
  editProfile: any = {};

  get athleteName(): string {
    if (this.auth.isGuest) return 'Guest Athlete';
    return this.user?.name || 'GOAT Athlete';
  }

  get profile(): any {
    return this.user?.profile || {
      age: 22,
      weightKg: 75,
      heightCm: 175,
      fitnessGoal: 'gain',
      activityLevel: 'moderate',
      experienceLevel: 'intermediate'
    };
  }

  get totalVolumeTonnage(): number {
    return this.sessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
  }

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    this.determineToday();
    this.loadAllData();
  }

  determineToday(): void {
    // JavaScript getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
    const jsDay = new Date().getDay();
    // In our 7-day split: 0 is Monday, 1 is Tuesday ... 6 is Sunday
    this.todayDayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    this.todayDayName = dayNames[this.todayDayIndex];
  }

  loadAllData(): void {
    this.plannerService.getWeeklyPlan().subscribe({
      next: (p) => {
        this.plan = p;
        if (p.days && p.days[this.todayDayIndex]) {
          this.todayDayPlan = p.days[this.todayDayIndex];
        }
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });

    this.hydrationService.getTodayHydration().subscribe({
      next: (h) => {
        this.hydration = h;
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });

    this.nutritionService.getProfile().subscribe({
      next: (n) => {
        this.nutrition = n;
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });

    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionService.getSessions().subscribe({
      next: (res) => {
        this.sessions = res.data || [];
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  toggleTodayComplete(): void {
    this.plannerService.toggleDayComplete(this.todayDayIndex).subscribe({
      next: (updatedPlan) => {
        this.plan = updatedPlan;
        if (updatedPlan.days && updatedPlan.days[this.todayDayIndex]) {
          this.todayDayPlan = updatedPlan.days[this.todayDayIndex];
        }
        this.cdr.markForCheck();
      }
    });
  }

  launchTodayWorkout(): void {
    if (!this.todayDayPlan) return;
    this.router.navigate(['/active-workout'], {
      queryParams: {
        title: this.todayDayPlan.workoutTitle || this.todayDayPlan.title,
        category: this.todayDayPlan.category
      }
    });
  }

  openProfileModal(): void {
    this.editName = this.user?.name || (this.auth.isGuest ? 'Guest Athlete' : '');
    this.editProfile = { ...this.profile };
    this.showProfileModal = true;
  }

  saveProfileChanges(): void {
    if (this.auth.isGuest) {
      if (this.user) {
        this.user.name = this.editName;
        this.user.profile = { ...this.editProfile };
      }
      this.showProfileModal = false;
      return;
    }

    this.auth.updateProfile({ name: this.editName, fitnessProfile: this.editProfile }).subscribe({
      next: (res) => {
        this.user = res.user;
        this.showProfileModal = false;
      },
      error: () => {
        this.showProfileModal = false;
      }
    });
  }
}
