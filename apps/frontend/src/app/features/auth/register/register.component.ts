import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonComponent, InputComponent, CardComponent],
  template: `
    <app-card>
      <h2 class="text-xl font-semibold text-center mb-6 text-gray-900 dark:text-gray-100">Create account</h2>

      @if (errorMessage()) {
        <div class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {{ errorMessage() }}
        </div>
      }

      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <app-input
          label="Full name"
          type="text"
          placeholder="John Doe"
          inputId="register-name"
          [(ngModel)]="fullName"
          name="fullName"
        />
        <app-input
          label="Email"
          type="email"
          placeholder="you@example.com"
          inputId="register-email"
          [(ngModel)]="email"
          name="email"
        />
        <app-input
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          inputId="register-password"
          [(ngModel)]="password"
          name="password"
        />
        <app-button type="submit" [fullWidth]="true" [loading]="loading()" variant="primary">
          Create account
        </app-button>
      </form>

      <div class="my-4 flex items-center">
        <div class="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        <span class="px-3 text-sm text-gray-400">or</span>
        <div class="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
      </div>

      <app-button variant="google" [fullWidth]="true" (click)="onGoogleRegister()">
        <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </app-button>

      <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?
        <a routerLink="/auth/login" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">
          Sign in
        </a>
      </p>
    </app-card>
  `,
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.register(this.email, this.password, this.fullName);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }

  async onGoogleRegister() {
    try {
      await this.authService.loginWithGoogle();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Google sign-up failed');
    }
  }
}
