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
} from "lucide-react";
import { initialPortfolio, type PortfolioData, formatFileSize } from "@/lib/portfolio";
import { useEffect, useMemo, useState } from "react";

const storageKey = "portfoliohub:data";

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
    return data.caseStudies
      .filter((s) => s.published)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [data.caseStudies]);

  const profile = data.profile;

  const isDemoOrMatch = profile.username === username || (!serverData && username === "demo-pm");
  if (!profile.published || !isDemoOrMatch) {
    return <NotFoundPortfolio username={username} />;
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-60 -right-60 h-[700px] w-[700px] rounded-full bg-gradient-to-br from-violet-100/60 to-purple-200/40 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-100/40 to-cyan-100/30 blur-3xl" />
        <div className="dot-grid absolute inset-0 opacity-[0.25]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-slate-950 select-none group">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-sm shadow-violet-500/25 transition group-hover:shadow-md group-hover:shadow-violet-500/30">
              <Layers3 size={15} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold tracking-tight">
              Portfolio<span className="gradient-text">Hub</span>
            </span>
          </Link>
          <a
            href={`mailto:${profile.contactEmail}`}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-4 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-500 hover:to-violet-600 hover:shadow-lg hover:-translate-y-px btn-press"
          >
            <Mail size={14} />
            Get in touch
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {/* Hero header */}
        <header className="grid gap-10 pb-14 lg:grid-cols-[1fr_340px] lg:items-start border-b border-slate-200/60">
          <div className="space-y-6 animate-fade-in-up">
            {/* Location pill */}
            {profile.location && (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur">
                <MapPin size={12} className="text-violet-500" />
                {profile.location}
              </div>
            )}

            {/* Name */}
            <h1 className="text-4xl font-extrabold tracking-tight leading-[1.08] text-slate-950 sm:text-5xl lg:text-6xl">
              {profile.displayName}
            </h1>

            {/* Headline */}
            <p className="max-w-2xl text-lg font-semibold leading-relaxed text-slate-700 sm:text-xl">
              {profile.headline}
            </p>

            {/* Bio */}
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              {profile.bio}
            </p>

            {/* Skills */}
            {profile.skills.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Core expertise</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar card */}
          <aside className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/60 space-y-6 animate-fade-in-up delay-200 lg:sticky lg:top-24">
            {/* Credentials */}
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Credentials</p>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                <Signal value={visibleCases.length.toString()} label="Published case studies" color="violet" />
                <Signal value={data.attachments.length.toString()} label="Product artifacts" color="blue" />
                <Signal value="Growth" label="Product domain" color="emerald" />
              </div>
            </div>

            {/* Links */}
            {profile.links.length > 0 && (
              <div className="border-t border-slate-100 pt-5">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Professional links</p>
                <div className="space-y-2">
                  {profile.links.map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 shadow-xs"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink size={13} className="text-slate-400 group-hover:text-violet-500 transition" />
                        {link.label}
                      </span>
                      <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-violet-500 transition" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 p-4 text-white text-center">
              <p className="text-xs font-bold mb-3 opacity-90">Interested in working together?</p>
              <a
                href={`mailto:${profile.contactEmail}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/30"
              >
                <Mail size={12} />
                {profile.contactEmail || "Contact me"}
              </a>
            </div>
          </aside>
        </header>

        {/* Case studies */}
        <section className="py-14">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 text-violet-600">
              <Briefcase size={18} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">Case studies</h2>
              <p className="text-xs text-slate-400 font-medium">{visibleCases.length} published work{visibleCases.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {visibleCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <Briefcase className="text-slate-300" size={40} />
              <p className="text-slate-500 font-semibold">No published case studies yet.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {visibleCases.map((study, i) => (
                <Link
                  key={study.id}
                  href={`/p/${profile.username}/${study.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm card-hover animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="flex flex-col flex-1 p-6">
                    {/* Company + arrow */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className="inline-flex items-center rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                        {study.company}
                      </span>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 transition group-hover:bg-violet-50 group-hover:border-violet-100 group-hover:text-violet-600">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-950 leading-snug group-hover:text-violet-900 transition">
                      {study.title}
                    </h3>

                    {/* Summary */}
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 flex-1 line-clamp-3">
                      {study.summary}
                    </p>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <span>{study.role}</span>
                        <span className="text-slate-200">·</span>
                        <span>{study.timeframe}</span>
                      </div>
                      <span className="text-xs font-bold text-violet-600 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                        Read case <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
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
    return data.caseStudies.find((s) => s.slug === slug && s.published);
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
    <main className="min-h-screen bg-[#faf9f7] text-slate-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-60 -right-60 h-[700px] w-[700px] rounded-full bg-gradient-to-br from-violet-100/50 to-purple-200/30 blur-3xl" />
        <div className="absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-100/40 to-cyan-100/20 blur-3xl" />
        <div className="dot-grid absolute inset-0 opacity-[0.2]" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-slate-950 select-none group">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-sm">
              <Layers3 size={13} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold tracking-tight hidden sm:block">
              Portfolio<span className="gradient-text">Hub</span>
            </span>
          </Link>
          <Link
            href={`/p/${username}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            <ArrowLeft size={14} />
            Back to portfolio
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        {/* Case header */}
        <header className="pb-10 mb-10 border-b border-slate-200/60 animate-fade-in-up">
          <span className="inline-flex items-center rounded-full bg-violet-50 border border-violet-100 px-3.5 py-1.5 text-xs font-bold text-violet-700">
            {study.company}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 leading-tight sm:text-4xl lg:text-5xl">
            {study.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-700 font-medium sm:text-lg max-w-3xl">
            {study.summary}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <MetaChip>{study.role}</MetaChip>
            <MetaChip>{study.timeframe}</MetaChip>
          </div>
        </header>

        {/* Story blocks */}
        <div className="space-y-5">
          {blocks.map((block, i) => {
            const gradClass = blockColors[block.type] || blockColors.custom;
            const tagClass = blockTagColors[block.type] || blockTagColors.custom;
            return (
              <section
                key={block.id}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xs animate-fade-in-up ${gradClass}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Block number */}
                <div className="absolute top-5 right-5 flex size-7 items-center justify-center rounded-full bg-white/60 text-[10px] font-black text-slate-400 backdrop-blur">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${tagClass}`}>
                  {block.type}
                </span>
                <h2 className="mt-3 text-xl font-extrabold text-slate-950 tracking-tight sm:text-2xl">
                  {block.title}
                </h2>
                <div className="mt-4 prose-pm whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
                  {block.content || (
                    <span className="italic text-slate-400">Content coming soon.</span>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <section className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm animate-fade-in-up">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Paperclip size={18} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-950">Supporting artifacts</h2>
                <p className="text-xs text-slate-400 font-medium">{attachments.length} file{attachments.length !== 1 ? "s" : ""} attached</p>
              </div>
            </div>
            <div className="grid gap-2">
              {attachments.map((item) => (
                <a
                  key={item.id}
                  href={item.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition hover:border-violet-200 hover:bg-violet-50 shadow-xs"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:border-violet-200 group-hover:text-violet-600 transition shadow-xs">
                      <FileText size={16} />
                    </span>
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-violet-900 transition">{item.fileName}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    {formatFileSize(item.fileSize)}
                    <Download size={14} className="text-slate-400 group-hover:text-violet-600 transition" />
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Back link footer */}
        <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8">
          <Link
            href={`/p/${username}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            <ArrowLeft size={15} />
            Back to portfolio
          </Link>
          <a
            href={`mailto:${profile.contactEmail}`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-500 hover:to-violet-600"
          >
            <Mail size={14} />
            Contact {profile.displayName.split(" ")[0]}
          </a>
        </div>
      </article>
    </main>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-xs backdrop-blur">
      {children}
    </span>
  );
}

function Signal({ value, label, color }: { value: string; label: string; color: "violet" | "blue" | "emerald" }) {
  const colors = {
    violet: "from-violet-50 to-violet-100/50 border-violet-100 text-violet-900",
    blue: "from-blue-50 to-blue-100/50 border-blue-100 text-blue-900",
    emerald: "from-emerald-50 to-emerald-100/50 border-emerald-100 text-emerald-900",
  };
  const numColors = {
    violet: "gradient-text",
    blue: "text-blue-700",
    emerald: "text-emerald-700",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <p className={`text-2xl font-black ${numColors[color]}`}>{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

function NotFoundPortfolio({ username }: { username: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3f0] px-5">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-100/50 to-purple-200/30 blur-3xl" />
        <div className="dot-grid absolute inset-0 opacity-[0.25]" />
      </div>

      <section className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-xl shadow-slate-950/8 animate-scale-in">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 mb-6">
          <Briefcase size={28} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Portfolio not published</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          No live portfolio is currently available for{" "}
          <span className="font-bold text-slate-800">@{username}</span>.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-6 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-500 hover:to-violet-600"
        >
          Open workspace
          <ArrowRight size={15} />
        </Link>
        <p className="mt-4 text-xs text-slate-400">
          Are you the owner?{" "}
          <Link href="/dashboard" className="font-bold text-violet-600 hover:text-violet-700 transition">
            Go to dashboard →
          </Link>
        </p>
      </section>
    </main>
  );
}
