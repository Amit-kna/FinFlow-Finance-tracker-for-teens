"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  /** When set, wraps the logo in a Next.js Link */
  href?: string;
  onClick?: () => void;
}

const logoGradient: React.CSSProperties = {
  background: "linear-gradient(135deg, #00FF88 0%, #FFFFFF 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function BrandLogo({ className, size = "md", showGlow = true, href, onClick }: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-2xl md:text-3xl",
    md: "text-4xl md:text-5xl",
    lg: "text-6xl md:text-7xl",
    xl: "text-7xl md:text-8xl",
  };

  const inner = (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "relative group select-none",
        (href || onClick) ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      {showGlow && (
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 group-hover:bg-accent/30 transition-all duration-700 opacity-50" />
      )}
      <p className={cn(
        "relative z-10 font-black tracking-tighter drop-shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-transform duration-500 group-hover:scale-[1.03]",
        sizeClasses[size]
      )} style={logoGradient}>
        FinFlow
      </p>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
