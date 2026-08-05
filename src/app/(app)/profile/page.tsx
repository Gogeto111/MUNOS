import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { PersonalInfoForm } from "@/components/profile/personal-info-form";
import { MunProfileForm } from "@/components/profile/mun-profile-form";
import { AwardsManager } from "@/components/profile/awards-manager";
import { CommitteesManager } from "@/components/profile/committees-manager";
import { CountriesManager } from "@/components/profile/countries-manager";
import { SocialLinksManager } from "@/components/profile/social-links-manager";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Profile | MUNOS" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your profile.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </div>
    );
  }

  const [full] = await Promise.all([
    getDb().user.findUnique({
      where: { id: user.id },
      include: {
        awards: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
        committees: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
        countries: { orderBy: [{ year: "desc" }, { createdAt: "desc" }] },
        socialLinks: { orderBy: { createdAt: "asc" } },
      },
    }),
  ]);

  if (!full) {
    return (
      <div className="space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your profile could not be loaded. Please try again.
          </p>
        </div>
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything that powers your portfolio. Changes save instantly.
        </p>
      </div>

      <div className="grid gap-6">
        <PersonalInfoForm user={user} />
        <MunProfileForm user={user} />
        <AwardsManager awards={full.awards} />
        <CommitteesManager committees={full.committees} />
        <CountriesManager countries={full.countries} />
        <SocialLinksManager links={full.socialLinks} />
      </div>
    </div>
  );
}
