import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LearningService } from '../learning/learning.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>

      @if (loading()) {
        <div class="flex justify-center py-20"><app-spinner size="lg" /></div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Program summary card -->
          <div class="lg:col-span-2">
            @if (program()) {
              <app-card>
                <div class="flex items-center justify-between mb-4">
                  <h2 class="font-semibold text-gray-900 dark:text-gray-100">Learning Program</h2>
                  <a routerLink="/roadmap" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    View roadmap →
                  </a>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ program().goal }}</p>
                <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{{ program().program_topics?.length ?? 0 }} topics</span>
                  <span class="capitalize">{{ program().current_level }}</span>
                </div>
              </app-card>
            } @else {
              <app-card>
                <div class="text-center py-8">
                  <p class="text-gray-500 dark:text-gray-400 mb-3">No program yet.</p>
                  <a routerLink="/onboarding"
                     class="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
                    Set up your program
                  </a>
                </div>
              </app-card>
            }
          </div>

          <!-- Quick stats -->
          <app-card>
            <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick stats</h2>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Topics bookmarked</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ bookmarkCount() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-gray-400">Recently viewed</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ recentTopics().length }}</span>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Recently viewed -->
        @if (recentTopics().length > 0) {
          <div class="mt-6">
            <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recently viewed</h2>
            <div class="flex flex-col gap-2">
              @for (topic of recentTopics(); track topic.id) {
                <a [routerLink]="['/topics', topic.id]"
                   class="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-400 dark:hover:border-primary-600 transition-all">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ topic.title }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ topic.fields?.title }}</p>
                  </div>
                  <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private learningService = inject(LearningService);

  loading = signal(true);
  program = signal<any>(null);
  recentTopics = signal<any[]>([]);
  bookmarkCount = signal(0);

  async ngOnInit() {
    const [program, recent, bookmarks] = await Promise.allSettled([
      firstValueFrom(this.http.get<any>(`${environment.apiUrl}/api/programs/me`)),
      this.learningService.getRecentlyViewed(),
      this.learningService.getBookmarks(),
    ]);

    if (program.status === 'fulfilled') this.program.set(program.value);
    if (recent.status === 'fulfilled') this.recentTopics.set(recent.value);
    if (bookmarks.status === 'fulfilled') this.bookmarkCount.set(bookmarks.value.length);

    this.loading.set(false);
  }
}
