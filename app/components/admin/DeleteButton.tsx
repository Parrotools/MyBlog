"use client";

import { btnDanger } from "./ui";

/** Submit button that asks for confirmation before the form action fires. */
export default function DeleteButton({
  label = "Delete",
  confirmText = "Delete this? There is no undo.",
  className,
}: {
  label?: string;
  confirmText?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className ?? btnDanger}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}
