import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class NotesService {
  constructor(private supabaseService: SupabaseService) {}

  async getNote(userId: string, topicId: string) {
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single();

    return data ?? { content: '', topic_id: topicId };
  }

  async upsertNote(userId: string, topicId: string, content: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('notes')
      .upsert(
        { user_id: userId, topic_id: topicId, content, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,topic_id' },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteNote(userId: string, topicId: string) {
    await this.supabaseService
      .getAdminClient()
      .from('notes')
      .delete()
      .eq('user_id', userId)
      .eq('topic_id', topicId);
  }

  async getAllNotes(userId: string) {
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('notes')
      .select('*, topics(title, field_id)')
      .eq('user_id', userId)
      .not('content', 'eq', '')
      .order('updated_at', { ascending: false });

    return data ?? [];
  }
}
