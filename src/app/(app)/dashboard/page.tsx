import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/prisma";
import { getProfileCompletion, type ProfileCompletionInput } from "@/lib/profile";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to MUNOS</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to access your dashboard.
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

  const counts = await getDb().user.findUnique({
    where: { id: user.id },
    select: {
      interests: true,
      _count: {
        select: {
          awards: true,
          certificates: true,
          committees: true,
          countries: true,
          socialLinks: true,
        },
      },
    },
  });

  const input: ProfileCompletionInput = {
    avatarUrl: user.avatarUrl,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    phoneNumber: user.phoneNumber,
    school: user.school,
    grade: user.grade,
    city: user.city,
    state: user.state,
    country: user.country,
    bio: user.bio,
    experienceLevel: user.munProfile?.experienceLevel ?? null,
    munsAttended: user.munProfile?.munsAttended ?? 0,
    awardsWon: user.munProfile?.awardsWon ?? 0,
    interestsCount: counts?.interests.length ?? 0,
    committeesCount: counts?._count.committees ?? 0,
    countriesCount: counts?._count.countries ?? 0,
    awardsCount: counts?._count.awards ?? 0,
    certificatesCount: counts?._count.certificates ?? 0,
    socialLinksCount: counts?._count.socialLinks ?? 0,
  };

  const completion = getProfileCompletion(input);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.firstName ? `Welcome, ${user.firstName}` : "Welcome"} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This is your MUNOS dashboard. Profile, portfolio, and certificates
            are coming next.
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {user.role ? user.role.toLowerCase() : "user"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profile completion
            </CardTitle>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={completion.score} className="h-2 flex-1" />
              <span className="text-sm font-semibold tabular-nums">
                {completion.score}%
              </span>
            </div>
            <CardDescription className="mt-3">
              {completion.missing.length > 0
                ? `${completion.missing.length} fields left to unlock your public portfolio.`
                : "Your profile is complete. Portfolio is live."}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Awards
            </CardTitle>
            <p className="mt-3 text-3xl font-semibold tabular-nums">
              {counts?._count.awards ?? 0}
            </p>
            <CardDescription className="mt-3">
              Tracked across your MUN career.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              MUNs attended
            </CardTitle>
            <p className="mt-3 text-3xl font-semibold tabular-nums">
              {user.munProfile?.munsAttended ?? 0}
            </p>
            <CardDescription className="mt-3">
              Every conference, every committee.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
