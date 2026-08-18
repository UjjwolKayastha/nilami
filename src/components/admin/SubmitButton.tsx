"use client";

import { useFormStatus } from "react-dom";

function Spinner() {
  return (
    <svg
      className="size-3.5 shrink-0 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Submit button that disables itself and shows a spinner while its parent
 * form's action is in flight. Must be rendered inside the <form> it submits.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = "",
  disabled,
  ...props
}: React.ComponentProps<"button"> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 ${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {pending && <Spinner />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
