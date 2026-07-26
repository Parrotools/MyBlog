import type { Metadata } from "next";
import { btnPrimary, cardCls, inputCls, labelCls } from "@/app/components/admin/ui";
import {
  getHotbar,
  getInterests,
  getProfile,
  getTimeline,
} from "@/app/lib/content";
import { saveProfileAction } from "../../actions";

export const metadata: Metadata = {
  title: "Admin — Profile",
  robots: { index: false },
};

export default async function AdminProfile({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const [profile, interests, timeline, hotbar] = await Promise.all([
    getProfile(),
    getInterests(),
    getTimeline(),
    getHotbar(),
  ]);
  const interestsText = interests
    .map((g) => `${g.title}: ${g.items.join(", ")}`)
    .join("\n");
  const timelineText = timeline
    .map((t) => `${t.year} | ${t.title} | ${t.detail} | ${t.done ? "done" : "planned"}`)
    .join("\n");
  const hotbarText = hotbar
    .map((s) => [s.label, s.glyph, s.color, s.rarity, ...s.lore].join(" | "))
    .join("\n");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-bold text-heading">Profile</h1>
      <p className="mt-2 text-sm text-muted">
        Powers the homepage hero, the About page and the footer.
      </p>
      {saved && (
        <p className="mt-4 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-2.5 text-sm text-lime-500">
          Saved ✓
        </p>
      )}

      <form action={saveProfileAction} className={`${cardCls} mt-8 space-y-5`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name</label>
            <input name="name" defaultValue={profile.name} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input
              name="tagline"
              defaultValue={profile.tagline}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Intro (hero + about)</label>
          <textarea
            name="intro"
            rows={3}
            defaultValue={profile.intro}
            className={inputCls}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Education</label>
            <input
              name="education"
              defaultValue={profile.education}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Skills (comma-separated)</label>
            <input
              name="skills"
              defaultValue={profile.skills.join(", ")}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>
            &quot;A place to record&quot; chips (comma-separated)
          </label>
          <input
            name="records"
            defaultValue={profile.records.join(", ")}
            className={inputCls}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>GitHub URL</label>
            <input
              name="github"
              defaultValue={profile.github}
              className={`${inputCls} font-mono`}
            />
          </div>
          <div>
            <label className={labelCls}>X URL</label>
            <input
              name="x"
              defaultValue={profile.x}
              className={`${inputCls} font-mono`}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              name="email"
              defaultValue={profile.email}
              className={`${inputCls} font-mono`}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Avatar image URL (from Images)</label>
            <input
              name="avatar"
              defaultValue={profile.avatar}
              placeholder="/uploads/… (empty = grass block)"
              className={`${inputCls} font-mono`}
            />
          </div>
          <div>
            <label className={labelCls}>Level</label>
            <input
              name="level"
              type="number"
              defaultValue={profile.level}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>XP %</label>
            <input
              name="xpPercent"
              type="number"
              min={0}
              max={100}
              defaultValue={profile.xpPercent}
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>XP bar label</label>
            <input
              name="xpLabel"
              defaultValue={profile.xpLabel}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>&quot;Next level&quot; label</label>
            <input
              name="xpNext"
              defaultValue={profile.xpNext}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>
            Interests — one group per line: &quot;Group title: item, item&quot;
          </label>
          <textarea
            name="interests"
            rows={5}
            defaultValue={interestsText}
            className={`${inputCls} font-mono`}
          />
        </div>
        <div>
          <label className={labelCls}>
            Timeline — one entry per line: &quot;year | title | detail |
            done/planned&quot;
          </label>
          <textarea
            name="timeline"
            rows={5}
            defaultValue={timelineText}
            className={`${inputCls} font-mono`}
          />
        </div>
        <div>
          <label className={labelCls}>
            Hotbar (max 9) — &quot;label | glyph | #tile-color | #name-color |
            lore | lore&quot;
          </label>
          <textarea
            name="hotbar"
            rows={9}
            defaultValue={hotbarText}
            className={`${inputCls} font-mono`}
          />
        </div>
        <button type="submit" className={btnPrimary}>
          Save profile
        </button>
      </form>
    </div>
  );
}
