import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { ConferenceFormat, ExperienceLevel, SocialPlatform } from "../src/generated/prisma/browser";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.user.findUnique({
    where: { email: "alex.rivera@example.com" },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        clerkId: "seed_demo_delegate",
        email: "alex.rivera@example.com",
        firstName: "Alex",
        lastName: "Rivera",
        username: "alexrivera",
        phoneNumber: "+1 (555) 013-2498",
        school: "Riverside High School",
        university: null,
        grade: "Junior",
        city: "Geneva",
        state: "Geneva",
        country: "Switzerland",
        bio: "Passionate delegate chasing my first Best Delegate gavel. I live for crisis committees and late-night caucusing.",
        interests: ["Security Council", "Crisis", "Debate", "International Law"],
        role: "DELEGATE",
        emailVerified: true,
        avatarUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&q=80",
        munProfile: {
          create: {
            experienceLevel: "INTERMEDIATE",
            munsAttended: 14,
            awardsWon: 6,
          },
        },
        settings: { create: {} },
        awards: {
          create: [
            {
              title: "Best Delegate — Security Council",
              issuer: "Geneva MUN 2025",
              category: "Best Delegate",
              year: 2025,
              description: "Led a 25-delegate bloc to consensus on cybersecurity resolution.",
            },
            {
              title: "Honorable Mention — UNSC",
              issuer: "WorldMUN Europe 2024",
              category: "Honorable Mention",
              year: 2024,
            },
            {
              title: "Verbal Commendation",
              issuer: "National Model UN 2023",
              category: "Verbal Commendation",
              year: 2023,
            },
          ],
        },
        committees: {
          create: [
            { name: "United Nations Security Council", role: "Delegate of Japan", conferenceName: "Geneva MUN", year: 2025 },
            { name: "UNHRC", role: "Delegate of Canada", conferenceName: "WorldMUN Europe", year: 2024 },
            { name: "Joint Crisis Committee", role: "President", conferenceName: "National Model UN", year: 2023 },
          ],
        },
        countries: {
          create: [
            { country: "Japan", conferenceName: "Geneva MUN", year: 2025 },
            { country: "Canada", conferenceName: "WorldMUN Europe", year: 2024 },
            { country: "Germany", conferenceName: "CityMUN", year: 2023 },
          ],
        },
        socialLinks: {
          create: [
            { platform: "LINKEDIN", url: "https://linkedin.com/in/alexrivera" },
            { platform: "INSTAGRAM", url: "https://instagram.com/alexrivera" },
            { platform: "WEBSITE", url: "https://alexrivera.dev" },
          ],
        },
        certificates: {
          create: [
            {
              title: "Best Delegate Certificate — Security Council",
              issuer: "Geneva MUN 2025",
              category: "BEST_DELEGATE",
              issueYear: 2025,
              fileName: "best-delegate-geneva-2025.pdf",
              mimeType: "application/pdf",
              sizeBytes: 212000,
              fileUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80",
              fileKey: "seed/best-delegate.pdf",
            },
            {
              title: "Participation Certificate",
              issuer: "WorldMUN Europe 2024",
              category: "PARTICIPATION",
              issueYear: 2024,
              fileName: "participation-worldmun-2024.pdf",
              mimeType: "application/pdf",
              sizeBytes: 148000,
              fileUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80",
              fileKey: "seed/participation.pdf",
            },
          ],
        },
        notifications: {
          create: [
            {
              type: "SYSTEM",
              title: "Welcome to MUNOS",
              body: "Your delegate portfolio is ready. Complete your profile to unlock your public page.",
              read: false,
            },
            {
              type: "ACHIEVEMENT",
              title: "Portfolio created",
              body: "Your auto-generated portfolio is now live.",
              read: true,
            },
          ],
        },
        activities: {
          create: [
            { type: "ACCOUNT_CREATED", message: "Joined MUNOS" },
            { type: "PROFILE_UPDATED", message: "Completed personal details" },
            { type: "CERTIFICATE_UPLOADED", message: "Added Best Delegate certificate" },
            { type: "AWARD_ADDED", message: "Added Best Delegate — Security Council" },
          ],
        },
      },
    });
    console.log("Seeded demo delegate: Alex Rivera (alex.rivera@example.com)");
  }

  const conferenceCount = await prisma.conference.count();
  if (conferenceCount > 0) {
    console.log("Conference seed skipped — conferences already exist.");
    return;
  }

  // -------------------------------------------------------------------------
  // Phase 2 — conference seed. Dates are relative to a fixed "today" so the
  // sample dataset always shows a mix of statuses (open, closing, upcoming).
  // -------------------------------------------------------------------------
  const today = new Date();
  const at = (daysFromNow: number) =>
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysFromNow);

  interface CommitteeSeed {
    name: string;
    topic: string;
    description: string;
    difficulty: ExperienceLevel;
    maxDelegates: number;
    countries: [string, number][];
  }

  interface ConferenceSeed {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    theme: string;
    format: ConferenceFormat;
    difficulty: ExperienceLevel;
    start: number;
    end: number;
    deadline: number | null;
    fee: number;
    currency: string;
    externalDelegates: boolean;
    capacity: number;
    city: string;
    state: string | null;
    country: string;
    school: string;
    university: string | null;
    website: string;
    instagram: string;
    email: string;
    featured?: boolean;
    logo: string;
    banner: string;
    organizer: {
      name: string;
      school: string;
      university: string | null;
      website: string;
      email: string;
      instagram: string;
      description: string;
    };
    venue: { name: string; address: string; city: string; state: string | null; country: string; lat: number; lng: number };
    socials: { platform: SocialPlatform; url: string }[];
    committees: CommitteeSeed[];
    agenda: { title: string; description: string; day: number; hour: number }[];
    gallery: string[];
    awards: { name: string; description: string }[];
    faqs: { question: string; answer: string }[];
    secretariat: { name: string; role: string }[];
  }

  const DUMMY_BROCHURE =
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  const IMG = {
    hero1: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&q=80",
    hero2: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&q=80",
    hall: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80",
    debate: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1600&q=80",
    room: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80",
    podium: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1600&q=80",
    flags: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1600&q=80",
    crowd: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&q=80",
  };

  const conferences: ConferenceSeed[] = [
    {
      name: "Harvard National Model United Nations",
      slug: "hmun-2027",
      tagline: "The world's most prestigious MUN conference, now in hybrid format.",
      description:
        "Harvard National Model United Nations (HMUN) brings together more than 3,000 of the world's most driven student leaders for five days of intense debate, diplomacy and friendship. Delegates navigate complex international crises in committees ranging from the Security Council to ad-hoc crisis bodies, all chaired by the students of Harvard University. Whether it's your first gavel or your twentieth, HMUN is the benchmark every delegate remembers.",
      theme: "Diplomacy in a Multipolar World",
      format: "HYBRID",
      difficulty: "INTERMEDIATE",
      start: 170, // Jan 2027
      end: 174,
      deadline: 120,
      fee: 125,
      currency: "USD",
      externalDelegates: true,
      capacity: 3000,
      city: "Boston",
      state: "Massachusetts",
      country: "United States",
      school: "Harvard College",
      university: "Harvard University",
      website: "https://www.hmun.org",
      instagram: "https://instagram.com/hmun_official",
      email: "secretariat@hmun.org",
      featured: true,
      logo: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=400&fit=crop&q=80",
      banner: IMG.hero1,
      organizer: {
        name: "Harvard Model United Nations Association",
        school: "Harvard College",
        university: "Harvard University",
        website: "https://www.hmun.org",
        email: "secretariat@hmun.org",
        instagram: "https://instagram.com/hmun_official",
        description:
          "The Harvard Model United Nations Association is the oldest and largest collegiate MUN association in the world, hosting HMUN and WorldMUN annually.",
      },
      venue: {
        name: "Sheraton Boston Hotel",
        address: "39 Dalton St, Boston, MA 02199",
        city: "Boston",
        state: "Massachusetts",
        country: "United States",
        lat: 42.3455,
        lng: -71.0839,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/hmun_official" },
        { platform: "TWITTER", url: "https://twitter.com/hmun_official" },
        { platform: "WEBSITE", url: "https://www.hmun.org" },
      ],
      committees: [
        {
          name: "United Nations Security Council",
          topic: "Protection of Civilians in Armed Conflict",
          description: "The Council grapples with protection mandates in high-intensity conflict zones.",
          difficulty: "ADVANCED",
          maxDelegates: 15,
          countries: [
            ["China", 1],
            ["France", 1],
            ["Russia", 1],
            ["United States", 1],
            ["United Kingdom", 1],
            ["Japan", 1],
            ["Brazil", 1],
          ],
        },
        {
          name: "United Nations General Assembly",
          topic: "Financing for Sustainable Development",
          description: "193 delegations negotiate a global framework for green finance.",
          difficulty: "BEGINNER",
          maxDelegates: 193,
          countries: [
            ["India", 1],
            ["Germany", 1],
            ["Kenya", 1],
            ["Canada", 1],
            ["Brazil", 1],
          ],
        },
        {
          name: "Joint Crisis Committee: Korean Peninsula",
          topic: "Escalation on the 38th Parallel",
          description: "A fast-moving crisis with co-chairs, directives and front-page news.",
          difficulty: "EXPERT",
          maxDelegates: 28,
          countries: [
            ["North Korea", 1],
            ["South Korea", 1],
            ["United States", 1],
            ["China", 1],
          ],
        },
        {
          name: "United Nations Human Rights Council",
          topic: "Digital Rights & Surveillance",
          description: "Balancing national security with fundamental freedoms online.",
          difficulty: "INTERMEDIATE",
          maxDelegates: 47,
          countries: [
            ["Germany", 1],
            ["Mexico", 1],
            ["Nigeria", 1],
            ["France", 1],
          ],
        },
        {
          name: "UN Environment Programme",
          topic: "Plastics Pollution Treaty",
          description: "Draft the operative text of a legally binding instrument on plastics.",
          difficulty: "FIRST_TIMER",
          maxDelegates: 60,
          countries: [
            ["Norway", 1],
            ["Chile", 1],
            ["Rwanda", 1],
            ["Indonesia", 1],
          ],
        },
      ],
      agenda: [
        { title: "Opening Ceremony & Plenary", description: "Keynote address and committee assignments.", day: 0, hour: 9 },
        { title: "Committee Session I", description: "Roll call, opening speeches, moderated caucus.", day: 0, hour: 13 },
        { title: "Committee Session II", description: "Unmoderated caucus and working papers.", day: 1, hour: 9 },
        { title: "Committee Session III", description: "Draft resolutions and amendments.", day: 2, hour: 9 },
        { title: "Voting & Awards", description: "Final votes, resolution adoption and award ceremony.", day: 3, hour: 10 },
        { title: "Closing Gala", description: "Social event and conference wrap-up.", day: 3, hour: 19 },
      ],
      gallery: [IMG.hero1, IMG.hall, IMG.debate, IMG.room, IMG.podium, IMG.crowd],
      awards: [
        { name: "Best Delegate", description: "Awarded to the single most outstanding delegate in each committee." },
        { name: "Outstanding Delegate", description: "Recognises consistent excellence across the conference." },
        { name: "Honorable Mention", description: "Given to delegates who distinguish themselves in debate." },
        { name: "Best Position Paper", description: "For the strongest written preparation per committee." },
      ],
      faqs: [
        { question: "Can international delegations attend HMUN?", answer: "Absolutely — around 40% of HMUN delegates travel from outside the United States. Visa invitation letters are issued by the Secretariat on request." },
        { question: "Is HMUN suitable for first-time delegates?", answer: "Yes. Roughly a third of our committees are beginner-friendly, and every delegate receives a comprehensive preparation guide." },
        { question: "What is the dress code?", answer: "Formal business attire (suits, blazers, formal skirts) for all committee sessions and ceremonies." },
      ],
      secretariat: [
        { name: "Sarah Chen", role: "Secretary-General" },
        { name: "James Whitmore", role: "Under-Secretary-General, General Assembly" },
        { name: "Amara Okafor", role: "Under-Secretary-General, Crisis" },
        { name: "Lucas Meyer", role: "Director-General of Committees" },
      ],
    },
    {
      name: "WorldMUN 2027",
      slug: "worldmun-2027",
      tagline: "Harvard's flagship international conference, hosted in Singapore.",
      description:
        "WorldMUN is the second-largest university-level MUN conference in the world, hosted each year in a new global city by Harvard WorldMUN. Delegates from 100+ countries converge for a week of debate, cultural exchange and unforgettable socials. The 2027 edition lands in Singapore with the theme of resilient global governance.",
      theme: "Resilient Governance for a Fragmented World",
      format: "OFFLINE",
      difficulty: "ADVANCED",
      start: 215,
      end: 220,
      deadline: 165,
      fee: 190,
      currency: "USD",
      externalDelegates: true,
      capacity: 1800,
      city: "Singapore",
      state: "Singapore",
      country: "Singapore",
      school: "Harvard College",
      university: "Harvard University",
      website: "https://www.worldmun.org",
      instagram: "https://instagram.com/harvardworldmun",
      email: "secretariat@worldmun.org",
      featured: true,
      logo: "https://images.unsplash.com/photo-1529257414772-1960b7bea4eb?w=400&h=400&fit=crop&q=80",
      banner: IMG.hero2,
      organizer: {
        name: "Harvard WorldMUN",
        school: "Harvard College",
        university: "Harvard University",
        website: "https://www.worldmun.org",
        email: "secretariat@worldmun.org",
        instagram: "https://instagram.com/harvardworldmun",
        description:
          "Harvard WorldMUN organises the largest international Model United Nations conference, rotating host cities across four continents every year.",
      },
      venue: {
        name: "Marina Bay Sands Expo",
        address: "10 Bayfront Ave, Singapore 018956",
        city: "Singapore",
        state: "Singapore",
        country: "Singapore",
        lat: 1.2834,
        lng: 103.8607,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/harvardworldmun" },
        { platform: "LINKEDIN", url: "https://linkedin.com/company/harvardworldmun" },
        { platform: "WEBSITE", url: "https://www.worldmun.org" },
      ],
      committees: [
        {
          name: "General Assembly Plenary",
          topic: "Strengthening the Global Financial Safety Net",
          description: "A full plenary simulation of the UNGA.",
          difficulty: "INTERMEDIATE",
          maxDelegates: 193,
          countries: [["Singapore", 1], ["Germany", 1], ["Argentina", 1]],
        },
        {
          name: "ECOSOC",
          topic: "AI Governance and Labour Markets",
          description: "Policymaking at the intersection of technology and employment.",
          difficulty: "ADVANCED",
          maxDelegates: 54,
          countries: [["Japan", 1], ["India", 1], ["Sweden", 1]],
        },
        {
          name: "Special Political & Decolonization (SPECPOL)",
          topic: "Status of Emerging Microstates",
          description: "Debate on self-determination and territorial integrity.",
          difficulty: "BEGINNER",
          maxDelegates: 80,
          countries: [["Fiji", 1], ["Australia", 1], ["Ireland", 1]],
        },
      ],
      agenda: [
        { title: "Registration & Opening Plenary", description: "Check-in, cultural exhibition, opening addresses.", day: 0, hour: 8 },
        { title: "Committee Session I", description: "Opening speeches and agenda setting.", day: 0, hour: 13 },
        { title: "Committee Session II", description: "Caucusing and working papers.", day: 1, hour: 9 },
        { title: "Committee Session III", description: "Resolution drafting.", day: 2, hour: 9 },
        { title: "Voting Bloc", description: "Voting and resolution adoption.", day: 3, hour: 9 },
        { title: "Closing Ceremony & WorldMUN Ball", description: "Awards and farewell celebrations.", day: 4, hour: 19 },
      ],
      gallery: [IMG.hero2, IMG.crowd, IMG.flags, IMG.room, IMG.debate],
      awards: [
        { name: "Best Delegate", description: "Top individual performance per committee." },
        { name: "Outstanding Delegate", description: "Runner-up excellence per committee." },
        { name: "Honorable Mention", description: "Distinguished performance recognition." },
      ],
      faqs: [
        { question: "Do I need a visa for Singapore?", answer: "Most nationalities enter Singapore visa-free for short stays. The Secretariat provides invitation letters if your delegation needs a visa." },
        { question: "What is the delegate-to-committee ratio?", answer: "Committees are capped to preserve a high-quality debating experience, generally 40–80 delegates." },
      ],
      secretariat: [
        { name: "Priya Raghavan", role: "Secretary-General" },
        { name: "Daniel Park", role: "Director-General" },
        { name: "Maria Solano", role: "Under-Secretary-General, GA" },
      ],
    },
    {
      name: "The Hague International Model United Nations",
      slug: "thimun-2027",
      tagline: "The longest-running international MUN conference for high school.",
      description:
        "THIMUN is a non-governmental, non-profit educational organisation that has been running large-scale Model United Nations conferences since 1968. Held in the World Forum in The Hague — the international city of peace and justice — THIMUN brings thousands of students from over 100 countries together for a unique week of parliamentary debate.",
      theme: "Bridging Divides Through Dialogue",
      format: "OFFLINE",
      difficulty: "INTERMEDIATE",
      start: 178,
      end: 184,
      deadline: 130,
      fee: 145,
      currency: "EUR",
      externalDelegates: true,
      capacity: 3500,
      city: "The Hague",
      state: "Zuid-Holland",
      country: "Netherlands",
      school: "THIMUN Foundation",
      university: null,
      website: "https://www.thimun.org",
      instagram: "https://instagram.com/thimun",
      email: "info@thimun.org",
      logo: "https://images.unsplash.com/photo-1444201983209-c3cbd4d65b18?w=400&h=400&fit=crop&q=80",
      banner: IMG.hall,
      organizer: {
        name: "THIMUN Foundation",
        school: "THIMUN Foundation",
        university: null,
        website: "https://www.thimun.org",
        email: "info@thimun.org",
        instagram: "https://instagram.com/thimun",
        description:
          "Since 1968, the THIMUN Foundation has promoted education and the ideals of the United Nations through Model United Nations conferences worldwide.",
      },
      venue: {
        name: "World Forum",
        address: "Churchillplein 10, 2517 JW Den Haag",
        city: "The Hague",
        state: "Zuid-Holland",
        country: "Netherlands",
        lat: 52.0862,
        lng: 4.2859,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/thimun" },
        { platform: "WEBSITE", url: "https://www.thimun.org" },
        { platform: "YOUTUBE", url: "https://youtube.com/@thimun" },
      ],
      committees: [
        {
          name: "Security Council",
          topic: "Maritime Security in the Red Sea",
          description: "High-stakes debate on freedom of navigation and regional escalation.",
          difficulty: "ADVANCED",
          maxDelegates: 15,
          countries: [["France", 1], ["Egypt", 1], ["China", 1], ["United States", 1]],
        },
        {
          name: "UNICEF",
          topic: "Child Labour in Global Supply Chains",
          description: "Humanitarian committee focused on child protection.",
          difficulty: "BEGINNER",
          maxDelegates: 40,
          countries: [["Netherlands", 1], ["Bangladesh", 1], ["Italy", 1]],
        },
        {
          name: "DISEC",
          topic: "Regulating Autonomous Weapons",
          description: "Arms control and emerging military technology.",
          difficulty: "INTERMEDIATE",
          maxDelegates: 80,
          countries: [["Germany", 1], ["Switzerland", 1], ["India", 1]],
        },
      ],
      agenda: [
        { title: "Arrival & Opening Ceremony", description: "Welcome addresses in the World Forum plenary hall.", day: 0, hour: 10 },
        { title: "Committee Session I", description: "Roll call and general speakers list.", day: 1, hour: 9 },
        { title: "Committee Session II", description: "Moderated and unmoderated caucus.", day: 2, hour: 9 },
        { title: "Committee Session III", description: "Resolution drafting and merging.", day: 3, hour: 9 },
        { title: "Final Plenary & Closing", description: "Voting, awards and closing ceremony.", day: 4, hour: 14 },
      ],
      gallery: [IMG.hall, IMG.podium, IMG.room, IMG.flags],
      awards: [
        { name: "Best Delegate", description: "Per committee, top delegate." },
        { name: "Honorable Mention", description: "Per committee, distinguished delegate." },
        { name: "Best School Delegation", description: "Awarded to the strongest overall delegation." },
      ],
      faqs: [
        { question: "What age group attends THIMUN?", answer: "THIMUN is a secondary school conference. Delegates are typically 14–18 years old." },
        { question: "Do delegates need prior experience?", answer: "No — THIMUN welcomes first-timers, and many committees are beginner-friendly." },
      ],
      secretariat: [
        { name: "Anneke van der Berg", role: "Secretary-General" },
        { name: "Pieter Janssen", role: "Deputy Secretary-General" },
      ],
    },
    {
      name: "Geneva International Model United Nations",
      slug: "gimun-2026",
      tagline: "Debate in the heart of the UN's European headquarters.",
      description:
        "GIMUN offers students the unique opportunity to simulate the United Nations in Geneva — home of the UN's Human Rights Council and the headquarters of dozens of international organisations. Sessions are held in the Palais des Nations, the historic seat of the League of Nations and now the European headquarters of the United Nations.",
      theme: "The Future of Multilateralism",
      format: "HYBRID",
      difficulty: "INTERMEDIATE",
      start: 95,
      end: 98,
      deadline: 60,
      fee: 85,
      currency: "EUR",
      externalDelegates: true,
      capacity: 700,
      city: "Geneva",
      state: "Geneva",
      country: "Switzerland",
      school: "University of Geneva",
      university: "University of Geneva",
      website: "https://www.gimun.ch",
      instagram: "https://instagram.com/gimun_official",
      email: "contact@gimun.ch",
      logo: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=400&fit=crop&q=80",
      banner: IMG.flags,
      organizer: {
        name: "GIMUN Association",
        school: "University of Geneva",
        university: "University of Geneva",
        website: "https://www.gimun.ch",
        email: "contact@gimun.ch",
        instagram: "https://instagram.com/gimun_official",
        description:
          "The GIMUN Association is a student-run organisation of the University of Geneva dedicated to promoting diplomacy education.",
      },
      venue: {
        name: "Palais des Nations",
        address: "Avenue de la Paix 14, 1211 Genève",
        city: "Geneva",
        state: "Geneva",
        country: "Switzerland",
        lat: 46.2267,
        lng: 6.1405,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/gimun_official" },
        { platform: "WEBSITE", url: "https://www.gimun.ch" },
      ],
      committees: [
        {
          name: "Human Rights Council",
          topic: "Freedom of Expression in the Digital Age",
          description: "Held in the real HRC chamber of the Palais des Nations.",
          difficulty: "ADVANCED",
          maxDelegates: 47,
          countries: [["France", 1], ["Switzerland", 1], ["Nigeria", 1]],
        },
        {
          name: "World Health Organization",
          topic: "Pandemic Prevention & Global Surveillance",
          description: "Public health diplomacy at the WHO's home city.",
          difficulty: "INTERMEDIATE",
          maxDelegates: 60,
          countries: [["Switzerland", 1], ["Brazil", 1], ["India", 1]],
        },
        {
          name: "UNHCR",
          topic: "Durable Solutions for Displacement",
          description: "Refugee protection and resettlement policy.",
          difficulty: "BEGINNER",
          maxDelegates: 50,
          countries: [["Jordan", 1], ["Germany", 1], ["Kenya", 1]],
        },
      ],
      agenda: [
        { title: "Tour of the Palais & Opening", description: "Guided tour followed by the opening ceremony.", day: 0, hour: 9 },
        { title: "Committee Session I", description: "Opening speeches.", day: 1, hour: 9 },
        { title: "Committee Session II", description: "Caucus and working papers.", day: 2, hour: 9 },
        { title: "Committee Session III & Awards", description: "Voting, resolutions and award ceremony.", day: 3, hour: 9 },
      ],
      gallery: [IMG.flags, IMG.podium, IMG.hall, IMG.room],
      awards: [
        { name: "Best Delegate", description: "Top delegate per committee." },
        { name: "Honorable Mention", description: "Runner-up per committee." },
      ],
      faqs: [
        { question: "Can we enter the Palais des Nations?", answer: "Yes — committee sessions are held inside the Palais des Nations subject to UN security procedures." },
      ],
      secretariat: [
        { name: "Léa Moreau", role: "Secretary-General" },
        { name: "Rafael Costa", role: "Deputy Secretary-General" },
      ],
    },
    {
      name: "Bangkok International Model United Nations",
      slug: "bimun-2026",
      tagline: "Southeast Asia's premier high school MUN conference.",
      description:
        "BIMUN is Thailand's largest Model United Nations conference, welcoming delegations from across Southeast Asia, Australia and the Middle East. Known for its electric energy, high-quality committees and warm hospitality, BIMUN is a favourite early stop on the international circuit.",
      theme: "ASEAN & the Future of the Indo-Pacific",
      format: "OFFLINE",
      difficulty: "BEGINNER",
      start: 70,
      end: 73,
      deadline: 35,
      fee: 60,
      currency: "USD",
      externalDelegates: true,
      capacity: 1200,
      city: "Bangkok",
      state: "Bangkok",
      country: "Thailand",
      school: "Shrewsbury International School Bangkok",
      university: null,
      website: "https://www.bimun.org",
      instagram: "https://instagram.com/bimun_bangkok",
      email: "hello@bimun.org",
      logo: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&h=400&fit=crop&q=80",
      banner: IMG.crowd,
      organizer: {
        name: "BIMUN Secretariat",
        school: "Shrewsbury International School Bangkok",
        university: null,
        website: "https://www.bimun.org",
        email: "hello@bimun.org",
        instagram: "https://instagram.com/bimun_bangkok",
        description:
          "The BIMUN Secretariat is a student organisation running Thailand's flagship high school MUN conference.",
      },
      venue: {
        name: "Shrewsbury International School",
        address: "1922 Charoen Krung Rd, Wat Phraya Krai, Bang Kho Laem",
        city: "Bangkok",
        state: "Bangkok",
        country: "Thailand",
        lat: 13.6983,
        lng: 100.5062,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/bimun_bangkok" },
        { platform: "WEBSITE", url: "https://www.bimun.org" },
      ],
      committees: [
        {
          name: "ASEAN Summit",
          topic: "Regional Supply Chain Resilience",
          description: "Heads-of-state simulation for the Association of Southeast Asian Nations.",
          difficulty: "INTERMEDIATE",
          maxDelegates: 10,
          countries: [["Thailand", 1], ["Vietnam", 1], ["Indonesia", 1], ["Singapore", 1]],
        },
        {
          name: "General Assembly First Committee",
          topic: "Cybersecurity & International Peace",
          description: "Disarmament and international security committee.",
          difficulty: "BEGINNER",
          maxDelegates: 120,
          countries: [["Australia", 1], ["Japan", 1], ["Philippines", 1]],
        },
        {
          name: "UN Women",
          topic: "Women in STEM & Leadership",
          description: "Gender equality and economic empowerment.",
          difficulty: "FIRST_TIMER",
          maxDelegates: 60,
          countries: [["Thailand", 1], ["Canada", 1], ["South Korea", 1]],
        },
      ],
      agenda: [
        { title: "Opening Ceremony", description: "Cultural performances and welcome speeches.", day: 0, hour: 9 },
        { title: "Committee Session I", description: "Roll call and general speakers list.", day: 0, hour: 13 },
        { title: "Committee Session II", description: "Caucus and resolution drafting.", day: 1, hour: 9 },
        { title: "Committee Session III", description: "Final debate and voting.", day: 2, hour: 9 },
        { title: "Closing & Awards", description: "Awards ceremony and delegate social.", day: 2, hour: 17 },
      ],
      gallery: [IMG.crowd, IMG.debate, IMG.room, IMG.flags],
      awards: [
        { name: "Best Delegate", description: "Per committee." },
        { name: "Outstanding Delegate", description: "Per committee." },
        { name: "Honorable Mention", description: "Per committee." },
      ],
      faqs: [
        { question: "Is BIMUN beginner friendly?", answer: "Extremely. Many first-time delegates attend BIMUN and we run beginner workshops on day one." },
      ],
      secretariat: [
        { name: "Chanya Siriphan", role: "Secretary-General" },
        { name: "Marcus Teo", role: "Director-General" },
      ],
    },
    {
      name: "Rotterdam International Model United Nations",
      slug: "euromun-2027",
      tagline: "Europe's leading university-level MUN, in the port city of Rotterdam.",
      description:
        "EUROMUN is the largest MUN conference in the Netherlands and one of the biggest in Europe, run entirely by students of Erasmus University Rotterdam. With 1,500 delegates from 40+ countries, EUROMUN is famous for its dynamic crisis committees and its legendary social programme.",
      theme: "Recalibrating the European Project",
      format: "OFFLINE",
      difficulty: "ADVANCED",
      start: 190,
      end: 194,
      deadline: 150,
      fee: 75,
      currency: "EUR",
      externalDelegates: true,
      capacity: 1500,
      city: "Rotterdam",
      state: "Zuid-Holland",
      country: "Netherlands",
      school: "Erasmus University Rotterdam",
      university: "Erasmus University Rotterdam",
      website: "https://www.euromun.nl",
      instagram: "https://instagram.com/euromun",
      email: "info@euromun.nl",
      logo: "https://images.unsplash.com/photo-1493767148-7cfee0fae65e?w=400&h=400&fit=crop&q=80",
      banner: IMG.room,
      organizer: {
        name: "EUROMUN Foundation",
        school: "Erasmus University Rotterdam",
        university: "Erasmus University Rotterdam",
        website: "https://www.euromun.nl",
        email: "info@euromun.nl",
        instagram: "https://instagram.com/euromun",
        description:
          "EUROMUN Foundation organises the annual EUROMUN conference and year-round diplomacy training programmes.",
      },
      venue: {
        name: "De Doelen Convention Centre",
        address: "Schouwburgplein 50, 3012 CL Rotterdam",
        city: "Rotterdam",
        state: "Zuid-Holland",
        country: "Netherlands",
        lat: 51.9207,
        lng: 4.4726,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/euromun" },
        { platform: "LINKEDIN", url: "https://linkedin.com/company/euromun" },
        { platform: "WEBSITE", url: "https://www.euromun.nl" },
      ],
      committees: [
        {
          name: "European Council",
          topic: "Enlargement & the Western Balkans",
          description: "Heads of state of the EU member states.",
          difficulty: "ADVANCED",
          maxDelegates: 27,
          countries: [["Netherlands", 1], ["France", 1], ["Germany", 1], ["Poland", 1]],
        },
        {
          name: "Historical Security Council: 1995 Srebrenica",
          topic: "Peacekeeping Mandate in the Balkans",
          description: "A historical crisis simulation of the SC in 1995.",
          difficulty: "EXPERT",
          maxDelegates: 15,
          countries: [["France", 1], ["United Kingdom", 1], ["Russia", 1], ["United States", 1]],
        },
        {
          name: "European Parliament",
          topic: "Digital Markets Regulation",
          description: "Legislative simulation with political groups.",
          difficulty: "INTERMEDIATE",
          maxDelegates: 60,
          countries: [["Netherlands", 1], ["Germany", 1], ["Spain", 1]],
        },
      ],
      agenda: [
        { title: "Opening Ceremony", description: "Welcome in De Doelen's grand auditorium.", day: 0, hour: 10 },
        { title: "Committee Session I", description: "Setting the agenda and opening speeches.", day: 0, hour: 14 },
        { title: "Committee Session II", description: "Crisis updates and caucusing.", day: 1, hour: 9 },
        { title: "Committee Session III", description: "Resolution drafting.", day: 2, hour: 9 },
        { title: "Closing & Awards", description: "Voting bloc and award ceremony.", day: 3, hour: 10 },
        { title: "EUROMUN Night", description: "The conference's iconic social event.", day: 3, hour: 21 },
      ],
      gallery: [IMG.room, IMG.debate, IMG.crowd, IMG.hall],
      awards: [
        { name: "Best Delegate", description: "Top delegate per committee." },
        { name: "Outstanding Delegate", description: "Runner-up per committee." },
        { name: "Best Crisis Performance", description: "For outstanding directive writing and crisis management." },
      ],
      faqs: [
        { question: "Is EUROMUN open to high school students?", answer: "EUROMUN is a university-level conference; most delegates are undergraduates, though strong high school delegates may apply." },
      ],
      secretariat: [
        { name: "Eva de Vries", role: "Secretary-General" },
        { name: "Tom van Dijk", role: "Deputy Secretary-General" },
        { name: "Noor Bakker", role: "Crisis Director" },
      ],
    },
    {
      name: "Dubai International Academy Model United Nations",
      slug: "diamun-2026",
      tagline: "The Middle East's biggest student-led MUN experience.",
      description:
        "DIAMUN brings more than 1,500 delegates from over 80 schools across the Middle East, Asia and Europe to Dubai each November. Blending formal United Nations procedure with the energy and ambition of the Emirates, DIAMUN is a launchpad for many delegates' international MUN careers.",
      theme: "Innovation, Inclusion, Impact",
      format: "OFFLINE",
      difficulty: "INTERMEDIATE",
      start: 105,
      end: 108,
      deadline: 80,
      fee: 55,
      currency: "AED",
      externalDelegates: true,
      capacity: 1500,
      city: "Dubai",
      state: "Dubai",
      country: "United Arab Emirates",
      school: "Dubai International Academy",
      university: null,
      website: "https://www.diamun.com",
      instagram: "https://instagram.com/diamun_dubai",
      email: "secretariat@diamun.com",
      logo: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=400&fit=crop&q=80",
      banner: IMG.podium,
      organizer: {
        name: "DIAMUN Secretariat",
        school: "Dubai International Academy",
        university: null,
        website: "https://www.diamun.com",
        email: "secretariat@diamun.com",
        instagram: "https://instagram.com/diamun_dubai",
        description:
          "DIAMUN is one of the largest student-run MUN conferences in the Middle East, hosted annually by Dubai International Academy.",
      },
      venue: {
        name: "Dubai World Trade Centre",
        address: "Sheikh Zayed Rd, Trade Centre, Dubai",
        city: "Dubai",
        state: "Dubai",
        country: "United Arab Emirates",
        lat: 25.2274,
        lng: 55.2859,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/diamun_dubai" },
        { platform: "WEBSITE", url: "https://www.diamun.com" },
      ],
      committees: [
        {
          name: "UN General Assembly",
          topic: "Youth, Peace and Security",
          description: "The main committee focusing on youth engagement in peacebuilding.",
          difficulty: "BEGINNER",
          maxDelegates: 150,
          countries: [["UAE", 1], ["India", 1], ["Egypt", 1], ["United Kingdom", 1]],
        },
        {
          name: "Security Council",
          topic: "Stabilisation in the Horn of Africa",
          description: "Intense, fast-paced security debate.",
          difficulty: "ADVANCED",
          maxDelegates: 15,
          countries: [["United States", 1], ["China", 1], ["France", 1], ["Russia", 1]],
        },
        {
          name: "WHO",
          topic: "Mental Health in Post-Pandemic Recovery",
          description: "Global health policy committee.",
          difficulty: "FIRST_TIMER",
          maxDelegates: 80,
          countries: [["UAE", 1], ["Japan", 1], ["Kenya", 1]],
        },
      ],
      agenda: [
        { title: "Opening Ceremony", description: "Keynote and national anthems.", day: 0, hour: 9 },
        { title: "Committee Session I", description: "Roll call and agenda setting.", day: 0, hour: 13 },
        { title: "Committee Session II", description: "Caucusing and working papers.", day: 1, hour: 9 },
        { title: "Committee Session III", description: "Resolutions and amendments.", day: 2, hour: 9 },
        { title: "Closing & Awards", description: "Voting and awards gala.", day: 2, hour: 18 },
      ],
      gallery: [IMG.podium, IMG.crowd, IMG.debate, IMG.flags],
      awards: [
        { name: "Best Delegate", description: "Per committee." },
        { name: "Outstanding Delegate", description: "Per committee." },
        { name: "Best Delegation", description: "Best school delegation overall." },
      ],
      faqs: [
        { question: "Can my school register an external delegation?", answer: "Yes, DIAMUN welcomes external school delegations from across the world." },
      ],
      secretariat: [
        { name: "Aisha Al Marzouqi", role: "Secretary-General" },
        { name: "Omar Khaled", role: "Deputy Secretary-General" },
      ],
    },
    {
      name: "Sheffield Model United Nations",
      slug: "shumun-2026",
      tagline: "The UK's friendliest university MUN conference.",
      description:
        "SHUMUN is a university-level conference run by the University of Sheffield Union of Students. Known for its accessible fees, excellent crisis rooms and welcoming atmosphere, SHUMUN has become a staple of the British MUN circuit and an ideal first university conference.",
      theme: "Local Action, Global Change",
      format: "OFFLINE",
      difficulty: "BEGINNER",
      start: 40,
      end: 42,
      deadline: 10,
      fee: 25,
      currency: "GBP",
      externalDelegates: true,
      capacity: 400,
      city: "Sheffield",
      state: "South Yorkshire",
      country: "United Kingdom",
      school: "University of Sheffield",
      university: "University of Sheffield",
      website: "https://www.shumun.co.uk",
      instagram: "https://instagram.com/shumun",
      email: "shumun@sheffield.ac.uk",
      logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80",
      banner: IMG.debate,
      organizer: {
        name: "Sheffield University MUN Society",
        school: "University of Sheffield",
        university: "University of Sheffield",
        website: "https://www.shumun.co.uk",
        email: "shumun@sheffield.ac.uk",
        instagram: "https://instagram.com/shumun",
        description:
          "The Sheffield University MUN Society runs SHUMUN and weekly debate training sessions for students.",
      },
      venue: {
        name: "University of Sheffield Students' Union",
        address: "Western Bank, Sheffield S10 2TG",
        city: "Sheffield",
        state: "South Yorkshire",
        country: "United Kingdom",
        lat: 53.3811,
        lng: -1.4869,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/shumun" },
        { platform: "WEBSITE", url: "https://www.shumun.co.uk" },
      ],
      committees: [
        {
          name: "UNSC",
          topic: "Ukraine: Humanitarian Access",
          description: "Security council debate on humanitarian corridors.",
          difficulty: "INTERMEDIATE",
          maxDelegates: 15,
          countries: [["United Kingdom", 1], ["France", 1], ["China", 1]],
        },
        {
          name: "UNEP",
          topic: "Net-Zero Cities",
          description: "Environment committee with strong UK turnout.",
          difficulty: "FIRST_TIMER",
          maxDelegates: 60,
          countries: [["United Kingdom", 1], ["Germany", 1], ["Chile", 1]],
        },
      ],
      agenda: [
        { title: "Registration & Opening", description: "Arrival and opening ceremony.", day: 0, hour: 10 },
        { title: "Committee Session I", description: "Opening speeches.", day: 0, hour: 12 },
        { title: "Committee Session II", description: "Caucus and working papers.", day: 1, hour: 9 },
        { title: "Committee Session III & Awards", description: "Voting and closing awards.", day: 2, hour: 10 },
      ],
      gallery: [IMG.debate, IMG.room, IMG.crowd],
      awards: [
        { name: "Best Delegate", description: "Per committee." },
        { name: "Honorable Mention", description: "Per committee." },
      ],
      faqs: [
        { question: "What does the fee include?", answer: "The fee covers all sessions, materials, refreshments, and the closing social." },
      ],
      secretariat: [
        { name: "Holly Turner", role: "Secretary-General" },
        { name: "Ben Hughes", role: "Director-General" },
      ],
    },
    {
      name: "MIT Model United Nations Conference",
      slug: "mitmunc-2026",
      tagline: "Innovation meets international relations in Cambridge, MA.",
      description:
        "MITMUNC combines the rigour of MIT with the world's most pressing policy challenges. Held at the MIT campus, the conference specialises in technical and scientific committees — from AI governance to space law — alongside a full range of traditional UN bodies.",
      theme: "Science, Technology and the Global Order",
      format: "HYBRID",
      difficulty: "INTERMEDIATE",
      start: 120,
      end: 123,
      deadline: 85,
      fee: 95,
      currency: "USD",
      externalDelegates: true,
      capacity: 600,
      city: "Cambridge",
      state: "Massachusetts",
      country: "United States",
      school: "Massachusetts Institute of Technology",
      university: "Massachusetts Institute of Technology",
      website: "https://www.mitmunc.org",
      instagram: "https://instagram.com/mitmunc",
      email: "secretariat@mitmunc.org",
      logo: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop&q=80",
      banner: IMG.room,
      organizer: {
        name: "MITMUNC",
        school: "Massachusetts Institute of Technology",
        university: "Massachusetts Institute of Technology",
        website: "https://www.mitmunc.org",
        email: "secretariat@mitmunc.org",
        instagram: "https://instagram.com/mitmunc",
        description:
          "MITMUNC is MIT's student-run Model United Nations conference, known for science-and-technology committees.",
      },
      venue: {
        name: "MIT Campus — Building 34",
        address: "50 Vassar St, Cambridge, MA 02139",
        city: "Cambridge",
        state: "Massachusetts",
        country: "United States",
        lat: 42.3601,
        lng: -71.0928,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/mitmunc" },
        { platform: "WEBSITE", url: "https://www.mitmunc.org" },
      ],
      committees: [
        {
          name: "Ad Hoc Committee on AI Governance",
          topic: "Frontier AI & International Coordination",
          description: "A specialised committee crafting an international AI treaty.",
          difficulty: "ADVANCED",
          maxDelegates: 40,
          countries: [["United States", 1], ["China", 1], ["European Union", 1], ["India", 1]],
        },
        {
          name: "UN Committee on the Peaceful Uses of Outer Space",
          topic: "Space Debris Mitigation",
          description: "Space law and orbital sustainability.",
          difficulty: "INTERMEDIATE",
          maxDelegates: 50,
          countries: [["United States", 1], ["Japan", 1], ["India", 1]],
        },
        {
          name: "General Assembly",
          topic: "Science Diplomacy in the Global South",
          description: "Broad assembly with a research focus.",
          difficulty: "BEGINNER",
          maxDelegates: 100,
          countries: [["Brazil", 1], ["Kenya", 1], ["Germany", 1]],
        },
      ],
      agenda: [
        { title: "Opening & Keynote", description: "Keynote from a leading science diplomat.", day: 0, hour: 9 },
        { title: "Committee Session I", description: "Opening speeches.", day: 0, hour: 13 },
        { title: "Committee Session II", description: "Caucus and tech briefings.", day: 1, hour: 9 },
        { title: "Committee Session III", description: "Resolution drafting.", day: 2, hour: 9 },
        { title: "Voting & Awards", description: "Final votes and award ceremony.", day: 2, hour: 16 },
      ],
      gallery: [IMG.room, IMG.debate, IMG.podium],
      awards: [
        { name: "Best Delegate", description: "Per committee." },
        { name: "Outstanding Delegate", description: "Per committee." },
      ],
      faqs: [
        { question: "Do I need a science background?", answer: "No. Committee topic briefings are provided in advance and no technical expertise is required." },
      ],
      secretariat: [
        { name: "Grace Liu", role: "Secretary-General" },
        { name: "Sam Patel", role: "Director of Technology" },
      ],
    },
    {
      name: "London School of Economics Model United Nations",
      slug: "lsemun-2026",
      tagline: "Debate in the heart of London with a policy-first approach.",
      description:
        "LSEMUN is the flagship conference of the LSE SU United Nations Society, one of the largest student societies in Europe. Set across LSE's central London campus, the conference is prized for its rigorous economic and political committees and its location steps from Parliament.",
      theme: "Economics, Equity and the Post-Growth Agenda",
      format: "OFFLINE",
      difficulty: "INTERMEDIATE",
      start: 88,
      end: 91,
      deadline: 55,
      fee: 45,
      currency: "GBP",
      externalDelegates: true,
      capacity: 500,
      city: "London",
      state: "England",
      country: "United Kingdom",
      school: "London School of Economics",
      university: "London School of Economics",
      website: "https://www.lsemun.com",
      instagram: "https://instagram.com/lsemun",
      email: "lsemun@lsesu.org",
      logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=400&fit=crop&q=80",
      banner: IMG.hall,
      organizer: {
        name: "LSE SU United Nations Society",
        school: "London School of Economics",
        university: "London School of Economics",
        website: "https://www.lsemun.com",
        email: "lsemun@lsesu.org",
        instagram: "https://instagram.com/lsemun",
        description:
          "The LSE SU UN Society organises LSEMUN alongside weekly debate sessions, panels and diplomacy events.",
      },
      venue: {
        name: "London School of Economics",
        address: "Houghton St, London WC2A 2AE",
        city: "London",
        state: "England",
        country: "United Kingdom",
        lat: 51.5145,
        lng: -0.1167,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/lsemun" },
        { platform: "LINKEDIN", url: "https://linkedin.com/company/lsemun" },
        { platform: "WEBSITE", url: "https://www.lsemun.com" },
      ],
      committees: [
        {
          name: "IMF-World Bank Joint Forum",
          topic: "Debt Relief for Developing Economies",
          description: "Global finance simulation with lender and borrower positions.",
          difficulty: "EXPERT",
          maxDelegates: 30,
          countries: [["United Kingdom", 1], ["China", 1], ["Nigeria", 1], ["Brazil", 1]],
        },
        {
          name: "UNGA Second Committee",
          topic: "Global Tax Cooperation",
          description: "Economic and financial committee.",
          difficulty: "ADVANCED",
          maxDelegates: 120,
          countries: [["France", 1], ["India", 1], ["Ireland", 1]],
        },
        {
          name: "Commission on the Status of Women",
          topic: "Closing the Gender Pay Gap",
          description: "Social policy committee.",
          difficulty: "BEGINNER",
          maxDelegates: 60,
          countries: [["Iceland", 1], ["Rwanda", 1], ["Japan", 1]],
        },
      ],
      agenda: [
        { title: "Opening & Welcome", description: "Welcome address at the LSE Old Theatre.", day: 0, hour: 9 },
        { title: "Committee Session I", description: "Roll call and opening speeches.", day: 0, hour: 12 },
        { title: "Committee Session II", description: "Caucusing and policy papers.", day: 1, hour: 9 },
        { title: "Committee Session III", description: "Resolution drafting.", day: 2, hour: 9 },
        { title: "Closing & Awards", description: "Voting and award ceremony.", day: 2, hour: 15 },
      ],
      gallery: [IMG.hall, IMG.room, IMG.flags, IMG.debate],
      awards: [
        { name: "Best Delegate", description: "Per committee." },
        { name: "Outstanding Delegate", description: "Per committee." },
        { name: "Best Position Paper", description: "Per committee." },
      ],
      faqs: [
        { question: "Is there accommodation for external delegates?", answer: "External delegations are encouraged to book central London accommodation; a delegate guide is published after registration." },
      ],
      secretariat: [
        { name: "Isabelle Hart", role: "Secretary-General" },
        { name: "Arjun Mehta", role: "Deputy Secretary-General" },
      ],
    },
    {
      name: "Global Assembly Online",
      slug: "global-assembly-online-2026",
      tagline: "The world's most accessible MUN — fully online, free to attend.",
      description:
        "Global Assembly Online removes every barrier to Model United Nations. With zero fees, a fully virtual platform, and sessions scheduled across three time zones, delegates from every corner of the globe can experience committee debate from home. It is the perfect first step into the MUN world.",
      theme: "Every Voice Counts",
      format: "ONLINE",
      difficulty: "FIRST_TIMER",
      start: 30,
      end: 32,
      deadline: 20,
      fee: 0,
      currency: "USD",
      externalDelegates: true,
      capacity: 500,
      city: "Online",
      state: null,
      country: "Global",
      school: "MUNOS Foundation",
      university: null,
      website: "https://munos.app",
      instagram: "https://instagram.com/munos",
      email: "events@munos.app",
      logo: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=400&fit=crop&q=80",
      banner: IMG.debate,
      organizer: {
        name: "MUNOS Foundation",
        school: "MUNOS Foundation",
        university: null,
        website: "https://munos.app",
        email: "events@munos.app",
        instagram: "https://instagram.com/munos",
        description:
          "MUNOS Foundation runs accessible, technology-first Model United Nations events for delegates worldwide.",
      },
      venue: {
        name: "Virtual Convention Hall",
        address: "Online via MUNOS platform",
        city: "Online",
        state: null,
        country: "Global",
        lat: 0,
        lng: 0,
      },
      socials: [
        { platform: "INSTAGRAM", url: "https://instagram.com/munos" },
        { platform: "WEBSITE", url: "https://munos.app" },
      ],
      committees: [
        {
          name: "General Assembly",
          topic: "Access to Education",
          description: "A welcoming plenary for newcomers.",
          difficulty: "FIRST_TIMER",
          maxDelegates: 150,
          countries: [["Nigeria", 1], ["Brazil", 1], ["India", 1], ["Canada", 1]],
        },
        {
          name: "UNICEF",
          topic: "Digital Literacy for All",
          description: "Beginner-friendly humanitarian committee.",
          difficulty: "FIRST_TIMER",
          maxDelegates: 80,
          countries: [["Kenya", 1], ["Japan", 1], ["Mexico", 1]],
        },
      ],
      agenda: [
        { title: "Welcome & Platform Tutorial", description: "Onboarding for new delegates.", day: 0, hour: 16 },
        { title: "Committee Session I", description: "Opening speeches across time zones.", day: 0, hour: 18 },
        { title: "Committee Session II", description: "Caucusing in virtual rooms.", day: 1, hour: 16 },
        { title: "Committee Session III", description: "Drafting and voting.", day: 2, hour: 16 },
        { title: "Closing & Awards", description: "Virtual award ceremony.", day: 2, hour: 20 },
      ],
      gallery: [IMG.debate, IMG.flags],
      awards: [
        { name: "Best Delegate", description: "Per committee." },
        { name: "Best First-Timer", description: "Outstanding newcomer performance." },
      ],
      faqs: [
        { question: "Is Global Assembly really free?", answer: "Yes — this event is fully free as part of our mission to make MUN accessible to everyone." },
        { question: "What platform do you use?", answer: "Sessions run on the MUNOS virtual convention platform, accessible from any modern browser." },
      ],
      secretariat: [
        { name: "Nadia Rahman", role: "Secretary-General" },
        { name: "Tomás Herrera", role: "Director of Technology" },
      ],
    },
  ];

  for (const seed of conferences) {
    const organizer = await prisma.organizer.create({
      data: {
        name: seed.organizer.name,
        description: seed.organizer.description,
        school: seed.organizer.school || null,
        university: seed.organizer.university || null,
        website: seed.organizer.website,
        email: seed.organizer.email,
        instagram: seed.organizer.instagram,
        logoUrl: seed.organizer.school === "Harvard College" ? seed.logo : null,
      },
    });

    const startDate = at(seed.start);
    const endDate = at(seed.end);

    await prisma.conference.create({
      data: {
        slug: seed.slug,
        name: seed.name,
        tagline: seed.tagline,
        description: seed.description,
        theme: seed.theme,
        format: seed.format,
        difficulty: seed.difficulty,
        startDate,
        endDate,
        registrationOpen: seed.deadline === null || at(seed.deadline) > new Date(),
        externalDelegates: seed.externalDelegates,
        fee: seed.fee,
        currency: seed.currency,
        registrationDeadline: seed.deadline !== null ? at(seed.deadline) : null,
        capacity: seed.capacity,
        website: seed.website,
        instagram: seed.instagram,
        email: seed.email,
        school: seed.school,
        university: seed.university || null,
        city: seed.city,
        state: seed.state,
        country: seed.country,
        logoUrl: seed.logo,
        bannerUrl: seed.banner,
        featured: seed.featured ?? false,
        published: true,
        organizerId: organizer.id,
        venue: {
          create: {
            name: seed.venue.name,
            address: seed.venue.address,
            city: seed.venue.city,
            state: seed.venue.state,
            country: seed.venue.country,
            latitude: seed.venue.lat,
            longitude: seed.venue.lng,
            mapsUrl: `https://www.google.com/maps?q=${encodeURIComponent(seed.venue.name + ", " + seed.venue.city)}`,
          },
        },
        socialLinks: {
          create: seed.socials.map((s) => ({ platform: s.platform, url: s.url })),
        },
        committees: {
          create: seed.committees.map((committee, index) => ({
            name: committee.name,
            topic: committee.topic,
            description: committee.description,
            difficulty: committee.difficulty,
            maxDelegates: committee.maxDelegates,
            createdAt: new Date(Date.now() + index),
            countryMatrix: {
              create: committee.countries.map(([country, seats]) => ({ country, seats })),
            },
          })),
        },
        agenda: {
          create: seed.agenda.map((item) => ({
            title: item.title,
            description: item.description,
            startAt: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + item.day, item.hour, 0),
            endAt: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + item.day, item.hour + 2, 0),
            sortOrder: item.day * 100 + item.hour,
          })),
        },
        brochures: {
          create: {
            title: `${seed.name} — Conference Guide`,
            fileName: `${seed.slug}-brochure.pdf`,
            mimeType: "application/pdf",
            sizeBytes: 118000,
            fileUrl: DUMMY_BROCHURE,
          },
        },
        gallery: {
          create: seed.gallery.map((url, index) => ({ url, sortOrder: index })),
        },
        awards: {
          create: seed.awards.map((award, index) => ({
            name: award.name,
            description: award.description,
            sortOrder: index,
          })),
        },
        faqs: {
          create: seed.faqs.map((faq, index) => ({
            question: faq.question,
            answer: faq.answer,
            sortOrder: index,
          })),
        },
        secretariat: {
          create: seed.secretariat.map((member, index) => ({
            name: member.name,
            role: member.role,
            sortOrder: index,
          })),
        },
      },
    });

    console.log(`Seeded conference: ${seed.name}`);
  }

  console.log(`Done — ${conferences.length} conferences seeded.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
