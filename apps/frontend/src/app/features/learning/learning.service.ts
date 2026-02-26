import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl + '/api';

@Injectable({ providedIn: 'root' })
export class LearningService {
  private http = inject(HttpClient);

  // Topics
  getTopicsByField(fieldId: string) {
    return firstValueFrom(this.http.get<any[]>(`${API}/topics/field/${fieldId}`));
  }

  getTopic(topicId: string) {
    return firstValueFrom(this.http.get<any>(`${API}/topics/${topicId}`));
  }

  trackView(topicId: string) {
    return firstValueFrom(this.http.post(`${API}/topics/${topicId}/view`, {}));
  }

  getRecentlyViewed() {
    return firstValueFrom(this.http.get<any[]>(`${API}/topics/recently-viewed`));
  }

  // Content
  getSummary(topicId: string, refresh = false) {
    return firstValueFrom(
      this.http.get<{ content: { markdown: string }; cached: boolean }>(
        `${API}/topics/${topicId}/content/summary${refresh ? '?refresh=true' : ''}`,
      ),
    );
  }

  getCheatsheet(topicId: string, refresh = false) {
    return firstValueFrom(
      this.http.get<{ content: { markdown: string }; cached: boolean }>(
        `${API}/topics/${topicId}/content/cheatsheet${refresh ? '?refresh=true' : ''}`,
      ),
    );
  }

  getQuiz(topicId: string, refresh = false) {
    return firstValueFrom(
      this.http.get<{ questions: any[]; cached: boolean }>(
        `${API}/topics/${topicId}/content/quiz${refresh ? '?refresh=true' : ''}`,
      ),
    );
  }

  submitQuiz(topicId: string, answers: Array<{ questionId: string; selectedAnswer: string; correctAnswer: string }>) {
    return firstValueFrom(
      this.http.post<any>(`${API}/topics/${topicId}/quiz/submit`, { answers }),
    );
  }

  // Notes
  getNote(topicId: string) {
    return firstValueFrom(this.http.get<any>(`${API}/notes/${topicId}`));
  }

  saveNote(topicId: string, content: string) {
    return firstValueFrom(this.http.put<any>(`${API}/notes/${topicId}`, { content }));
  }

  // Bookmarks
  getBookmarks() {
    return firstValueFrom(this.http.get<any[]>(`${API}/bookmarks`));
  }

  addBookmark(topicId: string) {
    return firstValueFrom(this.http.post<any>(`${API}/bookmarks/${topicId}`, {}));
  }

  removeBookmark(topicId: string) {
    return firstValueFrom(this.http.delete(`${API}/bookmarks/${topicId}`));
  }

  // Search
  search(query: string, fieldId?: string) {
    const params = fieldId ? `?q=${query}&fieldId=${fieldId}` : `?q=${query}`;
    return firstValueFrom(this.http.get<any[]>(`${API}/search${params}`));
  }
}
