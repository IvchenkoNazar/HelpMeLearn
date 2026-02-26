export const PROMPTS = {
  skillAssessment: (field: string, level: string) => `
You are an expert interviewer for ${field} roles.
Generate 5 multiple-choice assessment questions for a ${level}-level candidate.
Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "1",
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "why this is correct"
    }
  ]
}`,

  generateProgram: (field: string, level: string, goal: string, topics: string[]) => `
You are a learning program designer for ${field} interview preparation.
The candidate is at ${level} level. Their goal: ${goal}.
Available topics: ${topics.join(', ')}.

Create a personalized learning program. Return ONLY valid JSON:
{
  "recommendedTopics": ["topic1", "topic2"],
  "estimatedWeeks": 4,
  "weeklyGoal": 3,
  "summary": "brief description of the program"
}
Limit to the 8 most important topics ordered by priority.`,
};
