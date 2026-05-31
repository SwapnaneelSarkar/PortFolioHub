export type CaseStudyBlockType =
  | "problem"
  | "context"
  | "role"
  | "research"
  | "strategy"
  | "execution"
  | "metrics"
  | "learnings"
  | "custom";

export type UserProfile = {
  userId: string;
  username: string;
  displayName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  location: string;
  links: { label: string; url: string }[];
  skills: string[];
  contactEmail: string;
  published: boolean;
};

export type CaseStudy = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  summary: string;
  role: string;
  company: string;
  timeframe: string;
  coverImageUrl: string;
  published: boolean;
  sortOrder: number;
};

export type CaseStudyBlock = {
  id: string;
  caseStudyId: string;
  type: CaseStudyBlockType;
  title: string;
  content: string;
  sortOrder: number;
};

export type Attachment = {
  id: string;
  caseStudyId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
};

export type PortfolioData = {
  profile: UserProfile;
  caseStudies: CaseStudy[];
  blocks: CaseStudyBlock[];
  attachments: Attachment[];
};

export const acceptedAttachmentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const blockLabels: Record<CaseStudyBlockType, string> = {
  problem: "Problem",
  context: "Context",
  role: "My Role",
  research: "Research",
  strategy: "Strategy",
  execution: "Execution",
  metrics: "Metrics",
  learnings: "Learnings",
  custom: "Custom",
};

export const initialPortfolio: PortfolioData = {
  profile: {
    userId: "demo-user",
    username: "demo-pm",
    displayName: "Avery Shah",
    headline: "Senior Product Manager for B2B growth and self-serve adoption",
    bio: "I build clear, measurable product bets for complex workflows. My strongest work sits at the intersection of customer discovery, GTM alignment, and activation metrics.",
    avatarUrl: "",
    location: "San Francisco, CA",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com" },
      { label: "Resume", url: "https://example.com/resume.pdf" },
    ],
    skills: ["Product strategy", "Discovery", "Growth loops", "Experimentation", "Roadmapping"],
    contactEmail: "avery@example.com",
    published: true,
  },
  caseStudies: [
    {
      id: "case-activation",
      userId: "demo-user",
      slug: "self-serve-activation",
      title: "Increasing self-serve activation for sales-led teams",
      summary:
        "Redesigned the first-run journey and trial workspace model, increasing activation by 24% while reducing sales-assisted onboarding load.",
      role: "Lead PM",
      company: "Northstar CRM",
      timeframe: "Q1-Q2 2026",
      coverImageUrl: "",
      published: true,
      sortOrder: 1,
    },
    {
      id: "case-reporting",
      userId: "demo-user",
      slug: "executive-reporting",
      title: "Launching executive reporting for enterprise renewals",
      summary:
        "Shipped a cross-functional reporting surface that gave account teams clearer proof of adoption before renewal conversations.",
      role: "Product Manager",
      company: "Northstar CRM",
      timeframe: "Q3 2025",
      coverImageUrl: "",
      published: true,
      sortOrder: 2,
    },
  ],
  blocks: [
    {
      id: "block-activation-problem",
      caseStudyId: "case-activation",
      type: "problem",
      title: "Problem",
      content:
        "Trial accounts were created by champions, but setup stalled before teams invited collaborators or imported real pipeline data.",
      sortOrder: 1,
    },
    {
      id: "block-activation-research",
      caseStudyId: "case-activation",
      type: "research",
      title: "Discovery",
      content:
        "I reviewed funnel drop-off, interviewed 12 evaluators, and mapped the moments where users could not connect setup tasks to business value.",
      sortOrder: 2,
    },
    {
      id: "block-activation-execution",
      caseStudyId: "case-activation",
      type: "execution",
      title: "What changed",
      content:
        "We introduced role-based setup paths, sample data previews, and a tighter invite flow that made team activation visible before CRM import.",
      sortOrder: 3,
    },
    {
      id: "block-activation-metrics",
      caseStudyId: "case-activation",
      type: "metrics",
      title: "Impact",
      content:
        "Activation rose from 31% to 55%, trial-to-opportunity conversion improved by 11%, and onboarding tickets dropped by 18%.",
      sortOrder: 4,
    },
    {
      id: "block-reporting-problem",
      caseStudyId: "case-reporting",
      type: "problem",
      title: "Problem",
      content:
        "Enterprise buyers wanted proof that their teams were adopting key workflows, but CSMs stitched together evidence manually.",
      sortOrder: 1,
    },
    {
      id: "block-reporting-strategy",
      caseStudyId: "case-reporting",
      type: "strategy",
      title: "Strategy",
      content:
        "I prioritized three renewal-critical signals: active team usage, workflow completion, and expansion-ready feature adoption.",
      sortOrder: 2,
    },
    {
      id: "block-reporting-learnings",
      caseStudyId: "case-reporting",
      type: "learnings",
      title: "Learning",
      content:
        "The highest-value reports were not the most comprehensive ones; they were the ones that made the next customer conversation obvious.",
      sortOrder: 3,
    },
  ],
  attachments: [
    {
      id: "artifact-activation",
      caseStudyId: "case-activation",
      fileName: "activation-readout.pdf",
      fileType: "application/pdf",
      fileUrl: "#",
      fileSize: 1240000,
      createdAt: "2026-05-10T10:00:00.000Z",
    },
  ],
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
