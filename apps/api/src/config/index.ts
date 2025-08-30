import { z } from "zod";
import 'dotenv/config';

// Define the shape of your required environment variables
const EnvSchema = z.object({
  // Server port
  PORT: z.coerce.number().default(8080),

  // CORS
  WEB_APP_ORIGIN: z.string().url(),

  // Supabase project details
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),

  // Where the magic link should redirect to
  SITE_URL: z.string().url(),
  AUTH_REDIRECT_PATH: z.string().default("/auth/callback"),

  // File storage schema
  MAX_UPLOAD_MB: z.coerce.number().default(2),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().default(120),
  STORAGE_BUCKET: z.string().min(1).default('files'),
  SHARE_DEFAULT_TTL_MIN: z.coerce.number().default(2880),
  SIGNED_DOWNLOAD_TTL_SECONDS: z.coerce.number().default(180),
  PUBLIC_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(5 * 60 * 1000),
  PUBLIC_RATE_LIMIT_MAX: z.coerce.number().default(5)

});

export const config = EnvSchema.parse(process.env);
export const DEFAULT_EMAIL_REDIRECT = `${config.SITE_URL}${config.AUTH_REDIRECT_PATH}`;
