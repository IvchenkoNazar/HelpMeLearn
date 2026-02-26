import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { SearchService } from './search.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('fieldId') fieldId?: string,
  ) {
    return this.searchService.search(query, fieldId);
  }

  @Post('topics/:topicId/view')
  trackView(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.searchService.trackRecentlyViewed(user.userId, topicId);
  }

  @Get('topics/recently-viewed')
  getRecentlyViewed(@CurrentUser() user: CurrentUserData) {
    return this.searchService.getRecentlyViewed(user.userId);
  }
}
