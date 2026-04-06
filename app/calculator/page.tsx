"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Zap, DollarSign, Calendar, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import ProGate from "@/components/ProGate";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function CalculatorPage() {
  return (
    <ProGate>
      <CalculatorContent />
    </ProGate>
  )
}

function CalculatorContent() {
  const router = useRouter();
  const { currency, convert } = useCurrency();
  const [principal, setPrincipal] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(100);
  const [rate, setRate] = useState(8); // annual %
  const [years, setYears] = useState(10);

  // Core compound interest engine
  const chartData = useMemo(() => {
    const data = [];
    const monthlyRate = rate / 100 / 12;
    let balance = principal;
    let totalContributed = principal;

    for (let year = 0; year <= years; year++) {
      if (year === 0) {
        data.push({
          year: `Yr 0`,
          balance: Math.round(balance),
          principal: Math.round(totalContributed),
          interest: 0,
        });
        continue;
      }
      // Compound 12 months
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
        totalContributed += monthlyContribution;
      }
      data.push({
        year: `Yr ${year}`,
        balance: Math.round(balance),
        principal: Math.round(totalContributed),
        interest: Math.round(balance - totalContributed),
      });
    }
    return data;
  }, [principal, monthlyContribution, rate, years]);

  const finalData = chartData[chartData.length - 1];
  const totalReturn = finalData ? finalData.interest : 0;
  const finalBalance = finalData ? finalData.balance : 0;
  const multiplier = finalBalance / (principal || 1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0C10]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl min-w-[180px]">
          <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mb-3">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-[11px] text-purple-400 font-bold">Interest</span>
              <span className="text-white font-black text-sm">{formatCurrency(convert(payload[0]?.value || 0), currency)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-[11px] text-white/40 font-bold">Invested</span>
              <span className="text-white/70 font-black text-sm">{formatCurrency(convert(payload[1]?.value || 0), currency)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const SliderInput = ({
    label, value, onChange, min, max, step, suffix, icon: Icon, color
  }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; step: number; suffix: string;
    icon: any; color: string;
  }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-white/50">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          {label}
        </label>
        <div className={`px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-black text-sm text-white tracking-tight`}>
          {typeof value === 'number' && value < 1000 ? value : value.toLocaleString()}{suffix}
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 appearance-none bg-white/5 border border-white/10 rounded-full outline-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/20"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.05) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.05) 100%)`
          }}
        />
      </div>
    </div>
  );

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
        <h1 className="text-3xl font-black text-white tracking-widest uppercase">Growth Engine</h1>
        <p className="text-xs text-white/50 font-bold tracking-[0.2em] mt-1 flex justify-center items-center gap-2">
          <Zap className="w-3 h-3 text-purpleAccent" /> Compound Interest Calculator
        </p>
      </div>

      {/* Stats Summary Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        <div className="bg-surfaceGlass backdrop-blur-2xl p-5 rounded-[28px] border border-white/5 shadow-xl text-center">
          <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mb-2">Final Balance</p>
          <p className="text-xl font-black text-white tracking-tighter leading-none">{formatCurrency(convert(finalBalance), currency)}</p>
        </div>
        <div className="bg-gradient-to-br from-accent/20 to-surfaceGlass backdrop-blur-2xl p-5 rounded-[28px] border border-accent/20 shadow-xl text-center">
          <p className="text-[9px] text-accent font-black uppercase tracking-[0.2em] mb-2">Total Return</p>
          <p className="text-xl font-black text-accent tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(0,230,118,0.5)]">+{formatCurrency(convert(totalReturn), currency)}</p>
        </div>
        <div className="bg-gradient-to-br from-purpleAccent/20 to-surfaceGlass backdrop-blur-2xl p-5 rounded-[28px] border border-purpleAccent/20 shadow-xl text-center">
          <p className="text-[9px] text-purpleAccent font-black uppercase tracking-[0.2em] mb-2">Multiplier</p>
          <p className="text-xl font-black text-white tracking-tighter leading-none">{multiplier.toFixed(1)}x</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
          className="lg:col-span-2 bg-surfaceGlass backdrop-blur-3xl p-6 md:p-8 rounded-[38px] border border-white/5 shadow-2xl space-y-8"
        >
          <div>
            <h3 className="text-white font-black text-lg mb-1 tracking-wide">Configure</h3>
            <p className="text-white/40 text-xs font-medium tracking-wide">Tune the variables to see how your money grows.</p>
          </div>

          {/* Number Inputs */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-white/50 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-accent" /> Initial Principal
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                className="w-full bg-black/40 border border-white/10 rounded-[18px] px-4 py-3.5 text-white font-black text-lg focus:outline-none focus:border-accent transition-colors tracking-tight"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-white/50 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-accent" /> Monthly Contribution
              </label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                className="w-full bg-black/40 border border-white/10 rounded-[18px] px-4 py-3.5 text-white font-black text-lg focus:outline-none focus:border-accent transition-colors tracking-tight"
                placeholder="100"
              />
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Sliders */}
          <div className="space-y-6">
            <SliderInput
              label="Annual Rate"
              value={rate}
              onChange={setRate}
              min={1} max={30} step={0.5}
              suffix="%" icon={Percent} color="text-purpleAccent"
            />
            <SliderInput
              label="Time Horizon"
              value={years}
              onChange={setYears}
              min={1} max={40} step={1}
              suffix=" yrs" icon={Calendar} color="text-blue-400"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-3">Quick Presets</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Starter", p: 500, m: 50, r: 7, y: 10 },
                { label: "Hustler", p: 2000, m: 200, r: 10, y: 15 },
                { label: "Investor", p: 10000, m: 500, r: 8, y: 30 },
                { label: "Aggressive", p: 5000, m: 300, r: 15, y: 20 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setPrincipal(preset.p);
                    setMonthlyContribution(preset.m);
                    setRate(preset.r);
                    setYears(preset.y);
                  }}
                  className="px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 text-[11px] font-black tracking-wider transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Chart Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
          className="lg:col-span-3 bg-surfaceGlass backdrop-blur-3xl p-6 md:p-8 rounded-[38px] border border-white/5 shadow-2xl"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-white font-black text-lg mb-1 tracking-wide">Growth Projection</h3>
              <p className="text-white/40 text-xs font-medium">Principal vs. Compounded Interest over {years} years</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purpleAccent" />
                <span className="text-[10px] text-white/50 font-bold tracking-wide">Interest</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-[10px] text-white/50 font-bold tracking-wide">Principal</span>
              </div>
            </div>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B388FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#B388FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis
                  dataKey="year"
                  stroke="#ffffff30"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  interval={Math.floor(years / 5)}
                />
                <YAxis
                  stroke="#ffffff30"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => {
                    const abs = Math.abs(v);
                    if (abs >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
                    if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
                    if (abs >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
                    return `$${v}`;
                  }}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff15', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="interest"
                  stackId="1"
                  stroke="#B388FF"
                  strokeWidth={2}
                  fill="url(#interestGradient)"
                  name="Interest Earned"
                />
                <Area
                  type="monotone"
                  dataKey="principal"
                  stackId="1"
                  stroke="#ffffff30"
                  strokeWidth={1.5}
                  fill="url(#principalGradient)"
                  name="Principal"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Insight bar */}
          <div className="mt-6 p-4 rounded-[24px] bg-gradient-to-r from-purpleAccent/10 to-accent/5 border border-purpleAccent/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purpleAccent/20 border border-purpleAccent/30 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-purpleAccent" />
              </div>
              <p className="text-sm text-white/80 font-medium leading-snug">
                Your money grows <span className="text-purpleAccent font-black">{multiplier.toFixed(1)}x</span> in {years} years.{" "}
                <span className="text-accent font-bold">{formatCurrency(convert(totalReturn), currency)}</span> earned purely from compound interest.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
