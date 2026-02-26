import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TopicsService {
  constructor(private supabaseService: SupabaseService) {}

  async findByField(fieldId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('topics')
      .select('*')
      .eq('field_id', fieldId)
      .order('order_index');

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
