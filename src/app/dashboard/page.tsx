"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  X,
  PenLine,
  Download,
  Settings,
  Bell,
  Check,
  Menu,
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
  uploadPrimaryDocument as serverUploadPrimaryDocument,
} from "@/app/actions/portfolio";

const blockTypes = Object.keys(blockLabels) as CaseStudyBlockType[];

type ActiveTab = "profile" | "cases";

export default function DashboardPage() {
  const router = useRouter();
  const { portfolio, setPortfolio, auth, ready, isSupabase, loading: storeLoading } = usePortfolioStore();
  const [activeCaseId, setActiveCaseId] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [primaryDocUploading, setPrimaryDocUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  if (!ready || !auth.email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3f0]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-3xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center shadow-2xl shadow-violet-500/20 animate-pulse">
            <LayoutDashboard size={28} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">Loading your workspace</p>
            <p className="text-sm text-slate-500 mt-1">Getting things ready...</p>
          </div>
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

  async function addCaseStudy(type: "manual" | "document") {
    const tempSlug = `new-case-study-${portfolio.caseStudies.length + 1}`;
    const tempTitle = "New case study";
    if (isSupabase) {
      setSaveStatus("Saving");
      const result = await serverCreateCaseStudy(tempSlug, tempTitle, type);
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
        summary: type === "manual" 
          ? "Summarize the customer problem, your product decision, and the measurable result."
          : "Upload your product document (PRD, Strategy, Roadmap) to share your thinking directly.",
        role: "Product Manager",
        company: "Company or product",
        timeframe: "2026",
        coverImageUrl: "",
        published: false,
        sortOrder: portfolio.caseStudies.length + 1,
        type: type,
      };
      const nextBlocks: CaseStudyBlock[] = type === "manual" ? ["problem", "research", "strategy", "execution", "metrics", "learnings"].map(
        (typeLabel, index) => ({
          id: `block-${typeLabel}-${Date.now()}-${index}`,
          caseStudyId: id,
          type: typeLabel as CaseStudyBlockType,
          title: blockLabels[typeLabel as CaseStudyBlockType],
          content: "",
          sortOrder: index + 1,
        }),
      ) : [];
      setPortfolio((cur) => ({ ...cur, caseStudies: [...cur.caseStudies, nextCase], blocks: [...cur.blocks, ...nextBlocks] }));
      setActiveCaseId(id);
    }
    setActiveTab("cases");
    setShowTypeModal(false);
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

  async function handlePrimaryDocUpload(event: ChangeEvent<HTMLInputElement>) {
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
    if (file.size > 20 * 1024 * 1024) {
      setUploadMessage("Files must be 20 MB or smaller.");
      event.target.value = "";
      return;
    }
    setUploadMessage("");
    setPrimaryDocUploading(true);
    if (isSupabase) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await serverUploadPrimaryDocument(activeCase.id, formData);
        if (result && !result.error && result.caseStudy) {
          setPortfolio((cur) => ({
            ...cur,
            caseStudies: cur.caseStudies.map((s) => s.id === result.caseStudy!.id ? result.caseStudy! : s),
          }));
          setUploadMessage(`✓ ${file.name} uploaded as primary document.`);
        } else {
          setUploadMessage(result?.error || "Upload failed.");
        }
      } catch (error) {
        console.error(error);
        setUploadMessage("Failed to connect to storage.");
      } finally {
        setPrimaryDocUploading(false);
      }
    } else {
      setTimeout(() => {
        setPortfolio((cur) => ({
          ...cur,
          caseStudies: cur.caseStudies.map((s) => s.id === activeCase.id ? { ...s, primaryDocumentUrl: "#" } : s),
        }));
        setUploadMessage(`✓ ${file.name} saved locally (no database connected).`);
        setPrimaryDocUploading(false);
      }, 800);
    }
    event.target.value = "";
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0] flex flex-col">
      {/* Top Bar / Status */}
      <div className="z-50">
        {!isSupabase && (
          <div className="bg-amber-500 text-white px-5 py-2 text-center text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <AlertTriangle size={12} />
            Preview Mode — Data will reset on refresh. Add Supabase keys to save permanently.
          </div>
        )}
        {storeLoading && (
          <div className="bg-violet-600 text-white px-5 py-2 text-center text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <Loader2 size={12} className="animate-spin" />
            Syncing workspace...
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay (Mobile) */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200/60 flex flex-col z-[50] transition-transform duration-300 lg:static lg:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <PortfolioMark />
            <button className="text-slate-400 hover:text-slate-600 transition">
              <Bell size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            {/* Primary Nav */}
            <div className="space-y-1">
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Navigation</p>
              <SidebarItem 
                icon={User} 
                label="Public Profile" 
                active={activeTab === "profile"} 
                onClick={() => { setActiveTab("profile"); setIsMobileMenuOpen(false); }} 
              />
              <SidebarItem 
                icon={BookOpen} 
                label="Case Studies" 
                active={activeTab === "cases"} 
                onClick={() => { setActiveTab("cases"); setIsMobileMenuOpen(false); }} 
                badge={portfolio.caseStudies.length}
              />
            </div>

            {/* Case List Sub-nav */}
            {activeTab === "cases" && (
              <div className="space-y-1 animate-fade-in">
                <div className="px-3 mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Work</p>
                  <button 
                    onClick={() => setShowTypeModal(true)}
                    className="size-6 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/20 hover:bg-violet-500 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {portfolio.caseStudies.length === 0 ? (
                    <div className="px-3 py-4 rounded-xl border border-dashed border-slate-200 text-center">
                      <p className="text-[11px] font-bold text-slate-400 italic">No case studies yet</p>
                    </div>
                  ) : (
                    portfolio.caseStudies
                      .slice()
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((study) => (
                        <button
                          key={study.id}
                          onClick={() => { setActiveCaseId(study.id); setIsMobileMenuOpen(false); }}
                          className={`w-full group flex flex-col gap-1 rounded-xl px-3 py-3 text-left transition-all ${
                            study.id === activeCaseId
                              ? "bg-violet-50 ring-1 ring-violet-200"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <span className={`text-sm font-bold truncate ${study.id === activeCaseId ? "text-violet-900" : "text-slate-700"}`}>
                            {study.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[100px]">
                              {study.company}
                            </span>
                            <span className={`ml-auto size-1.5 rounded-full ${study.published ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"}`} />
                          </div>
                        </button>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Account */}
            <div className="space-y-1">
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account</p>
              <SidebarItem icon={Settings} label="Settings" onClick={() => {}} />
              <SidebarItem 
                icon={LogOut} 
                label="Sign Out" 
                onClick={async () => { await auth.signOut(); router.push("/"); }} 
                variant="danger"
              />
            </div>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                {portfolio.profile.displayName?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{portfolio.profile.displayName || "User"}</p>
                <p className="text-[10px] font-bold text-slate-400 truncate">{auth.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-20 bg-white border-b border-slate-200/60 px-6 sm:px-8 flex items-center justify-between z-30 shadow-sm">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden size-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
              >
                <Menu size={20} />
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeTab === "profile" ? "Profile" : "Case Study"}</span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-sm font-bold text-slate-900 truncate max-w-[300px]">
                  {activeTab === "profile" ? "Public Identity" : (activeCase?.title || "Draft")}
                </span>
              </div>
              
              {saveStatus === "Saving" && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 animate-fade-in">
                  <Loader2 size={12} className="animate-spin text-violet-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Auto-saving...</span>
                </div>
              )}
              {saveStatus === "Saved" && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 animate-fade-in">
                  <Check size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Changes Saved</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/p/${portfolio.profile.username}`}
                target="_blank"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
              >
                <ExternalLink size={16} className="text-violet-500" />
                Preview Live
              </Link>
              {activeTab === "cases" && activeCase && (
                <button
                  onClick={removeCaseStudy}
                  className="size-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition active:scale-95"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-[#f8f9fa] custom-scrollbar">
            <div className="max-w-4xl mx-auto px-8 py-10">
              {/* Profile View */}
              {activeTab === "profile" && (
                <div className="space-y-8 animate-fade-in">
                  <SectionHeader 
                    title="Public Identity" 
                    description="How you appear to recruiters and hiring managers."
                  >
                    <TogglePublish
                      checked={portfolio.profile.published}
                      onChange={(v) => updateProfile("published", v)}
                      label="Public Visibility"
                    />
                  </SectionHeader>

                  <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                      <InputGroup label="Display Name" value={portfolio.profile.displayName} onChange={(v) => updateProfile("displayName", v)} />
                      <InputGroup label="Username / URL" value={portfolio.profile.username} onChange={(v) => updateProfile("username", slugify(v))} hint={`portfoliohub.me/p/${portfolio.profile.username}`} />
                      <InputGroup label="Professional Headline" value={portfolio.profile.headline} onChange={(v) => updateProfile("headline", v)} wide placeholder="e.g. Senior PM @ Growth & Core Experience" />
                      <InputGroup label="Location" value={portfolio.profile.location} onChange={(v) => updateProfile("location", v)} placeholder="e.g. San Francisco, CA" />
                      <InputGroup label="Contact Email" value={portfolio.profile.contactEmail} onChange={(v) => updateProfile("contactEmail", v)} />
                      <InputGroup label="Biography" value={portfolio.profile.bio} onChange={(v) => updateProfile("bio", v)} wide type="textarea" placeholder="Tell your product journey..." />
                      <InputGroup 
                        label="Core Expertise" 
                        value={portfolio.profile.skills.join(", ")} 
                        onChange={(v) => updateListField("skills", v)} 
                        wide 
                        hint="Comma-separated (e.g. SQL, Roadmapping, Product Strategy)" 
                      />
                      <InputGroup
                        label="External Links"
                        value={portfolio.profile.links.map((l) => `${l.label} | ${l.url}`).join("\n")}
                        onChange={(v) => updateListField("links", v)}
                        wide
                        type="textarea"
                        hint="Format: Label | URL (one per line)"
                        placeholder="LinkedIn | https://linkedin.com/in/..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cases View */}
              {activeTab === "cases" && (
                <div className="space-y-8 animate-fade-in">
                  {!activeCase ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                      <div className="size-20 rounded-[32px] bg-white shadow-xl shadow-violet-500/10 flex items-center justify-center text-violet-200 border border-slate-100 animate-float">
                        <BookOpen size={40} />
                      </div>
                      <div className="max-w-xs">
                        <h3 className="text-xl font-extrabold text-slate-900">No Case Study Selected</h3>
                        <p className="text-sm text-slate-500 mt-2">Pick a draft from the sidebar or start a new product story.</p>
                      </div>
                      <button
                        onClick={() => setShowTypeModal(true)}
                        className="inline-flex h-12 items-center gap-2 rounded-2xl bg-violet-600 px-6 text-sm font-bold text-white shadow-xl shadow-violet-500/20 hover:bg-violet-500 transition"
                      >
                        <Plus size={18} />
                        New Case Study
                      </button>
                    </div>
                  ) : (
                    <>
                      <SectionHeader 
                        title="Case Builder" 
                        description={`Type: ${activeCase.type === "manual" ? "Guided Narrative" : "Document Upload"}`}
                      >
                        <TogglePublish
                          checked={activeCase.published}
                          onChange={(v) => updateCase("published", v)}
                          label="Publish Live"
                        />
                      </SectionHeader>

                      <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm space-y-8">
                        <div className="grid gap-6 md:grid-cols-2">
                          <InputGroup label="Case Title" value={activeCase.title} onChange={(v) => updateCase("title", v)} wide />
                          <InputGroup label="Your Role" value={activeCase.role} onChange={(v) => updateCase("role", v)} placeholder="e.g. Lead PM" />
                          <InputGroup label="Company / Product" value={activeCase.company} onChange={(v) => updateCase("company", v)} />
                          <InputGroup label="Timeline" value={activeCase.timeframe} onChange={(v) => updateCase("timeframe", v)} placeholder="e.g. Q3 2025" />
                          <InputGroup label="URL Slug" value={activeCase.slug} onChange={(v) => updateCase("slug", slugify(v))} hint="Auto-generated from title" />
                          <InputGroup 
                            label="The 10-Second Summary" 
                            value={activeCase.summary} 
                            onChange={(v) => updateCase("summary", v)} 
                            wide 
                            type="textarea"
                            hint="Focus on: Problem, Action, and the measurable Result." 
                          />
                        </div>
                      </div>

                      {/* Path-specific Editor */}
                      {activeCase.type === "manual" ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Guided Story Blocks</h3>
                            <button
                              onClick={addBlock}
                              className="inline-flex h-9 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-xs font-bold text-violet-700 hover:bg-violet-100 transition"
                            >
                              <Plus size={14} />
                              Add Custom Block
                            </button>
                          </div>

                          <div className="space-y-4">
                            {activeBlocks.map((block, idx) => (
                              <article key={block.id} className="group rounded-3xl border border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div className="flex items-center gap-3 bg-slate-50/50 px-5 py-4 border-b border-slate-100">
                                  <div className="size-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                                    {idx + 1}
                                  </div>
                                  <select
                                    value={block.type}
                                    onChange={(e) => updateBlock(block.id, "type", e.target.value)}
                                    className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-400 outline-none cursor-pointer hover:text-violet-600 transition"
                                  >
                                    {blockTypes.map((type) => (
                                      <option key={type} value={type}>{blockLabels[type]}</option>
                                    ))}
                                  </select>
                                  <input
                                    value={block.title}
                                    onChange={(e) => updateBlock(block.id, "title", e.target.value)}
                                    className="flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none border-none focus:ring-0"
                                  />
                                  <button
                                    onClick={() => deleteBlock(block.id)}
                                    className="opacity-0 group-hover:opacity-100 size-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                                <textarea
                                  value={block.content}
                                  onChange={(e) => updateBlock(block.id, "content", e.target.value)}
                                  rows={5}
                                  placeholder={`Describe the ${block.title.toLowerCase()}... Focus on trade-offs and decisions.`}
                                  className="w-full bg-white px-5 py-4 text-sm leading-relaxed text-slate-700 outline-none resize-none placeholder-slate-300 focus:bg-slate-50/30 transition"
                                />
                              </article>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Primary Document</h3>
                          <label className={`group relative flex flex-col items-center justify-center gap-4 rounded-[32px] border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
                            primaryDocUploading
                              ? "border-blue-300 bg-blue-50"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 shadow-sm"
                          }`}>
                            <div className={`size-16 rounded-2xl flex items-center justify-center transition ${
                              primaryDocUploading ? "bg-blue-100 text-blue-600" : "bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                            }`}>
                              {primaryDocUploading ? <Loader2 className="animate-spin" size={32} /> : <FilePlus2 size={32} />}
                            </div>
                            <div>
                              <p className="text-base font-bold text-slate-900">{primaryDocUploading ? "Uploading PRD..." : "Upload Strategy Document"}</p>
                              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, or PPTX (Max 20MB)</p>
                            </div>
                            <input type="file" className="sr-only" onChange={handlePrimaryDocUpload} disabled={primaryDocUploading} />
                          </label>

                          {activeCase.primaryDocumentUrl && (
                            <div className="flex items-center justify-between rounded-2xl bg-blue-600 p-5 text-white shadow-xl shadow-blue-500/20 animate-fade-in">
                              <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
                                  <FileText size={24} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold">Document is Live</p>
                                  <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Available to visitors</p>
                                </div>
                              </div>
                              <a 
                                href={activeCase.primaryDocumentUrl} 
                                target="_blank" 
                                className="size-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                              >
                                <Download size={20} />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Shared Artifacts */}
                      <div className="space-y-6 pt-8 border-t border-slate-200/60">
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Supporting Evidence</h3>
                        <label className={`group relative flex flex-col items-center justify-center gap-4 rounded-[32px] border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
                          uploading
                            ? "border-violet-300 bg-violet-50"
                            : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30 shadow-sm"
                        }`}>
                          <div className={`size-14 rounded-2xl flex items-center justify-center transition ${
                            uploading ? "bg-violet-100 text-violet-600" : "bg-slate-50 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600"
                          }`}>
                            {uploading ? <Loader2 className="animate-spin" size={28} /> : <Paperclip size={28} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{uploading ? "Uploading Artifact..." : "Add Evidence"}</p>
                            <p className="text-[11px] text-slate-400 mt-1">PDF, Word, or PowerPoint (Max 12MB)</p>
                      </div>
                      <input type="file" className="sr-only" onChange={handleUpload} disabled={uploading} />
                    </label>

                    {uploadMessage && (
                      <div className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold border animate-fade-in ${
                        uploadMessage.startsWith("✓") 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : "bg-rose-50 border-rose-100 text-rose-700"
                      }`}>
                        {uploadMessage.startsWith("✓") ? <Check size={14} /> : <AlertTriangle size={14} />}
                        {uploadMessage}
                        <button onClick={() => setUploadMessage("")} className="ml-auto opacity-40 hover:opacity-100 transition">
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {activeAttachments.length > 0 && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {activeAttachments.map((item) => (
                              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-violet-200 transition">
                                <span className="flex items-center gap-3 min-w-0">
                                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                                    <FileText size={18} />
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{item.fileName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{formatFileSize(item.fileSize)}</p>
                                  </div>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Case Selection Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-5 bg-slate-950/40 backdrop-blur-md">
          <div className="w-full max-w-lg animate-scale-in rounded-[40px] border border-white/60 bg-white/90 p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-950 tracking-tight">New Case Study</h3>
                <p className="text-sm text-slate-500 mt-1">How do you want to show your work?</p>
              </div>
              <button onClick={() => setShowTypeModal(false)} className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid gap-4">
              <button 
                onClick={() => addCaseStudy("manual")}
                className="group flex items-start gap-5 rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 active:scale-[0.98]"
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors shadow-sm">
                  <PenLine size={28} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-950">Guided Narrative</p>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">Perfect for building a product story from scratch using our PM-focused story blocks.</p>
                </div>
              </button>

              <button 
                onClick={() => addCaseStudy("document")}
                className="group flex items-start gap-5 rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.98]"
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                  <FilePlus2 size={28} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-950">Document Upload</p>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">Already have a PRD or Deck? Upload it directly and add supporting context.</p>
                </div>
              </button>
            </div>

            <button 
              onClick={() => setShowTypeModal(false)}
              className="mt-8 w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-950 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── UI Components ────────────────────────────────── */

function SidebarItem({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  badge,
  variant = "default"
}: { 
  icon: any; 
  label: string; 
  active?: boolean; 
  onClick: () => void;
  badge?: number;
  variant?: "default" | "danger";
}) {
  const styles = {
    default: active 
      ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200" 
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
    danger: "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${styles[variant]}`}
    >
      <Icon size={18} className={active ? "text-violet-600" : ""} />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`ml-auto size-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
          active ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function SectionHeader({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-3xl font-black text-slate-950 tracking-tight">{title}</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

function InputGroup({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  wide = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "textarea";
  placeholder?: string;
  hint?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 px-1">
        {label}
      </label>
      {type === "text" ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 outline-none"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-900 placeholder-slate-300 transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 outline-none resize-none"
        />
      )}
      {hint && <p className="mt-2 text-[10px] font-bold text-slate-400 px-1 italic">{hint}</p>}
    </div>
  );
}

function TogglePublish({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`group flex items-center gap-3 rounded-2xl border px-4 py-2 transition-all ${
        checked 
          ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" 
          : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
      }`}
    >
      <div className={`relative h-4 w-7 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-slate-200"}`}>
        <div className={`absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-3.5" : "translate-x-0.5"}`} />
      </div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
      <span className={`text-[10px] font-black uppercase ${checked ? "text-emerald-600" : "text-slate-400"}`}>
        {checked ? "Live" : "Draft"}
      </span>
    </button>
  );
}
