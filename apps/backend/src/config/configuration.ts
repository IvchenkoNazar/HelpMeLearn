export default () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  supabase: {
    url: process.env['SUPABASE_URL'],
    publishableKey: process.env['SUPABASE_PUBLISHABLE_KEY'],
    secretKey: process.env['SUPABASE_SECRET_KEY'],
  },
  redis: {
    url: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  },
  ai: {
    defaultProvider: process.env['DEFAULT_AI_PROVIDER'] ?? 'bedrock',
    freeDailyLimit: parseInt(process.env['AI_FREE_DAILY_LIMIT'] ?? '20', 10),
    premiumDailyLimit: parseInt(process.env['AI_PREMIUM_DAILY_LIMIT'] ?? '200', 10),
    openai: {
      apiKey: process.env['OPENAI_API_KEY'],
      model: process.env['OPENAI_MODEL'] ?? 'gpt-4o',
    },
    bedrock: {
      accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
      secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
      region: process.env['AWS_REGION'] ?? 'us-east-1',
      modelId:
        process.env['AWS_BEDROCK_MODEL_ID'] ??
        'anthropic.claude-3-5-sonnet-20241022-v2:0',
    },
    gemini: {
      apiKey: process.env['GEMINI_API_KEY'],
      model: process.env['GEMINI_MODEL'] ?? 'gemini-2.0-flash',
    },
  },
});
