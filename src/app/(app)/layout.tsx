import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { MobileNav } from "@/components/app/mobile-nav";
import { Footer } from "@/components/shared/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="flex min-h-dvh bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-20 sm:px-6 lg:pb-8">
            {children}
          </main>
          <Footer />
        </div>
        <MobileNav />
      </div>
    </ThemeProvider>
  );
}
