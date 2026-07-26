import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BlockIcon from "@/app/components/BlockIcon";
import LoginForm from "@/app/components/admin/LoginForm";
import { getSessionUser } from "@/app/lib/auth";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10rem] h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-lime-500/10 blur-[130px]" />
      </div>
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <BlockIcon variant="iron" className="h-14 w-14" />
          <div>
            <h1 className="text-xl font-bold text-heading">Server room</h1>
            <p className="mt-1 text-sm text-muted">
              Admins only — everyone else meets the iron door.
            </p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
