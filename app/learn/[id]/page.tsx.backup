'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { lessons } from '@/lib/lessons'
import { CheckCircle2, ArrowLeft, Trophy, Sparkles, ArrowRight, Lock, Crown, X } from 'lucide-react'
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
  const [showResults, setShowResults] = useState(false)
  const [allCorrect, setAllCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const check = async () => {
      const { data: userData } = await supabase
        .from('users')
        .select('is_pro')
        .eq('id', user.id)
        .single()

      if (userData?.is_pro) setIsPro(true)

      if (!lesson) { setLoading(false); return }

      if (lesson.isPro && !userData?.is_pro) {
        setLoading(false)
        return
      }

      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('completed')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .single()

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
    // Reset results when user changes an answer
    if (showResults || allCorrect !== undefined) {
      setShowResults(false)
      setAllCorrect(false)
      setCorrectCount(0)
    }
  }

  const finishLesson = async () => {
    if (!user || !lesson || quizScores.includes(-1)) return
    setSubmitting(true)

    // Calculate correct count
    let correctCount = 0
    lesson.quiz.forEach((q, i) => {
      if (q.correctIndex === quizScores[i]) correctCount++
    })
    setCorrectCount(correctCount)
    
    // Determine if all answers are correct (for XP)
    const allCorrect = correctCount === lesson.quiz.length
    setAllCorrect(allCorrect)
    
    // Always save progress (completed if passed threshold)
    const passed = correctCount >= Math.ceil(lesson.quiz.length / 2)
    
    await supabase.from('lesson_progress').upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      completed: passed,
      score: correctCount,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' })

    // Only award XP if ALL questions correct and not already completed
    if (allCorrect && !alreadyCompleted) {
      const xpToAward = lesson.isPro ? 20 : 10
      setEarnedXp(xpToAward)

      const { data: currentUser } = await supabase
        .from('users')
        .select('total_xp, money_score')
        .eq('id', user.id)
        .single()

      await supabase.from('users').update({
        total_xp: (currentUser?.total_xp || 0) + xpToAward,
        money_score: (currentUser?.money_score || 0) + xpToAward
      }).eq('id', user.id)

      await supabase.from('points_log').insert({
        user_id: user.id,
        action: 'lesson_complete',
        points: xpToAward,
        metadata: { lesson_id: lesson.id, lesson_title: lesson.title }
      })
    }

    setShowResults(true)
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

  if (lesson.isPro && !isPro) {
    return (
      <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
        <button onClick={() => router.push('/learn')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </button>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-28 h-28 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center"
          >
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
              {[
                'All 43 lessons across 6 tracks',
                'Advanced analytics with 5 charts',
                'Streak tracking with freezes',
                'CSV export for transactions',
                'Friend challenges & goals',
                'Tax calculator (US/UK/Israel)',
                'Completion certificate',
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-[#00C896] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={() => router.push('/upgrade')}
              className="w-full bg-[#00C896] text-black font-bold py-4 rounded-xl hover:bg-[#00b085] transition-colors text-lg flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Pro — $2.99/mo
            </button>
            <button
              onClick={() => router.push('/learn')}
              className="w-full bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
            >
              Back to Free Lessons
            </button>
          </div>

          <p className="text-gray-500 text-sm">Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    )
  }

  {showResults && (
    <div className="p-8 max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-24 h-24 bg-[#00C896]/20 text-[#00C896] rounded-full flex items-center justify-center"
      >
        {allCorrect ? <CheckCircle2 className="w-12 h-12" /> : <X className="w-12 h-12 text-[#FF6B6B]" />}
      </motion.div>
      <h2 className="text-3xl font-bold text-white">
        {allCorrect ? 'Lesson Completed!' : 'Nice Try!'}
      </h2>
      
      {/* Quiz Results Breakdown */}
      <div className="space-y-4">
        {lesson.quiz.map((q, i) => (
          <div key={i} className="bg-surface border border-white/5 p-4 rounded-2xl">
            <p className="text-white font-medium mb-3">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const isCorrect = idx === q.correctIndex;
                const isSelected = quizScores[i] === idx;
                const isCorrectlySelected = isCorrect && isSelected;
                const isIncorrectlySelected = !isCorrect && isSelected;
                
                return (
                  <button 
                    key={idx} 
                    disabled={true} 
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ` + 
                      (isCorrectlySelected ? 'bg-[#00C896]/20 border-[#00C896] text-[#00C896] font-bold' : 
                       isIncorrectlySelected ? 'bg-[#FF6B6B]/20 border-[#FF6B6B] text-[#FF6B6B] font-bold' :
                       isCorrect ? 'bg-[#00C896]/10 border-[#00C896]/30 text-[#00C896]' : 
                       'bg-[#0A0C10] border-white/5 text-gray-300')}
                  >
                    {opt}
                    {isCorrect && !isSelected && (
                      <span className="ml-2 text-xs text-[#00C896]">(Correct answer)</span>
                    )}
                    {isIncorrectlySelected && (
                      <span className="ml-2 text-xs text-[#FF6B6B]">(Your answer)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 bg-[#00C896]/10 border border-[#00C896]/30 rounded-xl px-4 py-2">
        <Sparkles className="w-5 h-5 text-[#00C896]" />
        <span className="text-white font-bold">+{earnedXp} XP awarded</span>
      </div>
      
      {allCorrect && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">
          <span className="text-lg">{lesson.badgeEmoji}</span>
          <span className="text-yellow-400 font-bold">{lesson.badge}</span>
        </div>
      )}
      
      <div className="flex gap-3 mt-4">
        <button onClick={() => router.push('/learn')} className="bg-white text-black font-bold py-3 px-8 rounded-xl">Back to Library</button>
        {lesson.id < lessons.length && (
          <button onClick={() => router.push('/learn/' + (lesson.id + 1))} className={`bg-[#00C896] text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 ${!allCorrect ? 'opacity-50' : ''}`}>
            Next Lesson <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )}

  if (!showResults && quizFinished) {
    return (
      <div className="p-8 max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 bg-[#00C896]/20 text-[#00C896] rounded-full flex items-center justify-center"
        >
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
          <button onClick={() => router.push('/learn')} className="bg-white text-black font-bold py-3 px-8 rounded-xl">Back to Library</button>
          {lesson.id < lessons.length && (
            <button onClick={() => router.push('/learn/' + (lesson.id + 1))} className="bg-[#00C896] text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2">
              Next Lesson <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-6 pb-24">
      <button onClick={() => router.push('/learn')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Library
      </button>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{lesson.badgeEmoji}</span>
          {lesson.isPro && <span className="text-[9px] font-black uppercase tracking-wider text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full">Pro</span>}
        </div>
        <h1 className="text-3xl font-bold text-white leading-tight">{lesson.title}</h1>
        <p className="text-[#00C896] text-sm font-medium mt-2">{lesson.track} - +{lesson.xp} XP</p>
      </div>
      <div className="bg-surface p-6 rounded-3xl border border-white/5 text-gray-300 leading-relaxed text-lg whitespace-pre-line">{lesson.content}</div>
      {alreadyCompleted && (
        <div className="bg-[#00C896]/10 border border-[#00C896]/30 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#00C896]" />
          <p className="text-white text-sm font-medium">You already completed this lesson. You can retake the quiz but will not earn additional XP.</p>
        </div>
      )}
      <div className="pt-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Check</h3>
        {lesson.quiz.map((q, i) => (
          <div key={i} className="bg-surface border border-white/5 p-5 rounded-2xl mb-4">
            <p className="text-white font-medium mb-4">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, idx) => (
                <button key={idx} onClick={() => handleQuizSelect(i, idx)} className={"w-full text-left p-3 rounded-xl border text-sm transition-colors " + (quizScores[i] === idx ? 'bg-[#00C896]/20 border-[#00C896] text-[#00C896] font-bold' : 'bg-[#0A0C10] border-white/5 text-gray-300 hover:border-white/20')}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button disabled={quizScores.includes(-1) || submitting} onClick={finishLesson} className="w-full bg-[#00C896] text-black font-bold py-4 rounded-xl disabled:opacity-50 mt-4">
          {submitting ? 'Submitting...' : alreadyCompleted ? 'Retake Quiz' : 'Complete Lesson'}
        </button>
      </div>
    </div>
  )
}