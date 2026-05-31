import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | PortfolioHub",
    default: "PortfolioHub | The Portfolio Builder for Product Managers",
  },
  description: "Prove your judgment, not just your title. PortfolioHub helps PMs build credible, artifact-backed case studies in minutes.",
  keywords: ["Product Manager Portfolio", "PM Case Study", "Product Management", "PRD Portfolio", "Career Growth"],
  authors: [{ name: "PortfolioHub Team" }],
  openGraph: {
    title: "PortfolioHub | The Portfolio Builder for Product Managers",
    description: "Prove your judgment, not just your title. Built for modern Product Managers.",
    url: "https://portfoliohub.me",
    siteName: "PortfolioHub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PortfolioHub Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortfolioHub | The Portfolio Builder for Product Managers",
    description: "Prove your judgment, not just your title. Built for modern Product Managers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
