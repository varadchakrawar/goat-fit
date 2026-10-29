const NewsletterSubscription = require('../models/NewsletterSubscription');
const ContactMessage = require('../models/ContactMessage');
const WorkoutProgram = require('../models/WorkoutProgram');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const WorkoutSession = require('../models/WorkoutSession');

// @desc    Subscribe to GOAT Dispatch newsletter
// @route   POST /api/public/newsletter
const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await NewsletterSubscription.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'subscribed';
        await existing.save();
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription to the GOAT Dispatch has been reactivated.',
        });
      }
      return res.status(200).json({
        success: true,
        message: "You're already on the GOAT Dispatch roster! Check your inbox every Sunday.",
      });
    }

    await NewsletterSubscription.create({
      email: normalizedEmail,
      status: 'subscribed',
      source: 'footer_goat_dispatch',
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to the GOAT Dispatch! High-yield workout science and nutrition breakdowns are heading your way.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit message to Coaching HQ
// @route   POST /api/public/contact
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required fields.' });
    }

    if (message.length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters long.' });
    }

    const contactMsg = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject || 'General Coaching Inquiry',
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been transmitted to GOAT Coaching HQ. An athlete advisor will review it shortly.',
      data: {
        id: contactMsg._id,
        createdAt: contactMsg.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time platform statistics
// @route   GET /api/public/stats
const getPlatformStats = async (req, res, next) => {
  try {
    const [totalPrograms, totalExercises, totalAthletes, totalSessionsCompleted] = await Promise.all([
      WorkoutProgram.countDocuments(),
      Exercise.countDocuments(),
      User.countDocuments(),
      WorkoutSession.countDocuments({ completed: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPrograms,
        totalExercises,
        totalAthletes,
        totalSessionsCompleted,
        isLiveDatabase: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public FAQs
// @route   GET /api/public/faqs
const getFaqs = (req, res) => {
  const faqs = [
    {
      id: 'faq-1',
      category: 'Workouts',
      question: 'How do I choose between the 7-Day Split and the 6-Day Hypertrophy template?',
      answer:
        'The default 7-Day GOAT Elite Split features dedicated single-muscle isolation days (Chest, Back, Shoulders, Arms, Legs) with 2 strategic active recovery days, ideal for lifters wanting maximal volume per body part. The 6-Day Split uses an Upper/Lower and Push/Pull/Legs rotation, which provides higher frequency (hitting muscle groups twice weekly).',
    },
    {
      id: 'faq-2',
      category: 'Workouts',
      question: 'What is progressive overload and why does GOAT FIT emphasize it?',
      answer:
        'Progressive overload is the continuous increase of stress placed upon the musculoskeletal system over time. In GOAT FIT, we track your weights, reps, and total tonnage volume. As long as you gradually add weight or perform more crisp reps within the 8–12 rep range, you force your body to synthesize new muscle tissue.',
    },
    {
      id: 'faq-3',
      category: 'Nutrition',
      question: 'How accurate is the Mifflin-St Jeor TDEE formula used in the calculator?',
      answer:
        'The Mifflin-St Jeor equation is considered the clinical gold standard for estimating Basal Metabolic Rate (BMR) in non-obese and obese adults, with an accuracy rate within 10% of measured indirect calorimetry. We apply standard physical activity multipliers to estimate your Total Daily Energy Expenditure (TDEE).',
    },
    {
      id: 'faq-4',
      category: 'Nutrition',
      question: 'Why does GOAT FIT default to a 35% Protein, 45% Carb, 20% Fat distribution?',
      answer:
        'This athletic macronutrient ratio prioritizes high protein (supporting muscle protein synthesis and recovery) and ample carbohydrates (refueling muscle glycogen for explosive gym output), while maintaining essential dietary fats for hormone optimization. You can also customize your percentage split in the calculator.',
    },
    {
      id: 'faq-5',
      category: 'Hydration',
      question: 'Why is the daily hydration target set to 2,000 ml (8 glasses)?',
      answer:
        'A 2,000 ml baseline supports cardiovascular efficiency, joint lubrication, and cellular nutrient transport. lifters with intense training or heavy sweating should customize their target upward using the Hydration Tracker goal setting.',
    },
    {
      id: 'faq-6',
      category: 'Accounts & Demo',
      question: 'What is Guest Demo Mode vs. Registered Account?',
      answer:
        'In Guest Demo Mode, all features (workout catalogue, exercise guides, nutrition calculator, hydration tracker, rest timer, and planner) are completely unlocked and stored in your browser local storage. Registering a free account syncs your data securely to MongoDB across all your devices.',
    },
  ];

  res.status(200).json({
    success: true,
    data: faqs,
  });
};

module.exports = {
  subscribeNewsletter,
  submitContactMessage,
  getPlatformStats,
  getFaqs,
};
