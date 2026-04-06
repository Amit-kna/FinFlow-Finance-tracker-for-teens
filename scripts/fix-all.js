const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/knaan/.gemini/FinFlow-Finance tracker for teens-2.0';

function writeFile(subpath, content) {
  const fullPath = path.join(dir, subpath);
  fs.writeFileSync(fullPath, content);
  console.log('✅', subpath, '-', content.split('\n').length, 'lines');
}

// ═══════════════════════════════════════════════════════════
// FIX 1: Lesson page with proper lock screen
// ═══════════════════════════════════════════════════════════
writeFile('app/learn/[id]/page.tsx', `'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { lessons } from '@/lib/lessons'
import { CheckCircle2, ArrowLeft, Sparkles, ArrowRight, Lock, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LessonPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const lesson = lessons.find(l => l.id === parseInt(params.id))
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [quizScores, setQuizScores] = useState<number[]>([])
  const [quizFinished, setQuizFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [earnedXp, setEarnedXp] = useState(0)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const check = async () => {
      const { data: userData } = await supabase.from('users').select('is_pro').eq('id', user.id).single()
      if (userData?.is_pro) setIsPro(true)
      if (!lesson) { setLoading(false); return }
      if (lesson.isPro && !userData?.is_pro) { setLoading(false); return }
      const { data: progress } = await supabase.from('lesson_progress').select('completed').eq('user_id', user.id).eq('lesson_id', lesson.id).single()
      if (progress?.completed) setAlreadyCompleted(true)
      setQuizScores(new Array(lesson.quiz.length).fill(-1))
      setLoading(false)
    }
    check()
  }, [user, lesson])

  const handleQuizSelect = (index: number, answerIndex: number) => {
    const newScores = [...quizScores]
    newScores[index] = answerIndex
    setQuizScores(newScores)
  }

  const finishLesson = async () => {
    if (!user || !lesson || quizScores.includes(-1)) return
    setSubmitting(true)
    let correctCount = 0
    lesson.quiz.forEach((q, i) => { if (q.correctIndex === quizScores[i]) correctCount++ })
    const passed = correctCount >= Math.ceil(lesson.quiz.length / 2)
    await supabase.from('lesson_progress').upsert({ user_id: user.id, lesson_id: lesson.id, completed: passed, score: correctCount, completed_at: new Date().toISOString() }, { onConflict: 'user_id,lesson_id' })
    if (passed && !alreadyCompleted) {
      const xpToAward = lesson.isPro ? 20 : 10
      setEarnedXp(xpToAward)
      const { data: currentUser } = await supabase.from('users').select('total_xp, money_score').eq('id', user.id).single()
      await supabase.from('users').update({ total_xp: (currentUser?.total_xp || 0) + xpToAward, money_score: (currentUser?.money_score || 0) + xpToAward }).eq('id', user.id)
      await supabase.from('points_log').insert({ user_id: user.id, action: 'lesson_complete', points: xpToAward, metadata: { lesson_id: lesson.id, lesson_title: lesson.title } })
    }
    setQuizFinished(true)
    setSubmitting(false)
  }

  if (!lesson) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Lesson not found</h1>
        <button onClick={() => router.push('/learn')} className="bg-[#00C896] text-black font-bold px-6 py-3 rounded-xl">Back to Lessons</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Pro lesson lock screen - full page, no modal
  if (lesson.isPro && !isPro) {
    return (
      <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
        <button onClick={() => router.push('/learn')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </button>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-28 h-28 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center">
            <Lock className="w-12 h-12 text-yellow-400" />
          </motion.div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-black text-sm uppercase tracking-wider">Pro Lesson</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
            <p className="text-gray-400 text-lg">This lesson is part of the {lesson.track} track</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white font-bold mb-4">What you get with Pro:</h3>
            <ul className="space-y-3 text-left">
              {['All 43 lessons across 6 tracks', 'Advanced analytics with 5 charts', 'Streak tracking with freezes', 'CSV export for transactions', 'Friend challenges and goals', 'Tax calculator (US/UK/Israel)', 'Completion certificate'].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-[#00C896] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button onClick={() => router.push('/upgrade')} className="w-full bg-[#00C896] text-black font-bold py-4 rounded-xl hover:bg-[#00b085] transition-colors text-lg flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />
              Upgrade to Pro
            </button>
            <button onClick={() => router.push('/learn')} className="w-full bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
              Back to Free Lessons
            </button>
          </div>
          <p className="text-gray-500 text-sm">Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    )
  }

  if (quizFinished) {
    return (
      <div className="p-8 max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen text-center space-y-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-24 h-24 bg-[#00C896]/20 text-[#00C896] rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white">Lesson Completed!</h2>
        <div className="flex items-center gap-2 bg-[#00C896]/10 border border-[#00C896]/30 rounded-xl px-4 py-2">
          <Sparkles className="w-5 h-5 text-[#00C896]" />
          <span className="text-white font-bold">+{earnedXp} XP awarded</span>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
          <span className="text-lg">{lesson.badgeEmoji}</span>
          <span className="text-yellow-400 font-bold">{lesson.badge}</span>
        </div>
        <div className="flex gap-3 mt-4">
          <butto
