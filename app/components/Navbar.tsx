'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient, Profile } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/', label: 'Browse', icon: '🔍' },
  { href: '/inbox', label: 'Inbox', icon: '📥' },
  { href: '/sent', label: 'Sent', icon: '📤' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!mounted) return
        setUser(user)
        if (user) {
          supabase.from('profiles').select('points_balance').eq('id', user.id).single().then(({ data }) => {
            if (mounted && data) setProfile(data as any)
          })
        }
        setReady(true)
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          supabase.from('profiles').select('points_balance').eq('id', session.user.id).single().then(({ data }) => {
            if (mounted && data) setProfile(data as any)
          })
        } else {
          setProfile(null)
        }
      })
      return () => { mounted = false; subscription.unsubscribe() }
    } catch {
      setReady(true)
    }
  }, [])

  if (pathname === '/login' || !ready) return null

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-lg">Paywall</span>
            <span className="text-white/40 font-light">.chat</span>
          </Link>

          {user && profile && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full font-medium">
                {(profile as any).points_balance?.toFixed(1) ?? '...'} pts
              </span>
            </div>
          )}
        </div>

        {user && (
          <div className="flex gap-1 pb-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 text-center py-2 text-xs rounded-lg transition-all ${
                  pathname === item.href
                    ? 'bg-emerald-400/10 text-emerald-400'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <span className="block text-sm mb-0.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
