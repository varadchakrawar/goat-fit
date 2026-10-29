require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const workoutRoutes = require('./routes/workout.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const plannerRoutes = require('./routes/planner.routes');
const sessionRoutes = require('./routes/session.routes');
const hydrationRoutes = require('./routes/hydration.routes');
const nutritionRoutes = require('./routes/nutrition.routes');
const progressRoutes = require('./routes/progressRoutes');
const publicRoutes = require('./routes/public.routes');

const app = express();

// Database Connection
connectDB().catch((err) => {
  console.error('[DB] Initial connection failed:', err.message);
});

// Security & Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:4200',
  'http://localhost:4200',
  'http://127.0.0.1:4200'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS blocked: Origin not allowed.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'goatfit_cookie_secret_dev_2026'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve public static assets
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// Health check endpoint (both /api/health and /api/public/health)
app.get('/api/health', (req, res) => {
  const isDbConnected = Boolean(require('mongoose').connection.readyState === 1);
  res.status(200).json({
    status: 'ONLINE',
    appName: 'GOAT FIT API',
    version: '1.0.0',
    curriculum: 'SPPU TE IT WAD Mini Project',
    database: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString()
  });
});

// Mount full API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/hydration', hydrationRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/public', publicRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    app: 'GOAT FIT REST API',
    tagline: 'Be Your Own GOAT',
    curriculum: 'SPPU TE IT - Web Application Development (WAD)',
    endpoints: {
      health: '/api/health',
      workouts: '/api/workouts',
      exercises: '/api/exercises',
      stats: '/api/public/stats'
    }
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 GOAT FIT REST API is active on port: ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🎯 Health Check: http://localhost:${PORT}/api/public/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
