import { Metadata } from "next";
import { Suspense } from "react";
import { PublicCaseStudy } from "@/components/PublicPortfolio";
import { fetchPublicCaseStudy } from "@/app/actions/portfolio";
import { Loader2 } from "lucide-react";

// Exempt this request-time dynamic user route from static shell validation
export const unstable_instant = false;

type PageProps = {
  params: Promise<{ username: string; slug: string }>;
};

// DYNAMIC SEO METADATA GENERATION
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const result = await fetchPublicCaseStudy(username, slug);

  if (result && !("error" in result)) {
    const { profile, caseStudy } = result;
    return {
      title: `${caseStudy.title} | ${profile.displayName} Case Study`,
      description: `${caseStudy.summary}. Lead role: ${caseStudy.role} at ${caseStudy.company}.`,
      openGraph: {
        title: caseStudy.title,
        description: caseStudy.summary,
        type: "article",
      },
    };
  }

  return {
    title: "Case Study | PortfolioHub",
    description: "Product management case study detailing execution and product impact metrics.",
  };
}

export default function CaseStudyPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f6f3ee] flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      }
    >
      {params.then(({ username, slug }) => (
        <CaseStudyContent username={username} slug={slug} />
      ))}
    </Suspense>
  );
}

// Child component that performs async data fetching, properly suspended under the parent Suspense boundary
async function CaseStudyContent({ username, slug }: { username: string; slug: string }) {
  const serverData = await fetchPublicCaseStudy(username, slug).catch(() => null);
  const initialData = serverData && !("error" in serverData) ? serverData : null;

  return <PublicCaseStudy username={username} slug={slug} serverData={initialData} />;
}
