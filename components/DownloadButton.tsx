"use client";

type Props = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

export function DownloadButton({ label, onClick, variant = "primary" }: Props) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 active:bg-zinc-900"
      : "inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 active:bg-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {label}
    </button>
  );
}
