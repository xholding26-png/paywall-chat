'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks'
import { Profile } from '@/lib/supabase'
import { getReplyRate, formatAvgResponseTime } from '@/lib/utils'
import Link from 'next/link'

export default function BrowsePage() {
  const { user, loading, supabase } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'price_low' | 'price_high' | 'reply_rate'>('price_low')

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('created_at', { ascending: false })
      if (data) setProfiles(data)
    }
    fetchProfiles()
  }, [user, supabase])

  const filtered = profiles
    .filter((p) =>
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.display_name || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.dm_price - b.dm_price
      if (sortBy === 'price_high') return b.dm_price - a.dm_price
      const rateA = a.total_messages_received > 0 ? a.total_messages_replied / a.total_messages_received : 0
      const rateB = b.total_messages_received > 0 ? b.total_messages_replied / b.total_messages_received : 0
      return rateB - rateA
    })

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm focus:outline-none focus:border-emerald-400/50 cursor-pointer"
        >
          <option value="price_low">Price ↑</option>
          <option value="price_high">Price ↓</option>
          <option value="reply_rate">Reply %</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">👀</p>
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((profile) => (
            <Link
              key={profile.id}
              href={`/user/${profile.id}`}
              className="block p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400 font-medium text-sm shrink-0">
                  {(profile.display_name || profile.username)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">
                      {profile.display_name || profile.username}
                    </span>
                    <span className="text-white/30 text-xs">@{profile.username}</span>
                  </div>
                  {profile.bio && (
                    <p className="text-white/40 text-xs mt-0.5 truncate">{profile.bio}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-emerald-400 font-semibold text-sm">
                    {profile.dm_price} pts
                  </div>
                  <div className="flex gap-2 mt-1 text-[10px] text-white/30">
                    <span>⚡ {getReplyRate(profile.total_messages_received, profile.total_messages_replied)}</span>
                    <span>⏱ {formatAvgResponseTime(profile.total_response_time_seconds, profile.total_messages_replied)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-white/[0.03] rounded-2xl" />
      ))}
    </div>
  )
}
