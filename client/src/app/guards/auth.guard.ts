import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated || auth.isGuest) {
    return true;
  }

  // Not logged in and not guest - prompt on login/register page
  router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
  return false;
};
