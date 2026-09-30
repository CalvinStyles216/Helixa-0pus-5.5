import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect } from "react";
import { PillButton } from "@/components/ui/ArrowButton";
import { CellularField } from "@/components/ui/CellularField";
import { FadeUp, RevealLines } from "@/motion/reveal";

const CTA_BG = [
  "radial-gradient(34% 40% at 50% 26%, rgba(36,86,190,0.85) 0%, rgba(36,86,190,0) 100%)",
  "radial-gradient(70% 90% at 50% 20%, #3d74c8 0%, #4f8bcf 38%, #6eaad9 62%, #8fc7e6 82%, #a9d8ec 100%)",
].join(",");

const FADE_MASK = "radial-gradient(92% 118% at 50% -6%, #000 56%, rgba(0,0,0,0.6) 70%, transparent 86%)";

export function CTA() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 40, damping: 20 });
  const y = useSpring(my, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * -14);
      my.set((e.clientY / window.innerHeight - 0.5) * -10);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  return (
    <section id="cta" aria-labelledby="cta-heading" className="relative isolate overflow-hidden text-center text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ WebkitMaskImage: FADE_MASK, maskImage: FADE_MASK }}
      >
        <div className="absolute inset-0" style={{ background: CTA_BG }} />
        <motion.div className="absolute -inset-4" style={{ x, y }}>
          <CellularField className="opacity-60 mix-blend-screen" seed={9} />
        </motion.div>
      </div>

      <div className="container-x relative pb-[clamp(150px,14vw,230px)] pt-[clamp(96px,8.6vw,140px)]">
        <RevealLines
          as="h2"
          className="mx-auto font-display text-[var(--fs-cta)] font-normal leading-[1.1] tracking-[-0.03em]"
          lines={[{ key: "c1", content: <span id="cta-heading">Unlock The Power Of Your DNA</span> }]}
        />
        <FadeUp delay={0.25} className="mx-auto mt-[clamp(28px,3.4vw,56px)] max-w-[44em]">
          <p className="text-[clamp(15px,1.16vw,19px)] leading-[1.65] tracking-[-0.005em] text-white/95">
            Partner with Helixa to transform complex genomic data into accurate insights,{" "}
            <br className="hidden md:block" />
            meaningful discoveries, and confident scientific decisions.
          </p>
        </FadeUp>
        <FadeUp delay={0.45} className="mt-[clamp(32px,3.6vw,58px)] flex justify-center">
          <PillButton href="#home" size="lg">
            Get Started
          </PillButton>
        </FadeUp>
      </div>
    </section>
  );
}
