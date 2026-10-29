require('dotenv').config();
const http = require('http');
const connectDB = require('../config/db');
const app = require('../server');
const mongoose = require('mongoose');

// Helper to make local HTTP requests to the express app without starting another listener
const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    let postData = '';
    if (body) {
      postData = JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    if (body) req.write(postData);
    req.end();
  });
};

const TEST_PORT = 5020 + Math.floor(Math.random() * 50);

const runAllTests = async () => {
  console.log('========================================================');
  console.log('   GOAT FIT BACKEND VERIFICATION & INTEGRATION SUITE    ');
  console.log('========================================================\n');

  await connectDB();

  // Start test server on dedicated dynamic test port
  const server = app.listen(TEST_PORT);

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`[PASS] ${description}`);
      passed++;
    } else {
      console.error(`[FAIL] ${description}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status?.toLowerCase() === 'online', '1. Health check endpoint returns online status');

    // 2. Register new user
    const testEmail = `test_athlete_${Date.now()}@goatfit.test`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Rohan Sharma',
      email: testEmail,
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
      profile: { age: 21, heightCm: 178, weightKg: 74, activityLevel: 'moderate', fitnessGoal: 'gain' },
    });
    assert(regRes.status === 201 && regRes.body.token, '2. New user registration returns 201 and JWT token');
    const token = regRes.body.token;

    // 3. Duplicate registration rejection
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'Rohan Duplicate',
      email: testEmail,
      password: 'StrongPassword123!',
    });
    assert(dupRes.status === 409, '3. Duplicate registration correctly returns 409 Conflict');

    // 4. Login with valid credentials
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'StrongPassword123!',
    });
    assert(loginRes.status === 200 && loginRes.body.user.email === testEmail, '4. Valid login succeeds and returns user info');

    // 5. Login with invalid password
    const failLogin = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'WrongPassword!',
    });
    assert(failLogin.status === 401, '5. Invalid login credentials returns 401 Unauthorized');

    // 6. Protected endpoint rejection without token
    const unauthMe = await request('GET', '/api/auth/me');
    assert(unauthMe.status === 401, '6. Accessing protected endpoint without token returns 401');

    // 7. Protected endpoint access with Bearer token
    const authMe = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${token}` });
    assert(authMe.status === 200 && authMe.body.user.name === 'Rohan Sharma', '7. Accessing /api/auth/me with Bearer token succeeds');

    // 8. Workouts listing and filtering
    const allWorkouts = await request('GET', '/api/workouts');
    assert(allWorkouts.status === 200 && Array.isArray(allWorkouts.body.data), '8. Workout catalogue retrieval succeeds');

    const chestFilter = await request('GET', '/api/workouts?category=Chest');
    assert(
      chestFilter.status === 200 && chestFilter.body.data.every((w) => w.category === 'Chest'),
      '9. Workout category filter strictly returns specified category'
    );

    // 9. Exercises search
    const benchEx = await request('GET', '/api/exercises?search=Bench');
    assert(benchEx.status === 200 && benchEx.body.data.length > 0, '10. Exercise search for "Bench" returns relevant exercises');

    // 10. Planner functionality
    const planRes = await request('GET', '/api/planner', null, { Authorization: `Bearer ${token}` });
    assert(planRes.status === 200 && planRes.body.data.days.length === 7, '11. User weekly planner has 7 days initialized');

    // Toggle day 0 complete
    const toggleRes = await request('PATCH', '/api/planner/day/0/toggle-complete', null, { Authorization: `Bearer ${token}` });
    assert(toggleRes.status === 200 && toggleRes.body.data.days[0].completed === true, '12. Toggle day complete marks day as completed');

    // Reset week
    const resetRes = await request('POST', '/api/planner/reset-week', null, { Authorization: `Bearer ${token}` });
    assert(resetRes.status === 200 && resetRes.body.data.days.every((d) => !d.completed), '13. Reset week resets all day completions to false');

    // 11. Nutrition calculation test (Mifflin-St Jeor)
    const nutCalc = await request('POST', '/api/nutrition/calculate', {
      age: 25,
      gender: 'male',
      heightCm: 180,
      weightKg: 80,
      activityLevel: 'moderate',
      goal: 'gain',
      macroSplit: { proteinPercent: 35, carbPercent: 45, fatPercent: 20 },
    });
    // Men: 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805 BMR
    // TDEE = 1805 * 1.55 = 2798; +300 = 3098 kcal
    assert(
      nutCalc.status === 200 && nutCalc.body.data.bmr === 1805 && nutCalc.body.data.targetCalories >= 3000,
      '14. Nutrition calculator accurately computes Mifflin-St Jeor BMR and TDEE'
    );

    // 12. Hydration logging and undo
    const hydLog = await request('POST', '/api/hydration/log', { amountMl: 250 }, { Authorization: `Bearer ${token}` });
    assert(hydLog.status === 200 && hydLog.body.data.totalMl === 250 && hydLog.body.data.glasses === 1, '15. Hydration log increments water volume and glasses');

    const hydRem = await request('POST', '/api/hydration/remove', { amountMl: 250 }, { Authorization: `Bearer ${token}` });
    assert(hydRem.status === 200 && hydRem.body.data.totalMl === 0, '16. Hydration undo removes logged volume accurately');

    // 13. Workout session recording
    const sessionRes = await request(
      'POST',
      '/api/sessions',
      {
        programName: 'Chest Annihilation & Upper Pec Sculpt',
        durationMinutes: 48,
        exercises: [
          {
            exerciseName: 'Barbell Flat Bench Press',
            sets: [
              { setNumber: 1, reps: 10, weightKg: 80, completed: true },
              { setNumber: 2, reps: 8, weightKg: 85, completed: true },
            ],
          },
        ],
        notes: 'Integration test session',
      },
      { Authorization: `Bearer ${token}` }
    );
    // 10*80 + 8*85 = 800 + 680 = 1480 volume
    assert(
      sessionRes.status === 201 && sessionRes.body.data.totalVolumeKg === 1480,
      '17. Workout session records duration, sets, and computes total tonnage volume (1480 kg)'
    );

    // 14. Newsletter subscription
    const newsRes = await request('POST', '/api/public/newsletter', { email: `newsletter_${Date.now()}@goatfit.test` });
    assert(newsRes.status === 201 && newsRes.body.success, '18. Newsletter subscription succeeds');

    // 15. Contact message
    const contactRes = await request('POST', '/api/public/contact', {
      name: 'Aditi Deshmukh',
      email: 'aditi@sppu.test',
      subject: 'Inquiry on Training Splits',
      message: 'Looking for advice on programming deadlifts twice weekly.',
    });
    assert(contactRes.status === 201 && contactRes.body.success, '19. Contact message to Coaching HQ persists successfully');
  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  } finally {
    server.close();
    await mongoose.connection.close();
    console.log('\n========================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
};

runAllTests();
