export type ResourceType = "PDF" | "Link" | "Tool";
export type ResourceCategory = "UN Documents" | "Guides" | "Templates" | "Tools";

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: ResourceCategory;
  url: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  "UN Documents",
  "Guides",
  "Templates",
  "Tools",
];

export const RESOURCES: Resource[] = [
  // UN Documents
  {
    id: "un-charter",
    title: "Charter of the United Nations",
    description:
      "The foundational treaty of the UN, signed in 1945. Establishes the six principal organs, purposes, and principles of the organization.",
    type: "Link",
    category: "UN Documents",
    url: "https://www.un.org/en/about-us/un-charter",
  },
  {
    id: "udhr",
    title: "Universal Declaration of Human Rights",
    description:
      "Adopted by UNGA Resolution 217A (1948). The first global expression of rights to which all human beings are entitled.",
    type: "Link",
    category: "UN Documents",
    url: "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
  },
  {
    id: "rome-statute",
    title: "Rome Statute of the International Criminal Court",
    description:
      "Established the ICC and defined genocide, crimes against humanity, war crimes, and the crime of aggression.",
    type: "Link",
    category: "UN Documents",
    url: "https://www.icc-cpi.int/resource-library/documents/icc-statute-english.pdf",
  },
  {
    id: "vienna-convention",
    title: "Vienna Convention on Diplomatic Relations (1961)",
    description:
      "The international treaty establishing the framework for diplomatic relations between independent countries.",
    type: "Link",
    category: "UN Documents",
    url: "https://legal.un.org/ilc/documentation/english/a_5809.pdf",
  },
  {
    id: "paris-agreement",
    title: "Paris Agreement on Climate Change",
    description:
      "Adopted at COP21 (2015). Aims to limit global warming to well below 2°C above pre-industrial levels.",
    type: "Link",
    category: "UN Documents",
    url: "https://unfccc.int/files/essential_background/convention/application/pdf/english_paris_agreement.pdf",
  },
  {
    id: "npt",
    title: "Treaty on the Non-Proliferation of Nuclear Weapons",
    description:
      "Signed in 1968. Aims to prevent the spread of nuclear weapons, promote disarmament, and facilitate peaceful use of nuclear energy.",
    type: "Link",
    category: "UN Documents",
    url: "https://www.un.org/disarmament/wmd/nuclear/npt/",
  },
  {
    id: "jeddah-manifesto",
    title: "Jeddah+10 Political Declaration on AMR",
    description:
      "The latest political declaration on antimicrobial resistance, building on the 2015 UN High-Level Meeting commitments.",
    type: "Link",
    category: "UN Documents",
    url: "https://www.un.org/sg/en/content/ajss/antimicrobial-resistance",
  },
  {
    id: "sdg-report",
    title: "UN Sustainable Development Goals Report",
    description:
      "Annual report tracking progress on the 17 SDGs adopted in 2015. Essential for committees discussing development topics.",
    type: "Link",
    category: "UN Documents",
    url: "https://unstats.un.org/sdgs/report/2024/",
  },

  // Guides
  {
    id: "un4mun-guide",
    title: "UNA-USA UNA-Model UN Guide",
    description:
      "Comprehensive guide covering MUN basics, committee procedures, and tips for first-time delegates.",
    type: "PDF",
    category: "Guides",
    url: "https://www.unausa.org/wp-content/uploads/2023/08/UNA-USA-MUN-Guide.pdf",
  },
  {
    id: "position-paper-guide",
    title: "How to Write a Position Paper",
    description:
      "Step-by-step guide to crafting an effective position paper, including format, content, and common mistakes.",
    type: "Link",
    category: "Guides",
    url: "https://www.bestdelegate.com/model-un-made-easy-how-to-write-a-position-paper/",
  },
  {
    id: "resolution-writing",
    title: "Resolution Writing Guide",
    description:
      "Detailed instructions on drafting UN-style resolutions with proper preamble and operative clauses.",
    type: "Link",
    category: "Guides",
    url: "https://www.bestdelegate.com/model-un-made-easy-how-to-write-a-resolution/",
  },
  {
    id: "speech-guide",
    title: "Public Speaking for MUN Delegates",
    description:
      "Tips on speech delivery, body language, voice modulation, and handling nervousness in committee.",
    type: "Link",
    category: "Guides",
    url: "https://www.bestdelegate.com/7-tips-for-mun-public-speaking/",
  },
  {
    id: "bloc-building",
    title: "Building Blocs and Coalitions",
    description:
      "Strategies for identifying allies, forming effective blocs, and negotiating common ground in committee.",
    type: "Link",
    category: "Guides",
    url: "https://mununiversity.com/bloc-building-guide/",
  },

  // Templates
  {
    id: "position-paper-template",
    title: "Position Paper Template",
    description:
      "A fill-in-the-blank template for writing position papers on any topic, for any committee.",
    type: "PDF",
    category: "Templates",
    url: "https://www.unausa.org/wp-content/uploads/2023/08/Position-Paper-Template.pdf",
  },
  {
    id: "resolution-template",
    title: "Resolution Template (THIMUN Format)",
    description:
      "Standard resolution template following the THIMUN formatting guidelines with sample clauses.",
    type: "PDF",
    category: "Templates",
    url: "https://www.thimun.org/resolution-format",
  },
  {
    id: "research-template",
    title: "Country Research Template",
    description:
      "Structured template for organizing country research, including history, economy, foreign policy, and alliances.",
    type: "PDF",
    category: "Templates",
    url: "https://www.bestdelegate.com/model-un-made-easy-how-to-research-for-mun/",
  },
  {
    id: "speech-outline-template",
    title: "Speech Outline Template",
    description:
      "A reusable outline for structuring MUN speeches with sections for opening, position, evidence, and call to action.",
    type: "PDF",
    category: "Templates",
    url: "https://www.bestdelegate.com/7-tips-for-mun-public-speaking/",
  },

  // Tools
  {
    id: "un-digital-library",
    title: "UN Digital Library",
    description:
      "Searchable database of UN documents, resolutions, meeting records, and votes. Essential for research.",
    type: "Tool",
    category: "Tools",
    url: "https://digitallibrary.un.org/",
  },
  {
    id: "un-voting-data",
    title: "UN General Assembly Voting Data",
    description:
      "Comprehensive dataset of every UNGA vote since 1946. Great for understanding country voting patterns.",
    type: "Tool",
    category: "Tools",
    url: "https://unbisnet.un.org/",
  },
  {
    id: "cia-world-factbook",
    title: "CIA World Factbook",
    description:
      "Detailed country profiles with geography, population, economy, military, and energy statistics.",
    type: "Tool",
    category: "Tools",
    url: "https://www.cia.gov/the-world-factbook/",
  },
  {
    id: "world-bank-data",
    title: "World Bank Open Data",
    description:
      "Free access to global development data including GDP, poverty rates, health indicators, and climate data.",
    type: "Tool",
    category: "Tools",
    url: "https://data.worldbank.org/",
  },
  {
    id: "who-data",
    title: "WHO Global Health Observatory",
    description:
      "World Health Organization data on global health topics including disease, health systems, and environmental health.",
    type: "Tool",
    category: "Tools",
    url: "https://www.who.int/data/gho",
  },
  {
    id: "reliefweb",
    title: "ReliefWeb",
    description:
      "UN Office for the Coordination of Humanitarian Affairs platform with real-time crisis updates and reports.",
    type: "Tool",
    category: "Tools",
    url: "https://reliefweb.int/",
  },
];
