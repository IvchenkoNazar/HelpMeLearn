import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProfilesService {
  constructor(private supabaseService: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: data.id,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      subscriptionTier: data.subscription_tier,
      streakCount: data.streak_count,
      lastActivityDate: data.last_activity_date,
      dailyGoal: data.daily_goal,
      createdAt: data.created_at,
    };
  }

  async updateProfile(
    userId: string,
    updates: { fullName?: string; avatarUrl?: string; dailyGoal?: number },
  ) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fullName !== undefined) dbUpdates['full_name'] = updates.fullName;
    if (updates.avatarUrl !== undefined) dbUpdates['avatar_url'] = updates.avatarUrl;
    if (updates.dailyGoal !== undefined) dbUpdates['daily_goal'] = updates.dailyGoal;

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new NotFoundException('Profile not found');
    }

    return {
      id: data.id,
      fullName: data.full_name,
      avatarUrl: data.avatar_url,
      subscriptionTier: data.subscription_tier,
      streakCount: data.streak_count,
      lastActivityDate: data.last_activity_date,
      dailyGoal: data.daily_goal,
      createdAt: data.created_at,
    };
  }
}
