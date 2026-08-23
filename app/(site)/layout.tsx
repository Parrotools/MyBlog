import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import SkyBackdrop from "@/app/components/SkyBackdrop";
import MinecraftIntro from "@/app/intro/MinecraftIntro";
import { getProfile, getSiteConfig } from "@/app/lib/content";
import { cookies } from "next/headers";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, profile, cookieStore] = await Promise.all([
    getSiteConfig(),
    getProfile(),
    cookies(),
  ]);
  return (
    <>
      {!cookieStore.has("intro_seen") && <MinecraftIntro />}
      <SkyBackdrop />
      <SiteHeader siteTitle={site.title} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter site={site} profile={profile} />
    </>
  );
}
