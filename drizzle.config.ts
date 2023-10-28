import type { Config } from 'drizzle-kit';

export default {
  strict: false,
  driver: 'mysql2',
  schema: ['src/**/*.schema.ts'],
  dbCredentials: {
    connectionString: process.env.DEV_BRANCH_URL,
  },
} satisfies Config;
