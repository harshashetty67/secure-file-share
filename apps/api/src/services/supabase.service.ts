import { config } from '../config/index';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

export async function sendMagicLink(email: string, redirectTo: string) {
  // Delegates to Supabase Auth magic-link (email-based OTP)
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true, // allow new users to sign up via email
    },
  });
}
