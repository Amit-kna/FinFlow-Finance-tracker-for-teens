"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Plus, CheckCircle2, Target, Sparkles, ArrowLeft } from "lucide-react";
import { awardPoints } from "@/lib/points";
import { updateStreak } from "@/lib/streak";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "@/components/CurrencyProvider";
import { useRouter } from "next/navigation";

const INCOME_CATEGORIES = [
  "Part-time job",
  "Freelance/gig",
  "Reselling (eBay/Depop)",
  "Content creation",
  "Gift",
  "Allowance",
  "Other"
];

const INPUT_CURRENCIES = [
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "ILS", symbol: "₪", flag: "🇮🇱" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
];

type GoalDistribution = {
  name: string;
  emoji: string;
  amount: number;
};

export default function IncomePage() {
  const { user } = useAuth();
  const { currency, convert, rates } = useCurrency();
  const router = useRouter();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  // Form State
  const [amount, setAmount] = useState("");
  const [inputCurrency, setInputCurrency] = useState(currency);
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [goalDistributions, setGoalDistributions] = useState<GoalDistribution[]>([]);
  const [showDistribution, setShowDistribution] = useState(false);

  useEffect(() => {
    // If no user, ensure we stop loading to prevent infinite spinner
    if (!user) {
      setLoading(false);
      return;
    }

    if (user) fetchIncomes();
  }, [user]);

  // Sync input currency with global currency preference
  useEffect(() => {
    setInputCurrency(currency);
  }, [currency]);

  const fetchIncomes = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user?.id)
      .eq("type", "income")
      .order("date", { ascending: false });

    if (data) {
      setIncomes(data);
      const currentMonth = new Date().getMonth();
      const total = data
        .filter(d => new Date(d.date).getMonth() === currentMonth)
        .reduce((sum, item) => sum + Number(item.amount), 0);
      setMonthlyTotal(total);
    }
  };

  /** Convert user-entered amount to USD for consistent DB storage */
  const toUSD = (val: number, from: string): number => {
    if (from === "USD") return val;
    return val / (rates[from] || 1);
  };

  const selectedCurrencyMeta = INPUT_CURRENCIES.find(c => c.code === inputCurrency)!;

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    setLoading(true);
    setShowDistribution(false);

    const rawAmount = Number(amount);
    // Always store in USD in the database
    const incomeAmountUSD = toUSD(rawAmount, inputCurrency);

    // 1. Insert transaction (stored in USD)
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: user?.id,
      type: "income",
      amount: incomeAmountUSD,
      category,
      note: note ? `${note} (entered in ${inputCurrency})` : `Entered in ${inputCurrency}`,
      date
    });

    if (txError) {
      setErrorMsg(txError.message);
      setTimeout(() => setErrorMsg(""), 5000);
      setLoading(false);
      return;
    }

    // 2. Fetch all active (incomplete) goals and distribute funds proportionally
    const { data: activeGoals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user?.id)
      .eq("completed", false);

    const distributions: GoalDistribution[] = [];

    if (activeGoals && activeGoals.length > 0) {
      const goalsWithRemaining = activeGoals.map(g => ({
        ...g,
        remaining: Math.max(0, Number(g.target_amount) - Number(g.current_amount))
      })).filter(g => g.remaining > 0);

      if (goalsWithRemaining.length > 0) {
        const totalRemaining = goalsWithRemaining.reduce((sum, g) => sum + g.remaining, 0);

        const updates = goalsWithRemaining.map(goal => {
          const proportion = goal.remaining / totalRemaining;
          const allocated = Math.min(goal.remaining, incomeAmountUSD * proportion);
          const newAmount = Number(goal.current_amount) + allocated;
          const completed = newAmount >= Number(goal.target_amount);

          distributions.push({
            name: goal.name,
            emoji: goal.emoji,
            amount: allocated
          });

          return supabase
            .from("goals")
            .update({ current_amount: newAmount, completed })
            .eq("id", goal.id);
        });

        await Promise.all(updates);
      }
    }

    // 2.5. Update streak
    await updateStreak(user?.id || "");

    // 3. Award points
    const res = await awardPoints(user?.id || "", 2);
    const baseMsg = `Income Added! +2 Score.${res.bonusAwarded ? ` ${res.message}` : ""}`;
    setSuccessMsg(baseMsg);

    if (distributions.length > 0) {
      setGoalDistributions(distributions);
      setShowDistribution(true);
    }

    setAmount("");
    setNote("");
    setTimeout(() => {
      setSuccessMsg("");
      setShowDistribution(false);
    }, 8000);

    fetchIncomes();
    setLoading(false);
  };

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

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Income</h1>
        <p className="text-textMuted text-sm mt-1">Track everything you earn.</p>
      </div>

      <div className="bg-accent/10 border border-accent/20 p-6 rounded-3xl flex justify-between items-center">
        <div>
          <p className="text-accent text-sm font-medium">This Month</p>
          <h2 className="text-3xl font-black text-white">{formatCurrency(convert(monthlyTotal), currency)}</h2>
        </div>
      </div>

      {/* Add Income Form */}
      <div className="bg-surface p-6 rounded-3xl border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">Add Income</h3>

        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-accent/20 text-accent p-3 rounded-xl flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal distribution toast */}
        <AnimatePresence>
          {showDistribution && goalDistributions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 bg-purpleAccent/10 border border-purpleAccent/20 p-4 rounded-2xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purpleAccent" />
                <p className="text-purpleAccent font-black text-xs uppercase tracking-widest">Auto-distributed to Goals</p>
              </div>
              <div className="space-y-1.5">
                {goalDistributions.map((d, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm text-white/70">{d.emoji} {d.name}</span>
                    <span className="text-sm font-bold text-accent">+{formatCurrency(convert(d.amount), currency)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMsg && (
          <div className="mb-4 bg-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAddIncome} className="space-y-4">
          {/* Hidden Currency - Using Global Default */}
          <input type="hidden" value={inputCurrency} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-textMuted mb-1">
                Amount ({selectedCurrencyMeta.symbol})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-lg">
                  {selectedCurrencyMeta.symbol}
                </span>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
                  className="w-full bg-[#0A0C10] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-accent"
                  placeholder="0.00" />
              </div>
              {amount && inputCurrency !== "USD" && (
                <p className="text-[11px] text-white/30 mt-1 pl-1">
                  ≈ {formatCurrency(toUSD(Number(amount), inputCurrency))} USD
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-textMuted mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-textMuted mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent appearance-none">
              {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-textMuted mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
              placeholder="Sold old sneakers..." />
          </div>

          {/* Info badge about auto-distribution */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
            <Target className="w-4 h-4 text-purpleAccent shrink-0" />
            <p className="text-[11px] text-white/40 font-medium">Funds will be automatically distributed to your active goals proportionally.</p>
          </div>

          <button disabled={loading} type="submit" className="w-full relative flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 mt-4">
            <Plus className="w-5 h-5" />
            {loading ? "Adding..." : "Log Income"}
          </button>
        </form>
      </div>

      {/* History */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">History</h3>
        <div className="space-y-3">
          {incomes.map(inc => (
            <div key={inc.id} className="flex justify-between items-center bg-surface/50 p-4 rounded-2xl border border-white/5">
              <div>
                <p className="text-white font-medium text-sm">{inc.category}</p>
                <div className="flex items-center gap-2 text-textMuted text-xs mt-1">
                  <span>{new Date(inc.date).toLocaleDateString()}</span>
                  {inc.note && <span>• {inc.note}</span>}
                </div>
              </div>
              <div className="font-bold text-accent">+{formatCurrency(convert(Number(inc.amount)), currency)}</div>
            </div>
          ))}
          {incomes.length === 0 && <p className="text-center text-textMuted text-sm py-8">No income logs yet.</p>}
        </div>
      </div>
    </div>
  );
}
