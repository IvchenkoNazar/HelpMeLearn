import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
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

  @Post('topics/add')
  addTopic(
    @CurrentUser() user: CurrentUserData,
    @Body('topicId') topicId: string,
  ) {
    return this.programsService.addTopic(user.userId, topicId);
  }

  @Delete('topics/:topicId')
  removeTopic(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.programsService.removeTopic(user.userId, topicId);
  }

  @Patch('topics/reorder')
  reorderTopics(
    @CurrentUser() user: CurrentUserData,
    @Body('topicIds') topicIds: string[],
  ) {
    return this.programsService.reorderTopics(user.userId, topicIds);
  }

  @Post('adapt')
  async adaptProgram(@CurrentUser() user: CurrentUserData) {
    const { data: profile } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.userId)
      .single();

    return this.programsService.adaptProgram(
      user.userId,
      profile?.subscription_tier ?? 'free',
    );
  }
}
