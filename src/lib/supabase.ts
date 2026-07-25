import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or localStorage
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('GDT_SUPABASE_URL') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('GDT_SUPABASE_ANON_KEY') || '' : '';

  return {
    url: localUrl || envUrl,
    key: localKey || envKey,
    isCustom: !!(localUrl && localKey),
    isConfigured: !!((localUrl || envUrl) && (localKey || envKey))
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('GDT_SUPABASE_URL', url.trim());
      localStorage.setItem('GDT_SUPABASE_ANON_KEY', key.trim());
    } else {
      localStorage.removeItem('GDT_SUPABASE_URL');
      localStorage.removeItem('GDT_SUPABASE_ANON_KEY');
    }
  }
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  const currentConfigKey = `${url}:::${key}`;
  if (cachedClient && cachedConfigKey === currentConfigKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key);
    cachedConfigKey = currentConfigKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Utility function to fetch ALL rows exceeding Supabase's default 1000-row limit.
 * Supabase Free Tier REST API caps queries at max 1,000 rows per request.
 * This function recursively pages through results using `.range(from, to)` in 1,000 row chunks.
 *
 * @param tableName Name of the Supabase table to query (e.g. 'inventory', 'transactions')
 * @param selectColumns Select query string (e.g. '*', 'id, name_kh, code')
 * @param chunkSize Batch size per query (default 1000)
 */
export async function fetchAllRowsExceeding1000<T = any>(
  tableName: string,
  selectColumns: string = '*',
  chunkSize: number = 1000
): Promise<{ data: T[]; totalCount: number; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: [], totalCount: 0, error: 'Supabase URL and Anon Key are not configured.' };
  }

  try {
    let allData: T[] = [];
    let page = 0;
    let hasMore = true;
    let totalCount = 0;

    while (hasMore) {
      const from = page * chunkSize;
      const to = from + chunkSize - 1;

      const response = await client
        .from(tableName)
        .select(selectColumns, { count: 'exact' })
        .range(from, to);

      if (response.error) {
        return { data: [], totalCount: 0, error: response.error.message };
      }

      const rows = (response.data || []) as T[];
      allData = [...allData, ...rows];

      if (response.count !== null) {
        totalCount = response.count;
      }

      if (rows.length < chunkSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return { data: allData, totalCount: totalCount || allData.length, error: null };
  } catch (err: any) {
    return { data: [], totalCount: 0, error: err?.message || 'An unexpected error occurred while fetching rows.' };
  }
}
