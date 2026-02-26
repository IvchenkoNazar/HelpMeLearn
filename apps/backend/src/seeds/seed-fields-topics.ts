import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../../.env') });

const supabase = createClient(
  process.env['SUPABASE_URL']!,
  process.env['SUPABASE_SECRET_KEY']!,
);

const fields = [
  { title: 'Software Engineering', description: 'Backend, frontend, full-stack development', icon: '💻' },
  { title: 'Data Science & ML', description: 'Machine learning, data analysis, statistics', icon: '📊' },
  { title: 'Product Management', description: 'Product strategy, roadmaps, stakeholder management', icon: '🗺️' },
  { title: 'Marketing', description: 'Digital marketing, growth, brand strategy', icon: '📢' },
  { title: 'Finance', description: 'Financial analysis, accounting, investment', icon: '💰' },
  { title: 'UX/UI Design', description: 'User experience, interface design, prototyping', icon: '🎨' },
];

const topicsByField: Record<string, Array<{ title: string; description: string; difficulty_level: string; order_index: number; subtopics?: Array<{ title: string; difficulty_level: string; order_index: number }> }>> = {
  'Software Engineering': [
    {
      title: 'JavaScript & TypeScript', description: 'Core language concepts', difficulty_level: 'beginner', order_index: 0,
      subtopics: [
        { title: 'Variables, Types & Functions', difficulty_level: 'beginner', order_index: 0 },
        { title: 'Async Programming (Promises, async/await)', difficulty_level: 'intermediate', order_index: 1 },
        { title: 'TypeScript Types & Generics', difficulty_level: 'intermediate', order_index: 2 },
      ],
    },
    {
      title: 'Data Structures & Algorithms', description: 'Fundamental CS concepts', difficulty_level: 'intermediate', order_index: 1,
      subtopics: [
        { title: 'Arrays, Strings & Hash Maps', difficulty_level: 'beginner', order_index: 0 },
        { title: 'Trees & Graphs', difficulty_level: 'intermediate', order_index: 1 },
        { title: 'Dynamic Programming', difficulty_level: 'advanced', order_index: 2 },
      ],
    },
    {
      title: 'System Design', description: 'Architecture and scalability', difficulty_level: 'advanced', order_index: 2,
      subtopics: [
        { title: 'REST API Design', difficulty_level: 'intermediate', order_index: 0 },
        { title: 'Databases & Caching', difficulty_level: 'intermediate', order_index: 1 },
        { title: 'Distributed Systems', difficulty_level: 'advanced', order_index: 2 },
      ],
    },
    {
      title: 'Frontend Development', description: 'UI frameworks and browser APIs', difficulty_level: 'intermediate', order_index: 3,
      subtopics: [
        { title: 'HTML & CSS Fundamentals', difficulty_level: 'beginner', order_index: 0 },
        { title: 'React / Angular / Vue', difficulty_level: 'intermediate', order_index: 1 },
        { title: 'Performance & Accessibility', difficulty_level: 'advanced', order_index: 2 },
      ],
    },
    {
      title: 'Backend Development', description: 'Server-side programming', difficulty_level: 'intermediate', order_index: 4,
      subtopics: [
        { title: 'Node.js & NestJS', difficulty_level: 'intermediate', order_index: 0 },
        { title: 'Authentication & Security', difficulty_level: 'intermediate', order_index: 1 },
        { title: 'Testing Strategies', difficulty_level: 'intermediate', order_index: 2 },
      ],
    },
  ],
  'Data Science & ML': [
    { title: 'Statistics & Probability', description: 'Mathematical foundations', difficulty_level: 'beginner', order_index: 0, subtopics: [] },
    { title: 'Machine Learning Fundamentals', description: 'Core ML concepts and algorithms', difficulty_level: 'intermediate', order_index: 1, subtopics: [] },
    { title: 'Deep Learning', description: 'Neural networks and frameworks', difficulty_level: 'advanced', order_index: 2, subtopics: [] },
  ],
  'Product Management': [
    { title: 'Product Strategy', description: 'Vision, roadmap, and prioritization', difficulty_level: 'intermediate', order_index: 0, subtopics: [] },
    { title: 'User Research', description: 'Discovery and validation methods', difficulty_level: 'beginner', order_index: 1, subtopics: [] },
    { title: 'Metrics & Analytics', description: 'KPIs, funnels, and data-driven decisions', difficulty_level: 'intermediate', order_index: 2, subtopics: [] },
  ],
  'Marketing': [
    { title: 'Digital Marketing Fundamentals', description: 'Channels, campaigns, and targeting', difficulty_level: 'beginner', order_index: 0, subtopics: [] },
    { title: 'Growth Marketing', description: 'Acquisition, retention, and monetization', difficulty_level: 'intermediate', order_index: 1, subtopics: [] },
    { title: 'Brand Strategy', description: 'Positioning, messaging, and brand building', difficulty_level: 'intermediate', order_index: 2, subtopics: [] },
  ],
  'Finance': [
    { title: 'Financial Statements', description: 'P&L, balance sheet, cash flow', difficulty_level: 'beginner', order_index: 0, subtopics: [] },
    { title: 'Valuation Methods', description: 'DCF, comparables, and multiples', difficulty_level: 'intermediate', order_index: 1, subtopics: [] },
    { title: 'Financial Modeling', description: 'Excel-based models and forecasting', difficulty_level: 'advanced', order_index: 2, subtopics: [] },
  ],
  'UX/UI Design': [
    { title: 'Design Principles', description: 'Usability, accessibility, and visual design', difficulty_level: 'beginner', order_index: 0, subtopics: [] },
    { title: 'User Research Methods', description: 'Interviews, usability tests, and surveys', difficulty_level: 'intermediate', order_index: 1, subtopics: [] },
    { title: 'Prototyping & Figma', description: 'Wireframes, prototypes, and design systems', difficulty_level: 'intermediate', order_index: 2, subtopics: [] },
  ],
};

async function seed() {
  console.log('Seeding fields...');
  const { data: insertedFields, error: fieldsError } = await supabase
    .from('fields')
    .upsert(fields, { onConflict: 'title' })
    .select();

  if (fieldsError) {
    console.error('Fields error:', fieldsError);
    process.exit(1);
  }

  console.log(`Seeded ${insertedFields.length} fields`);

  for (const field of insertedFields) {
    const fieldTopics = topicsByField[field.title];
    if (!fieldTopics) continue;

    for (const topic of fieldTopics) {
      const { subtopics, ...topicData } = topic;
      const { data: insertedTopic, error: topicError } = await supabase
        .from('topics')
        .upsert({ ...topicData, field_id: field.id }, { onConflict: 'field_id,title' })
        .select()
        .single();

      if (topicError) {
        console.error(`Topic error (${topic.title}):`, topicError);
        continue;
      }

      if (subtopics && subtopics.length > 0) {
        const { error: subError } = await supabase
          .from('topics')
          .upsert(
            subtopics.map((s) => ({ ...s, field_id: field.id, parent_topic_id: insertedTopic.id })),
            { onConflict: 'field_id,title' },
          );

        if (subError) console.error(`Subtopics error:`, subError);
      }
    }

    console.log(`Seeded topics for: ${field.title}`);
  }

  console.log('Done!');
}

seed();
