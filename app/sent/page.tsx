'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks'
import { Message } from '@/lib/supabase'
import { formatTimeAgo, getTimeRemaining } from '@/lib/utils'

export default function SentPage() {
  const { user, loading, supabase } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, receiver:profiles!messages_receiver_id_fkey(*)')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setMessages(data)
    }
    fetchMessages()
  }, [user, supabase])

  if (loading) return <div className="animate-pulse space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/[0.03] rounded-2xl" />)}</div>

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Sent Messages</h1>

      {messages.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">✉️</p>
          <p>No sent messages</p>
          <p className="text-xs mt-1">Browse profiles and send your first DM</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs font-medium">
                    {((msg.receiver as any)?.display_name || (msg.receiver as any)?.username || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-white text-sm font-medium">
                      To: {(msg.receiver as any)?.display_name || (msg.receiver as any)?.username}
                    </span>
                    <span className="text-white/30 text-xs ml-2">{formatTimeAgo(msg.created_at)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    msg.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                    msg.status === 'replied' ? 'bg-emerald-400/10 text-emerald-400' :
                    msg.status === 'expired' ? 'bg-red-400/10 text-red-400' :
                    'bg-white/5 text-white/30'
                  }`}>
                    {msg.status === 'pending' ? `⏳ ${getTimeRemaining(msg.expires_at)}` : msg.status}
                  </span>
                  <p className="text-white/30 text-[10px] mt-0.5">-{msg.price_paid} pts</p>
                </div>
              </div>

              <p className="text-white/60 text-sm">{msg.content}</p>

              {msg.reply_content && (
                <div className="ml-4 pl-3 border-l-2 border-emerald-400/20 py-1">
                  <p className="text-xs text-white/30 mb-0.5">Reply:</p>
                  <p className="text-white/70 text-sm">{msg.reply_content}</p>
                  <p className="text-emerald-400 text-[10px] mt-1">+{(msg.price_paid / 2).toFixed(1)} pts refunded</p>
                </div>
              )}

              {msg.status === 'expired' && (
                <p className="text-yellow-400 text-[10px]">+{msg.price_paid} pts refunded (no reply)</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
