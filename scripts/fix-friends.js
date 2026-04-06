const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/knaan/.gemini/FinFlow-Finance tracker for teens-2.0';

const friendsPath = path.join(dir, 'app/friends/page.tsx');

const newFriendsPage = `'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, UserPlus, Check, X, Users, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProGate from '@/components/ProGate'
import { motion } from 'framer-motion'

function FriendsContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [friends, setFriends] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchFriends()
  }, [user])

  const fetchFriends = async () => {
    if (!user) return

    const { data: friendships } = await supabase
      .from('friendships')
      .select('id, requester_id, receiver_id')
      .eq('status', 'accepted')
      .or('requester_id.eq.' + user.id + ',receiver_id.eq.' + user.id)

    if (friendships) {
      const friendIds = friendships.map(f => f.requester_id === user.id ? f.receiver_id : f.requester_id)
      const { data: friendUsers } = await supabase
        .from('users')
        .select('id, name, money_score, streak')
        .in('id', friendIds)
      setFriends(friendUsers || [])
    }

    const { data: received } = await supabase
      .from('friendships')
      .select('id, requester_id')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')

    if (received && received.length > 0) {
      const requesterIds = received.map(r => r.requester_id)
      const { data: requesters } = await supabase
        .from('users')
        .select('id, name, money_score, streak')
        .in('id', requesterIds)
      
      setPendingRequests(requesters?.map(r => ({
        ...r,
        friendship_id: received.find(req => req.requester_id === r.id)?.id
      })) || [])
    }

    const { data: sent } = await supabase
      .from('friendships')
      .select('id, receiver_id')
      .eq('requester_id', user.id)
      .eq('status', 'pending')

    if (sent && sent.length > 0) {
      const receiverIds = sent.map(s => s.receiver_id)
      const { data: receivers } = await supabase
        .from('users')
        .select('id, name')
        .in('id', receiverIds)
      
      setSentRequests(receivers?.map(r => ({
        ...r,
        friendship_id: sent.find(s => s.receiver_id === r.id)?.id
      })) || [])
    }

    setLoading(false)
  }

  const handleSendRequest = async () => {
    if (!user || !searchInput.trim()) return
    setSending(true)
    setMessage('')

    const { data: receiver } = await supabase
      .from('users')
      .select('id, name')
      .ilike('name', '%' + searchInput.trim() + '%')
      .single()

    if (!receiver) {
      setMessage('User not found')
      setSending(false)
      return
    }

    if (receiver.id === user.id) {
      setMessage('Cannot send request to yourself')
      setSending(false)
      return
    }

    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, receiver_id: receiver.id, status: 'pending' })

    if (error) {
      setMessage('Request already sent or error occurred')
    } else {
      setMessage('Request sent to ' + receiver.name)
      setSearchInput('')
      fetchFriends()
    }
    setSending(false)
  }

  const handleAccept = async (friendshipId: string) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    fetchFriends()
  }

  const handleDecline = async (friendshipId: string) => {
    await supabase.from('friendships').update({ status: 'declined' }).eq('id', friendshipId)
    setPendingRequests(prev => prev.filter(p => p.friendship_id !== friendshipId))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-white flex items-center gap-3">
        <Users className="w-8 h-8 text-[#00C896]" />
        Friends
      </h1>

      {message && (
        <div className={"text-center text-sm font-medium p-3 rounded-xl " + (message.includes('sent') || message.includes('accepted') ? 'bg-[#00C896]/10 text-[#00C896]' : 'bg-red-500/10 text-red-400')}>
          {message}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-3">Add a Friend</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username"
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00C896] transition-colors placeholder:text-white/30"
          />
          <button
            onClick={handleSendRequest}
            disabled={sending || !searchInput.trim()}
            className="bg-[#00C896] text-black font-bold px-4 py-3 rounded-xl hover:bg-[#00b085] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-3">Pending Requests ({pendingRequests.length})</h3>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-black/20 rounded-xl p-3">
                <div>
                  <p className="text-white font-medium">{req.name}</p>
                  <p className="text-xs text-gray-400">{req.money_score || 0} pts</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(req.friendship_id)} className="w-8 h-8 rounded-full bg-[#00C896]/20 text-[#00C896] flex items-center justify-center hover:bg-[#00C896]/30 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDecline(req.friendship_id)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {sentRequests.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-3">Sent Requests ({sentRequests.length})</h3>
          <div className="space-y-3">
            {sentRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between bg-black/20 rounded-xl p-3">
                <p className="text-white font-medium">{req.name}</p>
                <span className="text-xs text-yellow-400">Pending</span>
        
