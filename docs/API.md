# GOAT FIT — REST API Reference Documentation

Base URL: `http://localhost:5000/api`

All successful responses return JSON with `{ "success": true, "data": ... }`.  
Errors return `{ "success": false, "message": "Error description" }`.

---

## 1. Authentication (`/api/auth`)

### Register New User
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "Aryan Patil",
    "email": "aryan@example.com",
    "password": "securepassword123",
    "profile": {
      "fitnessGoal": "bulk",
      "activityLevel": "very_active"
    }
  }
  ```
- **Response:** `201 Created` with JWT token and user profile object.

### Login User
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "athlete@goatfit.com",
    "password": "goatfitpassword123"
  }
  ```
- **Response:** `200 OK` with JWT token and user profile object.

### Get Current User Profile
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with user details.

### Update Profile Preferences
- **Method:** `PUT`
- **Endpoint:** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Aryan Patil (Updated)",
    "profile": {
      "heightCm": 180,
      "weightKg": 78,
      "fitnessGoal": "cut"
    }
  }
  ```
- **Response:** `200 OK` with updated user object.

---

## 2. Workouts & Programs (`/api/workouts`)

### List All Workout Programs
- **Method:** `GET`
- **Endpoint:** `/api/workouts`
- **Query Parameters:**
  - `muscleGroup`: Filter by category (`Chest`, `Back`, `Shoulder`, `Arms`, `Legs`, `Abs`, `Full Body`, `Home Workout`).
  - `difficulty`: Filter by difficulty (`Beginner`, `Intermediate`, `Advanced`).
  - `search`: Case-insensitive text search.
  - `sort`: Sorting option (`featured`, `duration_asc`, `duration_desc`).
- **Response:** `200 OK` with array of workout program documents.

### Get Program Details by Slug or ID
- **Method:** `GET`
- **Endpoint:** `/api/workouts/:idOrSlug`
- **Response:** `200 OK` with complete workout program, warmup protocols, and exercise lists.

---

## 3. Exercise Library (`/api/exercises`)

### List Exercises
- **Method:** `GET`
- **Endpoint:** `/api/exercises`
- **Query Parameters:**
  - `category`: Filter by target muscle group.
  - `difficulty`: Filter by difficulty.
  - `search`: Text search across name and description.
- **Response:** `200 OK` with array of exercise objects.

### Get Exercise Details
- **Method:** `GET`
- **Endpoint:** `/api/exercises/:idOrSlug`
- **Response:** `200 OK` with step-by-step instructions, breathing cues, common mistakes, and safety notes.

---

## 4. Weekly Split Planner (`/api/planner`)

### Get Current User Weekly Plan
- **Method:** `GET`
- **Endpoint:** `/api/planner`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with 7-day schedule, assigned programs, and calculated adherence percentage.

### Update Day in Plan
- **Method:** `PUT`
- **Endpoint:** `/api/planner/days/:dayIndex`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Quad Sweep & Hamstring Powerhouse",
    "category": "Legs",
    "notes": "Deep squats and Romanian deadlifts."
  }
  ```
- **Response:** `200 OK` with updated weekly plan.

### Toggle Day Completion
- **Method:** `POST`
- **Endpoint:** `/api/planner/days/:dayIndex/toggle`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with re-calculated completion fraction and adherence percentage.

### Reset Week
- **Method:** `POST`
- **Endpoint:** `/api/planner/reset`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with all completion marks cleared for the new training week.

---

## 5. Nutrition & TDEE Engine (`/api/nutrition`)

### Calculate BMR, TDEE & Macros (Mifflin-St Jeor)
- **Method:** `POST`
- **Endpoint:** `/api/nutrition/calculate`
- **Body:**
  ```json
  {
    "age": 23,
    "heightCm": 178,
    "weightKg": 76,
    "biologicalSex": "male",
    "activityLevel": "very_active",
    "goal": "bulk",
    "macroSplit": {
      "proteinPercent": 35,
      "carbsPercent": 45,
      "fatsPercent": 20
    }
  }
  ```
- **Response:** `200 OK` with calculated BMR, TDEE, daily target calories, and gram breakdowns for protein, carbohydrates, and fats.

### Get Saved Nutrition Profile
- **Method:** `GET`
- **Endpoint:** `/api/nutrition`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with user's saved nutritional targets.

### Save Nutrition Profile
- **Method:** `PUT`
- **Endpoint:** `/api/nutrition`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Same structure as calculate body.
- **Response:** `200 OK` with saved nutrition profile.

---

## 6. Hydration Tracker (`/api/hydration`)

### Get Today's Hydration Log
- **Method:** `GET`
- **Endpoint:** `/api/hydration/today`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with glasses logged, total ml, daily target ml, percentage, and remaining ml.

### Log Glass (+250 ml)
- **Method:** `POST`
- **Endpoint:** `/api/hydration/log-glass`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "volumeMl": 250 }`
- **Response:** `200 OK` with updated log.

### Undo Glass (-250 ml)
- **Method:** `POST`
- **Endpoint:** `/api/hydration/undo-glass`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with updated log.

### Update Daily Target
- **Method:** `PUT`
- **Endpoint:** `/api/hydration/goal`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ "dailyGoalMl": 2500 }`
- **Response:** `200 OK` with updated goal.

### 7-Day History
- **Method:** `GET`
- **Endpoint:** `/api/hydration/history?days=7`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with daily history records.

---

## 7. Workout Sessions & Progress (`/api/sessions`)

### Record Completed Workout Session
- **Method:** `POST`
- **Endpoint:** `/api/sessions`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "workoutTitle": "Chest Annihilation & Upper Pec Sculpt",
    "programName": "Chest Annihilation & Upper Pec Sculpt",
    "muscleGroup": "Chest",
    "durationMinutes": 52,
    "isCompleted": true,
    "completedExercises": [
      {
        "exerciseName": "Barbell Flat Bench Press",
        "sets": [
          { "setNumber": 1, "reps": 10, "weightKg": 80, "completed": true },
          { "setNumber": 2, "reps": 10, "weightKg": 85, "completed": true }
        ]
      }
    ]
  }
  ```
- **Response:** `201 Created` with recorded session document.

### Get User Workout History
- **Method:** `GET`
- **Endpoint:** `/api/sessions?limit=20&page=1`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with paginated session array.

### Get Aggregate Workout Statistics
- **Method:** `GET`
- **Endpoint:** `/api/sessions/stats`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with total workouts, total sets, total minutes, and muscle group distribution.

---

## 8. Public Services (`/api/public`)

### Health Check
- **Method:** `GET`
- **Endpoint:** `/api/public/health`
- **Response:** `200 OK` `{ "status": "UP", "timestamp": "...", "database": "connected" }`.

### Live Platform Statistics
- **Method:** `GET`
- **Endpoint:** `/api/public/stats`
- **Response:** `200 OK` with live database counts for programs, exercises, and completed workouts.

### Newsletter Subscription (GOAT Dispatch)
- **Method:** `POST`
- **Endpoint:** `/api/public/newsletter`
- **Body:** `{ "email": "athlete@example.com" }`
- **Response:** `201 Created` with confirmation message.

### Submit Contact Message (Coaching HQ)
- **Method:** `POST`
- **Endpoint:** `/api/public/contact`
- **Body:**
  ```json
  {
    "name": "Marcus Vance",
    "email": "marcus@example.com",
    "subject": "Training Inquiry",
    "message": "Questions about weekly split customization."
  }
  ```
- **Response:** `201 Created` with message persistence confirmation.
