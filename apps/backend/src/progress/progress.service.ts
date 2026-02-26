// apps/backend/src/progress/progress.service.ts
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30];

@Injectable()
export class ProgressService {
  constructor(private supabaseService: SupabaseService) {}

  async markTopicComplete(userId: string, topicId: string) {
    const admin = this.supabaseService.getAdminClient();

    // Find the active program_topic for this user+topic
    const { data: program } = await admin
      .from('learning_programs')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!program) throw new Error('No active program');

    const { data: pt, error } = await admin
      .from('program_topics')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('program_id', program.id)
      .eq('topic_id', topicId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update streak
    await this.updateStreak(userId);

    // Schedule spaced repetition
    await this.scheduleReview(userId, topicId);

    return pt;
  }

  async getStats(userId: string) {
    const admin = this.supabaseService.getAdminClient();

    const { data: program } = await admin
      .from('learning_programs')
      .select('*, program_topics(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!program) {
      return { completedTopics: 0, totalTopics: 0, completionPercent: 0, streak: 0, dailyGoal: 3, todayCount: 0 };
    }

    const topics = program.program_topics ?? [];
    const completed = topics.filter((t: any) => t.status === 'completed');
    const today = new Date().toISOString().split('T')[0];
    const todayCompleted = topics.filter(
      (t: any) => t.completed_at && t.completed_at.startsWith(today),
    );

    const { data: profile } = await admin
      .from('profiles')
      .select('streak_count, daily_goal')
      .eq('id', userId)
      .single();

    return {
      completedTopics: completed.length,
      totalTopics: topics.length,
      completionPercent: topics.length > 0 ? Math.round((completed.length / topics.length) * 100) : 0,
      streak: profile?.streak_count ?? 0,
      dailyGoal: profile?.daily_goal ?? 3,
      todayCount: todayCompleted.length,
    };
  }

  async getWeakAreas(userId: string) {
    const admin = this.supabaseService.getAdminClient();

    // Get latest quiz result per topic, filter score < 70
    const { data } = await admin
      .from('quiz_results')
      .select('topic_id, score, topics(id, title, description)')
      .eq('user_id', userId)
      .lt('score', 70)
      .order('created_at', { ascending: false });

    if (!data) return [];

    // Deduplicate by topic_id (keep worst score)
    const seen = new Set<string>();
    return data.filter((r: any) => {
      if (seen.has(r.topic_id)) return false;
      seen.add(r.topic_id);
      return true;
    });
  }

  async getDueReviews(userId: string) {
    const admin = this.supabaseService.getAdminClient();
    const now = new Date().toISOString();

    const { data } = await admin
      .from('topic_reviews')
      .select('*, topics(id, title, description)')
      .eq('user_id', userId)
      .lte('next_review', now)
      .order('next_review', { ascending: true });

    return data ?? [];
  }

  async markReviewDone(userId: string, topicId: string) {
    const admin = this.supabaseService.getAdminClient();

    const { data: existing } = await admin
      .from('topic_reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single();

    if (!existing) throw new Error('Review not found');

    const nextIndex = Math.min(
      existing.review_count + 1,
      SPACED_REPETITION_INTERVALS.length - 1,
    );
    const intervalDays = SPACED_REPETITION_INTERVALS[nextIndex];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);

    await admin
      .from('topic_reviews')
      .update({
        next_review: nextReview.toISOString(),
        interval_days: intervalDays,
        review_count: existing.review_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('topic_id', topicId);

    return { nextReviewInDays: intervalDays };
  }

  private async updateStreak(userId: string) {
    const admin = this.supabaseService.getAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('streak_count, last_activity_date')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const last = profile.last_activity_date?.split('T')[0];

    let newStreak = profile.streak_count ?? 0;

    if (last === today) {
      // Same day — no change
      return;
    } else if (last) {
      const diff = Math.floor(
        (new Date(today).getTime() - new Date(last).getTime()) / 86400000,
      );
      newStreak = diff === 1 ? newStreak + 1 : 1;
    } else {
      newStreak = 1;
    }

    await admin
      .from('profiles')
      .update({ streak_count: newStreak, last_activity_date: today })
      .eq('id', userId);
  }

  private async scheduleReview(userId: string, topicId: string) {
    const admin = this.supabaseService.getAdminClient();
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + SPACED_REPETITION_INTERVALS[0]);

    await admin.from('topic_reviews').upsert(
      {
        user_id: userId,
        topic_id: topicId,
        next_review: nextReview.toISOString(),
        interval_days: SPACED_REPETITION_INTERVALS[0],
        review_count: 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_id', ignoreDuplicates: true },
    );
  }
}
