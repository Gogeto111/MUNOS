import { SavedProvider } from "@/providers/saved-provider";
import { ExploreHeader } from "@/components/explore/explore-header";
import { ExploreFooter } from "@/components/explore/explore-footer";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SavedProvider>
      <div className="flex min-h-dvh flex-col bg-background">
        <ExploreHeader />
        <main className="flex-1">{children}</main>
        <ExploreFooter />
      </div>
    </SavedProvider>
  );
}
