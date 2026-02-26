import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { BookmarksService } from './bookmarks.service';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Get()
  getBookmarks(@CurrentUser() user: CurrentUserData) {
    return this.bookmarksService.getBookmarks(user.userId);
  }

  @Post(':topicId')
  addBookmark(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookmarksService.addBookmark(user.userId, topicId);
  }

  @Delete(':topicId')
  removeBookmark(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.bookmarksService.removeBookmark(user.userId, topicId);
  }
}
