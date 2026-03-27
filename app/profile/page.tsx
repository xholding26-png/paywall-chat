'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks'
import { getReplyRate, formatAvgResponseTime } from '@/lib/utils'
import { Transaction } from '@/lib/supabase'

export default function ProfilePage() {
  const { user, profile, loading, supabase, refreshProfile } = useAuth()
  const router = useRouter()
  const [dmPrice, setDmPrice] = useState(5)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (profile) {
      setDmPrice(profile.dm_price)
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
    }
  }, [profile])

  useEffect(() => {
    if (!user) return
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setTransactions(data)
    }
    fetchTransactions()
  }, [user, supabase])

  const handleSave = async () => {
    if (!user || saving) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({
        dm_price: dmPrice,
        display_name: displayName.trim() || profile?.username,
        bio: bio.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || !profile) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/[0.03] rounded-2xl" />)}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-white">Your Profile</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-center">
          <p className="text-emerald-400 font-bold text-lg">{profile.points_balance.toFixed(1)}</p>
          <p className="text-white/30 text-[10px] uppercase tracking-wider">Balance</p>
        </div>
        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-center">
          <p className="text-emerald-400 font-bold text-lg">{profile.total_earned.toFixed(1)}</p>
          <p className="text-white/30 text-[10px] uppercase tracking-wider">Earned</p>
        </div>
        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-center">
          <p className="text-white font-bold text-lg">
            {getReplyRate(profile.total_messages_received, profile.total_messages_replied)}
          </p>
          <p className="text-white/30 text-[10px] uppercase tracking-wider">Reply Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-center">
          <p className="text-white font-semibold">{profile.total_messages_received}</p>
          <p className="text-white/30 text-[10px]">DMs Received</p>
        </div>
        <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-center">
          <p className="text-white font-semibold">
            {formatAvgResponseTime(profile.total_response_time_seconds, profile.total_messages_replied)}
          </p>
          <p className="text-white/30 text-[10px]">Avg Response</p>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-4">
        <h2 className="text-sm font-medium text-white/60">Edit Profile</h2>

        <div>
          <label className="text-xs text-white/40 mb-1 block">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400/50"
          />
        </div>

        <div>
          <label className="text-xs text-white/40 mb-1 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-400/50 resize-none"
            rows={2}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-white/40">DM Price</label>
            <span className="text-emerald-400 font-bold text-lg">{dmPrice.toFixed(1)} pts</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="50"
            step="0.1"
            value={dmPrice}
            onChange={(e) => setDmPrice(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-white/20 mt-1">
            <span>0.1 pts</span>
            <span>50 pts</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-2.5 font-medium text-sm rounded-xl transition-all ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          } disabled:opacity-50`}
        >
          {saved ? '✓ Saved' : saving ? '...' : 'Save Profile'}
        </button>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-medium text-white/30 uppercase tracking-wider">
            Recent Transactions
          </h2>
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg">
              <div>
                <p className="text-white/60 text-xs">{tx.description}</p>
                <p className="text-white/20 text-[10px]">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-sm font-medium ${
                tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/40 text-sm rounded-xl transition-all"
      >
        Sign Out
      </button>
    </div>
  )
}
