"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Mic,
  Scale,
  FileText,
  Users,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Tip {
  id: string;
  title: string;
  description: string;
  proTip: string;
  category: TipCategory;
}

type TipCategory = "Research" | "Speech Writing" | "Debate" | "Position Papers" | "Committee Etiquette";

const TIP_CATEGORIES: TipCategory[] = [
  "Research",
  "Speech Writing",
  "Debate",
  "Position Papers",
  "Committee Etiquette",
];

const CATEGORY_ICONS: Record<TipCategory, typeof BookOpen> = {
  Research: BookOpen,
  "Speech Writing": Mic,
  Debate: Scale,
  "Position Papers": FileText,
  "Committee Etiquette": Users,
};

const CATEGORY_COLORS: Record<TipCategory, string> = {
  Research: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "Speech Writing": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  Debate: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "Position Papers": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "Committee Etiquette": "bg-pink-500/10 text-pink-700 dark:text-pink-400",
};

const ALL_TIPS: Tip[] = [
  // Research
  {
    id: "r1",
    title: "Start with your country's UN voting record",
    description:
      "Check how your country voted on past resolutions related to the topic. This reveals true policy alignment, not just stated positions.",
    proTip:
      "Use the UN Digital Library (digitallibrary.un.org) to search voting records by country and committee.",
    category: "Research",
  },
  {
    id: "r2",
    title: "Read at least 3 UN documents on the topic",
    description:
      "Start with the most recent Secretary-General's report on the topic. Then find relevant General Assembly and Security Council resolutions.",
    proTip:
      "The document symbol format (e.g., A/RES/76/307) tells you the committee, session, and resolution number.",
    category: "Research",
  },
  {
    id: "r3",
    title: "Research alliances and regional blocs",
    description:
      "Identify which countries typically vote together. ASEAN, AU, EU, G77, and NAM are key blocs that shape committee outcomes.",
    proTip:
      "Countries in the same regional group often share similar positions. Knowing these blocs helps you build coalitions.",
    category: "Research",
  },
  {
    id: "r4",
    title: "Understand the historical context",
    description:
      "Research key events, treaties, and conflicts related to the topic. History shapes current policy positions.",
    proTip:
      "Create a timeline of major events. Referencing specific dates and treaties in your speeches adds credibility.",
    category: "Research",
  },
  {
    id: "r5",
    title: "Know your country's economic interests",
    description:
      "Trade relationships, resource dependencies, and economic alliances heavily influence foreign policy positions.",
    proTip:
      "Check CIA World Factbook for your country's key trade partners and economic data.",
    category: "Research",
  },

  // Speech Writing
  {
    id: "s1",
    title: "Open with a striking statistic or quote",
    description:
      "Delegates hear dozens of speeches. A compelling opening captures attention and makes your speech memorable.",
    proTip:
      "Practice the 10-second rule: if your opening doesn't hook the audience in 10 seconds, rewrite it.",
    category: "Speech Writing",
  },
  {
    id: "s2",
    title: "Use the three-part structure",
    description:
      "State your country's position, present evidence, propose a solution. This framework is clear, concise, and persuasive.",
    proTip:
      "Time yourself: 30 seconds for position, 60 seconds for evidence, 30 seconds for proposal. Adjust as needed.",
    category: "Speech Writing",
  },
  {
    id: "s3",
    title: "Reference specific UN resolutions",
    description:
      "Citing real resolutions (e.g., 'UNGA Resolution 71/307') shows deep research and adds legal weight to your arguments.",
    proTip:
      "Keep a cheat sheet of 5-10 relevant resolution symbols and their key operative clauses during committee.",
    category: "Speech Writing",
  },
  {
    id: "s4",
    title: "Write for the ear, not the eye",
    description:
      "MUN speeches are spoken, not read. Use short sentences, active voice, and conversational language.",
    proTip:
      "Read your speech aloud. If you stumble, rewrite that sentence. If you run out of breath, it's too long.",
    category: "Speech Writing",
  },
  {
    id: "s5",
    title: "End with a clear call to action",
    description:
      "Tell the committee exactly what you want them to do. Vague endings weaken otherwise strong speeches.",
    proTip:
      "Use the formula: 'We call upon [specific body] to [specific action] in order to [specific outcome].'",
    category: "Speech Writing",
  },

  // Debate
  {
    id: "d1",
    title: "Always address the chair formally",
    description:
      "Begin every speech with 'Honorable Chair, distinguished delegates...' This demonstrates committee etiquette and professionalism.",
    proTip:
      "Address specific delegates by their country name: 'The delegate of France makes an excellent point, but...'",
    category: "Debate",
  },
  {
    id: "d2",
    title: "Build on others' speeches",
    description:
      "Reference what previous speakers said. This shows active listening and creates a dialogue, not a monologue.",
    proTip:
      "'I agree with the delegate of Japan on X, but would like to add...' This positions you as collaborative.",
    category: "Debate",
  },
  {
    id: "d3",
    title: "Use moderated caucus strategically",
    description:
      "Propose moderated caucuses on specific sub-topics to steer the debate. The delegate who controls the topic controls the committee.",
    proTip:
      "Propose a moderated caucus immediately after an unmod when you have a bloc ready. Momentum matters.",
    category: "Debate",
  },
  {
    id: "d4",
    title: "Prepare rebuttals in advance",
    description:
      "Anticipate counterarguments and prepare responses. Having ready-made rebuttals gives you a decisive edge in debate.",
    proTip:
      "Write down 3 common objections to your country's position and practice your responses out loud.",
    category: "Debate",
  },
  {
    id: "d5",
    title: "Master the art of the unmoderated caucus",
    description:
      "Use unmods to build blocs, negotiate operative clauses, and find common ground. This is where real diplomacy happens.",
    proTip:
      "Always have a draft resolution outline ready before an unmod. Delegates follow those with a plan.",
    category: "Debate",
  },
  {
    id: "d6",
    title: "Use Points of Order to maintain fairness",
    description:
      "If a delegate violates procedure (e.g., speaks off-topic, exceeds time), raise a Point of Order to protect the integrity of debate.",
    proTip:
      "Only raise Points of Order for genuine violations. Using them excessively makes you seem adversarial.",
    category: "Debate",
  },

  // Position Papers
  {
    id: "p1",
    title: "Follow the exact format required",
    description:
      "Most conferences require: header (country, committee, topic), policy overview, past UN action, country position, proposed solutions.",
    proTip:
      "Save your position paper as a template. You'll reuse the format at every conference with minor changes.",
    category: "Position Papers",
  },
  {
    id: "p2",
    title: "Be specific about your country's solutions",
    description:
      "Vague positions ('we support human rights') are weak. Propose concrete, actionable policy recommendations.",
    proTip:
      "Use the SMART framework: Specific, Measurable, Achievable, Relevant, Time-bound for each solution.",
    category: "Position Papers",
  },
  {
    id: "p3",
    title: "Cite real policies your country has enacted",
    description:
      "Reference actual laws, treaties, and initiatives your country has supported. This grounds your position in reality.",
    proTip:
      "Include at least 3 specific references: a domestic policy, an international treaty, and a UN vote.",
    category: "Position Papers",
  },
  {
    id: "p4",
    title: "Keep it to 1-2 pages maximum",
    description:
      "Chairs read hundreds of position papers. Concise, well-structured papers are more impactful than lengthy ones.",
    proTip:
      "Aim for 500-800 words. Use bullet points for proposed solutions to save space and improve readability.",
    category: "Position Papers",
  },

  // Committee Etiquette
  {
    id: "e1",
    title: "Dress code matters",
    description:
      "Western business attire (suit and tie, or business formal) is expected at most MUN conferences. It signals professionalism.",
    proTip:
      "Pack a spare tie and ensure your shoes are polished. Small details make a big impression on chairs.",
    category: "Committee Etiquette",
  },
  {
    id: "e2",
    title: "Network during breaks and social events",
    description:
      "The relationships you build outside committee are as important as your performance inside. Many alliances form over lunch.",
    proTip:
      "Set a goal: exchange contact information with 5 new delegates per day. Follow up after the conference.",
    category: "Committee Etiquette",
  },
  {
    id: "e3",
    title: "Respect the dais and fellow delegates",
    description:
      "Never interrupt the chair or speak without recognition. Treat all delegates with courtesy, even those you disagree with.",
    proTip:
      "If you disagree, say 'The delegate raises a valid point, however...' instead of 'The delegate is wrong.'",
    category: "Committee Etiquette",
  },
  {
    id: "e4",
    title: "Be prepared to compromise",
    description:
      "MUN rewards collaboration, not stubbornness. The best delegates find creative solutions that satisfy multiple blocs.",
    proTip:
      "Identify your country's 'must-haves' vs. 'nice-to-haves' before committee. Know where you can flex.",
    category: "Committee Etiquette",
  },
  {
    id: "e5",
    title: "Arrive early to every session",
    description:
      "Being early lets you claim a good seat, distribute working papers, and make initial connections before debate begins.",
    proTip:
      "Use the 15 minutes before session to review your notes and identify which delegates to approach first.",
    category: "Committee Etiquette",
  },
];

const STORAGE_KEY = "munos-tips-completed";

export default function TipsPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<TipCategory | "All">("All");
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompleted(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  const filteredTips = ALL_TIPS.filter(
    (t) => selectedCategory === "All" || t.category === selectedCategory
  );

  const totalTips = ALL_TIPS.length;
  const completedCount = completed.size;
  const progressPercent = totalTips > 0 ? Math.round((completedCount / totalTips) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          MUN Preparation Tips
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalTips} actionable tips across 5 categories to help you excel at
          your next MUN conference.
        </p>
      </div>

      {/* Progress tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="h-2 flex-1" />
            <span className="text-sm font-semibold tabular-nums">
              {completedCount}/{totalTips}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {progressPercent === 100
              ? "Congratulations! You've completed all tips. You're ready for your next conference."
              : `${progressPercent}% complete — ${totalTips - completedCount} tips remaining.`}
          </p>
        </CardContent>
      </Card>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("All")}
        >
          All ({ALL_TIPS.length})
        </Button>
        {TIP_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const count = ALL_TIPS.filter((t) => t.category === cat).length;
          const done = ALL_TIPS.filter(
            (t) => t.category === cat && completed.has(t.id)
          ).length;
          return (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="gap-1.5"
            >
              <Icon className="size-3.5" />
              {cat}
              <span className="text-muted-foreground">
                ({done}/{count})
              </span>
            </Button>
          );
        })}
      </div>

      {/* Tips list */}
      <div className="space-y-3">
        {filteredTips.map((tip) => {
          const isCompleted = completed.has(tip.id);
          const isExpanded = expandedTip === tip.id;
          const CatIcon = CATEGORY_ICONS[tip.category];

          return (
            <Card
              key={tip.id}
              className={cn(
                "transition-colors",
                isCompleted && "bg-emerald-500/5 border-emerald-500/20"
              )}
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(tip.id);
                    }}
                    className="mt-0.5 shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle
                        className={cn(
                          "text-base",
                          isCompleted && "line-through opacity-60"
                        )}
                      >
                        {tip.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] shrink-0",
                          CATEGORY_COLORS[tip.category]
                        )}
                      >
                        <CatIcon className="mr-1 size-3" />
                        {tip.category}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {tip.description}
                    </CardDescription>
                  </div>
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent>
                  <div className="ml-8 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                      Pro Tip
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tip.proTip}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
