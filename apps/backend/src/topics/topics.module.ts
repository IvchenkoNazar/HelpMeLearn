import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { SearchModule } from '../search/search.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [SearchModule, ProgressModule],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}
