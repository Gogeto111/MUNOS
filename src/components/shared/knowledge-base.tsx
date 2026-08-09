"use client";

import { useState } from "react";
import {
  BookOpen, ChevronDown, Search, Globe, FileText, Scale,
  Users, MessageSquare, Vote, Gavel, BookMarked, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = "procedure" | "committees" | "documents" | "strategy" | "terminology";

interface KbArticle {
  id: string;
  title: string;
  category: Category;
  content: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Knowledge Base Content
// ---------------------------------------------------------------------------

const ARTICLES: KbArticle[] = [
  // Procedure
  { id: "gsl", title: "General Speakers List (GSL)", category: "procedure", tags: ["speech", "opening", "procedure"],
    content: "The General Speakers List is the primary speaking list in a MUN committee. Delegates deliver opening speeches (typically 60-90 seconds) to outline their country's position. The chair calls delegates in order. You can add yourself to the GSL by raising your placard or signaling digitally.\n\nTips:\n• Start with a strong hook (quote, statistic, question)\n• State your country's position clearly\n• Reference the agenda directly\n• End with a call to action\n• Stay within time limits" },
  { id: "mod-caucus", title: "Moderated Caucus", category: "procedure", tags: ["speech", "debate", "procedure"],
    content: "A moderated caucus is a structured debate on a specific sub-topic. Any delegate can propose one by raising a motion. The chair then calls on delegates to speak briefly (usually 30-60 seconds).\n\nMotion format: 'Motion for a moderated caucus of [total time] with speaking time of [time] on the topic of [sub-topic].'\n\nTo pass: Simple majority vote.\n\nTips:\n• Propose topics your bloc has prepared for\n• Keep speeches focused and punchy\n• Use POIs strategically" },
  { id: "unmod-caucus", title: "Unmoderated Caucus", category: "procedure", tags: ["negotiation", "bloc", "procedure"],
    content: "An unmoderated caucus is informal negotiation time. Delegates leave their seats to discuss, negotiate, form blocs, draft resolutions, and build alliances.\n\nMotion format: 'Motion for an unmoderated caucus of [time].'\n\nTo pass: Simple majority vote.\n\nTips:\n• Approach key delegates immediately\n• Have talking points ready\n• Identify potential allies before unmod\n• Bring resolution language to negotiate\n• Don't waste time on unpersuadable delegates" },
  { id: "poi", title: "Points of Information (POI)", category: "procedure", tags: ["debate", "question", "procedure"],
    content: "POIs are brief questions or comments directed at a speaking delegate. They last 10-15 seconds and can be accepted or declined by the speaker.\n\nRaising a POI: Stand and raise your placard while the speaker is talking. The speaker decides whether to accept.\n\nTypes:\n• Diplomatic: Polite challenge\n• Aggressive: Direct confrontation\n• Trap: Corner with their own words\n• Evidence-based: Counter with data\n• Follow-up: Build on their response\n\nTips:\n• Prepare POIs while others speak\n• Make them relevant and pointed\n• A good POI can shift the debate" },
  { id: "motions", title: "Motions & Voting", category: "procedure", tags: ["procedure", "voting", "parliamentary"],
    content: "Motions are formal proposals to take action. Any delegate can raise one. The chair puts it to a vote.\n\nCommon motions:\n• Motion to set the speaking time\n• Motion for a moderated/unmoderated caucus\n• Motion to close the speakers list\n• Motion to vote on a resolution\n• Motion to introduce a working paper\n\nVoting:\n• Simple majority for procedural motions\n• Two-thirds majority for closing debate\n• Simple majority for resolution adoption\n\nTypes of votes:\n• Roll call vote (delegate-by-delegate)\n• Show of hands\n• Standing vote" },
  { id: "resolution", title: "Resolution Writing", category: "procedure", tags: ["document", "writing", "solution"],
    content: "A resolution is the formal document produced by a committee. It contains solutions to the agenda topic.\n\nStructure:\n1. Committee name\n2. Sponsor(s)\n3. Preambulatory clauses (background, context)\n4. Operative clauses (action items)\n\nPreambulatory phrases:\n'Recognizing', 'Affirming', 'Deeply concerned', 'Reaffirming', 'Aware of'\n\nOperative phrases:\n'Urges', 'Recommends', 'Calls upon', 'Requests', 'Establishes', 'Endorses'\n\nTips:\n• Each operative clause should be one actionable item\n• Include implementation mechanisms\n• Reference existing UN frameworks\n• Be specific about who does what" },
  { id: "points", title: "Points & Procedures", category: "procedure", tags: ["procedure", "rules"],
    content: "Types of Points:\n• Point of Order: Procedural violation by another delegate\n• Point of Personal Privilege: You can't hear, feel threatened, etc.\n• Point of Inquiry: Question about procedure\n• Point of Parliamentary Inquiry: Question about rules\n\nThese are raised at any time and take priority over debate." },

  // Committees
  { id: "unga", title: "United Nations General Assembly (UNGA)", category: "committees", tags: ["committee", "un", "general"],
    content: "The UNGA is the main deliberative body of the UN. All 193 member states have equal representation.\n\nKey features:\n• Every country has one vote\n• Resolutions are non-binding (recommendations)\n• Covers all international issues\n• Six main committees:\n  - First Committee: Disarmament\n  - Second Committee: Economic & Financial\n  - Third Committee: Social, Humanitarian, Cultural\n  - Fourth Committee: Special Political & Decolonization\n  - Fifth Committee: Administrative & Budgetary\n  - Sixth Committee: Legal\n\nCommon topics: Climate change, sustainable development, human rights, disarmament, global health." },
  { id: "unsc", title: "United Nations Security Council (UNSC)", category: "committees", tags: ["committee", "un", "security"],
    content: "The UNSC is responsible for international peace and security. It has 15 members:\n• 5 permanent (P5): US, UK, France, Russia, China — with veto power\n• 10 non-permanent: elected for 2-year terms\n\nKey features:\n• Only body that can authorize military action\n• Binding resolutions\n• Veto power of P5 members\n• Smaller committee = more debate per delegate\n\nCommon topics: Regional conflicts, terrorism, peacekeeping, non-proliferation, sanctions." },
  { id: "who", title: "World Health Organization (WHO)", category: "committees", tags: ["committee", "health", "un"],
    content: "The WHO focuses on international public health.\n\nKey features:\n• 194 member states\n• Addresses global health emergencies\n• Sets health standards and guidelines\n• Coordinates pandemic response\n\nCommon topics: Pandemic preparedness, vaccine equity, mental health, antimicrobial resistance, health systems strengthening, non-communicable diseases." },
  { id: "disec", title: "Disarmament & International Security Committee (DISEC)", category: "committees", tags: ["committee", "security", "disarmament"],
    content: "DISEC (First Committee of UNGA) deals with disarmament and international security.\n\nCommon topics: Nuclear non-proliferation, chemical weapons, autonomous weapons, cyber warfare, space militarization, arms trade, landmines, small arms." },
  { id: "sochum", title: "Social, Humanitarian & Cultural Committee (SOCHUM)", category: "committees", tags: ["committee", "human rights", "social"],
    content: "SOCHUM (Third Committee of UNGA) addresses human rights, humanitarian affairs, and social development.\n\nCommon topics: Refugee crises, freedom of expression, indigenous rights, gender equality, racial discrimination, torture prevention, disability rights." },
  { id: "ecosoc", title: "Economic & Social Council (ECOSOC)", category: "committees", tags: ["committee", "economic", "social"],
    content: "ECOSOC coordinates the economic and social work of the UN.\n\nKey features:\n• 54 member states\n• Coordinates 15 specialized agencies\n• Oversees sustainable development goals\n\nCommon topics: Poverty eradication, sustainable development, international trade, financial inclusion, technology transfer." },

  // Documents
  { id: "udhr", title: "Universal Declaration of Human Rights (UDHR)", category: "documents", tags: ["document", "human rights", "foundation"],
    content: "Adopted in 1948, the UDHR is the foundational human rights document.\n\nKey articles:\n• Article 1: All humans are born free and equal\n• Article 2: Non-discrimination\n• Article 3: Right to life, liberty, security\n• Article 5: No torture\n• Article 9: No arbitrary detention\n• Article 18: Freedom of thought\n• Article 19: Freedom of expression\n• Article 26: Right to education\n\nUse this to ground human rights arguments in international law." },
  { id: "uncharter", title: "UN Charter", category: "documents", tags: ["document", "foundation", "charter"],
    content: "The UN Charter (1945) is the founding treaty of the United Nations.\n\nKey provisions:\n• Article 1: Purposes (peace, development, human rights)\n• Article 2: Principles (sovereign equality, non-intervention)\n• Chapter VII: Action with respect to threats to peace\n• Chapter VIII: Regional arrangements\n\nAlways reference the Charter when discussing UN authority or mandate." },
  { id: "paris-agreement", title: "Paris Agreement", category: "documents", tags: ["document", "climate", "environment"],
    content: "The Paris Agreement (2015) is the international treaty on climate change.\n\nKey points:\n• Limit warming to 1.5-2°C above pre-industrial levels\n• Nationally Determined Contributions (NDCs)\n• Climate finance ($100B/year target)\n• Transparency framework\n• Global Stocktake every 5 years\n\nEssential for any climate-related committee topic." },

  // Strategy
  { id: "bloc-building", title: "Bloc Building Strategy", category: "strategy", tags: ["strategy", "alliance", "negotiation"],
    content: "Building a successful bloc is critical in MUN.\n\nSteps:\n1. Identify countries with similar positions\n2. Approach them during unmoderated caucus\n3. Propose a common agenda\n4. Draft resolution clauses together\n5. Assign speaking roles\n6. Present a unified front\n\nTips:\n• Start small (3-5 countries) then expand\n• Find countries with different strengths (research, speech, draft)\n• Compromise on minor issues, hold firm on core\n• A bloc of 5 well-coordinated countries beats 15 disorganized ones" },
  { id: "country-research", title: "Country Research Guide", category: "strategy", tags: ["research", "preparation", "strategy"],
    content: "How to research your assigned country:\n\n1. Foreign Policy\n   - Official foreign ministry website\n   - UN voting records\n   - Recent speeches at UNGA\n\n2. Position on Agenda\n   - Official government statements\n   - Related treaties ratified\n   - Recent policy changes\n\n3. Alliances\n   - Regional organizations (AU, EU, ASEAN)\n   - Voting blocs at UN\n   - Bilateral relationships\n\n4. Key Facts\n   - GDP, population, HDI\n   - Key industries\n   - Recent events\n\n5. Vulnerabilities\n   - Human rights record\n   - Economic challenges\n   - Environmental issues" },
  { id: "speech-tips", title: "Speech Writing Tips", category: "strategy", tags: ["speech", "delivery", "preparation"],
    content: "Writing an effective MUN speech:\n\nStructure:\n1. Hook (5-10 seconds)\n   - Quote, statistic, question, or anecdote\n2. Country position (15-20 seconds)\n   - What does your country think?\n3. Argument (20-30 seconds)\n   - Why is this important?\n   - What evidence supports it?\n4. Solution (15-20 seconds)\n   - What should the committee do?\n5. Closing (5-10 seconds)\n   - Call to action or memorable line\n\nDelivery tips:\n• Speak slowly and clearly\n• Make eye contact\n• Use gestures\n• Vary your tone\n• Practice beforehand" },

  // Terminology
  { id: "key-terms", title: "Essential MUN Terminology", category: "terminology", tags: ["vocabulary", "basics"],
    content: "Key terms every delegate should know:\n\n• Placard: Country nameplate raised to indicate desire to speak\n• Caucus: Discussion period (moderated or unmoderated)\n• Bloc: Alliance of countries with similar positions\n• Working Paper: Draft resolution not yet formalized\n• Resolution: Formal document with proposed solutions\n• Preambulatory Clause: Background/context clause in resolution\n• Operative Clause: Action item in resolution\n• Sponsor: Country that co-authors a resolution\n• Signatory: Country that supports a working paper\n• Quorum: Minimum countries needed to conduct business\n• Recess: Temporary suspension of committee session\n• Adjournment: End of committee session" },
];

const CATEGORIES: { key: Category; label: string; icon: React.ReactNode }[] = [
  { key: "procedure", label: "Procedure", icon: <Gavel className="h-3.5 w-3.5" /> },
  { key: "committees", label: "Committees", icon: <Globe className="h-3.5 w-3.5" /> },
  { key: "documents", label: "Documents", icon: <FileText className="h-3.5 w-3.5" /> },
  { key: "strategy", label: "Strategy", icon: <Scale className="h-3.5 w-3.5" /> },
  { key: "terminology", label: "Terminology", icon: <BookMarked className="h-3.5 w-3.5" /> },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KnowledgeBase() {
  const [category, setCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const filtered = ARTICLES.filter((a) => {
    if (category !== "all" && a.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q)) ||
        a.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          MUN Knowledge Base
          <Badge variant="outline" className="ml-auto text-[10px]">{filtered.length} articles</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors",
              category === "all"
                ? "border-brand-500 bg-brand-500/10 text-brand-600"
                : "border-border/40 text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-medium transition-colors",
                category === c.key
                  ? "border-brand-500 bg-brand-500/10 text-brand-600"
                  : "border-border/40 text-muted-foreground hover:bg-muted"
              )}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Articles */}
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-1.5">
            {filtered.map((article) => (
              <div key={article.id}>
                <button
                  onClick={() => setOpenArticle(openArticle === article.id ? null : article.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-border/30 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{article.title}</span>
                    <Badge variant="outline" className="text-[8px]">
                      {CATEGORIES.find((c) => c.key === article.category)?.label}
                    </Badge>
                  </div>
                  <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", openArticle === article.id && "rotate-180")} />
                </button>
                {openArticle === article.id && (
                  <div className="mt-1 rounded-lg border border-border/20 bg-muted/20 p-3">
                    <div className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                      {article.content}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[8px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">No articles found.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
