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

export async function getShare(id: string) {
  const { data, error } = await supabase.from('shares').select('*').eq('id', id).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function incrementDownloadCount(id: string) {
  const { data: current, error: erroMsg } = await supabase.from('shares').select('download_count').eq('id', id).single();
  if (erroMsg) {
    throw erroMsg;
  }

  const { error: erroMsg2 } = await supabase.from('shares').update({ download_count: (current?.download_count ?? 0) + 1 }).eq('id', id);
  if (erroMsg2) {
    throw erroMsg2;
  }
}

// Revoke the share owned by this user.
export async function revokeShareOwned(shareId: string, ownerId: string) {
  const { data, error } = await supabase.from('shares').update({ revoked: true })
                          .eq('id', shareId)
                          .eq('owner_id', ownerId)
                          .select('id, revoked') 
                          .maybeSingle();        

  if (error) { 
    throw error;
  }

  return data;
}

export async function listShares(ownerId: string, limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('shares')
    .select('id, object_key, file_name, mime, size, expires_at, max_downloads, download_count, revoked, created_at')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) 
    throw error;
  
  return data ?? [];
}

// Bulk revoke all shares for a given objectKey owned by this user.
export async function revokeSharesByObjectKey(ownerId: string, objectKey: string): Promise<number> {
  const { data, error } = await supabase
    .from('shares')
    .update({ revoked: true })
    .eq('owner_id', ownerId)
    .eq('object_key', objectKey)
    .neq('revoked', true)
    .select('id');

  if (error) 
    throw error;

  return data?.length ?? 0;
}