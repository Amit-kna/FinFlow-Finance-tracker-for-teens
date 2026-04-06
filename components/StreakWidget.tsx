'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Lock, Flame, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StreakWidget() {
  const router = useRouter()
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [isPro, setIsPro] = useState(false)
  const [freezeCount, setFreezeCount] = useState(0)
  const [lastLogDate, setLastLogDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const fetch = async () => {
      const { data } = await supabase
        .from('users')
        .select('streak, is_pro, streak_freeze_count, last_log_date')
        .eq('id', user.id)
        .single()

      if (data) {
        setStreak(data.streak || 0)
        setIsPro(data.is_pro || false)
        setFreezeCount(data.streak_freeze_count || 0)
        setLastLogDate(data.last_log_date || '')
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  if (loading) return null

  if (!isPro) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
        <Lock className="w-5 h-5 text-gray-500" />
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Streak tracking is Pro</p>
          <p className="text-gray-400 text-xs">Maintain daily streaks and earn bonus points</p>
        </div>
        <button onClick={() => router.push('/upgrade')} className="bg-[#00C896] text-black font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-[#00b085] transition-colors">
          Upgrade
        </button>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const loggedToday = lastLogDate === today
  const loggedYesterday = lastLogDate === yesterdayStr

  // Calculate last 7 days
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    last7Days.push({ date: dateStr, logged: dateStr === lastLogDate || (i === 0 && loggedToday) })
  }

  const milestones = [
    { days: 7, points: 20, achieved: streak >= 7 },
    { days: 30, points: 50, achieved: streak >= 30 },
    { days: 100, points: 200, achieved: streak >= 100 },
  ]

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className={"w-5 h-5 " + (streak > 0 ? "text-orange-400" : "text-gray-500")} />
          <span className="text-white font-bold text-lg">{streak}</span>
          <span className="text-gray-400 text-xs">day streak</span>
        </div>
        <div className="flex items-center gap-2">
          {freezeCount > 0 && (
            <span className="text-xs text-gray-400">{freezeCount} freeze{freezeCount > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <div className="flex gap-1.5">
        {last7Days.map((day, i) => (
          <div
            key={i}
            className={"flex-1 h-6 rounded-full transition-colors " + (day.logged ? 'bg-[#00C896]' : 'bg-white/10')}
            title={day.date}
          />
        ))}
      </div>

      {milestones.some(m => m.achieved) && (
        <div className="flex gap-2 pt-2 border-t border-white/5">
          {milestones.map((m, i) => (
            <div key={i} className={"flex items-center gap-1 text-xs px-2 py-1 rounded-full " + (m.achieved ? 'bg-[#00C896]/10 text-[#00C896]' : 'bg-white/5 text-gray-500')}>
              <Award className="w-3 h-3" />
              <span>{m.days}d</span>
            </div>
          ))}
        </div>
      )}

      {!loggedToday && streak > 0 && (
        <p className="text-xs text-yellow-400 flex items-center gap-1">
          <span>Log a transaction today to keep your streak!</span>
        </p>
      )}
    </div>
  )
}
