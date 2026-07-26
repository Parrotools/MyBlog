"use client";

import { useActionState } from "react";
import { changePasswordAction, type ActionState } from "@/app/admin/actions";
import { btnGhost, inputCls, labelCls } from "./ui";

export default function PasswordForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    changePasswordAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Current password</label>
          <input
            name="current"
            type="password"
            autoComplete="current-password"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>New password (min 8 chars)</label>
          <input
            name="next"
            type="password"
            autoComplete="new-password"
            required
            className={inputCls}
          />
        </div>
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.ok && <p className="text-sm text-lime-500">Password changed ✓</p>}
      <button type="submit" disabled={pending} className={btnGhost}>
        {pending ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
