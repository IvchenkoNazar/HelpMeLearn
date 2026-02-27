// apps/frontend/src/app/features/progress/progress.component.ts
import { Component, signal, OnInit, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { ProgressService, ProgressStats } from './progress.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

Chart.register(...registerables);

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, SpinnerComponent],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Progress</h1>

      @if (loading()) {
        <div class="flex justify-center py-20"><app-spinner size="lg" /></div>
      } @else {
        <!-- Stats cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ stats()?.completionPercent ?? 0 }}%</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Complete</div>
            </div>
          </app-card>
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-500">{{ stats()?.streak ?? 0 }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Day streak 🔥</div>
            </div>
          </app-card>
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ stats()?.completedTopics ?? 0 }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Topics done</div>
            </div>
          </app-card>
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-700 dark:text-gray-300">
                {{ stats()?.todayCount ?? 0 }}/{{ stats()?.dailyGoal ?? 3 }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Today's goal</div>
            </div>
          </app-card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Completion chart -->
          <app-card>
            <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Completion</h2>
            <div class="flex items-center justify-center h-48">
              <canvas #completionChart></canvas>
            </div>
          </app-card>

          <!-- Daily goal -->
          <app-card>
            <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Daily goal</h2>
            <div class="flex items-center gap-4 mb-4">
              <div class="text-5xl font-bold text-primary-600 dark:text-primary-400">
                {{ stats()?.todayCount ?? 0 }}
              </div>
              <div class="text-gray-400 dark:text-gray-500">
                <div class="text-sm">of {{ stats()?.dailyGoal ?? 3 }} topics</div>
                <div class="text-xs mt-0.5">studied today</div>
              </div>
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
              <div
                class="bg-primary-500 h-3 rounded-full transition-all duration-500"
                [style.width.%]="Math.min(100, ((stats()?.todayCount ?? 0) / (stats()?.dailyGoal ?? 3)) * 100)"
              ></div>
            </div>
            @if ((stats()?.todayCount ?? 0) >= (stats()?.dailyGoal ?? 3)) {
              <p class="text-sm text-green-600 dark:text-green-400 mt-3">Goal reached today! 🎉</p>
            }
          </app-card>
        </div>

        <!-- Due reviews -->
        @if (dueReviews().length > 0) {
          <div class="mt-6">
            <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Due for spaced repetition
              <span class="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs">
                {{ dueReviews().length }}
              </span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (review of dueReviews(); track review.id) {
                <div class="flex items-center justify-between p-4 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {{ review.topics?.title }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Review #{{ review.review_count + 1 }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 ml-3 shrink-0">
                    <a [routerLink]="['/topics', review.topic_id]"
                       class="text-xs px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40">
                      Study
                    </a>
                    <button
                      (click)="markReviewDone(review)"
                      [disabled]="markingReview() === review.id"
                      class="text-xs px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40"
                    >
                      Done
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Weak areas -->
        @if (weakAreas().length > 0) {
          <div class="mt-6">
            <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Weak areas
              <span class="ml-2 text-xs text-red-500 dark:text-red-400">(scored &lt;70%)</span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (item of weakAreas(); track item.topic_id) {
                <a [routerLink]="['/topics', item.topic_id]"
                   class="flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-gray-900 hover:border-red-400 dark:hover:border-red-700 transition-colors">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ item.topics?.title }}</p>
                    <p class="text-xs text-red-500 dark:text-red-400 mt-0.5">{{ item.score }}% on quiz</p>
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
export class ProgressComponent implements OnInit, AfterViewInit {
  @ViewChild('completionChart') completionChartRef!: ElementRef<HTMLCanvasElement>;

  private progressService = inject(ProgressService);

  loading = signal(true);
  stats = signal<ProgressStats | null>(null);
  weakAreas = signal<any[]>([]);
  dueReviews = signal<any[]>([]);
  markingReview = signal<string | null>(null);

  Math = Math;

  async ngOnInit() {
    const [stats, weak, reviews] = await Promise.allSettled([
      this.progressService.getStats(),
      this.progressService.getWeakAreas(),
      this.progressService.getDueReviews(),
    ]);

    if (stats.status === 'fulfilled') this.stats.set(stats.value);
    if (weak.status === 'fulfilled') this.weakAreas.set(weak.value);
    if (reviews.status === 'fulfilled') this.dueReviews.set(reviews.value);

    this.loading.set(false);
  }

  ngAfterViewInit() {
    // Render chart after view init (stats may not be loaded yet — use setTimeout)
    setTimeout(() => this.renderChart(), 100);
  }

  async markReviewDone(review: any) {
    this.markingReview.set(review.id);
    try {
      await this.progressService.markReviewDone(review.topic_id);
      this.dueReviews.update((reviews) => reviews.filter((r) => r.id !== review.id));
    } finally {
      this.markingReview.set(null);
    }
  }

  private renderChart() {
    if (!this.completionChartRef?.nativeElement) return;
    const stats = this.stats();
    if (!stats) return;

    new Chart(this.completionChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data: [stats.completedTopics, stats.totalTopics - stats.completedTopics],
          backgroundColor: ['#3b82f6', '#e5e7eb'],
          borderWidth: 0,
        }],
      },
      options: {
        cutout: '70%',
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }
}
