import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingService } from './onboarding.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CardComponent } from '../../shared/components/card/card.component';

type Step = 'field' | 'level' | 'goal' | 'assessment' | 'generating';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, SpinnerComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-8">
      <div class="w-full max-w-lg">

        <!-- Progress bar -->
        @if (currentStep() !== 'generating') {
          <div class="mb-8">
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span>Step {{ stepNumber() }} of 4</span>
              <button (click)="skip()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Skip setup</button>
            </div>
            <div class="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full">
              <div class="h-1.5 bg-primary-500 rounded-full transition-all duration-300"
                   [style.width.%]="(stepNumber() / 4) * 100"></div>
            </div>
          </div>
        }

        <!-- Step: Select Field -->
        @if (currentStep() === 'field') {
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">What are you preparing for?</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Select your target field</p>

          @if (loadingFields()) {
            <div class="flex justify-center py-12"><app-spinner /></div>
          } @else {
            <div class="grid grid-cols-2 gap-3">
              @for (field of fields(); track field.id) {
                <button
                  (click)="selectField(field)"
                  class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[80px] text-sm font-medium"
                  [class.border-primary-500]="selectedField()?.id === field.id"
                  [class.bg-primary-50]="selectedField()?.id === field.id"
                  [class.dark:bg-primary-900/20]="selectedField()?.id === field.id"
                  [class.text-primary-700]="selectedField()?.id === field.id"
                  [class.dark:text-primary-300]="selectedField()?.id === field.id"
                  [class.border-gray-200]="selectedField()?.id !== field.id"
                  [class.dark:border-gray-700]="selectedField()?.id !== field.id"
                  [class.hover:border-gray-300]="selectedField()?.id !== field.id"
                  [class.text-gray-700]="selectedField()?.id !== field.id"
                  [class.dark:text-gray-300]="selectedField()?.id !== field.id"
                >
                  <span class="text-2xl">{{ field.icon }}</span>
                  <span>{{ field.title }}</span>
                </button>
              }
            </div>
            <app-button variant="primary" [fullWidth]="true" [disabled]="!selectedField()" (click)="nextStep()" class="mt-6 block">
              Continue
            </app-button>
          }
        }

        <!-- Step: Select Level -->
        @if (currentStep() === 'level') {
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">What's your current level?</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Be honest — we'll tailor the program to you</p>

          <div class="flex flex-col gap-3">
            @for (lvl of levels; track lvl.value) {
              <button
                (click)="selectedLevel.set(lvl.value)"
                class="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                [class.border-primary-500]="selectedLevel() === lvl.value"
                [class.bg-primary-50]="selectedLevel() === lvl.value"
                [class.dark:bg-primary-900/20]="selectedLevel() === lvl.value"
                [class.border-gray-200]="selectedLevel() !== lvl.value"
                [class.dark:border-gray-700]="selectedLevel() !== lvl.value"
              >
                <span class="text-2xl">{{ lvl.icon }}</span>
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">{{ lvl.label }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ lvl.description }}</div>
                </div>
              </button>
            }
          </div>

          <div class="flex gap-3 mt-6">
            <app-button variant="outline" [fullWidth]="true" (click)="prevStep()">Back</app-button>
            <app-button variant="primary" [fullWidth]="true" [disabled]="!selectedLevel()" (click)="nextStep()">Continue</app-button>
          </div>
        }

        <!-- Step: Set Goal -->
        @if (currentStep() === 'goal') {
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">What's your goal?</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Tell us what you're aiming for</p>

          <div class="flex flex-col gap-3 mb-4">
            @for (g of goalSuggestions; track g) {
              <button
                (click)="goal.set(g)"
                class="px-4 py-3 rounded-xl border-2 text-left text-sm transition-all"
                [class.border-primary-500]="goal() === g"
                [class.bg-primary-50]="goal() === g"
                [class.dark:bg-primary-900/20]="goal() === g"
                [class.text-primary-700]="goal() === g"
                [class.dark:text-primary-300]="goal() === g"
                [class.border-gray-200]="goal() !== g"
                [class.dark:border-gray-700]="goal() !== g"
                [class.text-gray-700]="goal() !== g"
                [class.dark:text-gray-300]="goal() !== g"
              >{{ g }}</button>
            }
          </div>

          <textarea
            [value]="goal()"
            (input)="goal.set($any($event.target).value)"
            placeholder="Or describe your own goal..."
            rows="3"
            class="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          ></textarea>

          <div class="flex gap-3 mt-4">
            <app-button variant="outline" [fullWidth]="true" (click)="prevStep()">Back</app-button>
            <app-button variant="primary" [fullWidth]="true" [disabled]="!goal()" (click)="startAssessmentOrGenerate()">Continue</app-button>
          </div>
        }

        <!-- Step: Skill Assessment -->
        @if (currentStep() === 'assessment') {
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Quick skill check</h2>
          @if (!loadingAssessment() && assessmentQuestions().length > 0) {
            <p class="text-gray-500 dark:text-gray-400 mb-6">{{ currentQuestionIndex() + 1 }} of {{ assessmentQuestions().length }} questions</p>
          } @else {
            <p class="text-gray-500 dark:text-gray-400 mb-6">&nbsp;</p>
          }

          @if (loadingAssessment()) {
            <div class="flex flex-col items-center gap-4 py-12">
              <app-spinner size="lg" />
              <p class="text-gray-500 dark:text-gray-400 text-sm">Generating assessment...</p>
            </div>
          } @else if (assessmentQuestions().length > 0) {
            @let q = assessmentQuestions()[currentQuestionIndex()];
            <app-card>
              <p class="font-medium text-gray-900 dark:text-gray-100 mb-4">{{ q.question }}</p>
              <div class="flex flex-col gap-2">
                @for (opt of q.options; track opt; let i = $index) {
                  <button
                    (click)="selectAnswer(i)"
                    class="px-4 py-3 rounded-lg border-2 text-left text-sm transition-all"
                    [class.border-primary-500]="selectedAnswers()[currentQuestionIndex()] === i"
                    [class.bg-primary-50]="selectedAnswers()[currentQuestionIndex()] === i"
                    [class.dark:bg-primary-900/20]="selectedAnswers()[currentQuestionIndex()] === i"
                    [class.text-primary-700]="selectedAnswers()[currentQuestionIndex()] === i"
                    [class.dark:text-primary-300]="selectedAnswers()[currentQuestionIndex()] === i"
                    [class.border-gray-200]="selectedAnswers()[currentQuestionIndex()] !== i"
                    [class.dark:border-gray-700]="selectedAnswers()[currentQuestionIndex()] !== i"
                    [class.text-gray-700]="selectedAnswers()[currentQuestionIndex()] !== i"
                    [class.dark:text-gray-300]="selectedAnswers()[currentQuestionIndex()] !== i"
                  >{{ opt }}</button>
                }
              </div>
            </app-card>

            <div class="flex gap-3 mt-4">
              @if (currentQuestionIndex() > 0) {
                <app-button variant="outline" (click)="prevQuestion()">Back</app-button>
              }
              @if (currentQuestionIndex() < assessmentQuestions().length - 1) {
                <app-button variant="primary" [fullWidth]="true"
                  [disabled]="selectedAnswers()[currentQuestionIndex()] === undefined"
                  (click)="nextQuestion()">Next</app-button>
              } @else {
                <app-button variant="primary" [fullWidth]="true"
                  [disabled]="selectedAnswers()[currentQuestionIndex()] === undefined"
                  (click)="finishAssessment()">Generate my program</app-button>
              }
            </div>
          }
        }

        <!-- Step: Generating -->
        @if (currentStep() === 'generating') {
          <div class="text-center py-16">
            <app-spinner size="lg" class="mb-6 block" />
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Building your program...</h2>
            <p class="text-gray-500 dark:text-gray-400 text-sm">AI is personalizing your learning path</p>
          </div>
        }

      </div>
    </div>
  `,
})
export class OnboardingComponent implements OnInit {
  private router = inject(Router);
  private onboardingService = inject(OnboardingService);

  currentStep = signal<Step>('field');
  fields = signal<any[]>([]);
  loadingFields = signal(true);
  loadingAssessment = signal(false);
  selectedField = signal<any>(null);
  selectedLevel = signal('');
  goal = signal('');
  assessmentQuestions = signal<any[]>([]);
  currentQuestionIndex = signal(0);
  selectedAnswers = signal<Record<number, number>>({});

  levels = [
    { value: 'beginner', label: 'Beginner', icon: '🌱', description: 'New to this field' },
    { value: 'junior', label: 'Junior', icon: '🚀', description: '0-2 years of experience' },
    { value: 'middle', label: 'Middle', icon: '⚡', description: '2-5 years of experience' },
    { value: 'senior', label: 'Senior', icon: '🎯', description: '5+ years of experience' },
  ];

  goalSuggestions = [
    'Land my first job in this field',
    'Pass a technical interview at a top company',
    'Get promoted to a senior role',
    'Switch careers into this field',
  ];

  stepNumber = () => ({ field: 1, level: 2, goal: 3, assessment: 4, generating: 4 }[this.currentStep()]);

  async ngOnInit() {
    this.fields.set(await this.onboardingService.getFields());
    this.loadingFields.set(false);
  }

  selectField(field: any) { this.selectedField.set(field); }

  nextStep() {
    const order: Step[] = ['field', 'level', 'goal', 'assessment', 'generating'];
    const idx = order.indexOf(this.currentStep());
    if (idx < order.length - 1) this.currentStep.set(order[idx + 1]);
  }

  prevStep() {
    const order: Step[] = ['field', 'level', 'goal', 'assessment', 'generating'];
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.currentStep.set(order[idx - 1]);
  }

  async startAssessmentOrGenerate() {
    this.currentStep.set('assessment');
    this.loadingAssessment.set(true);
    try {
      const result = await this.onboardingService.getSkillAssessment(
        this.selectedField().id,
        this.selectedLevel(),
      );
      this.assessmentQuestions.set(result.questions);
    } catch {
      // If AI fails, skip assessment and generate program directly
      await this.generateProgram(0);
      return;
    } finally {
      this.loadingAssessment.set(false);
    }
  }

  selectAnswer(optionIndex: number) {
    this.selectedAnswers.update((a) => ({ ...a, [this.currentQuestionIndex()]: optionIndex }));
  }

  nextQuestion() { this.currentQuestionIndex.update((i) => i + 1); }
  prevQuestion() { this.currentQuestionIndex.update((i) => i - 1); }

  async finishAssessment() {
    const questions = this.assessmentQuestions();
    const answers = this.selectedAnswers();
    let correct = 0;
    questions.forEach((q: any, i: number) => {
      const selected = q.options[answers[i]];
      if (selected === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    await this.generateProgram(score);
  }

  async generateProgram(assessmentScore: number) {
    this.currentStep.set('generating');
    try {
      await this.onboardingService.generateProgram({
        fieldId: this.selectedField().id,
        level: this.selectedLevel(),
        goal: this.goal(),
      });
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.error('Program generation failed', err);
      this.router.navigate(['/dashboard']);
    }
  }

  skip() { this.router.navigate(['/dashboard']); }
}
