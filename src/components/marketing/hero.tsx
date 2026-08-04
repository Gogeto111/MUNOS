"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid mask-fade-b absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <div className="absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500/25 via-brand-400/12 to-transparent blur-3xl" />
        <div className="absolute right-[-120px] top-40 h-[320px] w-[320px] rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-[-140px] h-[300px] w-[360px] rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <a
              href="#roadmap"
              className="group inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/8 px-4 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-500/15 dark:text-brand-400"
            >
              <Sparkles className="size-3.5" />
              Introducing MUNOS Phase 1
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
            className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl md:leading-[1.05]"
          >
            Your entire MUN career,
            <br />
            <span className="text-gradient">one operating system.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
            className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            MUNOS turns every conference, award, and committee into a polished
            professional portfolio — and pairs it with the research and
            preparation tools that win gavels.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/sign-up">
                Start free forever
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="#demo">See it in action</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2">
              {["AK", "MJ", "SR", "PL"].map((initials, index) => (
                <span
                  key={initials}
                  className="grid size-7 place-items-center rounded-full border-2 border-background bg-gradient-to-br from-brand-500 to-brand-700 text-[9px] font-semibold text-white"
                  style={{ zIndex: 4 - index }}
                >
                  {initials}
                </span>
              ))}
            </div>
            <span>
              Trusted by delegates from <strong className="text-foreground">50+ countries</strong>
            </span>
          </motion.div>
        </div>

        {/* Product demo */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-500/20 via-brand-400/5 to-sky-400/10 blur-2xl" />
          <div className="rounded-2xl p-1 shadow-[0_24px_80px_-24px_rgba(79,70,229,0.35)]">
            <DashboardMockup />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
