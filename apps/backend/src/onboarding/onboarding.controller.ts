import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { OnboardingService } from './onboarding.service';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(
    private onboardingService: OnboardingService,
    private supabaseService: SupabaseService,
  ) {}

  @Post('skill-assessment')
  async getSkillAssessment(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { fieldId: string; level: string },
  ) {
    const { data: profile } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.userId)
      .single();

    return this.onboardingService.getSkillAssessment(
      user.userId,
      profile?.subscription_tier ?? 'free',
      body.fieldId,
      body.level,
    );
  }

  @Post('complete')
  async completeOnboarding(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { fieldId: string; level: string; goal: string; targetDate?: string; assessmentScore?: number },
  ) {
    const { data: profile } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.userId)
      .single();

    return this.onboardingService.completeOnboarding(
      user.userId,
      profile?.subscription_tier ?? 'free',
      body,
    );
  }
}
