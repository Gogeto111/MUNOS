/**
 * Seed registries for the Phase 6 live-intelligence sync. These are pure data
 * modules (no server-only import) so they can be unit-tested and shared.
 *
 * URLs were verified as of the 2026 conference cycle where possible. Sites
 * are single-page-rendered or occasionally rate-limit scrapers, so the
 * crawler treats every source as best-effort: a failing source is reported,
 * never fatal.
 */

export interface ConferenceSource {
  id: string;
  conference: string;
  url: string;
  description: string;
}

export interface UnFeed {
  id: string;
  label: string;
  url: string;
  topics: string;
}

/** Official conference sites crawled for background guides, topic pages, and PDFs. */
export const CONFERENCE_SOURCES: ConferenceSource[] = [
  {
    id: "harvard-hmun",
    conference: "Harvard Model United Nations",
    url: "https://www.harvardmun.org",
    description: "High-school conference in Boston; committee & preparation pages.",
  },
  {
    id: "harvard-hnmun",
    conference: "Harvard National Model United Nations",
    url: "https://www.hnmun.org",
    description: "Collegiate conference in Boston.",
  },
  {
    id: "harvard-hmun-india",
    conference: "Harvard Model United Nations India",
    url: "https://www.hmunindia.org",
    description: "HMUN India; background guides and delegate prep.",
  },
  {
    id: "yale-ymun",
    conference: "Yale Model United Nations",
    url: "https://ymun.org",
    description: "YMUN on Yale campus; committees and procedure pages.",
  },
  {
    id: "cambridge-cammun",
    conference: "Cambridge Model United Nations",
    url: "https://cammun.org",
    description: "CamMUN; committee and topic pages.",
  },
  {
    id: "harvard-worldmun",
    conference: "Harvard World Model United Nations",
    url: "https://www.worldmun.org",
    description: "WorldMUN; best-effort, crawler tolerates failures.",
  },
  {
    id: "thimun",
    conference: "THIMUN Foundation",
    url: "https://thimun.org",
    description: "THIMUN Foundation; best-effort, crawler tolerates failures.",
  },
  {
    id: "oxford-oximun",
    conference: "Oxford International Model United Nations",
    url: "https://www.oximun.org",
    description: "OxIMUN; best-effort, crawler tolerates failures.",
  },
];

/** Official UN news / meetings feeds so answers reflect current events. */
export const UN_FEEDS: UnFeed[] = [
  {
    id: "un-news-top",
    label: "UN News — Top Stories",
    url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
    topics: "united nations, world news",
  },
  {
    id: "un-news-peace",
    label: "UN News — Peace and Security",
    url: "https://news.un.org/feed/subscribe/en/news/topic/peace-and-security/feed/rss.xml",
    topics: "security council, peace, conflict",
  },
  {
    id: "un-news-human-rights",
    label: "UN News — Human Rights",
    url: "https://news.un.org/feed/subscribe/en/news/topic/human-rights/feed/rss.xml",
    topics: "human rights, civil liberties",
  },
  {
    id: "un-news-climate",
    label: "UN News — Climate Change",
    url: "https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml",
    topics: "climate, environment",
  },
  {
    id: "un-news-health",
    label: "UN News — Health",
    url: "https://news.un.org/feed/subscribe/en/news/topic/health/feed/rss.xml",
    topics: "health, who, pandemic",
  },
  {
    id: "un-news-econ",
    label: "UN News — Economic Development",
    url: "https://news.un.org/feed/subscribe/en/news/topic/economic-development/feed/rss.xml",
    topics: "development, trade, economy",
  },
  {
    id: "un-news-global",
    label: "UN News — Global",
    url: "https://news.un.org/feed/subscribe/en/news/region/global/feed/rss.xml",
    topics: "united nations, world news",
  },
  {
    id: "un-meetings",
    label: "UN Meetings Coverage & Press Releases",
    url: "https://press.un.org/en/rss.xml",
    topics: "security council, general assembly, meetings",
  },
  {
    id: "ohchr",
    label: "UN Human Rights (OHCHR)",
    url: "https://www.ohchr.org/en/rss.xml",
    topics: "human rights, treaties, special procedures",
  },
  {
    id: "un-geneva",
    label: "UN Geneva — Press Items",
    url: "https://www.ungeneva.org/en/news-media/press-items-list/rss.xml",
    topics: "geneva, press conferences, briefings",
  },
  {
    id: "ga-press",
    label: "UN General Assembly — Press Releases",
    url: "https://www.un.org/press/en/feed",
    topics: "general assembly, resolutions, votes",
  },
  {
    id: "ga-docs",
    label: "UN General Assembly — Documents (undocs)",
    url: "http://undocs.org/rss/gadocs.xml",
    topics: "general assembly, documents, resolutions",
  },
];
