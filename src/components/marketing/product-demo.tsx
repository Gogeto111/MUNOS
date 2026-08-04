"use client";

import * as React from "react";
import { Award, FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { DashboardMockup } from "@/components/marketing/dashboard-mockup";
import { PortfolioMockup } from "@/components/marketing/mockups/portfolio-mockup";
import { CertificatesMockup } from "@/components/marketing/mockups/certificates-mockup";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "portfolio", label: "Portfolio", icon: Award },
  { id: "certificates", label: "Certificates", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProductDemo() {
  const [active, setActive] = React.useState<TabId>("dashboard");

  return (
    <section id="demo" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand-500/10 to-sky-400/8 blur-3xl" />
      </div>

      <Container>
        <SectionHeading
          eyebrow="Product demo"
          title={
            <>
              See your career, <span className="text-gradient">beautifully organized</span>
            </>
          }
          description="Explore the core surfaces of MUNOS — every pixel engineered for clarity, speed, and delight."
        />

        <FadeIn delay={0.1}>
          <div className="mt-10 flex justify-center">
            <div className="glass-strong inline-flex rounded-full border border-border/70 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-5",
                    active === tab.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-pressed={active === tab.id}
                >
                  <tab.icon className="size-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        <div className="mx-auto mt-10 max-w-4xl">
          {active === "dashboard" ? <DashboardMockup /> : null}
          {active === "portfolio" ? <PortfolioMockup /> : null}
          {active === "certificates" ? <CertificatesMockup /> : null}
        </div>
      </Container>
    </section>
  );
}
