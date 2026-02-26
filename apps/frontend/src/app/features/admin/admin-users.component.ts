import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from './admin.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SpinnerComponent, CardComponent],
  template: `
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ users().length }} total</span>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><app-spinner size="lg" /></div>
      } @else {
        <app-card [padding]="false">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-gray-200 dark:border-gray-800">
                <tr class="text-left text-gray-500 dark:text-gray-400">
                  <th class="px-4 py-3 font-medium">User</th>
                  <th class="px-4 py-3 font-medium">Role</th>
                  <th class="px-4 py-3 font-medium">Tier</th>
                  <th class="px-4 py-3 font-medium">AI today</th>
                  <th class="px-4 py-3 font-medium">Streak</th>
                  <th class="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900 dark:text-gray-100">{{ user.full_name || 'No name' }}</div>
                      <div class="text-xs text-gray-400 font-mono">{{ user.id.slice(0, 8) }}...</div>
                    </td>
                    <td class="px-4 py-3">
                      @if (user.role === 'superadmin') {
                        <span class="px-2 py-0.5 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">superadmin</span>
                      } @else {
                        <span class="text-gray-500 dark:text-gray-400">user</span>
                      }
                    </td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                            [class.bg-blue-100]="user.subscription_tier === 'premium'"
                            [class.dark:bg-blue-900/30]="user.subscription_tier === 'premium'"
                            [class.text-blue-700]="user.subscription_tier === 'premium'"
                            [class.dark:text-blue-300]="user.subscription_tier === 'premium'"
                            [class.bg-gray-100]="user.subscription_tier !== 'premium'"
                            [class.dark:bg-gray-800]="user.subscription_tier !== 'premium'"
                            [class.text-gray-600]="user.subscription_tier !== 'premium'"
                            [class.dark:text-gray-400]="user.subscription_tier !== 'premium'">
                        {{ user.subscription_tier }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {{ user.aiUsageToday }}
                    </td>
                    <td class="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {{ user.streak_count }}
                    </td>
                    <td class="px-4 py-3">
                      @if (user.role !== 'superadmin') {
                        <app-button
                          variant="outline"
                          (click)="toggleTier(user)"
                          [loading]="updatingId() === user.id"
                        >
                          {{ user.subscription_tier === 'premium' ? 'Set Free' : 'Set Premium' }}
                        </app-button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<any[]>([]);
  loading = signal(true);
  updatingId = signal<string | null>(null);

  async ngOnInit() {
    this.users.set(await this.adminService.getUsers());
    this.loading.set(false);
  }

  async toggleTier(user: any) {
    this.updatingId.set(user.id);
    const newTier = user.subscription_tier === 'premium' ? 'free' : 'premium';
    try {
      await this.adminService.updateTier(user.id, newTier);
      this.users.update((list) =>
        list.map((u) => (u.id === user.id ? { ...u, subscription_tier: newTier } : u)),
      );
    } finally {
      this.updatingId.set(null);
    }
  }
}
