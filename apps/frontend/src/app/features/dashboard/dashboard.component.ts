import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardComponent],
  template: `
    <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Dashboard</h1>
    <app-card>
      <div class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 text-lg">Welcome to HelpMeLearn</p>
        <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Onboarding and learning program coming in M2.</p>
      </div>
    </app-card>
  `,
})
export class DashboardComponent {}
