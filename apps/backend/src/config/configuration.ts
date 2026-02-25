export default () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  supabase: {
    url: process.env['SUPABASE_URL'],
    publishableKey: process.env['SUPABASE_PUBLISHABLE_KEY'],
    secretKey: process.env['SUPABASE_SECRET_KEY'],
    jwtSecret: process.env['SUPABASE_JWT_SECRET'],
  },
  redis: {
    url: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  },
});
