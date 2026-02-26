import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { LearningService } from '../learning.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';

type Tab = 'summary' | 'cheatsheet' | 'quiz' | 'notes';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MarkdownModule, SpinnerComponent, ButtonComponent, CardComponent],
  template: `
    <div class="max-w-3xl mx-auto">
      <!-- Back + topic header -->
      <a routerLink="/roadmap" class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        Roadmap
      </a>

      @if (topic()) {
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ topic().title }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ topic().description }}</p>
          </div>
          <button (click)="toggleBookmark()"
                  class="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  [title]="bookmarked() ? 'Remove bookmark' : 'Bookmark'">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                 [class.fill-primary-500]="bookmarked()"
                 [class.text-primary-500]="bookmarked()"
                 [class.text-gray-400]="!bookmarked()">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto">
          @for (tab of tabs; track tab.id) {
            <button
              (click)="onTabChange(tab.id)"
              [class]="activeTab() === tab.id
                ? 'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors border-primary-500 text-primary-600 dark:text-primary-400'
                : 'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- Tab content -->
        @if (activeTab() === 'summary') {
          <div>
            @if (loadingContent()) {
              <div class="flex flex-col items-center gap-3 py-16">
                <app-spinner size="lg" />
                <p class="text-sm text-gray-400 dark:text-gray-500">Generating summary...</p>
              </div>
            } @else if (summaryContent()) {
              <div class="flex justify-end mb-3">
                <app-button variant="outline" (click)="loadSummary(true)">Regenerate</app-button>
              </div>
              <app-card>
                <div class="prose prose-sm dark:prose-invert max-w-none">
                  <markdown [data]="summaryContent()" />
                </div>
              </app-card>
            }
          </div>
        }

        @if (activeTab() === 'cheatsheet') {
          <div>
            @if (loadingContent()) {
              <div class="flex flex-col items-center gap-3 py-16">
                <app-spinner size="lg" />
                <p class="text-sm text-gray-400 dark:text-gray-500">Generating cheatsheet...</p>
              </div>
            } @else if (cheatsheetContent()) {
              <div class="flex justify-end gap-2 mb-3">
                <app-button variant="outline" (click)="printCheatsheet()">Print / PDF</app-button>
                <app-button variant="outline" (click)="loadCheatsheet(true)">Regenerate</app-button>
              </div>
              <app-card>
                <div class="prose prose-sm dark:prose-invert max-w-none overflow-x-auto" id="cheatsheet-content">
                  <markdown [data]="cheatsheetContent()" />
                </div>
              </app-card>
            }
          </div>
        }

        @if (activeTab() === 'quiz') {
          <div>
            @if (loadingContent()) {
              <div class="flex flex-col items-center gap-3 py-16">
                <app-spinner size="lg" />
                <p class="text-sm text-gray-400 dark:text-gray-500">Generating quiz...</p>
              </div>
            } @else if (quizResult()) {
              <!-- Quiz result -->
              <app-card>
                <div class="text-center py-4">
                  <div [class]="'text-4xl font-bold mb-1 ' + (quizResult().passed ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400')">
                    {{ quizResult().score }}%
                  </div>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ quizResult().correct }}/{{ quizResult().total }} correct
                    — {{ quizResult().passed ? 'Passed! 🎉' : 'Keep studying 📚' }}
                  </p>
                  <app-button variant="outline" (click)="resetQuiz()" class="mt-4 inline-block">Try again</app-button>
                </div>
              </app-card>
            } @else if (quizQuestions().length > 0) {
              <!-- Active quiz -->
              <div class="flex flex-col gap-4">
                @for (q of quizQuestions(); track q.id; let i = $index) {
                  <app-card>
                    <p class="font-medium text-gray-900 dark:text-gray-100 mb-3 text-sm">
                      {{ i + 1 }}. {{ q.question }}
                    </p>
                    <div class="flex flex-col gap-2">
                      @for (opt of q.options; track opt) {
                        <button
                          (click)="selectQuizAnswer(q.id, opt)"
                          [class]="'text-left px-3 py-2.5 rounded-lg border-2 text-sm transition-all ' + (quizAnswers()[q.id] === opt
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-gray-100'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200')"
                        >{{ opt }}</button>
                      }
                    </div>
                  </app-card>
                }
                <app-button variant="primary" [fullWidth]="true"
                  [disabled]="Object.keys(quizAnswers()).length < quizQuestions().length"
                  (click)="submitQuiz()">
                  Submit answers
                </app-button>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'notes') {
          <div>
            <textarea
              [value]="noteContent()"
              (input)="noteContent.set($any($event.target).value)"
              placeholder="Write your notes for this topic... (Markdown supported)"
              rows="12"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            ></textarea>
            <div class="flex justify-end gap-2 mt-3">
              <app-button variant="primary" [loading]="savingNote()" (click)="saveNote()">
                Save notes
              </app-button>
            </div>
            @if (noteSaved()) {
              <p class="text-sm text-green-500 text-right mt-1">Saved ✓</p>
            }
          </div>
        }
      } @else if (loading()) {
        <div class="flex justify-center py-20"><app-spinner size="lg" /></div>
      }
    </div>
  `,
})
export class TopicDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private learningService = inject(LearningService);

  protected Object = Object;

  topic = signal<any>(null);
  loading = signal(true);
  loadingContent = signal(false);
  activeTab = signal<Tab>('summary');
  bookmarked = signal(false);

  summaryContent = signal('');
  cheatsheetContent = signal('');
  quizQuestions = signal<any[]>([]);
  quizAnswers = signal<Record<string, string>>({});
  quizResult = signal<any>(null);

  noteContent = signal('');
  savingNote = signal(false);
  noteSaved = signal(false);

  tabs = [
    { id: 'summary' as Tab, label: 'Summary' },
    { id: 'cheatsheet' as Tab, label: 'Cheatsheet' },
    { id: 'quiz' as Tab, label: 'Quiz' },
    { id: 'notes' as Tab, label: 'Notes' },
  ];

  async ngOnInit() {
    const topicId = this.route.snapshot.paramMap.get('id')!;

    const [topic, note] = await Promise.all([
      this.learningService.getTopic(topicId),
      this.learningService.getNote(topicId),
    ]);

    this.topic.set(topic);
    this.noteContent.set(note?.content ?? '');
    this.loading.set(false);

    // Track view
    this.learningService.trackView(topicId).catch(() => {});

    // Load initial tab
    await this.loadSummary();
  }

  async loadSummary(refresh = false) {
    this.loadingContent.set(true);
    try {
      const res = await this.learningService.getSummary(this.topic().id, refresh);
      this.summaryContent.set(res.content.markdown);
    } finally {
      this.loadingContent.set(false);
    }
  }

  async loadCheatsheet(refresh = false) {
    if (this.cheatsheetContent() && !refresh) return;
    this.loadingContent.set(true);
    try {
      const res = await this.learningService.getCheatsheet(this.topic().id, refresh);
      this.cheatsheetContent.set(res.content.markdown);
    } finally {
      this.loadingContent.set(false);
    }
  }

  async loadQuiz(refresh = false) {
    if (this.quizQuestions().length && !refresh) return;
    this.loadingContent.set(true);
    try {
      const res = await this.learningService.getQuiz(this.topic().id, refresh);
      this.quizQuestions.set(res.questions);
      this.quizAnswers.set({});
      this.quizResult.set(null);
    } finally {
      this.loadingContent.set(false);
    }
  }

  async onTabChange(tab: Tab) {
    this.activeTab.set(tab);
    if (tab === 'cheatsheet') await this.loadCheatsheet();
    if (tab === 'quiz') await this.loadQuiz();
  }

  selectQuizAnswer(questionId: string, option: string) {
    this.quizAnswers.update((a) => ({ ...a, [questionId]: option }));
  }

  async submitQuiz() {
    const answers = this.quizQuestions().map((q) => ({
      questionId: q.id,
      selectedAnswer: this.quizAnswers()[q.id],
      correctAnswer: q.correctAnswer,
    }));
    const result = await this.learningService.submitQuiz(this.topic().id, answers);
    this.quizResult.set(result);
  }

  resetQuiz() {
    this.quizAnswers.set({});
    this.quizResult.set(null);
  }

  async saveNote() {
    this.savingNote.set(true);
    try {
      await this.learningService.saveNote(this.topic().id, this.noteContent());
      this.noteSaved.set(true);
      setTimeout(() => this.noteSaved.set(false), 2000);
    } finally {
      this.savingNote.set(false);
    }
  }

  async toggleBookmark() {
    if (this.bookmarked()) {
      await this.learningService.removeBookmark(this.topic().id);
    } else {
      await this.learningService.addBookmark(this.topic().id);
    }
    this.bookmarked.update((b) => !b);
  }

  printCheatsheet() {
    window.print();
  }
}
