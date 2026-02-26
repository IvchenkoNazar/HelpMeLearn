import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/admin`;

  getUsers() {
    return firstValueFrom(this.http.get<any[]>(`${this.api}/users`));
  }

  updateTier(userId: string, tier: 'free' | 'premium') {
    return firstValueFrom(
      this.http.patch<any>(`${this.api}/users/${userId}/tier`, { tier }),
    );
  }
}
