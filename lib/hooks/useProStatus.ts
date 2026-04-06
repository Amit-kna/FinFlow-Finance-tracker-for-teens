'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useProStatus() {

  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data } = await supabase
        .from('subscriptions')
        .select('status, expires_at')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single()

      if (data) {
        const notExpired = !data.expires_at || new Date(data.expires_at) > new Date()
        setIsPro(notExpired)
      }
      setLoading(false)
    }
    check()
  }, [])

  return { isPro, loading }
}
