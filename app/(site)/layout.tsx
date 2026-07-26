import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { getProfile, getSiteConfig } from "@/app/lib/content";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, profile] = await Promise.all([getSiteConfig(), getProfile()]);
  return (
    <>
      <SiteHeader siteTitle={site.title} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter site={site} profile={profile} />
    </>
  );
}
