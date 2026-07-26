/**
 * Re-mounts on every route navigation, so each page enters with a
 * fade + rise animation (see .page-enter in globals.css).
 */
export default function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter flex flex-1 flex-col">{children}</div>;
}
