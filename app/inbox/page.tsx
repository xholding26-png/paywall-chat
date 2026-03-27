'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks'
import { Message } from '@/lib/supabase'
import { formatTimeAgo, getTimeRemaining } from '@/lib/utils'

export default function InboxPage() {
  const { user, profile, loading, supabase, refreshProfile } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(*)')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setMessages(data)
    }
    fetchMessages()
  }, [user, supabase])

  const handleReply = async (messageId: string) => {
    if (!replyText.trim() || sending) return
    setSending(true)
    const { error } = await supabase.rpc('reply_to_dm', {
      p_message_id: messageId,
      p_reply_content: replyText.trim(),
    })
    if (!error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, status: 'replied' as const, reply_content: replyText.trim(), replied_at: new Date().toISOString() }
            : m
        )
      )
      setReplyingTo(null)
      setReplyText('')
      await refreshProfile()
    }
    setSending(false)
  }

  if (loading) return <div className="animate-pulse space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white/[0.03] rounded-2xl" />)}</div>

  const pending = messages.filter((m) => m.status === 'pending')
  const answered = messages.filter((m) => m.status !== 'pending')

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-white">Inbox</h1>

      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
            Pending ({pending.length})
          </h2>
          {pending.map((msg) => (
            <div key={msg.id} className="p-4 bg-emerald-400/[0.04] border border-emerald-400/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 text-xs font-medium">
                    {((msg.sender as any)?.display_name || (msg.sender as any)?.username || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-white text-sm font-medium">
                      {(msg.sender as any)?.display_name || (msg.sender as any)?.username}
                    </span>
                    <span className="text-white/30 text-xs ml-2">{formatTimeAgo(msg.created_at)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-xs font-medium">{msg.price_paid} pts</span>
                  <p className="text-[10px] text-white/30">{getTimeRemaining(msg.expires_at)}</p>
                </div>
              </div>

              <p className="text-white/80 text-sm leading-relaxed">{msg.content}</p>

              {replyingTo === msg.id ? (
                <div className="space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 text-sm resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReply(msg.id)}
                      disabled={sending || !replyText.trim()}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-all"
                    >
                      {sending ? '...' : `Reply (+${(msg.price_paid / 2).toFixed(1)} pts)`}
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyText('') }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 text-xs rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingTo(msg.id)}
                  className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-all"
                >
                  Reply & Earn {(msg.price_paid / 2).toFixed(1)} pts
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {answered.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-white/30 uppercase tracking-wider">
            History
          </h2>
          {answered.map((msg) => (
            <div key={msg.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/30 text-xs">
                    {((msg.sender as any)?.display_name || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-white/60 text-sm">
                    {(msg.sender as any)?.display_name || (msg.sender as any)?.username}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  msg.status === 'replied' ? 'bg-emerald-400/10 text-emerald-400' :
                  msg.status === 'expired' ? 'bg-yellow-400/10 text-yellow-400' :
                  'bg-white/5 text-white/30'
                }`}>
                  {msg.status}
                </span>
              </div>
              <p className="text-white/40 text-sm">{msg.content}</p>
              {msg.reply_content && (
                <div className="ml-4 pl-3 border-l-2 border-emerald-400/20">
                  <p className="text-white/50 text-sm">{msg.reply_content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {messages.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">📭</p>
          <p>No messages yet</p>
          <p className="text-xs mt-1">Share your profile to start earning</p>
        </div>
      )}
    </div>
  )
}
