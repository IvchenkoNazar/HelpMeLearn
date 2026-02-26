import { inject, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const injector = inject(EnvironmentInjector);

  if (authService.initialized()) {
    return authService.isAuthenticated() || router.createUrlTree(['/auth/login']);
  }

  return runInInjectionContext(injector, () =>
    toObservable(authService.initialized).pipe(
      filter(Boolean),
      take(1),
      map(() => authService.isAuthenticated() || router.createUrlTree(['/auth/login'])),
    ),
  );
};
