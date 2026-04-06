'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Crown, CheckCircle2 } from 'lucide-react'

interface ProGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProGate({ children, fallback }: ProGateProps) {
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { if (!cancelled) setLoading(false); return }

      const { data: user } = await supabase.from('users').select('is_pro').eq('id', session.user.id).single()

      if (user?.is_pro) {
        if (!cancelled) setIsPro(true)
      } else {
        const { data: sub } = await supabase.from('subscriptions').select('status, expires_at').eq('user_id', session.user.id).eq('status', 'active').single()
        if (sub) {
          const notExpired = !sub.expires_at || new Date(sub.expires_at) > new Date()
          if (!cancelled) setIsPro(notExpired)
          if (notExpired && !cancelled) {
            await supabase.from('users').update({ is_pro: true }).eq('id', session.user.id)
          }
        }
      }
      if (!cancelled) setLoading(false)
    }
    check()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isPro) {
    return fallback || (
      <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
          <div className="w-28 h-28 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center">
            <Lock className="w-12 h-12 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-black text-sm uppercase tracking-wider">Pro Feature</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Unlock with FinFlow Pro</h2>
            <p className="text-gray-400 text-lg">Get access to this feature and everything else Pro offers.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white font-bold mb-4">Pro includes:</h3>
            <ul className="space-y-3 text-left">
              {['All 43 lessons across 6 tracks', 'Advanced analytics with 5 charts', 'Streak tracking with freezes', 'CSV export for transactions', 'Friend challenges and goals', 'Tax calculator (US/UK/Israel)', 'Compound interest calculator', 'Completion certificate'].map((f, i) => (
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
            <button onClick={() => router.push('/dashboard')} className="w-full bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
              Back to Dashboard
            </button>
          </div>
          <p className="text-gray-500 text-sm">Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
