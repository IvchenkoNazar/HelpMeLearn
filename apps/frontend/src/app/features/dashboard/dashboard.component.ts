// apps/frontend/src/app/features/dashboard/dashboard.component.ts
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LearningService } from '../learning/learning.service';
import { ProgressService, ProgressStats } from '../progress/progress.service';
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
        <!-- Stats row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Streak -->
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-500">{{ stats()?.streak ?? 0 }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Day streak 🔥</div>
            </div>
          </app-card>
          <!-- Daily goal -->
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {{ stats()?.todayCount ?? 0 }}/{{ stats()?.dailyGoal ?? 3 }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Today's goal</div>
            </div>
          </app-card>
          <!-- Completion -->
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 dark:text-green-400">
                {{ stats()?.completionPercent ?? 0 }}%
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Program done</div>
            </div>
          </app-card>
          <!-- Bookmarks -->
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-700 dark:text-gray-300">{{ bookmarkCount() }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Bookmarks</div>
            </div>
          </app-card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Program summary -->
          <div class="lg:col-span-2 flex flex-col gap-4">
            @if (program()) {
              <app-card>
                <div class="flex items-center justify-between mb-3">
                  <h2 class="font-semibold text-gray-900 dark:text-gray-100">Learning Program</h2>
                  <div class="flex items-center gap-2">
                    <a routerLink="/program/edit" class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      Edit
                    </a>
                    <a routerLink="/roadmap" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      View roadmap →
                    </a>
                  </div>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ program().goal }}</p>
                <!-- Progress bar -->
                <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2">
                  <div
                    class="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    [style.width.%]="stats()?.completionPercent ?? 0"
                  ></div>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>{{ stats()?.completedTopics ?? 0 }} / {{ stats()?.totalTopics ?? 0 }} topics</span>
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

            <!-- Due reviews -->
            @if (dueReviews().length > 0) {
              <app-card>
                <div class="flex items-center justify-between mb-3">
                  <h2 class="font-semibold text-gray-900 dark:text-gray-100">
                    Due for review
                    <span class="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs">
                      {{ dueReviews().length }}
                    </span>
                  </h2>
                  <a routerLink="/progress" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    See all →
                  </a>
                </div>
                <div class="flex flex-col gap-2">
                  @for (review of dueReviews().slice(0, 3); track review.id) {
                    <a [routerLink]="['/topics', review.topic_id]"
                       class="flex items-center justify-between px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
                      <span class="text-sm text-gray-800 dark:text-gray-200">{{ review.topics?.title }}</span>
                      <span class="text-xs text-orange-500">Review</span>
                    </a>
                  }
                </div>
              </app-card>
            }
          </div>

          <!-- Recently viewed -->
          <div class="flex flex-col gap-4">
            @if (recentTopics().length > 0) {
              <app-card>
                <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recently viewed</h2>
                <div class="flex flex-col gap-2">
                  @for (topic of recentTopics().slice(0, 5); track topic.id) {
                    <a [routerLink]="['/topics', topic.id]"
                       class="flex items-center justify-between py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      <span class="truncate">{{ topic.title }}</span>
                      <svg class="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </a>
                  }
                </div>
              </app-card>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private learningService = inject(LearningService);
  private progressService = inject(ProgressService);

  loading = signal(true);
  program = signal<any>(null);
  stats = signal<ProgressStats | null>(null);
  recentTopics = signal<any[]>([]);
  bookmarkCount = signal(0);
  dueReviews = signal<any[]>([]);

  async ngOnInit() {
    const [program, recent, bookmarks, stats, reviews] = await Promise.allSettled([
      firstValueFrom(this.http.get<any>(`${environment.apiUrl}/api/programs/me`)),
      this.learningService.getRecentlyViewed(),
      this.learningService.getBookmarks(),
      this.progressService.getStats(),
      this.progressService.getDueReviews(),
    ]);

    if (program.status === 'fulfilled') this.program.set(program.value);
    if (recent.status === 'fulfilled') this.recentTopics.set(recent.value);
    if (bookmarks.status === 'fulfilled') this.bookmarkCount.set(bookmarks.value.length);
    if (stats.status === 'fulfilled') this.stats.set(stats.value);
    if (reviews.status === 'fulfilled') this.dueReviews.set(reviews.value);

    this.loading.set(false);
  }
}
