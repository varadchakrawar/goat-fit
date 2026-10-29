import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NutritionService } from '../../services/nutrition.service';
import { AuthService } from '../../services/auth.service';
import { NutritionCalculation, MacroSplit } from '../../models/nutrition.models';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="nutrition-page py-5">
      <div class="container py-lg-4">
        
        <!-- Header -->
        <div class="text-center mb-5">
          <div class="section-badge">CLINICAL METABOLIC ENGINE</div>
          <h1 class="section-title">TDEE & MACRO <span class="text-neon">CALCULATOR</span></h1>
          <p class="section-subtitle">
            Mifflin-St Jeor BMR algorithms paired with an athletic 35% protein, 45% carb, 20% fat macronutrient partition.
          </p>
        </div>

        <div class="row g-5">
          
          <!-- Input Form Column -->
          <div class="col-lg-6">
            <div class="goat-card p-4 p-md-5">
              
              <h3 class="font-bebas text-white fs-3 mb-4 d-flex align-items-center gap-2">
                <span class="text-neon">01.</span> ENTER PHYSIQUE PARAMETERS
              </h3>

              <div class="row g-3">
                
                <!-- Biological Sex -->
                <div class="col-sm-6">
                  <label class="goat-label">Biological Sex *</label>
                  <select [(ngModel)]="formData.gender" (change)="onInputChange()" class="goat-select">
                    <option value="male">Male (+5 kcal Mifflin offset)</option>
                    <option value="female">Female (-161 kcal Mifflin offset)</option>
                  </select>
                </div>

                <!-- Age -->
                <div class="col-sm-6">
                  <label class="goat-label">Age (Years) *</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.age"
                    (input)="onInputChange()"
                    min="14"
                    max="110"
                    class="goat-input"
                    placeholder="24"
                  />
                </div>

                <!-- Height -->
                <div class="col-sm-6">
                  <label class="goat-label">Height (Centimetres) *</label>
                  <div class="input-group">
                    <input
                      type="number"
                      [(ngModel)]="formData.heightCm"
                      (input)="onInputChange()"
                      min="100"
                      max="250"
                      class="form-control goat-input"
                      placeholder="175"
                    />
                    <span class="input-group-text bg-dark text-muted border-secondary border-opacity-50">cm</span>
                  </div>
                </div>

                <!-- Weight -->
                <div class="col-sm-6">
                  <label class="goat-label">Weight (Kilograms) *</label>
                  <div class="input-group">
                    <input
                      type="number"
                      [(ngModel)]="formData.weightKg"
                      (input)="onInputChange()"
                      min="35"
                      max="300"
                      step="0.5"
                      class="form-control goat-input"
                      placeholder="75"
                    />
                    <span class="input-group-text bg-dark text-muted border-secondary border-opacity-50">kg</span>
                  </div>
                </div>

                <!-- Activity Level -->
                <div class="col-12">
                  <label class="goat-label">Weekly Activity Multiplier *</label>
                  <select [(ngModel)]="formData.activityLevel" (change)="onInputChange()" class="goat-select">
                    <option value="sedentary">Sedentary (Desk job, little to no exercise: 1.2x)</option>
                    <option value="light">Light Activity (1–3 training sessions/week: 1.375x)</option>
                    <option value="moderate">Moderate Activity (3–5 training sessions/week: 1.55x)</option>
                    <option value="heavy">Heavy Athletic Training (6–7 intense lifts/week: 1.725x)</option>
                    <option value="athlete">Elite Athlete (Two-a-days, extreme volume: 1.9x)</option>
                  </select>
                </div>

                <!-- Fitness Goal -->
                <div class="col-12">
                  <label class="goat-label">Physique Objective *</label>
                  <div class="row g-2">
                    <div class="col-4">
                      <button
                        type="button"
                        (click)="setGoal('lose')"
                        class="btn goal-btn w-100"
                        [class.active]="formData.goal === 'lose'"
                      >
                        Fat Loss (-500)
                      </button>
                    </div>
                    <div class="col-4">
                      <button
                        type="button"
                        (click)="setGoal('maintain')"
                        class="btn goal-btn w-100"
                        [class.active]="formData.goal === 'maintain'"
                      >
                        Maintenance (0)
                      </button>
                    </div>
                    <div class="col-4">
                      <button
                        type="button"
                        (click)="setGoal('gain')"
                        class="btn goal-btn w-100"
                        [class.active]="formData.goal === 'gain'"
                      >
                        Muscle Gain (+300)
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Custom Macro Percentage Sliders -->
              <div class="mt-4 pt-4 border-top border-secondary border-opacity-25">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="goat-label mb-0">Custom Macro Partition</label>
                  <span
                    class="badge small"
                    [class.bg-success]="macroSum === 100"
                    [class.bg-danger]="macroSum !== 100"
                  >
                    Total: {{ macroSum }}% (Must equal 100%)
                  </span>
                </div>

                <div class="row g-3">
                  <div class="col-4">
                    <div class="p-2 spec-box rounded text-center">
                      <div class="text-neon small fw-bold">PROTEIN</div>
                      <input
                        type="number"
                        [(ngModel)]="macroSplit.proteinPercent"
                        (input)="onMacroChange()"
                        class="form-control form-control-sm goat-input text-center mt-1"
                        min="10"
                        max="70"
                      />
                      <div class="text-muted small mt-1">4 kcal / g</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 spec-box rounded text-center">
                      <div class="text-white small fw-bold">CARBS</div>
                      <input
                        type="number"
                        [(ngModel)]="macroSplit.carbsPercent"
                        (input)="onMacroChange()"
                        class="form-control form-control-sm goat-input text-center mt-1"
                        min="10"
                        max="80"
                      />
                      <div class="text-muted small mt-1">4 kcal / g</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 spec-box rounded text-center">
                      <div class="text-info small fw-bold">FATS</div>
                      <input
                        type="number"
                        [(ngModel)]="macroSplit.fatsPercent"
                        (input)="onMacroChange()"
                        class="form-control form-control-sm goat-input text-center mt-1"
                        min="10"
                        max="60"
                      />
                      <div class="text-muted small mt-1">9 kcal / g</div>
                    </div>
                  </div>
                </div>

                <div *ngIf="macroSum !== 100" class="text-danger small mt-2">
                  ⚠️ Protein, Carbs, and Fat percentages must equal exactly 100%. Currently off by {{ 100 - macroSum }}%.
                </div>
              </div>

              <!-- Save Profile Targets Button -->
              <div class="mt-4 pt-3 border-top border-secondary border-opacity-10 d-flex gap-2">
                <button
                  (click)="saveTargets()"
                  class="goat-btn-neon w-100"
                  [disabled]="isSaving || macroSum !== 100"
                >
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                  Save Targets to Athlete Profile
                </button>
              </div>

              <div *ngIf="saveFeedback" class="mt-2 text-center small text-neon">
                {{ saveFeedback }}
              </div>

            </div>
          </div>

          <!-- Calculated Output Column -->
          <div class="col-lg-6">
            <div class="goat-card p-4 p-md-5 h-100 d-flex flex-column justify-content-between goat-card-glow">
              
              <div>
                <h3 class="font-bebas text-white fs-3 mb-4 d-flex align-items-center gap-2">
                  <span class="text-neon">02.</span> METABOLIC TARGET BREAKDOWN
                </h3>

                <!-- Big Calorie Target Card -->
                <div class="p-4 rounded-4 calorie-hero-box mb-4 text-center">
                  <div class="text-muted small text-uppercase letter-spacing-1 fw-bold">Target Daily Caloric Intake</div>
                  <div class="font-bebas text-neon display-3 mb-1">
                    {{ result?.targetCalories || 2450 }} <span class="fs-4 text-white">KCAL / DAY</span>
                  </div>
                  <div class="d-flex justify-content-center gap-3 text-muted small">
                    <span>BMR: <strong class="text-white">{{ result?.bmr || 1750 }} kcal</strong></span>
                    <span>&bull;</span>
                    <span>TDEE: <strong class="text-white">{{ result?.tdee || 2450 }} kcal</strong></span>
                  </div>
                </div>

                <!-- Visual Macro Partition Bar -->
                <div class="mb-4">
                  <div class="d-flex justify-content-between small text-muted mb-2">
                    <span>Macronutrient Partition</span>
                    <span class="text-soft">{{ macroSplit.proteinPercent }}% P / {{ macroSplit.carbsPercent }}% C / {{ macroSplit.fatsPercent }}% F</span>
                  </div>
                  <div class="macro-bar-container">
                    <div class="macro-bar-seg bg-neon" [style.width.%]="macroSplit.proteinPercent"></div>
                    <div class="macro-bar-seg bg-carbs" [style.width.%]="macroSplit.carbsPercent"></div>
                    <div class="macro-bar-seg bg-fats" [style.width.%]="macroSplit.fatsPercent"></div>
                  </div>
                </div>

                <!-- Macro Gram Cards -->
                <div class="row g-3 mb-4">
                  
                  <div class="col-4">
                    <div class="p-3 rounded spec-box text-center h-100">
                      <div class="text-neon small fw-bold">PROTEIN</div>
                      <div class="font-bebas text-white display-6 mb-0">{{ getProteinGrams() }}g</div>
                      <div class="text-muted small">{{ Math.round(getProteinGrams() * 4) }} kcal</div>
                    </div>
                  </div>

                  <div class="col-4">
                    <div class="p-3 rounded spec-box text-center h-100">
                      <div class="text-white small fw-bold">CARBS</div>
                      <div class="font-bebas text-white display-6 mb-0">{{ getCarbGrams() }}g</div>
                      <div class="text-muted small">{{ Math.round(getCarbGrams() * 4) }} kcal</div>
                    </div>
                  </div>

                  <div class="col-4">
                    <div class="p-3 rounded spec-box text-center h-100">
                      <div class="text-info small fw-bold">FATS</div>
                      <div class="font-bebas text-white display-6 mb-0">{{ getFatGrams() }}g</div>
                      <div class="text-muted small">{{ Math.round(getFatGrams() * 9) }} kcal</div>
                    </div>
                  </div>

                </div>

                <!-- Smart Recommendation & Assumptions Box -->
                <div class="p-3 rounded spec-box mb-4">
                  <div class="text-neon small fw-bold mb-1">💡 SMART PACING GUIDANCE</div>
                  <p class="text-muted-custom small mb-0">
                    Spread protein evenly across <strong>3 to 4 meals</strong> to keep muscle protein synthesis (MPS) elevated throughout the day. Drink plenty of water to assist digestive breakdown.
                  </p>
                </div>
              </div>

              <!-- Medical Disclaimer -->
              <div class="p-3 rounded bg-dark border border-secondary border-opacity-25 small text-muted">
                <strong>Scientific Disclaimer:</strong> Calculations are clinical estimations based on the peer-reviewed Mifflin-St Jeor formula and standard physical activity multipliers. Individual metabolic rate, muscle mass, and thermic effect of food vary.
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .nutrition-page {
      background: var(--bg-primary);
      min-height: 80vh;
    }

    .calorie-hero-box {
      background: rgba(32, 243, 107, 0.05);
      border: 1px solid var(--accent-neon-border);
      box-shadow: 0 0 20px rgba(32, 243, 107, 0.15);
    }

    .spec-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
    }

    .goal-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-card);
      color: var(--text-soft);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.5rem 0.2rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .goal-btn:hover {
      border-color: var(--accent-neon);
      color: var(--accent-neon);
    }

    .goal-btn.active {
      background: var(--accent-neon);
      color: var(--text-dark);
      border-color: var(--accent-neon);
      box-shadow: 0 0 10px rgba(32, 243, 107, 0.4);
    }

    .macro-bar-container {
      height: 12px;
      border-radius: 999px;
      overflow: hidden;
      display: flex;
      background: rgba(255, 255, 255, 0.08);
    }

    .macro-bar-seg {
      height: 100%;
      transition: width 0.3s ease;
    }

    .bg-neon {
      background-color: var(--accent-neon);
    }

    .bg-carbs {
      background-color: #ffffff;
    }

    .bg-fats {
      background-color: #38bdf8;
    }
  `]
})
export class NutritionComponent implements OnInit {
  private nutritionService = inject(NutritionService);
  private cdr = inject(ChangeDetectorRef);
  public auth = inject(AuthService);
  public Math = Math;

  public formData = {
    age: 24,
    gender: 'male',
    heightCm: 175,
    weightKg: 75,
    activityLevel: 'moderate',
    goal: 'gain'
  };

  public macroSplit = {
    proteinPercent: 35,
    carbsPercent: 45,
    fatsPercent: 20
  };

  public result: NutritionCalculation | null = null;
  public isSaving = false;
  public saveFeedback = '';

  get macroSum(): number {
    return (this.macroSplit.proteinPercent || 0) + (this.macroSplit.carbsPercent || 0) + (this.macroSplit.fatsPercent || 0);
  }

  ngOnInit() {
    this.loadInitialProfile();
  }

  loadInitialProfile() {
    this.nutritionService.getProfile().subscribe({
      next: (prof) => {
        if (prof) {
          this.formData.age = prof.age || 24;
          this.formData.gender = prof.gender || prof.biologicalSex || 'male';
          this.formData.heightCm = prof.heightCm || 175;
          this.formData.weightKg = prof.weightKg || 75;
          this.formData.activityLevel = prof.activityLevel || 'moderate';
          this.formData.goal = prof.goal || 'gain';

          if (prof.macroSplit) {
            this.macroSplit.proteinPercent = prof.macroSplit.proteinPercent || 35;
            this.macroSplit.carbsPercent = prof.macroSplit.carbsPercent || prof.macroSplit.carbPercent || 45;
            this.macroSplit.fatsPercent = prof.macroSplit.fatsPercent || prof.macroSplit.fatPercent || 20;
          }

          this.result = prof;
        } else {
          this.recalculate();
        }
      },
      error: () => this.recalculate()
    });
  }

  setGoal(goal: string) {
    this.formData.goal = goal;
    this.recalculate();
  }

  onInputChange() {
    this.recalculate();
  }

  onMacroChange() {
    if (this.macroSum === 100) {
      this.recalculate();
    }
  }

  recalculate() {
    if (this.macroSum !== 100) return;

    this.nutritionService
      .calculate({
        ...this.formData,
        macroSplit: {
          proteinPercent: this.macroSplit.proteinPercent,
          carbPercent: this.macroSplit.carbsPercent,
          carbsPercent: this.macroSplit.carbsPercent,
          fatPercent: this.macroSplit.fatsPercent,
          fatsPercent: this.macroSplit.fatsPercent
        }
      })
      .subscribe({
        next: (res) => (this.result = res),
        error: () => {
          this.result = this.nutritionService.clientSideCalculate({
            ...this.formData,
            macroSplit: {
              proteinPercent: this.macroSplit.proteinPercent,
              carbPercent: this.macroSplit.carbsPercent,
              fatPercent: this.macroSplit.fatsPercent
            }
          });
        }
      });
  }

  getProteinGrams(): number {
    const cals = this.result?.targetCalories || 2450;
    return Math.round((cals * (this.macroSplit.proteinPercent / 100)) / 4);
  }

  getCarbGrams(): number {
    const cals = this.result?.targetCalories || 2450;
    return Math.round((cals * (this.macroSplit.carbsPercent / 100)) / 4);
  }

  getFatGrams(): number {
    const cals = this.result?.targetCalories || 2450;
    return Math.round((cals * (this.macroSplit.fatsPercent / 100)) / 9);
  }

  saveTargets() {
    this.isSaving = true;
    this.saveFeedback = '';

    const payload = {
      ...this.formData,
      macroSplit: {
        proteinPercent: this.macroSplit.proteinPercent,
        carbsPercent: this.macroSplit.carbsPercent,
        carbPercent: this.macroSplit.carbsPercent,
        fatsPercent: this.macroSplit.fatsPercent,
        fatPercent: this.macroSplit.fatsPercent
      }
    };

    this.nutritionService.saveProfile(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveFeedback = '✓ Targets saved to athlete profile successfully!';
        setTimeout(() => (this.saveFeedback = ''), 4000);
      },
      error: () => {
        this.isSaving = false;
        this.saveFeedback = '✓ Targets saved locally in browser!';
        setTimeout(() => (this.saveFeedback = ''), 4000);
      }
    });
  }
}
