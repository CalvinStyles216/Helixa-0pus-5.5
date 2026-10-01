import { motion, useReducedMotion } from "framer-motion";
import { NotchCard } from "@/components/ui/NotchCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeUp, RevealLines } from "@/motion/reveal";
import { EASE_OUT_EXPO } from "@/motion/transitions";
import sovan from "@/assets/team-sovan.jpg";
import sarul from "@/assets/team-sarul.jpg";
import sophia from "@/assets/team-sophia.jpg";

/** Swap `image` for production portraits — layout is independent of the asset. */
const TEAM = [
  { name: "Dr. Sovan Santun", role: "Chief Genomics Officer", image: sovan },
  { name: "Dr. Sarul Khan", role: "Clinical Genetics Advisor", image: sarul },
  { name: "Dr. Sophia Nguyen", role: "Senior Bioinformatics Scientist", image: sophia },
];

export function Team() {
  const reduce = useReducedMotion();
  return (
    <section id="team" aria-labelledby="team-heading" className="relative bg-white">
      <div className="container-x pb-[clamp(80px,7.8vw,120px)] pt-[clamp(64px,7.4vw,112px)]">
        <SectionLabel>Our&nbsp; Teams</SectionLabel>
        <div className="mt-[clamp(20px,2.3vw,36px)] flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <RevealLines
            as="h2"
            className="t-h2 text-helixa-ink"
            lines={[
              { key: "t1", content: <span id="team-heading">Experts Behind</span> },
              { key: "t2", content: "Every Discovery" },
            ]}
          />
          <FadeUp delay={0.3} className="md:w-[43.5%] md:pt-[0.55em]">
            <p className="text-[clamp(15px,1.12vw,18px)] leading-[1.7] tracking-[-0.005em] text-helixa-muted">
              Our multidisciplinary team combines expertise in genomics, molecular biology, and bioinformatics to deliver
              accurate results and meaningful scientific insights.
            </p>
          </FadeUp>
        </div>

        <ul className="mt-[clamp(48px,6.3vw,96px)] grid gap-10 sm:grid-cols-2 md:grid-cols-3 md:gap-[clamp(16px,1.75vw,28px)]">
          {TEAM.map((m, i) => (
            <motion.li
              key={m.name}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 1.4, delay: i * 0.12, ease: EASE_OUT_EXPO }}
              className="group"
            >
              <NotchCard
                className="aspect-[437/487] overflow-hidden bg-white"
                strokeClassName="stroke-black/[0.12] group-hover:stroke-black/25"
              >
                <img
                  src={m.image}
                  alt={`Portrait of ${m.name}, ${m.role}`}
                  loading="lazy"
                  decoding="async"
                  width={874}
                  height={974}
                  className="absolute inset-0 h-full w-full object-cover object-[50%_12%] grayscale transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025]"
                />
              </NotchCard>
              <h3 className="mt-[clamp(20px,2.4vw,36px)] font-display text-[clamp(18px,1.4vw,22px)] font-normal tracking-[-0.01em] text-helixa-ink">
                {m.name}
              </h3>
              <p className="mt-[clamp(6px,0.6vw,10px)] text-[clamp(14px,1.08vw,17px)] tracking-[-0.005em] text-helixa-muted">
                {m.role}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
