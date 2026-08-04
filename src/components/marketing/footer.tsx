import Link from "next/link";
import { Logo, LogoMark } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "Pricing", href: "#free-forever" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Delegate Portfolio", href: "/portfolio" },
      { label: "Certificate Manager", href: "/certificates" },
      { label: "Documentation", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_2fr]">
          <div>
            <Link href="/" aria-label="MUNOS home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The world&apos;s first AI-powered operating system for Model
              United Nations. Research, committees, and your professional
              delegate portfolio — in one place.
            </p>
            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <LogoMark className="size-4" variant="plain" />
              Built for the next generation of diplomats.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-foreground">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MUNOS. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with precision for delegates worldwide.
          </p>
        </div>
      </Container>
    </footer>
  );
}
