import { v4 as uuid } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

/** Build a stable object key: u/<userId>/<fileId>-<safeName> */
export function buildObjectKey(userId: string, originalName: string) {
  const fileId = uuid();
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 128);
  const key = `u/${userId}/${fileId}-${safeName}`;
  return { fileId, key };
}

/** Upload a buffer to Supabase Storage (private bucket) */
export async function uploadToStorage(buffer: Buffer, key: string, contentType: string) {
  const { error } = await supabase
    .storage
    .from(config.STORAGE_BUCKET)
    .upload(key, buffer, {
      contentType,
      upsert: false, // avoid accidental overwrite
    });

  if (error) { 
    throw error;
  }
}

/** Optional helper for quick checks / later downloads */
export async function createSignedDownloadUrl(key: string, ttlSeconds = config.SIGNED_URL_TTL_SECONDS) {
  const { data, error } = await supabase
    .storage
    .from(config.STORAGE_BUCKET)
    .createSignedUrl(key, ttlSeconds);

  if (error) { 
    throw error;
  }

  return data.signedUrl;
}

// List all objects for a user, with pagination
export async function listUserObjects(userId: string, { limit, offset }:{limit:number; offset:number}) {
  const prefix = `u/${userId}`;
  const { data, error } = await supabase.storage.from(config.STORAGE_BUCKET)
                          .list(prefix, { limit, offset, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) {
    throw error;
  }

  const items = (data ?? []).filter(Boolean);
  const hasMore = items.length === limit;
  
  return { items, hasMore };
}