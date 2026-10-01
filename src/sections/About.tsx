import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeUp, RevealLines } from "@/motion/reveal";
import { EASE_OUT_EXPO } from "@/motion/transitions";

/** Words that settle from ink into the muted editorial gray after the line reveal. */
function Muted({ children, delay }: { children: ReactNode; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={{ color: reduce ? "#475569" : "#0f172a" }}
      whileInView={{ color: "#475569" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.8, delay: reduce ? 0 : delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.span>
  );
}

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative isolate overflow-hidden bg-white min-h-[clamp(640px,54vw,900px)] flex flex-col justify-center"
    >
      {/* Seamless background video showing blue DNA helix on the left with bright white space on the right */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src="https://res.cloudinary.com/dpiifnzd7/video/upload/v1790840194/DNA_Section_2_Enhanced_q45hdi.mp4"
        className="absolute inset-0 h-full w-full object-cover -z-10 pointer-events-none select-none"
      />

      <div className="container-x relative z-10 w-full py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left spacer column: leaves the blue DNA helix unobstructed */}
          <div className="hidden lg:block lg:col-span-5 pointer-events-none" aria-hidden="true" />

          {/* Right column: content positioned in the open white space */}
          <div className="lg:col-span-7 max-w-xl lg:ml-auto">
            <SectionLabel className="mb-6 bg-white/90 text-slate-900 border border-slate-200/60 shadow-sm">
              About Us
            </SectionLabel>

            <h2 id="about-heading" className="sr-only">
              About Helixa
            </h2>

            <RevealLines
              as="p"
              delay={0.15}
              stagger={0.13}
              className="t-about text-slate-900 font-light"
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

            <FadeUp delay={0.55} className="mt-[clamp(28px,3.8vw,52px)]">
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 sm:p-8 backdrop-blur-md shadow-lg shadow-slate-200/50">
                <p className="text-[clamp(15px,1.12vw,17.5px)] leading-[1.78] tracking-[-0.005em] text-slate-700">
                  Delivering precision genomics solutions that transform complex genetic information into meaningful
                  discoveries, enabling researchers, healthcare providers, and organizations to make confident decisions,
                  accelerate innovation, and advance scientific understanding through accurate sequencing and expert
                  analysis.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
