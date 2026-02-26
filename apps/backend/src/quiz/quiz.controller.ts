import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { QuizService } from './quiz.service';

@Controller('topics/:topicId/quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post('submit')
  submit(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
    @Body('answers') answers: Array<{ questionId: string; selectedAnswer: string; correctAnswer: string }>,
  ) {
    return this.quizService.submitQuiz(user.userId, topicId, answers);
  }

  @Get('results')
  getResults(
    @Param('topicId') topicId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.quizService.getResults(user.userId, topicId);
  }
}
