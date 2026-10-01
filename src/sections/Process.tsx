import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { ProceduralDNA, type DNAStageApi } from "@/components/dna/ProceduralDNA";
import { PROCESS_DNA } from "@/components/dna/DNAConfig";
import { NotchCard } from "@/components/ui/NotchCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeUp, RevealLines } from "@/motion/reveal";
import { EASE_OUT_EXPO, EASE_OUT_QUART } from "@/motion/transitions";
import { cn } from "@/utils/cn";

const STEPS = [
  {
    n: "01",
    title: "Collect & Prepare",
    body: "Biological samples are securely collected, registered, and prepared using rigorous laboratory protocols to ensure data quality.",
  },
  {
    n: "02",
    title: "Sequence & Analyze",
    body: "Advanced sequencing technologies and bioinformatics pipelines generate, process, and interpret comprehensive genomic data.",
  },
  {
    n: "03",
    title: "Validate & Report",
    body: "Results undergo quality verification before being delivered through clear, actionable reports for research and clinical applications.",
  },
];

const MOBILE_ANCHORS = [0.18, 0.5, 0.82];

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reveal = useRef<number[]>([0, 0, 0]);
  const desktop = useRef(true);
  const reduce = useReducedMotion();
  const inView = useInView(wrapperRef, { once: true, margin: "0px 0px -25% 0px" });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const set = () => (desktop.current = mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // Connector reveal choreography (drives refs, never React state).
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      reveal.current = [1, 1, 1];
      return;
    }
    const controls = STEPS.map((_, i) =>
      animate(0, 1, {
        duration: 1.6,
        delay: 0.6 + i * 0.28,
        ease: EASE_OUT_QUART,
        onUpdate: (v) => (reveal.current[i] = v),
      }),
    );
    return () => controls.forEach((c) => c.stop());
  }, [inView, reduce]);

  /** Runs every WebGL frame: pins stay welded to the revolving helix. */
  const onFrame = useCallback((api: DNAStageApi) => {
    for (let i = 0; i < STEPS.length; i++) {
      const pin = pinRefs.current[i];
      const line = lineRefs.current[i];
      if (!pin || !line) continue;
      let cx: number;
      let top = 0;
      const card = cardRefs.current[i];
      if (desktop.current && card) {
        cx = card.offsetLeft + card.offsetWidth / 2;
        top = card.offsetTop + card.offsetHeight;
      } else {
        cx = api.width * MOBILE_ANCHORS[i];
      }
      const hit = api.topmostAtX(cx);
      const r = reveal.current[i];
      if (!hit) {
        pin.style.opacity = "0";
        line.style.opacity = "0";
        continue;
      }
      const pinR = Math.min(Math.max((r - 0.55) / 0.45, 0), 1);
      pin.style.opacity = String(pinR);
      pin.style.transform = `translate3d(${cx}px, ${hit.y}px, 0) scale(${0.6 + pinR * 0.4})`;
      if (desktop.current) {
        const len = Math.max(hit.y - top - 7, 0);
        line.style.opacity = r > 0 ? "1" : "0";
        line.style.transform = `translate3d(${cx}px, ${top}px, 0) scaleY(${len * Math.min(r / 0.7, 1)})`;
      } else {
        line.style.opacity = "0";
      }
    }
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="process-heading"
      className="relative isolate overflow-hidden text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(180deg,#3769b5 0%,#4079bf 18%,#4f8cca 34%,#65a3d4 50%,#84bde0 64%,#a7d3ea 76%,#d3ebf6 88%,#ffffff 97%)",
        }}
      />

      <div className="container-x pt-[clamp(72px,7.9vw,124px)]">
        <SectionLabel tone="onBlue">Our&nbsp; Process</SectionLabel>
        <div className="mt-[clamp(20px,2.3vw,36px)] flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <RevealLines
            as="h2"
            className="t-h2 font-light text-white"
            lines={[
              { key: "p1", content: <span id="process-heading">From Sample To</span> },
              { key: "p2", content: "Scientific Insight" },
            ]}
          />
          <FadeUp delay={0.3} className="md:w-[43.5%]">
            <p className="text-[clamp(15px,1.14vw,18.5px)] leading-[1.65] tracking-[-0.005em] text-white/95">
              A streamlined workflow designed to deliver accurate genomic analysis, reliable results, and actionable
              insights at every stage.
            </p>
          </FadeUp>
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="relative mt-[clamp(40px,4.6vw,72px)] pb-16 md:pb-[clamp(400px,41vw,660px)]"
      >
        {/* DNA stage: full-bleed behind the callouts */}
        <div className="relative h-[clamp(360px,95vw,460px)] md:absolute md:inset-0 md:h-auto">
          <ProceduralDNA
            config={PROCESS_DNA}
            scrollTarget={sectionRef}
            onFrame={onFrame}
            className="absolute inset-0"
            seed={41}
          />
        </div>

        {/* Connector lines + pins, positioned every frame from 3D projection */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
          {STEPS.map((s, i) => (
            <div key={s.n}>
              <div
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className="absolute left-0 top-0 h-px w-px origin-top bg-white/85 opacity-0"
              />
              <div
                ref={(el) => {
                  pinRefs.current[i] = el;
                }}
                className="absolute left-0 top-0 opacity-0"
              >
                <span className="pin-pulse absolute left-0 top-0 h-[18px] w-[18px] rounded-full border border-white/80" />
                <span className="absolute left-0 top-0 flex h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-white bg-[#6d9fdc]/70 shadow-[0_0_14px_rgba(255,255,255,0.7)]">
                  <span className="h-[8px] w-[8px] rounded-full bg-white" />
                </span>
                <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-[34px] rounded-[4px] bg-white/20 px-1.5 py-0.5 font-display text-[12px] text-white backdrop-blur md:hidden">
                  {s.n}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Callout cards */}
        <ol className="container-x grid gap-4 md:grid-cols-3 md:items-start md:gap-x-[5vw] md:gap-y-0">
          {STEPS.map((s, i) => (
            <li key={s.n} className={cn("list-none", i === 1 && "md:mt-[clamp(96px,10.6vw,168px)]")}>
              <motion.div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 1.4, delay: 0.15 + i * 0.18, ease: EASE_OUT_EXPO }}
                className="relative z-10"
              >
                <NotchCard
                  size="sm"
                  className="bg-white/[0.13] backdrop-blur-[7px] transition-colors duration-700 hover:bg-white/[0.18]"
                  strokeClassName="stroke-white/35"
                >
                  <div className="p-[clamp(16px,1.5vw,24px)]">
                    <div className="flex items-baseline justify-between gap-4 pr-[clamp(26px,2.6vw,40px)]">
                      <h3 className="font-display text-[clamp(17px,1.4vw,22px)] font-normal tracking-[-0.01em]">
                        {s.title}
                      </h3>
                      <span className="font-display text-[clamp(17px,1.4vw,22px)] font-light tabular-nums">{s.n}</span>
                    </div>
                    <p className="mt-[clamp(16px,1.6vw,26px)] text-[clamp(14px,1.08vw,17px)] leading-[1.62] tracking-[-0.005em] text-white/90">
                      {s.body}
                    </p>
                  </div>
                </NotchCard>
              </motion.div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
