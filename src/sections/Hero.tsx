import { motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowCircle } from "@/components/ui/ArrowButton";
import { CountUp } from "@/components/ui/CountUp";
import { ChevronDown } from "@/components/ui/Icons";
import { RevealLines } from "@/motion/reveal";
import { EASE_OUT_EXPO, MICRO_SPRING } from "@/motion/transitions";
import avatar from "@/assets/team-sarul.jpg";
import { Nav } from "./Nav";

function SearchPill() {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState("");
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = String(data.get("q") ?? "").trim();
    const cat = String(data.get("category") ?? "General");
    setStatus(q ? `Searching “${q}” in ${cat}…` : "Please enter a search term.");
  };

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.2, delay: 0.35, ease: EASE_OUT_EXPO }}
    >
      <motion.form
        role="search"
        aria-label="Search genomic resources"
        onSubmit={onSubmit}
        initial="rest"
        animate="rest"
        whileHover={reduce ? undefined : "hover"}
        variants={{
          rest: { scale: 1, boxShadow: "0 10px 30px -18px rgba(8,30,80,0.45)" },
          hover: { scale: 1.006, boxShadow: "0 18px 40px -20px rgba(8,30,80,0.55)" },
        }}
        transition={MICRO_SPRING}
        className="flex h-[clamp(50px,3.75vw,62px)] w-full max-w-[clamp(300px,37.5vw,620px)] items-center rounded-full bg-white pl-[clamp(16px,1.15vw,20px)] pr-[3px] ring-1 ring-white/80 transition-[box-shadow] focus-within:ring-2 focus-within:ring-white/90 focus-within:ring-offset-2 focus-within:ring-offset-[#3f7cc4]/0"
      >
        <label htmlFor="hero-search" className="sr-only">
          Search
        </label>
        <input
          id="hero-search"
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Search here..."
          className="h-full min-w-0 flex-1 bg-transparent text-[clamp(14px,1.05vw,16.5px)] tracking-[-0.01em] text-helixa-ink outline-none placeholder:text-[#7d8084]"
        />
        <span aria-hidden="true" className="h-full w-px bg-black/[0.09]" />
        <label htmlFor="hero-category" className="sr-only">
          Category
        </label>
        <div className="relative flex h-full items-center">
          <select
            id="hero-category"
            name="category"
            defaultValue="General"
            className="focus-ring h-full cursor-pointer appearance-none rounded-sm bg-transparent pl-[clamp(12px,1.05vw,18px)] pr-[clamp(26px,2.1vw,34px)] text-[clamp(14px,1.05vw,16.5px)] tracking-[-0.01em] text-[#6d7074] outline-none"
          >
            <option>General</option>
            <option>Sequencing</option>
            <option>Genetic Testing</option>
            <option>Bioinformatics</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-[clamp(8px,0.8vw,14px)] h-3 w-3 text-[#6d7074]" />
        </div>
        <motion.button
          type="submit"
          aria-label="Submit search"
          whileTap="tap"
          whileFocus="hover"
          className="focus-ring ml-1 rounded-full"
        >
          <ArrowCircle size={42} className="!h-[clamp(40px,3.2vw,52px)] !w-[clamp(40px,3.2vw,52px)]" />
        </motion.button>
      </motion.form>
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </motion.div>
  );
}

function Stat({
  children,
  label,
  delay,
}: {
  children: ReactNode;
  label: ReactNode;
  delay: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.3, delay, ease: EASE_OUT_EXPO }}
      className="flex items-center gap-[clamp(10px,0.85vw,14px)]"
    >
      <span className="font-display text-[clamp(38px,3.35vw,58px)] font-light leading-none tracking-[-0.04em] text-white">
        {children}
      </span>
      <span className="text-[clamp(13px,0.98vw,16px)] font-light leading-[1.45] tracking-[-0.01em] text-white/90">{label}</span>
    </motion.li>
  );
}

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative isolate flex min-h-[max(100svh,760px)] flex-col overflow-hidden text-white md:h-[clamp(700px,56.6vw,1020px)] md:min-h-0"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src="https://res.cloudinary.com/dpiifnzd7/video/upload/v1790840120/DNA_Helix_Enhanced_jco4mk.mp4"
        className="absolute inset-0 h-full w-full object-cover -z-10 pointer-events-none"
      />

      <Nav />

      {/* Main Hero Content - Scroll-Triggered Fade-In */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
        className="container-x relative z-10 pt-[clamp(128px,10.5vw,176px)]"
      >
        <RevealLines
          as="h1"
          delay={0.15}
          stagger={0.12}
          className="t-hero text-white"
          lines={[
            { key: "l1", content: "Transform DNA" },
            { key: "l2", content: "Into Discoveries" },
          ]}
        />

        <div className="mt-[clamp(40px,5.3vw,86px)]">
          <SearchPill />
        </div>

        <motion.p
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.3, delay: 0.45, ease: EASE_OUT_EXPO }}
          className="mt-[clamp(28px,3.35vw,54px)] max-w-[34em] text-[clamp(14.5px,1.07vw,17px)] font-light leading-[1.62] tracking-[-0.01em] text-white/90"
        >
          Use advanced sequencing, bioinformatics, and precise <br className="hidden sm:block" />
          genomic analysis to turn complex genetic data
        </motion.p>
      </motion.div>

      {/* Key Figures - Scroll-Triggered Fade-In */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.2, delay: 0.15, ease: EASE_OUT_EXPO }}
        className="container-x relative z-10 mt-auto pb-[clamp(36px,4.6vw,76px)] pt-16"
      >
        <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-label="Key figures">
          <Stat
            delay={0.25}
            label={
              <>
                Confirmed by thorough
                <br />
                &nbsp;and strict quality checks
              </>
            }
          >
            <CountUp to={12} suffix="k+" delay={0.4} />
          </Stat>
          <Stat
            delay={0.35}
            label={
              <>
                Verified with complete
                <br />
                DNA data points
              </>
            }
          >
            <CountUp to={17} suffix="k+" delay={0.5} />
          </Stat>
          <motion.li
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.3, delay: 0.45, ease: EASE_OUT_EXPO }}
            className="flex items-center gap-[clamp(10px,0.8vw,14px)] sm:col-span-2 lg:col-span-1"
          >
            <span className="relative block h-[clamp(46px,3.6vw,64px)] w-[clamp(46px,3.6vw,64px)] shrink-0 overflow-hidden rounded-full bg-white ring-[1.5px] ring-white/90">
              <img
                src={avatar}
                alt="Portrait of Dr. Sarul Khan, Clinical Genetics Advisor"
                className="h-full w-full scale-[1.35] object-cover object-[50%_18%] grayscale"
                width={64}
                height={64}
                decoding="async"
              />
            </span>
            <span className="flex flex-col gap-[clamp(6px,0.6vw,10px)]">
              <span className="font-display text-[clamp(15.5px,1.28vw,21px)] font-light leading-none tracking-[-0.015em] text-[#d6f2ff]">
                <CountUp to={99.8} decimals={1} suffix="%" delay={0.6} /> Sequencing Accuracy
              </span>
              <span className="text-[clamp(12.5px,0.98vw,16px)] font-light leading-none tracking-[-0.01em] text-[#cfeaff]/85">
                Confirmed by thorough and strict quality checks
              </span>
            </span>
          </motion.li>
        </ul>
      </motion.div>
    </section>
  );
}
