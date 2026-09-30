import { cn } from "@/utils/cn";

/** Four-petal pinwheel mark used in the footer. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M0 0h20c0 11-9 20-20 20V0Z" fill="#a9cdf6" />
      <path d="M48 0v20C37 20 28 11 28 0h20Z" fill="#3f82ef" />
      <path d="M0 48V28c11 0 20 9 20 20H0Z" fill="#3f82ef" />
      <path d="M48 48H28c0-11 9-20 20-20v20Z" fill="#a9cdf6" />
      <path d="M20 20h8v8h-8z" fill="#5d98f2" />
      <path d="M20 0h8v20h-8zM0 20h20v8H0zM28 20h20v8H28zM20 28h8v20h-8z" fill="#6aa3f4" opacity=".9" />
    </svg>
  );
}

export function Wordmark({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span
      className={cn(
        "font-display font-normal tracking-[0.02em]",
        tone === "light" ? "text-white" : "text-helixa-ink",
        className,
      )}
    >
      HELIXA
    </span>
  );
}
