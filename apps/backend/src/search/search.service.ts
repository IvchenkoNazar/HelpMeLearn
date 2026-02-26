import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RedisService } from '../redis/redis.service';

const RECENTLY_VIEWED_LIMIT = 10;

@Injectable()
export class SearchService {
  constructor(
    private supabaseService: SupabaseService,
    private redisService: RedisService,
  ) {}

  async search(query: string, fieldId?: string) {
    if (!query.trim()) return [];

    let q = this.supabaseService
      .getAdminClient()
      .from('topics')
      .select('id, title, description, difficulty_level, field_id, fields(title)')
      .textSearch('search_vector', query, { type: 'websearch' })
      .limit(20);

    if (fieldId) q = q.eq('field_id', fieldId);

    const { data } = await q;
    return data ?? [];
  }

  async trackRecentlyViewed(userId: string, topicId: string) {
    const key = `recently_viewed:${userId}`;
    const score = Date.now();
    const redis = this.redisService.getClient();

    await redis.zadd(key, score, topicId);
    // Keep only the 10 most recent
    const count = await redis.zcard(key);
    if (count > RECENTLY_VIEWED_LIMIT) {
      await redis.zremrangebyrank(key, 0, count - RECENTLY_VIEWED_LIMIT - 1);
    }
    await redis.expire(key, 30 * 24 * 60 * 60); // 30-day TTL
  }

  async getRecentlyViewed(userId: string) {
    const key = `recently_viewed:${userId}`;
    const topicIds = await this.redisService
      .getClient()
      .zrevrange(key, 0, RECENTLY_VIEWED_LIMIT - 1);

    if (!topicIds.length) return [];

    const { data } = await this.supabaseService
      .getAdminClient()
      .from('topics')
      .select('id, title, description, difficulty_level, field_id, fields(title)')
      .in('id', topicIds);

    // Preserve Redis order
    return (data ?? []).sort(
      (a, b) => topicIds.indexOf(a.id) - topicIds.indexOf(b.id),
    );
  }
}
