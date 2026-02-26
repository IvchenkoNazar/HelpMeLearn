import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AIService } from '../ai/ai.service';
import { ContentCacheService } from './content-cache.service';
import { TopicsService } from '../topics/topics.service';
import { FieldsService } from '../fields/fields.service';

@Injectable()
export class ContentService {
  constructor(
    private supabaseService: SupabaseService,
    private aiService: AIService,
    private cache: ContentCacheService,
    private topicsService: TopicsService,
    private fieldsService: FieldsService,
  ) {}

  private async getUserTier(userId: string): Promise<string> {
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
    return data?.subscription_tier ?? 'free';
  }

  async getSummary(userId: string, topicId: string, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = await this.cache.get(topicId, 'summary');
      if (cached) return { content: cached, cached: true };
    }

    const [topic, tier] = await Promise.all([
      this.topicsService.findOne(topicId),
      this.getUserTier(userId),
    ]);
    const field = await this.fieldsService.findOne(topic.field_id);

    const content = await this.aiService.generateTopicSummary(
      userId, tier, field.title, topic.title, topic.description ?? '',
    );

    await this.cache.set(topicId, 'summary', { markdown: content }, 'ai');
    return { content: { markdown: content }, cached: false };
  }

  async getCheatsheet(userId: string, topicId: string, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = await this.cache.get(topicId, 'cheatsheet');
      if (cached) return { content: cached, cached: true };
    }

    const [topic, tier] = await Promise.all([
      this.topicsService.findOne(topicId),
      this.getUserTier(userId),
    ]);
    const field = await this.fieldsService.findOne(topic.field_id);

    const content = await this.aiService.generateTopicCheatsheet(
      userId, tier, field.title, topic.title, topic.description ?? '',
    );

    await this.cache.set(topicId, 'cheatsheet', { markdown: content }, 'ai');
    return { content: { markdown: content }, cached: false };
  }

  async getQuiz(userId: string, topicId: string, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = await this.cache.get(topicId, 'quiz');
      if (cached) return { questions: cached.questions, cached: true };
    }

    const [topic, tier] = await Promise.all([
      this.topicsService.findOne(topicId),
      this.getUserTier(userId),
    ]);
    const field = await this.fieldsService.findOne(topic.field_id);

    const result = await this.aiService.generateTopicQuiz(
      userId, tier, field.title, topic.title, topic.difficulty_level ?? 'intermediate',
    );

    await this.cache.set(topicId, 'quiz', result, 'ai');
    return { questions: result.questions, cached: false };
  }
}
