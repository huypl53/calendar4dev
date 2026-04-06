import type { Provider } from '@supabase/supabase-js'
import { supabase } from './supabase.js'

export const authClient = {
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { data: session }
  },
}

export const signIn = {
  email: async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? { message: error.message } : null }
  },
  social: async ({ provider }: { provider: string }) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: { redirectTo: window.location.origin },
    })
    return { error: error ? { message: error.message } : null }
  },
}

export const signUp = {
  email: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return { error: error ? { message: error.message } : null }
  },
}

export const signOut = async () => {
  await supabase.auth.signOut()
}
