import { Injectable, inject } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { ApiService } from './api.service';

export interface PlatformStats {
  totalPrograms: number;
  totalExercises: number;
  totalAthletes: number;
  totalSessionsCompleted: number;
  isLiveDatabase?: boolean;
}

export interface FaqItem {
  id: number | string;
  category: string;
  question: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private api = inject(ApiService);

  subscribeNewsletter(email: string): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>('public/newsletter', { email }).pipe(
      catchError((err) => of({ success: false, message: err.message || 'Subscription failed. Please try again.' }))
    );
  }

  submitContact(data: { name: string; email: string; subject?: string; message: string }): Observable<{ success: boolean; message: string }> {
    return this.api.post<{ success: boolean; message: string }>('public/contact', data).pipe(
      catchError((err) => of({ success: false, message: err.message || 'Submission failed. Please try again.' }))
    );
  }

  getPlatformStats(): Observable<PlatformStats> {
    return this.api.get<{ success: boolean; data: PlatformStats }>('public/stats').pipe(
      map((res) => res.data),
      catchError(() => of({
        totalPrograms: 8,
        totalExercises: 12,
        totalAthletes: 140,
        totalSessionsCompleted: 580,
        isLiveDatabase: false
      }))
    );
  }

  getFaqs(): Observable<FaqItem[]> {
    return this.api.get<{ success: boolean; data: FaqItem[] }>('public/faqs').pipe(
      map((res) => res.data || []),
      catchError(() => of(this.getFallbackFaqs()))
    );
  }

  private getFallbackFaqs(): FaqItem[] {
    return [
      {
        id: 'faq-1',
        category: 'Training & Splits',
        question: 'How do I choose between the 7-Day Split and the 6-Day Hypertrophy template?',
        answer: 'The default 7-Day GOAT Elite Split features dedicated single-muscle isolation days (Chest, Back, Shoulders, Arms, Legs) with 2 strategic active recovery days, ideal for lifters wanting maximal volume per body part. The 6-Day Split uses an Upper/Lower and Push/Pull/Legs rotation, which provides higher frequency.'
      },
      {
        id: 'faq-2',
        category: 'Progressive Overload',
        question: 'What is progressive overload and why does GOAT FIT emphasize it?',
        answer: 'Progressive overload is the continuous increase of stress placed upon the musculoskeletal system over time. In GOAT FIT, we track your weights, reps, and total tonnage volume. As long as you gradually add weight or perform more crisp reps within the 8–12 rep range, you force your body to synthesize new muscle tissue.'
      },
      {
        id: 'faq-3',
        category: 'Nutrition',
        question: 'How accurate is the Mifflin-St Jeor TDEE formula used in the calculator?',
        answer: 'The Mifflin-St Jeor equation is considered the clinical gold standard for estimating Basal Metabolic Rate (BMR) in non-obese and obese adults, with an accuracy rate within 10% of measured indirect calorimetry. We apply standard physical activity multipliers to estimate your Total Daily Energy Expenditure (TDEE).'
      },
      {
        id: 'faq-4',
        category: 'Nutrition',
        question: 'Why does GOAT FIT default to a 35% Protein, 45% Carb, 20% Fat distribution?',
        answer: 'This athletic macronutrient ratio prioritizes high protein (supporting muscle protein synthesis and recovery) and ample carbohydrates (refueling muscle glycogen for explosive gym output), while maintaining essential dietary fats for hormone optimization.'
      },
      {
        id: 'faq-5',
        category: 'Hydration',
        question: 'Why is the daily hydration target set to 2,000 ml (8 glasses)?',
        answer: 'A 2,000 ml baseline supports cardiovascular efficiency, joint lubrication, and cellular nutrient transport. Lifters with intense training or heavy sweating should customize their target upward using the Hydration Tracker goal setting.'
      },
      {
        id: 'faq-6',
        category: 'Accounts & Demo',
        question: 'What is Guest Demo Mode vs. Registered Account?',
        answer: 'In Guest Demo Mode, all features (workout catalogue, exercise guides, nutrition calculator, hydration tracker, rest timer, and planner) are completely unlocked and stored in your browser local storage. Registering a free account syncs your data securely to MongoDB across all your devices.'
      }
    ];
  }
}
