import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page py-5 d-flex align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6 col-xl-5">

            <!-- Logo Header -->
            <div class="text-center mb-4">
              <a routerLink="/" class="text-decoration-none">
                <span class="display-6 fw-black text-white text-uppercase tracking-wider">
                  GOAT<span class="text-primary">FIT</span>
                </span>
              </a>
              <p class="text-secondary small text-uppercase tracking-widest mt-1 mb-0">
                BE YOUR OWN GOAT • ATHLETE ACCESS
              </p>
            </div>

            <!-- Card Box -->
            <div class="card bg-card border-secondary shadow-lg">
              <!-- Tab Switcher -->
              <div class="card-header bg-dark border-secondary p-0">
                <div class="nav nav-tabs nav-fill border-0">
                  <button 
                    class="nav-link rounded-0 py-3 fw-bold text-uppercase border-0"
                    [class.active]="isLoginMode"
                    [class.text-primary]="isLoginMode"
                    [class.text-secondary]="!isLoginMode"
                    (click)="setMode(true)"
                  >
                    <i class="bi bi-box-arrow-in-right me-1"></i> Athlete Login
                  </button>
                  <button 
                    class="nav-link rounded-0 py-3 fw-bold text-uppercase border-0"
                    [class.active]="!isLoginMode"
                    [class.text-primary]="!isLoginMode"
                    [class.text-secondary]="isLoginMode"
                    (click)="setMode(false)"
                  >
                    <i class="bi bi-person-plus-fill me-1"></i> Register
                  </button>
                </div>
              </div>

              <div class="card-body p-4 p-md-5">

                <!-- Alert Messages -->
                <div *ngIf="errorMessage" class="alert alert-danger py-2 small mb-4 d-flex align-items-center">
                  <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                  <div>{{ errorMessage }}</div>
                </div>

                <div *ngIf="successMessage" class="alert alert-success py-2 small mb-4 d-flex align-items-center">
                  <i class="bi bi-check-circle-fill me-2 fs-5"></i>
                  <div>{{ successMessage }}</div>
                </div>

                <!-- LOGIN FORM -->
                <form *ngIf="isLoginMode" [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small fw-bold text-uppercase">Email Address</label>
                    <div class="input-group">
                      <span class="input-group-text bg-dark border-secondary text-secondary">
                        <i class="bi bi-envelope-fill"></i>
                      </span>
                      <input 
                        type="email" 
                        class="form-control bg-dark border-secondary text-white" 
                        placeholder="athlete@goatfit.com" 
                        formControlName="email"
                        [class.is-invalid]="loginForm.get('email')?.touched && loginForm.get('email')?.invalid"
                      />
                    </div>
                    <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid" class="invalid-feedback d-block">
                      Please enter a valid email address.
                    </div>
                  </div>

                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                      <label class="form-label text-secondary small fw-bold text-uppercase mb-0">Password</label>
                    </div>
                    <div class="input-group mt-1">
                      <span class="input-group-text bg-dark border-secondary text-secondary">
                        <i class="bi bi-lock-fill"></i>
                      </span>
                      <input 
                        [type]="showPassword ? 'text' : 'password'" 
                        class="form-control bg-dark border-secondary text-white" 
                        placeholder="••••••••" 
                        formControlName="password"
                        [class.is-invalid]="loginForm.get('password')?.touched && loginForm.get('password')?.invalid"
                      />
                      <button type="button" class="btn btn-dark border-secondary text-secondary" (click)="showPassword = !showPassword">
                        <i class="bi" [class.bi-eye-fill]="!showPassword" [class.bi-eye-slash-fill]="showPassword"></i>
                      </button>
                    </div>
                    <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="invalid-feedback d-block">
                      Password is required (minimum 6 characters).
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 py-3 fw-black text-uppercase tracking-wider mb-3" 
                    [disabled]="loginForm.invalid || loading"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'AUTHENTICATING...' : 'ENTER THE ARENA' }}
                  </button>

                  <!-- Default Credentials Hint for Viva/Demo -->
                  <div class="p-2 rounded bg-dark border border-secondary text-center small text-secondary mb-3">
                    <strong class="text-white d-block">Demo Athlete Credentials:</strong>
                    <code>demo&#64;goatfit.com</code> / <code>goatfit123</code>
                  </div>
                </form>

                <!-- REGISTER FORM -->
                <form *ngIf="!isLoginMode" [formGroup]="registerForm" (ngSubmit)="onRegisterSubmit()">
                  <div class="mb-3">
                    <label class="form-label text-secondary small fw-bold text-uppercase">Full Name</label>
                    <div class="input-group">
                      <span class="input-group-text bg-dark border-secondary text-secondary">
                        <i class="bi bi-person-fill"></i>
                      </span>
                      <input 
                        type="text" 
                        class="form-control bg-dark border-secondary text-white" 
                        placeholder="David Laid" 
                        formControlName="name"
                        [class.is-invalid]="registerForm.get('name')?.touched && registerForm.get('name')?.invalid"
                      />
                    </div>
                    <div *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.invalid" class="invalid-feedback d-block">
                      Full name is required.
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label text-secondary small fw-bold text-uppercase">Email Address</label>
                    <div class="input-group">
                      <span class="input-group-text bg-dark border-secondary text-secondary">
                        <i class="bi bi-envelope-fill"></i>
                      </span>
                      <input 
                        type="email" 
                        class="form-control bg-dark border-secondary text-white" 
                        placeholder="yourname@domain.com" 
                        formControlName="email"
                        [class.is-invalid]="registerForm.get('email')?.touched && registerForm.get('email')?.invalid"
                      />
                    </div>
                    <div *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid" class="invalid-feedback d-block">
                      Valid email is required.
                    </div>
                  </div>

                  <div class="row g-2 mb-3">
                    <div class="col-sm-6">
                      <label class="form-label text-secondary small fw-bold text-uppercase">Password</label>
                      <input 
                        type="password" 
                        class="form-control bg-dark border-secondary text-white" 
                        placeholder="••••••••" 
                        formControlName="password"
                        [class.is-invalid]="registerForm.get('password')?.touched && registerForm.get('password')?.invalid"
                      />
                    </div>
                    <div class="col-sm-6">
                      <label class="form-label text-secondary small fw-bold text-uppercase">Confirm Password</label>
                      <input 
                        type="password" 
                        class="form-control bg-dark border-secondary text-white" 
                        placeholder="••••••••" 
                        formControlName="confirmPassword"
                        [class.is-invalid]="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched"
                      />
                    </div>
                  </div>
                  <div *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched" class="text-danger small mb-3">
                    Passwords do not match.
                  </div>

                  <div class="form-check mb-4">
                    <input 
                      class="form-check-input bg-dark border-secondary" 
                      type="checkbox" 
                      id="termsCheck" 
                      formControlName="agreeTerms" 
                    />
                    <label class="form-check-label text-secondary small" for="termsCheck">
                      I agree to the GOAT FIT Privacy Policy &amp; Athletic Training Terms
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 py-3 fw-black text-uppercase tracking-wider mb-3" 
                    [disabled]="registerForm.invalid || loading"
                  >
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'CREATING PROFILE...' : 'CLAIM ATHLETE PROFILE' }}
                  </button>
                </form>

                <div class="position-relative my-4 text-center">
                  <hr class="border-secondary m-0">
                  <span class="position-absolute top-50 start-50 translate-middle bg-card px-3 text-secondary small text-uppercase">
                    Or Instant Access
                  </span>
                </div>

                <!-- One-Click Guest Demo Button -->
                <button 
                  type="button" 
                  class="btn btn-outline-warning w-100 py-2 fw-bold text-uppercase"
                  (click)="enterGuestDemo()"
                >
                  <i class="bi bi-lightning-fill me-1"></i> Enter Guest Demo Mode (No Sign-Up)
                </button>

              </div>
            </div>

            <!-- Footer Note -->
            <div class="text-center mt-4">
              <small class="text-secondary">
                Enterprise JWT Authentication &amp; Isolated Athlete Client Sandbox
              </small>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 85vh;
      background: radial-gradient(circle at 50% 20%, rgba(32, 243, 107, 0.08), transparent 60%),
                  var(--goat-black, #080A09);
    }
    .bg-card {
      background-color: var(--goat-charcoal, #101411);
    }
    .nav-tabs .nav-link.active {
      background-color: var(--goat-charcoal, #101411);
      border-bottom: 2px solid var(--goat-green, #20F36B);
    }
  `]
})
export class AuthComponent implements OnInit {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  isLoginMode = true;
  loading = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'register') {
        this.isLoginMode = false;
        this.cdr.markForCheck();
      }
    });

    this.initForms();
  }

  initForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.maxLength(80)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        agreeTerms: [true, [Validators.requiredTrue]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  setMode(isLogin: boolean): void {
    this.isLoginMode = isLogin;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        this.cdr.markForCheck();
      }
    });
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const { name, email, password, confirmPassword } = this.registerForm.value;

    this.auth.register({ name, email, password, confirmPassword }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Profile registered successfully! Logging you in...';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1200);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try a different email.';
        this.cdr.markForCheck();
      }
    });
  }

  enterGuestDemo(): void {
    this.auth.enableGuestMode();
    this.router.navigate(['/dashboard']);
  }
}
