import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { PillButton } from "@/components/ui/ArrowButton";
import { Wordmark } from "@/components/ui/Logo";
import { EASE_OUT_EXPO } from "@/motion/transitions";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#about" },
  { label: "Product", href: "#services" },
  { label: "Support", href: "#process" },
  { label: "Pricing", href: "#cta" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.header
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.1, ease: EASE_OUT_EXPO }}
      className="absolute inset-x-0 top-0 z-40 text-white"
    >
      <div className="container-x relative flex h-[clamp(62px,4.8vw,80px)] items-center justify-between border-b border-white/[0.16]">
        <a href="#home" className="focus-ring rounded-sm text-[clamp(18px,1.42vw,23px)]" aria-label="Helixa home">
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="absolute left-[47.2%] hidden -translate-x-1/2 md:block">
          <ul className="flex items-center gap-[clamp(26px,3.55vw,62px)]">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="nav-link focus-ring rounded-sm text-[clamp(13.5px,1.08vw,17px)] font-light tracking-[0.005em] text-white/[0.88] transition-colors duration-500 hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <PillButton href="#cta" className="hidden md:inline-flex">
          Contact&nbsp; Us
        </PillButton>

        <button
          type="button"
          className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`absolute h-px w-4 bg-white transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
          <span className={`absolute h-px w-4 bg-white transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            className="container-x md:hidden"
          >
            <div className="mt-3 rounded-2xl border border-white/20 bg-[#2f63ad]/70 p-5 shadow-[0_20px_60px_-30px_rgba(0,20,60,0.6)] backdrop-blur-xl">
              <ul className="flex flex-col gap-1">
                {LINKS.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="focus-ring block rounded-lg px-2 py-2.5 font-display text-[20px] font-light text-white/90"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <PillButton href="#cta" className="mt-4 w-full">
                Contact&nbsp; Us
              </PillButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
