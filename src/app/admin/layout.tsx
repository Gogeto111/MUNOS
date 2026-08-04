import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { getCurrentUser } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/public-env";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isAuthConfigured) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") redirect("/");
  }

  return (
    <div className="min-h-dvh bg-background pb-20">
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
