import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div>
            <Link href="/" aria-label="MUNOS home">
              <Logo />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Built for Model United Nations. Discover, prepare, and connect
              with delegates worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Product</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/discover"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Discover
                  </Link>
                </li>
                <li>
                  <Link
                    href="/simulator"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Simulator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/news"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    News
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <span className="text-sm text-muted-foreground/60">
                    About
                  </span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground/60">
                    Privacy
                  </span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground/60">
                    Terms
                  </span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground/60">
                    Contact
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Community</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                    Twitter
                  </a>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground/60">
                    Discord
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MUNOS. Built for Model United Nations.
          </p>
          <p className="text-xs text-muted-foreground">
            Made for delegates, by delegates.
          </p>
        </div>
      </div>
    </footer>
  );
}
