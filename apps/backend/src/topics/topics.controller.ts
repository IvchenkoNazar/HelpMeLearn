import { Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { TopicsService } from './topics.service';
import { SearchService } from '../search/search.service';
import { ProgressService } from '../progress/progress.service';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(
    private topicsService: TopicsService,
    private searchService: SearchService,
    private progressService: ProgressService,
  ) {}

  @Get('field/:fieldId')
  findByField(@Param('fieldId') fieldId: string) {
    return this.topicsService.findByField(fieldId);
  }

  @Get('recently-viewed')
  getRecentlyViewed(@CurrentUser() user: CurrentUserData) {
    return this.searchService.getRecentlyViewed(user.userId);
  }

  @Post(':id/view')
  trackView(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.searchService.trackRecentlyViewed(user.userId, id);
  }

  @Patch(':id/complete')
  markComplete(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.progressService.markTopicComplete(user.userId, id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }
}
