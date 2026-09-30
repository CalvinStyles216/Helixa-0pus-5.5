import { motion, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { ProceduralDNA } from "@/components/dna/ProceduralDNA";
import { ABOUT_DNA } from "@/components/dna/DNAConfig";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeUp, RevealLines } from "@/motion/reveal";
import { EASE_OUT_EXPO } from "@/motion/transitions";

/** Words that settle from ink into the muted editorial gray after the line reveal. */
function Muted({ children, delay }: { children: ReactNode; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={{ color: reduce ? "#86898d" : "#0e0f11" }}
      whileInView={{ color: "#86898d" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.8, delay: reduce ? 0 : delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.span>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  return (
    <section id="about" ref={sectionRef} aria-labelledby="about-heading" className="relative isolate overflow-hidden bg-white">
      <div className="relative md:grid md:min-h-[clamp(640px,54vw,900px)] md:grid-cols-2">
        {/* Procedural DNA — left column, cropped at the section edges */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: -30, y: 40 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 2.2, ease: EASE_OUT_EXPO }}
          className="relative h-[clamp(380px,100vw,520px)] md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-[56%]"
        >
          <ProceduralDNA config={ABOUT_DNA} scrollTarget={sectionRef} className="absolute inset-0" seed={23} />
        </motion.div>

        <div className="container-x pointer-events-none absolute left-0 top-[clamp(28px,7.9vw,126px)] z-10">
          <SectionLabel>About Us</SectionLabel>
        </div>

        <div className="container-x relative z-10 pb-20 pt-6 md:col-start-2 md:pb-[clamp(80px,8vw,130px)] md:pl-[clamp(12px,1.2vw,20px)] md:pt-[clamp(90px,7.4vw,124px)]">
          <h2 id="about-heading" className="sr-only">
            About Helixa
          </h2>
          <RevealLines
            as="p"
            delay={0.15}
            stagger={0.13}
            className="t-about max-w-[16.5em] text-helixa-ink"
            lines={[
              { key: "a1", content: "At Helixa, we turn DNA" },
              {
                key: "a2",
                content: (
                  <>
                    sequencing and <Muted delay={0.9}>genomic data</Muted>
                  </>
                ),
              },
              { key: "a3", content: <Muted delay={1.05}>into insights, helping researchers</Muted> },
              { key: "a4", content: <Muted delay={1.2}>and healthcare innovate.</Muted> },
            ]}
          />
          <FadeUp delay={0.55} className="mt-[clamp(44px,6.1vw,100px)] max-w-[40.5em]">
            <p className="text-[clamp(15px,1.12vw,18px)] leading-[1.78] tracking-[-0.005em] text-helixa-muted">
              Delivering precision genomics solutions that transform complex genetic information into meaningful
              discoveries, enabling researchers, healthcare providers, and organizations to make confident decisions,
              accelerate innovation, and advance scientific understanding through accurate sequencing and expert
              analysis.
            </p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
