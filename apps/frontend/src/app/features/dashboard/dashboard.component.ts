import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent, SpinnerComponent],
  template: `
    <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Dashboard</h1>

    @if (loading()) {
      <div class="flex justify-center py-20"><app-spinner size="lg" /></div>
    } @else if (program()) {
      <!-- Active program -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <app-card>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Field</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ program().field_id }}</p>
        </app-card>
        <app-card>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Level</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{{ program().current_level }}</p>
        </app-card>
        <app-card>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Topics</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ program().program_topics?.length ?? 0 }}</p>
        </app-card>
      </div>

      @if (program().goal) {
        <app-card>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Goal</p>
          <p class="text-gray-800 dark:text-gray-200">{{ program().goal }}</p>
        </app-card>
      }

      <div class="mt-4">
        <app-card>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Your Topics</p>
          @if (program().program_topics?.length) {
            <div class="flex flex-col gap-2">
              @for (pt of program().program_topics; track pt.id) {
                <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span class="text-sm text-gray-800 dark:text-gray-200">{{ pt.topics?.title }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full"
                    [class.bg-green-100]="pt.status === 'completed'"
                    [class.dark:bg-green-900/30]="pt.status === 'completed'"
                    [class.text-green-700]="pt.status === 'completed'"
                    [class.dark:text-green-300]="pt.status === 'completed'"
                    [class.bg-gray-100]="pt.status !== 'completed'"
                    [class.dark:bg-gray-800]="pt.status !== 'completed'"
                    [class.text-gray-500]="pt.status !== 'completed'"
                  >{{ pt.status }}</span>
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-gray-400">No topics assigned yet.</p>
          }
        </app-card>
      </div>

      <div class="mt-4 flex gap-3">
        <a routerLink="/onboarding">
          <app-button variant="outline">Restart onboarding</app-button>
        </a>
      </div>
    } @else {
      <!-- No program yet -->
      <app-card>
        <div class="text-center py-12">
          <div class="text-5xl mb-4">🎯</div>
          <p class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Set up your learning program</p>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">Tell us your goal and we'll build a personalized AI-powered plan for you.</p>
          <a routerLink="/onboarding">
            <app-button variant="primary">Start onboarding</app-button>
          </a>
        </div>
      </app-card>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);

  loading = signal(true);
  program = signal<any>(null);

  async ngOnInit() {
    try {
      const data = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/programs/me`)
      );
      this.program.set(data);
    } catch {
      this.program.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
