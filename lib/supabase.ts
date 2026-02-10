import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = {
  from: (table: string) => getSupabase().from(table),
  auth: {
    getUser: () => getSupabase().auth.getUser()
  }
}
