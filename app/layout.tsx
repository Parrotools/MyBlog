import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "katex/dist/katex.min.css";
import "./globals.css";
import PageJump from "./components/PageJump";
import { getSiteConfig } from "./lib/content";
import { SITE_URL } from "./lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: site.title,
      template: `%s · ${site.title}`,
    },
    description: site.description,
    alternates: {
      types: { "application/rss+xml": "/feed.xml" },
    },
    openGraph: {
      siteName: site.title,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Suspense fallback={null}>
            <PageJump />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
