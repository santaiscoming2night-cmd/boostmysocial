import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, hasServiceRole } from './env';

/**
 * Service-role client. Server only. Bypasses RLS — every caller must be
 * verified (admin) before this is used for privileged operations.
 */
export function createAdminClient() {
  if (!hasServiceRole()) return null;
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
