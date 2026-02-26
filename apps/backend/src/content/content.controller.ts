import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { ContentService } from './content.service';

@Controller('topics/:topicId/content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get('summary')
  getSummary(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
    @Query('refresh') refresh?: string,
  ) {
    return this.contentService.getSummary(user.userId, topicId, refresh === 'true');
  }

  @Get('cheatsheet')
  getCheatsheet(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
    @Query('refresh') refresh?: string,
  ) {
    return this.contentService.getCheatsheet(user.userId, topicId, refresh === 'true');
  }

  @Get('quiz')
  getQuiz(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
    @Query('refresh') refresh?: string,
  ) {
    return this.contentService.getQuiz(user.userId, topicId, refresh === 'true');
  }
}
