import { Injectable, inject } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { NutritionCalculation, NutritionProfile, MacroSplit } from '../models/nutrition.models';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  private readonly GUEST_STORAGE_KEY = 'goatfit_guest_nutrition';

  calculate(params: {
    age: number;
    gender?: string;
    biologicalSex?: string;
    heightCm: number;
    weightKg: number;
    activityLevel: string;
    goal: string;
    macroSplit?: MacroSplit;
  }): Observable<NutritionCalculation> {
    return this.api.post<{ success: boolean; data: NutritionCalculation }>('nutrition/calculate', {
      ...params,
      biologicalSex: params.biologicalSex || params.gender || 'male',
      gender: params.gender || params.biologicalSex || 'male'
    }).pipe(
      map((res) => this.normalizeCalculation(res.data)),
      catchError(() => of(this.clientSideCalculate(params)))
    );
  }

  getProfile(): Observable<NutritionProfile> {
    if (this.auth.isGuest) {
      return of(this.getGuestProfile());
    }

    return this.api.get<{ success: boolean; data: NutritionProfile }>('nutrition/profile').pipe(
      map((res) => ({
        ...res.data,
        ...this.normalizeCalculation(res.data)
      })),
      catchError(() => of(this.getGuestProfile()))
    );
  }

  saveProfile(data: any): Observable<NutritionProfile> {
    if (this.auth.isGuest) {
      const calculated = this.clientSideCalculate(data);
      const profile: NutritionProfile = {
        ...data,
        ...calculated
      };
      localStorage.setItem(this.GUEST_STORAGE_KEY, JSON.stringify(profile));
      return of(profile);
    }

    return this.api.put<{ success: boolean; data: NutritionProfile }>('nutrition/profile', data).pipe(
      map((res) => ({
        ...res.data,
        ...this.normalizeCalculation(res.data)
      }))
    );
  }

  // Client-side Mifflin-St Jeor engine (SPPU CO2 concept: JS math calculation & validation)
  public clientSideCalculate(params: {
    age: number;
    gender?: string;
    biologicalSex?: string;
    heightCm: number;
    weightKg: number;
    activityLevel: string;
    goal: string;
    macroSplit?: MacroSplit;
  }): NutritionCalculation {
    const sex = params.biologicalSex || params.gender || 'male';
    const age = Number(params.age) || 24;
    const height = Number(params.heightCm) || 175;
    const weight = Number(params.weightKg) || 75;

    // Mifflin-St Jeor Formula
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += (sex === 'male' ? 5 : -161);
    bmr = Math.round(bmr);

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      heavy: 1.725,
      extra_active: 1.9,
      athlete: 1.9
    };
    const mult = multipliers[params.activityLevel] || 1.55;
    const tdee = Math.round(bmr * mult);

    let targetCalories = tdee;
    if (params.goal === 'lose' || params.goal === 'cut') {
      targetCalories = Math.max(1200, Math.round(tdee - 500));
    } else if (params.goal === 'gain' || params.goal === 'bulk') {
      targetCalories = Math.round(tdee + 300);
    }

    const pPct = params.macroSplit?.proteinPercent ?? 35;
    const cPct = params.macroSplit?.carbPercent ?? params.macroSplit?.carbsPercent ?? 45;
    const fPct = params.macroSplit?.fatPercent ?? params.macroSplit?.fatsPercent ?? 20;

    const pGrams = Math.round((targetCalories * (pPct / 100)) / 4);
    const cGrams = Math.round((targetCalories * (cPct / 100)) / 4);
    const fGrams = Math.round((targetCalories * (fPct / 100)) / 9);

    return {
      bmr,
      tdee,
      targetCalories,
      macroSplit: { proteinPercent: pPct, carbsPercent: cPct, fatsPercent: fPct },
      macroGrams: { protein: pGrams, carbs: cGrams, fats: fGrams },
      macros: {
        proteinPercent: pPct,
        carbPercent: cPct,
        fatPercent: fPct,
        proteinGrams: pGrams,
        carbGrams: cGrams,
        fatGrams: fGrams
      },
      mealPacingAdvice: 'Spread protein evenly across 3 to 4 meals to keep muscle protein synthesis elevated throughout the day.'
    };
  }

  private normalizeCalculation(data: any): NutritionCalculation {
    const pPct = data.macros?.proteinPercent ?? data.macroSplit?.proteinPercent ?? 35;
    const cPct = data.macros?.carbPercent ?? data.macroSplit?.carbsPercent ?? 45;
    const fPct = data.macros?.fatPercent ?? data.macroSplit?.fatsPercent ?? 20;

    const pGrams = data.macros?.proteinGrams ?? data.macroGrams?.protein ?? 210;
    const cGrams = data.macros?.carbGrams ?? data.macroGrams?.carbs ?? 270;
    const fGrams = data.macros?.fatGrams ?? data.macroGrams?.fats ?? 53;

    return {
      bmr: data.bmr || 1750,
      tdee: data.tdee || 2450,
      targetCalories: data.targetCalories || 2450,
      macroSplit: { proteinPercent: pPct, carbsPercent: cPct, fatsPercent: fPct },
      macroGrams: { protein: pGrams, carbs: cGrams, fats: fGrams },
      macros: {
        proteinPercent: pPct,
        carbPercent: cPct,
        fatPercent: fPct,
        proteinGrams: pGrams,
        carbGrams: cGrams,
        fatGrams: fGrams
      },
      mealPacingAdvice: data.mealPacingAdvice || 'Spread protein evenly across 3 to 4 meals to keep muscle protein synthesis elevated.'
    };
  }

  private getGuestProfile(): NutritionProfile {
    const saved = localStorage.getItem(this.GUEST_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }

    const defaultProfile: NutritionProfile = {
      age: 23,
      gender: 'male',
      biologicalSex: 'male',
      heightCm: 178,
      weightKg: 78,
      activityLevel: 'moderate',
      goal: 'gain',
      ...this.clientSideCalculate({
        age: 23,
        gender: 'male',
        heightCm: 178,
        weightKg: 78,
        activityLevel: 'moderate',
        goal: 'gain'
      })
    };
    localStorage.setItem(this.GUEST_STORAGE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  }
}
