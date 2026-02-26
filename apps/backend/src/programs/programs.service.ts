import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AIService } from '../ai/ai.service';
import { TopicsService } from '../topics/topics.service';
import { FieldsService } from '../fields/fields.service';

@Injectable()
export class ProgramsService {
  constructor(
    private supabaseService: SupabaseService,
    private aiService: AIService,
    private topicsService: TopicsService,
    private fieldsService: FieldsService,
  ) {}

  async getMyProgram(userId: string) {
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('learning_programs')
      .select(`*, program_topics(*, topics(*))`)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  async generateProgram(
    userId: string,
    tier: string,
    input: {
      fieldId: string;
      level: string;
      goal: string;
      targetDate?: string;
    },
  ) {
    const [field, allTopics] = await Promise.all([
      this.fieldsService.findOne(input.fieldId),
      this.topicsService.findByField(input.fieldId),
    ]);

    const topicTitles = allTopics
      .filter((t: any) => !t.parent_topic_id) // top-level only for program generation
      .map((t: any) => t.title);

    const aiResult = await this.aiService.generateLearningProgram(
      userId,
      tier,
      field.title,
      input.level,
      input.goal,
      topicTitles,
    );

    // Deactivate existing program
    await this.supabaseService
      .getAdminClient()
      .from('learning_programs')
      .update({ status: 'inactive' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Create new program
    const { data: program, error } = await this.supabaseService
      .getAdminClient()
      .from('learning_programs')
      .insert({
        user_id: userId,
        field_id: input.fieldId,
        goal: input.goal,
        target_date: input.targetDate ?? null,
        current_level: input.level,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Match AI-recommended topic titles to actual topic IDs
    const recommendedTopics = allTopics.filter((t: any) =>
      aiResult.recommendedTopics.some(
        (title: string) =>
          t.title.toLowerCase().includes(title.toLowerCase()) ||
          title.toLowerCase().includes(t.title.toLowerCase()),
      ),
    );

    if (recommendedTopics.length > 0) {
      await this.supabaseService
        .getAdminClient()
        .from('program_topics')
        .insert(
          recommendedTopics.map((t: any, i: number) => ({
            program_id: program.id,
            topic_id: t.id,
            priority_score: recommendedTopics.length - i,
            status: 'pending',
          })),
        );
    }

    return {
      program,
      aiSummary: aiResult.summary,
      estimatedWeeks: aiResult.estimatedWeeks,
      weeklyGoal: aiResult.weeklyGoal,
      topicsCount: recommendedTopics.length,
    };
  }
}
