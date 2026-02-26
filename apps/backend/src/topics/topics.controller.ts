import { Controller, Get, Param } from '@nestjs/common';
import { TopicsService } from './topics.service';

@Controller('topics')
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @Get('field/:fieldId')
  findByField(@Param('fieldId') fieldId: string) {
    return this.topicsService.findByField(fieldId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }
}
