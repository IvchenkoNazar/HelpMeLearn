import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { NotesService } from './notes.service';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  getAllNotes(@CurrentUser() user: CurrentUserData) {
    return this.notesService.getAllNotes(user.userId);
  }

  @Get(':topicId')
  getNote(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.notesService.getNote(user.userId, topicId);
  }

  @Put(':topicId')
  upsertNote(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
    @Body('content') content: string,
  ) {
    return this.notesService.upsertNote(user.userId, topicId, content);
  }

  @Delete(':topicId')
  deleteNote(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.notesService.deleteNote(user.userId, topicId);
  }
}
