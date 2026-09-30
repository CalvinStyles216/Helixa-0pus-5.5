import { MotionConfig } from "framer-motion";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Services } from "@/sections/Services";
import { Process } from "@/sections/Process";
import { Team } from "@/sections/Team";
import { CTA } from "@/sections/CTA";
import { Footer } from "@/sections/Footer";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="focus-ring sr-only z-50 rounded-full bg-white px-4 py-2 text-sm text-helixa-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Hero />
      <main id="main">
        <About />
        <Services />
        <Process />
        <Team />
        <CTA />
      </main>
      <Footer />
    </MotionConfig>
  );
}
