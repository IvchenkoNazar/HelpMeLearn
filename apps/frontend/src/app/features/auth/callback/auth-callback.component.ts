import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center">
      <app-spinner size="lg" />
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Supabase JS client handles the OAuth callback automatically
    // via onAuthStateChange. Just redirect after a short delay.
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }
}
