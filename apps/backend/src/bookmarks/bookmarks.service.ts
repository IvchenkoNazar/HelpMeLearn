import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BookmarksService {
  constructor(private supabaseService: SupabaseService) {}

  async getBookmarks(userId: string) {
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('bookmarks')
      .select('*, topics(id, title, description, difficulty_level, field_id, fields(title))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return data ?? [];
  }

  async addBookmark(userId: string, topicId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('bookmarks')
      .upsert({ user_id: userId, topic_id: topicId }, { onConflict: 'user_id,topic_id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async removeBookmark(userId: string, topicId: string) {
    await this.supabaseService
      .getAdminClient()
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('topic_id', topicId);
  }

  async isBookmarked(userId: string, topicId: string): Promise<boolean> {
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single();

    return !!data;
  }
}
