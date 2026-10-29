import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-curriculum-demo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="curriculum-page py-5">
      <div class="container">
        <!-- Banner Header -->
        <div class="text-center mb-5">
          <span class="badge bg-primary text-black fw-black px-3 py-2 text-uppercase mb-2">
            SPPU Third Year IT • Academic Verification Matrix
          </span>
          <h1 class="display-4 fw-black text-white text-uppercase tracking-tight">
            WAD COURSE OUTCOMES <span class="text-primary">(CO1 – CO5)</span>
          </h1>
          <p class="text-secondary lead max-w-700 mx-auto">
            Savitribai Phule Pune University (SPPU) Web Application Development curriculum implementation reference and viva demonstration guide.
          </p>
        </div>

        <!-- 5 Course Outcomes Cards Grid -->
        <div class="row g-4 mb-5">

          <!-- CO1 -->
          <div class="col-lg-6">
            <div class="card bg-card border-secondary h-100 shadow-sm p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <span class="badge bg-success fs-5 px-3 py-2 fw-black">CO1</span>
                <div>
                  <h4 class="text-white fw-bold mb-0">HTML5, CSS3 &amp; Bootstrap 5</h4>
                  <small class="text-secondary">Responsive UI, Athletic Tokens &amp; Semantic Markup</small>
                </div>
              </div>
              <ul class="text-secondary small space-y-2 mb-3">
                <li><strong class="text-white">Semantic HTML5:</strong> Structured <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, and <code>&lt;footer&gt;</code> with ARIA labels.</li>
                <li><strong class="text-white">CSS3 Architecture:</strong> Root design tokens (<code>--goat-green: #20F36B</code>, <code>--goat-black: #080A09</code>, <code>--goat-charcoal: #101411</code>), CSS Grid &amp; Flexbox layouts.</li>
                <li><strong class="text-white">Bootstrap 5 Grid:</strong> Responsive breakpoints (<code>col-12 col-md-6 col-lg-4</code>), card surfaces, and modal backdrop utilities without altering Angular DOM tree.</li>
                <li><strong class="text-white">Accessibility (a11y):</strong> WCAG AA contrast on high-visibility neon buttons and accessible focus outlines.</li>
              </ul>
              <div class="mt-auto pt-2 border-top border-secondary">
                <span class="badge bg-dark border border-secondary text-primary">Live in: /workouts, /exercises, /styles.css</span>
              </div>
            </div>
          </div>

          <!-- CO2 -->
          <div class="col-lg-6">
            <div class="card bg-card border-secondary h-100 shadow-sm p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <span class="badge bg-info text-black fs-5 px-3 py-2 fw-black">CO2</span>
                <div>
                  <h4 class="text-white fw-bold mb-0">TypeScript, Async Programming &amp; JSON</h4>
                  <small class="text-secondary">Reactive RxJS Streams, Observables &amp; Type Contracts</small>
                </div>
              </div>
              <ul class="text-secondary small space-y-2 mb-3">
                <li><strong class="text-white">Strong Typing:</strong> Strict TypeScript interfaces for <code>WorkoutProgram</code>, <code>Exercise</code>, <code>WeeklyPlan</code>, <code>HydrationLog</code>, and <code>User</code>.</li>
                <li><strong class="text-white">RxJS Asynchronous Pipeline:</strong> Observables, <code>map()</code>, <code>catchError()</code>, <code>tap()</code>, and BehaviorSubject reactive streams.</li>
                <li><strong class="text-white">Timestamp Math:</strong> Deadline-based countdown calculations in <code>TimerService</code> resilient to browser tab background throttling.</li>
                <li><strong class="text-white">Client-Side Validation:</strong> Dynamic Reactive Form validators and custom cross-field password matchers.</li>
              </ul>
              <div class="mt-auto pt-2 border-top border-secondary">
                <span class="badge bg-dark border border-secondary text-info">Live in: /services/*.ts, /models/*.ts</span>
              </div>
            </div>
          </div>

          <!-- CO3 -->
          <div class="col-lg-6">
            <div class="card bg-card border-secondary h-100 shadow-sm p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <span class="badge bg-primary text-black fs-5 px-3 py-2 fw-black">CO3</span>
                <div>
                  <h4 class="text-white fw-bold mb-0">Angular SPA Architecture</h4>
                  <small class="text-secondary">Standalone Components, Routing, DI &amp; Reactive Forms</small>
                </div>
              </div>
              <ul class="text-secondary small space-y-2 mb-3">
                <li><strong class="text-white">Standalone Paradigm:</strong> Modern Angular 22 modular architecture with zero legacy NgModules.</li>
                <li><strong class="text-white">Angular Router:</strong> Client-side navigation with query parameters and route parameters (<code>/workouts/:idOrSlug</code>).</li>
                <li><strong class="text-white">Dependency Injection (DI):</strong> Hierarchical tree-shakeable singletons (<code>providedIn: 'root'</code>) injected via <code>inject()</code>.</li>
                <li><strong class="text-white">Signals &amp; State:</strong> Angular reactive Signals (<code>currentUserSig</code>, <code>isGuestSig</code>) for zero-latency UI re-rendering.</li>
              </ul>
              <div class="mt-auto pt-2 border-top border-secondary">
                <span class="badge bg-dark border border-secondary text-primary">Live in: /app.routes.ts, /pages/*</span>
              </div>
            </div>
          </div>

          <!-- CO4 -->
          <div class="col-lg-6">
            <div class="card bg-card border-secondary h-100 shadow-sm p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <span class="badge bg-warning text-black fs-5 px-3 py-2 fw-black">CO4</span>
                <div>
                  <h4 class="text-white fw-bold mb-0">Node.js, Express &amp; MongoDB</h4>
                  <small class="text-secondary">RESTful API Architecture, Mongoose Schemas &amp; CRUD</small>
                </div>
              </div>
              <ul class="text-secondary small space-y-2 mb-3">
                <li><strong class="text-white">Express REST API:</strong> Modular routing under <code>/api</code> with centralized asynchronous error handling middleware.</li>
                <li><strong class="text-white">Mongoose 8 Schemas:</strong> 10 production schemas with index constraints, references, pre-save hooks, and methods.</li>
                <li><strong class="text-white">Clinical Math:</strong> Mifflin-St Jeor BMR and activity multiplier TDEE formula executed on server and client.</li>
                <li><strong class="text-white">Automated Verification:</strong> 19 automated integration tests in <code>server/src/tests/runTests.js</code> passing with zero failures.</li>
              </ul>
              <div class="mt-auto pt-2 border-top border-secondary">
                <span class="badge bg-dark border border-secondary text-warning">Live in: server/src/routes, server/src/models</span>
              </div>
            </div>
          </div>

          <!-- CO5 -->
          <div class="col-lg-12">
            <div class="card bg-card border-secondary shadow-sm p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <span class="badge bg-danger fs-5 px-3 py-2 fw-black">CO5</span>
                <div>
                  <h4 class="text-white fw-bold mb-0">Security, PWA &amp; DevOps Deployment</h4>
                  <small class="text-secondary">JWT, Bcrypt, Rate Limiting, Manifest &amp; Docker</small>
                </div>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <ul class="text-secondary small space-y-2 mb-0">
                    <li><strong class="text-white">Password Security:</strong> Salted password hashing via <code>bcryptjs</code> with 10 salt rounds; password hashes excluded from API serialization.</li>
                    <li><strong class="text-white">JWT &amp; HttpOnly Cookies:</strong> Signed tokens with 7-day expiration transmitted via secure HttpOnly cookies and Bearer headers.</li>
                    <li><strong class="text-white">DDoS &amp; Abuse Limiting:</strong> <code>express-rate-limit</code> protecting public contact, newsletter, and authentication endpoints.</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <ul class="text-secondary small space-y-2 mb-0">
                    <li><strong class="text-white">Progressive Web App:</strong> Web app manifest (<code>manifest.webmanifest</code>), service worker caching app shell, and installability.</li>
                    <li><strong class="text-white">Dockerized Stack:</strong> Multi-container orchestration in <code>docker-compose.yml</code> for MongoDB, Node API, and Angular frontend.</li>
                    <li><strong class="text-white">Zero Hardcoded Secrets:</strong> Environment-driven configuration via <code>.env</code> and placeholders in <code>.env.example</code>.</li>
                  </ul>
                </div>
              </div>
              <div class="mt-3 pt-2 border-top border-secondary">
                <span class="badge bg-dark border border-secondary text-danger">Live in: docker-compose.yml, server/src/middleware, manifest.webmanifest</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Syllabus Isolated Demonstration Sandbox -->
        <div class="card bg-card border-secondary shadow-lg p-4 p-md-5">
          <div class="row align-items-center">
            <div class="col-lg-8">
              <h3 class="text-white fw-bold mb-2">
                <i class="bi bi-mortarboard-fill text-primary me-2"></i> Ready for Practical Demonstration &amp; Viva
              </h3>
              <p class="text-secondary mb-0">
                All 19 test cases verify that the application satisfies the Savitribai Phule Pune University syllabus requirements for Third Year Information Technology Web Application Development.
              </p>
            </div>
            <div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
              <a routerLink="/dashboard" class="btn btn-primary fw-bold px-4 py-2 me-2">
                <i class="bi bi-speedometer2 me-1"></i> Dashboard
              </a>
              <a routerLink="/workouts" class="btn btn-outline-light px-4 py-2">
                Workouts <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .curriculum-page {
      min-height: 85vh;
      background-color: var(--goat-black, #080A09);
    }
    .bg-card {
      background-color: var(--goat-charcoal, #101411);
    }
    .max-w-700 {
      max-width: 700px;
    }
  `]
})
export class CurriculumDemoComponent {}
