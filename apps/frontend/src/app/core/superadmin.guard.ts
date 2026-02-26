import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

export const superadminGuard: CanActivateFn = () => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<any>(`${environment.apiUrl}/api/profiles/me`).pipe(
    map((profile) => {
      if (profile?.role === 'superadmin') return true;
      return router.createUrlTree(['/dashboard']);
    }),
    catchError(() => of(router.createUrlTree(['/dashboard']))),
  );
};
