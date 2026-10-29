import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicService } from '../../services/public.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <footer class="goat-footer pt-5 pb-4 border-top border-secondary border-opacity-25">
      <div class="container">
        
        <div class="row g-4 mb-5">
          
          <!-- Column 1: Brand & Tagline -->
          <div class="col-lg-4 col-md-6">
            <div class="d-flex align-items-center gap-2 mb-3">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#20F36B" stroke-width="2">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z"/>
                <path d="M7 10L12 15L17 10"/>
              </svg>
              <span class="font-bebas text-white fs-3">GOAT <span class="text-neon">FIT</span></span>
            </div>
            <p class="text-muted-custom small mb-3">
              A science-backed athletic architecture combining elite training splits, step-by-step barbell execution cues, Mifflin-St Jeor TDEE calculations, and hydration tracking.
            </p>
            <div class="brand-tagline-box">
              <span class="text-neon font-bebas fs-5">"BE YOUR OWN GOAT"</span>
            </div>
          </div>

          <!-- Column 2: Programs & Exercises -->
          <div class="col-lg-2 col-md-3 col-6">
            <h6 class="footer-col-title">Training</h6>
            <ul class="footer-links-list list-unstyled">
              <li><a routerLink="/workouts" [queryParams]="{category: 'Chest'}">Chest Hypertrophy</a></li>
              <li><a routerLink="/workouts" [queryParams]="{category: 'Back'}">V-Taper Back & Pulls</a></li>
              <li><a routerLink="/workouts" [queryParams]="{category: 'Legs'}">Leg Powerhouse</a></li>
              <li><a routerLink="/workouts" [queryParams]="{category: 'Shoulder'}">Boulder Shoulders</a></li>
              <li><a routerLink="/workouts" [queryParams]="{category: 'Home Workout'}">Home Calisthenics</a></li>
              <li><a routerLink="/exercises">Exercise Library</a></li>
            </ul>
          </div>

          <!-- Column 3: Tools & Curriculum -->
          <div class="col-lg-2 col-md-3 col-6">
            <h6 class="footer-col-title">Athletic Tools</h6>
            <ul class="footer-links-list list-unstyled">
              <li><a routerLink="/planner">7-Day Split Planner</a></li>
              <li><a routerLink="/nutrition">TDEE & Macro Calculator</a></li>
              <li><a routerLink="/hydration">Hydration Tracker</a></li>
              <li><a routerLink="/dashboard">Athlete Progress PRs</a></li>
            </ul>
          </div>

          <!-- Column 4: GOAT Dispatch Newsletter -->
          <div class="col-lg-4 col-md-12">
            <h6 class="footer-col-title">THE GOAT DISPATCH</h6>
            <p class="text-muted-custom small mb-3">
              High-yield workout breakdowns, nutritional science, and progressive overload pacing delivered every Sunday. Zero spam.
            </p>

            <form (ngSubmit)="subscribe()" class="newsletter-form">
              <div class="input-group">
                <input
                  type="email"
                  [(ngModel)]="emailInput"
                  name="email"
                  placeholder="athlete@domain.com"
                  required
                  class="form-control goat-input"
                  [disabled]="isSubscribing"
                />
                <button
                  type="submit"
                  class="btn goat-btn-neon"
                  [disabled]="isSubscribing || !emailInput"
                >
                  <span *ngIf="isSubscribing" class="spinner-border spinner-border-sm me-1"></span>
                  Join
                </button>
              </div>
            </form>

            <div *ngIf="subscriptionMessage" class="mt-2 small" [class.text-neon]="subscriptionSuccess" [class.text-danger]="!subscriptionSuccess">
              {{ subscriptionMessage }}
            </div>
          </div>

        </div>

        <!-- Bottom Row: Disclaimer & Athletic Credits -->
        <div class="pt-4 border-top border-secondary border-opacity-10 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-muted-custom small">
          <div>
            &copy; {{ currentYear }} GOAT FIT. High-Performance Athletic Training &amp; Hypertrophy Platform.
          </div>
          <div class="d-flex align-items-center gap-3">
            <span>Built for Athletes</span>
            <span>&bull;</span>
            <a routerLink="/workouts" class="text-decoration-none text-muted-custom hover-neon">Programs</a>
            <span>&bull;</span>
            <a routerLink="/auth" class="text-decoration-none text-muted-custom hover-neon">Athlete Portal</a>
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    .goat-footer {
      background: var(--bg-secondary);
    }

    .brand-tagline-box {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      background: rgba(32, 243, 107, 0.08);
      border: 1px dashed var(--accent-neon-border);
    }

    .footer-col-title {
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-white);
      margin-bottom: 1.25rem;
    }

    .footer-links-list li {
      margin-bottom: 0.65rem;
    }

    .footer-links-list a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s ease, transform 0.2s ease;
      display: inline-block;
    }

    .footer-links-list a:hover {
      color: var(--accent-neon);
      transform: translateX(3px);
    }

    .hover-neon:hover {
      color: var(--accent-neon) !important;
    }
  `]
})
export class FooterComponent {
  private publicService = inject(PublicService);
  private cdr = inject(ChangeDetectorRef);

  public emailInput = '';
  public isSubscribing = false;
  public subscriptionMessage = '';
  public subscriptionSuccess = false;
  public currentYear = new Date().getFullYear();

  subscribe() {
    if (!this.emailInput || !this.emailInput.includes('@')) {
      this.subscriptionSuccess = false;
      this.subscriptionMessage = 'Please enter a valid email address.';
      this.cdr.markForCheck();
      return;
    }

    this.isSubscribing = true;
    this.subscriptionMessage = '';
    this.cdr.markForCheck();

    this.publicService.subscribeNewsletter(this.emailInput).subscribe({
      next: (res) => {
        this.isSubscribing = false;
        this.subscriptionSuccess = res.success;
        this.subscriptionMessage = res.message;
        if (res.success) {
          this.emailInput = '';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSubscribing = false;
        this.subscriptionSuccess = false;
        this.subscriptionMessage = err.message || 'Subscription failed. Please check your network.';
        this.cdr.markForCheck();
      }
    });
  }
}
