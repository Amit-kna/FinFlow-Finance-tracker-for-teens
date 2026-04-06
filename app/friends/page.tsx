'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Trophy, Users, Search, Check, X, ArrowLeft, UserPlus, Flame, Star, Medal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProGate from '@/components/ProGate'

type Friend = {
  id: string; // Friendship ID
  status: 'pending' | 'accepted';
  friendId: string;
  name: string;
  email: string;
  money_score: number;
  streak: number;
  total_xp: number;
  isPendingForMe: boolean;
  isPendingFromMe: boolean;
}

function FriendsDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'requests' | 'add'>('leaderboard')
  
  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends')
      const data = await res.json()
      if (data.friends) {
        setFriends(data.friends)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const fetchInit = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (dbUser) {
        setCurrentUserProfile(dbUser)
      }
      
      await fetchFriends()
      setLoading(false)
    }
    
    fetchInit()
  }, [user])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const res = await fetch('/api/friends/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: searchQuery.trim() })
      })
      const data = await res.json()
      if (data.users) {
        setSearchResults(data.users)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error(err)
      setSearchResults([])
    }
    setSearching(false)
  }

  const handleSendRequest = async (receiverId: string) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: receiverId })
      })
      if (res.ok) {
        await fetchFriends() // Refresh the list
        // Remove from search results just to provide feedback
        setSearchResults(prev => prev.filter(u => u.id !== receiverId))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleRespond = async (friendshipId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, action })
      })
      if (res.ok) {
        await fetchFriends()
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-full bg-accent/20 border border-accent/50 shadow-glow-green"
        />
      </div>
    )
  }

  const activeFriends = friends.filter(f => f.status === 'accepted')
  const pendingRequestsForMe = friends.filter(f => f.status === 'pending' && f.isPendingForMe)
  
  // Combine current user with friends for leaderboard
  const rawLeaderboard = [
    ...activeFriends.map(f => ({
      id: f.friendId,
      name: f.name,
      money_score: f.money_score,
      streak: f.streak,
      total_xp: f.total_xp,
      isCurrentUser: false
    })),
    ...(currentUserProfile ? [{
      id: currentUserProfile.id,
      name: currentUserProfile.name,
      money_score: currentUserProfile.money_score,
      streak: currentUserProfile.streak,
      total_xp: currentUserProfile.total_xp,
      isCurrentUser: true
    }] : [])
  ]

  // Sort by money_score descending
  const leaderboard = rawLeaderboard.sort((a, b) => (b.money_score || 0) - (a.money_score || 0))

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between mt-4 md:mt-0">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </button>
      </div>

      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8 mt-4">
        <div className="w-20 h-20 bg-accent/10 border border-accent/30 rounded-3xl flex items-center justify-center shadow-glow-green">
          <Users className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 tracking-tighter">
          Friends
        </h1>
        <p className="text-textMuted font-medium tracking-wide mt-2 px-4">Connect, compete on the 1v1 leaderboard, and grow wealth together.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 justify-center mb-8 bg-surfaceGlass p-2 rounded-2xl border border-white/5 mx-auto w-full md:max-w-fit">
        {(['leaderboard', 'requests', 'add'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative whitespace-nowrap ${
              activeTab === tab
                ? 'text-black bg-accent shadow-glow-green'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'leaderboard' ? '1v1 Rank' : tab === 'requests' ? 'Requests' : 'Add'}
            {tab === 'requests' && pendingRequestsForMe.length > 0 && (
              <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] rounded-full ${activeTab === tab ? 'bg-black text-accent' : 'bg-accent text-background'} font-black`}>
                {pendingRequestsForMe.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {leaderboard.length <= 1 ? (
              <div className="text-center py-12 bg-surfaceGlass border border-white/5 rounded-3xl">
                <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No friends yet</h3>
                <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto">Add some friends to start your 1v1 leaderboard competition!</p>
                <button 
                  onClick={() => setActiveTab('add')}
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors text-white"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              leaderboard.map((u, index) => {
                const rankColor = index === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                : index === 1 ? 'text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]'
                                : index === 2 ? 'text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]'
                                : 'text-white/60'

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={u.id}
                    className={`p-4 md:p-5 rounded-3xl flex items-center justify-between border backdrop-blur-xl transition-all duration-300
                      ${u.isCurrentUser
                        ? 'bg-accent/10 border-accent/40 shadow-glow-green scale-[1.02] z-10 relative'
                        : 'bg-surfaceGlass border-white/5 hover:border-white/10'
                      }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-black text-lg md:text-xl ${rankColor}`}>
                        {index === 0 ? <Flame className="w-6 h-6 md:w-8 md:h-8" /> :
                         index === 1 ? <Medal className="w-5 h-5 md:w-7 md:h-7" /> :
                         index === 2 ? <Star className="w-4 h-4 md:w-6 md:h-6" /> :
                         `#${index + 1}`}
                      </div>
                      <div>
                        <h3 className={`font-bold text-base md:text-lg tracking-wide flex items-center gap-2 ${u.isCurrentUser ? 'text-white' : 'text-white/80'}`}>
                          {u.name}
                          {u.isCurrentUser && <span className="text-[9px] md:text-[10px] ml-1 md:ml-2 font-black uppercase tracking-widest bg-accent text-background px-1.5 py-0.5 rounded-full">You</span>}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-400 mt-0.5">
                          <span>🔥 {u.streak || 0}</span>
                          <span>⚡ {u.total_xp || 0} XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black tracking-tight text-xl md:text-2xl ${u.isCurrentUser ? 'text-accent' : 'text-white'}`}>{u.money_score}</p>
                      <p className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">Points</p>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {pendingRequestsForMe.length === 0 ? (
              <div className="text-center py-12 bg-surfaceGlass border border-white/5 rounded-3xl">
                <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No pending requests</h3>
                <p className="text-white/50 text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-white/60 text-sm font-bold uppercase tracking-widest px-2">Pending Requests</h3>
                {pendingRequestsForMe.map((req) => (
                  <div key={req.id} className="p-4 rounded-3xl bg-surfaceGlass border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white tracking-wide">{req.name}</p>
                      <p className="text-xs text-white/50">{req.email}</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleRespond(req.id, 'accept')}
                         className="px-4 py-2 bg-accent/20 text-accent rounded-xl hover:bg-accent/30 hover:scale-105 transition-all font-bold text-sm"
                       >
                         Accept
                       </button>
                       <button 
                         onClick={() => handleRespond(req.id, 'decline')}
                         className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 hover:scale-105 transition-all"
                       >
                         <X className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'add' && (
          <motion.div
            key="add"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="bg-surfaceGlass border border-white/5 p-6 rounded-3xl">
              <h3 className="text-2xl font-black text-white mb-2">Add new friends</h3>
              <p className="text-white/50 text-sm mb-6">Enter an exact name or email to securely find your friends.</p>
              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter specific name or email..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <button 
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-accent text-background font-bold text-sm rounded-xl disabled:opacity-50 transition-opacity"
                >
                  {searching ? '...' : 'Search'}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {searchResults.length > 0 && (
                <h3 className="text-white/60 text-sm font-bold uppercase tracking-widest px-2">Results</h3>
              )}
              {searchResults.map((u) => {
                // Check if already friend / pending
                const existing = friends.find(f => f.friendId === u.id)
                return (
                  <div key={u.id} className="p-5 rounded-3xl bg-surfaceGlass border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg text-white tracking-wide">{u.name}</p>
                      <p className="text-sm text-white/40">{u.email}</p>
                    </div>
                    <div>
                      {existing ? (
                        <span className="text-xs font-bold uppercase tracking-widest text-[#00C896] bg-[#00C896]/10 px-4 py-2 rounded-xl">
                          {existing.status === 'pending' ? 'Pending' : 'Friends'}
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSendRequest(u.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-background hover:scale-105 rounded-xl text-sm font-black shadow-glow-green transition-all"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {searchResults.length === 0 && searchQuery && !searching && (
                 <p className="text-center text-white/40 text-sm py-8">No results found. Search requires an exact name or email match.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FriendsPage() {
  return (
    <ProGate>
      <FriendsDashboard />
    </ProGate>
  )
}
