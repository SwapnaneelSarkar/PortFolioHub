"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  FilePlus2,
  FileText,
  LogOut,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  BookOpen,
  User,
  LayoutDashboard,
  ChevronRight,
  Paperclip,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { PortfolioMark } from "@/components/PortfolioMark";
import {
  acceptedAttachmentTypes,
  blockLabels,
  formatFileSize,
  slugify,
  type Attachment,
  type CaseStudy,
  type CaseStudyBlock,
  type CaseStudyBlockType,
} from "@/lib/portfolio";
import { usePortfolioStore } from "@/lib/usePortfolioStore";
import {
  saveProfile as serverSaveProfile,
  createCaseStudy as serverCreateCaseStudy,
  updateCaseStudy as serverUpdateCaseStudy,
  deleteCaseStudy as serverDeleteCaseStudy,
  upsertCaseStudyBlock as serverUpsertBlock,
  deleteCaseStudyBlock as serverDeleteBlock,
  uploadAttachment as serverUploadAttachment,
} from "@/app/actions/portfolio";

const blockTypes = Object.keys(blockLabels) as CaseStudyBlockType[];

type ActiveTab = "profile" | "cases";

export default function DashboardPage() {
  const router = useRouter();
  const { portfolio, setPortfolio, auth, ready, isSupabase, loading: storeLoading } = usePortfolioStore();
  const [activeCaseId, setActiveCaseId] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  useEffect(() => {
    if (ready && !auth.email) router.push("/login");
  }, [auth.email, ready, router]);

  useEffect(() => {
    if (portfolio.caseStudies.length > 0 && !activeCaseId) {
      setActiveCaseId(portfolio.caseStudies[0].id);
    }
  }, [portfolio.caseStudies, activeCaseId]);

  useEffect(() => {
    if (activeCaseId && !portfolio.caseStudies.some((s) => s.id === activeCaseId)) {
      setActiveCaseId(portfolio.caseStudies[0]?.id ?? "");
    }
  }, [activeCaseId, portfolio.caseStudies]);

  const activeCase = portfolio.caseStudies.find((s) => s.id === activeCaseId);
  const activeBlocks = useMemo(
    () =>
      portfolio.blocks
        .filter((b) => b.caseStudyId === activeCaseId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [activeCaseId, portfolio.blocks],
  );
  const activeAttachments = portfolio.attachments.filter((a) => a.caseStudyId === activeCaseId);
  const publishedCases = portfolio.caseStudies.filter((s) => s.published).length;

  if (!ready || !auth.email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Loading workspace...</p>
        </div>
      </main>
    );
  }

  function triggerSaveState(promise: Promise<any>) {
    setSaveStatus("Saving");
    return promise
      .then((res) => {
        if (res && res.error) {
          console.error(res.error);
          setSaveStatus("Error");
          setTimeout(() => setSaveStatus("Saved"), 4000);
        } else {
          setSaveStatus("Saved");
        }
        return res;
      })
      .catch((err) => {
        console.error(err);
        setSaveStatus("Error");
        setTimeout(() => setSaveStatus("Saved"), 4000);
      });
  }

  async function updateProfile(field: string, value: string | boolean) {
    setPortfolio((cur) => ({ ...cur, profile: { ...cur.profile, [field]: value } }));
    if (isSupabase) await triggerSaveState(serverSaveProfile({ [field]: value }));
  }

  async function updateListField(field: "skills" | "links", value: string) {
    const parsedValue =
      field === "skills"
        ? value.split(",").map((i) => i.trim()).filter(Boolean)
        : value.split("\n").map((line) => {
            const [label, url] = line.split("|").map((p) => p.trim());
            return { label: label || "Link", url: url || "#" };
          });
    setPortfolio((cur) => ({ ...cur, profile: { ...cur.profile, [field]: parsedValue } }));
    if (isSupabase) await triggerSaveState(serverSaveProfile({ [field]: parsedValue }));
  }

  async function updateCase(field: keyof CaseStudy, value: string | boolean) {
    if (!activeCase) return;
    setPortfolio((cur) => ({
      ...cur,
      caseStudies: cur.caseStudies.map((s) =>
        s.id === activeCase.id
          ? { ...s, [field]: value, slug: field === "title" && typeof value === "string" ? slugify(value) : s.slug }
          : s,
      ),
    }));
    if (isSupabase) {
      const nextSlug = field === "title" && typeof value === "string" ? slugify(value) : activeCase.slug;
      await triggerSaveState(serverUpdateCaseStudy(activeCase.id, { [field]: value, ...(field === "title" ? { slug: nextSlug } : {}) }));
    }
  }

  async function updateBlock(blockId: string, field: keyof CaseStudyBlock, value: string) {
    setPortfolio((cur) => ({
      ...cur,
      blocks: cur.blocks.map((b) => (b.id === blockId ? { ...b, [field]: value } : b)),
    }));
    if (isSupabase && activeCase) {
      await triggerSaveState(serverUpsertBlock({ id: blockId, caseStudyId: activeCase.id, [field]: value }));
    }
  }

  async function addCaseStudy() {
    const tempSlug = `new-case-study-${portfolio.caseStudies.length + 1}`;
    const tempTitle = "New case study";
    if (isSupabase) {
      setSaveStatus("Saving");
      const result = await serverCreateCaseStudy(tempSlug, tempTitle);
      if (result && !result.error && result.caseStudy) {
        setPortfolio((cur) => ({
          ...cur,
          caseStudies: [...cur.caseStudies, result.caseStudy!],
          blocks: [...cur.blocks, ...(result.blocks ?? [])],
        }));
        setActiveCaseId(result.caseStudy.id);
        setSaveStatus("Saved");
      } else {
        setSaveStatus("Error");
        alert(result?.error || "Failed to create case study");
      }
    } else {
      const id = `case-${Date.now()}`;
      const nextCase: CaseStudy = {
        id,
        userId: portfolio.profile.userId,
        slug: tempSlug,
        title: tempTitle,
        summary: "Summarize the customer problem, your product decision, and the measurable result.",
        role: "Product Manager",
        company: "Company or product",
        timeframe: "2026",
        coverImageUrl: "",
        published: false,
        sortOrder: portfolio.caseStudies.length + 1,
      };
      const nextBlocks: CaseStudyBlock[] = ["problem", "research", "strategy", "execution", "metrics", "learnings"].map(
        (type, index) => ({
          id: `block-${type}-${Date.now()}-${index}`,
          caseStudyId: id,
          type: type as CaseStudyBlockType,
          title: blockLabels[type as CaseStudyBlockType],
          content: "",
          sortOrder: index + 1,
        }),
      );
      setPortfolio((cur) => ({ ...cur, caseStudies: [...cur.caseStudies, nextCase], blocks: [...cur.blocks, ...nextBlocks] }));
      setActiveCaseId(id);
    }
    setActiveTab("cases");
  }

  async function addBlock() {
    if (!activeCase) return;
    if (isSupabase) {
      setSaveStatus("Saving");
      const result = await serverUpsertBlock({ caseStudyId: activeCase.id, type: "custom", title: "Custom section", content: "" });
      if (result && !result.error && result.block) {
        setPortfolio((cur) => ({ ...cur, blocks: [...cur.blocks, result.block!] }));
        setSaveStatus("Saved");
      } else {
        setSaveStatus("Error");
        alert(result?.error || "Failed to add section");
      }
    } else {
      const nextBlock: CaseStudyBlock = {
        id: `block-custom-${Date.now()}`,
        caseStudyId: activeCase.id,
        type: "custom",
        title: "Custom section",
        content: "",
        sortOrder: activeBlocks.length + 1,
      };
      setPortfolio((cur) => ({ ...cur, blocks: [...cur.blocks, nextBlock] }));
    }
  }

  async function deleteBlock(blockId: string) {
    if (!activeCase) return;
    if (isSupabase) {
      setSaveStatus("Saving");
      const result = await serverDeleteBlock(blockId, activeCase.id);
      if (result && !result.error) {
        setPortfolio((cur) => ({ ...cur, blocks: cur.blocks.filter((b) => b.id !== blockId) }));
        setSaveStatus("Saved");
      } else {
        setSaveStatus("Error");
        alert(result?.error || "Failed to delete section");
      }
    } else {
      setPortfolio((cur) => ({ ...cur, blocks: cur.blocks.filter((b) => b.id !== blockId) }));
    }
  }

  async function removeCaseStudy() {
    if (!activeCase) return;
    if (!confirm("Delete this case study? This cannot be undone.")) return;
    if (isSupabase) {
      setSaveStatus("Saving");
      const result = await serverDeleteCaseStudy(activeCase.id);
      if (result && !result.error) {
        setPortfolio((cur) => ({
          ...cur,
          caseStudies: cur.caseStudies.filter((s) => s.id !== activeCase.id),
          blocks: cur.blocks.filter((b) => b.caseStudyId !== activeCase.id),
          attachments: cur.attachments.filter((a) => a.caseStudyId !== activeCase.id),
        }));
        setSaveStatus("Saved");
      } else {
        setSaveStatus("Error");
        alert(result?.error || "Failed to delete case study");
      }
    } else {
      setPortfolio((cur) => ({
        ...cur,
        caseStudies: cur.caseStudies.filter((s) => s.id !== activeCase.id),
        blocks: cur.blocks.filter((b) => b.caseStudyId !== activeCase.id),
        attachments: cur.attachments.filter((a) => a.caseStudyId !== activeCase.id),
      }));
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !activeCase) return;
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "doc", "docx", "ppt", "pptx"];
    const isAllowedExt = fileExt ? allowedExtensions.includes(fileExt) : false;
    if (!acceptedAttachmentTypes.includes(file.type) && !isAllowedExt) {
      setUploadMessage("Only PDF, Word, and PowerPoint files are accepted.");
      event.target.value = "";
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setUploadMessage("Files must be 12 MB or smaller.");
      event.target.value = "";
      return;
    }
    setUploadMessage("");
    setUploading(true);
    if (isSupabase) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await serverUploadAttachment(activeCase.id, formData);
        if (result && !result.error && result.attachment) {
          setPortfolio((cur) => ({ ...cur, attachments: [...cur.attachments, result.attachment!] }));
          setUploadMessage(`✓ ${file.name} uploaded successfully.`);
        } else {
          setUploadMessage(result?.error || "Upload failed.");
        }
      } catch (error) {
        console.error(error);
        setUploadMessage("Failed to connect to storage.");
      } finally {
        setUploading(false);
      }
    } else {
      setTimeout(() => {
        const attachment: Attachment = {
          id: `artifact-${Date.now()}`,
          caseStudyId: activeCase.id,
          fileName: file.name,
          fileType: file.type,
          fileUrl: "#",
          fileSize: file.size,
          createdAt: new Date().toISOString(),
        };
        setPortfolio((cur) => ({ ...cur, attachments: [...cur.attachments, attachment] }));
        setUploadMessage(`✓ ${file.name} saved locally (no database connected).`);
        setUploading(false);
      }, 800);
    }
    event.target.value = "";
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      {/* Preview mode banner */}
      {!isSupabase && (
        <div className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-center text-xs font-semibold text-white">
          <AlertTriangle size={13} className="shrink-0" />
          <span>
            <strong>Local Preview Mode</strong> — edits save to your browser.{" "}
            Add a <code className="font-mono bg-white/20 rounded px-1">.env.local</code> with Supabase keys to go live.
          </span>
        </div>
      )}

      {storeLoading && (
        <div className="flex items-center justify-center gap-2 bg-violet-600 py-2 text-xs font-semibold text-white">
          <Loader2 className="animate-spin" size={13} />
          <span>Syncing workspace with Supabase...</span>
        </div>
      )}

      {/* Sticky nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <PortfolioMark />

          {/* Save status */}
          <div className="hidden items-center gap-2 sm:flex">
            {saveStatus === "Saving" && (
              <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 animate-fade-in">
                <Loader2 className="animate-spin text-slate-400" size={11} />
                Saving…
              </span>
            )}
            {saveStatus === "Saved" && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 animate-fade-in">
                <CheckCircle2 size={11} className="text-emerald-500" />
                All changes saved
              </span>
            )}
            {saveStatus === "Error" && (
              <span className="flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 animate-fade-in">
                <AlertTriangle size={11} className="text-rose-500" />
                Save error
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/p/${portfolio.profile.username}`}
              target="_blank"
              id="btn-view-portfolio"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
            >
              <ExternalLink size={14} className="text-violet-500" />
              <span className="hidden sm:inline">View portfolio</span>
            </Link>
            <button
              type="button"
              id="btn-sign-out"
              onClick={async () => { await auth.signOut(); router.push("/"); }}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
              aria-label="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Stats card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-sm shadow-violet-500/25">
                <LayoutDashboard size={16} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspace</p>
                <p className="text-sm font-bold text-slate-900">{portfolio.profile.displayName || "Your Portfolio"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatChip label="Profile" value={portfolio.profile.published ? "Live" : "Draft"} color={portfolio.profile.published ? "green" : "gray"} />
              <StatChip label="Cases" value={`${publishedCases}/${portfolio.caseStudies.length}`} color="violet" />
              <StatChip label="Files" value={`${portfolio.attachments.length}`} color="blue" />
            </div>
          </div>

          {/* Nav tabs */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`sidebar-item flex items-center gap-3 ${activeTab === "profile" ? "active" : ""}`}
            >
              <span className={`flex size-7 items-center justify-center rounded-lg ${activeTab === "profile" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"} transition`}>
                <User size={14} />
              </span>
              <span className="font-semibold text-sm">Public Profile</span>
              {activeTab === "profile" && <ChevronRight size={14} className="ml-auto text-violet-400" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cases")}
              className={`sidebar-item flex items-center gap-3 ${activeTab === "cases" ? "active" : ""}`}
            >
              <span className={`flex size-7 items-center justify-center rounded-lg ${activeTab === "cases" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"} transition`}>
                <BookOpen size={14} />
              </span>
              <span className="font-semibold text-sm">Case Studies</span>
              {portfolio.caseStudies.length > 0 && (
                <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
                  {portfolio.caseStudies.length}
                </span>
              )}
            </button>
          </div>

          {/* Case study list */}
          {activeTab === "cases" && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Case studies</p>
                <button
                  type="button"
                  onClick={addCaseStudy}
                  id="btn-add-case-study"
                  className="inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-sm shadow-violet-500/25 transition hover:from-violet-500 hover:to-violet-600"
                  aria-label="Add case study"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-1.5">
                {portfolio.caseStudies.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                    <p className="text-xs text-slate-400 font-medium">No case studies yet</p>
                    <button
                      onClick={addCaseStudy}
                      className="mt-2 text-xs font-bold text-violet-600 hover:text-violet-700 transition"
                    >
                      + Add your first one
                    </button>
                  </div>
                ) : (
                  portfolio.caseStudies
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((study) => (
                      <button
                        key={study.id}
                        type="button"
                        onClick={() => setActiveCaseId(study.id)}
                        className={`w-full rounded-xl border p-3 text-left text-sm transition-all duration-200 ${
                          study.id === activeCaseId
                            ? "border-violet-200 bg-violet-50 shadow-xs"
                            : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block truncate font-bold text-slate-900">{study.title}</span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-400 truncate">{study.company}</span>
                          <span className={`ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            study.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {study.published ? <Eye size={8} /> : <EyeOff size={8} />}
                            {study.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </button>
                    ))
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div className="space-y-5">
          {/* Profile tab */}
          {activeTab === "profile" && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Profile</p>
                  <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">Public Identity</h1>
                  <p className="mt-0.5 text-xs text-slate-500">This is what hiring managers see at <code className="font-mono bg-slate-100 rounded px-1">/p/{portfolio.profile.username}</code></p>
                </div>
                <TogglePublish
                  checked={portfolio.profile.published}
                  onChange={(v) => updateProfile("published", v)}
                  label="Publish profile"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Display name" value={portfolio.profile.displayName} onChange={(v) => updateProfile("displayName", v)} />
                <Field label="Username" value={portfolio.profile.username} onChange={(v) => updateProfile("username", slugify(v))} hint="Letters, numbers, and hyphens only" />
                <Field label="Headline" value={portfolio.profile.headline} onChange={(v) => updateProfile("headline", v)} wide />
                <Field label="Location" value={portfolio.profile.location} onChange={(v) => updateProfile("location", v)} />
                <Field label="Contact email" value={portfolio.profile.contactEmail} onChange={(v) => updateProfile("contactEmail", v)} />
                <TextArea label="Bio" value={portfolio.profile.bio} onChange={(v) => updateProfile("bio", v)} wide />
                <Field label="Skills" value={portfolio.profile.skills.join(", ")} onChange={(v) => updateListField("skills", v)} wide hint="Comma-separated list, e.g. Roadmapping, A/B testing, SQL" />
                <TextArea
                  label="Links"
                  value={portfolio.profile.links.map((l) => `${l.label} | ${l.url}`).join("\n")}
                  onChange={(v) => updateListField("links", v)}
                  wide
                  hint="One per line: Label | https://url.com"
                />
              </div>
            </section>
          )}

          {/* Cases tab */}
          {activeTab === "cases" && (
            <>
              {activeCase ? (
                <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm animate-fade-in">
                  {/* Case header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Case builder</p>
                      <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-950 line-clamp-1">{activeCase.title}</h2>
                      <p className="mt-0.5 text-xs text-slate-500">{activeCase.company} · {activeCase.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <TogglePublish
                        checked={activeCase.published}
                        onChange={(v) => updateCase("published", v)}
                        label="Publish case"
                      />
                      <button
                        type="button"
                        onClick={removeCaseStudy}
                        id="btn-delete-case"
                        className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete case study"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Case fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Title" value={activeCase.title} onChange={(v) => updateCase("title", v)} wide />
                    <Field label="Role" value={activeCase.role} onChange={(v) => updateCase("role", v)} />
                    <Field label="Company or product" value={activeCase.company} onChange={(v) => updateCase("company", v)} />
                    <Field label="Timeframe" value={activeCase.timeframe} onChange={(v) => updateCase("timeframe", v)} />
                    <Field label="Slug" value={activeCase.slug} onChange={(v) => updateCase("slug", slugify(v))} hint="Auto-generated from title" />
                    <TextArea label="Summary" value={activeCase.summary} onChange={(v) => updateCase("summary", v)} wide hint="1–2 sentences: problem, decision, and measurable result" />
                  </div>

                  {/* Blocks */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between border-t border-slate-100 pt-6 mb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-900 tracking-tight">Story sections</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Guided blocks to structure your product narrative</p>
                      </div>
                      <button
                        type="button"
                        onClick={addBlock}
                        id="btn-add-block"
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                      >
                        <Plus size={14} />
                        Add section
                      </button>
                    </div>

                    <div className="space-y-4">
                      {activeBlocks.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                          <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
                          <p className="text-sm font-semibold text-slate-400">No sections yet</p>
                          <p className="text-xs text-slate-400 mt-1">Add story sections to build your case study narrative.</p>
                        </div>
                      ) : (
                        activeBlocks.map((block, idx) => (
                          <article key={block.id} className="rounded-xl border border-slate-200/80 bg-slate-50/60 overflow-hidden animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="flex items-center gap-3 border-b border-slate-200/60 bg-white px-4 py-3">
                              <span className="flex size-6 items-center justify-center rounded-md bg-violet-100 text-[10px] font-black text-violet-700">
                                {idx + 1}
                              </span>
                              <select
                                value={block.type}
                                onChange={(e) => updateBlock(block.id, "type", e.target.value)}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-violet-400"
                              >
                                {blockTypes.map((type) => (
                                  <option key={type} value={type}>{blockLabels[type]}</option>
                                ))}
                              </select>
                              <input
                                value={block.title}
                                onChange={(e) => updateBlock(block.id, "title", e.target.value)}
                                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 outline-none transition input-focus"
                              />
                              <button
                                type="button"
                                onClick={() => deleteBlock(block.id)}
                                className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                                aria-label="Delete section"
                              >
                                <X size={13} />
                              </button>
                            </div>
                            <textarea
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, "content", e.target.value)}
                              rows={4}
                              placeholder={`Write the ${block.title.toLowerCase()} section here... Use bullet points or flowing prose.`}
                              className="w-full bg-transparent px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none resize-none placeholder-slate-400 focus:bg-white transition"
                            />
                          </article>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <div className="mb-4">
                      <h3 className="font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Paperclip size={16} className="text-violet-500" />
                        Supporting artifacts
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Upload PDFs, Word docs, or PowerPoint files as evidence for your case study.</p>
                    </div>

                    {/* Drop zone */}
                    <label className={`group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                      uploading
                        ? "border-violet-300 bg-violet-50"
                        : "border-slate-200 bg-slate-50/60 hover:border-violet-300 hover:bg-violet-50/50"
                    }`}>
                      <div className={`flex size-12 items-center justify-center rounded-xl transition ${
                        uploading ? "bg-violet-100 text-violet-600" : "bg-white text-slate-400 border border-slate-200 group-hover:bg-violet-50 group-hover:text-violet-600 group-hover:border-violet-200"
                      }`}>
                        {uploading ? (
                          <Loader2 className="animate-spin" size={22} />
                        ) : (
                          <FilePlus2 size={22} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 group-hover:text-violet-700 transition">
                          {uploading ? "Uploading file…" : "Drop a file or click to browse"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">PDF, Word, or PowerPoint · Max 12 MB</p>
                      </div>
                      <input type="file" className="sr-only" onChange={handleUpload} disabled={uploading} />
                    </label>

                    {uploadMessage && (
                      <p className={`mt-3 flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2.5 border animate-fade-in ${
                        uploadMessage.startsWith("✓")
                          ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {uploadMessage.startsWith("✓") ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                        {uploadMessage}
                      </p>
                    )}

                    {activeAttachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {activeAttachments.map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs hover:border-violet-200 transition">
                            <span className="flex items-center gap-3">
                              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                <FileText size={15} />
                              </span>
                              <span className="text-sm font-semibold text-slate-800 truncate max-w-[220px]">{item.fileName}</span>
                            </span>
                            <span className="text-xs font-semibold text-slate-400">{formatFileSize(item.fileSize)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-14 text-center shadow-sm animate-scale-in">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 text-violet-400 mb-5">
                    <BookOpen size={30} />
                  </div>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900">No case study selected</h2>
                  <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">Create your first guided PM case study to start building your portfolio.</p>
                  <button
                    onClick={addCaseStudy}
                    className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-500 hover:to-violet-600 btn-press"
                  >
                    <Plus size={15} />
                    Create case study
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tiny sub-components ────────────────────────────────── */

function StatChip({ label, value, color }: { label: string; value: string; color: "green" | "gray" | "violet" | "blue" }) {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    gray: "bg-slate-100 text-slate-600 border-slate-200",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
  };
  return (
    <div className={`rounded-xl border px-3 py-2 text-center ${colors[color]}`}>
      <p className="text-sm font-extrabold">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
    </div>
  );
}

function TogglePublish({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${checked ? "bg-violet-600" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  wide,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  wide?: boolean;
  hint?: string;
}) {
  return (
    <label className={wide ? "md:col-span-2 block" : "block"}>
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 placeholder-slate-400 transition input-focus"
      />
      {hint && <p className="mt-1 text-[11px] text-slate-400 font-medium">{hint}</p>}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  wide,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  wide?: boolean;
  hint?: string;
}) {
  return (
    <label className={wide ? "md:col-span-2 block" : "block"}>
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 placeholder-slate-400 transition input-focus resize-none"
      />
      {hint && <p className="mt-1 text-[11px] text-slate-400 font-medium">{hint}</p>}
    </label>
  );
}
