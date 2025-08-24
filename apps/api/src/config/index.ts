import { z } from "zod";
import 'dotenv/config';

// Define the shape of your required environment variables
const EnvSchema = z.object({
  PORT: z.coerce.number().default(8080),

  // CORS
  WEB_APP_ORIGIN: z.string().url(),

  // Supabase project details
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  SUPABASE_JWKS_URL: z.string().url(), // used later to verify JWTs

  // Where the magic link should redirect to
  SITE_URL: z.string().url(),           // e.g. http://localhost:5173
  AUTH_REDIRECT_PATH: z.string().default("/auth/callback"),
});

// Parse and validate process.env at startup
export const config = EnvSchema.parse(process.env);

// Helpful constants
export const DEFAULT_EMAIL_REDIRECT = `${config.SITE_URL}${config.AUTH_REDIRECT_PATH}`;
