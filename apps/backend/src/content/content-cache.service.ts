import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RedisService } from '../redis/redis.service';

const REDIS_TTL = 3600; // 1 hour

@Injectable()
export class ContentCacheService {
  constructor(
    private supabaseService: SupabaseService,
    private redisService: RedisService,
  ) {}

  private redisKey(topicId: string, type: string) {
    return `content:${topicId}:${type}`;
  }

  async get(topicId: string, contentType: string): Promise<any | null> {
    // 1. Try Redis
    const redisVal = await this.redisService.getClient().get(this.redisKey(topicId, contentType));
    if (redisVal) return JSON.parse(redisVal);

    // 2. Try PostgreSQL
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('topic_content')
      .select('content, expires_at')
      .eq('topic_id', topicId)
      .eq('content_type', contentType)
      .single();

    if (!data) return null;
    if (new Date(data.expires_at) < new Date()) {
      // Expired — delete from DB and return null to trigger regeneration
      await this.supabaseService
        .getAdminClient()
        .from('topic_content')
        .delete()
        .eq('topic_id', topicId)
        .eq('content_type', contentType);
      return null;
    }

    // Warm Redis cache
    await this.redisService
      .getClient()
      .set(this.redisKey(topicId, contentType), JSON.stringify(data.content), 'EX', REDIS_TTL);

    return data.content;
  }

  async set(topicId: string, contentType: string, content: any, aiProvider: string) {
    // Store in Redis
    await this.redisService
      .getClient()
      .set(this.redisKey(topicId, contentType), JSON.stringify(content), 'EX', REDIS_TTL);

    // Upsert in PostgreSQL
    await this.supabaseService
      .getAdminClient()
      .from('topic_content')
      .upsert(
        {
          topic_id: topicId,
          content_type: contentType,
          content,
          ai_provider: aiProvider,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'topic_id,content_type' },
      );
  }

  async invalidate(topicId: string, contentType: string) {
    await this.redisService.getClient().del(this.redisKey(topicId, contentType));
    await this.supabaseService
      .getAdminClient()
      .from('topic_content')
      .delete()
      .eq('topic_id', topicId)
      .eq('content_type', contentType);
  }
}
