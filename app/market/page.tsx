"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Globe, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

// ────────────────────────────────────────
//  TradingView Widget Wrappers
// ────────────────────────────────────────

/** Generic TradingView script injector */
function TradingViewWidget({ config, id, className }: { config: object; id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Remove stale widget DOM
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [config]);

  return (
    <div className={`tradingview-widget-container ${className || ""}`} ref={ref} id={id}>
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
}

/** Ticker tape – thin scrolling ticker at the top */
function TickerTape() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "FOREXCOM:NSXUSD", title: "NASDAQ" },
        { proName: "FX_IDC:USDILS", title: "USD/ILS" },
        { proName: "FOREXCOM:EURUSD", title: "EUR/USD" },
        { proName: "TVC:GOLD", title: "Gold" },
        { proName: "TVC:SILVER", title: "Silver" },
        { proName: "CBOT:ZB1!", title: "US Bond" },
        { proName: "NASDAQ:AAPL", title: "Apple" },
        { proName: "NASDAQ:NVDA", title: "NVIDIA" },
        { proName: "NASDAQ:TSLA", title: "Tesla" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });
    container.appendChild(script);
    return () => { if(container) container.innerHTML = ""; };
  }, []);

  return <div ref={ref} className="tradingview-widget-container w-full" />;
}

/** Mini symbol overview — live 1-day view */
function MiniChart({ symbol, title }: { symbol: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      trendLineColor: "rgba(0, 230, 118, 1)",
      underLineColor: "rgba(0, 230, 118, 0.1)",
      underLineBottomColor: "rgba(0, 230, 118, 0)",
      largeChartUrl: "",
    });
    container.appendChild(script);
    return () => { if(container) container.innerHTML = ""; };
  }, [symbol]);

  return (
    <div ref={ref} className="tradingview-widget-container w-full h-full" />
  );
}

/** Full advanced chart for the main panel */
function AdvancedChart({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(10, 12, 16, 0)",
      gridColor: "rgba(255, 255, 255, 0.03)",
      allow_symbol_change: true,
      calendar: false,
      hide_side_toolbar: false,
      withdateranges: true,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });
    container.appendChild(script);
    return () => { if(container) container.innerHTML = ""; };
  }, [symbol]);

  return <div ref={ref} className="tradingview-widget-container w-full h-full" />;
}

/** Market Overview widget (Indices, Bonds, Forex, Commodities) */
function MarketOverview() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      width: "100%",
      height: "100%",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      tabs: [
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "NASDAQ" },
            { s: "FOREXCOM:DJI", d: "Dow Jones" },
            { s: "INDEX:NKY", d: "Nikkei 225" },
            { s: "INDEX:DEU40", d: "DAX" },
            { s: "FOREXCOM:UKXGBP", d: "FTSE 100" },
          ],
          originalTitle: "Indices",
        },
        {
          title: "Commodities",
          symbols: [
            { s: "CME_MINI:ES1!", d: "S&P 500 Futures" },
            { s: "NYMEX:CL1!", d: "Crude Oil" },
            { s: "NYMEX:NG1!", d: "Natural Gas" },
            { s: "TVC:GOLD", d: "Gold" },
            { s: "TVC:SILVER", d: "Silver" },
          ],
          originalTitle: "Commodities",
        },
        {
          title: "Bonds",
          symbols: [
            { s: "CBOT:ZB1!", d: "T-Bond" },
            { s: "CBOT:UB1!", d: "Ultra T-Bond" },
            { s: "EUREX:FGBL1!", d: "Euro Bund" },
            { s: "EUREX:FBTP1!", d: "Euro BTP" },
          ],
          originalTitle: "Bonds",
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX:EURUSD", d: "EUR/USD" },
            { s: "FX:GBPUSD", d: "GBP/USD" },
            { s: "FX:USDJPY", d: "USD/JPY" },
            { s: "FX_IDC:USDILS", d: "USD/ILS" },
            { s: "FX:USDCAD", d: "USD/CAD" },
          ],
          originalTitle: "Forex",
        },
      ],
    });
    container.appendChild(script);
    return () => { if(container) container.innerHTML = ""; };
  }, []);

  return <div ref={ref} className="tradingview-widget-container w-full h-full" />;
}

// ────────────────────────────────────────
//  Main Page
// ────────────────────────────────────────

const QUICK_TICKERS = [
  { symbol: "FOREXCOM:SPXUSD", label: "S&P 500", cat: "Index" },
  { symbol: "TVC:GOLD", label: "Gold", cat: "Commodity" },
  { symbol: "FX_IDC:USDILS", label: "USD/ILS", cat: "Forex" },
  { symbol: "NASDAQ:NVDA", label: "NVIDIA", cat: "Stock" },
  { symbol: "TVC:SILVER", label: "Silver", cat: "Commodity" },
  { symbol: "CBOT:ZB1!", label: "T-Bond", cat: "Bond" },
];

export default function MarketPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTicker, setActiveTicker] = useState("FOREXCOM:SPXUSD");
  const [customTicker, setCustomTicker] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no user, ensure we stop loading to prevent infinite spinner
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const itemVars = {
    hidden: { opacity: 0, y: 15, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 350, damping: 25 } },
  };

  return (
    <div className="p-4 pt-8 md:p-8 max-w-lg lg:max-w-7xl mx-auto pb-32 min-h-screen">
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group mb-8"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 hidden md:block" />
        <div className="text-center flex-1">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">Global Markets</h1>
          <p className="text-xs text-white/50 font-bold tracking-[0.2em] mt-1 flex justify-center items-center gap-2">
            <Globe className="w-3 h-3 text-blue-400" /> Live Data · Powered by TradingView
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
        </div>
      </div>

      {/* Ticker Tape */}
      <div className="mb-5 rounded-2xl overflow-hidden bg-surfaceGlass border border-white/5 shadow-lg">
        <TickerTape />
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-5">

        {/* Quick Symbol Picker */}
        <motion.div variants={itemVars}>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-3 pl-1">Quick Select</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TICKERS.map((t) => (
              <button
                key={t.symbol}
                onClick={() => setActiveTicker(t.symbol)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black tracking-wider transition-all duration-300 shadow-lg ${
                  activeTicker === t.symbol
                    ? "bg-blue-500/30 border border-blue-400/50 text-blue-300"
                    : "bg-surfaceGlass border border-white/10 text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-[9px] text-white/30">{t.cat}</span>
                {t.label}
              </button>
            ))}
            {/* Custom ticker input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customTicker.trim()) {
                  setActiveTicker(customTicker.trim().toUpperCase());
                  setCustomTicker("");
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value)}
                placeholder="Custom Ticker…"
                className="px-4 py-2.5 bg-surfaceGlass border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-blue-400/60 w-32 placeholder:text-white/20 tracking-wide"
              />
              <button type="submit" className="px-4 py-2.5 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-2xl text-xs font-black tracking-wider hover:bg-blue-500/30 transition-colors">
                GO
              </button>
            </form>
          </div>
        </motion.div>

        {/* Main Advanced Chart */}
        <motion.div variants={itemVars} className="bg-surfaceGlass backdrop-blur-3xl rounded-[38px] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-5 pb-0 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-1">Advanced Chart · Real-Time</p>
              <h2 className="text-white font-black text-xl tracking-wide">{activeTicker.split(":")[1] || activeTicker}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-black uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-blue-400 -ml-3.5" />
                LIVE
              </div>
            </div>
          </div>
          <div className="h-[450px] w-full p-2">
            <AdvancedChart symbol={activeTicker} />
          </div>
        </motion.div>

        {/* Bento Grid – Mini Charts */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_TICKERS.slice(0, 6).map((t) => (
            <motion.div
              variants={itemVars}
              key={t.symbol}
              onClick={() => setActiveTicker(t.symbol)}
              className={`bg-surfaceGlass backdrop-blur-3xl rounded-[32px] border shadow-xl overflow-hidden transition-all cursor-pointer h-[180px] ${
                activeTicker === t.symbol ? "border-blue-400/40 shadow-[0_0_30px_rgba(96,165,250,0.1)]" : "border-white/5 hover:border-white/20"
              }`}
            >
              <div className="px-4 pt-4 pb-0 flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{t.cat}</p>
                  <p className="text-white font-black text-sm tracking-wide">{t.label}</p>
                </div>
                {activeTicker === t.symbol && (
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                )}
              </div>
              <div className="h-[120px] w-full">
                <MiniChart symbol={t.symbol} title={t.label} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Market Overview Panel */}
        <motion.div variants={itemVars} className="bg-surfaceGlass backdrop-blur-3xl rounded-[38px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-6 pb-0">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Global Snapshot</p>
            <h3 className="text-white font-black text-lg tracking-wide">Market Overview</h3>
          </div>
          <div className="h-[450px] w-full">
            <MarketOverview />
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
