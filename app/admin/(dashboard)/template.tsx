/** Same enter animation for dashboard pages. */
export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter flex flex-1 flex-col">{children}</div>;
}
