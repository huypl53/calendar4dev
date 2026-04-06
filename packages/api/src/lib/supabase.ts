import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('SUPABASE_URL is required')
if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
if (!anonKey) throw new Error('SUPABASE_ANON_KEY is required')

/** Server-side admin client — bypasses Row Level Security. Never expose to clients. */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/** Server-side anon client — respects Row Level Security. */
export const supabaseAnon = createClient(supabaseUrl, anonKey)
