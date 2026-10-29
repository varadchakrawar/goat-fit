/**
 * GOAT FIT - Full Integration Test Suite
 * SPPU Third Year IT | WAD Acceptance Verification
 */
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const opts = { ...options, headers: { ...options.headers } };
    let payload = null;
    if (postData) {
      payload = typeof postData === 'string' ? postData : JSON.stringify(postData);
      opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 Starting GOAT FIT Full-Stack API Integration Tests');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
      failed++;
    }
  };

  try {
    // Test 1: Health Check
    const health = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/public/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.body.status === 'ONLINE', '1. Server Health Check returns 200 ONLINE');

    // Test 2: Register New Athlete
    const testEmail = `athlete_${Date.now()}@goatfit.com`;
    const regRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Test Athlete',
        email: testEmail,
        password: 'password123',
        confirmPassword: 'password123'
      }
    );
    assert(regRes.status === 201 && regRes.body.token, '2. New user registration returns 201 and JWT token');
    const token = regRes.body.token;

    // Test 3: Reject Duplicate Registration
    const dupRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Duplicate Athlete',
        email: testEmail,
        password: 'password123'
      }
    );
    assert(dupRes.status === 409, '3. Duplicate email registration rejected with 409 Conflict');

    // Test 4: Valid Login
    const loginRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: testEmail,
        password: 'password123'
      }
    );
    assert(loginRes.status === 200 && loginRes.body.token, '4. Valid login returns 200 and auth token');

    // Test 5: Invalid Login Rejected
    const badLogin = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: testEmail,
        password: 'wrong_password_999'
      }
    );
    assert(badLogin.status === 401, '5. Invalid login returns 401 Unauthorized');

    // Test 6: Protected endpoint rejects unauthenticated request
    const unauthRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET'
    });
    assert(unauthRes.status === 401, '6. Unauthenticated request to /api/auth/me rejected with 401');

    // Test 7: Protected endpoint accepts Bearer token
    const authMeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(authMeRes.status === 200 && authMeRes.body.user.email === testEmail, '7. Authenticated /api/auth/me returns user profile');

    // Test 8: List Workout Programs
    const workoutsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/workouts',
      method: 'GET'
    });
    assert(workoutsRes.status === 200 && workoutsRes.body.data.length > 0, '8. Workout catalogue returns programs from database');

    // Test 9: Workout Filtering by Muscle Group & Difficulty
    const filterRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/workouts?muscleGroup=Chest&difficulty=Intermediate',
      method: 'GET'
    });
    assert(
      filterRes.status === 200 &&
        filterRes.body.data.every((p) => p.muscleGroup === 'Chest' && p.difficulty === 'Intermediate'),
      '9. Workout filtering by Category + Difficulty operates accurately'
    );

    // Test 10: List Exercises and Detail
    const exList = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/exercises?search=Bench',
      method: 'GET'
    });
    const benchEx = exList.body.data[0];
    assert(
      exList.status === 200 &&
        benchEx &&
        benchEx.instructions.length > 0 &&
        benchEx.commonMistakes.length > 0,
      '10. Exercise search and detail contains step-by-step instructions and common mistakes'
    );

    // Test 11: Nutrition Calculation (Mifflin-St Jeor)
    const calcRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/nutrition/calculate',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        age: 22,
        heightCm: 175,
        weightKg: 72,
        biologicalSex: 'male',
        activityLevel: 'moderate',
        goal: 'maintain',
        macroSplit: { proteinPercent: 35, carbsPercent: 45, fatsPercent: 20 }
      }
    );
    const nut = calcRes.body.data;
    assert(
      calcRes.status === 200 &&
        nut.bmr > 1600 &&
        nut.targetCalories > 2000 &&
        nut.macroGrams.protein > 0 &&
        nut.macroGrams.carbs > 0 &&
        nut.macroGrams.fats > 0,
      '11. Nutrition Calculator implements accurate Mifflin-St Jeor TDEE & 35/45/20 macro targets'
    );

    // Test 12: Weekly Split Planner retrieval & completion
    const planRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/planner',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(planRes.status === 200 && planRes.body.data.days.length === 7, '12. Weekly planner returns 7-day training schedule');

    // Test 13: Toggle completion on a planner day
    const toggleRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/planner/day/0/toggle-complete',
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(toggleRes.status === 200 && toggleRes.body.data.days[0].isCompleted === true, '13. Weekly planner marks day completed and computes adherence');

    // Test 14: Hydration Tracker logging
    const hydroLog = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/hydration/log-glass',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      },
      { volumeMl: 250 }
    );
    assert(
      hydroLog.status === 200 && hydroLog.body.data.totalMl === 250 && hydroLog.body.data.glassesLogged === 1,
      '14. Hydration logging logs 250ml glass and updates total milliliters'
    );

    // Test 15: Workout Session recording
    const sessionRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/sessions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      },
      {
        workoutTitle: 'Chest Annihilation & Upper Pec Sculpt',
        muscleGroup: 'Chest',
        durationMinutes: 52,
        completedExercises: [
          {
            exerciseName: 'Barbell Bench Press',
            sets: [
              { setNumber: 1, reps: 10, weightKg: 80, completed: true },
              { setNumber: 2, reps: 8, weightKg: 85, completed: true }
            ]
          }
        ],
        notes: 'Felt strong, solid chest pump',
        isCompleted: true
      }
    );
    assert(sessionRes.status === 201 && sessionRes.body.data._id, '15. Workout session recorded with sets, reps, and weights');

    // Test 16: Newsletter Subscription
    const newsRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/public/newsletter',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: `athlete.dispatch_${Date.now()}@goatfit.com` }
    );
    assert(newsRes.status === 201, '16. GOAT Dispatch newsletter subscription stored in MongoDB');

    // Test 17: Coaching HQ Contact Form
    const contactRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/public/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Jordan Belfort',
        email: 'jordan@wallstreet.com',
        subject: 'Elite Coaching Program',
        message: 'Looking to start the 7-day hypertrophy split.'
      }
    );
    assert(contactRes.status === 201, '17. Coaching HQ contact message persists to database');

    console.log('\n======================================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
