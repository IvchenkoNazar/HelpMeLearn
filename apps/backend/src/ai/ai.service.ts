import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory } from './ai-provider.factory';
import { PROMPTS } from './interfaces/ai-prompts';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AIService {
  constructor(
    private factory: AIProviderFactory,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async checkAndIncrementUsage(userId: string, tier: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `ai:usage:${userId}:${today}`;
    const redis = this.redisService.getClient();

    const limit =
      tier === 'premium'
        ? this.configService.get<number>('ai.premiumDailyLimit', 200)
        : this.configService.get<number>('ai.freeDailyLimit', 20);

    const count = await redis.incr(key);
    if (count === 1) {
      // Set TTL to 25h to ensure it expires after the day rolls over
      await redis.expire(key, 90000);
    }

    if (count > limit) {
      // Undo the increment so next call still sees the limit
      await redis.decr(key);
      throw new HttpException(
        `Daily AI limit of ${limit} requests reached. Upgrade to Premium for more.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async getUsageToday(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `ai:usage:${userId}:${today}`;
    const val = await this.redisService.getClient().get(key);
    return val ? parseInt(val, 10) : 0;
  }

  async generateSkillAssessment(
    userId: string,
    tier: string,
    field: string,
    level: string,
  ): Promise<{ questions: any[] }> {
    await this.checkAndIncrementUsage(userId, tier);
    const provider = this.factory.getProvider();
    const raw = await provider.generate(PROMPTS.skillAssessment(field, level));
    return JSON.parse(this.extractJson(raw));
  }

  async generateLearningProgram(
    userId: string,
    tier: string,
    field: string,
    level: string,
    goal: string,
    topicTitles: string[],
  ): Promise<{ recommendedTopics: string[]; estimatedWeeks: number; weeklyGoal: number; summary: string }> {
    await this.checkAndIncrementUsage(userId, tier);
    const provider = this.factory.getProvider();
    const raw = await provider.generate(PROMPTS.generateProgram(field, level, goal, topicTitles));
    return JSON.parse(this.extractJson(raw));
  }

  private extractJson(text: string): string {
    // Strip markdown code fences if present
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    return match ? match[1].trim() : text.trim();
  }
}
