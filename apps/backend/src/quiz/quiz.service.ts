import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface QuizAnswer { questionId: string; selectedAnswer: string; correctAnswer: string; }

@Injectable()
export class QuizService {
  constructor(private supabaseService: SupabaseService) {}

  async submitQuiz(
    userId: string,
    topicId: string,
    answers: QuizAnswer[],
  ) {
    const correct = answers.filter((a) => a.selectedAnswer === a.correctAnswer).length;
    const score = Math.round((correct / answers.length) * 100);

    const weakAreas = answers
      .filter((a) => a.selectedAnswer !== a.correctAnswer)
      .map((a) => a.questionId);

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('quiz_results')
      .insert({
        user_id: userId,
        topic_id: topicId,
        score,
        total_questions: answers.length,
        weak_areas: weakAreas,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      score,
      correct,
      total: answers.length,
      passed: score >= 70,
      weakAreas,
      resultId: data.id,
    };
  }

  async getResults(userId: string, topicId: string) {
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })
      .limit(5);

    return data ?? [];
  }
}
