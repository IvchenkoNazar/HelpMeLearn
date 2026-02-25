import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div [class]="cardClasses">
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  @Input() padding = true;

  get cardClasses(): string {
    const base = 'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800';
    return this.padding ? `${base} p-6` : base;
  }
}
