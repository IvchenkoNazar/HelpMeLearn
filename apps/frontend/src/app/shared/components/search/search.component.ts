import { Component, signal, inject, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LearningService } from '../../../features/learning/learning.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" (click)="close.emit()">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div class="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
           (click)="$event.stopPropagation()">

        <!-- Search input -->
        <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <svg class="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            #searchInput
            type="text"
            [(ngModel)]="queryValue"
            (ngModelChange)="onQueryChange($event)"
            placeholder="Search topics..."
            class="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none text-sm"
            autofocus
          />
          @if (loading()) {
            <app-spinner size="sm" />
          }
          <kbd class="hidden sm:inline-flex text-xs text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        <!-- Results -->
        <div class="max-h-80 overflow-y-auto">
          @if (results().length > 0) {
            @for (topic of results(); track topic.id) {
              <button
                (click)="navigate(topic.id)"
                class="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
              >
                <div class="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <svg class="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ topic.title }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {{ topic.fields?.title }} · {{ topic.difficulty_level }}
                  </p>
                </div>
              </button>
            }
          } @else if (queryValue.length > 1 && !loading()) {
            <div class="px-4 py-8 text-center text-sm text-gray-400">No results for "{{ queryValue }}"</div>
          } @else if (queryValue.length === 0) {
            <div class="px-4 py-6 text-center text-sm text-gray-400">Start typing to search topics</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class SearchComponent {
  private learningService = inject(LearningService);
  private router = inject(Router);

  @Output() close = new EventEmitter<void>();

  queryValue = '';
  results = signal<any[]>([]);
  loading = signal(false);
  private debounceTimer: any;

  @HostListener('document:keydown.escape')
  onEsc() { this.close.emit(); }

  onQueryChange(value: string) {
    clearTimeout(this.debounceTimer);
    if (value.length < 2) { this.results.set([]); return; }

    this.loading.set(true);
    this.debounceTimer = setTimeout(async () => {
      try {
        const res = await this.learningService.search(value);
        this.results.set(res);
      } finally {
        this.loading.set(false);
      }
    }, 300);
  }

  navigate(topicId: string) {
    this.router.navigate(['/topics', topicId]);
    this.close.emit();
  }
}
