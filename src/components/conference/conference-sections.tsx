import { FileText, Clock, Trophy, ScrollText, Download } from "lucide-react";
import { format as formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatBytes, formatDateTime } from "@/lib/format";

export function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export function AboutSection({
  description,
  theme,
}: {
  description: string;
  theme: string | null;
}) {
  return (
    <section>
      <SectionHeading icon={ScrollText} title="About this conference" />
      <div className="space-y-4">
        {theme ? (
          <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-brand-600/5 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Theme
            </div>
            <p className="mt-1 font-medium italic">{theme}</p>
          </div>
        ) : null}
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </section>
  );
}

export function AgendaSection({
  agenda,
}: {
  agenda: { id: string; title: string; description: string | null; startAt: Date; endAt: Date | null }[];
}) {
  if (agenda.length === 0) return null;
  return (
    <section>
      <SectionHeading icon={Clock} title="Agenda" subtitle="A preview of the conference programme" />
      <ol className="relative space-y-6 border-l border-border/70 pl-6">
        {agenda.map((item) => (
          <li key={item.id} className="relative">
            <span className="absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-brand-500 bg-background" />
            <div className="text-xs font-medium text-brand-600 dark:text-brand-400">
              {formatDateTime(item.startAt)}
              {item.endAt ? ` – ${formatDate(item.endAt, "MMM d · h:mm a")}` : ""}
            </div>
            <h3 className="mt-0.5 font-semibold">{item.title}</h3>
            {item.description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function BrochuresSection({
  brochures,
}: {
  brochures: { id: string; title: string | null; fileName: string; sizeBytes: number; mimeType: string; fileUrl: string }[];
}) {
  if (brochures.length === 0) return null;
  return (
    <section>
      <SectionHeading icon={FileText} title="Brochures" subtitle="Downloadable conference information" />
      <div className="grid gap-3 sm:grid-cols-2">
        {brochures.map((brochure) => (
          <Card key={brochure.id} className="shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-500">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {brochure.title ?? brochure.fileName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {brochure.fileName} · {formatBytes(brochure.sizeBytes)}
                  </div>
                </div>
              </div>
              <Button asChild variant="outline" size="icon" className="shrink-0" aria-label="Download brochure">
                <a href={brochure.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="size-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function AwardsSection({
  awards,
}: {
  awards: { id: string; name: string; description: string | null }[];
}) {
  if (awards.length === 0) return null;
  return (
    <section>
      <SectionHeading icon={Trophy} title="Awards" subtitle="Recognitions delegates can earn" />
      <div className="grid gap-3 sm:grid-cols-2">
        {awards.map((award) => (
          <div
            key={award.id}
            className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-4"
          >
            <Trophy className="mt-0.5 size-5 shrink-0 text-amber-500" />
            <div>
              <div className="font-semibold">{award.name}</div>
              {award.description ? (
                <p className="mt-0.5 text-sm text-muted-foreground">{award.description}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FaqSection({
  faqs,
}: {
  faqs: { id: string; question: string; answer: string }[];
}) {
  if (faqs.length === 0) return null;
  return (
    <section>
      <SectionHeading icon={ScrollText} title="Frequently asked questions" />
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function SocialChips({
  links,
}: {
  links: { id: string; platform: string; url: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Badge key={link.id} variant="outline" className="gap-1.5 rounded-full">
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {link.platform}
          </a>
        </Badge>
      ))}
    </div>
  );
}
