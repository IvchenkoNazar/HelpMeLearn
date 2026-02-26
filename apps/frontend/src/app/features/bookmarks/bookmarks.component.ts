import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LearningService } from '../learning/learning.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, CardComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Bookmarks</h1>

      @if (loading()) {
        <div class="flex justify-center py-20"><app-spinner size="lg" /></div>
      } @else if (bookmarks().length === 0) {
        <app-card>
          <div class="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No bookmarks yet.</p>
            <p class="text-sm mt-1">Bookmark topics while studying to find them here.</p>
          </div>
        </app-card>
      } @else {
        <div class="flex flex-col gap-3">
          @for (bm of bookmarks(); track bm.id) {
            <a [routerLink]="['/topics', bm.topics.id]"
               class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-400 dark:hover:border-primary-600 transition-all">
              <div>
                <p class="font-medium text-gray-900 dark:text-gray-100 text-sm">{{ bm.topics.title }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {{ bm.topics.fields?.title }} · {{ bm.topics.difficulty_level }}
                </p>
              </div>
              <button
                (click)="removeBookmark($event, bm.topics.id, bm.id)"
                class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class BookmarksComponent implements OnInit {
  private learningService = inject(LearningService);

  bookmarks = signal<any[]>([]);
  loading = signal(true);

  async ngOnInit() {
    this.bookmarks.set(await this.learningService.getBookmarks());
    this.loading.set(false);
  }

  async removeBookmark(event: Event, topicId: string, bookmarkId: string) {
    event.preventDefault();
    event.stopPropagation();
    await this.learningService.removeBookmark(topicId);
    this.bookmarks.update((list) => list.filter((b) => b.id !== bookmarkId));
  }
}
