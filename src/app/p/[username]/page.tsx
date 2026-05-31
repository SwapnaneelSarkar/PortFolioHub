import { Metadata } from "next";
import { Suspense } from "react";
import { PublicPortfolio } from "@/components/PublicPortfolio";
import { fetchPublicPortfolio } from "@/app/actions/portfolio";
import { Loader2 } from "lucide-react";

// Exempt this request-time dynamic user route from static shell validation
export const unstable_instant = false;

type PageProps = {
  params: Promise<{ username: string }>;
};

// DYNAMIC SEO METADATA GENERATION
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await fetchPublicPortfolio(username);

  if (result && !("error" in result)) {
    const { profile } = result;
    return {
      title: `${profile.displayName} | Product Portfolio`,
      description: `${profile.headline}. ${profile.bio.substring(0, 150)}...`,
      openGraph: {
        title: `${profile.displayName} - Product Manager`,
        description: profile.headline,
        type: "profile",
      },
    };
  }

  return {
    title: `${username} | PortfolioHub`,
    description: "Product Manager portfolio case studies and support artifacts.",
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { username } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f6f3ee] flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      }
    >
      <PortfolioContent username={username} />
    </Suspense>
  );
}

// Child component that performs the async database lookup, properly suspended by parent Suspense
async function PortfolioContent({ username }: { username: string }) {
  const serverData = await fetchPublicPortfolio(username).catch(() => null);
  const initialData = serverData && !("error" in serverData) ? serverData : null;

  return <PublicPortfolio username={username} serverData={initialData} />;
}
