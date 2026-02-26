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

  async addTopic(userId: string, topicId: string) {
    const { data: program } = await this.supabaseService
      .getAdminClient()
      .from('learning_programs')
      .select('id, program_topics(topic_id)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!program) throw new Error('No active program');

    const exists = program.program_topics?.some((pt: any) => pt.topic_id === topicId);
    if (exists) throw new Error('Topic already in program');

    const maxPriority = program.program_topics?.length ?? 0;

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('program_topics')
      .insert({ program_id: program.id, topic_id: topicId, priority_score: maxPriority + 1, status: 'pending' })
      .select('*, topics(*)')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async removeTopic(userId: string, topicId: string) {
    const { data: program } = await this.supabaseService
      .getAdminClient()
      .from('learning_programs')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!program) throw new Error('No active program');

    await this.supabaseService
      .getAdminClient()
      .from('program_topics')
      .delete()
      .eq('program_id', program.id)
      .eq('topic_id', topicId);

    return { removed: true };
  }

  async reorderTopics(userId: string, orderedTopicIds: string[]) {
    const { data: program } = await this.supabaseService
      .getAdminClient()
      .from('learning_programs')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!program) throw new Error('No active program');

    await Promise.all(
      orderedTopicIds.map((topicId, index) =>
        this.supabaseService
          .getAdminClient()
          .from('program_topics')
          .update({ priority_score: orderedTopicIds.length - index })
          .eq('program_id', program.id)
          .eq('topic_id', topicId),
      ),
    );

    return { reordered: true };
  }

  async adaptProgram(userId: string, tier: string) {
    const [program, weakAreas] = await Promise.all([
      this.getMyProgram(userId),
      this.supabaseService
        .getAdminClient()
        .from('quiz_results')
        .select('topic_id, score, topics(title)')
        .eq('user_id', userId)
        .lt('score', 70)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (!program) throw new Error('No active program');

    const completedTopics = program.program_topics
      ?.filter((pt: any) => pt.status === 'completed')
      .map((pt: any) => pt.topics.title) ?? [];

    const allTopics = await this.topicsService.findByField(program.field_id);
    const topicTitles = allTopics.map((t: any) => t.title);
    const weakTopicTitles = weakAreas.data?.map((r: any) => r.topics?.title).filter(Boolean) ?? [];

    const aiResult = await this.aiService.adaptLearningProgram(
      userId,
      tier,
      program.fields?.title ?? '',
      program.current_level,
      program.goal,
      topicTitles,
      completedTopics,
      weakTopicTitles,
    );

    // Replace pending topics with AI recommendations (keep completed ones)
    const admin = this.supabaseService.getAdminClient();

    await admin
      .from('program_topics')
      .delete()
      .eq('program_id', program.id)
      .eq('status', 'pending');

    const newTopics = allTopics.filter((t: any) =>
      aiResult.recommendedTopics.some(
        (title: string) =>
          t.title.toLowerCase().includes(title.toLowerCase()) ||
          title.toLowerCase().includes(t.title.toLowerCase()),
      ),
    );

    if (newTopics.length > 0) {
      await admin.from('program_topics').insert(
        newTopics.map((t: any, i: number) => ({
          program_id: program.id,
          topic_id: t.id,
          priority_score: newTopics.length - i,
          status: 'pending',
        })),
      );
    }

    return { adapted: true, newTopicsCount: newTopics.length, summary: aiResult.summary };
  }
}
