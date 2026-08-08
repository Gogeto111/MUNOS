"use server";

import { getDb } from "@/lib/prisma";

export interface PublicPortfolioData {
  name: string;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  school: string | null;
  university: string | null;
  awards: Array<{ title: string; issuer: string | null; category: string | null; year: number | null }>;
  certificates: Array<{ title: string; issuer: string | null; category: string; year: number | null }>;
  committees: Array<{ name: string; role: string; conferenceName: string | null; year: number | null }>;
  countries: Array<{ country: string; conferenceName: string | null }>;
  stats: { awards: number; certificates: number; committees: number; countries: number };
}

export async function getPublicPortfolio(userId: string): Promise<PublicPortfolioData | null> {
  const user = await getDb().user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
    },
  });

  if (!user) return null;

  if (user.settings && !user.settings.profilePublic) return null;

  const [awards, certificates, committees, countries] = await Promise.all([
    getDb().award.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    getDb().certificate.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    getDb().committee.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    getDb().countryRepresented.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const showAwards = user.settings?.showAwards ?? true;
  const showCertificates = user.settings?.showCertificates ?? true;

  return {
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Anonymous",
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    city: user.city,
    state: user.state,
    country: user.country,
    school: user.school,
    university: user.university,
    awards: showAwards
      ? awards.map((a) => ({ title: a.title, issuer: a.issuer, category: a.category, year: a.year }))
      : [],
    certificates: showCertificates
      ? certificates.map((c) => ({ title: c.title, issuer: c.issuer, category: c.category, year: c.issueYear }))
      : [],
    committees: committees.map((c) => ({ name: c.name, role: c.role, conferenceName: c.conferenceName, year: c.year })),
    countries: countries.map((c) => ({ country: c.country, conferenceName: c.conferenceName })),
    stats: {
      awards: awards.length,
      certificates: certificates.length,
      committees: committees.length,
      countries: countries.length,
    },
  };
}
