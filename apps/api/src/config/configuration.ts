import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  API_PORT: z.coerce.number().default(3001),
  WEB_URL: z.string().default('http://localhost:3000'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_MASTER_KEY: z.string().length(64),
  ENCRYPTION_HMAC_PEPPER: z.string().min(8),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('sa-east-1'),
  S3_BUCKET: z.string().default('clinica-documentos'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
});

export type AppConfig = z.infer<typeof envSchema>;

export function validateConfig(config: Record<string, unknown>): AppConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}
