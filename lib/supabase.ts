import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || !key) {
    // Return a dummy during SSG/build — real usage is client-side only
    if (typeof window === 'undefined') {
      return null as any
    }
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.local.example to .env.local and fill in your Supabase project details.'
    )
  }

  client = createBrowserClient(url, key)
  return client
}

export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string
  dm_price: number
  points_balance: number
  total_earned: number
  total_messages_received: number
  total_messages_replied: number
  total_response_time_seconds: number
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  price_paid: number
  status: 'pending' | 'replied' | 'refunded' | 'expired'
  reply_content: string | null
  replied_at: string | null
  refunded_at: string | null
  expires_at: string
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export type Transaction = {
  id: string
  user_id: string
  type: 'send_dm' | 'receive_dm' | 'refund_sender' | 'refund_expire' | 'signup_bonus'
  amount: number
  message_id: string | null
  description: string
  created_at: string
}
