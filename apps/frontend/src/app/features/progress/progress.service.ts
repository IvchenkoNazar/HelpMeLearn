// apps/frontend/src/app/features/progress/progress.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl + '/api';

export interface ProgressStats {
  completedTopics: number;
  totalTopics: number;
  completionPercent: number;
  streak: number;
  dailyGoal: number;
  todayCount: number;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private http = inject(HttpClient);

  getStats() {
    return firstValueFrom(this.http.get<ProgressStats>(`${API}/progress`));
  }

  getWeakAreas() {
    return firstValueFrom(this.http.get<any[]>(`${API}/progress/weak-areas`));
  }

  getDueReviews() {
    return firstValueFrom(this.http.get<any[]>(`${API}/progress/due-reviews`));
  }

  markReviewDone(topicId: string) {
    return firstValueFrom(this.http.post<any>(`${API}/progress/review/${topicId}/done`, {}));
  }

  markTopicComplete(topicId: string) {
    return firstValueFrom(this.http.patch<any>(`${API}/topics/${topicId}/complete`, {}));
  }

  addTopicToProgram(topicId: string) {
    return firstValueFrom(this.http.post<any>(`${API}/programs/topics/add`, { topicId }));
  }

  removeTopicFromProgram(topicId: string) {
    return firstValueFrom(this.http.delete<any>(`${API}/programs/topics/${topicId}`));
  }

  reorderTopics(topicIds: string[]) {
    return firstValueFrom(this.http.patch<any>(`${API}/programs/topics/reorder`, { topicIds }));
  }

  adaptProgram() {
    return firstValueFrom(this.http.post<any>(`${API}/programs/adapt`, {}));
  }
}
