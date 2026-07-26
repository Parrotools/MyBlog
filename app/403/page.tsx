import { forbidden } from "next/navigation";

export const dynamic = "force-dynamic";

/** Preview route: renders the 403 page (app/forbidden.tsx) with a real 403 status. */
export default function ForbiddenDemo() {
  forbidden();
}
