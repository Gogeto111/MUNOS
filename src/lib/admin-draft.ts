import type { ConferenceWithDetail } from "@/lib/conference";
import type { ConferenceDraft } from "@/lib/actions/conference";

function toDateTimeLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toString(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

/** Maps a fully-loaded conference back into the admin form draft shape. */
export function conferenceToDraft(conference: ConferenceWithDetail): ConferenceDraft {
  return {
    conference: {
      name: conference.name,
      slug: conference.slug,
      tagline: conference.tagline ?? "",
      description: conference.description,
      theme: conference.theme ?? "",
      format: conference.format,
      difficulty: conference.difficulty,
      startDate: toDateTimeLocal(conference.startDate),
      endDate: toDateTimeLocal(conference.endDate),
      registrationOpen: conference.registrationOpen,
      externalDelegates: conference.externalDelegates,
      fee: toString(conference.fee),
      currency: conference.currency,
      registrationDeadline: toDateTimeLocal(conference.registrationDeadline),
      capacity: toString(conference.capacity),
      website: conference.website ?? "",
      instagram: conference.instagram ?? "",
      email: conference.email ?? "",
      school: conference.school ?? "",
      university: conference.university ?? "",
      city: conference.city,
      state: conference.state ?? "",
      country: conference.country,
      logoUrl: conference.logoUrl ?? "",
      bannerUrl: conference.bannerUrl ?? "",
      featured: conference.featured,
      published: conference.published,
    },
    organizer: conference.organizer
      ? {
          name: conference.organizer.name,
          description: conference.organizer.description ?? "",
          school: conference.organizer.school ?? "",
          university: conference.organizer.university ?? "",
          website: conference.organizer.website ?? "",
          email: conference.organizer.email ?? "",
          instagram: conference.organizer.instagram ?? "",
          logoUrl: conference.organizer.logoUrl ?? "",
        }
      : {
          name: "",
          description: "",
          school: "",
          university: "",
          website: "",
          email: "",
          instagram: "",
          logoUrl: "",
        },
    venue: conference.venue
      ? {
          name: conference.venue.name,
          address: conference.venue.address ?? "",
          city: conference.venue.city,
          state: conference.venue.state ?? "",
          country: conference.venue.country,
          latitude: toString(conference.venue.latitude),
          longitude: toString(conference.venue.longitude),
          mapsUrl: conference.venue.mapsUrl ?? "",
        }
      : {
          name: "",
          address: "",
          city: "",
          state: "",
          country: "",
          latitude: "",
          longitude: "",
          mapsUrl: "",
        },
    committees: conference.committees.map((committee) => ({
      name: committee.name,
      topic: committee.topic ?? "",
      description: committee.description ?? "",
      difficulty: committee.difficulty,
      maxDelegates: toString(committee.maxDelegates),
      countryMatrix: committee.countryMatrix.map((entry) => ({
        country: entry.country,
        seats: toString(entry.seats),
      })),
    })),
    agenda: conference.agenda.map((item) => ({
      title: item.title,
      description: item.description ?? "",
      startAt: toDateTimeLocal(item.startAt),
      endAt: toDateTimeLocal(item.endAt),
      sortOrder: toString(item.sortOrder),
    })),
    brochures: conference.brochures.map((brochure) => ({
      title: brochure.title ?? "",
      fileUrl: brochure.fileUrl,
      fileName: brochure.fileName,
      mimeType: brochure.mimeType,
      sizeBytes: toString(brochure.sizeBytes),
    })),
    gallery: conference.gallery.map((image) => ({
      url: image.url,
      alt: image.alt ?? "",
      caption: image.caption ?? "",
    })),
    socialLinks: conference.socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
    })),
    awards: conference.awards.map((award) => ({
      name: award.name,
      description: award.description ?? "",
    })),
    faqs: conference.faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
    secretariat: conference.secretariat.map((member) => ({
      name: member.name,
      role: member.role,
      photoUrl: member.photoUrl ?? "",
      bio: member.bio ?? "",
    })),
  };
}
