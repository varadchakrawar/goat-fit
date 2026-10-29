import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';
import { WorkoutProgram } from '../../models/workout.models';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="workouts-page py-5">
      <div class="container py-lg-4">
        
        <!-- Header -->
        <div class="text-center mb-5">
          <div class="section-badge">SPLIT ARCHITECTURE</div>
          <h1 class="section-title">WORKOUT <span class="text-neon">PROGRAMS</span></h1>
          <p class="section-subtitle">
            Scientifically structured training splits built for maximum hypertrophy, explosive strength, and athletic longevity.
          </p>
        </div>

        <!-- Filter Controls -->
        <div class="filter-card goat-card mb-4 p-3 p-md-4">
          
          <!-- Category Tabs -->
          <div class="category-tabs d-flex flex-wrap gap-2 mb-3">
            <button
              *ngFor="let cat of categories"
              (click)="selectCategory(cat)"
              class="cat-tab-btn"
              [class.active]="selectedCategory === cat"
            >
              {{ cat }}
            </button>
          </div>

          <!-- Difficulty, Search, Sort & Clear -->
          <div class="row g-3 align-items-center">
            
            <!-- Difficulty Selector -->
            <div class="col-md-3 col-6">
              <label class="goat-label">Difficulty</label>
              <select [(ngModel)]="selectedDifficulty" (change)="applyFilters()" class="goat-select">
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <!-- Sort Option -->
            <div class="col-md-3 col-6">
              <label class="goat-label">Sort By</label>
              <select [(ngModel)]="selectedSort" (change)="applyFilters()" class="goat-select">
                <option value="featured">Featured First</option>
                <option value="duration_asc">Duration: Shortest</option>
                <option value="duration_desc">Duration: Longest</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

            <!-- Search Bar -->
            <div class="col-md-4 col-8">
              <label class="goat-label">Search Programs</label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                placeholder="Search chest, deadlift, barbell..."
                class="goat-input"
              />
            </div>

            <!-- Clear Button -->
            <div class="col-md-2 col-4 d-flex align-items-end">
              <button (click)="resetFilters()" class="goat-btn-outline goat-btn-sm w-100 py-2">
                Reset
              </button>
            </div>

          </div>
        </div>

        <!-- Active Filter Indicator -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div class="text-muted small">
            Showing <span class="text-white fw-bold">{{ programs.length }}</span> workout program(s)
            <span *ngIf="selectedCategory !== 'All'" class="text-neon ms-1">&bull; {{ selectedCategory }}</span>
            <span *ngIf="selectedDifficulty !== 'All'" class="text-neon ms-1">&bull; {{ selectedDifficulty }}</span>
          </div>
        </div>

        <!-- Programs Grid -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-neon" role="status">
            <span class="visually-hidden">Loading programs...</span>
          </div>
          <div class="text-muted small mt-2">Loading training splits...</div>
        </div>

        <div *ngIf="!loading && programs.length === 0" class="empty-state goat-card text-center py-5">
          <div class="font-bebas text-neon fs-2 mb-2">NO MATCHING PROGRAMS FOUND</div>
          <p class="text-muted small mb-3">Try clearing or adjusting your category, difficulty, or search terms.</p>
          <button (click)="resetFilters()" class="goat-btn-neon goat-btn-sm">
            Reset Filters
          </button>
        </div>

        <div *ngIf="!loading && programs.length > 0" class="row g-4">
          <div *ngFor="let prog of programs" class="col-md-6 col-lg-4">
            <div class="workout-card goat-card h-100 d-flex flex-column p-0">
              
              <!-- Image Banner -->
              <div class="workout-card-img-wrap position-relative">
                <img
                  [src]="prog.imageUrl || 'assets/images/image-4-1.jpg'"
                  [alt]="prog.name"
                  class="workout-card-img"
                  onerror="this.src='assets/images/chest-program.jpg'"
                />
                <span class="badge-neon position-absolute top-0 end-0 m-3">{{ prog.difficulty }}</span>
                <span class="badge-dark position-absolute top-0 start-0 m-3">{{ prog.category }}</span>
              </div>

              <!-- Body Details -->
              <div class="p-3 p-md-4 d-flex flex-column flex-grow-1">
                
                <div class="d-flex align-items-center gap-3 text-muted small mb-2">
                  <span>⏱ ~{{ prog.durationMinutes }} mins</span>
                  <span>&bull;</span>
                  <span>{{ prog.exercises ? prog.exercises.length : 4 }} Exercises</span>
                </div>

                <h4 class="text-white font-bebas fs-3 mb-2">{{ prog.name }}</h4>
                <p class="text-muted-custom small mb-3 flex-grow-1">
                  {{ prog.description }}
                </p>

                <!-- Target Muscle Tags -->
                <div *ngIf="prog.targetMuscles && prog.targetMuscles.length > 0" class="d-flex flex-wrap gap-1 mb-3">
                  <span *ngFor="let muscle of prog.targetMuscles.slice(0, 3)" class="badge bg-secondary bg-opacity-25 text-soft" style="font-size: 0.7rem;">
                    {{ muscle }}
                  </span>
                </div>

                <!-- Action Buttons -->
                <div class="d-flex gap-2 pt-2 border-top border-secondary border-opacity-10">
                  <a [routerLink]="['/workouts', prog.slug]" class="goat-btn-outline goat-btn-sm w-50 text-decoration-none text-center">
                    View Details
                  </a>
                  <a [routerLink]="['/active-workout']" [queryParams]="{programSlug: prog.slug}" class="goat-btn-neon goat-btn-sm w-50 text-decoration-none text-center">
                    Start Lift
                  </a>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .workouts-page {
      background: var(--bg-primary);
      min-height: 80vh;
    }

    .cat-tab-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-soft);
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.45rem 1rem;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cat-tab-btn:hover {
      border-color: var(--accent-neon-border);
      color: var(--accent-neon);
      background: rgba(32, 243, 107, 0.08);
    }

    .cat-tab-btn.active {
      background: var(--accent-neon);
      color: var(--text-dark);
      border-color: var(--accent-neon);
      box-shadow: 0 0 12px rgba(32, 243, 107, 0.4);
    }

    .workout-card-img-wrap {
      height: 210px;
      overflow: hidden;
    }

    .workout-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .workout-card:hover .workout-card-img {
      transform: scale(1.05);
    }
  `]
})
export class WorkoutsComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  public categories = ['All', 'Chest', 'Back', 'Shoulder', 'Arms', 'Legs', 'Abs', 'Full Body', 'Home Workout'];
  public selectedCategory = 'All';
  public selectedDifficulty = 'All';
  public selectedSort = 'featured';
  public searchQuery = '';

  public programs: WorkoutProgram[] = [];
  public loading = true;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.applyFilters();
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.loading = true;
    this.cdr.markForCheck();
    this.workoutService
      .getPrograms({
        category: this.selectedCategory !== 'All' ? this.selectedCategory : undefined,
        difficulty: this.selectedDifficulty !== 'All' ? this.selectedDifficulty : undefined,
        search: this.searchQuery.trim() || undefined,
        sort: this.selectedSort
      })
      .subscribe({
        next: (res) => {
          this.programs = res.data;
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
    this.selectedDifficulty = 'All';
    this.selectedSort = 'featured';
    this.searchQuery = '';
    this.applyFilters();
  }
}
