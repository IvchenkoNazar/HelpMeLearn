// apps/frontend/src/app/features/progress/program-editor.component.ts
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ProgressService } from './progress.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-program-editor',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardComponent, SpinnerComponent, ButtonComponent],
  template: `
    <div class="max-w-2xl">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/roadmap" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Program</h1>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-20"><app-spinner size="lg" /></div>
      } @else if (!program()) {
        <app-card>
          <div class="text-center py-12 text-gray-500 dark:text-gray-400">No active program.</div>
        </app-card>
      } @else {
        <!-- AI Adapt -->
        <app-card class="block mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-semibold text-gray-900 dark:text-gray-100">AI Adaptation</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Re-generate pending topics based on your progress and weak areas.
              </p>
            </div>
            <app-button variant="primary" (click)="adaptProgram()" [loading]="adapting()">
              Adapt
            </app-button>
          </div>
          @if (adaptMessage()) {
            <p class="mt-3 text-sm text-green-600 dark:text-green-400">{{ adaptMessage() }}</p>
          }
        </app-card>

        <!-- Current topics -->
        <app-card class="block mb-6">
          <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Program topics
            <span class="ml-2 text-sm font-normal text-gray-400">({{ programTopics().length }})</span>
          </h2>
          <div class="flex flex-col gap-2">
            @for (pt of programTopics(); track pt.id; let i = $index) {
              <div class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <!-- Reorder buttons -->
                <div class="flex flex-col gap-0.5">
                  <button
                    (click)="moveUp(i)"
                    [disabled]="i === 0"
                    class="p-0.5 text-gray-300 dark:text-gray-700 hover:text-gray-500 dark:hover:text-gray-400 disabled:opacity-30"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
                    </svg>
                  </button>
                  <button
                    (click)="moveDown(i)"
                    [disabled]="i === programTopics().length - 1"
                    class="p-0.5 text-gray-300 dark:text-gray-700 hover:text-gray-500 dark:hover:text-gray-400 disabled:opacity-30"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ pt.topics?.title }}
                  </p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                    {{ pt.status }}
                  </p>
                </div>

                @if (pt.status !== 'completed') {
                  <button
                    (click)="removeTopic(pt)"
                    [disabled]="removing() === pt.topics?.id"
                    class="shrink-0 p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    title="Remove"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                }
              </div>
            }
          </div>
          @if (reorderDirty()) {
            <div class="mt-4 flex items-center gap-3">
              <app-button variant="primary" (click)="saveOrder()" [loading]="saving()">Save order</app-button>
              <button (click)="cancelReorder()" class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Cancel
              </button>
            </div>
          }
        </app-card>

        <!-- Add topic -->
        <app-card>
          <h2 class="font-semibold text-gray-900 dark:text-gray-100 mb-4">Add topic</h2>
          <div class="flex gap-2 mb-3">
            <input
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              placeholder="Search topics..."
              class="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          @if (searchResults().length > 0) {
            <div class="flex flex-col gap-1 max-h-48 overflow-y-auto">
              @for (topic of searchResults(); track topic.id) {
                <button
                  (click)="addTopic(topic)"
                  [disabled]="adding() === topic.id || isInProgram(topic.id)"
                  class="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors"
                  [class]="isInProgram(topic.id)
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'"
                >
                  <span>{{ topic.title }}</span>
                  @if (isInProgram(topic.id)) {
                    <span class="text-xs text-gray-400">already added</span>
                  } @else {
                    <span class="text-xs text-primary-600 dark:text-primary-400">+ Add</span>
                  }
                </button>
              }
            </div>
          }
        </app-card>
      }
    </div>
  `,
})
export class ProgramEditorComponent implements OnInit {
  private http = inject(HttpClient);
  private progressService = inject(ProgressService);

  loading = signal(true);
  adapting = signal(false);
  removing = signal<string | null>(null);
  adding = signal<string | null>(null);
  saving = signal(false);
  reorderDirty = signal(false);
  adaptMessage = signal('');

  program = signal<any>(null);
  programTopics = signal<any[]>([]);
  originalOrder = signal<any[]>([]);
  searchQuery = '';
  searchResults = signal<any[]>([]);

  async ngOnInit() {
    try {
      const data = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/programs/me`),
      );
      if (data) {
        this.program.set(data);
        const sorted = [...(data.program_topics ?? [])].sort(
          (a: any, b: any) => (b.priority_score ?? 0) - (a.priority_score ?? 0),
        );
        this.programTopics.set(sorted);
        this.originalOrder.set(sorted);
      }
    } finally {
      this.loading.set(false);
    }
  }

  moveUp(i: number) {
    const topics = [...this.programTopics()];
    [topics[i - 1], topics[i]] = [topics[i], topics[i - 1]];
    this.programTopics.set(topics);
    this.reorderDirty.set(true);
  }

  moveDown(i: number) {
    const topics = [...this.programTopics()];
    [topics[i], topics[i + 1]] = [topics[i + 1], topics[i]];
    this.programTopics.set(topics);
    this.reorderDirty.set(true);
  }

  cancelReorder() {
    this.programTopics.set(this.originalOrder());
    this.reorderDirty.set(false);
  }

  async saveOrder() {
    this.saving.set(true);
    try {
      const ids = this.programTopics().map((pt) => pt.topics?.id);
      await this.progressService.reorderTopics(ids);
      this.originalOrder.set(this.programTopics());
      this.reorderDirty.set(false);
    } finally {
      this.saving.set(false);
    }
  }

  async removeTopic(pt: any) {
    this.removing.set(pt.topics?.id);
    try {
      await this.progressService.removeTopicFromProgram(pt.topics?.id);
      this.programTopics.update((topics) => topics.filter((t) => t.id !== pt.id));
    } finally {
      this.removing.set(null);
    }
  }

  async addTopic(topic: any) {
    this.adding.set(topic.id);
    try {
      const newPt = await this.progressService.addTopicToProgram(topic.id);
      this.programTopics.update((topics) => [...topics, newPt]);
      this.searchResults.set([]);
      this.searchQuery = '';
    } finally {
      this.adding.set(null);
    }
  }

  async adaptProgram() {
    this.adapting.set(true);
    this.adaptMessage.set('');
    try {
      const result = await this.progressService.adaptProgram();
      this.adaptMessage.set(result.summary || 'Program adapted successfully.');
      // Reload program
      const data = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/api/programs/me`),
      );
      if (data) {
        const sorted = [...(data.program_topics ?? [])].sort(
          (a: any, b: any) => (b.priority_score ?? 0) - (a.priority_score ?? 0),
        );
        this.programTopics.set(sorted);
        this.originalOrder.set(sorted);
      }
    } finally {
      this.adapting.set(false);
    }
  }

  isInProgram(topicId: string) {
    return this.programTopics().some((pt) => pt.topics?.id === topicId);
  }

  private searchTimeout: any;
  onSearchInput() {
    clearTimeout(this.searchTimeout);
    if (!this.searchQuery.trim()) {
      this.searchResults.set([]);
      return;
    }
    this.searchTimeout = setTimeout(async () => {
      const results = await firstValueFrom(
        this.http.get<any[]>(
          `${environment.apiUrl}/api/search?q=${encodeURIComponent(this.searchQuery)}`,
        ),
      );
      this.searchResults.set(results ?? []);
    }, 300);
  }
}
