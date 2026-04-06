import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to format currency
export function formatCurrency(amount: number, currencyCode: string = "USD") {
  const locales: Record<string, string> = {
    USD: "en-US",
    ILS: "he-IL",
    EUR: "de-DE",
    GBP: "en-GB"
  };
  
  return new Intl.NumberFormat(locales[currencyCode] || "en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}
