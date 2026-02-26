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

  topicSummary: (fieldTitle: string, topicTitle: string, description: string) => `
You are an expert technical educator preparing someone for a ${fieldTitle} interview.
Write a comprehensive learning summary for the topic: "${topicTitle}".
${description ? `Context: ${description}` : ''}

Cover:
1. Core concepts and definitions
2. Key principles and how they work
3. Common interview questions on this topic
4. Practical examples or use cases
5. Common mistakes to avoid

Format as well-structured Markdown with headers (##), bullet points, and code blocks where relevant.
Be thorough but concise — aim for 500-800 words.`,

  topicCheatsheet: (fieldTitle: string, topicTitle: string, description: string) => `
You are an expert technical educator preparing someone for a ${fieldTitle} interview.
Create a concise cheatsheet for: "${topicTitle}".
${description ? `Context: ${description}` : ''}

Include:
- Key terms and their one-line definitions
- Important concepts in bullet form
- Code examples or syntax where relevant (use code blocks)
- Quick-reference tables if applicable
- "Remember this" section with 3-5 critical points

Format as clean Markdown. Keep it scannable — this is a quick reference card.`,

  topicQuiz: (fieldTitle: string, topicTitle: string, difficulty: string) => `
You are an expert interviewer for ${fieldTitle} roles.
Generate 5 multiple-choice quiz questions about "${topicTitle}" at ${difficulty} difficulty.
Questions should test real understanding, not just memorization.

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "1",
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "option A",
      "explanation": "why this answer is correct and others are wrong"
    }
  ]
}`,

  adaptProgram: (
    field: string,
    level: string,
    goal: string,
    allTopics: string[],
    completedTopics: string[],
    weakTopics: string[],
  ) => `
You are a learning program designer for ${field} interview preparation.
The candidate is at ${level} level. Their goal: ${goal}.

Progress update:
- Completed topics: ${completedTopics.length > 0 ? completedTopics.join(', ') : 'none yet'}
- Weak areas (scored <70% on quiz): ${weakTopics.length > 0 ? weakTopics.join(', ') : 'none'}

Available topics: ${allTopics.join(', ')}.

Recommend the next 8 topics to focus on (excluding already completed ones). Prioritize weak areas.
Return ONLY valid JSON:
{
  "recommendedTopics": ["topic1", "topic2"],
  "summary": "brief explanation of why these topics were chosen"
}`,
};
