'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { Trophy, Medal, Star, Flame, ArrowLeft, Lock, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import UpgradeModal from '@/components/UpgradeModal'

export default function LeaderboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [filter, setFilter] = useState<'week' | 'month' | 'all'>('all')
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      if (!user) { setLoading(false); return }

      const { data: userData } = await supabase
        .from('users')
        .select('is_pro')
        .eq('id', user.id)
        .single()

      if (userData?.is_pro) setIsPro(true)

      const { data } = await supabase
        .from('users')
        .select('id, name, money_score, streak, total_xp, is_pro')
        .order('money_score', { ascending: false })

      if (data) {
        setUsers(data)
        const rank = data.findIndex(u => u.id === user?.id) + 1
        setUserRank(rank > 0 ? rank : null)
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-full bg-accent/20 border border-accent/50 shadow-glow-green"
        />
      </div>
    )
  }

  const displayUsers = isPro ? users : users.slice(0, 10)

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
        <div className="w-20 h-20 bg-accent/10 border border-accent/30 rounded-3xl flex items-center justify-center shadow-glow-green">
          <Trophy className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 tracking-tighter">
          Global Ranked
        </h1>
        <p className="text-textMuted font-medium tracking-wide mt-2">Earn points by making responsible money moves.</p>
      </div>

      {isPro && (
        <div className="flex gap-2 justify-center">
          {(['all', 'week', 'month'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === f
                  ? 'bg-[#00C896] text-black'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
              }`}
            >
              {f === 'all' ? 'All Time' : f === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {displayUsers.map((u, index) => {
          const isCurrentUser = user && u.id === user.id
          const rankColor = index === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                          : index === 1 ? 'text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]'
                          : index === 2 ? 'text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]'
                          : 'text-white/60'

          const nameParts = u.name.split(' ')
          const displayName = isPro ? u.name : `${nameParts[0]} ${nameParts.length > 1 ? nameParts[nameParts.length - 1][0] + '.' : ''}`

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={u.id}
              className={`p-5 rounded-3xl flex items-center justify-between border backdrop-blur-xl transition-all duration-300
                ${isCurrentUser
                  ? 'bg-accent/10 border-accent/40 shadow-glow-green scale-[1.02]'
                  : 'bg-surfaceGlass border-white/5 hover:border-white/10'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex items-center justify-center font-black text-xl ${rankColor}`}>
                  {index === 0 ? <Flame className="w-8 h-8" /> :
                   index === 1 ? <Medal className="w-7 h-7" /> :
                   index === 2 ? <Star className="w-6 h-6" /> :
                   `#${index + 1}`}
                </div>
                <div>
                  <h3 className={`font-bold text-lg tracking-wide flex items-center gap-2 ${isCurrentUser ? 'text-white' : 'text-white/80'}`}>
                    {displayName}
                    {u.is_pro && <Crown className="w-4 h-4 text-yellow-400" />}
                    {isCurrentUser && <span className="text-[10px] ml-2 font-black uppercase tracking-widest bg-accent text-background px-2 py-0.5 rounded-full">You</span>}
                  </h3>
                  {isPro && (
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span>🔥 {u.streak || 0}</span>
                      <span>⚡ {u.total_xp || 0} XP</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black tracking-tight text-2xl ${isCurrentUser ? 'text-accent' : 'text-white'}`}>{u.money_score}</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Points</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {!isPro && (
        <>
          <div className="relative">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm">
              <Lock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
              <p className="text-white font-semibold">See the full leaderboard with Pro</p>
              <p className="text-gray-400 text-sm mt-1">Unlock all rankings, filters, and detailed stats</p>
            </div>
          </div>

          {userRank && userRank > 10 && (
            <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4 text-center">
              <p className="text-white font-bold">You are ranked #{userRank}</p>
              <button onClick={() => setShowUpgrade(true)} className="text-[#00C896] text-sm font-semibold mt-1 hover:underline">
                Upgrade to see everyone →
              </button>
            </div>
          )}
        </>
      )}

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}
