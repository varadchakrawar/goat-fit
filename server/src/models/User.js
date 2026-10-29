const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not expose password hash in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profile: {
      age: { type: Number, min: 12, max: 120, default: 24 },
      gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
      heightCm: { type: Number, min: 80, max: 260, default: 175 },
      weightKg: { type: Number, min: 30, max: 350, default: 75 },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'heavy', 'athlete'],
        default: 'moderate',
      },
      fitnessGoal: {
        type: String,
        enum: ['lose', 'maintain', 'gain'],
        default: 'gain',
      },
      experienceLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate',
      },
      preferredSplit: {
        type: String,
        enum: ['7-day', '6-day'],
        default: '7-day',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password instance method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Safe object representation excluding password
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profile: this.profile,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);
