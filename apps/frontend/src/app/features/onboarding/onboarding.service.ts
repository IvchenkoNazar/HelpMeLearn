import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getFields() {
    return firstValueFrom(this.http.get<any[]>(`${this.api}/api/fields`));
  }

  getSkillAssessment(fieldId: string, level: string) {
    return firstValueFrom(
      this.http.post<{ questions: any[] }>(`${this.api}/api/onboarding/skill-assessment`, {
        fieldId,
        level,
      }),
    );
  }

  generateProgram(data: { fieldId: string; level: string; goal: string; targetDate?: string }) {
    return firstValueFrom(
      this.http.post<any>(`${this.api}/api/programs/generate`, data),
    );
  }
}
