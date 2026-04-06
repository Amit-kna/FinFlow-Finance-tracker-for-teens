'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminActivateProPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleActivate = async () => {
    setLoading(true)
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'

    if (password !== adminPassword) {
      setMessage('Incorrect password')
      setLoading(false)
      return
    }

    const { data: user } = await supabase.from('users').select('id').eq('email', email).single()

    if (!user) {
      setMessage('User not found')
      setLoading(false)
      return
    }

    const { error: userError } = await supabase.from('users').update({ is_pro: true }).eq('id', user.id)

    if (userError) {
      setMessage('Error: ' + userError.message)
    } else {
      await supabase.from('subscriptions').upsert({
        user_id: user.id, status: 'active', plan: 'pro', price: 2.99, started_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

      setMessage('Pro activated for ' + email + '! Refreshing...')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
    }
    setLoading(false)
  }

  return (
    <div className="p-4 pt-8 md:p-8 max-w-md mx-auto space-y-8 pb-32">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="flex items-center gap-3 mb-4">
        <Lock className="w-6 h-6 text-yellow-400" />
        <h1 className="text-2xl font-bold text-white">Admin: Activate Pro</h1>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
        <p className="text-yellow-400 text-xs">Testing only. Remove before public launch.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 font-medium mb-2 block">Admin Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C896] transition-colors placeholder:text-white/30" placeholder="Enter admin password" />
        </div>

        <div>
          <label className="text-sm text-gray-400 font-medium mb-2 block">User Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C896] transition-colors placeholder:text-white/30" placeholder="user@example.com" />
        </div>

        <button onClick={handleActivate} disabled={loading || !email || !password} className="w-full bg-[#00C896] text-black font-bold py-4 rounded-xl hover:bg-[#00b085] transition-colors disabled:opacity-50">
          {loading ? 'Activating...' : 'Activate Pro'}
        </button>

        {message && (
          <div className={"text-center text-sm font-medium p-3 rounded-xl " + (message.includes('activated') ? 'bg-[#00C896]/10 text-[#00C896]' : 'bg-red-500/10 text-red-400')}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
