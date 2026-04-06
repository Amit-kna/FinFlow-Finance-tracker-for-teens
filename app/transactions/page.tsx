"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { ArrowDownRight, ArrowUpRight, Search, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (data) setTransactions(data);
      setLoading(false);
    };

    fetchTransactions();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="w-16 h-16 rounded-full bg-accent/20 border border-accent/50 shadow-glow-green" />
      </div>
    );
  }

  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
    Math.abs(t.amount).toString().includes(searchQuery)
  );

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-24">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>
      <div className="flex flex-col space-y-4 mb-4">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 tracking-tighter">
          Full Ledger
        </h1>
        <p className="text-textMuted font-medium tracking-wide mt-2">All your money moves in one place.</p>
        
        <div className="relative w-full mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input 
            type="text" 
            placeholder="Search category, note, or amount..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surfaceGlass/50 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-purpleAccent transition-colors placeholder:text-white/30 font-medium tracking-wide shadow-lg" 
          />
        </div>
      </div>

      <div className="space-y-4 mt-8">
         {filteredTransactions.length === 0 ? (
           <div className="text-center py-12 border border-white/5 rounded-3xl bg-surfaceGlass backdrop-blur-md">
             <p className="text-base text-white/70 font-bold mb-1 tracking-wide">{searchQuery ? 'No results found.' : "No record of transactions."}</p>
           </div>
         ) : (
           filteredTransactions.map((tx, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: Math.min(idx * 0.05, 1) }}
               key={tx.id} 
               className="flex justify-between items-center p-5 bg-surfaceGlass backdrop-blur-md border border-white/5 rounded-3xl hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group"
             >
                <div className="flex items-center gap-5">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${tx.type === 'income' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                      {tx.type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                   </div>
                   <div>
                     <p className="text-lg font-black text-white tracking-wide">{tx.category}</p>
                     <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase">
                          {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {tx.note && <span className="text-[10px] text-white/40 font-bold tracking-widest uppercase truncate max-w-[120px]">• {tx.note}</span>}
                     </div>
                   </div>
                </div>
                <p className={`font-black text-xl md:text-2xl tracking-tight ${tx.type === 'income' ? 'text-accent drop-shadow-[0_0_12px_rgba(0,230,118,0.4)]' : 'text-white'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
             </motion.div>
           ))
         )}
      </div>
    </div>
  );
}
