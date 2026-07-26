import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "katex/dist/katex.min.css";
import "./globals.css";
import { I18nProvider } from "./components/I18nProvider";
import PageJump from "./components/PageJump";
import { getSiteConfig } from "./lib/content";
import { getLocale } from "./lib/locale";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* transitions stay enabled on theme change so the sky cross-fades
            like dawn/dusk when the user sets time day/night */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <I18nProvider locale={locale}>
            {children}
            <Suspense fallback={null}>
              <PageJump />
            </Suspense>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
