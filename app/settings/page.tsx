"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { LogOut, Save, Moon, User as UserIcon, ArrowLeft, RefreshCw, AlertTriangle, Crown, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { exportToCSV } from "@/lib/exportCSV";
import ProBadge from "@/components/ProBadge";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Ensure loading state is properly handled for auth
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // If no user, ensure we stop loading to prevent infinite spinner
    if (!user) {
      setPageLoading(false);
      return;
    }

    if (user) {
      supabase.from("users").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data);
          setName(data.name);
          setIsPro(data.is_pro || false);
        }
        setPageLoading(false);
      });
      supabase.from("transactions").select("*").eq("user_id", user.id).order("date", { ascending: false }).then(({ data }) => {
        if (data) setTransactions(data);
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);

    const { error } = await supabase.from("users").update({ name }).eq("id", user?.id);
    
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleResetAccount = async () => {
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(false);

    try {
      const res = await fetch('/api/reset-account', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset account');
      }

      setResetSuccess(true);
      setShowResetConfirm(false);
      // Refresh the profile to show 0 score
      const { data: updatedProfile } = await supabase.from("users").select("*").eq("id", user?.id).single();
      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsPro(updatedProfile.is_pro || false);
      }
      
      // Clear localStorage milestone
      if (user?.id) {
        localStorage.removeItem(`nw-milestone-${user.id}`);
      }

    } catch (err: any) {
      setResetError(err.message || 'An unexpected error occurred');
    } finally {
      setResetLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-textMuted text-sm mt-1">Manage your FinFlow account.</p>
      </div>

      <div className="bg-surface p-6 rounded-3xl border border-white/5 space-y-6">
        
        {/* Profile Card Summary */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-accent to-purpleAccent rounded-full flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-[#0A0C10] rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{profile?.name || "Loading..."}</h2>
              {isPro && <ProBadge size="md" />}
            </div>
            <p className="text-textMuted text-sm">{user?.email}</p>
          </div>
        </div>

        {isPro && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-white font-semibold text-sm">FinFlow Pro Member</p>
              <p className="text-gray-400 text-xs">All Pro features unlocked. $2.99/month</p>
            </div>
          </div>
        )}

        {!isPro && (
          <Link href="/upgrade" className="block bg-[#00C896]/10 border border-[#00C896]/30 rounded-2xl p-4 flex items-center gap-3 hover:bg-[#00C896]/20 transition-colors">
            <Crown className="w-6 h-6 text-[#00C896]" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Upgrade to Pro</p>
              <p className="text-gray-400 text-xs">Unlock 43 lessons, analytics, and more</p>
            </div>
            <span className="text-[#00C896] font-bold text-sm">$2.99/mo →</span>
          </Link>
        )}

        <hr className="border-white/5" />

        {/* Update Profile Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Profile</h3>
          {success && <div className="text-accent text-sm font-medium">Profile updated successfully.</div>}
          
          <div>
            <label className="block text-xs text-textMuted mb-1">Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0A0C10] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
            />
          </div>
          <button disabled={loading} type="submit" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <hr className="border-white/5" />

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Preferences</h3>
          
          <div className="flex justify-between items-center p-4 bg-[#0A0C10] rounded-2xl border border-white/5">
            <div className="flex gap-3 items-center">
              <Moon className="w-5 h-5 text-accent" />
              <div>
                <p className="text-white font-medium text-sm">Dark Mode</p>
                <p className="text-textMuted text-xs">FinFlow is dark by default.</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-accent rounded-full relative">
              <div className="w-4 h-4 bg-[#0A0C10] rounded-full absolute top-1 right-1 shadow-sm"></div>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        {isPro && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pro Features</h3>
            <button
              onClick={() => {
                const now = new Date()
                const month = now.toLocaleString('default', { month: 'long' }).toLowerCase()
                const year = now.getFullYear()
                exportToCSV(transactions, `finflow-all-transactions-${month}-${year}.csv`)
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#00C896]/10 hover:bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/20 py-3 rounded-xl transition-colors font-medium"
            >
              <Download className="w-4 h-4" /> Export All Transactions (CSV)
            </button>
          </div>
        )}

        <hr className="border-white/5" />

        {/* Danger Zone */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-danger uppercase tracking-wider">Danger Zone</h3>
          
          <div className="p-4 bg-danger/5 border border-danger/10 rounded-2xl">
             <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Reset Account</p>
                    <p className="text-textMuted text-xs">Delete all transactions, goals, progress and reset your Money Score to 0.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-danger/20 hover:bg-danger/30 text-danger border border-danger/20 py-2 rounded-xl transition-colors text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" /> Reset Account
                </button>
             </div>
          </div>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 py-3 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Reset Account?</h3>
            <p className="text-textMuted text-sm mb-6">
              This will permanently delete all your transactions, goals, lesson progress, and reset your Money Score to 0. This action cannot be undone.
            </p>
            
            {resetError && <div className="mb-4 text-danger text-sm bg-danger/10 p-3 rounded-lg">{resetError}</div>}
            {resetSuccess && <div className="mb-4 text-accent text-sm bg-accent/10 p-3 rounded-lg">Account reset successfully!</div>}

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowResetConfirm(false); setResetError(null); }}
                className="flex-1 px-4 py-2 rounded-xl text-white font-medium bg-white/5 hover:bg-white/10 transition-colors"
                disabled={resetLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleResetAccount}
                disabled={resetLoading}
                className="flex-1 px-4 py-2 rounded-xl text-white font-medium bg-danger hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resetLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {resetLoading ? "Resetting..." : "Yes, Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
