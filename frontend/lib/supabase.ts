import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseInstance: SupabaseClient | null = null

function createSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  console.log('Creating Supabase client, URL:', url ? url.substring(0, 30) + '...' : 'EMPTY')
  
  return createClient(url, key)
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseInstance) {
      _supabaseInstance = createSupabaseClient()
    }
    return (_supabaseInstance as any)[prop]
  }
})
