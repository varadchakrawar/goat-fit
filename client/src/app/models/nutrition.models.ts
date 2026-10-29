export interface MacroSplit {
  proteinPercent: number;
  carbPercent?: number;
  carbsPercent?: number;
  fatPercent?: number;
  fatsPercent?: number;
}

export interface MacroGrams {
  protein: number;
  carb?: number;
  carbs?: number;
  fat?: number;
  fats?: number;
}

export interface NutritionCalculation {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macroSplit?: MacroSplit;
  macroGrams?: MacroGrams;
  macros?: {
    proteinPercent: number;
    carbPercent: number;
    fatPercent: number;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
  };
  mealPacingAdvice?: string;
  smartRecommendation?: string;
}

export interface NutritionProfile extends NutritionCalculation {
  _id?: string;
  user?: string;
  age: number;
  gender: string;
  biologicalSex?: string;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  goal: string;
}
