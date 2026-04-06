'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter()

  const freeFeatures = [
    '6 basic lessons',
    'Basic dashboard',
    '1 savings goal',
    'Top 10 leaderboard only',
    'No streak tracking',
    'No analytics',
  ]

  const proFeatures = [
    'All 43 lessons across 6 tracks',
    'Advanced analytics with 5 charts',
    'Unlimited savings goals',
    'Full leaderboard with filters',
    'Streak tracking with freezes',
    'CSV export for transactions',
    'Completion certificate',
    'Friend challenges',
    'Tax calculator',
    'Compound interest calculator',
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-[#0D1117] border border-white/10 rounded-3xl z-50 overflow-y-auto custom-scrollbar"
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👑</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">FinFlow Pro</h2>
                    <p className="text-[#00C896] font-semibold">$2.99/month — cancel anytime</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Free</h3>
                  <ul className="space-y-3">
                    {freeFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-gray-500 mt-0.5">—</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#00C896]/10 rounded-2xl p-5 border border-[#00C896]/30">
                  <h3 className="text-sm font-bold text-[#00C896] uppercase tracking-wider mb-4">Pro ✦</h3>
                  <ul className="space-y-3">
                    {proFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white">
                        <Check className="w-4 h-4 text-[#00C896] mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => router.push('/upgrade')}
                className="w-full bg-[#00C896] text-black font-bold py-4 rounded-xl hover:bg-[#00b085] transition-colors text-lg"
              >
                Upgrade Now
              </button>
              <p className="text-center text-gray-500 text-sm mt-3">Secure payment via Stripe</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
