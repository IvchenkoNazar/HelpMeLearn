import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/theme.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Desktop sidebar -->
    <aside class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <!-- Logo -->
      <div class="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800">
        <span class="text-lg font-bold text-primary-600 dark:text-primary-400">HelpMeLearn</span>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span [innerHTML]="item.icon"></span>
            {{ item.label }}
          </a>
        }
      </nav>

      <!-- Bottom actions -->
      <div class="px-3 py-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <button
          (click)="themeService.toggle()"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {{ themeService.theme() === 'light' ? 'Dark mode' : 'Light mode' }}
        </button>
        <button
          (click)="authService.logout()"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="lg:pl-60 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950">
      <div class="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <router-outlet />
      </div>
    </main>

    <!-- Mobile bottom navigation -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50">
      <div class="flex items-center justify-around h-16">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="text-primary-600 dark:text-primary-400"
            class="flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 text-xs min-w-[48px] py-1"
          >
            <span [innerHTML]="item.icon"></span>
            {{ item.label }}
          </a>
        }
      </div>
    </nav>
  `,
})
export class MainLayoutComponent {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '&#9776;' },
    { path: '/roadmap', label: 'Roadmap', icon: '&#128204;' },
    { path: '/chat', label: 'Chat', icon: '&#128172;' },
    { path: '/progress', label: 'Progress', icon: '&#128200;' },
    { path: '/settings', label: 'Settings', icon: '&#9881;' },
  ];

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
  ) {}
}
