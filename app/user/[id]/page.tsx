'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks'
import { Profile } from '@/lib/supabase'
import { getReplyRate, formatAvgResponseTime } from '@/lib/utils'
import Link from 'next/link'

export default function UserProfilePage() {
  const { user, profile: myProfile, loading, supabase, refreshProfile } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!userId) return
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) setProfile(data)
    }
    fetchProfile()
  }, [userId, supabase])

  const handleSendDM = async () => {
    if (!message.trim() || sending || !profile) return
    setError('')
    setSending(true)

    const { error: rpcError } = await supabase.rpc('send_dm', {
      p_receiver_id: profile.id,
      p_content: message.trim(),
    })

    if (rpcError) {
      setError(rpcError.message)
    } else {
      setSent(true)
      setMessage('')
      await refreshProfile()
    }
    setSending(false)
  }

  if (loading || !profile) return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-white/[0.03] rounded-2xl" />
      <div className="h-40 bg-white/[0.03] rounded-2xl" />
    </div>
  )

  const isOwnProfile = user?.id === profile.id
  const canAfford = myProfile ? myProfile.points_balance >= profile.dm_price : false

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="text-white/30 hover:text-white/60 text-sm transition-colors">
        ← Back
      </button>

      {/* Profile Card */}
      <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 font-bold text-2xl">
          {(profile.display_name || profile.username)[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-white/30 text-sm">@{profile.username}</p>
        </div>
        {profile.bio && (
          <p className="text-white/50 text-sm max-w-xs mx-auto">{profile.bio}</p>
        )}
        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-400/10 rounded-full">
          <span className="text-emerald-400 font-bold">{profile.dm_price} pts</span>
          <span className="text-white/30 text-xs">per DM</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-center">
          <p className="text-white font-semibold">
            {getReplyRate(profile.total_messages_received, profile.total_messages_replied)}
          </p>
          <p className="text-white/30 text-[10px]">Reply Rate</p>
        </div>
        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-center">
          <p className="text-white font-semibold">
            {formatAvgResponseTime(profile.total_response_time_seconds, profile.total_messages_replied)}
          </p>
          <p className="text-white/30 text-[10px]">Avg Response</p>
        </div>
        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-center">
          <p className="text-white font-semibold">{profile.total_messages_received}</p>
          <p className="text-white/30 text-[10px]">DMs Received</p>
        </div>
      </div>

      {/* Send DM */}
      {!isOwnProfile && (
        <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-3">
          {sent ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-4xl">✅</p>
              <p className="text-emerald-400 font-medium">Message sent!</p>
              <p className="text-white/30 text-xs">
                You&apos;ll get 50% back if they reply within 24h
              </p>
              <div className="flex gap-2 justify-center mt-3">
                <button
                  onClick={() => setSent(false)}
                  className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg"
                >
                  Send Another
                </button>
                <Link
                  href="/sent"
                  className="px-4 py-2 bg-white/5 text-white/40 text-xs rounded-lg"
                >
                  View Sent
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-white/60">Send a DM</h2>
                <span className="text-xs text-white/30">
                  Cost: <span className="text-emerald-400 font-medium">{profile.dm_price} pts</span>
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                maxLength={2000}
                className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 text-sm resize-none"
                rows={4}
              />
              <div className="flex items-center justify-between text-[10px] text-white/20">
                <span>{message.length}/2000</span>
                <span>Your balance: {myProfile?.points_balance.toFixed(1)} pts</span>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                onClick={handleSendDM}
                disabled={sending || !message.trim() || !canAfford}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all"
              >
                {sending
                  ? 'Sending...'
                  : !canAfford
                  ? `Insufficient points (need ${profile.dm_price})`
                  : `Send DM for ${profile.dm_price} pts`
                }
              </button>
              <p className="text-center text-[10px] text-white/20">
                50% refund if they reply • Full refund if no reply in 24h
              </p>
            </>
          )}
        </div>
      )}

      {isOwnProfile && (
        <Link
          href="/profile"
          className="block text-center py-3 bg-white/5 hover:bg-white/10 text-white/40 text-sm rounded-xl transition-all"
        >
          Edit Your Profile
        </Link>
      )}
    </div>
  )
}
