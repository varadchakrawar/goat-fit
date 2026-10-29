import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { WorkoutsComponent } from './pages/workouts/workouts.component';
import { WorkoutDetailComponent } from './pages/workouts/workout-detail.component';
import { ExercisesComponent } from './pages/exercises/exercises.component';
import { PlannerComponent } from './pages/planner/planner.component';
import { ActiveWorkoutComponent } from './pages/active-workout/active-workout.component';
import { NutritionComponent } from './pages/nutrition/nutrition.component';
import { HydrationComponent } from './pages/hydration/hydration.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'workouts', component: WorkoutsComponent },
  { path: 'workouts/:idOrSlug', component: WorkoutDetailComponent },
  { path: 'exercises', component: ExercisesComponent },
  { path: 'planner', component: PlannerComponent },
  { path: 'active-workout', component: ActiveWorkoutComponent },
  { path: 'nutrition', component: NutritionComponent },
  { path: 'hydration', component: HydrationComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'auth', component: AuthComponent },
  { path: '**', redirectTo: '' }
];
