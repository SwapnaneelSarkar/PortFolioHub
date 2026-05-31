import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileText,
  FolderUp,
  LockKeyhole,
  PenLine,
  Share2,
  Sparkles,
  CheckCircle2,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";
import { PortfolioMark } from "@/components/PortfolioMark";

const proofPoints = [
  { value: "24%", label: "Sample activation lift" },
  { value: "8", label: "Guided story blocks" },
  { value: "3", label: "Artifact formats" },
];

const features = [
  {
    icon: LockKeyhole,
    title: "Private workspace",
    copy: "A secure, personal workspace to manage your PM profile and case studies — just for you.",
    color: "from-violet-500/10 to-violet-600/10",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  {
    icon: PenLine,
    title: "Guided case studies",
    copy: "Structured PM prompts walk you through problem, research, strategy, execution, metrics, and learnings.",
    color: "from-blue-500/10 to-blue-600/10",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    icon: FolderUp,
    title: "Artifact uploads",
    copy: "Attach supporting PDF, Word, and PowerPoint files directly to case studies as evidence.",
    color: "from-emerald-500/10 to-emerald-600/10",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    icon: Share2,
    title: "Public publishing",
    copy: "Publish a polished PM portfolio at a clean, shareable URL like /p/your-name.",
    color: "from-amber-500/10 to-amber-600/10",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
];

const benefits = [
  { icon: Zap, text: "No coding required" },
  { icon: Users, text: "Built for PM hiring loops" },
  { icon: TrendingUp, text: "Metrics-first storytelling" },
];

export default function Home() {
  return (
    <main className="min-h-screen hero-gradient overflow-hidden">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-200/40 to-purple-300/30 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-100/40 to-indigo-200/30 blur-3xl" />
        <div className="dot-grid absolute inset-0 opacity-[0.3]" />
      </div>

      {/* Nav */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <PortfolioMark />
        <nav className="flex items-center gap-2">
          <Link
            href="/p/demo-pm"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/80 hover:text-slate-900 sm:inline-flex"
          >
            View demo
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-500 hover:to-violet-600 hover:shadow-lg hover:shadow-violet-500/30 btn-press"
          >
            Start building
            <ArrowRight size={15} />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:pt-20">
        <div className="animate-fade-in-up">
          {/* Pill badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            <Sparkles size={14} className="text-violet-500" />
            Built for hiring-manager scan speed
          </div>

          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            PM portfolios that prove{" "}
            <span className="gradient-text">judgment</span>, not just job titles.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            PortfolioHub gives Product Managers a focused workspace to write impactful case studies,
            attach product artifacts, and publish a credible portfolio in minutes.
          </p>

          {/* Benefit pills */}
          <div className="mt-5 flex flex-wrap gap-3">
            {benefits.map((b) => (
              <span key={b.text} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                <b.icon size={12} className="text-violet-500" />
                {b.text}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              id="cta-create-portfolio"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-7 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-violet-600 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 btn-press"
            >
              Create your portfolio
              <ArrowRight size={17} />
            </Link>
            <Link
              href="/p/demo-pm/self-serve-activation"
              id="cta-sample-case"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-7 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:bg-white hover:border-slate-300 hover:shadow-md btn-press"
            >
              <FileText size={16} className="text-violet-500" />
              Read sample case
            </Link>
          </div>
        </div>

        {/* Hero card */}
        <div className="animate-fade-in-up delay-200">
          <div className="relative rounded-2xl border border-white/80 bg-white/60 p-4 shadow-xl shadow-slate-950/10 backdrop-blur-sm">
            {/* Glowing border effect */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/20 via-transparent to-blue-500/10 opacity-60" />

            <div className="relative rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-5">
              <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Published portfolio</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Avery Shah</h2>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">
                    Senior PM · B2B growth & self-serve adoption
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {proofPoints.map((point) => (
                  <div key={point.label} className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                    <p className="text-2xl font-extrabold gradient-text">{point.value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{point.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">Increasing self-serve activation</p>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">Case study</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Redesign of the first-run journey that lifted activation and reduced onboarding load.
                </p>
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Activation rate</span>
                    <span className="text-violet-600">+24%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-violet-500 to-purple-400 animate-gradient" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative border-t border-slate-200/80 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-10 text-center animate-fade-in">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Everything you need</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Built end-to-end for PMs
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <article
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm card-hover animate-fade-in-up`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                <div className="relative">
                  <span className={`inline-flex size-11 items-center justify-center rounded-xl ${feature.iconBg} ${feature.iconColor} mb-5 shadow-sm`}>
                    <feature.icon size={22} />
                  </span>
                  <h3 className="font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="border-t border-slate-200/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-5 py-16 text-center sm:px-8">
          <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/30 animate-float">
            <BarChart3 size={28} />
          </div>
          <h2 className="max-w-xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Ready to show your work?
          </h2>
          <p className="max-w-md text-base text-slate-600">
            Join PMs who already publish their product thinking with clarity and confidence.
          </p>
          <Link
            href="/login"
            id="cta-footer"
            className="inline-flex h-13 items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-8 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-violet-600 hover:shadow-xl hover:-translate-y-0.5 btn-press"
          >
            Create free portfolio
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Free to publish · No credit card required
          </p>
        </div>
      </section>
    </main>
  );
}
