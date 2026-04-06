"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────── */
/*  Inline styles that can't be expressed with Tailwind */
/* ─────────────────────────────────────────────────── */
const logoGradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #00FF88 0%, #FFFFFF 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const textGradientPrimary: React.CSSProperties = {
  background: "linear-gradient(135deg, #a4ffb9 0%, #00fd87 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0e0f]">
        <div className="text-[#a4ffb9] font-bold text-lg animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#0c0e0f",
        color: "#f6f6f7",
        fontFamily: "'Inter', 'Manrope', sans-serif",
        /* subtle purple/green ambient glow */
        backgroundImage:
          "radial-gradient(circle at 50% -10%, rgba(193,128,255,0.07) 0%, transparent 60%)," +
          "radial-gradient(circle at 85% 40%, rgba(0,230,118,0.05) 0%, transparent 50%)",
      }}
    >
      {/* ───────── TOP NAV ───────── */}
      <nav
        className="fixed top-0 w-full z-50"
        style={{
          backgroundColor: "rgba(12,14,15,0.80)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 8px 32px 0 rgba(193,128,255,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div
            className="text-[26px] font-black tracking-tighter"
            style={logoGradientStyle}
          >
            FinFlow
          </div>

          {/* Nav CTA */}
          <Link
            href="/auth"
            id="nav-signup-btn"
            className="font-bold px-6 py-2.5 rounded-full transition-all duration-300 text-sm"
            style={{
              backgroundColor: "#00fd87",
              color: "#004621",
              boxShadow: "0 0 15px rgba(0,253,135,0.30)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 25px rgba(0,253,135,0.45)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 15px rgba(0,253,135,0.30)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ───────── MAIN ───────── */}
      <main className="pt-32 pb-24">

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-6 mb-32 relative text-center">
          {/* ambient blob */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full -z-10"
            style={{
              background: "rgba(193,128,255,0.06)",
              filter: "blur(120px)",
            }}
          />

          <div className="mb-16">
            <span
              className="text-[#a4ffb9] tracking-widest uppercase text-sm mb-4 block font-semibold"
              style={{ letterSpacing: "0.2em" }}
            >
              BUILT FOR TEENS · FREE · NO BANK NEEDED
            </span>

            <h1
              className="font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-6"
              style={{ lineHeight: 1.08 }}
            >
              Master Your Money.
              <br />
              <span style={textGradientPrimary}>Own Your Future.</span>
            </h1>

            <p className="text-[#aaabac] text-lg md:text-xl max-w-2xl mx-auto mb-4">
              The money app built for teens, by a teen.
            </p>

            <div className="text-[#f6f6f7] text-lg font-medium mb-10">
              Your Money, Your Rules.
            </div>

            {/* Hero CTA */}
            <div className="max-w-md mx-auto">
              <Link
                href="/auth"
                id="hero-signup-btn"
                className="block w-full px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
                style={{
                  backgroundColor: "#00fd87",
                  color: "#004621",
                  boxShadow: "0 0 20px rgba(0,253,135,0.30)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 0 35px rgba(0,253,135,0.50)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 0 20px rgba(0,253,135,0.30)";
                }}
              >
                Sign Up
              </Link>
              <p className="mt-4 text-[#aaabac] text-sm">
                Join 500+ teens already tracking their money — free forever.
              </p>
            </div>
          </div>

          {/* Hero Mockup images */}
          <div className="relative grid grid-cols-12 gap-6 items-center">
            {/* Main dashboard mockup */}
            <div className="col-span-12 md:col-span-8 group relative">
              <div
                className="absolute -inset-1 rounded-xl opacity-20 group-hover:opacity-40 transition duration-1000"
                style={{
                  background:
                    "linear-gradient(135deg, #a4ffb9, #c180ff)",
                  filter: "blur(8px)",
                }}
              />
              <img
                alt="Futuristic financial dashboard UI mockup"
                className="relative rounded-xl w-full"
                style={{ border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVsMUIBbHcQY-rgu2M_5jg9B6CxRA-5aUJNVtW7eKiY6NIBHsESFIzP_3PYCCeMbTY77D5pd7vkNCyrQlldUkwPiaSBgwkd6CN0nD-8prqnuzOp2bwgsLXiMzM0L3LtsLyfKVRiIiSTcv_BjJP9jr-AYpRSF_SeGXrG_ilAlaPXQyg8AFBKzof5GTwlBH5On7HbTqmqdA8ynCTAOBBS-Ozl6ODyE3rYiVoEe3x34GFvFZPwp9Cem2uuoHSBMVH_z7TgyWC7EptxKjo"
              />
            </div>
            {/* Mobile mockup */}
            <div className="hidden md:block col-span-4 translate-y-12">
              <img
                alt="Mobile app UI showing crypto portfolio balances"
                className="rounded-xl w-full"
                style={{
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 0 15px rgba(164,255,185,0.1), inset 0 0 1px rgba(164,255,185,0.2), 0 25px 50px rgba(0,0,0,0.6)",
                }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpKCgctnAha77k8L2qweY1KxvTkKy-l9WzN2zKNliknS1i8V6OXcIQsLUc5lL291i6fziraU5fU49M4A7crDIe7WOCbq3rRFYFnLe9HgnqaFJrC06LHXdNGM_2KTRUGqdcJ64QY8w3X7R2Ra_cD5ZzPKTjX55VJhCOAQZ95b-GSC7xEFqDO3lAYRHPPq2ESWqrG3ZV8sk7tBOd2M93pRRvFT6u83BzYsLZz3-QJfulROw3LfmwbGP1I6BiOQqHX9kTVBA5aSiHGWub"
              />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="mb-12">
            <h2 className="font-bold text-4xl mb-4">Up and running in 2 minutes.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "🙋", step: "Step 1", desc: "Create your free account. No bank details needed." },
              { emoji: "💰", step: "Step 2", desc: "Log your income and spending in seconds." },
              { emoji: "📈", step: "Step 3", desc: "Watch your Money Score grow as you build better habits." },
            ].map(({ emoji, step, desc }) => (
              <div
                key={step}
                className="rounded-xl p-8 flex flex-col justify-between transition-colors duration-200 hover:bg-[#1d2021]"
                style={{
                  background: "rgba(35,38,40,0.40)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <div className="text-4xl mb-6">{emoji}</div>
                <h3 className="font-bold text-xl mb-3">{step}</h3>
                <p className="text-[#aaabac] text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BENTO FEATURE GRID ── */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="mb-12">
            <h2 className="font-bold text-4xl mb-4">Command Your Assets</h2>
            <p className="text-[#aaabac]">Everything you need to track your money in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">

            {/* Expense Tracking */}
            <div
              className="md:col-span-2 lg:col-span-3 rounded-xl p-8 flex flex-col justify-between group hover:bg-[#1d2021] transition-colors duration-200"
              style={{ background: "rgba(35,38,40,0.40)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ background: "rgba(164,255,185,0.10)" }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#a4ffb9" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-2xl mb-2">Expense Tracking</h3>
                <p className="text-[#aaabac] text-sm">Log what you earn — jobs, reselling, TikTok, gifts — in seconds.</p>
              </div>
              <div className="mt-8 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black">$1,240</span>
                  <span className="text-[#a4ffb9] text-sm mb-1.5 font-semibold">+12%</span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#232628" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: "65%", background: "linear-gradient(90deg, #a4ffb9, #00fd87)" }}
                  />
                </div>
              </div>
            </div>

            {/* Savings Goals */}
            <div
              className="md:col-span-2 lg:col-span-3 rounded-xl p-8 group hover:bg-[#1d2021] transition-colors duration-200 relative overflow-hidden"
              style={{ background: "rgba(35,38,40,0.40)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-2xl"
                  style={{ background: "rgba(193,128,255,0.10)" }}
                >
                  🎯
                </div>
                <h3 className="font-bold text-2xl mb-2">Savings Goals</h3>
                <p className="text-[#aaabac] text-sm">Set savings goals and watch your progress grow visually.</p>
              </div>
              <div className="absolute bottom-0 right-0 w-1/2 opacity-20">
                <img
                  alt="Abstract 3D digital wireframe"
                  className="object-cover h-full"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqgUEuh2ocMD3Xhw4wfNzVjol2VsbAUfuF-luCu1ZydkaAZ55FTtA-MZFckZyqG9o76iBNksH0OBq_owKofPhQzTrS3i6UOLuADqkaG_am6xMzDjaYtQs4v26t9n3Fr-Fdv7PF4iI0wO_LHvheDPbwikLKmnDliOF3xtLkEHfqZK9uPEfXOSRGAGkpU37knTAfLcvVc-FPKJs6jYHAqTpchp9zaIndVe1OGlCUHA7TYGRlhclyhPkkG-KpgWYsWYGPxQOtIyi4LA6Z"
                />
              </div>
            </div>

            {/* Saved This Month */}
            <div
              className="md:col-span-2 lg:col-span-2 rounded-xl p-6 flex flex-col justify-center items-center text-center"
              style={{ background: "rgba(35,38,40,0.40)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(0,253,135,0.12)" }}
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#a4ffb9" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs uppercase tracking-widest text-[#aaabac] font-semibold">SAVED THIS MONTH</span>
              <span className="font-black text-3xl mt-1 text-[#a4ffb9]">$340.00</span>
            </div>

            {/* Growth Goals */}
            <div
              className="md:col-span-2 lg:col-span-2 rounded-xl p-6"
              style={{
                background: "rgba(35,38,40,0.40)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderLeft: "4px solid rgba(193,128,255,0.40)",
              }}
            >
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#c180ff]" fill="none" viewBox="0 0 24 24" stroke="#c180ff" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                </svg>
                Growth Goals
              </h4>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <span className="text-sm">Emergency Fund</span>
                  <span className="text-xs text-[#c180ff] font-semibold">88%</span>
                </li>
                <li className="flex justify-between items-center opacity-60">
                  <span className="text-sm">Retirement Alpha</span>
                  <span className="text-xs text-[#c180ff] font-semibold">24%</span>
                </li>
              </ul>
            </div>

            {/* Interest Engine */}
            <div
              className="md:col-span-4 lg:col-span-2 rounded-xl p-6"
              style={{ background: "linear-gradient(135deg, #171a1b, #1d2021)" }}
            >
              <h4 className="font-bold mb-2">Interest Engine</h4>
              <p className="text-xs text-[#aaabac] mb-4">Calculate your exponential future.</p>
              <div className="space-y-3">
                <div
                  className="h-10 flex items-center px-3 rounded"
                  style={{ background: "#000000", border: "1px solid rgba(70,72,73,0.40)" }}
                >
                  <span className="text-xs text-[#aaabac] opacity-70">$</span>
                  <span className="ml-2 text-sm">10,000</span>
                </div>
                <button
                  className="w-full py-2 font-bold rounded-lg text-sm text-white transition-all duration-200 hover:brightness-110"
                  style={{ background: "#6f00be" }}
                >
                  Calculate
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ── KNOWLEDGE TERMINAL ── */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div
            className="rounded-[2rem] overflow-hidden relative flex items-stretch min-h-[800px] lg:min-h-[900px]"
            style={{ background: "#111415" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full">
              {/* Left: content */}
              <div className="p-12 lg:p-24 flex flex-col justify-center relative z-10">
                <span
                  className="uppercase text-sm mb-6 block font-semibold tracking-[0.3em]"
                  style={{ color: "#c180ff" }}
                >
                  Knowledge Terminal
                </span>
                <h2
                  className="font-extrabold text-5xl md:text-7xl lg:text-8xl mb-10 tracking-tighter"
                  style={{ lineHeight: 1.05 }}
                >
                  Learn money skills in 5 minutes.
                </h2>
                <p className="text-[#aaabac] text-xl md:text-2xl mb-16 leading-relaxed max-w-xl">
                  Short, plain-English lessons on budgeting, saving, tax basics, and investing — written for teens, not bankers.
                </p>
                <div className="grid grid-cols-1 gap-y-10">
                  {[
                    "The Magic of Compound Interest",
                    "The 50/30/20 Budgeting Rule",
                    "Taxes and First Jobs",
                    "Setting S.M.A.R.T Goals",
                    "Credit Cards vs. Debit Cards",
                    "Emergency Funds",
                  ].map((lesson) => (
                    <div key={lesson} className="flex items-center gap-6 group cursor-pointer">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#a4ffb9]/20 transition-all duration-300"
                        style={{ background: "#232628" }}
                      >
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#a4ffb9" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-bold text-xl md:text-2xl group-hover:text-[#a4ffb9] transition-colors duration-200">
                        {lesson}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: image */}
              <div className="relative min-h-[400px] lg:min-h-full overflow-hidden">
                <img
                  alt="Futuristic server room"
                  className="absolute inset-0 w-full h-full object-cover scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmFhAjhgstSJ0h206gY59X3T1miajs1eYlL9KoF_B5gQnW3T7iFaeDaGmDVQsCkPEA9i6GydowWmq6KujiSgIFCF1DHjsMb4iKCa0gcuCwgsHU-xz-pOQ1h9neJR57ay6c3X4AFzQtd1TKZXqg_IQ6WfnZ6MK4nmKwTybXg0zJyFw4DY7petm65R81HN9Bm0QkR-nLQFULFmRExR4B3riCEdPv0znFTVNrSANH2RK-FaIUAL6oMHgWrVfPdo0uAzPaWDgDDUEIUV-8"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, #111415 0%, rgba(17,20,21,0.60) 40%, transparent 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="max-w-2xl mx-auto px-6 mb-16 text-center">
          <h2
            className="font-black text-4xl md:text-5xl tracking-tighter mb-6"
            style={{ lineHeight: 1.1 }}
          >
            Ready to own your financial future?
          </h2>
          <p className="text-[#aaabac] text-lg mb-10">
            Join hundreds of teens already building wealth — completely free.
          </p>
          <Link
            href="/auth"
            id="footer-signup-btn"
            className="inline-flex items-center justify-center gap-2 px-12 py-4 rounded-full font-bold text-lg transition-all duration-300"
            style={{
              backgroundColor: "#00fd87",
              color: "#004621",
              boxShadow: "0 0 25px rgba(0,253,135,0.35)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 45px rgba(0,253,135,0.55)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 25px rgba(0,253,135,0.35)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            Get Started — It&apos;s Free
          </Link>
        </section>

      </main>

      {/* ───────── FOOTER ───────── */}
      <footer
        className="w-full py-16"
        style={{ backgroundColor: "#0c0e0f", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div
            className="text-3xl font-black tracking-tighter mb-8"
            style={logoGradientStyle}
          >
            FinFlow
          </div>
          <p className="text-[#aaabac] text-sm text-center max-w-md mb-8">
            The money app built for teens, by a teen. Your money. Your rules.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
            {["Privacy Policy", "Terms of Service", "Security", "Help Center"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-[#aaabac] hover:text-[#a4ffb9] transition-colors duration-300 uppercase tracking-wider font-medium"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="text-[#6a6b6d] text-xs">
            © 2026 FinFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
