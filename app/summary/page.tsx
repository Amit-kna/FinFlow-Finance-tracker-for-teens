"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

// Hardcoded because recharts Cell fill doesn't resolve CSS custom properties
const COLOR_PROFIT = "#00E676";
const COLOR_LOSS = "#FF3B30";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, TrendingUp, TrendingDown, DollarSign,
  BarChart3, Activity, Calendar, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCurrency } from "@/components/CurrencyProvider";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  AreaChart, Area
} from "recharts";

type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  note?: string;
};

type MonthData = {
  id: string;       // "2026-03"
  label: string;    // "Mar 2026"
  shortLabel: string; // "Mar"
  income: number;
  expenses: number;
  profit: number;
  transactions: Transaction[];
};

type YearData = {
  year: number;
  months: MonthData[];
  totalIncome: number;
  totalExpenses: number;
  totalProfit: number;
};

export default function SummaryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { currency, convert } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Navigation state
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [activeMonthId, setActiveMonthId] = useState<string | null>(null); // null = show year summary

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }
    const fetchData = async () => {
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (txData) setTransactions(txData);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Group all transactions by year > month
  const yearMap = useMemo(() => {
    const grouped: Record<number, Record<string, MonthData>> = {};

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const year = date.getFullYear();
      const monthStr = (date.getMonth() + 1).toString().padStart(2, "0");
      const id = `${year}-${monthStr}`;
      const label = date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
      const shortLabel = date.toLocaleDateString(undefined, { month: "short" });

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][id]) {
        grouped[year][id] = { id, label, shortLabel, income: 0, expenses: 0, profit: 0, transactions: [] };
      }

      const amount = Number(tx.amount);
      if (tx.type === "income") {
        grouped[year][id].income += amount;
        grouped[year][id].profit += amount;
      } else {
        grouped[year][id].expenses += amount;
        grouped[year][id].profit -= amount;
      }
      grouped[year][id].transactions.push(tx);
    });

    // Convert to sorted arrays
    const result: Record<number, YearData> = {};
    for (const [yr, months] of Object.entries(grouped)) {
      const year = Number(yr);
      const monthArr = Object.values(months).sort((a, b) => a.id.localeCompare(b.id));
      result[year] = {
        year,
        months: monthArr,
        totalIncome: monthArr.reduce((s, m) => s + m.income, 0),
        totalExpenses: monthArr.reduce((s, m) => s + m.expenses, 0),
        totalProfit: monthArr.reduce((s, m) => s + m.profit, 0),
      };
    }
    return result;
  }, [transactions]);

  const availableYears = useMemo(
    () => Object.keys(yearMap).map(Number).sort((a, b) => b - a),
    [yearMap]
  );

  // Default active year to the most recent one with data
  useEffect(() => {
    if (availableYears.length > 0 && !yearMap[activeYear]) {
      setActiveYear(availableYears[0]);
    }
  }, [availableYears, activeYear, yearMap]);

  const currentYearData = yearMap[activeYear];
  const activeMonthData = activeMonthId
    ? currentYearData?.months.find(m => m.id === activeMonthId)
    : null;

  // Chart data for this year
  const yearChartData = useMemo(() => {
    if (!currentYearData) return [];
    return currentYearData.months.map(m => ({
      name: m.shortLabel,
      profit: convert(m.profit),
      income: convert(m.income),
      expenses: convert(m.expenses),
      rawProfit: m.profit,
      id: m.id,
    }));
  }, [currentYearData, convert]);

  // All-time chart
  const allTimeChartData = useMemo(() => {
    return availableYears
      .slice()
      .reverse()
      .map(yr => {
        const yd = yearMap[yr];
        return {
          name: String(yr),
          profit: convert(yd.totalProfit),
          income: convert(yd.totalIncome),
          expenses: convert(yd.totalExpenses),
          rawProfit: yd.totalProfit,
        };
      });
  }, [availableYears, yearMap, convert]);

  const allTimeIncome = Object.values(yearMap).reduce((s, y) => s + y.totalIncome, 0);
  const allTimeExpenses = Object.values(yearMap).reduce((s, y) => s + y.totalExpenses, 0);
  const allTimeProfit = allTimeIncome - allTimeExpenses;

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

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isProfit = payload[0].payload.rawProfit >= 0;
      return (
        <div className="bg-[#0A0C10]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[160px]">
          <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mb-2">{label}</p>
          <p className={`text-xl font-black tracking-tighter ${isProfit ? "text-accent" : "text-danger"}`}>
            {isProfit ? "+" : ""}{formatCurrency(payload[0].value, currency)}
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-white/40">Income</span>
              <span className="text-white/70 font-bold">{formatCurrency(payload[0].payload.income, currency)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-white/40">Spent</span>
              <span className="text-white/70 font-bold">{formatCurrency(payload[0].payload.expenses, currency)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 pt-8 md:p-8 max-w-lg lg:max-w-5xl mx-auto pb-32 min-h-screen">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group mb-8"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-white tracking-widest uppercase">Summary</h1>
        <p className="text-xs text-white/50 font-bold tracking-[0.2em] mt-1 flex justify-center items-center gap-2">
          <BarChart3 className="w-3 h-3 text-purpleAccent" /> Financial Ledger
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-24">
          <BarChart3 className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/40 font-bold text-lg">No transactions yet.</p>
          <p className="text-white/20 text-sm mt-1">Log income or expenses to see your summary.</p>
        </div>
      ) : (
        <>
          {/* ── All-Time Totals ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {[
              { label: "All-Time Income", value: allTimeIncome, color: "text-accent", glow: "bg-accent/10 border-accent/20" },
              { label: "All-Time Spent", value: allTimeExpenses, color: "text-danger", glow: "bg-danger/10 border-danger/20" },
              { label: "Net Profit", value: allTimeProfit, color: allTimeProfit >= 0 ? "text-accent" : "text-danger", glow: "bg-purpleAccent/10 border-purpleAccent/20" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.glow} border backdrop-blur-2xl p-4 rounded-[28px] shadow-xl text-center`}>
                <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.15em] mb-2">{stat.label}</p>
                <p className={`text-lg font-black tracking-tighter leading-none ${stat.color}`}>
                  {formatCurrency(convert(stat.value), currency)}
                </p>
              </div>
            ))}
          </motion.div>

          {/* ── Year Selector ── */}
          <div className="flex items-center justify-between mb-5 bg-surfaceGlass border border-white/5 rounded-[24px] p-3 shadow-lg">
            <button
              onClick={() => {
                const idx = availableYears.indexOf(activeYear);
                if (idx < availableYears.length - 1) {
                  setActiveYear(availableYears[idx + 1]);
                  setActiveMonthId(null);
                }
              }}
              disabled={availableYears.indexOf(activeYear) >= availableYears.length - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Selected Year</p>
              <p className="text-2xl font-black text-white tracking-tight">{activeYear}</p>
            </div>

            <button
              onClick={() => {
                const idx = availableYears.indexOf(activeYear);
                if (idx > 0) {
                  setActiveYear(availableYears[idx - 1]);
                  setActiveMonthId(null);
                }
              }}
              disabled={availableYears.indexOf(activeYear) <= 0}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* ── Month Tabs for active year ── */}
          {currentYearData ? (
            <>
              <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
                <button
                  onClick={() => setActiveMonthId(null)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-[11px] font-black tracking-[0.15em] transition-all shadow-lg ${
                    !activeMonthId
                      ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                      : "bg-surfaceGlass border border-white/10 text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {activeYear} OVERVIEW
                </button>
                {currentYearData.months.map(month => {
                  const isProfit = month.profit >= 0;
                  return (
                    <button
                      key={month.id}
                      onClick={() => setActiveMonthId(month.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[11px] font-black tracking-[0.15em] transition-all shadow-lg ${
                        activeMonthId === month.id
                          ? isProfit
                            ? "bg-accent text-black shadow-[0_0_20px_rgba(0,230,118,0.4)]"
                            : "bg-danger text-white shadow-[0_0_20px_rgba(255,68,68,0.4)]"
                          : "bg-surfaceGlass border border-white/10 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isProfit ? "bg-accent" : "bg-danger"} ${activeMonthId === month.id ? "bg-current opacity-60" : ""}`} />
                      {month.shortLabel.toUpperCase()}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {/* ── Year Overview ── */}
                {!activeMonthId && (
                  <motion.div
                    key={`year-${activeYear}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="space-y-5"
                  >
                    {/* Year Stat Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Income", value: currentYearData.totalIncome, color: "text-accent" },
                        { label: "Spent", value: currentYearData.totalExpenses, color: "text-danger" },
                        {
                          label: "Net Profit",
                          value: currentYearData.totalProfit,
                          color: currentYearData.totalProfit >= 0 ? "text-accent" : "text-danger"
                        },
                      ].map(s => (
                        <div key={s.label} className="bg-surfaceGlass backdrop-blur-2xl p-4 rounded-[24px] border border-white/5 shadow-xl text-center">
                          <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.15em] mb-2">{s.label}</p>
                          <p className={`text-base font-black tracking-tighter ${s.color}`}>
                            {formatCurrency(convert(s.value), currency)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Month-by-Month Bar Chart */}
                    <div className="bg-surfaceGlass backdrop-blur-2xl p-6 md:p-8 rounded-[38px] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                      <h3 className="text-white/80 font-bold text-sm tracking-widest uppercase mb-2 ml-2">Monthly P&L — {activeYear}</h3>
                      <p className="text-white/30 text-xs ml-2 mb-8">Click a bar to drill into that month.</p>
                      <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={yearChartData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            onClick={(data) => {
                              if (data?.activePayload?.[0]) {
                                setActiveMonthId(data.activePayload[0].payload.id);
                              }
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${Math.abs(v / 1000).toFixed(0)}k`} width={40} />
                            <ReferenceLine y={0} stroke="#ffffff20" strokeDasharray="4 4" />
                            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#ffffff05" }} />
                            <Bar dataKey="profit" radius={[6, 6, 6, 6]} maxBarSize={48} className="cursor-pointer">
                              {yearChartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.rawProfit >= 0 ? COLOR_PROFIT : COLOR_LOSS}
                                  opacity={activeMonthId && activeMonthId !== entry.id ? 0.3 : 1}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Color legend */}
                      <div className="flex items-center gap-6 mt-4 justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-accent" />
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Profit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-danger" />
                          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Loss</span>
                        </div>
                      </div>
                    </div>

                    {/* All-Time Yearly Chart (only if >1 year exists) */}
                    {availableYears.length > 1 && (
                      <div className="bg-surfaceGlass backdrop-blur-2xl p-6 md:p-8 rounded-[38px] border border-white/5 shadow-xl">
                        <h3 className="text-white/80 font-bold text-sm tracking-widest uppercase mb-8 ml-2">Year-over-Year Performance</h3>
                        <div className="h-[220px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={allTimeChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                              <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                              <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${Math.abs(v / 1000).toFixed(0)}k`} width={40} />
                              <ReferenceLine y={0} stroke="#ffffff20" strokeDasharray="4 4" />
                              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#ffffff05" }} />
                              <Bar dataKey="profit" radius={[6, 6, 6, 6]} maxBarSize={56}>
                                {allTimeChartData.map((entry, index) => (
                                  <Cell
                                    key={`yoy-${index}`}
                                    fill={entry.rawProfit >= 0 ? COLOR_PROFIT : COLOR_LOSS}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Month Detail ── */}
                {activeMonthId && activeMonthData && (
                  <motion.div
                    key={activeMonthId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="space-y-5"
                  >
                    {/* Month Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surfaceGlass backdrop-blur-2xl p-6 rounded-[32px] border border-white/5 shadow-xl text-center relative overflow-hidden">
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[40px] pointer-events-none" />
                        <TrendingUp className="w-6 h-6 text-accent mx-auto mb-3 drop-shadow-[0_0_10px_rgba(0,230,118,0.5)]" />
                        <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-1">Income</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(convert(activeMonthData.income), currency)}</p>
                      </div>
                      <div className="bg-surfaceGlass backdrop-blur-2xl p-6 rounded-[32px] border border-white/5 shadow-xl text-center relative overflow-hidden">
                        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-danger/20 rounded-full blur-[40px] pointer-events-none" />
                        <TrendingDown className="w-6 h-6 text-danger mx-auto mb-3 drop-shadow-[0_0_10px_rgba(255,68,68,0.5)]" />
                        <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-1">Spent</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(convert(activeMonthData.expenses), currency)}</p>
                      </div>
                    </div>

                    {/* Net result card */}
                    <div className={`p-5 rounded-[32px] border flex justify-between items-center ${activeMonthData.profit >= 0 ? "bg-accent/10 border-accent/20" : "bg-danger/10 border-danger/20"}`}>
                      <div>
                        <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-1">Net Result — {activeMonthData.label}</p>
                        <p className={`text-3xl font-black tracking-tighter ${activeMonthData.profit >= 0 ? "text-accent drop-shadow-[0_0_15px_rgba(0,230,118,0.4)]" : "text-danger drop-shadow-[0_0_15px_rgba(255,68,68,0.4)]"}`}>
                          {activeMonthData.profit >= 0 ? "+" : ""}{formatCurrency(convert(activeMonthData.profit), currency)}
                        </p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeMonthData.profit >= 0 ? "bg-accent/20" : "bg-danger/20"}`}>
                        {activeMonthData.profit >= 0
                          ? <TrendingUp className="w-6 h-6 text-accent" />
                          : <TrendingDown className="w-6 h-6 text-danger" />
                        }
                      </div>
                    </div>

                    {/* Transaction List */}
                    <div className="bg-white/5 backdrop-blur-3xl p-6 md:p-8 rounded-[38px] border border-white/5 shadow-2xl">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Transactions</p>
                      <div className="space-y-3">
                        {activeMonthData.transactions.length === 0 ? (
                          <p className="text-center text-white/30 text-sm py-8">No transactions this month.</p>
                        ) : (
                          activeMonthData.transactions.map((tx) => (
                            <div key={tx.id} className="flex justify-between items-center p-4 bg-black/40 rounded-3xl border border-white/5">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${tx.type === "income" ? "bg-accent/10 text-accent border border-accent/20" : "bg-white/5 text-white/60 border border-white/10"}`}>
                                  <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-white tracking-wide">{tx.category}</p>
                                  {tx.note && <p className="text-[10px] text-white/30 font-medium mt-0.5">{tx.note}</p>}
                                  <p className="text-[9px] text-white/30 font-bold tracking-[0.1em] uppercase mt-1">
                                    {new Date(tx.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                  </p>
                                </div>
                              </div>
                              <p className={`font-black text-lg tracking-tight ${tx.type === "income" ? "text-accent drop-shadow-[0_0_8px_rgba(0,230,118,0.4)]" : "text-white"}`}>
                                {tx.type === "income" ? "+" : "-"}{formatCurrency(convert(tx.amount), currency)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-bold">No data for {activeYear}.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
