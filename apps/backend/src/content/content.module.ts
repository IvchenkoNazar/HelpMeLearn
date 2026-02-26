import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ContentCacheService } from './content-cache.service';
import { FieldsModule } from '../fields/fields.module';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [FieldsModule, TopicsModule],
  controllers: [ContentController],
  providers: [ContentService, ContentCacheService],
  exports: [ContentService, ContentCacheService],
})
export class ContentModule {}
