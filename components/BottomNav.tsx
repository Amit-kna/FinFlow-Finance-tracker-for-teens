"use client";

import { Home, PlusCircle, PieChart, Target, BookOpen, Settings, MoreHorizontal, ChevronUp, BarChart3, Trophy, Users, FileText, Calculator } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("users").select("is_pro").eq("id", user.id).single().then(({ data }) => {
      if (data?.is_pro) setIsPro(true);
    });
  }, [user]);

  if (pathname === "/" || pathname === "/auth" || pathname === "/onboarding") return null;

  const freeNavItems = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Income", icon: PlusCircle, href: "/income" },
    { label: "Spend", icon: PieChart, href: "/expenses" },
    { label: "Goals", icon: Target, href: "/goals" },
    { label: "Learn", icon: BookOpen, href: "/learn" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const proNavItems = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Income", icon: PlusCircle, href: "/income" },
    { label: "Goals", icon: Target, href: "/goals" },
    { label: "Learn", icon: BookOpen, href: "/learn" },
    { label: "More", icon: MoreHorizontal, href: "#more" },
  ];

  const moreItems = [
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
    { label: "Friends", icon: Users, href: "/friends" },
    { label: "Tax Calculator", icon: FileText, href: "/tax-calculator" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const navItems = isPro ? proNavItems : freeNavItems;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 md:hidden">
        <div className="glass-card flex justify-between items-center px-4 py-3 rounded-[32px] border border-white/10 shadow-2xl">
          {navItems.map((item) => {
            if (item.href === "#more") {
              return (
                <button
                  key="more"
                  onClick={() => setShowMore(!showMore)}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 p-2 transition-all duration-300",
                    showMore ? "text-accent" : "text-textMuted hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 z-10 transition-transform duration-300", showMore && "scale-110")} strokeWidth={showMore ? 2.5 : 2} />
                  <span className={cn("text-[8px] font-black tracking-wider uppercase", showMore ? "text-accent" : "text-textMuted/60")}>
                    {item.label}
                  </span>
                  {showMore && (
                    <div className="absolute inset-0 bg-accent/15 blur-md rounded-full -z-0" />
                  )}
                </button>
              );
            }
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 p-2 transition-all duration-300",
                  isActive ? "text-accent" : "text-textMuted hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 z-10 transition-transform duration-300", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn("text-[8px] font-black tracking-wider uppercase", isActive ? "text-accent" : "text-textMuted/60")}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute inset-0 bg-accent/15 blur-md rounded-full -z-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showMore && isPro && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 md:hidden"
            >
              <div className="bg-[#0D1117] border border-white/10 rounded-3xl p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-bold text-sm">More</span>
                  <button onClick={() => setShowMore(false)} className="text-gray-400 hover:text-white">
                    <ChevronUp className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {moreItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
