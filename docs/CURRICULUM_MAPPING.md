# SPPU Third Year Information Technology — Web Application Development (WAD)
## Comprehensive Curriculum Outcome Mapping & Project Viva Guide

**Academic Program:** Savitribai Phule Pune University (SPPU)  
**Branch & Year:** Third Year (TE) Information Technology  
**Subject:** Web Application Development (WAD)  
**Project Title:** GOAT FIT — Be Your Own GOAT  

---

### Course Outcome 1 (CO1)
**Design and develop responsive, accessible, and visually appealing web interfaces using semantic HTML5, CSS3, modern layout techniques, and UI frameworks.**

| Implemented Feature in GOAT FIT | Syllabus Concepts Demonstrated | File Locations |
| :--- | :--- | :--- |
| **Semantic Page Architecture** | HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`). Structured metadata, OpenGraph tags, ARIA labels. | `client/src/index.html`<br>`client/src/app/app.component.html`<br>`client/src/app/components/header/header.component.ts` |
| **Athletic Design System & Tokens** | CSS3 Custom Properties (`--bg-primary: #080A09`, `--accent-neon: #20F36B`, `--font-headline: 'Bebas Neue'`), translucent glassmorphism cards, neon focus rings, high contrast WCAG AA ratios. | `client/src/styles.css` |
| **Responsive Grid & Flexbox** | Bootstrap 5 12-column responsive grid combined with CSS Grid. Clean breakpoint transitions across mobile (375px), tablet (768px), and desktop (1200px+). | `client/src/app/pages/home/home.component.ts`<br>`client/src/app/pages/workouts/workouts.component.ts` |
| **Interactive UI Components** | Modal dialogs, collapsible accordions, floating fixed-position timer pill, animated hydration liquid gauges, tab selectors. | `client/src/app/components/rest-timer/rest-timer.component.ts`<br>`client/src/app/pages/hydration/hydration.component.ts` |

---

### Course Outcome 2 (CO2)
**Apply client-side scripting concepts, asynchronous HTTP communication, JSON data interchange, and dynamic form validation.**

| Implemented Feature in GOAT FIT | Syllabus Concepts Demonstrated | File Locations |
| :--- | :--- | :--- |
| **TypeScript Type Safety** | Strict compile-time typing, custom interfaces, enum types for categories, generics, and strict null checks. | `client/src/app/models/workout.models.ts`<br>`client/src/app/models/planner.models.ts`<br>`client/src/app/models/nutrition.models.ts` |
| **Asynchronous API & RxJS Streams** | `HttpClient` observable streams, `pipe()`, `map()`, `tap()`, `catchError()`, `BehaviorSubject` for multicasting global state. | `client/src/app/services/workout.service.ts`<br>`client/src/app/services/hydration.service.ts`<br>`client/src/app/services/planner.service.ts` |
| **Client-Side Form Validation** | Angular Reactive and Template-Driven forms, real-time validation, password confirmation matching, dynamic macro total = 100% check. | `client/src/app/pages/auth/auth.component.ts`<br>`client/src/app/pages/nutrition/nutrition.component.ts` |
| **JSON Data Interchange** | Complete JSON serialization and deserialization for workout sessions, set logging, and live REST API inspector. | `client/src/app/pages/curriculum/curriculum.component.ts`<br>`client/src/app/services/session.service.ts` |

---

### Course Outcome 3 (CO3)
**Construct modular Single Page Applications (SPA) using Angular framework architecture, components, dependency injection, and routing.**

| Implemented Feature in GOAT FIT | Syllabus Concepts Demonstrated | File Locations |
| :--- | :--- | :--- |
| **Standalone Components** | Modern Angular 19+ standalone component architecture (`imports: [CommonModule, RouterModule, FormsModule]`) without legacy NgModules. | All files in `client/src/app/pages/` and `client/src/app/components/` |
| **Client-Side Routing** | Angular Router with parameter binding (`/workouts/:idOrSlug`), query parameters (`?muscleGroup=Chest`), and wildcard fallback (`** -> redirect`). | `client/src/app/app.routes.ts`<br>`client/src/app/app.config.ts` |
| **Route Guards & Protection** | `CanActivate` functional route guard (`authGuard`) inspecting login state and redirecting unauthenticated users with return URL tracking. | `client/src/app/guards/auth.guard.ts` |
| **HTTP Interceptors** | `authInterceptor` automatically appending `Authorization: Bearer <JWT>` header to all backend HTTP requests. | `client/src/app/services/auth.interceptor.ts` |
| **Dependency Injection** | Angular DI via `@Injectable({ providedIn: 'root' })` and modern `inject()` pattern for decoupled service singleton consumption. | `client/src/app/services/timer.service.ts`<br>`client/src/app/services/auth.service.ts` |

---

### Course Outcome 4 (CO4)
**Develop scalable server-side applications using Node.js and Express.js, architect RESTful web services, and manage persistent data with MongoDB.**

| Implemented Feature in GOAT FIT | Syllabus Concepts Demonstrated | File Locations |
| :--- | :--- | :--- |
| **Node.js & Express REST Architecture** | Express router modularization, controller separation, centralized JSON error middleware, asynchronous request handlers. | `server/src/server.js`<br>`server/src/routes/*.routes.js` |
| **MongoDB Mongoose Schema Modeling** | 10 distinct schemas featuring subdocument arrays, unique compound indexes, enum validation, default values, and virtual properties. | `server/src/models/User.js`<br>`server/src/models/WorkoutProgram.js`<br>`server/src/models/WeeklyPlan.js` |
| **Stateful Calculations in MongoDB** | Virtual properties for adherence percentage (`completedCount / 7 * 100`), hydration percentage and remaining volume calculation. | `server/src/models/WeeklyPlan.js`<br>`server/src/models/HydrationLog.js` |
| **Authentication & Authorization** | Bcrypt password hashing (10 salt rounds), JSON Web Tokens (JWT) signing, and protected route middleware. | `server/src/models/User.js`<br>`server/src/middleware/auth.js` |
| **Database Seeding** | Automated idempotent seed script populating comprehensive exercises, workout programs, and demo user records. | `server/src/seed/seed.js`<br>`server/src/seed/seedData.js` |

---

### Course Outcome 5 (CO5)
**Implement web application security, Progressive Web App (PWA) capabilities, version control, and containerized deployment workflows.**

| Implemented Feature in GOAT FIT | Syllabus Concepts Demonstrated | File Locations |
| :--- | :--- | :--- |
| **Application Hardening & Security** | Helmet HTTP security headers (CSP, HSTS, X-Content-Type-Options), strict CORS whitelisting, Express rate limiting on sensitive endpoints. | `server/src/server.js`<br>`server/src/middleware/rateLimiter.js` |
| **Progressive Web App (PWA)** | Web App Manifest (`manifest.webmanifest`), theme color, standalone display mode, and Service Worker (`sw.js`) for app-shell caching. | `client/public/manifest.webmanifest`<br>`client/public/sw.js`<br>`client/src/index.html` |
| **Containerization with Docker** | Multi-service orchestration configuration (`docker-compose.yml`) deploying MongoDB, Express API, and Angular NGINX frontend. | `docker-compose.yml`<br>`server/Dockerfile`<br>`client/Dockerfile`<br>`client/nginx.conf` |
| **Automated Verification** | Integration test suite verifying 17 distinct API workflows with 100% pass rate. | `server/test/api.test.js` |

---

## Viva Voce Frequently Asked Questions & Model Answers

### Q1: Why did you choose MongoDB over a relational database like MySQL for GOAT FIT?
> **Answer:** Fitness routines and workout sessions are inherently hierarchical and flexible. An exercise program contains an array of exercises, each having variable sets, reps, and weights. MongoDB subdocument arrays model this directly without requiring complex multi-table JOINs across four different relational tables. Additionally, Mongoose schemas provide strong validation while preserving document scalability.

### Q2: How does the rest timer prevent time drift when the browser is minimized or throttled?
> **Answer:** Mobile and desktop browsers throttle `setInterval` callbacks down to 1 execution per second or slower when a tab is inactive. GOAT FIT avoids counting down by decrements; instead, upon starting a timer, it calculates an absolute future deadline timestamp: `deadline = Date.now() + durationSeconds * 1000`. On every tick, the remaining time is calculated as `Math.max(0, Math.round((deadline - Date.now()) / 1000))`, guaranteeing 100% timing accuracy regardless of browser throttling.

### Q3: How is data isolation maintained between Guest Demo Mode and registered users?
> **Answer:** Registered users authenticate via JWT tokens; their records are saved securely to MongoDB using their unique `user._id` foreign key reference. For guest visitors who click "Continue in Guest Demo Mode", the Angular client intercepts state operations and routes them to browser `localStorage` under distinct keys (`goat_fit_demo_sessions`, `goat_fit_demo_hydration`, etc.). Guest data never touches or pollutes cloud database records.

### Q4: Explain the Mifflin-St Jeor equation used in the Nutrition Engine.
> **Answer:** Mifflin-St Jeor is the clinically validated standard for Basal Metabolic Rate (BMR):
> - **Men:** $BMR = (10 \times \text{weight in kg}) + (6.25 \times \text{height in cm}) - (5 \times \text{age in years}) + 5$
> - **Women:** $BMR = (10 \times \text{weight in kg}) + (6.25 \times \text{height in cm}) - (5 \times \text{age in years}) - 161$
> Total Daily Energy Expenditure (TDEE) is calculated by multiplying BMR by an activity factor (1.2 to 1.9). Goal caloric adjustments (-500 kcal for cutting, +350 kcal for bulking) are then partitioned into 35% Protein, 45% Carbohydrate, and 20% Dietary Fats.
