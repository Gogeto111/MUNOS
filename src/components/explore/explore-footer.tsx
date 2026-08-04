import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Container } from "@/components/shared/container";

export function ExploreFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <Container className="py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <Link href="/" aria-label="MUNOS home">
              <Logo />
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              The world&apos;s largest searchable database of Model United
              Nations conferences. Discover, compare, save and attend.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Explore</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/discover" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Discover conferences
                  </Link>
                </li>
                <li>
                  <Link href="/saved" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Saved conferences
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">MUNOS</h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-sm text-muted-foreground/60 transition-colors hover:text-foreground">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MUNOS. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made for delegates, by delegates.
          </p>
        </div>
      </Container>
    </footer>
  );
}
