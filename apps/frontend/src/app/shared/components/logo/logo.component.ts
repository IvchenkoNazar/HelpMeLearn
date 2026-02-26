import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="flex items-center gap-2.5">
      <!-- Logo mark: H-shaped neural network in gradient square -->
      <svg [attr.width]="iconSize" [attr.height]="iconSize" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="#3b82f6"/>
            <stop offset="1" stop-color="#1d4ed8"/>
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#lg)"/>
        <!-- H strokes -->
        <line x1="12" y1="13" x2="12" y2="27" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="28" y1="13" x2="28" y2="27" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="12" y1="20" x2="28" y2="20" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <!-- Neural nodes at terminals -->
        <circle cx="12" cy="13" r="2.8" fill="white"/>
        <circle cx="12" cy="27" r="2.8" fill="white"/>
        <circle cx="28" cy="13" r="2.8" fill="white"/>
        <circle cx="28" cy="27" r="2.8" fill="white"/>
        <!-- Center hub -->
        <circle cx="20" cy="20" r="2.2" fill="rgba(255,255,255,0.55)"/>
      </svg>

      @if (showText) {
        <div>
          <div [class]="textClass">HelpMeLearn</div>
          @if (showTagline) {
            <div class="text-xs text-gray-400 dark:text-gray-500 leading-none mt-0.5">AI interview prep</div>
          }
        </div>
      }
    </div>
  `,
})
export class LogoComponent {
  @Input() showText = true;
  @Input() showTagline = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get iconSize(): number {
    return { sm: 28, md: 36, lg: 44 }[this.size];
  }

  get textClass(): string {
    const sizes = {
      sm: 'text-sm font-bold',
      md: 'text-base font-bold',
      lg: 'text-xl font-bold',
    };
    return `${sizes[this.size]} text-gray-900 dark:text-gray-100 leading-none`;
  }
}
