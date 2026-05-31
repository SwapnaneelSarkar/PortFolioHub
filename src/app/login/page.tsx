"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, Globe } from "lucide-react";
import { PortfolioMark } from "@/components/PortfolioMark";
import { usePortfolioStore } from "@/lib/usePortfolioStore";

const perks = [
  { icon: ShieldCheck, text: "Secure magic-link login" },
  { icon: Globe, text: "Publish at /p/your-name" },
  { icon: Sparkles, text: "Guided PM storytelling" },
];

export default function LoginPage() {
  const router = useRouter();
  const { auth, ready, isSupabase } = usePortfolioStore();
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg("");

    if (email.endsWith("@example.com") && isSupabase) {
      setErrorMsg("Supabase blocks placeholder '@example.com' domains. Please use a real email address.");
      return;
    }

    setLoading(true);
    try {
      await auth.signIn(email);
      if (isSupabase) {
        setSent(true);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message?.includes("invalid") || err.message?.includes("email")
          ? "Invalid email format. Note: Supabase blocks fake '@example.com' placeholder domains."
          : err.message || "Failed to sign in. Please verify your email and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center hero-gradient px-5 py-6">
        {/* Background blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-200/40 to-purple-300/30 blur-3xl" />
          <div className="absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/20 blur-3xl" />
        </div>

        <section className="w-full max-w-md animate-scale-in rounded-2xl border border-white/80 bg-white/80 p-10 text-center shadow-xl shadow-slate-950/10 backdrop-blur">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 animate-float">
            <CheckCircle2 size={30} />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950">Check your inbox</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            We sent a secure magic link to{" "}
            <span className="font-bold text-slate-900">{email}</span>.{" "}
            Click it to instantly access your workspace.
          </p>
          <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
            Didn't receive it? Check your spam folder or{" "}
            <button onClick={() => setSent(false)} className="font-bold text-violet-600 hover:text-violet-700 transition underline underline-offset-2">
              try a different email
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen hero-gradient px-5 py-6 sm:px-8">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-200/40 to-purple-300/30 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/20 blur-3xl" />
        <div className="dot-grid absolute inset-0 opacity-[0.3]" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" aria-label="PortfolioHub home">
          <PortfolioMark />
        </Link>
        <Link
          href="/p/demo-pm"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/80 hover:text-slate-900"
        >
          Demo portfolio →
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 py-16 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        {/* Left copy */}
        <div className="animate-fade-in-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            <Sparkles size={13} className="text-violet-500" />
            Private workspace for PMs
          </div>
          <h1 className="max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-5xl">
            {mode === "signup"
              ? <>Build a portfolio that <span className="gradient-text">speaks for itself</span>.</>
              : <>Welcome back. Let's keep <span className="gradient-text">building</span>.</>}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            {isSupabase
              ? "Write structured case studies, organize product blocks, upload supporting artifacts, and publish your recruiter-friendly portfolio page."
              : "Running in Local Preview Mode — type any email to explore. Your edits are saved locally in this browser."}
          </p>

          {/* Perks */}
          <div className="mt-8 flex flex-col gap-3">
            {perks.map((perk) => (
              <div key={perk.text} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <perk.icon size={15} />
                </span>
                <span className="text-sm font-semibold text-slate-700">{perk.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth card */}
        <div className="animate-fade-in-up delay-150">
          <div className="relative rounded-2xl border border-white/80 bg-white/80 p-7 shadow-xl shadow-slate-950/10 backdrop-blur">
            {/* Gradient border shimmer */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/15 via-transparent to-blue-500/10 opacity-80" />

            <div className="relative">
              {/* Tab toggle */}
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 mb-7">
                {(["signup", "login"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setErrorMsg(""); }}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-200 ${
                      mode === m
                        ? "bg-white text-violet-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {m === "signup" ? "Sign Up" : "Sign In"}
                  </button>
                ))}
              </div>

              {/* Icon */}
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700 mb-5">
                <Mail size={22} />
              </div>

              <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                {isSupabase
                  ? "Enter your email — we'll send a magic sign-in link."
                  : "Use any email. Edits are currently saved locally in this browser."}
              </p>

              {/* Error */}
              {errorMsg && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800 animate-fade-in">
                  <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isSupabase ? "you@gmail.com" : "you@example.com"}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder-slate-400 transition input-focus"
                  />
                </div>

                <button
                  id="btn-auth-submit"
                  type="submit"
                  disabled={!ready || loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-500 hover:to-violet-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 btn-press"
                >
                  {loading ? (
                    <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  {loading ? "Sending link..." : mode === "signup" ? "Create account" : "Sign in"}
                </button>
              </form>

              {/* Footer toggle */}
              <p className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-5">
                {mode === "signup" ? "Already have an account? " : "New to PortfolioHub? "}
                <button
                  type="button"
                  onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErrorMsg(""); }}
                  className="font-bold text-violet-600 hover:text-violet-700 transition underline underline-offset-2"
                >
                  {mode === "signup" ? "Sign In" : "Create an account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
