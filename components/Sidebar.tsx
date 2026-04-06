"use client";

import { useState, useEffect } from "react";
import { Home, PlusCircle, PieChart, Target, BookOpen, Settings, X, Globe, BarChart3, Trophy, Users, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("users").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data);
          setIsPro(data.is_pro || false);
        }
      });
    }
  }, [user]);

  const logoGradient: React.CSSProperties = {
    background: "linear-gradient(135deg, #00FF88 0%, #FFFFFF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const userInitial = profile?.name ? profile.name[0].toUpperCase() : "?";

  const baseNavItems = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Income", icon: PlusCircle, href: "/income" },
    { label: "Spend", icon: PieChart, href: "/expenses" },
    { label: "Goals", icon: Target, href: "/goals" },
    { label: "Learn", icon: BookOpen, href: "/learn" },
    { label: "Market", icon: Globe, href: "/market" },
  ];

  const proNavItems = [
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
    { label: "Friends", icon: Users, href: "/friends" },
    { label: "Tax Calculator", icon: FileText, href: "/tax-calculator" },
  ];

  const navItems = [...baseNavItems, ...(isPro ? proNavItems : []), { label: "Settings", icon: Settings, href: "/settings" }];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-72 bg-surface/95 backdrop-blur-2xl border-r border-white/10 z-50 p-6 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surfaceGlass border border-white/10 flex items-center justify-center">
                  <span className="text-accent font-black text-lg">{userInitial}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-xl tracking-tight" style={logoGradient}>FinFlow</span>
                  {isPro && <span className="text-[8px]">👑</span>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300",
                      isActive 
                        ? "bg-accent/10 text-accent border border-accent/20" 
                        : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-white/40 text-xs font-medium">Teen Finance Tracker</p>
                <p className="text-white/20 text-[10px] mt-1">v2.0.0 Pro</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
