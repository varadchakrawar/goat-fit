require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Exercise = require('../models/Exercise');
const WorkoutProgram = require('../models/WorkoutProgram');
const User = require('../models/User');
const WeeklyPlan = require('../models/WeeklyPlan');
const NutritionProfile = require('../models/NutritionProfile');
const HydrationLog = require('../models/HydrationLog');
const WorkoutSession = require('../models/WorkoutSession');
const { exercises, programs } = require('./seedData');
const { createDefault7DayPlan, calculateNutrition } = require('../controllers/authController');

const seed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Seeding exercises...');
    const exerciseMap = new Map();

    for (const ex of exercises) {
      const savedEx = await Exercise.findOneAndUpdate(
        { slug: ex.slug },
        { $set: ex },
        { upsert: true, new: true }
      );
      exerciseMap.set(savedEx.name, savedEx._id);
    }
    console.log(`[Seed] Seeded ${exercises.length} exercises.`);

    console.log('[Seed] Seeding workout programs...');
    for (const prog of programs) {
      // Resolve exercise object IDs
      const mappedExercises = prog.exercises.map((item) => {
        const exId = exerciseMap.get(item.exerciseName) || null;
        return {
          ...item,
          exercise: exId,
        };
      });

      await WorkoutProgram.findOneAndUpdate(
        { slug: prog.slug },
        {
          $set: {
            ...prog,
            exercises: mappedExercises,
          },
        },
        { upsert: true, new: true }
      );
    }
    console.log(`[Seed] Seeded ${programs.length} workout programs.`);

    // Seed Demo User
    console.log('[Seed] Seeding Demo User...');
    const demoEmail = 'demo@goatfit.com';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex "The GOAT" Mercer',
        email: demoEmail,
        password: 'goatfit123',
        role: 'user',
        profile: {
          age: 23,
          gender: 'male',
          heightCm: 180,
          weightKg: 82,
          activityLevel: 'heavy',
          fitnessGoal: 'gain',
          experienceLevel: 'advanced',
          preferredSplit: '7-day',
        },
      });
      console.log('[Seed] Created demo user (demo@goatfit.com / goatfit123)');
    }

    // Seed or update demo user's weekly plan
    let demoPlan = await WeeklyPlan.findOne({ user: demoUser._id });
    if (!demoPlan) {
      const planData = createDefault7DayPlan(demoUser._id);
      // Mark Monday and Tuesday completed for realistic adherence display (2 of 7 days, 29%)
      planData.days[0].completed = true;
      planData.days[0].completedAt = new Date(Date.now() - 2 * 86400000);
      planData.days[1].completed = true;
      planData.days[1].completedAt = new Date(Date.now() - 1 * 86400000);
      await WeeklyPlan.create(planData);
      console.log('[Seed] Created demo weekly plan with 29% adherence.');
    }

    // Seed demo user's nutrition profile
    const demoNut = calculateNutrition({
      age: 23,
      gender: 'male',
      heightCm: 180,
      weightKg: 82,
      activityLevel: 'heavy',
      goal: 'gain',
    });
    await NutritionProfile.findOneAndUpdate(
      { user: demoUser._id },
      { $set: { user: demoUser._id, ...demoNut } },
      { upsert: true }
    );

    // Seed demo user's hydration log for today
    const todayStr = new Date().toISOString().split('T')[0];
    await HydrationLog.findOneAndUpdate(
      { user: demoUser._id, dateString: todayStr },
      {
        $set: {
          user: demoUser._id,
          dateString: todayStr,
          glasses: 5,
          totalMl: 1250,
          goalMl: 2000,
          history: [
            { timestamp: new Date(Date.now() - 5 * 3600000), amountMl: 250, action: 'add' },
            { timestamp: new Date(Date.now() - 4 * 3600000), amountMl: 250, action: 'add' },
            { timestamp: new Date(Date.now() - 3 * 3600000), amountMl: 250, action: 'add' },
            { timestamp: new Date(Date.now() - 2 * 3600000), amountMl: 250, action: 'add' },
            { timestamp: new Date(Date.now() - 1 * 3600000), amountMl: 250, action: 'add' },
          ],
        },
      },
      { upsert: true }
    );

    // Seed demo user's workout sessions
    const existingSessions = await WorkoutSession.countDocuments({ user: demoUser._id });
    if (existingSessions === 0) {
      await WorkoutSession.create([
        {
          user: demoUser._id,
          programName: 'Chest Annihilation & Upper Pec Sculpt',
          startTime: new Date(Date.now() - 2 * 86400000),
          endTime: new Date(Date.now() - 2 * 86400000 + 52 * 60000),
          durationMinutes: 52,
          totalVolumeKg: 4680,
          completed: true,
          notes: 'Felt incredible on incline bench. Increased top set to 90kg for 8 clean reps.',
          exercises: [
            {
              exerciseName: 'Barbell Flat Bench Press',
              sets: [
                { setNumber: 1, reps: 10, weightKg: 80, completed: true },
                { setNumber: 2, reps: 10, weightKg: 90, completed: true },
                { setNumber: 3, reps: 8, weightKg: 95, completed: true },
                { setNumber: 4, reps: 8, weightKg: 95, completed: true },
              ],
            },
            {
              exerciseName: 'Incline Dumbbell Press',
              sets: [
                { setNumber: 1, reps: 12, weightKg: 32, completed: true },
                { setNumber: 2, reps: 10, weightKg: 34, completed: true },
                { setNumber: 3, reps: 10, weightKg: 34, completed: true },
              ],
            },
          ],
        },
        {
          user: demoUser._id,
          programName: 'V-Taper Lat Dominance & Deadlifts',
          startTime: new Date(Date.now() - 1 * 86400000),
          endTime: new Date(Date.now() - 1 * 86400000 + 55 * 60000),
          durationMinutes: 55,
          totalVolumeKg: 6240,
          completed: true,
          notes: 'Deadlifts felt snappy with zero lower back strain. Chalk helped tremendously.',
          exercises: [
            {
              exerciseName: 'Conventional Barbell Deadlift',
              sets: [
                { setNumber: 1, reps: 8, weightKg: 120, completed: true },
                { setNumber: 2, reps: 6, weightKg: 140, completed: true },
                { setNumber: 3, reps: 5, weightKg: 150, completed: true },
                { setNumber: 4, reps: 5, weightKg: 150, completed: true },
              ],
            },
            {
              exerciseName: 'Wide-Grip Lat Pulldown',
              sets: [
                { setNumber: 1, reps: 12, weightKg: 65, completed: true },
                { setNumber: 2, reps: 10, weightKg: 70, completed: true },
                { setNumber: 3, reps: 10, weightKg: 70, completed: true },
              ],
            },
          ],
        },
      ]);
      console.log('[Seed] Created realistic demo workout history.');
    }

    console.log('[Seed] Database seeding completed successfully! All records verified.');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
