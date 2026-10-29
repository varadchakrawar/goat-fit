import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';
import { Exercise } from '../../models/workout.models';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="exercises-page py-5">
      <div class="container py-lg-4">
        
        <!-- Header -->
        <div class="text-center mb-5">
          <div class="section-badge">BIOMECHANICAL MASTERY</div>
          <h1 class="section-title">EXERCISE <span class="text-neon">LIBRARY</span></h1>
          <p class="section-subtitle">
            Flawless execution guides, numbered movement steps, breathing cues, and injury prevention form breakdowns.
          </p>
        </div>

        <!-- Filter Controls -->
        <div class="filter-card goat-card mb-4 p-3 p-md-4">
          <div class="row g-3 align-items-center">
            
            <!-- Category Filter -->
            <div class="col-md-3 col-6">
              <label class="goat-label">Muscle Group</label>
              <select [(ngModel)]="selectedCategory" (change)="applyFilters()" class="goat-select">
                <option value="All">All Muscle Groups</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Legs">Legs</option>
                <option value="Shoulder">Shoulders</option>
                <option value="Arms">Arms</option>
                <option value="Abs">Core / Abs</option>
                <option value="Home Workout">Home / Calisthenics</option>
              </select>
            </div>

            <!-- Equipment Filter -->
            <div class="col-md-3 col-6">
              <label class="goat-label">Equipment</label>
              <select [(ngModel)]="selectedEquipment" (change)="applyFilters()" class="goat-select">
                <option value="All">All Equipment</option>
                <option value="Barbell">Barbell</option>
                <option value="Dumbbells">Dumbbells</option>
                <option value="Cables">Cables</option>
                <option value="Bodyweight">Bodyweight / None</option>
              </select>
            </div>

            <!-- Search Bar -->
            <div class="col-md-4 col-8">
              <label class="goat-label">Search Movement</label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Search bench, squat, deadlift..."
                class="goat-input"
              />
            </div>

            <!-- Clear -->
            <div class="col-md-2 col-4 d-flex align-items-end">
              <button (click)="resetFilters()" class="goat-btn-outline goat-btn-sm w-100 py-2">
                Reset
              </button>
            </div>

          </div>
        </div>

        <!-- Results Counter -->
        <div class="text-muted small mb-4">
          Showing <span class="text-white fw-bold">{{ exercises.length }}</span> movement guide(s)
        </div>

        <!-- Loading & Empty States -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-neon"></div>
          <div class="text-muted small mt-2">Loading exercise guides...</div>
        </div>

        <div *ngIf="!loading && exercises.length === 0" class="goat-card text-center py-5">
          <div class="font-bebas text-neon fs-2 mb-2">NO EXERCISES FOUND</div>
          <p class="text-muted small mb-3">Adjust your search keyword or clear filters.</p>
          <button (click)="resetFilters()" class="goat-btn-neon goat-btn-sm">Reset Filters</button>
        </div>

        <!-- Exercise Cards Grid -->
        <div *ngIf="!loading && exercises.length > 0" class="row g-4">
          <div *ngFor="let ex of exercises" class="col-md-6 col-lg-4">
            <div class="goat-card h-100 d-flex flex-column justify-content-between">
              
              <div>
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <span class="badge-dark">{{ ex.category }}</span>
                  <span class="badge-neon">{{ ex.difficulty }}</span>
                </div>

                <h4 class="text-white font-bebas fs-3 mb-2">{{ ex.name }}</h4>

                <div class="d-flex flex-wrap gap-2 text-muted small mb-3">
                  <span>🛠 {{ ex.equipment }}</span>
                  <span>&bull;</span>
                  <span>Target: <strong class="text-soft">{{ ex.targetMuscles[0] }}</strong></span>
                </div>

                <p class="text-muted-custom small mb-3 text-truncate-2">
                  {{ ex.instructions[0] }}
                </p>

                <!-- Quick form cue pills -->
                <div *ngIf="ex.movementCues" class="cue-pill p-2 rounded mb-3 small">
                  🎯 <strong>Cue:</strong> {{ ex.movementCues }}
                </div>
              </div>

              <!-- Button to Open Full Modal -->
              <button (click)="openDetail(ex)" class="goat-btn-outline goat-btn-sm w-100 mt-2">
                View Biomechanics & Mistakes &rarr;
              </button>

            </div>
          </div>
        </div>

      </div>

      <!-- Detail Modal -->
      <div *ngIf="selectedExercise" class="custom-modal-backdrop d-flex align-items-center justify-content-center p-3">
        <div class="goat-card p-4 p-md-5 modal-box" style="width: 720px; max-width: 100%; max-height: 90vh; overflow-y: auto;">
          
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div class="d-flex gap-2 mb-1">
                <span class="badge-dark">{{ selectedExercise.category }}</span>
                <span class="badge-neon">{{ selectedExercise.difficulty }}</span>
                <span class="badge bg-secondary bg-opacity-25 text-soft">{{ selectedExercise.equipment }}</span>
              </div>
              <h2 class="font-bebas text-white fs-2 mb-0">{{ selectedExercise.name }}</h2>
            </div>
            <button (click)="selectedExercise = null" class="btn-close btn-close-white"></button>
          </div>

          <!-- Target Muscles -->
          <div class="mb-4 p-3 rounded spec-box">
            <div class="d-flex flex-wrap gap-4">
              <div>
                <div class="text-muted small text-uppercase">Primary Muscles</div>
                <div class="fw-bold text-neon small">{{ selectedExercise.targetMuscles.join(', ') }}</div>
              </div>
              <div *ngIf="selectedExercise.secondaryMuscles && selectedExercise.secondaryMuscles.length > 0">
                <div class="text-muted small text-uppercase">Secondary Muscles</div>
                <div class="fw-bold text-soft small">{{ selectedExercise.secondaryMuscles.join(', ') }}</div>
              </div>
            </div>
          </div>

          <!-- Step-by-Step Instructions -->
          <div class="mb-4">
            <h5 class="font-bebas text-white fs-4 mb-3">STEP-BY-STEP EXECUTION</h5>
            <ol class="instruction-list ps-3 text-soft small d-flex flex-column gap-2 mb-0">
              <li *ngFor="let step of selectedExercise.instructions">
                {{ step }}
              </li>
            </ol>
          </div>

          <!-- Breathing & Movement Cues -->
          <div class="row g-3 mb-4">
            <div class="col-md-6" *ngIf="selectedExercise.breathingCues">
              <div class="p-3 rounded spec-box h-100">
                <div class="text-neon small fw-bold mb-1">🌬 BREATHING CADENCE</div>
                <p class="text-muted-custom small mb-0">{{ selectedExercise.breathingCues }}</p>
              </div>
            </div>
            <div class="col-md-6" *ngIf="selectedExercise.movementCues">
              <div class="p-3 rounded spec-box h-100">
                <div class="text-neon small fw-bold mb-1">🧠 MOVEMENT CUE</div>
                <p class="text-muted-custom small mb-0">{{ selectedExercise.movementCues }}</p>
              </div>
            </div>
          </div>

          <!-- Common Form Mistakes -->
          <div *ngIf="selectedExercise.commonMistakes && selectedExercise.commonMistakes.length > 0" class="mb-4 p-3 rounded mistake-box">
            <h5 class="text-warning font-bebas fs-4 mb-2">⚠️ COMMON FORM MISTAKES TO AVOID</h5>
            <ul class="ps-3 text-soft small mb-0 d-flex flex-column gap-1">
              <li *ngFor="let mistake of selectedExercise.commonMistakes">
                {{ mistake }}
              </li>
            </ul>
          </div>

          <!-- Safety Guidance -->
          <div *ngIf="selectedExercise.safetyNotes" class="mb-4 p-3 rounded spec-box">
            <div class="text-info small fw-bold mb-1">🛡 SAFETY & RECOVERY NOTE</div>
            <p class="text-muted-custom small mb-0">{{ selectedExercise.safetyNotes }}</p>
          </div>

          <div class="d-flex justify-content-end">
            <button (click)="selectedExercise = null" class="goat-btn-neon goat-btn-sm">
              Done Reading Guide
            </button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .exercises-page {
      background: var(--bg-primary);
      min-height: 80vh;
    }

    .cue-pill {
      background: rgba(32, 243, 107, 0.06);
      border-left: 3px solid var(--accent-neon);
      color: var(--text-soft);
    }

    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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

    .spec-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
    }

    .mistake-box {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .instruction-list li::marker {
      color: var(--accent-neon);
      font-weight: bold;
    }
  `]
})
export class ExercisesComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private cdr = inject(ChangeDetectorRef);

  public selectedCategory = 'All';
  public selectedEquipment = 'All';
  public searchQuery = '';
  public exercises: Exercise[] = [];
  public selectedExercise: Exercise | null = null;
  public loading = true;

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    this.loading = true;
    this.cdr.markForCheck();
    this.workoutService
      .getExercises({
        category: this.selectedCategory !== 'All' ? this.selectedCategory : undefined,
        equipment: this.selectedEquipment !== 'All' ? this.selectedEquipment : undefined,
        search: this.searchQuery.trim() || undefined
      })
      .subscribe({
        next: (res) => {
          this.exercises = res.data;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  resetFilters() {
    this.selectedCategory = 'All';
    this.selectedEquipment = 'All';
    this.searchQuery = '';
    this.applyFilters();
  }

  openDetail(ex: Exercise) {
    this.selectedExercise = ex;
  }
}
