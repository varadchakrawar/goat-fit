import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';
import { PublicService, PlatformStats, FaqItem } from '../../services/public.service';
import { AuthService } from '../../services/auth.service';
import { WorkoutProgram } from '../../models/workout.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="home-container">
      
      <!-- HERO SECTION -->
      <section class="hero-section position-relative overflow-hidden">
        <div class="hero-backdrop"></div>
        <div class="container position-relative py-5 my-lg-4">
          <div class="row align-items-center g-5">
            
            <div class="col-lg-7 text-center text-lg-start">
              <div class="section-badge mb-3">
                <span class="badge-dot"></span> NEXT-GEN ATHLETIC ARCHITECTURE
              </div>
              <h1 class="hero-headline font-bebas">
                UNLEASH YOUR <span class="text-neon neon-glow">INNER BEAST.</span>
              </h1>
              <p class="hero-subtext mb-4">
                A science-backed fitness ecosystem combining elite training splits, real-time exercise coaching, clinical Mifflin-St Jeor TDEE macro targets, and precision hydration tracking.
              </p>

              <div class="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start mb-4">
                <a routerLink="/dashboard" class="goat-btn-neon fs-6 px-4 py-3 text-decoration-none">
                  START YOUR JOURNEY
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
                <a routerLink="/workouts" class="goat-btn-outline fs-6 px-4 py-3 text-decoration-none">
                  EXPLORE WORKOUTS
                </a>
                <button *ngIf="!auth.isAuthenticated" (click)="auth.enterGuestMode()" class="btn btn-link text-muted-custom small text-decoration-none d-flex align-items-center">
                  Try Unlocked Demo &rarr;
                </button>
              </div>

              <!-- Live Platform Metrics -->
              <div class="hero-stats-row d-flex flex-wrap gap-4 pt-3 border-top border-secondary border-opacity-25 justify-content-center justify-content-lg-start">
                <div class="hero-stat-item">
                  <div class="stat-number font-bebas text-neon">{{ stats.totalPrograms || 8 }}+</div>
                  <div class="stat-label">Elite Splits</div>
                </div>
                <div class="hero-stat-item">
                  <div class="stat-number font-bebas text-white">{{ stats.totalExercises || 12 }}+</div>
                  <div class="stat-label">Barbell Guides</div>
                </div>
                <div class="hero-stat-item">
                  <div class="stat-number font-bebas text-neon">{{ stats.totalAthletes || 140 }}+</div>
                  <div class="stat-label">Active Lifters</div>
                </div>
                <div class="hero-stat-item">
                  <div class="stat-number font-bebas text-white">{{ stats.totalSessionsCompleted || 580 }}+</div>
                  <div class="stat-label">Sessions Completed</div>
                </div>
              </div>
            </div>

            <!-- Hero Athlete Visual Showcase -->
            <div class="col-lg-5">
              <div class="hero-image-wrapper goat-card-glow">
                <img
                  src="assets/images/image-1-1.jpg"
                  alt="Elite GOAT Athlete"
                  class="img-fluid rounded-4 hero-img"
                  onerror="this.src='assets/images/hero-gym.jpg'"
                />
                <div class="hero-image-overlay p-3 rounded-bottom-4">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <div class="badge-neon mb-1">PROVEN HYPERTROPHY</div>
                      <div class="fw-bold text-white small">8–12 Rep Progressive Overload</div>
                    </div>
                    <div class="text-end">
                      <div class="font-bebas text-neon fs-4">60s</div>
                      <div class="text-muted" style="font-size: 0.65rem;">REST PACING</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- WHO WE ARE SECTION -->
      <section class="py-5 bg-secondary-subtle-custom">
        <div class="container py-lg-4">
          <div class="row align-items-center g-5">
            <div class="col-lg-5 order-2 order-lg-1">
              <div class="who-image-box">
                <img
                  src="assets/images/image-2-1.jpg"
                  alt="Relentless athlete back workout"
                  class="img-fluid rounded-4"
                  onerror="this.src='assets/images/back-program.jpg'"
                />
              </div>
            </div>
            <div class="col-lg-7 order-1 order-lg-2">
              <div class="section-badge">PHILOSOPHY FOR THE RELENTLESS</div>
              <h2 class="section-title">WHO WE <span class="text-neon">ARE</span></h2>
              <p class="fs-5 text-soft mb-3">
                GOAT FIT is not just another fitness app. It is a philosophy for athletes who refuse to settle. Built for beginners taking their first steps under the bar and seasoned lifters chasing all-time personal records.
              </p>
              <p class="text-muted-custom mb-4">
                Our core promise is simple: <strong>Train with purpose, eat with conviction, and track with clinical precision</strong>. The dark, high-contrast neon green interface keeps your focus razor-sharp inside dim gym environments.
              </p>

              <div class="row g-3">
                <div class="col-sm-6">
                  <div class="p-3 goat-card h-100">
                    <div class="font-bebas text-neon fs-4 mb-1">01. OWN YOUR RESULTS</div>
                    <p class="text-muted small mb-0">The tagline "Be Your Own GOAT" puts ownership directly in the athlete's hands.</p>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="p-3 goat-card h-100">
                    <div class="font-bebas text-neon fs-4 mb-1">02. SCIENCE-BACKED</div>
                    <p class="text-muted small mb-0">Progressive overload, clinical BMR algorithms, and real training volume metrics.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PLATFORM FEATURES AT A GLANCE -->
      <section class="py-5">
        <div class="container py-lg-4">
          <div class="text-center mb-5">
            <div class="section-badge">INTEGRATED ECOSYSTEM</div>
            <h2 class="section-title">PLATFORM <span class="text-neon">FEATURES</span></h2>
            <p class="section-subtitle">
              Everything required to build an elite physique integrated seamlessly into one fast web application.
            </p>
          </div>

          <div class="row g-4">
            
            <div class="col-md-6 col-lg-4">
              <div class="goat-card h-100 d-flex flex-column">
                <div class="feature-icon-box mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20F36B" stroke-width="2">
                    <path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"/>
                  </svg>
                </div>
                <h4 class="text-white mb-2">Workout Programs</h4>
                <p class="text-muted-custom small mb-4 flex-grow-1">
                  Science-structured splits for hypertrophy, strength and athletic longevity. Filterable by muscle group and difficulty.
                </p>
                <a routerLink="/workouts" class="feature-link text-neon text-decoration-none small fw-bold">
                  Explore Catalogue &rarr;
                </a>
              </div>
            </div>

            <div class="col-md-6 col-lg-4">
              <div class="goat-card h-100 d-flex flex-column">
                <div class="feature-icon-box mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20F36B" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h4 class="text-white mb-2">Exercise Library</h4>
                <p class="text-muted-custom small mb-4 flex-grow-1">
                  Detailed guides for bench press, deadlifts, and squats with breathing cues, form cues, and Common Mistakes to avoid injury.
                </p>
                <a routerLink="/exercises" class="feature-link text-neon text-decoration-none small fw-bold">
                  Browse Movements &rarr;
                </a>
              </div>
            </div>

            <div class="col-md-6 col-lg-4">
              <div class="goat-card h-100 d-flex flex-column">
                <div class="feature-icon-box mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20F36B" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <h4 class="text-white mb-2">Weekly Split Planner</h4>
                <p class="text-muted-custom small mb-4 flex-grow-1">
                  Plan Chest, Back, Legs, and Recovery sessions. Check days off and track real weekly adherence percentage.
                </p>
                <a routerLink="/planner" class="feature-link text-neon text-decoration-none small fw-bold">
                  Organize Split &rarr;
                </a>
              </div>
            </div>

            <div class="col-md-6 col-lg-4">
              <div class="goat-card h-100 d-flex flex-column">
                <div class="feature-icon-box mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20F36B" stroke-width="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <h4 class="text-white mb-2">TDEE & Macro Calculator</h4>
                <p class="text-muted-custom small mb-4 flex-grow-1">
                  Converts body statistics and athletic goals into daily calorie targets and a 35% protein, 45% carb, 20% fat gram split.
                </p>
                <a routerLink="/nutrition" class="feature-link text-neon text-decoration-none small fw-bold">
                  Calculate Targets &rarr;
                </a>
              </div>
            </div>

            <div class="col-md-6 col-lg-4">
              <div class="goat-card h-100 d-flex flex-column">
                <div class="feature-icon-box mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20F36B" stroke-width="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <h4 class="text-white mb-2">Hydration Tracker</h4>
                <p class="text-muted-custom small mb-4 flex-grow-1">
                  8 tap-to-log glasses toward a 2,000 ml daily baseline. Saved in MongoDB/browser with midnight reset and historical logs.
                </p>
                <a routerLink="/hydration" class="feature-link text-neon text-decoration-none small fw-bold">
                  Track Hydration &rarr;
                </a>
              </div>
            </div>

            <div class="col-md-6 col-lg-4">
              <div class="goat-card h-100 d-flex flex-column">
                <div class="feature-icon-box mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#20F36B" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h4 class="text-white mb-2">60s Rest Timer</h4>
                <p class="text-muted-custom small mb-4 flex-grow-1">
                  A persistent floating timer always one tap away, keeping gym pacing strict with visual countdown and audio completion bell.
                </p>
                <button (click)="openTimer()" class="feature-link text-neon border-0 bg-transparent text-start p-0 small fw-bold">
                  Launch Timer &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- FEATURED WORKOUTS PREVIEW -->
      <section class="py-5 bg-secondary-subtle-custom">
        <div class="container py-lg-4">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <div class="section-badge">POPULAR SPLITS</div>
              <h2 class="section-title mb-0">FEATURED <span class="text-neon">PROGRAMS</span></h2>
            </div>
            <a routerLink="/workouts" class="goat-btn-outline goat-btn-sm text-decoration-none mt-3 mt-md-0">
              View All Programs
            </a>
          </div>

          <div class="row g-4">
            <div *ngFor="let prog of featuredPrograms" class="col-md-6 col-lg-4">
              <div class="workout-card goat-card h-100 d-flex flex-column p-0">
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
                <div class="p-3 d-flex flex-column flex-grow-1">
                  <div class="d-flex align-items-center gap-3 text-muted small mb-2">
                    <span>⏱ {{ prog.durationMinutes }} mins</span>
                    <span>&bull;</span>
                    <span>{{ prog.exercises.length }} Exercises</span>
                  </div>
                  <h5 class="text-white mb-2 font-bebas fs-4">{{ prog.name }}</h5>
                  <p class="text-muted-custom small mb-3 flex-grow-1">
                    {{ prog.description }}
                  </p>
                  <div class="d-flex gap-2">
                    <a [routerLink]="['/workouts', prog.slug]" class="goat-btn-outline goat-btn-sm w-50 text-decoration-none text-center">
                      Details
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
      </section>

      <!-- TRAINING APPROACH & SCIENCE -->
      <section class="py-5">
        <div class="container py-lg-4">
          <div class="row align-items-center g-5">
            <div class="col-lg-6">
              <div class="section-badge">SCIENTIFIC METHODOLOGY</div>
              <h2 class="section-title">THE GOAT <span class="text-neon">PROTOCOL</span></h2>
              <p class="text-soft mb-4">
                We reject guesswork and bro-science. The GOAT FIT training engine is calibrated according to peer-reviewed hypertrophy and sports kinesiology standards.
              </p>

              <div class="approach-item mb-3 p-3 goat-card">
                <h5 class="text-neon font-bebas fs-4 mb-1">8–12 REP RANGE FOR MAX HYPERTROPHY</h5>
                <p class="text-muted-custom small mb-0">
                  Targeting the mechanical tension threshold with high muscular recruitment and manageable central nervous system fatigue.
                </p>
              </div>

              <div class="approach-item mb-3 p-3 goat-card">
                <h5 class="text-neon font-bebas fs-4 mb-1">MEASURED PROGRESSIVE OVERLOAD</h5>
                <p class="text-muted-custom small mb-0">
                  Track every kilogram and repetition. Once you hit the top rep limit with strict form, increment load by 2.5–5%.
                </p>
              </div>

              <div class="approach-item p-3 goat-card">
                <h5 class="text-neon font-bebas fs-4 mb-1">MACRO SYNTHESIS & RECOVERY PACING</h5>
                <p class="text-muted-custom small mb-0">
                  35% protein distribution spread across 3–4 daily feedings keeps muscle protein synthesis elevated around the clock.
                </p>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="approach-visual-card goat-card-glow text-center p-4">
                <img
                  src="assets/images/image-6-1.jpg"
                  alt="Training schedule and barbell execution"
                  class="img-fluid rounded-4 mb-3"
                  onerror="this.src='assets/images/deadlift.jpg'"
                />
                <div class="font-bebas text-neon fs-3">PRECISION OVER GUESSWORK</div>
                <p class="text-muted small mb-0">Consistent execution turns potential into all-time personal records.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- COMMUNITY & ATHLETE SOCIAL PROOF -->
      <section class="py-5 bg-secondary-subtle-custom">
        <div class="container py-lg-4">
          <div class="text-center mb-5">
            <div class="section-badge">ATHLETE STORIES</div>
            <h2 class="section-title">COMMUNITY & <span class="text-neon">SOCIAL PROOF</span></h2>
            <p class="section-subtitle">
              Real testimonials from dedicated athletes who transformed their strength and habit consistency.
            </p>
            <div class="badge bg-secondary text-light small mb-4">Demonstration Athlete Showcases</div>
          </div>

          <div class="row g-4">
            
            <div class="col-md-6 col-lg-4">
              <div class="goat-card h-100">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <img
                    src="assets/images/image-8-1.jpg"
                    alt="David Chen"
                    class="rounded-circle athlete-avatar"
                    onerror="this.src='assets/images/athlete-david.jpg'"
                  />
                  <div>
                    <h5 class="text-white mb-0">David Chen</h5>
                    <div class="text-muted small">Finance Director & Lifter</div>
                  </div>
                </div>
                <div class="badge-neon mb-2">Squat +40 kg in 14 Weeks</div>
                <p class="text-muted-custom small mb-0">
                  "Verified GOAT athlete. Squat climbed 40 kg in 14 weeks. The barbell guide and straightforward nutrition targets fit right into my intense work and travel schedule."
                </p>
              </div>
            </div>

            <div class="col-md-6 col-lg-4">
              <div class="goat-card h-100">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <img
                    src="assets/images/image-10-1.jpg"
                    alt="Sarah Jenkins"
                    class="rounded-circle athlete-avatar"
                    onerror="this.src='assets/images/athlete-sarah.jpg'"
                  />
                  <div>
                    <h5 class="text-white mb-0">Sarah Jenkins</h5>
                    <div class="text-muted small">Physical Therapist</div>
                  </div>
                </div>
                <div class="badge-neon mb-2">140 kg Deadlift PR</div>
                <p class="text-muted-custom small mb-0">
                  "Pulled 140 kg with zero lumbar pain. I routinely point rehab clients and gym beginners to the Common Form Mistakes cues because they genuinely prevent injuries."
                </p>
              </div>
            </div>

            <div class="col-md-6 col-lg-4">
              <div class="goat-card h-100">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <img
                    src="assets/images/image-9-1.jpg"
                    alt="Marcus Vance"
                    class="rounded-circle athlete-avatar"
                    onerror="this.src='assets/images/athlete-marcus.jpg'"
                  />
                  <div>
                    <h5 class="text-white mb-0">Marcus Vance</h5>
                    <div class="text-muted small">Hybrid Calisthenics Athlete</div>
                  </div>
                </div>
                <div class="badge-neon mb-2">6 Months Strict Adherence</div>
                <p class="text-muted-custom small mb-0">
                  "The Home Workout routines combined with the floating 60s rest timer kept my gym pacing disciplined during busy travel weeks. Absolute game changer."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- FREQUENTLY ASKED QUESTIONS -->
      <section class="py-5">
        <div class="container py-lg-4">
          <div class="text-center mb-5">
            <div class="section-badge">EXPERT ANSWERS</div>
            <h2 class="section-title">FREQUENTLY ASKED <span class="text-neon">QUESTIONS</span></h2>
            <p class="section-subtitle">
              Everything you need to know about workout splits, clinical macro formulas, and data synchronization.
            </p>
          </div>

          <div class="row justify-content-center">
            <div class="col-lg-9">
              <div class="accordion goat-accordion" id="faqAccordion">
                <div *ngFor="let faq of faqs; let i = index" class="accordion-item goat-card mb-3 p-0">
                  <h2 class="accordion-header" [id]="'heading' + i">
                    <button
                      class="accordion-button collapsed goat-acc-btn"
                      type="button"
                      data-bs-toggle="collapse"
                      [attr.data-bs-target]="'#collapse' + i"
                      [attr.aria-expanded]="i === 0 ? 'true' : 'false'"
                      [attr.aria-controls]="'collapse' + i"
                    >
                      <span class="fw-bold text-white">{{ faq.question }}</span>
                    </button>
                  </h2>
                  <div
                    [id]="'collapse' + i"
                    class="accordion-collapse collapse"
                    [class.show]="i === 0"
                    [attr.aria-labelledby]="'heading' + i"
                    data-bs-parent="#faqAccordion"
                  >
                    <div class="accordion-body text-soft small pt-2 pb-4 px-4 border-top border-secondary border-opacity-25">
                      {{ faq.answer }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CONTACT / COACHING HQ FORM -->
      <section class="py-5 bg-secondary-subtle-custom">
        <div class="container py-lg-4">
          <div class="row align-items-center g-5">
            <div class="col-lg-5">
              <div class="section-badge">TRANSMIT INQUIRY</div>
              <h2 class="section-title">COACHING <span class="text-neon">HQ</span></h2>
              <p class="text-soft mb-4">
                Have questions regarding programming progression, lifting cues, or custom split adjustments? Send a message directly to GOAT Coaching HQ.
              </p>
              <div class="p-3 goat-card mb-3">
                <div class="fw-bold text-white small mb-1">Backend Persistence</div>
                <p class="text-muted small mb-0">Messages are validated and stored in MongoDB under ContactMessages.</p>
              </div>
            </div>

            <div class="col-lg-7">
              <div class="goat-card p-4 p-md-5">
                <form (ngSubmit)="submitContact()" #contactForm="ngForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="goat-label">Athlete Name *</label>
                      <input
                        type="text"
                        [(ngModel)]="contactData.name"
                        name="name"
                        required
                        class="goat-input"
                        placeholder="Alex Mercer"
                      />
                    </div>
                    <div class="col-md-6">
                      <label class="goat-label">Email Address *</label>
                      <input
                        type="email"
                        [(ngModel)]="contactData.email"
                        name="email"
                        required
                        class="goat-input"
                        placeholder="athlete@domain.com"
                      />
                    </div>
                    <div class="col-12">
                      <label class="goat-label">Subject</label>
                      <input
                        type="text"
                        [(ngModel)]="contactData.subject"
                        name="subject"
                        class="goat-input"
                        placeholder="Split Customization / Deadlift Inquiries"
                      />
                    </div>
                    <div class="col-12">
                      <label class="goat-label">Message Content *</label>
                      <textarea
                        [(ngModel)]="contactData.message"
                        name="message"
                        required
                        rows="4"
                        class="goat-input"
                        placeholder="Describe your training goals or question in detail (min 10 characters)..."
                      ></textarea>
                    </div>
                    <div class="col-12">
                      <button
                        type="submit"
                        class="goat-btn-neon w-100"
                        [disabled]="isSubmittingContact || !contactForm.form.valid"
                      >
                        <span *ngIf="isSubmittingContact" class="spinner-border spinner-border-sm me-2"></span>
                        Send Message to Coaching HQ
                      </button>
                    </div>
                  </div>
                </form>

                <div *ngIf="contactFeedback" class="mt-3 p-3 rounded text-center small" [class.bg-success]="contactSuccess" [class.bg-danger]="!contactSuccess" [class.bg-opacity-25]="true">
                  {{ contactFeedback }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FINAL CALL TO ACTION -->
      <section class="py-5 position-relative overflow-hidden text-center">
        <div class="container py-lg-5">
          <div class="cta-box p-5 rounded-4 position-relative goat-card-glow">
            <h2 class="font-bebas text-white display-4 mb-3">
              READY TO CRUSH YOUR <span class="text-neon">LIMITS?</span>
            </h2>
            <p class="text-soft fs-5 max-w-600 mx-auto mb-4">
              Join the GOAT FIT community today. Structure your workouts, dial in your nutrition, and dominate every set.
            </p>
            <div class="d-flex flex-wrap gap-3 justify-content-center">
              <a routerLink="/auth" class="goat-btn-neon fs-5 px-5 py-3 text-decoration-none">
                CREATE FREE ACCOUNT
              </a>
              <button (click)="auth.enterGuestMode()" class="goat-btn-outline fs-5 px-4 py-3">
                EXPLORE DEMO MODE
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .hero-section {
      padding: 3rem 0;
      background: radial-gradient(circle at 80% 20%, rgba(32, 243, 107, 0.12) 0%, transparent 60%);
    }

    .hero-headline {
      font-size: 3.5rem;
      line-height: 0.95;
      color: var(--text-white);
      margin-bottom: 1.25rem;
    }

    @media (min-width: 768px) {
      .hero-headline {
        font-size: 5rem;
      }
    }

    @media (min-width: 1200px) {
      .hero-headline {
        font-size: 6rem;
      }
    }

    .hero-subtext {
      font-size: 1.15rem;
      color: var(--text-soft);
      max-width: 600px;
    }

    .stat-number {
      font-size: 2.25rem;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .hero-image-wrapper {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background: var(--bg-card);
    }

    .hero-img {
      width: 100%;
      height: 480px;
      object-fit: cover;
    }

    .hero-image-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(8, 10, 9, 0.9);
      backdrop-filter: blur(8px);
      border-top: 1px solid var(--border-card);
    }

    .bg-secondary-subtle-custom {
      background-color: var(--bg-secondary);
    }

    .feature-icon-box {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: rgba(32, 243, 107, 0.1);
      border: 1px solid var(--accent-neon-border);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .workout-card-img-wrap {
      height: 200px;
      overflow: hidden;
    }

    .workout-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .workout-card:hover .workout-card-img {
      transform: scale(1.06);
    }

    .athlete-avatar {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border: 2px solid var(--accent-neon);
    }

    .goat-acc-btn {
      background: var(--bg-card) !important;
      color: var(--text-white) !important;
      border: none !important;
      box-shadow: none !important;
      padding: 1.25rem 1.5rem;
    }

    .goat-acc-btn:after {
      filter: invert(1);
    }

    .cta-box {
      background: linear-gradient(135deg, rgba(20, 25, 21, 0.95), rgba(8, 10, 9, 0.95));
      border: 1px solid var(--accent-neon-border);
    }

    .max-w-600 {
      max-width: 600px;
    }

    .badge-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-neon);
      animation: pulseGlow 1.5s infinite;
    }
  `]
})
export class HomeComponent implements OnInit {
  public auth = inject(AuthService);
  private workoutService = inject(WorkoutService);
  private publicService = inject(PublicService);
  private cdr = inject(ChangeDetectorRef);

  public stats: PlatformStats = {
    totalPrograms: 8,
    totalExercises: 12,
    totalAthletes: 140,
    totalSessionsCompleted: 580,
    isLiveDatabase: true
  };

  public featuredPrograms: WorkoutProgram[] = [];
  public faqs: FaqItem[] = [];

  public contactData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  public isSubmittingContact = false;
  public contactFeedback = '';
  public contactSuccess = false;

  ngOnInit() {
    this.loadStats();
    this.loadFeaturedWorkouts();
    this.loadFaqs();
  }

  loadStats() {
    this.publicService.getPlatformStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  loadFeaturedWorkouts() {
    this.workoutService.getPrograms({ limit: 3 } as any).subscribe({
      next: (res) => {
        this.featuredPrograms = res.data.slice(0, 3);
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  loadFaqs() {
    this.publicService.getFaqs().subscribe({
      next: (faqs) => {
        this.faqs = faqs;
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  openTimer() {
    const timer = (window as any).goatRestTimer;
    if (timer) timer.openTimer(60);
  }

  submitContact() {
    if (!this.contactData.name || !this.contactData.email || !this.contactData.message) return;

    this.isSubmittingContact = true;
    this.contactFeedback = '';

    this.publicService.submitContact(this.contactData).subscribe({
      next: (res) => {
        this.isSubmittingContact = false;
        this.contactSuccess = res.success;
        this.contactFeedback = res.message;
        if (res.success) {
          this.contactData = { name: '', email: '', subject: '', message: '' };
        }
      },
      error: (err) => {
        this.isSubmittingContact = false;
        this.contactSuccess = false;
        this.contactFeedback = err.message || 'Submission error. Please verify your connection.';
      }
    });
  }
}
