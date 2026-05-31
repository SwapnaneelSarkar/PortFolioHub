import Link from "next/link";
import {
  ArrowRight,
  FileText,
  FolderUp,
  LockKeyhole,
  PenLine,
  Share2,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Target,
  X,
} from "lucide-react";
import { PortfolioMark } from "@/components/PortfolioMark";

const features = [
  {
    icon: LockKeyhole,
    title: "Secure Workspace",
    copy: "A private sandbox to draft, refine, and iterate on your product stories before going live.",
    color: "from-violet-500/10 to-violet-600/10",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  {
    icon: PenLine,
    title: "The PM Guided Path",
    copy: "Don't stare at a blank page. Our prompts help you extract the 'why' behind your decisions.",
    color: "from-blue-500/10 to-blue-600/10",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    icon: FolderUp,
    title: "Artifact Proof",
    copy: "PRDs, strategy decks, and roadmap snapshots. Show the real work you produced.",
    color: "from-emerald-500/10 to-emerald-600/10",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    icon: Share2,
    title: "One-Click Hosting",
    copy: "Instant, SEO-optimized portfolio page at your unique handle. Zero setup required.",
    color: "from-amber-500/10 to-amber-600/10",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
];

const faq = [
  {
    q: "How is this different from a personal website?",
    a: "Generic website builders aren't designed for PMs. PortfolioHub is built around the 'PM Case Study' format, focusing on impact, judgment, and artifacts rather than just aesthetics."
  },
  {
    q: "Can I keep my portfolio private?",
    a: "Yes. Every case study has a 'Publish' toggle. You can use PortfolioHub as a private journal for your career until you're ready to share."
  },
  {
    q: "Is it really free?",
    a: "Yes, our core portfolio builder and hosting are free. We want to help PMs tell better stories."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen hero-gradient selection:bg-violet-100 selection:text-violet-900">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-200/40 to-purple-300/30 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/20 blur-[100px]" />
        <div className="dot-grid absolute inset-0 opacity-[0.2]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <PortfolioMark />
          <nav className="flex items-center gap-6">
            <Link href="#features" className="hidden text-sm font-semibold text-slate-600 transition hover:text-violet-600 sm:block">Features</Link>
            <Link href="#how-it-works" className="hidden text-sm font-semibold text-slate-600 transition hover:text-violet-600 sm:block">How it works</Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 btn-press"
            >
              Sign In
              <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto w-full max-w-7xl px-5 pt-16 pb-24 sm:px-8 lg:pt-32 text-center">
        <div className="flex flex-col items-center animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/50 px-4 py-2 text-xs font-bold text-violet-700 backdrop-blur-sm shadow-sm">
            <Sparkles size={14} className="text-violet-500" />
            The Portfolio Builder for Modern Product Managers
          </div>

          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-7xl lg:text-8xl">
            Prove your <span className="gradient-text">judgment</span>,<br />not just your title.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Generic website builders fail PMs. PortfolioHub is a focused workspace to capture your product thinking, 
            attach PRDs, and publish a credible portfolio in minutes.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 px-10 text-base font-bold text-white shadow-xl shadow-violet-500/30 transition hover:from-violet-500 hover:to-violet-600 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
            >
              Start Building Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/p/demo-pm"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-10 text-base font-bold text-slate-900 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:shadow-md active:scale-95"
            >
              Explore Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-slate-950 py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.1),transparent)]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 relative">
          <div className="max-w-3xl mb-16 animate-fade-in">
            <span className="badge bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">Features</span>
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Everything you need to prove your seniority.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <article
                key={feature.title}
                className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/[0.08] hover:border-white/20 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`mb-6 flex size-14 items-center justify-center rounded-2xl ${feature.iconBg} ${feature.iconColor} shadow-lg shadow-black/20`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-base leading-relaxed text-slate-400">{feature.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">From PRD to Published in 3 steps</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Choose Your Path", desc: "Start from scratch with our PM-storyteller prompts, or simply upload your existing strategy docs." },
              { step: "02", title: "Extract the Why", desc: "Our blocks help you highlight the key customer problems, weighed trade-offs, and measurable impact." },
              { step: "03", title: "Publish & Share", desc: "Get a high-speed, mobile-responsive portfolio page that's ready for any hiring loop." },
            ].map((s, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm transition hover:shadow-md animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="text-5xl font-black text-slate-100 absolute top-6 right-8">{s.step}</span>
                <h3 className="text-xl font-bold text-slate-950 mb-4 relative">{s.title}</h3>
                <p className="text-slate-600 leading-relaxed relative">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 sm:py-32 bg-white/50 backdrop-blur-sm border-y border-slate-200/60">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-center text-slate-950 mb-16">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faq.map((item, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-slate-200 bg-white transition hover:border-violet-200">
                <h3 className="font-bold text-slate-950 flex items-center justify-between">
                  {item.q}
                  <ChevronDown size={18} className="text-slate-400 group-hover:text-violet-500 transition" />
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="relative rounded-[48px] bg-slate-950 p-12 sm:p-20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15),transparent)]" />
            <div className="relative animate-fade-in-up">
              <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">Ready to upgrade?</h2>
              <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
                Join the elite PMs who don't just work hard, but tell stories that get them hired.
              </p>
              <div className="mt-12 flex flex-col items-center gap-6">
                <Link
                  href="/login"
                  className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-white px-10 text-lg font-bold text-slate-950 shadow-xl transition hover:bg-slate-100 hover:-translate-y-1 active:scale-95"
                >
                  Create Your Free Portfolio
                  <ArrowRight size={20} />
                </Link>
                <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-sm font-medium">
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> No credit card</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Instant setup</div>
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Custom /p/ URL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <PortfolioMark />
            <div className="flex gap-8 text-sm font-semibold text-slate-500">
              <Link href="#" className="hover:text-violet-600">Privacy Policy</Link>
              <Link href="#" className="hover:text-violet-600">Terms of Service</Link>
              <Link href="#" className="hover:text-violet-600">Contact</Link>
            </div>
            <p className="text-sm text-slate-400 font-medium">© 2026 PortfolioHub. Built for Product Managers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
