export interface UserProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  biologicalSex?: 'male' | 'female';
  heightCm?: number;
  weightKg?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete';
  fitnessGoal?: 'lose' | 'maintain' | 'gain';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredSplit?: '7-day' | '6-day';
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profile?: UserProfile;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  profile?: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}
