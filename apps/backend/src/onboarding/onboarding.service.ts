import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AIService } from '../ai/ai.service';
import { FieldsService } from '../fields/fields.service';

@Injectable()
export class OnboardingService {
  constructor(
    private supabaseService: SupabaseService,
    private aiService: AIService,
    private fieldsService: FieldsService,
  ) {}

  async getSkillAssessment(userId: string, tier: string, fieldId: string, level: string) {
    const field = await this.fieldsService.findOne(fieldId);
    return this.aiService.generateSkillAssessment(userId, tier, field.title, level);
  }

  async completeOnboarding(
    userId: string,
    tier: string,
    data: {
      fieldId: string;
      level: string;
      goal: string;
      targetDate?: string;
      assessmentScore?: number;
    },
  ) {
    // Update profile with current level
    await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .update({ preferred_ai_model: null })
      .eq('id', userId);

    return { completed: true, ...data };
  }
}
