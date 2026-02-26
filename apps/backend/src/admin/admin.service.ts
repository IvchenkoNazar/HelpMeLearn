import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class AdminService {
  constructor(
    private supabaseService: SupabaseService,
    private aiService: AIService,
  ) {}

  async listUsers() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .select('id, full_name, subscription_tier, role, streak_count, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Enrich with today's AI usage from Redis
    const usersWithUsage = await Promise.all(
      data.map(async (user) => ({
        ...user,
        aiUsageToday: await this.aiService.getUsageToday(user.id),
      })),
    );

    return usersWithUsage;
  }

  async updateUserTier(userId: string, tier: 'free' | 'premium') {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new NotFoundException('User not found');
    return data;
  }

  async getUserStats(userId: string) {
    const [profileResult, usageToday] = await Promise.all([
      this.supabaseService
        .getAdminClient()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      this.aiService.getUsageToday(userId),
    ]);

    if (profileResult.error) throw new NotFoundException('User not found');

    return {
      ...profileResult.data,
      aiUsageToday: usageToday,
    };
  }
}
