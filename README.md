# GOAT FIT — Be Your Own GOAT
### Full-Stack Athletic Training, Nutrition & Performance Platform
**Savitribai Phule Pune University (SPPU) | Third Year IT | Web Application Development (WAD)**

---

## 1. Project Overview & Identity

**GOAT FIT** is a complete, production-ready full-stack fitness web application designed and implemented in strict accordance with the primary product specification and visual reference `GOAT_FIT_Presentation.pptx`. 

The application helps beginners and seasoned lifters discover scientifically designed workout programs, understand proper biomechanics, execute customizable 7-day training splits, log real gym sets and weights, calculate evidence-based daily caloric needs using the Mifflin-St Jeor formula, track hydration (8 glasses / 2,000 ml default), and maintain fitness discipline.

- **Tagline:** Be Your Own GOAT
- **Primary Visual Palette:** Near-black (`#080A09`), Charcoal (`#101411`), Vivid Neon Green (`#20F36B`)
- **Typography:** Athletic headlines (`Bebas Neue`), Modern UI (`Outfit`), Crisp typography (`Inter`)
- **Dual Mode:** Full cloud persistence for registered athletes via MongoDB + 100% unlocked isolated **Guest Demo Mode** via browser storage.

---

## 2. Technology Stack & Rationale

| Layer | Technologies Used | Academic & Technical Rationale |
| :--- | :--- | :--- |
| **Frontend** | Angular 19+, TypeScript, Bootstrap 5, Chart.js | Modern Angular standalone component architecture with client-side routing, Reactive Forms, and HttpClient meeting SPPU WAD requirements without compromising code maintainability. |
| **Backend** | Node.js, Express.js | High-throughput asynchronous event-driven RESTful API architecture with centralized error handling and security middleware. |
| **Database** | MongoDB, Mongoose ODM | Flexible document model with subdocument arrays for sets/exercises and virtual properties for automated adherence calculation. |
| **Security** | Bcrypt (10 rounds), JWT, Helmet, CORS, Express Rate Limit | Robust defense-in-depth security protecting credentials, mitigating brute force attacks, and securing protected REST endpoints. |
| **PWA & DevOps** | Service Worker, Web App Manifest, Docker Compose | PWA offline app-shell caching, installability on mobile devices, and multi-container Docker orchestration. |

---

## 3. Key Implemented Features

### 1. Landing Page (Slides 1–10)
- **Hero Section:** Impactful *"UNLEASH YOUR INNER BEAST"* headline with dual call-to-actions, visual split preview, and live demonstration metrics pulled from MongoDB.
- **Who We Are (Slide 2):** GOAT FIT athletic philosophy and training core pillars.
- **Platform Features (Slide 3):** 6 interactive feature tiles: Workout Programs, Exercise Guidance, Nutrition Calculator, Hydration Tracker, Weekly Planner, and Global Rest Timer.
- **Featured Workouts (Slide 4):** Direct deep-links to workout detail pages.
- **Training Approach (Slide 6):** Evidence-based methodology (Progressive Overload, 35/45/20 Macro Partitioning, Active Recovery).
- **Athlete Community Stories (Slide 8):** Real case studies (David Chen, Sarah Jenkins, Marcus Vance) with transparent demonstration labels.
- **Expandable FAQ Accordion:** Searchable questions covering splits, nutrition formulas, and rest periods.
- **GOAT Dispatch:** Functional newsletter subscription form with server-side persistence.

### 2. Workout Programs Catalogue
- Filterable by **Muscle Group** (*All, Chest, Back, Shoulder, Arms, Legs, Abs, Full Body, Home Workout*).
- Filterable by **Difficulty** (*Beginner, Intermediate, Advanced*).
- Search by text, sorting by duration and featured status, and clear-filters button.
- Comprehensive workout detail view featuring warm-up/cool-down protocols, numbered exercise sequence, set/rep ranges, and one-click *"Add to Weekly Plan"* modal.

### 3. Exercise Library
- Movement database with target & secondary muscle tags, equipment requirements, difficulty badges, and step-by-step instructions.
- Biomechanical cues, breathing patterns, and **Common Form Mistakes to Avoid** alert callouts.

### 4. 7-Day & 6-Day Weekly Split Planner
- Default template matching the presentation:
  - *Monday:* Chest Annihilation & Upper Pec Sculpt
  - *Tuesday:* V-Taper Lat Dominance & Deadlifts
  - *Wednesday:* Active Recovery & Mobility
  - *Thursday:* 3D Boulder Shoulders & Traps
  - *Friday:* Guns Hypertrophy — Biceps & Triceps
  - *Saturday:* Quad Sweep & Hamstring Powerhouse
  - *Sunday:* Rest & Recovery
- Complete support for editing day titles, categories, and notes.
- Mark complete / undo toggle with real-time adherence calculation (`completed / 7 * 100%`).
- Reset Week confirmation modal.
- Dual selectable template architecture (7-day split vs 6-day hypertrophy template).

### 5. Real-Time Workout Session Tracker
- Active workout execution interface with set-by-set weight and repetition logging.
- Set completion triggers the rest timer automatically.
- Prevents accidental loss with cancel/finish session confirmations.
- Persisted workout sessions with aggregate volume and historical trends in MongoDB.

### 6. Mifflin-St Jeor TDEE & Macro Engine
- Inputs: Age, height (cm), weight (kg), biological sex, training activity multiplier (1.20 to 1.90), and goal (Cut, Maintain, Bulk).
- Clinical Mifflin-St Jeor BMR equation with goal caloric adjustments (-500 kcal cut, +350 kcal bulk).
- Default presentation golden split: **35% Protein, 45% Carbohydrate, 20% Healthy Fats**.
- Interactive macro slider validator ensuring `Sum(Macros) == 100%`.
- Save Targets to profile action.

### 7. Hydration Tracker
- 8 glass visual indicators (250 ml each, 2,000 ml default baseline).
- One-tap logging and undo.
- Configurable daily hydration target and custom milliliter inputs.
- Preserves 7-day historical hydration logs with automatic midnight archiving.

### 8. Global Floating Rest Timer
- Persistent floating dockable pill widget available across all application routes.
- Preset durations: 30s, 60s, 90s, 120s.
- **Deadline-Based Timing:** Calculates `deadline = Date.now() + durationMs`, completely eliminating timer drift caused by browser background throttling.
- Dual Web Audio oscillator chime upon completion.

### 9. User Dashboard & Profile
- Personalized athlete welcome header with fitness goal badge.
- Today's battle plan with one-click quick start.
- Metric tiles: Workouts completed, sets logged, weekly adherence, daily hydration.
- Editable fitness preferences modal.

### 10. Guest Demo Mode
- Instant access without mandatory account registration.
- Uses isolated browser `localStorage` state for workout plans, hydration, and nutrition.
- One-click demo credentials prefill (`athlete@goatfit.com` / `goatfitpassword123`).

### 11. SPPU WAD Curriculum Viva Portal
- Interactive examination page (`/curriculum`) mapping project features directly to **CO1, CO2, CO3, CO4, and CO5**.
- Live interactive REST API request/response inspector.

---

## 4. Prerequisites

- **Node.js:** v18.x, v20.x, or v24.x
- **npm:** v9.x or higher
- **MongoDB:** Local MongoDB Community Server running on `localhost:27017` or MongoDB Atlas URI.

---

## 5. Quick Start & Local Setup

### Step 1: Clone and Inspect
```bash
git clone https://github.com/your-username/goat-fit.git
cd "New folder (9)"
```

### Step 2: Configure Environment Variables
Create `server/.env` based on `server/.env.example`:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/goatfit
JWT_SECRET=goatfit_super_secret_jwt_key_sppu_wad_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200
COOKIE_SECRET=goatfit_cookie_secure_salt_production
```

### Step 3: Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 4: Seed the Database
Populate 12 rich exercise movements, 8 workout programs, and the demo athlete user:
```bash
cd ../server
npm run seed
```

### Step 5: Start the Development Servers
In terminal 1 (Backend API):
```bash
cd server
npm run dev
# Server listening on http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd client
npm start
# Application available at http://localhost:4200
```

Open your browser and navigate to: **`http://localhost:4200`**

---

## 6. Running Automated Tests

Run the backend integration test suite:
```bash
cd server
npm test
```
**Results:** **17 Passed, 0 Failed (100% pass rate)** covering:
1. API Health Check (`GET /api/public/health`)
2. Athlete Registration (`POST /api/auth/register`)
3. Duplicate Registration Rejection (400 Bad Request)
4. Athlete Login (`POST /api/auth/login`)
5. Protected Endpoint Auth Guard (`GET /api/auth/me`)
6. Workout Program Filtering by Muscle & Difficulty
7. Workout Detail Retrieval (`GET /api/workouts/:slug`)
8. Exercise Search & Detail Retrieval (`GET /api/exercises`)
9. Mifflin-St Jeor TDEE & Macro Calculation
10. Weekly Plan Retrieval & Adherence
11. Day Completion Toggle
12. Hydration Glass Logging (+250 ml)
13. Hydration History Preservation
14. Workout Session Recording
15. Workout Statistics Aggregation
16. Newsletter Subscription (GOAT Dispatch)
17. Contact Message Persistence (Coaching HQ)

---

## 7. Building for Production & Docker

### Production Angular Build
```bash
cd client
npm run build
# Output generated in client/dist/client
```

### Run with Docker Compose
```bash
docker-compose up --build
```
This deploys:
- **MongoDB 7.0 Container:** Port 27017
- **Express Backend Container:** Port 5000
- **Angular NGINX Frontend Container:** Port 4200

---

## 8. Academic Curriculum Mapping

For full academic viva details, refer to:
- [`docs/CURRICULUM_MAPPING.md`](file:///docs/CURRICULUM_MAPPING.md)
- [`docs/ARCHITECTURE.md`](file:///docs/ARCHITECTURE.md)
- [`docs/API.md`](file:///docs/API.md)
- [`postman/GOAT_FIT_Postman_Collection.json`](file:///postman/GOAT_FIT_Postman_Collection.json)

---

## 9. License & Credits

Developed for the Savitribai Phule Pune University (SPPU) Third Year Information Technology Web Application Development course. Designed around the aesthetic and technical specifications in `GOAT_FIT_Presentation.pptx`.
