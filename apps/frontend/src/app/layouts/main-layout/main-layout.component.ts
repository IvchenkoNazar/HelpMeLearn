import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../core/theme.service';
import { AuthService } from '../../core/auth.service';
import { LogoComponent } from '../../shared/components/logo/logo.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <!-- Desktop sidebar -->
    <aside [class]="sidebarClass()">

      <!-- Logo row + collapse toggle -->
      <div class="flex items-center h-16 px-3 border-b border-gray-200 dark:border-gray-800 shrink-0"
           [class.justify-between]="!collapsed()"
           [class.justify-center]="collapsed()">
        @if (!collapsed()) {
          <app-logo size="sm" />
        }
        <button
          (click)="toggleSidebar()"
          title="Toggle sidebar"
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          @if (collapsed()) {
            <!-- Expand icon -->
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
            </svg>
          } @else {
            <!-- Collapse icon -->
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          }
        </button>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        <a routerLink="/dashboard" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
           [class]="navItemClass()" [title]="collapsed() ? 'Dashboard' : ''">
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          @if (!collapsed()) { <span>Dashboard</span> }
        </a>

        <a routerLink="/roadmap" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
           [class]="navItemClass()" [title]="collapsed() ? 'Roadmap' : ''">
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          @if (!collapsed()) { <span>Roadmap</span> }
        </a>

        <a routerLink="/chat" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
           [class]="navItemClass()" [title]="collapsed() ? 'Chat' : ''">
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          @if (!collapsed()) { <span>Chat</span> }
        </a>

        <a routerLink="/progress" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
           [class]="navItemClass()" [title]="collapsed() ? 'Progress' : ''">
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          @if (!collapsed()) { <span>Progress</span> }
        </a>

        <a routerLink="/settings" routerLinkActive="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
           [class]="navItemClass()" [title]="collapsed() ? 'Settings' : ''">
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          @if (!collapsed()) { <span>Settings</span> }
        </a>
      </nav>

      <!-- Bottom actions -->
      <div class="px-2 py-3 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-0.5 shrink-0">
        <button
          (click)="themeService.toggle()"
          [class]="navItemClass()"
          [title]="collapsed() ? (themeService.theme() === 'light' ? 'Dark mode' : 'Light mode') : ''"
        >
          @if (themeService.theme() === 'light') {
            <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          } @else {
            <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          }
          @if (!collapsed()) {
            <span>{{ themeService.theme() === 'light' ? 'Dark mode' : 'Light mode' }}</span>
          }
        </button>

        <button
          (click)="authService.logout()"
          [title]="collapsed() ? 'Sign out' : ''"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          [class.justify-center]="collapsed()"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          @if (!collapsed()) { <span>Sign out</span> }
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main [class]="mainClass()">
      <div class="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <router-outlet />
      </div>
    </main>

    <!-- Mobile bottom navigation -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50">
      <div class="flex items-center justify-around h-16">
        <a routerLink="/dashboard" routerLinkActive="text-primary-600 dark:text-primary-400"
           class="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 text-xs min-w-[48px] py-1">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Home</span>
        </a>
        <a routerLink="/roadmap" routerLinkActive="text-primary-600 dark:text-primary-400"
           class="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 text-xs min-w-[48px] py-1">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          <span>Roadmap</span>
        </a>
        <a routerLink="/chat" routerLinkActive="text-primary-600 dark:text-primary-400"
           class="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 text-xs min-w-[48px] py-1">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span>Chat</span>
        </a>
        <a routerLink="/progress" routerLinkActive="text-primary-600 dark:text-primary-400"
           class="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 text-xs min-w-[48px] py-1">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span>Progress</span>
        </a>
        <a routerLink="/settings" routerLinkActive="text-primary-600 dark:text-primary-400"
           class="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400 text-xs min-w-[48px] py-1">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>Settings</span>
        </a>
      </div>
    </nav>
  `,
})
export class MainLayoutComponent {
  collapsed = signal(localStorage.getItem('sidebar-collapsed') === 'true');

  sidebarClass = computed(() =>
    `hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-all duration-200 overflow-hidden ${this.collapsed() ? 'lg:w-16' : 'lg:w-60'}`,
  );

  mainClass = computed(() =>
    `${this.collapsed() ? 'lg:pl-16' : 'lg:pl-60'} pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-950 transition-all duration-200`,
  );

  navItemClass = computed(() =>
    `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${this.collapsed() ? 'justify-center' : ''}`,
  );

  constructor(
    public themeService: ThemeService,
    public authService: AuthService,
  ) {}

  toggleSidebar() {
    this.collapsed.update((v) => !v);
    localStorage.setItem('sidebar-collapsed', String(this.collapsed()));
  }
}
