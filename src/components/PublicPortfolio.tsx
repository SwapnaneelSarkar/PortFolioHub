"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Mail,
  MapPin,
  Download,
  Paperclip,
  ExternalLink,
  ChevronRight,
  Layers3,
  Eye,
  CheckCircle2,
  BookOpen,
  Cpu,
  BarChart,
  Target,
  Zap,
  Users,
  Search,
  Sparkles,
} from "lucide-react";
import { initialPortfolio, type PortfolioData, formatFileSize } from "@/lib/portfolio";
import { useEffect, useMemo, useState } from "react";

const storageKey = "portfoliohub:data";

const skillIcons: Record<string, any> = {
  "Product Strategy": Target,
  "Roadmapping": Layers3,
  "A/B Testing": Zap,
  "SQL": Cpu,
  "Data Analysis": BarChart,
  "User Research": Search,
  "Stakeholder Management": Users,
  "Product Design": Sparkles,
  "Agile": CheckCircle2,
  "Market Research": Search,
  "GTM Strategy": ArrowUpRight,
  "Growth": Zap,
};

function ArrowUpRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

function usePortfolioData(serverData: any) {
  const [data, setData] = useState<PortfolioData>(serverData || initialPortfolio);

  useEffect(() => {
    if (!serverData) {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          setData(JSON.parse(saved) as PortfolioData);
        } catch (e) {
          console.error("Failed to parse public portfolio data:", e);
        }
      }
    }
  }, [serverData]);

  return data;
}

export function PublicPortfolio({ username, serverData }: { username: string; serverData?: any }) {
  const data = usePortfolioData(serverData);

  const visibleCases = useMemo(() => {
    return (data.caseStudies || [])
      .filter((s) => s.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data.caseStudies]);

  const profile = data.profile;

  const isDemoOrMatch = profile.username === username || (!serverData && username === "demo-pm");
  if (!profile.published || !isDemoOrMatch) {
    return <NotFoundPortfolio username={username} />;
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-slate-900 selection:bg-violet-100 selection:text-violet-900 overflow-x-hidden">
      {/* Immersive Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-[20%] -right-[10%] h-[1000px] w-[1000px] rounded-full bg-gradient-to-br from-violet-200/30 via-purple-100/20 to-transparent blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-gradient-to-tr from-blue-200/20 via-cyan-100/10 to-transparent blur-[100px]" />
        <div className="dot-grid absolute inset-0 opacity-[0.15]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="flex items-center gap-3 text-slate-950 select-none group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/20 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <Layers3 size={18} strokeWidth={2.5} />
            </div>
            <span className="text-base font-black tracking-tight">
              Portfolio<span className="gradient-text">Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${profile.contactEmail}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition-all duration-300 hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95"
            >
              <Mail size={14} />
              <span className="hidden sm:inline">Get in touch</span>
              <span className="sm:hidden">Contact</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:py-24">
        {/* Hero Section */}
        <header className="grid gap-16 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-10 animate-fade-in-up">
            <div className="space-y-6">
              {profile.location && (
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50/50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-violet-700 shadow-sm backdrop-blur-sm">
                  <MapPin size={12} className="text-violet-500" />
                  {profile.location}
                </div>
              )}

              <h1 className="text-6xl font-black tracking-tight leading-[0.95] text-slate-950 sm:text-7xl lg:text-8xl">
                {profile.displayName.split(" ")[0]}<br />
                <span className="gradient-text">{profile.displayName.split(" ").slice(1).join(" ")}</span>
              </h1>
            </div>

            <div className="space-y-8">
              <p className="max-w-2xl text-2xl font-bold leading-tight text-slate-800 sm:text-3xl border-l-8 border-violet-600 pl-8">
                {profile.headline}
              </p>

              <p className="max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl font-medium">
                {profile.bio}
              </p>
            </div>

            {/* Expertise Grid */}
            {profile.skills.length > 0 && (
              <div className="pt-6">
                <p className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Core Expertise</p>
                <div className="flex flex-wrap gap-3">
                  {profile.skills.map((skill) => {
                    const Icon = skillIcons[skill] || Sparkles;
                    return (
                      <span
                        key={skill}
                        className="group inline-flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 hover:-translate-y-1 hover:shadow-md"
                      >
                        <Icon size={16} className="text-slate-400 transition-colors group-hover:text-violet-500" />
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Track Record */}
          <aside className="rounded-[40px] border border-white/60 bg-white/40 p-10 shadow-2xl shadow-slate-200/50 backdrop-blur-xl space-y-10 animate-fade-in-up delay-200 lg:sticky lg:top-32">
            <div>
              <p className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Career Signals</p>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <Signal value={visibleCases.length.toString()} label="Deep Dives" color="violet" icon={BookOpen} />
                <Signal value={data.attachments.length.toString()} label="Product Artifacts" color="blue" icon={FileText} />
                <Signal value="85%" label="Impact Score" color="emerald" icon={Zap} />
              </div>
            </div>

            {profile.links.length > 0 && (
              <div className="border-t border-slate-200/60 pt-10">
                <p className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Network</p>
                <div className="space-y-3">
                  {profile.links.map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-6 py-5 text-sm font-black text-slate-700 transition-all duration-300 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 hover:shadow-lg shadow-sm active:scale-95"
                    >
                      <span className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 transition-colors group-hover:bg-violet-100">
                          <ExternalLink size={16} className="text-slate-400 group-hover:text-violet-600" />
                        </div>
                        {link.label}
                      </span>
                      <ArrowRight size={16} className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-violet-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </header>

        {/* Case Studies Section */}
        <section className="py-32">
          <div className="mb-16 flex flex-col items-center text-center space-y-4 animate-fade-in">
            <div className="flex size-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-2xl shadow-violet-500/30">
              <Briefcase size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Product Case Studies</h2>
              <p className="mt-2 text-lg text-slate-500 font-bold uppercase tracking-widest text-[10px]">Selected works showing judgment & impact</p>
            </div>
          </div>

          {visibleCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 rounded-[48px] border-2 border-dashed border-slate-200 bg-white/40 py-32 text-center backdrop-blur-sm animate-fade-in">
              <div className="flex size-24 items-center justify-center rounded-[32px] bg-slate-50 text-slate-200">
                <Briefcase size={48} />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-black text-slate-900">Case studies in progress</p>
                <p className="text-base text-slate-500 font-medium">Drafting the next product story. Check back soon.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-2">
              {visibleCases.map((study, i) => (
                <Link
                  key={study.id}
                  href={`/p/${profile.username}/${study.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:shadow-[0_32px_64px_-12px_rgba(124,58,237,0.15)] hover:-translate-y-3 animate-fade-in-up"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="flex flex-col flex-1 p-10 sm:p-12">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                      <span className="inline-flex items-center rounded-full bg-violet-50 border border-violet-100 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-violet-700 shadow-sm transition-colors group-hover:bg-violet-100">
                        {study.company}
                      </span>
                      <div className="flex size-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 transition-all duration-300 group-hover:bg-violet-600 group-hover:border-violet-600 group-hover:text-white group-hover:scale-110">
                        <ArrowUpRight size={22} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6 flex-1">
                      <h3 className="text-3xl font-black tracking-tight text-slate-950 leading-[1.1] transition-colors group-hover:text-violet-950">
                        {study.title}
                      </h3>
                      <p className="text-lg leading-relaxed text-slate-600 font-medium line-clamp-3 group-hover:text-slate-800 transition-colors">
                        {study.summary}
                      </p>
                    </div>

                    {/* Footer Meta */}
                    <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Role</span>
                          <span className="text-sm font-black text-slate-800">{study.role}</span>
                        </div>
                        <div className="h-10 w-px bg-slate-100" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Timeline</span>
                          <span className="text-sm font-black text-slate-800">{study.timeframe}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-sm font-black text-violet-600 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 uppercase tracking-widest">
                        View Case <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-10 text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white">
              <Layers3 size={24} />
            </div>
            <p className="text-sm font-black tracking-tight text-slate-950">PortfolioHub</p>
          </div>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
            Built for Product Managers who prove their impact.
          </p>
          <div className="flex justify-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Link href="/" className="hover:text-violet-600 transition">Create Your Portfolio</Link>
            <span className="text-slate-200">•</span>
            <Link href="/login" className="hover:text-violet-600 transition">Sign In</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export function PublicCaseStudy({
  username,
  slug,
  serverData,
}: {
  username: string;
  slug: string;
  serverData?: any;
}) {
  const data = usePortfolioData(serverData);
  const profile = data.profile;

  const study = useMemo(() => {
    return (data.caseStudies || []).find((s) => s.slug === slug && s.published);
  }, [data.caseStudies, slug]);

  const blocks = useMemo(() => {
    if (!study) return [];
    return data.blocks
      .filter((b) => b.caseStudyId === study.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data.blocks, study]);

  const attachments = useMemo(() => {
    if (!study) return [];
    return data.attachments.filter((a) => a.caseStudyId === study.id);
  }, [data.attachments, study]);

  const isDemoOrMatch = profile.username === username || (!serverData && username === "demo-pm");
  if (!profile.published || !isDemoOrMatch || !study) {
    return <NotFoundPortfolio username={username} />;
  }

  const blockColors: Record<string, string> = {
    problem:   "from-rose-500/10 to-rose-600/5 border-rose-100",
    research:  "from-amber-500/10 to-amber-600/5 border-amber-100",
    strategy:  "from-violet-500/10 to-violet-600/5 border-violet-100",
    execution: "from-blue-500/10 to-blue-600/5 border-blue-100",
    metrics:   "from-emerald-500/10 to-emerald-600/5 border-emerald-100",
    learnings: "from-indigo-500/10 to-indigo-600/5 border-indigo-100",
    custom:    "from-slate-500/5 to-slate-600/5 border-slate-200",
  };

  const blockTagColors: Record<string, string> = {
    problem:   "text-rose-700 bg-rose-50",
    research:  "text-amber-700 bg-amber-50",
    strategy:  "text-violet-700 bg-violet-50",
    execution: "text-blue-700 bg-blue-50",
    metrics:   "text-emerald-700 bg-emerald-50",
    learnings: "text-indigo-700 bg-indigo-50",
    custom:    "text-slate-700 bg-slate-100",
  };

  return (
    <main className="min-h-screen bg-[#faf9f7] text-slate-900 selection:bg-violet-100 selection:text-violet-900 overflow-x-hidden">
      {/* Immersive Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-[10%] -right-[10%] h-[800px] w-[800px] rounded-full bg-gradient-to-br from-violet-200/30 via-purple-100/20 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 -left-[10%] h-[800px] w-[800px] rounded-full bg-gradient-to-tr from-blue-200/20 via-cyan-100/10 to-transparent blur-[100px]" />
        <div className="dot-grid absolute inset-0 opacity-[0.15]" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="flex items-center gap-2.5 text-slate-950 select-none group">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-md">
              <Layers3 size={14} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-black tracking-tight hidden sm:block">
              Portfolio<span className="gradient-text">Hub</span>
            </span>
          </Link>
          <Link
            href={`/p/${username}`}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition-all duration-300 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 hover:shadow-md active:scale-95"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to portfolio</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-4xl px-6 py-12 sm:px-10 lg:py-24">
        {/* Case header */}
        <header className="pb-16 mb-16 border-b border-slate-200/60 animate-fade-in-up">
          <div className="flex flex-col gap-10">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center rounded-full bg-violet-50 border border-violet-100 px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-violet-700 shadow-sm">
                {study.company}
              </span>
              <div className="h-px w-12 bg-slate-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Case Study</span>
            </div>
            
            <h1 className="text-5xl font-black tracking-tight text-slate-950 leading-[0.95] sm:text-6xl lg:text-7xl">
              {study.title}
            </h1>
            
            <p className="text-2xl leading-relaxed text-slate-700 font-bold sm:text-3xl max-w-3xl border-l-8 border-violet-600/20 pl-10 italic">
              {study.summary}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <MetaChip icon={Briefcase}>{study.role}</MetaChip>
              <MetaChip icon={Layers3}>{study.timeframe}</MetaChip>
              {study.type === "document" && <MetaChip icon={FileText}>Artifact Included</MetaChip>}
            </div>
          </div>
        </header>

        {/* Content Section */}
        {study.type === "document" ? (
          <section className="animate-fade-in-up">
            <div className="rounded-[48px] border-2 border-dashed border-slate-200 bg-white/50 p-16 text-center backdrop-blur-xl shadow-2xl shadow-slate-200/50">
              <div className="mx-auto flex size-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-2xl shadow-violet-500/20 mb-10">
                <FileText size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-950 tracking-tight mb-6">Strategic Artifact</h2>
              <p className="text-xl text-slate-600 max-w-xl mx-auto mb-12 leading-relaxed font-medium">
                This case study is presented as a primary document. Access the full analysis and logic below.
              </p>
              
              {study.primaryDocumentUrl ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <a
                    href={study.primaryDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-16 items-center gap-4 rounded-3xl bg-slate-950 px-10 text-lg font-black text-white shadow-2xl shadow-slate-950/20 transition-all duration-300 hover:bg-slate-800 hover:-translate-y-1 active:scale-95"
                  >
                    <Eye size={24} />
                    View Document
                  </a>
                  <a
                    href={study.primaryDocumentUrl}
                    download
                    className="inline-flex h-16 items-center gap-4 rounded-3xl border border-slate-200 bg-white px-10 text-lg font-black text-slate-700 shadow-sm transition-all duration-300 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 hover:shadow-lg active:scale-95"
                  >
                    <Download size={24} />
                    Download
                  </a>
                </div>
              ) : (
                <div className="rounded-3xl bg-slate-100 p-8 text-slate-500 font-bold uppercase tracking-widest text-xs italic">
                  Link is being processed...
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="space-y-12">
            {blocks.map((block, i) => {
              const gradClass = blockColors[block.type] || blockColors.custom;
              const tagClass = blockTagColors[block.type] || blockTagColors.custom;
              return (
                <section
                  key={block.id}
                  className={`group relative overflow-hidden rounded-[48px] border bg-gradient-to-br p-10 sm:p-16 shadow-sm transition-all duration-500 hover:shadow-2xl animate-fade-in-up ${gradClass}`}
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Decorative index */}
                  <div className="absolute top-12 right-12 flex size-14 items-center justify-center rounded-3xl bg-white/40 text-sm font-black text-slate-400 backdrop-blur-xl border border-white/20 transition-all duration-500 group-hover:bg-white group-hover:text-violet-600 group-hover:rotate-6 group-hover:scale-110">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <div className="flex flex-col gap-8">
                    <span className={`inline-flex w-fit items-center rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] shadow-sm ${tagClass}`}>
                      {block.type}
                    </span>
                    
                    <h2 className="text-4xl font-black text-slate-950 tracking-tight leading-none sm:text-5xl">
                      {block.title}
                    </h2>
                    
                    <div className="prose-pm whitespace-pre-line text-lg leading-relaxed text-slate-700 sm:text-xl font-medium">
                      {block.content || (
                        <span className="italic text-slate-400">Content coming soon.</span>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Attachments Section */}
        {attachments.length > 0 && (
          <section className="mt-24 rounded-[48px] border border-slate-200/80 bg-white/50 p-10 sm:p-16 shadow-sm backdrop-blur-xl animate-fade-in-up">
            <div className="mb-12 flex items-center gap-6">
              <div className="flex size-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-2xl shadow-violet-500/20">
                <Paperclip size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-950">Evidence & Artifacts</h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">{attachments.length} file{attachments.length !== 1 ? "s" : ""} included for proof</p>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {attachments.map((item) => (
                <a
                  key={item.id}
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-xl active:scale-[0.98]"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 transition-all duration-300 group-hover:bg-white group-hover:border-violet-200 group-hover:text-violet-600 group-hover:rotate-3 shadow-sm">
                      <FileText size={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-black text-slate-900 group-hover:text-violet-900 transition-colors line-clamp-1">{item.fileName}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatFileSize(item.fileSize)}</span>
                    </div>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-violet-600 group-hover:text-white">
                    <Download size={18} />
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Back link footer */}
        <div className="mt-32 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-slate-200 pt-16 animate-fade-in">
          <Link
            href={`/p/${username}`}
            className="group inline-flex items-center gap-4 rounded-3xl border border-slate-200 bg-white px-8 py-5 text-base font-black text-slate-700 shadow-sm transition-all duration-300 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900 hover:shadow-lg active:scale-95 uppercase tracking-widest"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            Full Portfolio
          </Link>
          <a
            href={`mailto:${profile.contactEmail}`}
            className="inline-flex items-center gap-4 rounded-3xl bg-slate-950 px-10 py-5 text-base font-black text-white shadow-2xl shadow-slate-950/20 transition-all duration-300 hover:bg-slate-800 hover:-translate-y-1 active:scale-95 uppercase tracking-widest"
          >
            <Mail size={20} />
            Connect with {profile.displayName.split(" ")[0]}
          </a>
        </div>
      </article>
    </main>
  );
}

function MetaChip({ children, icon: Icon }: { children: React.ReactNode; icon: any }) {
  return (
    <span className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-xs font-black text-slate-700 shadow-sm backdrop-blur-md uppercase tracking-widest">
      <Icon size={14} className="text-violet-600" />
      {children}
    </span>
  );
}

function Signal({ 
  value, 
  label, 
  color, 
  icon: Icon 
}: { 
  value: string; 
  label: string; 
  color: "violet" | "blue" | "emerald";
  icon: any;
}) {
  const colors = {
    violet: "from-violet-50 to-violet-100/50 border-violet-100 text-violet-900",
    blue: "from-blue-50 to-blue-100/50 border-blue-100 text-blue-900",
    emerald: "from-emerald-50 to-emerald-100/50 border-emerald-100 text-emerald-900",
  };
  const iconColors = {
    violet: "bg-violet-600 text-white",
    blue: "bg-blue-600 text-white",
    emerald: "bg-emerald-600 text-white",
  };
  return (
    <div className={`group flex items-center gap-5 rounded-[32px] border bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colors[color]}`}>
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110 ${iconColors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black tracking-tight leading-none">{value}</p>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</p>
      </div>
    </div>
  );
}

function NotFoundPortfolio({ username }: { username: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3f0] px-5">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-100/50 to-purple-200/30 blur-3xl" />
        <div className="dot-grid absolute inset-0 opacity-[0.25]" />
      </div>

      <section className="w-full max-w-md rounded-[40px] border border-slate-200/80 bg-white p-12 text-center shadow-2xl shadow-slate-950/5 animate-scale-in">
        <div className="mx-auto flex size-20 items-center justify-center rounded-[28px] bg-slate-50 text-slate-300 mb-8 border border-slate-100">
          <Search size={32} />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 leading-none">Not Found</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-500 font-medium">
          No live portfolio found for<br />
          <span className="font-black text-slate-900 mt-2 block">@{username}</span>
        </p>
        <Link
          href="/login"
          className="mt-10 inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-slate-950 px-10 text-base font-black text-white shadow-xl shadow-slate-950/10 transition hover:bg-slate-800 uppercase tracking-widest"
        >
          Build Yours
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
