// apps/frontend/src/app/features/settings/settings.component.ts
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="max-w-lg">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>

      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <app-card class="block mb-6">
          <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile</h2>
          <div class="flex flex-col gap-4">
            <app-input
              label="Full name"
              type="text"
              inputId="settings-name"
              [(ngModel)]="fullName"
              name="fullName"
            />
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily goal (topics per day)
              </label>
              <select
                [(ngModel)]="dailyGoal"
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option [value]="1">1 topic/day</option>
                <option [value]="2">2 topics/day</option>
                <option [value]="3">3 topics/day</option>
                <option [value]="5">5 topics/day</option>
                <option [value]="7">7 topics/day</option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-3">
            <app-button variant="primary" (click)="save()" [loading]="saving()">Save</app-button>
            @if (saved()) {
              <span class="text-sm text-green-600 dark:text-green-400">Saved!</span>
            }
          </div>
        </app-card>

        <app-card>
          <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Subscription</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Current plan:
            <span class="font-medium text-gray-900 dark:text-gray-100 capitalize ml-1">{{ tier() }}</span>
          </p>
        </app-card>
      }
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private http = inject(HttpClient);

  loading = signal(true);
  saving = signal(false);
  saved = signal(false);

  fullName = '';
  dailyGoal = 3;
  tier = signal('free');

  async ngOnInit() {
    try {
      const profile = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/profiles/me`),
      );
      this.fullName = profile.fullName ?? '';
      this.dailyGoal = profile.dailyGoal ?? 3;
      this.tier.set(profile.subscriptionTier ?? 'free');
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    this.saving.set(true);
    this.saved.set(false);
    try {
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/api/profiles/me`, {
          fullName: this.fullName,
          dailyGoal: this.dailyGoal,
        }),
      );
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2000);
    } finally {
      this.saving.set(false);
    }
  }
}
