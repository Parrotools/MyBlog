import type { Metadata } from "next";
import PasswordForm from "@/app/components/admin/PasswordForm";
import { btnPrimary, cardCls, inputCls, labelCls } from "@/app/components/admin/ui";
import { getSiteConfig } from "@/app/lib/content";
import { saveSiteAction } from "../../actions";

export const metadata: Metadata = {
  title: "Admin — Settings",
  robots: { index: false },
};

export default async function AdminSettings({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const site = await getSiteConfig();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-bold text-heading">Website settings</h1>
      {saved && (
        <p className="mt-4 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-2.5 text-sm text-lime-500">
          Saved ✓
        </p>
      )}

      <form action={saveSiteAction} className={`${cardCls} mt-8 space-y-5`}>
        <div>
          <label className={labelCls}>Site title</label>
          <input name="title" defaultValue={site.title} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Description (SEO + footer)</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={site.description}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Footer note</label>
          <input
            name="footerNote"
            defaultValue={site.footerNote}
            className={inputCls}
          />
        </div>
        <button type="submit" className={btnPrimary}>
          Save settings
        </button>
      </form>

      <div className={`${cardCls} mt-8`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          Security
        </h2>
        <PasswordForm />
      </div>
    </div>
  );
}
