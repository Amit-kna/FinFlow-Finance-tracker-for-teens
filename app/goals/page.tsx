"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Plus, Target, CheckCircle2, Trophy, RotateCcw, Trash2, ArrowLeft } from "lucide-react";
import { awardPoints } from "@/lib/points";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/components/CurrencyProvider";

export default function GoalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { currency, convert } = useCurrency();
  const [goals, setGoals] = useState<any[]>([]);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎮");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Contribute State
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contribution, setContribution] = useState("");
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // If no user, ensure we stop loading to prevent infinite spinner
    if (!user) {
      setLoading(false);
      return;
    }

    if (user) fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    setGoals(data || []);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAmount) return;
    setLoading(true);

    // Convert user input to USD for storage
    const targetAmountUSD = convert(Number(targetAmount), currency, "USD");

    const { error } = await supabase.from("goals").insert({
      user_id: user?.id,
      name,
      emoji,
      target_amount: targetAmountUSD,
      target_date: targetDate || null
    });

    if (!error) {
      setIsCreating(false);
      setName("");
      setTargetAmount("");
      setTargetDate("");
      fetchGoals();
    } else {
      setErrorMsg(error.message);
      setTimeout(() => setErrorMsg(""), 5000);
    }
    setLoading(false);
  };

  const handleContribute = async (e: React.FormEvent, goal: any) => {
    e.preventDefault();
    if (!contribution || isNaN(Number(contribution))) return;
    setLoading(true);

    // Convert contribution to USD for storage
    const contributionUSD = convert(Number(contribution), currency, "USD");
    
    const newAmount = Number(goal.current_amount) + contributionUSD;
    const completed = newAmount >= Number(goal.target_amount);

    const { error } = await supabase
      .from("goals")
      .update({ current_amount: newAmount, completed })
      .eq("id", goal.id);

    if (!error) {
      if (completed && !goal.completed) {
        setCelebratingId(goal.id);
        await awardPoints(user?.id || "", 20);
        setTimeout(() => setCelebratingId(null), 5000);
      } else {
        const res = await awardPoints(user?.id || "", 2);
        if (res.bonusAwarded) {
          setSuccessMsg(res.message || "Rank UP!");
          setTimeout(() => setSuccessMsg(""), 5000);
        }
      }

      setContributeGoalId(null);
      setContribution("");
      fetchGoals();
    } else {
      setErrorMsg(error.message);
      setTimeout(() => setErrorMsg(""), 5000);
    }
    setLoading(false);
  };

  /**
   * Reset a completed goal back to default (current_amount = 0, completed = false).
   * The net-worth milestone system in dashboard.tsx handles awarding points automatically —
   * this just resets the personal goal so the user can shoot for it again.
   */
  const handleResetGoal = async (goal: any) => {
    setLoading(true);
    const { error } = await supabase
      .from("goals")
      .update({ current_amount: 0, completed: false })
      .eq("id", goal.id);

    if (!error) {
      setSuccessMsg(`${goal.emoji} ${goal.name} reset! Shoot for it again!`);
      setTimeout(() => setSuccessMsg(""), 5000);
      fetchGoals();
    } else {
      setErrorMsg(error.message);
      setTimeout(() => setErrorMsg(""), 5000);
    }
    setLoading(false);
  };

  const handleDeleteGoal = async (goal: any) => {
    setLoading(true);
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goal.id);

    if (!error) {
      setSuccessMsg(`${goal.emoji} ${goal.name} deleted!`);
      setTimeout(() => setSuccessMsg(""), 5000);
      fetchGoals();
    } else {
      setErrorMsg(error.message);
      setTimeout(() => setErrorMsg(""), 5000);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 pt-8 md:p-8 max-w-2xl mx-auto space-y-8 pb-32">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Savings Goals</h1>
          <p className="text-textMuted text-sm mt-1">Eye on the prize.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-accent/20 text-accent px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-accent/30 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-accent/20 text-accent p-3 rounded-xl flex items-center gap-2 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {errorMsg && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Create New Goal Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            className="bg-surface p-6 rounded-3xl border border-white/5"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" /> Create a Goal
            </h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs text-textMuted mb-1">Emoji</label>
                  <input type="text" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} required
                    className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-center text-xl focus:outline-none focus:border-accent" />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-textMuted mb-1">Goal Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                    placeholder="New Sneakers..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-textMuted mb-1">Target Amount ({currency})</label>
                  <input type="number" step="0.01" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required
                    className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                    placeholder={`0.00`} />
                </div>
                <div>
                  <label className="block text-xs text-textMuted mb-1">Target Date (Opt)</label>
                  <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                    className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-accent text-black font-semibold py-3 rounded-xl hover:bg-accentDark transition-colors disabled:opacity-50 mt-4">
                {loading ? "Saving..." : "Start Saving Goal"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      <div className="space-y-6">
        {goals.map(goal => {
          const percent = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
          const isComplete = goal.completed || percent >= 100;

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              key={goal.id}
              className="bg-gradient-to-br from-surface to-[#111318] p-6 rounded-3xl border border-white/5 relative overflow-hidden shadow-xl"
            >
              {/* Celebration overlay */}
              {celebratingId === goal.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-accent/20 flex flex-col items-center justify-center z-10"
                >
                  <span className="text-5xl mb-2">🎉</span>
                  <h3 className="text-white font-bold text-xl">Goal Reached!</h3>
                  <p className="text-accent text-sm font-medium">+20 Money Score</p>
                  <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/30 rounded-xl">
                    <Trophy className="w-4 h-4 text-accent" />
                    <p className="text-xs text-white font-bold">Hit Reset to challenge yourself again!</p>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                    {goal.emoji}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{goal.name}</h3>
                    <p className="text-textMuted text-xs mt-0.5">Target: {formatCurrency(convert(Number(goal.target_amount), "USD", currency), currency)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <div className="text-accent text-xs font-bold uppercase tracking-wider bg-accent/10 px-2 py-1 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white font-medium">{formatCurrency(convert(Number(goal.current_amount), "USD", currency), currency)} saved</span>
                  <span className="text-textMuted">{Math.round(percent)}%</span>
                </div>
                <div className="w-full bg-[#0A0C10] h-3 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full transition-all ${isComplete ? 'bg-gradient-to-r from-accent to-white' : 'bg-accent'}`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 border-t border-white/5 pt-4">
                {isComplete ? (
                  // Reset or delete completed goal
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResetGoal(goal)}
                      disabled={loading}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/5 transition-colors flex items-center justify-center gap-2 hover:text-white"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset & Go Again
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal)}
                      disabled={loading}
                      title="Delete completed goal"
                      className="py-3 px-4 rounded-xl border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors flex items-center justify-center hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : contributeGoalId === goal.id ? (
                  <form onSubmit={(e) => handleContribute(e, goal)} className="flex gap-2">
                    <input
                      type="number" step="0.01" value={contribution} onChange={e => setContribution(e.target.value)} required autoFocus
                      className="flex-1 bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent"
                      placeholder="Amount to add..."
                    />
                    <button disabled={loading} type="submit" className="bg-accent text-black font-semibold px-4 rounded-xl hover:bg-accentDark">
                      Add
                    </button>
                    <button type="button" onClick={() => setContributeGoalId(null)} className="text-textMuted px-2 text-xs">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setContributeGoalId(goal.id)}
                    className="w-full py-3 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
                  >
                    + Add to Goal
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && !isCreating && (
          <div className="text-center py-12 px-6 bg-surface/30 rounded-3xl border border-white/5">
            <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-1">No goals yet!</h3>
            <p className="text-textMuted text-sm">Setting savings goals is the best way to build wealth.</p>
          </div>
        )}
      </div>

    </div>
  );
}
