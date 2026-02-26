import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { SupabaseModule } from '../supabase/supabase.module';
import { RedisModule } from '../redis/redis.module';
import { AIModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { FieldsModule } from '../fields/fields.module';
import { TopicsModule } from '../topics/topics.module';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { ProgramsModule } from '../programs/programs.module';
import { AdminModule } from '../admin/admin.module';
import { ContentModule } from '../content/content.module';
import { QuizModule } from '../quiz/quiz.module';
import { NotesModule } from '../notes/notes.module';
import { BookmarksModule } from '../bookmarks/bookmarks.module';
import { SearchModule } from '../search/search.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    SupabaseModule,
    RedisModule,
    AIModule,
    AuthModule,
    ProfilesModule,
    FieldsModule,
    TopicsModule,
    OnboardingModule,
    ProgramsModule,
    AdminModule,
    ContentModule,
    QuizModule,
    NotesModule,
    BookmarksModule,
    SearchModule,
    ProgressModule,
  ],
})
export class AppModule {}
