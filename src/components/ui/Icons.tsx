import type { SVGProps } from "react";

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M3 8h9.5M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M3 4.75 6 7.5l3-2.75" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** DNA sequencing glyph — helix with motion ticks (active service card). */
export function DnaSequencingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <g strokeLinecap="round" fill="none">
        <path d="M74 14C74 40 46 44 46 60s28 20 28 46" stroke="currentColor" strokeWidth="11" />
        <path d="M46 14c0 26 28 30 28 46s-28 20-28 46" stroke="var(--icon-cut, #5d98d6)" strokeWidth="19" />
        <path d="M46 14c0 26 28 30 28 46s-28 20-28 46" stroke="currentColor" strokeWidth="11" />
        <path d="M55 51h11M53 60h14M55 69h11" stroke="currentColor" strokeWidth="4" />
        <path d="M86 30h14M90 39h10M86 48h12M14 74h16M20 83h12M14 92h14" stroke="currentColor" strokeWidth="3.6" />
      </g>
    </svg>
  );
}

/** Tilted double helix glyph (genetic testing). */
export function DnaTiltedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M22 96c10-4 18-10 26-18s12-18 22-28 18-14 28-18" strokeWidth="9" />
        <path d="M24 78c10 4 16 12 20 22M40 60c10 6 16 14 18 22M60 40c6 8 12 14 22 18M78 22c6 8 10 14 20 20" strokeWidth="9" />
        <path d="M36 72l10 10M46 62l12 12M58 50l12 12M68 40l10 10" strokeWidth="4.5" />
      </g>
      <circle cx="20" cy="97" r="6" fill="currentColor" />
      <circle cx="100" cy="30" r="6" fill="currentColor" />
      <circle cx="80" cy="18" r="5" fill="currentColor" />
    </svg>
  );
}

/** Crossed helix glyph (bioinformatics analysis). */
export function DnaCrossIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <path d="M18 88c14 2 22-8 30-18s16-22 28-26 22 0 28-8" strokeWidth="8.5" />
        <path d="M34 102c-4-12 2-22 12-30s22-14 30-24 10-22 22-30" strokeWidth="8.5" />
        <path d="M40 76l8 8M52 64l8 8M64 52l8 8M76 42l7 7" strokeWidth="4.5" />
      </g>
      <circle cx="16" cy="88" r="6" fill="currentColor" />
      <circle cx="34" cy="104" r="6" fill="currentColor" />
      <circle cx="98" cy="18" r="6" fill="currentColor" />
      <circle cx="106" cy="36" r="6" fill="currentColor" />
    </svg>
  );
}
