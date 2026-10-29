require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const Exercise = require('../models/Exercise');
const WorkoutProgram = require('../models/WorkoutProgram');
const User = require('../models/User');
const WeeklyPlan = require('../models/WeeklyPlan');
const NutritionProfile = require('../models/NutritionProfile');
const { exercises, programs } = require('./seedData');

const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database seed process...');
    await connectDB();

    const rawExercises = exercises || [];
    const rawPrograms = programs || [];

    console.log(`[Seed] Processing ${rawExercises.length} exercises...`);
    const exerciseMap = {};

    for (const rawEx of rawExercises) {
      const exData = {
        name: rawEx.name,
        slug: rawEx.slug,
        category: rawEx.category || (rawEx.targetMuscles ? rawEx.targetMuscles[0] : 'Chest'),
        targetMuscles: rawEx.targetMuscles || [rawEx.category || 'Chest'],
        secondaryMuscles: rawEx.secondaryMuscles || [],
        equipment: rawEx.equipment === 'Bodyweight' || rawEx.equipment === 'None' ? 'Bodyweight' : rawEx.equipment || 'Barbell',
        difficulty: rawEx.difficulty || 'Intermediate',
        instructions: rawEx.instructions || [],
        breathingCues: rawEx.breathingCues || '',
        movementCues: rawEx.movementCues || '',
        commonMistakes: rawEx.commonMistakes || [],
        safetyNotes: rawEx.safetyNotes || '',
        defaultSets: rawEx.defaultSets || 4,
        defaultReps: rawEx.defaultReps || '8-12',
        defaultRestSeconds: rawEx.defaultRestSeconds || 60,
        imageUrl: rawEx.imageUrl || 'assets/images/image-4-1.jpg'
      };

      let exercise = await Exercise.findOne({ slug: exData.slug });
      if (!exercise) {
        exercise = await Exercise.create(exData);
        console.log(`[Seed] + Created exercise: ${exercise.name}`);
      } else {
        Object.assign(exercise, exData);
        await exercise.save();
        console.log(`[Seed] ~ Updated exercise: ${exercise.name}`);
      }
      exerciseMap[exercise.name] = exercise._id;
    }

    console.log(`[Seed] Processing ${rawPrograms.length} workout programs...`);
    for (const rawProg of rawPrograms) {
      const enrichedExercises = (rawProg.exercises || []).map((item, index) => {
        const exName = item.exerciseName || item.name || '';
        return {
          exercise: exerciseMap[exName] || null,
          exerciseName: exName,
          order: item.order || index + 1,
          sets: item.sets || 4,
          reps: item.reps || item.repRange || '8-12',
          restSeconds: item.restSeconds || 60,
          notes: item.notes || ''
        };
      });

      const progData = {
        name: rawProg.name,
        slug: rawProg.slug,
        description: rawProg.description,
        category: rawProg.category || 'Chest',
        difficulty: rawProg.difficulty || 'Intermediate',
        durationMinutes: rawProg.durationMinutes || 52,
        trainingObjective: rawProg.trainingObjective || 'Hypertrophy & Strength',
        targetMuscles: rawProg.targetMuscles || [],
        equipment: rawProg.equipment || ['Barbell'],
        imageUrl: rawProg.imageUrl || 'assets/images/image-1-1.jpg',
        isFeatured: rawProg.isFeatured !== undefined ? rawProg.isFeatured : false,
        warmup: rawProg.warmup || '5 minutes dynamic warmup',
        coolDown: rawProg.coolDown || '5 minutes static stretching',
        exercises: enrichedExercises
      };

      let program = await WorkoutProgram.findOne({ slug: progData.slug });
      if (!program) {
        program = await WorkoutProgram.create(progData);
        console.log(`[Seed] + Created program: ${program.name}`);
      } else {
        Object.assign(program, progData);
        await program.save();
        console.log(`[Seed] ~ Updated program: ${program.name}`);
      }
    }

    // 3. Seed demo athlete account
    const demoEmail = 'athlete@goatfit.com';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Rivera (Verified GOAT)',
        email: demoEmail,
        password: 'goatfitpassword123',
        fitnessProfile: {
          age: 23,
          heightCm: 178,
          weightKg: 76,
          biologicalSex: 'male',
          activityLevel: 'very_active',
          goal: 'bulk',
          trainingExperience: 'intermediate'
        }
      });
      console.log(`[Seed] + Created demo user: ${demoEmail} (Password: goatfitpassword123)`);

      const defaultDays = [
        { dayIndex: 0, dayName: 'Monday', title: 'Chest Annihilation & Upper Pec Sculpt', workoutTitle: 'Chest Annihilation & Upper Pec Sculpt', category: 'Chest', isRestDay: false, completed: true, isCompleted: true, completedAt: new Date(Date.now() - 3 * 86400000) },
        { dayIndex: 1, dayName: 'Tuesday', title: 'V-Taper Lat Dominance & Deadlifts', workoutTitle: 'V-Taper Lat Dominance & Deadlifts', category: 'Back', isRestDay: false, completed: true, isCompleted: true, completedAt: new Date(Date.now() - 2 * 86400000) },
        { dayIndex: 2, dayName: 'Wednesday', title: 'Active Recovery & Mobility', workoutTitle: 'Active Recovery & Mobility', category: 'Full Body', isRestDay: true, completed: false, isCompleted: false },
        { dayIndex: 3, dayName: 'Thursday', title: '3D Boulder Shoulders & Traps', workoutTitle: '3D Boulder Shoulders & Traps', category: 'Shoulder', isRestDay: false, completed: false, isCompleted: false },
        { dayIndex: 4, dayName: 'Friday', title: 'Guns Hypertrophy (Biceps & Triceps)', workoutTitle: 'Guns Hypertrophy (Biceps & Triceps)', category: 'Arms', isRestDay: false, completed: false, isCompleted: false },
        { dayIndex: 5, dayName: 'Saturday', title: 'Quad Sweep & Hamstring Powerhouse', workoutTitle: 'Quad Sweep & Hamstring Powerhouse', category: 'Legs', isRestDay: false, completed: false, isCompleted: false },
        { dayIndex: 6, dayName: 'Sunday', title: 'Rest / Recovery', workoutTitle: 'Rest / Recovery', category: 'Full Body', isRestDay: true, completed: false, isCompleted: false }
      ];

      await WeeklyPlan.create({
        user: demoUser._id,
        templateName: 'GOAT Hypertrophy Split (7-Day)',
        days: defaultDays
      });
      console.log('[Seed] + Created default Weekly Plan for demo athlete');

      await NutritionProfile.create({
        user: demoUser._id,
        age: 23,
        heightCm: 178,
        weightKg: 76,
        biologicalSex: 'male',
        activityLevel: 'very_active',
        goal: 'bulk',
        bmr: 1780,
        tdee: 2800,
        targetCalories: 3150,
        macroSplit: { proteinPercent: 35, carbsPercent: 45, fatsPercent: 20 },
        macroGrams: { protein: 276, carbs: 354, fats: 70 }
      });
      console.log('[Seed] + Created default Nutrition Profile for demo athlete');
    } else {
      console.log(`[Seed] ~ Demo athlete account already exists: ${demoEmail}`);
    }

    console.log('[Seed] Database seeding completed successfully!');
    return true;
  } catch (err) {
    console.error('[Seed] Database seeding failed:', err);
    throw err;
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => disconnectDB().then(() => process.exit(0)))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
