import { Module } from '@nestjs/common';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { FieldsModule } from '../fields/fields.module';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [FieldsModule, TopicsModule],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}
