import { motion, useReducedMotion } from "framer-motion";
import { useState, type ComponentType, type CSSProperties, type SVGProps } from "react";
import { NotchCard } from "@/components/ui/NotchCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DnaCrossIcon, DnaSequencingIcon, DnaTiltedIcon } from "@/components/ui/Icons";
import { FadeUp, RevealLines } from "@/motion/reveal";
import { EASE_OUT_EXPO } from "@/motion/transitions";
import { cn } from "@/utils/cn";

interface Service {
  id: string;
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClass: string;
}

const SERVICES: Service[] = [
  {
    id: "sequencing",
    title: "DNA Sequencing",
    description:
      "High-throughput sequencing services designed to deliver comprehensive genetic information with exceptional accuracy and speed.",
    Icon: DnaSequencingIcon,
    iconClass: "w-[clamp(84px,7vw,112px)]",
  },
  {
    id: "testing",
    title: "Genetic Testing",
    description: "Advanced testing solutions for diagnostics, hereditary screening, and personalized healthcare applications.",
    Icon: DnaTiltedIcon,
    iconClass: "w-[clamp(76px,6.3vw,100px)]",
  },
  {
    id: "bioinformatics",
    title: "Bioinformatics Analysis",
    description:
      "Transform raw genomic data into meaningful insights through expert interpretation and computational analysis.",
    Icon: DnaCrossIcon,
    iconClass: "w-[clamp(80px,6.8vw,108px)]",
  },
];

function ServiceCard({
  service,
  active,
  onSelect,
  index,
}: {
  service: Service;
  active: boolean;
  onSelect: () => void;
  index: number;
}) {
  const reduce = useReducedMotion();
  const { Icon } = service;
  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      whileHover={reduce ? undefined : { y: -6, transition: { duration: 0.9, ease: EASE_OUT_EXPO } }}
      transition={{ duration: 1.4, delay: index * 0.12, ease: EASE_OUT_EXPO }}
      className="group relative"
    >
      <div className="h-full">
        <NotchCard
          className={cn(
            "h-[clamp(380px,33.4vw,560px)] transition-shadow duration-700",
            active && "shadow-[0_30px_60px_-40px_rgba(40,100,190,0.7)]",
          )}
          strokeClassName={active ? "stroke-transparent" : "stroke-black/[0.07] group-hover:stroke-[#4a8af4]/35"}
        >
          {/* Surfaces */}
          <div aria-hidden="true" className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
          <div
            aria-hidden="true"
            className={cn("absolute inset-0 transition-opacity duration-1000", active ? "opacity-100" : "opacity-0")}
            style={{ background: "linear-gradient(180deg,#3466b4 0%,#4a86c6 30%,#6aa6d6 58%,#8cc4e2 82%,#a7d8ea 100%)" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-0 transition-opacity duration-1000 group-hover:opacity-100"
            style={{
              background: active
                ? "radial-gradient(70% 50% at 50% 42%, rgba(255,255,255,0.16), rgba(255,255,255,0))"
                : "radial-gradient(70% 50% at 50% 42%, rgba(120,175,240,0.14), rgba(120,175,240,0))",
            }}
          />

          <div
            className={cn(
              "relative flex h-full flex-col p-[clamp(20px,1.95vw,32px)] pt-[clamp(26px,2.65vw,42px)] transition-colors duration-700",
              active ? "text-white" : "text-helixa-ink",
            )}
            style={{ "--icon-cut": active ? "#5c98cf" : "#eef3f8" } as CSSProperties}
          >
            <h3 className="font-display text-[clamp(22px,1.9vw,31px)] font-normal leading-tight tracking-[-0.015em]">
              {service.title}
            </h3>
            <div className="flex flex-1 items-center justify-center">
              <Icon
                className={cn(
                  service.iconClass,
                  "h-auto transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:rotate-[4deg]",
                )}
              />
            </div>
            <p
              className={cn(
                "line-clamp-2 text-[clamp(14px,1.05vw,16.5px)] leading-[1.6] tracking-[-0.01em]",
                active ? "text-white/90" : "text-helixa-ink/90",
              )}
            >
              {service.description}
            </p>
          </div>
        </NotchCard>
      </div>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        aria-label={`Select ${service.title}`}
        className="focus-ring absolute inset-0 z-10 cursor-pointer focus-visible:outline-offset-[6px]"
      />
    </motion.article>
  );
}

export function Services() {
  const [active, setActive] = useState(0);
  return (
    <section id="services" aria-labelledby="services-heading" className="relative isolate overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 46% at 50% 62%, #e3ecf5 0%, rgba(233,240,247,0.7) 45%, rgba(255,255,255,0) 85%), linear-gradient(180deg,#ffffff 0%,#f5f8fb 40%,#f2f6fa 80%,#f8fafc 100%)",
        }}
      />
      <div className="container-x pb-[clamp(64px,7vw,104px)] pt-[clamp(72px,9vw,140px)]">
        <SectionLabel>Our Services</SectionLabel>
        <div className="mt-[clamp(20px,2.3vw,36px)] flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <RevealLines
            as="h2"
            className="t-h2 text-helixa-ink"
            lines={[
              { key: "s1", content: <span id="services-heading">Precision Solutions For</span> },
              { key: "s2", content: "Modern Genomics" },
            ]}
          />
          <FadeUp delay={0.3} className="md:w-[36%] md:pt-[0.6em]">
            <p className="text-[clamp(15px,1.12vw,18px)] leading-[1.7] tracking-[-0.005em] text-helixa-muted">
              From sequencing and genetic testing to bioinformatics analysis, our laboratory delivers accurate data and
              actionable insights for research and healthcare.
            </p>
          </FadeUp>
        </div>

        <div className="mt-[clamp(48px,8.4vw,124px)] grid gap-4 md:grid-cols-3 md:gap-[clamp(12px,1.15vw,20px)]">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} active={active === i} onSelect={() => setActive(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
