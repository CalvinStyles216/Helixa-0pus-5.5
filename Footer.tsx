import { useState, type FormEvent } from "react";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { FadeUp } from "@/motion/reveal";

const COLUMNS = [
  {
    title: "Navigation",
    links: [
      { label: "Navigation", href: "#home" },
      { label: "About Us", href: "#about" },
      { label: "Our Services", href: "#services" },
      { label: "Our Process", href: "#process" },
      { label: "Our Team", href: "#team" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "DNA Sequencing", href: "#services" },
      { label: "Genetic Testing", href: "#services" },
      { label: "Bioinformatics Analysis", href: "#services" },
      { label: "Sample Processing", href: "#process" },
      { label: "Research Support", href: "#cta" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Research Library", href: "#about" },
      { label: "Case Studies", href: "#services" },
      { label: "Documentation", href: "#process" },
      { label: "FAQs", href: "#cta" },
      { label: "Privacy Policy", href: "#home" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Facebook", href: "https://facebook.com" },
      { label: "Twitter/X", href: "https://x.com" },
      { label: "Instagram", href: "https://instagram.com" },
    ],
  },
];

export function Footer() {
  const [message, setMessage] = useState("");
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setMessage(/^\S+@\S+\.\S+$/.test(email) ? "Thank you — you're subscribed." : "Please enter a valid email address.");
  };

  return (
    <footer className="bg-white text-helixa-ink" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container-x pb-[clamp(56px,5vw,88px)] pt-[clamp(48px,4.6vw,90px)]">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <FadeUp className="md:max-w-[40%]">
            <a href="#home" className="focus-ring inline-flex items-center gap-[clamp(12px,1.1vw,18px)] rounded-sm" aria-label="Helixa home">
              <LogoMark className="h-[clamp(38px,2.9vw,52px)] w-[clamp(38px,2.9vw,52px)]" />
              <Wordmark tone="dark" className="text-[clamp(40px,3.55vw,62px)] leading-none tracking-[0.005em]" />
            </a>
            <p className="mt-[clamp(28px,3.1vw,50px)] text-[clamp(14.5px,1.08vw,17px)] leading-[1.7] tracking-[-0.005em] text-[#6b6e72]">
              Transforming DNA sequencing and genomic data into reliable insights that accelerate research, innovation,
              and scientific discovery.
            </p>
          </FadeUp>

          <FadeUp delay={0.15} className="md:w-[36.5%]">
            <form onSubmit={onSubmit} aria-label="Newsletter subscription" noValidate>
              <label htmlFor="footer-email" className="block text-[clamp(15px,1.14vw,18px)] tracking-[-0.005em]">
                Stay Connected
              </label>
              <input
                id="footer-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="mt-[clamp(16px,1.6vw,24px)] h-[clamp(46px,3.4vw,54px)] w-full rounded-full border border-black/[0.1] bg-white px-[clamp(14px,1.2vw,20px)] text-[clamp(14px,1vw,16px)] outline-none transition-[border-color,box-shadow] duration-500 placeholder:text-[#55585c] hover:border-black/20 focus:border-[#4a8af4]/60 focus:shadow-[0_0_0_4px_rgba(74,138,244,0.12)]"
              />
              <button type="submit" className="sr-only">
                Subscribe
              </button>
              <p className="mt-[clamp(14px,1.4vw,22px)] text-[clamp(14.5px,1.08vw,17px)] leading-[1.75] tracking-[-0.005em] text-[#6b6e72]">
                Subscribe to receive the latest updates in genomics, research breakthroughs, and laboratory innovations.
              </p>
              <p aria-live="polite" className="mt-2 min-h-[1.25em] text-[13px] text-[#3f7fe6]">
                {message}
              </p>
            </form>
          </FadeUp>
        </div>

        <hr className="mt-[clamp(32px,3.4vw,56px)] border-0 border-t border-black/[0.07]" />

        <nav aria-label="Footer" className="mt-[clamp(40px,4.4vw,66px)] grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {COLUMNS.map((col, i) => (
            <FadeUp key={col.title} delay={0.08 * i}>
              <h3 className="text-[clamp(15px,1.14vw,18px)] tracking-[-0.005em]">{col.title}</h3>
              <ul className="mt-[clamp(24px,2.3vw,36px)] flex flex-col gap-[clamp(18px,1.95vw,30px)]">
                {col.links.map((l) => {
                  const external = l.href.startsWith("http");
                  return (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="nav-link focus-ring rounded-sm text-[clamp(14.5px,1.12vw,18px)] tracking-[-0.005em] text-helixa-ink/90 transition-colors duration-500 hover:text-[#2f6fe4]"
                      >
                        {l.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </FadeUp>
          ))}
        </nav>
      </div>
    </footer>
  );
}
