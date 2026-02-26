// apps/frontend/src/app/features/roadmap/roadmap.component.ts
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ProgressService } from '../progress/progress.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, CardComponent],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Roadmap</h1>
        @if (program()) {
          <a routerLink="/program/edit"
             class="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            Edit program
          </a>
        }
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><app-spinner size="lg" /></div>
      } @else if (!program()) {
        <app-card>
          <div class="text-center py-12">
            <p class="text-gray-500 dark:text-gray-400 mb-4">No learning program yet.</p>
            <a routerLink="/onboarding"
               class="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
              Start onboarding
            </a>
          </div>
        </app-card>
      } @else {
        <!-- Program header -->
        <app-card class="block mb-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ program().fields?.title }}</p>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{{ program().goal }}</h2>
              <!-- Overall progress bar -->
              <div class="mt-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                <div
                  class="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                  [style.width.%]="completionPercent()"
                ></div>
              </div>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {{ completedCount() }} / {{ programTopics().length }} topics completed
              </p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 capitalize shrink-0">
              {{ program().current_level }}
            </span>
          </div>
        </app-card>

        <!-- Topics grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (pt of programTopics(); track pt.id) {
            <div class="relative block p-4 rounded-xl border bg-white dark:bg-gray-900 transition-all"
                 [class]="pt.status === 'completed'
                   ? 'border-green-300 dark:border-green-800'
                   : 'border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-sm'">
              <div class="flex items-start justify-between gap-2 mb-2">
                <a [routerLink]="['/topics', pt.topics.id]" class="flex-1">
                  <h3 class="font-medium text-gray-900 dark:text-gray-100 text-sm leading-snug hover:text-primary-600 dark:hover:text-primary-400">
                    {{ pt.topics.title }}
                  </h3>
                </a>
                <!-- Complete toggle -->
                <button
                  (click)="toggleComplete(pt)"
                  [title]="pt.status === 'completed' ? 'Completed' : 'Mark complete'"
                  [disabled]="completing() === pt.topics.id"
                  class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                  [class]="pt.status === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-500'"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                {{ pt.topics.description }}
              </p>
              <div class="mt-3 flex items-center gap-2">
                <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 capitalize">
                  {{ pt.topics.difficulty_level }}
                </span>
                @if (pt.status === 'completed' && pt.completed_at) {
                  <span class="text-xs text-green-500 dark:text-green-400">
                    ✓ Done
                  </span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class RoadmapComponent implements OnInit {
  private http = inject(HttpClient);
  private progressService = inject(ProgressService);

  loading = signal(true);
  completing = signal<string | null>(null);
  program = signal<any>(null);
  programTopics = signal<any[]>([]);

  completedCount = () => this.programTopics().filter((pt) => pt.status === 'completed').length;
  completionPercent = () => {
    const total = this.programTopics().length;
    return total > 0 ? Math.round((this.completedCount() / total) * 100) : 0;
  };

  async ngOnInit() {
    try {
      const data = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/programs/me`),
      );
      if (data) {
        this.program.set(data);
        this.programTopics.set(
          [...(data.program_topics ?? [])].sort(
            (a: any, b: any) => (b.priority_score ?? 0) - (a.priority_score ?? 0),
          ),
        );
      }
    } catch {
      // No program yet
    } finally {
      this.loading.set(false);
    }
  }

  async toggleComplete(pt: any) {
    if (pt.status === 'completed') return; // no undo for now
    this.completing.set(pt.topics.id);
    try {
      await this.progressService.markTopicComplete(pt.topics.id);
      this.programTopics.update((topics) =>
        topics.map((t) =>
          t.id === pt.id
            ? { ...t, status: 'completed', completed_at: new Date().toISOString() }
            : t,
        ),
      );
    } finally {
      this.completing.set(null);
    }
  }
}
