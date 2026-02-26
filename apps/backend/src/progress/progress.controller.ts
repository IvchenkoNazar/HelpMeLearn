// apps/backend/src/progress/progress.controller.ts
import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get()
  getStats(@CurrentUser() user: CurrentUserData) {
    return this.progressService.getStats(user.userId);
  }

  @Get('weak-areas')
  getWeakAreas(@CurrentUser() user: CurrentUserData) {
    return this.progressService.getWeakAreas(user.userId);
  }

  @Get('due-reviews')
  getDueReviews(@CurrentUser() user: CurrentUserData) {
    return this.progressService.getDueReviews(user.userId);
  }

  @Post('review/:topicId/done')
  markReviewDone(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.progressService.markReviewDone(user.userId, topicId);
  }
}
