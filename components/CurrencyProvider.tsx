"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";

type CurrencyContextType = {
  currency: string;
  setCurrency: (c: string) => void;
  rates: Record<string, number>;
  convert: (amount: number, from?: string, to?: string) => number;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  rates: { USD: 1 },
  convert: (amount) => amount,
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        setRates(data.rates);
      } catch (error) {
        console.error("Failed to fetch exchange rates, using fallbacks.", error);
        setRates({ USD: 1, ILS: 3.75, EUR: 0.92, GBP: 0.79 });
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const loadCurrency = async () => {
      if (user) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from("users")
          .select("default_currency")
          .eq("id", user.id)
          .single();
        
        if (data && data.default_currency) {
          setCurrencyState(data.default_currency);
          localStorage.setItem("finflow-currency", data.default_currency);
        } else {
          // Fallback to localStorage or default
          const saved = localStorage.getItem("finflow-currency");
          if (saved) setCurrencyState(saved);
        }
      } else {
        // Guest mode
        const saved = localStorage.getItem("finflow-currency");
        if (saved) setCurrencyState(saved);
      }
    };

    loadCurrency();
  }, [user]);

  const handleSetCurrency = async (c: string) => {
    setCurrencyState(c);
    localStorage.setItem("finflow-currency", c);

    if (user) {
      await supabase
        .from("users")
        .update({ default_currency: c })
        .eq("id", user.id);
    }
  };

  const convert = (amount: number, from = "USD", to = currency) => {
    if (from === to) return amount;
    const baseAmount = amount / (rates[from] || 1);
    return baseAmount * (rates[to] || 1);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, rates, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
