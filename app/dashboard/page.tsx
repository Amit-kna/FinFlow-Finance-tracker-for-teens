"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Trophy, Plus, Search, Bell, Mic, Sparkles, Zap, Activity, Eye, EyeOff, Globe, LineChart, BarChart3, TrendingUp, DollarSign, BookOpen, Menu, Users, FileText, Download, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import { useCurrency } from "@/components/CurrencyProvider";
import { useNavigation } from "@/components/NavigationProvider";
import { awardPoints } from "@/lib/points";
import UpgradeModal from "@/components/UpgradeModal";
import StreakWidget from "@/components/StreakWidget";
import ProBadge from "@/components/ProBadge";


export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleSidebar } = useNavigation();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [nextNwMilestone, setNextNwMilestone] = useState(100);
  const [loading, setLoading] = useState(true);
  
  const { currency, setCurrency, convert } = useCurrency();
  const [milestoneCelebration, setMilestoneCelebration] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [proExpired, setProExpired] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  // Interaction states
  const [showNotifs, setShowNotifs] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideActivity, setHideActivity] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // If no user, ensure we stop loading to prevent infinite spinner
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      // Fetch Profile
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      // If the user has no profile, redirect to onboarding
      if (!userData) {
        router.push("/onboarding");
        return;
      }

      setProfile(userData);
      setIsPro(userData.is_pro || false);

      if (userData.is_pro) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status, expires_at')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (sub?.expires_at && new Date(sub.expires_at) < new Date()) {
          setProExpired(true)
          await supabase.from('users').update({ is_pro: false }).eq('id', user.id)
          setIsPro(false)
        }
      }

      // Fetch Recent Transactions
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5);

      // Fetch Notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (notifData) {
        setNotifications(notifData);
      }

      if (txData) {
        setTransactions(txData);
        let inc = 0, exp = 0;
        const { data: allTx } = await supabase.from("transactions").select("amount, type").eq("user_id", user.id);
        allTx?.forEach(t => {
          if (t.type === "income") inc += Number(t.amount);
          if (t.type === "expense") exp += Number(t.amount);
        });
        setStats({ income: inc, expenses: exp, balance: inc - exp });

        // Auto Net Worth Milestone Check
        const netWorth = inc - exp;
        const currentMilestone = Number(localStorage.getItem(`nw-milestone-${user.id}`) || "0");
        const nextMilestone = currentMilestone === 0 ? 100 : currentMilestone * 2;
        
        setNextNwMilestone(nextMilestone);

        // Only award points if netWorth meets or exceeds the next milestone
        // AND the next milestone is higher than what we've already achieved
        if (netWorth >= nextMilestone && nextMilestone > currentMilestone) {
           const milestoneReached = nextMilestone;
           const newTarget = milestoneReached * 2;
           
           // First save to localStorage to prevent double-awarding
           localStorage.setItem(`nw-milestone-${user.id}`, milestoneReached.toString());
           setNextNwMilestone(newTarget);
           
           // Then award points
           awardPoints(user.id, 50).then(async () => {
               setMilestoneCelebration(milestoneReached);
               
               // Insert notification
               const newNotif = {
                 user_id: user.id,
                 type: 'milestone',
                 title: 'Net Worth Milestone! 🏆',
                 message: `You hit ${formatCurrency(milestoneReached)}! +50 Pts.`,
                 read: false
               };
               const { data: inserted } = await supabase.from('notifications').insert(newNotif).select().single();
               if (inserted) {
                 setNotifications(prev => [inserted, ...prev]);
               }

               setTimeout(() => setMilestoneCelebration(null), 8000);
            });
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-full bg-accent/20 border border-accent/50 shadow-glow-green"
        />
      </div>
    );
  }

  const score = profile?.money_score || 0;
  const safeToSpend = Math.max(0, stats.balance - 150); // Holding $150 as a buffer

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotifications = async () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs && unreadCount > 0) {
      // Mark all as read in state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      // Mark all as read in DB
      await supabase.from("notifications").update({ read: true }).eq("user_id", user?.id).eq("read", false);
    }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };
  
  const itemVars = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 350, damping: 25 } }
  };

  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
    Math.abs(t.amount).toString().includes(searchQuery)
  );

  return (
    <div className="p-4 pt-8 md:p-8 max-w-lg lg:max-w-6xl mx-auto pb-32">

       {/* ── Net Worth Milestone Celebration Overlay ── */}
       <AnimatePresence>
         {milestoneCelebration !== null && (
           <motion.div
             initial={{ opacity: 0, scale: 0.8, y: 40 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 20 }}
             transition={{ type: "spring", stiffness: 350, damping: 25 }}
             className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
           >
             <div className="bg-gradient-to-br from-accent/30 to-surfaceGlass backdrop-blur-2xl border border-accent/40 rounded-[32px] p-6 shadow-[0_0_60px_rgba(0,230,118,0.3)] text-center">
               <div className="text-4xl mb-3">🏆</div>
               <p className="text-[10px] text-accent font-black uppercase tracking-[0.25em] mb-1">Net Worth Milestone!</p>
               <h3 className="text-white font-black text-2xl tracking-tight mb-1">{formatCurrency(milestoneCelebration)}</h3>
               <p className="text-white/60 text-sm font-medium">+50 Money Score awarded. Next goal: {formatCurrency(milestoneCelebration * 2)}</p>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
        {/* Top Nav (Glassmorphism Header) */}
        <div className="flex justify-between items-center mb-8 relative z-50">
           <div className="flex items-center gap-4">
             <button 
               onClick={toggleSidebar} 
               className="hidden md:flex w-10 h-10 rounded-full bg-surfaceGlass backdrop-blur-md border border-white/10 items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-lg"
             >
               <Menu className="w-5 h-5" />
             </button>
             <BrandLogo size="sm" showGlow={false} href="/" className="hidden md:block" />
             <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowScoreInfo(!showScoreInfo)}>
              <div className="w-12 h-12 rounded-full bg-surfaceGlass backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg hover:shadow-glow-purple transition-all duration-300 group-hover:bg-purpleAccent/10 group-hover:border-purpleAccent/50">
                 <span className="font-bold text-lg text-white">{(profile?.name || "U")[0].toUpperCase()}</span>
              </div>
              <div>
                 <div className="flex items-center gap-2">
                   <p className="text-[10px] text-purpleAccent uppercase tracking-[0.2em] font-black flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">Money Score <Trophy className="w-3 h-3"/></p>
                   {isPro && <ProBadge />}
                 </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className="text-white font-black text-xl leading-none tracking-tight">{score}</p>
                  <span className="text-white/40 font-bold text-xs uppercase">Pts</span>
                </div>
             </div>
             
              {showScoreInfo && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   className="absolute top-16 left-0 w-56 bg-surfaceGlass/90 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_0_40px_rgba(179,136,255,0.15)] z-50 pointer-events-auto"
                 >
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-3">Earn Points</p>
                    <ul className="text-xs text-white/80 space-y-2.5 font-medium">
                      <li className="flex justify-between items-center"><span>Log Transaction</span><span className="text-accent font-bold">+2</span></li>
                      <li className="flex justify-between items-center"><span>Hit Weekly Goal</span><span className="text-accent font-bold">+20</span></li>
                      <li className="flex justify-between items-center"><span>Net Worth Milestones</span><span className="text-accent font-bold">+50</span></li>
                    </ul>
                    <Link href="/learn" className="mt-4 block w-full text-center text-[10px] font-black tracking-widest uppercase text-purpleAccent border border-purpleAccent/30 bg-purpleAccent/5 py-2.5 rounded-xl hover:bg-purpleAccent/10 transition-colors">Level Up</Link>
                    <Link href="/settings" className="mt-2 block w-full text-center text-[10px] font-black tracking-widest uppercase text-white/60 border border-white/10 bg-white/5 py-2.5 rounded-xl hover:bg-white/10 transition-colors">Settings</Link>
                 </motion.div>
              )}
             </div>
             
             {/* Currency Selector – Desktop */}
             <div className="hidden md:flex items-center ml-4 bg-surfaceGlass border border-white/10 rounded-full px-1 py-1 shadow-lg">
                {["USD", "ILS", "EUR", "GBP"].map((c) => (
                   <button 
                      key={c}
                      onClick={(e) => { e.stopPropagation(); setCurrency(c); }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${currency === c ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                   >
                     {c}
                   </button>
                ))}
            </div>
          </div>
          <div className="flex gap-2 relative">
            <div className="relative">
              <button onClick={() => setShowSearch(!showSearch)} className="w-11 h-11 rounded-full bg-surfaceGlass backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-lg hover:shadow-glow-purple">
                 <Search className="w-4 h-4"/>
              </button>
              
              {showSearch && (
                 <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-14 right-0 w-[280px] bg-surfaceGlass/90 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl shadow-[0_0_40px_rgba(179,136,255,0.15)] z-50 pointer-events-auto"
                 >
                    <input 
                       type="text" 
                       placeholder="Search activity..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purpleAccent transition-colors placeholder:text-white/30 font-medium tracking-wide" 
                       autoFocus
                    />
                 </motion.div>
              )}
            </div>
            <div className="relative">
              <button onClick={handleOpenNotifications} className="w-11 h-11 rounded-full bg-surfaceGlass backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all relative shadow-lg hover:shadow-glow-purple group">
                 <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform"/>
                 {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full shadow-glow-green"></span>}
              </button>
              
              {showNotifs && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-14 right-0 w-[300px] max-h-[400px] overflow-y-auto bg-surfaceGlass/90 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_0_40px_rgba(179,136,255,0.15)] z-50 pointer-events-auto custom-scrollbar"
                >
                   <h3 className="text-sm font-bold text-white mb-4 border-b border-white/10 pb-2">Notifications</h3>
                   
                   {notifications.length === 0 ? (
                     <div className="text-center py-6">
                       <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 text-white/40 border border-white/5">
                          <Bell className="w-5 h-5"/>
                       </div>
                       <p className="text-xs text-white/50 font-medium tracking-wide">You're all caught up!</p>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       {notifications.map(notif => (
                         <div key={notif.id} className={`p-3 rounded-xl border ${notif.read ? 'bg-white/5 border-white/5' : 'bg-accent/10 border-accent/30'} flex gap-3 text-left`}>
                            <div className="mt-1 flex-shrink-0">
                               {notif.type === 'milestone' ? <Trophy className="w-4 h-4 text-accent drop-shadow-[0_0_5px_rgba(0,230,118,0.5)]" /> : <Sparkles className="w-4 h-4 text-purpleAccent" />}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-white mb-0.5">{notif.title}</p>
                               <p className="text-xs text-white/60 leading-relaxed">{notif.message}</p>
                            </div>
                         </div>
                       ))}
                     </div>
                   )}
                </motion.div>
              )}
            </div>
          </div>
       </div>

       {/* Currency Selector – Mobile (below header) */}
       <div className="flex md:hidden items-center mb-5 bg-surfaceGlass border border-white/10 rounded-full px-1 py-1 shadow-lg w-fit mx-auto">
          {["USD", "ILS", "EUR", "GBP"].map((c) => (
             <button
               key={c}
               onClick={() => setCurrency(c)}
               className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${currency === c ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
             >
               {c}
             </button>
          ))}
       </div>

       {proExpired && (
         <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 mb-4">
           <span className="text-xl">⚠️</span>
           <div className="flex-1">
             <p className="text-white font-semibold text-sm">Your Pro subscription expired</p>
             <p className="text-gray-400 text-xs">Renew to keep your streak freeze and full leaderboard access.</p>
           </div>
           <Link href="/upgrade" className="bg-[#00C896] text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#00b085] transition-colors whitespace-nowrap">
             Renew
           </Link>
         </div>
       )}

       {isPro && (
         <div className="mb-4">
           <StreakWidget />
         </div>
       )}

       {/* MODULAR BENTO GRID */}
       <motion.div 
         variants={containerVars} 
         initial="hidden" 
         animate="show" 
         className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 lg:gap-5 auto-rows-auto"
       >
         
         {/* 1. HERO CARD & SAFE TO SPEND METER (Double Height) */}
         <motion.div 
           variants={itemVars} 
           className="col-span-1 md:col-span-6 lg:col-span-6 lg:row-span-2 relative p-6 md:p-8 rounded-[38px] overflow-hidden bg-gradient-to-b from-surface/40 to-background/60 backdrop-blur-3xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group hover:border-accent/30 transition-all duration-700"
         >
            <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-accent/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-1000" />
            <div className="absolute -inset-[1px] bg-gradient-to-br from-white/10 to-transparent rounded-[38px] -z-10 opacity-50" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div>
                 <div className="flex justify-between items-center mb-6">
                    <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                       <Activity className="w-4 h-4 text-accent drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]" /> Total Balance
                    </p>
                    <div className="px-3 py-1 bg-white/5 text-[10px] font-black tracking-widest text-white/80 rounded-full border border-white/10">{currency}</div>
                 </div>
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-sm">
                   {formatCurrency(convert(stats.balance), currency)}
                 </h2>

                 {/* Net Worth Milestone Progress bar */}
                 <div className="mt-4 bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.15em] text-white/50">
                       <span>Next Milestone</span>
                       <span className="text-white/80">{formatCurrency(convert(nextNwMilestone), currency)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (stats.balance / nextNwMilestone) * 100)}%` }}
                          transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accentDark to-accent rounded-full shadow-[0_0_10px_rgba(0,230,118,0.5)]" 
                       />
                    </div>
                 </div>
               </div>

               <div className="mt-8 flex flex-col gap-6">
                 {/* Styled Safe-to-spend gauge */}
                 <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-[32px] border border-white/5 relative overflow-hidden group-hover:bg-white/10 transition-all duration-500">
                    <div className="flex justify-between items-end mb-4">
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-1">Safe to Spend</p>
                         <p className="text-3xl font-black text-accent drop-shadow-[0_0_15px_rgba(0,230,118,0.4)]">{formatCurrency(convert(safeToSpend), currency)}</p>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                         <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                       </div>
                    </div>
                    <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (safeToSpend / (stats.balance || 1)) * 100)}%` }}
                          transition={{ delay: 0.8, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accentDark via-accent to-white rounded-full shadow-[0_0_20px_rgba(0,230,118,0.5)]" 
                       />
                    </div>
                 </div>
                 
                 <div className="flex gap-3">
                   <Link href="/income" className="flex-1 flex items-center justify-center gap-2 py-4 bg-accent text-background font-black rounded-2xl transition-all hover:bg-white hover:shadow-glow-green text-sm tracking-wide">
                     <ArrowDownRight className="w-4 h-4"/> Add Funds
                   </Link>
                   <Link href="/expenses" className="flex-1 flex items-center justify-center gap-2 py-4 bg-surfaceGlass backdrop-blur-md rounded-2xl text-white font-bold transition-all border border-white/10 hover:bg-white/10 hover:border-white/20 text-sm tracking-wide shadow-lg">
                     <ArrowUpRight className="w-4 h-4 text-danger"/> Log Spent
                   </Link>
                 </div>
               </div>
            </div>
         </motion.div>

         {/* 2. COMPOUND INTEREST / FINANCIAL MATH (Top Right) */}
         <motion.div 
           variants={itemVars} 
           onClick={() => router.push("/calculator")}
           className="col-span-1 md:col-span-6 lg:col-span-6 relative p-6 md:p-8 rounded-[38px] overflow-hidden bg-gradient-to-br from-[#1a1528]/60 to-background/40 backdrop-blur-3xl border border-white/5 group shadow-2xl hover:shadow-glow-purple hover:border-purpleAccent/30 transition-all duration-700 flex flex-col justify-between min-h-[12rem] cursor-pointer"
         >
            <div className="absolute bottom-[-30%] left-[-10%] w-[70%] h-[70%] bg-purpleAccent/15 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex justify-between items-start mb-4">
                 <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purpleAccent" /> Growth Engine
                 </p>
                 <div className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 bg-surfaceGlass border-white/10 text-purpleAccent group-hover:bg-purpleAccent/20 group-hover:text-white shadow-lg">
                    <LineChart className="w-5 h-5" />
                 </div>
               </div>
               
               <div className="mt-4">
                 <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">Compound Calculator</h3>
                 <p className="text-sm text-white/60 font-medium">See how fast your money grows when you invest it instead of spending it.</p>
               </div>
            </div>
         </motion.div>

          {/* 3. LEADERBOARDS & COMPETITION */}
          <motion.div 
            variants={itemVars} 
            onClick={() => router.push('/leaderboard')}
            className="col-span-1 md:col-span-6 lg:col-span-6 p-6 rounded-[38px] bg-white/5 backdrop-blur-3xl border border-white/5 hover:border-white/20 transition-all duration-500 group cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[14rem] shadow-xl"
          >
             <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-accent/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-accent/15 transition-all duration-1000" />
             
             <div className="flex justify-between items-center mb-6 z-10 relative">
                <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em]">Leaderboard</p>
                <Trophy className="w-5 h-5 text-accent/60 drop-shadow-[0_0_8px_rgba(0,230,118,0.3)]" />
             </div>
             {/* Visual Podium */}
             <div className="flex items-end justify-center gap-3 mt-auto h-28 z-10 relative">
                <div className="w-1/3 flex flex-col items-center">
                  <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">#2</div>
                  <div className="w-full bg-surface border border-white/5 rounded-t-2xl h-[55%] flex items-start justify-center pt-3 shadow-inner">
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-[9px] flex items-center justify-center font-black text-white/50 tracking-wider">AJ</div>
                  </div>
                </div>
                <div className="w-1/3 flex flex-col items-center group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="text-accent text-[11px] font-black uppercase tracking-widest mb-1 drop-shadow-[0_0_8px_rgba(0,230,118,0.8)]">#1</div>
                  <div className="w-full bg-gradient-to-t from-background to-accent/10 border-t-2 border-accent/40 rounded-t-2xl h-[95%] flex items-start justify-center pt-3 shadow-[0_-5px_20px_rgba(0,230,118,0.1)]">
                    <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-accent/50 text-[11px] flex items-center justify-center font-black text-accent shadow-glow-green tracking-wider">ME</div>
                  </div>
                </div>
                <div className="w-1/3 flex flex-col items-center">
                  <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">#3</div>
                  <div className="w-full bg-surface border border-white/5 rounded-t-2xl h-[40%] flex items-start justify-center pt-3 shadow-inner">
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-[9px] flex items-center justify-center font-black text-white/50 tracking-wider">SK</div>
                  </div>
                </div>
             </div>
          </motion.div>

          {/* 3.5. GLOBAL MARKET & SUMMARY (New Grid Row elements) */}
          <motion.div 
            variants={itemVars} 
            onClick={() => router.push('/market')}
            className="col-span-1 md:col-span-6 lg:col-span-3 p-6 rounded-[38px] bg-gradient-to-br from-blue-900/10 to-surfaceGlass backdrop-blur-3xl border border-white/5 hover:border-blue-400/30 transition-all duration-500 group cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[14rem] shadow-xl"
          >
             <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-blue-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-blue-500/15 transition-all duration-1000" />
             <div className="flex justify-between items-start mb-4 z-10 relative">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Live Data</p>
                   <h3 className="text-white font-bold text-lg tracking-wide">Global Market</h3>
                </div>
                <Globe className="w-6 h-6 text-blue-400/80 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
             </div>
             <div className="mt-auto z-10">
                <div className="flex justify-between items-center text-xs font-bold text-white/70 mb-2"><span>S&P 500</span><span className="text-accent">+1.2%</span></div>
                <div className="flex justify-between items-center text-xs font-bold text-white/70"><span>USD/ILS</span><span className="text-accent">+0.4%</span></div>
             </div>
          </motion.div>

          <motion.div 
            variants={itemVars} 
            onClick={() => router.push('/summary')}
            className="col-span-1 md:col-span-6 lg:col-span-4 p-6 rounded-[38px] bg-surfaceGlass backdrop-blur-3xl border border-white/5 hover:border-white/20 transition-all duration-500 group cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[14rem] shadow-xl"
          >
             <div className="flex justify-between items-start mb-4 z-10 relative">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Analytics</p>
                   <h3 className="text-white font-bold text-lg tracking-wide">Summary</h3>
                </div>
                <BarChart3 className="w-5 h-5 text-white/60" />
             </div>
             <div className="mt-auto h-16 w-full opacity-60 group-hover:opacity-100 transition-opacity flex items-end justify-between gap-1">
                {[40, 70, 30, 80, 50, 90, 60].map((h, i) => (
                   <div key={i} className="w-full bg-white/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
             </div>
          </motion.div>

          {/* 4. LEARN / eLearning Bento Widget */}
          <motion.div 
            variants={itemVars} 
            onClick={() => router.push('/learn')}
            className="col-span-1 md:col-span-6 lg:col-span-4 p-6 rounded-[38px] bg-gradient-to-br from-purpleAccent/10 to-background/40 backdrop-blur-3xl border border-purpleAccent/10 hover:border-purpleAccent/40 transition-all duration-500 group cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[14rem] shadow-xl"
          >
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purpleAccent/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
            <div className="flex justify-between items-start z-10 relative">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purpleAccent mb-1">eLearning</p>
                  <h3 className="text-white font-bold text-lg tracking-wide">Financial IQ</h3>
               </div>
               <div className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 bg-purpleAccent/10 border-purpleAccent/20 text-purpleAccent group-hover:bg-purpleAccent/30 group-hover:scale-110 shadow-glow-purple">
                  <BookOpen className="w-5 h-5" />
               </div>
            </div>
            {/* Mini lesson preview list */}
            <div className="mt-4 space-y-2 z-10 relative">
               {["Compound Interest", "50/30/20 Rule", "Credit vs Debit"].map((title, i) => (
                 <div key={i} className="flex items-center gap-2.5 text-xs text-white/60 group-hover:text-white/80 transition-colors">
                   <div className="w-1.5 h-1.5 rounded-full bg-purpleAccent/60 shadow-[0_0_6px_rgba(179,136,255,0.8)]" />
                   {title}
                 </div>
               ))}
            </div>
            <div className="mt-4 flex items-center gap-2 z-10 relative">
               <span className="text-[10px] font-black uppercase tracking-[0.15em] text-purpleAccent/70 group-hover:text-purpleAccent transition-colors">Start Learning →</span>
            </div>
         </motion.div>

          {/* 5. GOALS TRACKER */}
          <motion.div 
            variants={itemVars} 
            onClick={() => router.push('/goals')}
            className="col-span-1 md:col-span-12 lg:col-span-5 p-6 rounded-[38px] bg-white/5 backdrop-blur-3xl border border-white/5 hover:border-purpleAccent/30 transition-all duration-500 relative overflow-hidden group cursor-pointer min-h-[14rem] shadow-xl"
          >
            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-purpleAccent/10 to-transparent pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-700" />
            <div className="flex justify-between items-start mb-4 z-10 relative">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purpleAccent mb-1">Track</p>
                  <h3 className="text-white font-bold text-lg tracking-wide">Goals</h3>
               </div>
               <div className="w-10 h-10 rounded-full bg-purpleAccent/10 border border-purpleAccent/20 flex items-center justify-center text-purpleAccent group-hover:scale-110 group-hover:bg-purpleAccent/20 transition-all shadow-glow-purple">
                  <Plus className="w-4 h-4"/>
               </div>
            </div>
            
            {/* Visual Mini Chart */}
            <div className="absolute bottom-0 left-0 right-0 h-20 w-full flex items-end justify-between px-6 pb-6 z-10">
               {[30, 50, 40, 75, 60, 95].map((h, i) => (
                 <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + (i * 0.1), duration: 0.6, type: "spring" }}
                    key={i} 
                    className="w-2 md:w-3 bg-gradient-to-t from-purpleAccent to-white/90 rounded-t-full shadow-glow-purple opacity-70 group-hover:opacity-100 transition-opacity" 
                 />
               ))}
            </div>
         </motion.div>



          {/* UPGRADE TO PRO CTA - FREE USERS ONLY */}
          {!isPro && (
            <motion.div 
              variants={itemVars} 
              onClick={() => router.push('/upgrade')}
              className="col-span-1 md:col-span-12 lg:col-span-12 relative p-6 md:p-8 rounded-[38px] overflow-hidden bg-gradient-to-r from-[#00C896]/10 via-[#00C896]/5 to-purpleAccent/10 backdrop-blur-3xl border border-[#00C896]/20 group shadow-2xl hover:border-[#00C896]/40 transition-all duration-700 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[10rem] cursor-pointer"
            >
               <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-[#00C896]/10 rounded-full blur-[80px] pointer-events-none" />
               <div className="flex items-center gap-4 z-10 relative">
                  <div className="w-16 h-16 rounded-2xl bg-[#00C896]/20 border border-[#00C896]/30 flex items-center justify-center shadow-glow-green">
                     <span className="text-3xl">👑</span>
                  </div>
                  <div>
                     <h3 className="text-2xl font-bold text-white tracking-wide">Unlock FinFlow Pro</h3>
                     <p className="text-sm text-white/60 font-medium mt-1">43 lessons, analytics, streaks, friends, and more — just .99/month</p>
                  </div>
               </div>
               <button className="z-10 relative bg-[#00C896] text-black font-bold px-8 py-4 rounded-2xl hover:bg-[#00b085] transition-colors text-lg shadow-[0_0_30px_rgba(0,200,150,0.3)] whitespace-nowrap">
                  Upgrade Now
               </button>
            </motion.div>
          )}

          {/* PRO FEATURES SECTION */}
          {isPro && (
            <>
              <motion.div 
                variants={itemVars} 
                onClick={() => router.push('/analytics')}
                className="col-span-1 md:col-span-6 lg:col-span-3 p-6 rounded-[38px] bg-gradient-to-br from-[#00C896]/10 to-surfaceGlass backdrop-blur-3xl border border-[#00C896]/20 hover:border-[#00C896]/40 transition-all duration-500 group cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[14rem] shadow-xl"
              >
                 <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[#00C896]/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-[#00C896]/15 transition-all duration-1000" />
                 <div className="flex justify-between items-start mb-4 z-10 relative">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C896]">Pro Feature</p>
                         <span className="text-[8px]">👑</span>
                       </div>
                       <h3 className="text-white font-bold text-lg tracking-wide">Analytics</h3>
                    </div>
                    <BarChart3 className="w-6 h-6 text-[#00C896]/80" />
                 </div>
                 <div className="mt-auto z-10">
                    <p className="text-xs text-white/60 font-medium">5 charts, goal projector, spending trends</p>
                 </div>
              </motion.div>

              <motion.div 
                variants={itemVars} 
                onClick={() => router.push('/friends')}
                className="col-span-1 md:col-span-6 lg:col-span-3 p-6 rounded-[38px] bg-gradient-to-br from-blue-500/10 to-surfaceGlass backdrop-blur-3xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 group cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[14rem] shadow-xl"
              >
                 <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-blue-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-blue-500/15 transition-all duration-1000" />
                 <div className="flex justify-between items-start mb-4 z-10 relative">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Pro Feature</p>
                         <span className="text-[8px]">👑</span>
                       </div>
                       <h3 className="text-white font-bold text-lg tracking-wide">Friends</h3>
                    </div>
                    <Users className="w-6 h-6 text-blue-400/80" />
                 </div>
                 <div className="mt-auto z-10">
                    <p className="text-xs text-white/60 font-medium">Challenges, goals, and competition</p>
                 </div>
              </motion.div>

              <motion.div 
                variants={itemVars} 
                onClick={() => router.push('/tax-calculator')}
                className="col-span-1 md:col-span-6 lg:col-span-3 p-6 rounded-[38px] bg-gradient-to-br from-yellow-500/10 to-surfaceGlass backdrop-blur-3xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-500 group cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[14rem] shadow-xl"
              >
                 <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-yellow-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-yellow-500/15 transition-all duration-1000" />
                 <div className="flex justify-between items-start mb-4 z-10 relative">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">Pro Feature</p>
                         <span className="text-[8px]">👑</span>
                       </div>
                       <h3 className="text-white font-bold text-lg tracking-wide">Tax Calculator</h3>
                    </div>
                    <FileText className="w-6 h-6 text-yellow-400/80" />
                 </div>
                 <div className="mt-auto z-10">
                    <p className="text-xs text-white/60 font-medium">US, UK, Israel support</p>
                 </div>
              </motion.div>

              <motion.div 
                variants={itemVars} 
                onClick={() => {
                  const now = new Date()
                  const month = now.toLocaleString('default', { month: 'long' }).toLowerCase()
                  const year = now.getFullYear()
                  fetch('/api/export-csv?month=' + month + '&year=' + year).then(r => r.blob()).then(blob => {
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'finflow-' + month + '-' + year + '.csv'
                    a.click()
                  }).catch(() => router.push('/settings'))
                }}
                className="col-span-1 md:col-span-6 lg:col-span-3 p-6 rounded-[38px] bg-gradient-to-br from-purple-500/10 to-surfaceGlass backdrop-blur-3xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 group cursor-pointer flex flex-col justify-between relative overflow-hidden min-h-[14rem] shadow-xl"
              >
                 <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-purple-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-1000" />
                 <div className="flex justify-between items-start mb-4 z-10 relative">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Pro Feature</p>
                         <span className="text-[8px]">👑</span>
                       </div>
                       <h3 className="text-white font-bold text-lg tracking-wide">Export Data</h3>
                    </div>
                    <Download className="w-6 h-6 text-purple-400/80" />
                 </div>
                 <div className="mt-auto z-10">
                    <p className="text-xs text-white/60 font-medium">Download transactions as CSV</p>
                 </div>
              </motion.div>
            </>
          )}

         {/* 5. RECENT ACTIVITY & SINGULARITY ACTION */}
         <motion.div variants={itemVars} className="col-span-1 md:col-span-12 lg:col-span-12 p-6 md:p-10 rounded-[38px] bg-white/[0.03] backdrop-blur-[40px] border border-white/5 mt-2 lg:mt-4 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[100%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
             <div>
               <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Action Center</p>
               <h3 className="text-white font-black text-2xl md:text-3xl tracking-tight leading-none">Your Moves</h3>
             </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setHideActivity(!hideActivity)} className="w-12 h-12 rounded-full bg-surfaceGlass backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-lg hover:border-white/20">
                  {hideActivity ? <EyeOff className="w-4 h-4 text-white/50" /> : <Eye className="w-4 h-4 text-white/50" />}
                </button>
              </div>
           </div>
           
           <div className="space-y-4">
             {hideActivity ? (
                <div className="text-center py-12 border border-white/5 rounded-3xl bg-black/20 backdrop-blur-md">
                  <EyeOff className="w-8 h-8 text-white/20 mb-3 mx-auto" />
                  <p className="text-sm font-bold tracking-wide text-white/50">History Hidden for Privacy</p>
                </div>
             ) : filteredTransactions.length === 0 ? (
               <div className="text-center py-12 border border-white/5 rounded-3xl bg-black/20 backdrop-blur-md">
                 <p className="text-base text-white/70 font-bold mb-1 tracking-wide">{searchQuery ? 'No results found.' : "No money moves yet."}</p>
                 {searchQuery && <p className="text-xs text-white/40 font-medium">Try a different search term.</p>}
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {filteredTransactions.slice(0, 4).map((tx, idx) => (
                   <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * idx, type: "spring", stiffness: 400, damping: 25 }}
                      key={tx.id} 
                      className="flex justify-between items-center p-5 bg-black/30 backdrop-blur-md border border-white/5 rounded-3xl hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group hover:-translate-y-1"
                   >
                      <div className="flex items-center gap-5">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${tx.type === 'income' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                            {tx.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                         </div>
                         <div>
                           <p className="text-base font-black text-white tracking-wide">{tx.category}</p>
                           <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mt-1">
                             {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </p>
                         </div>
                      </div>
                      <p className={`font-black text-xl tracking-tight ${tx.type === 'income' ? 'text-accent drop-shadow-[0_0_12px_rgba(0,230,118,0.4)]' : 'text-white'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                   </motion.div>
                 ))}
               </div>
             )}
             
             {!hideActivity && filteredTransactions.length > 0 && (
               <Link href="/transactions" className="mt-8 flex items-center justify-center w-full py-4 rounded-full border border-white/5 bg-transparent hover:bg-white/5 text-white/50 hover:text-white transition-colors text-[11px] font-black uppercase tracking-widest shadow-inner">
                 View Full Ledger
               </Link>
             )}
           </div>
         </motion.div>

       </motion.div>
    </div>
  );
}
