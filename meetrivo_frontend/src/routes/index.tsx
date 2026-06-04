import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FiArrowRight, FiPlay, FiCheck } from "react-icons/fi";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/button";
import { features, benefits } from "@/data/mock";
import heroMockup from "@/assets/hero-mockup.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meetrivo — Meet Beyond Meetings" },
      {
        name: "description",
        content:
          "Meetrivo is a modern collaboration platform built for smarter communication, productivity, and teamwork.",
      },
      { property: "og:title", content: "Meetrivo — Meet Beyond Meetings" },
      {
        property: "og:description",
        content: "A premium, mobile-first collaboration platform. Connect. Collaborate. Create.",
      },
      { property: "og:image", content: heroMockup },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[700px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Now in early access
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Meet <span className="text-gradient">Beyond</span> Meetings
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              A modern collaboration platform built for smarter communication, productivity,
              and teamwork — designed mobile-first for the way teams really work.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dashboard">
                  Create Meeting <FiArrowRight />
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/login">
                  <FiPlay /> Join Meeting
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-14 max-w-4xl"
          >
            <div className="overflow-hidden rounded-2xl border border-border shadow-soft">
              <img
                src={heroMockup}
                alt="Meetrivo meeting interface preview"
                width={1280}
                height={960}
                className="w-full"
              />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-3 top-10 hidden rounded-2xl border border-border bg-card/90 p-3 shadow-soft backdrop-blur sm:block"
            >
              <p className="text-xs text-muted-foreground">Active now</p>
              <p className="text-sm font-semibold">6 participants</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-3 bottom-10 hidden rounded-2xl border border-border bg-card/90 p-3 shadow-soft backdrop-blur sm:block"
            >
              <p className="text-xs text-muted-foreground">Latency</p>
              <p className="text-sm font-semibold text-success">28ms</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Everything your team needs</h2>
          <p className="mt-3 text-muted-foreground">
            A complete collaboration toolkit, thoughtfully designed and built to scale.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-primary transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mobile showcase */}
      <section id="mobile" className="scroll-mt-20 border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <span className="text-sm font-semibold text-primary">Mobile-first</span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Built thumb-first, for every screen</h2>
            <p className="mt-4 text-muted-foreground">
              Meetrivo feels native on mobile — sticky actions, thumb-zone navigation, and
              buttery transitions. The same premium experience scales seamlessly to tablet and desktop.
            </p>
            <ul className="mt-6 space-y-3">
              {["Touch-friendly spacing", "Sticky quick actions", "Zero layout breaking", "Adaptive typography"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                      <FiCheck className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="flex justify-center">
            <div className="relative h-[460px] w-[230px] rounded-[2.4rem] border-4 border-border bg-background p-3 shadow-soft">
              <div className="h-full w-full overflow-hidden rounded-[1.8rem] border border-border">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between bg-card px-4 py-3">
                    <span className="text-sm font-semibold">Meetrivo</span>
                    <span className="h-7 w-7 rounded-full bg-gradient-primary" />
                  </div>
                  <div className="flex-1 space-y-3 bg-background p-3">
                    <div className="rounded-xl bg-gradient-primary p-4 text-primary-foreground">
                      <p className="text-xs opacity-80">Welcome back</p>
                      <p className="text-base font-semibold">Start a meeting</p>
                    </div>
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="rounded-xl border border-border bg-card p-3">
                        <div className="h-2 w-2/3 rounded bg-surface" />
                        <div className="mt-2 h-2 w-1/3 rounded bg-surface" />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-around border-t border-border bg-card py-3">
                    {[0, 1, 2, 3].map((n) => (
                      <span key={n} className={`h-5 w-5 rounded-md ${n === 0 ? "bg-primary" : "bg-surface"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal key={b.label} delay={i * 0.05}>
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-4xl font-extrabold text-gradient">{b.stat}</p>
                <p className="mt-2 text-sm text-muted-foreground">{b.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-surface p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
            <h2 className="relative text-3xl font-bold sm:text-4xl">
              Start collaborating with Meetrivo
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-muted-foreground">
              Join teams already meeting beyond meetings. It only takes a few seconds.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="hero" size="lg" asChild>
                <Link to="/register">
                  Create Meeting <FiArrowRight />
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
