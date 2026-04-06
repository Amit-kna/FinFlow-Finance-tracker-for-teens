"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

const INCOME_OPTIONS = [
  "Part-time job",
  "Freelance",
  "Reselling",
  "Content creation",
  "Gifts/allowance",
  "Other",
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please sign in first.");
      return;
    }
    
    if (age === "" || age < 13 || age > 19) {
      setError("Age must be between 13 and 19.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: dbError } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email!,
      name,
      age: Number(age),
      income_sources: selectedSources,
    }, { onConflict: "id" });

    setLoading(false);

    if (dbError) {
      setError("Failed to save profile. " + dbError.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl shadow-xl border border-white/5">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Let's set you up</h1>
          <p className="text-textMuted text-sm">Tell us a bit about yourself to personalize FinFlow.</p>
        </div>

        {error && <div className="mb-4 text-danger text-sm bg-danger/10 p-3 rounded-lg">{error}</div>}

        <form onSubmit={handleComplete} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">What should we call you?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
              placeholder="First name or nickname"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">How old are you? (13-19)</label>
            <input
              type="number"
              min="13"
              max="19"
              value={age}
              onChange={(e) => setAge(Number(e.target.value) || "")}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
              placeholder="15"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">How do you make money? (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {INCOME_OPTIONS.map((source) => {
                const isSelected = selectedSources.includes(source);
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-accent/20 border-accent text-accent"
                        : "bg-[#0A0C10] border-white/10 text-textMuted hover:border-white/30"
                    }`}
                  >
                    {source}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accentDark text-black font-semibold py-3 rounded-xl transition-colors mt-8 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Start using FinFlow"}
          </button>
        </form>
      </div>
    </div>
  );
}
