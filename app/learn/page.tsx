'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { BookOpen, CheckCircle2, ChevronRight, PlayCircle, Trophy, ArrowLeft, Lock, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { lessons, tracks, getLessonsByTrack } from '@/lib/lessons'
import { motion } from 'framer-motion'
import UpgradeModal from '@/components/UpgradeModal'

export default function LearnPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [inProgressLessons, setInProgressLessons] = useState<number[]>([])
  const [isPro, setIsPro] = useState(false)
  const [totalXp, setTotalXp] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const fetch = async () => {
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed, score')
        .eq('user_id', user.id)

      if (progress) {
        setCompletedLessons(progress.filter(p => p.completed).map(p => p.lesson_id))
        setInProgressLessons(progress.filter(p => !p.completed).map(p => p.lesson_id))
      }

      const { data: userData } = await supabase
        .from('users')
        .select('is_pro, total_xp, money_score')
        .eq('id', user.id)
        .single()

      if (userData) {
        setIsPro(userData.is_pro || false)
        setTotalXp(userData.total_xp || 0)
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  const handleLessonClick = (lessonId: number, lessonIsPro: boolean) => {
    if (lessonIsPro && !isPro) {
      setShowUpgrade(true)
      return
    }
    router.push(`/learn/${lessonId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 pt-8 md:p-8 max-w-3xl mx-auto space-y-8 pb-32">
      <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Learn</h1>
          <p className="text-textMuted text-sm mt-1">Level up your financial IQ across 6 tracks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-surfaceGlass border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-inner">
            <Sparkles className="w-4 h-4 text-[#00C896]" />
            <span className="text-white font-bold">{totalXp} XP</span>
          </div>
          {isPro && (
            <span className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-400 font-black text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5">
              👑 Pro
            </span>
          )}
        </div>
      </div>

      {!isPro && (
        <div className="bg-[#00C896]/10 border border-[#00C896]/30 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔓</span>
          <div>
            <p className="text-white font-semibold text-sm">33 free lessons available</p>
            <p className="text-gray-400 text-xs">Upgrade to Pro for 10 more lessons in the Trading Academy</p>
          </div>
          <button onClick={() => setShowUpgrade(true)} className="ml-auto bg-[#00C896] text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#00b085] transition-colors whitespace-nowrap">
            Upgrade
          </button>
        </div>
      )}

      {tracks.map((track) => {
        const trackLessons = getLessonsByTrack(track.name)
        const trackCompleted = trackLessons.filter(l => completedLessons.includes(l.id)).length
        const trackTotal = trackLessons.length

        return (
          <div key={track.name}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{track.emoji}</span>
                <h2 className="text-xl font-bold text-white">{track.name}</h2>
                {track.isPro && (
                  <span className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-black text-[9px] uppercase tracking-wider rounded-full px-2 py-0.5">
                    Pro
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 font-medium">{trackCompleted}/{trackTotal} complete</span>
            </div>

            <div className="space-y-3">
              {trackLessons.map((lesson) => {
                const isComplete = completedLessons.includes(lesson.id)
                const inProgress = inProgressLessons.includes(lesson.id)
                const isLocked = lesson.isPro && !isPro

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleLessonClick(lesson.id, lesson.isPro)}
                    className={`relative p-5 rounded-2xl border flex justify-between items-center cursor-pointer transition-all group ${
                      isLocked
                        ? 'bg-white/5 border-white/5 opacity-70'
                        : isComplete
                        ? 'bg-[#00C896]/5 border-[#00C896]/20'
                        : inProgress
                        ? 'bg-purpleAccent/5 border-purpleAccent/20'
                        : 'bg-surface border-white/5 hover:border-white/20'
                    }`}
                  >
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl backdrop-blur-[1px] z-10">
                        <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-xl">
                          <Lock className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-sm font-bold">Pro Only</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        isComplete ? 'bg-[#00C896]/20 text-[#00C896]' :
                        inProgress ? 'bg-purpleAccent/20 text-purpleAccent' :
                        isLocked ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-white/5 text-white/40'
                      }`}>
                        {isComplete ? <CheckCircle2 className="w-5 h-5" /> :
                         isLocked ? <Lock className="w-5 h-5" /> :
                         <PlayCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-sm ${
                          isComplete ? 'text-white/60 line-through' :
                          isLocked ? 'text-white/40' :
                          'text-white group-hover:text-[#00C896] transition-colors'
                        }`}>
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-textMuted mt-1">
                          +{lesson.xp} XP • {lesson.badgeEmoji} {lesson.badge}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {lesson.isPro && !isLocked && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full">
                          Pro
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isComplete ? 'text-white/20' : 'text-white/30'}`} />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-2 mb-6">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00C896] rounded-full transition-all duration-500"
                  style={{ width: `${(trackCompleted / trackTotal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}
