'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Check, ArrowLeft, Crown, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

function UpgradeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const check = async () => {
      const { data } = await supabase.from('users').select('is_pro').eq('id', user.id).single()
      if (data?.is_pro) setIsPro(true)
      setLoading(false)
    }
    check()
  }, [user])

  useEffect(() => {
    if (searchParams.get('stripe') === 'success' && user) {
      setMessage('Payment successful! Activating Pro...')
      fetch('/api/stripe/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.activated) {
            setMessage('Pro activated! Welcome to FinFlow Pro.')
            setTimeout(() => router.push('/dashboard'), 1500)
          } else {
            setMessage('Payment successful but activation pending. Please wait a moment or contact support.')
            setTimeout(() => router.push('/dashboard'), 3000)
          }
        })
        .catch(() => {
          setMessage('Payment successful! Pro will be activated shortly.')
          setTimeout(() => router.push('/dashboard'), 3000)
        })
    } else if (searchParams.get('stripe') === 'cancelled') {
      setMessage('Payment was cancelled. You can try again anytime.')
    }
  }, [searchParams, user])

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth')
      return
    }
    setCheckoutLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Something went wrong')
        setCheckoutLoading(false)
        return
      }

      window.location.href = data.url
    } catch (error) {
      setMessage('Failed to start checkout. Please try again.')
      setCheckoutLoading(false)
    }
  }

  const freeFeatures = [
    '6 basic lessons',
    'Basic dashboard',
    '1 savings goal',
    'Top 10 leaderboard only',
    'No streak tracking',
    'No analytics',
    'No CSV export',
    'No friend challenges',
  ]

  const proFeatures = [
    'All 43 lessons across 6 tracks',
    'Advanced analytics with 5 charts',
    'Unlimited savings goals',
    'Full leaderboard with filters',
    'Streak tracking with freezes',
    'CSV export for transactions',
    'Completion certificate',
    'Friend challenges and goals',
    'Tax calculator (US/UK/Israel)',
    'Compound interest calculator',
    'Goal timeline projector',
    'Biggest spending weeks breakdown',
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isPro) {
    return (
      <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-3xl font-bold text-white mb-2">You are a Pro member!</h1>
          <p className="text-gray-400">Enjoy all Pro features. Thank you for supporting FinFlow.</p>
          <button onClick={() => router.push('/dashboard')} className="mt-6 bg-[#00C896] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#00b085] transition-colors">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pt-8 md:p-8 max-w-3xl mx-auto space-y-8 pb-32">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {message && (
        <div className={"text-center text-sm font-medium p-3 rounded-xl " + (message.includes('successful') ? 'bg-[#00C896]/10 text-[#00C896]' : message.includes('cancelled') ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400')}>
          {message}
        </div>
      )}

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00C896]/10 border border-[#00C896]/30 rounded-3xl mb-6">
          <Crown className="w-10 h-10 text-[#00C896]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">FinFlow Pro</h1>
        <p className="text-[#00C896] font-semibold text-lg mt-2">.99/month — cancel anytime</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-3xl p-6 border border-white/10"
        >
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Free</h3>
          <ul className="space-y-4">
            {freeFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                <span className="text-gray-600 mt-0.5 flex-shrink-0">—</span>
                {f}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#00C896]/10 rounded-3xl p-6 border border-[#00C896]/30 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C896]/10 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-sm font-bold text-[#00C896] uppercase tracking-wider mb-6">Pro</h3>
          <ul className="space-y-4">
            {proFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white">
                <Check className="w-4 h-4 text-[#00C896] mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="w-full md:w-auto bg-[#00C896] text-black font-bold py-4 px-12 rounded-xl hover:bg-[#00b085] transition-colors text-lg shadow-[0_0_30px_rgba(0,200,150,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
        >
          {checkoutLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5" />
              Upgrade Now
            </>
          )}
        </button>
        <p className="text-gray-500 text-sm mt-4">Secure payment via Stripe</p>
      </motion.div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" /></div>}>
      <UpgradeContent />
    </Suspense>
  )
}
