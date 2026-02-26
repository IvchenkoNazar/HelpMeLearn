import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { ProgramsService } from './programs.service';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('programs')
@UseGuards(JwtAuthGuard)
export class ProgramsController {
  constructor(
    private programsService: ProgramsService,
    private supabaseService: SupabaseService,
  ) {}

  @Get('me')
  getMyProgram(@CurrentUser() user: CurrentUserData) {
    return this.programsService.getMyProgram(user.userId);
  }

  @Post('generate')
  async generateProgram(
    @CurrentUser() user: CurrentUserData,
    @Body() body: { fieldId: string; level: string; goal: string; targetDate?: string },
  ) {
    const { data: profile } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.userId)
      .single();

    return this.programsService.generateProgram(
      user.userId,
      profile?.subscription_tier ?? 'free',
      body,
    );
  }
}
