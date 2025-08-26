import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

/** Insert a row in `shares` and return key fields. */
export async function insertShare(row: {
    owner_id: string;
    object_key: string;
    file_name: string;
    mime?: string | null;
    size?: number | null;
    expires_at: string | null;
    max_downloads?: number | null;
}) {
    const { data, error } = await supabase.from('shares')
        .insert(row)                               // safe because we’re server-side
        .select('id, expires_at, max_downloads')   // return only what the controller needs
        .single();                                  // expect exactly one row

    if (error) {
        throw error;
    }

    return data;
}
