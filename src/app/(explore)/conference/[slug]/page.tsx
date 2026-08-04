import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Calendar, DollarSign, Users, Sparkles } from "lucide-react";
import { getDb } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { publicEnv, isAuthConfigured } from "@/lib/public-env";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { ConferenceActions } from "@/components/conference/conference-actions";
import { ConferenceSidebar } from "@/components/conference/conference-sidebar";
import { CommitteeTabs } from "@/components/conference/committee-tabs";
import { ConferenceGallery } from "@/components/conference/conference-gallery";
import { ReviewSection, type ReviewView } from "@/components/conference/review-section";
import {
  AboutSection,
  AgendaSection,
  BrochuresSection,
  AwardsSection,
  FaqSection,
} from "@/components/conference/conference-sections";
import {
  conferenceDetailInclude,
  conferenceDateRange,
  conferenceShareText,
  conferenceShareUrl,
  deriveConference,
  difficultyLabel,
  formatFee,
  FORMAT_LABELS,
  type ConferenceWithDetail,
} from "@/lib/conference";
import { conferenceCalendarPayload } from "@/lib/ics";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const conference = await getDb().conference.findUnique({
    where: { slug },
    select: { name: true, tagline: true, description: true, city: true, country: true },
  });
  if (!conference) return { title: "Conference not found | MUNOS" };
  return {
    title: `${conference.name} | MUNOS`,
    description:
      conference.tagline ??
      conference.description.slice(0, 155),
  };
}

const STATUS_CHIP: Record<string, string> = {
  upcoming: "bg-foreground/85 text-background",
  open: "bg-emerald-500 text-white",
  closing: "bg-amber-500 text-white",
  ongoing: "bg-brand-500 text-white",
  past: "bg-muted-foreground text-white",
};

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const conference = (await getDb().conference.findUnique({
    where: { slug },
    include: conferenceDetailInclude,
  })) as ConferenceWithDetail | null;

  if (!conference || !conference.published) notFound();

  const now = new Date();
  const derived = deriveConference(conference, now);
  const user = isAuthConfigured ? await getCurrentUser() : null;
  const baseUrl = publicEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const shareUrl = conferenceShareUrl(baseUrl, conference.slug);
  const shareTitle = conferenceShareText(conference.name, conference.startDate, conference.endDate);
  const calendarPayload = conferenceCalendarPayload(conference, conference.slug, conference.venue, baseUrl);

  const average = conference.reviews.length
    ? conference.reviews.reduce((sum, review) => sum + review.rating, 0) / conference.reviews.length
    : 0;

  const reviews: ReviewView[] = conference.reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    createdAt: review.createdAt.toISOString(),
    authorName: [review.user.firstName, review.user.lastName].filter(Boolean).join(" ") || null,
    authorAvatar: review.user.avatarUrl ?? null,
    canDelete: user?.id === review.userId,
  }));

  const heroImage = conference.bannerUrl ?? conference.logoUrl;

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative">
        <div className="relative h-72 overflow-hidden bg-gradient-to-br from-brand-600/40 via-brand-800/30 to-foreground/60 sm:h-80">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={conference.name}
              className="size-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        </div>

        <Container className="relative -mt-28 pb-6">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/discover" className="font-medium underline-offset-4 hover:text-foreground hover:underline">
              Discover
            </Link>
            <ChevronRight className="size-4" />
            <span className="truncate font-medium text-foreground">{conference.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                STATUS_CHIP[derived.status],
              )}
            >
              {derived.statusLabel}
            </span>
            <Badge variant="outline" className="rounded-full bg-card/80 backdrop-blur">
              {FORMAT_LABELS[conference.format]}
            </Badge>
            {conference.featured ? (
              <Badge className="gap-1 rounded-full bg-brand-500 text-white">
                <Sparkles className="size-3" />
                Featured
              </Badge>
            ) : null}
            <Badge variant="secondary" className="rounded-full bg-card/80 backdrop-blur">
              {difficultyLabel(conference.difficulty)}
            </Badge>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{conference.name}</h1>
          {conference.tagline ? (
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{conference.tagline}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <MapPin className="size-4 text-brand-500" />
              {derived.locationLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 text-brand-500" />
              {conferenceDateRange(conference.startDate, conference.endDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <DollarSign className="size-4 text-brand-500" />
              {formatFee(conference.fee, conference.currency)}
            </span>
            {conference.capacity ? (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4 text-brand-500" />
                {conference.capacity.toLocaleString()} delegate cap
              </span>
            ) : null}
          </div>

          <div className="mt-6">
            <ConferenceActions
              conferenceId={conference.id}
              website={conference.website}
              registrationOpen={derived.registrationOpen}
              startDate={conference.startDate.toISOString()}
              registrationDeadline={conference.registrationDeadline?.toISOString() ?? null}
              calendarPayload={calendarPayload}
              shareUrl={shareUrl}
              shareTitle={shareTitle}
            />
          </div>
        </Container>
      </section>

      <Container className="mt-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-12">
            <AboutSection description={conference.description} theme={conference.theme} />

            {conference.committees.length > 0 ? (
              <section>
                <div className="mb-4 flex items-start gap-3">
                  <h2 className="text-xl font-bold tracking-tight">Committees</h2>
                </div>
                <CommitteeTabs
                  committees={conference.committees.map((committee) => ({
                    name: committee.name,
                    topic: committee.topic,
                    description: committee.description,
                    difficulty: committee.difficulty,
                    maxDelegates: committee.maxDelegates,
                    countryMatrix: committee.countryMatrix.map((entry) => ({
                      country: entry.country,
                      seats: entry.seats,
                    })),
                  }))}
                />
              </section>
            ) : null}

            <AgendaSection agenda={conference.agenda} />

            {conference.gallery.length > 0 ? (
              <section>
                <div className="mb-4 flex items-start gap-3">
                  <h2 className="text-xl font-bold tracking-tight">Gallery</h2>
                </div>
                <ConferenceGallery
                  items={conference.gallery.map((image) => ({
                    url: image.url,
                    alt: image.alt,
                    caption: image.caption,
                  }))}
                />
              </section>
            ) : null}

            <BrochuresSection brochures={conference.brochures} />
            <AwardsSection awards={conference.awards} />
            <FaqSection faqs={conference.faqs} />

            <section id="reviews" className="scroll-mt-24">
              <h2 className="mb-6 text-xl font-bold tracking-tight">Reviews</h2>
              <ReviewSection
                conferenceId={conference.id}
                reviews={reviews}
                average={average}
                count={conference.reviews.length}
              />
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ConferenceSidebar conference={conference} now={now} />
          </aside>
        </div>
      </Container>
    </div>
  );
}
