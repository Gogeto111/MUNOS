"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Users } from "lucide-react";
import { difficultyLabel } from "@/lib/conference";

export interface CommitteeView {
  name: string;
  topic: string | null;
  description: string | null;
  difficulty: "FIRST_TIMER" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  maxDelegates: number | null;
  countryMatrix: { country: string; seats: number }[];
}

export function CommitteeTabs({ committees }: { committees: CommitteeView[] }) {
  if (committees.length === 0) return null;

  return (
    <Tabs defaultValue={committees[0].name} className="w-full">
      <ScrollArea className="w-full rounded-xl border border-border/60">
        <TabsList className="h-auto w-full justify-start rounded-none border-b border-border/60 bg-transparent p-0">
          {committees.map((committee) => (
            <TabsTrigger
              key={committee.name}
              value={committee.name}
              className="h-11 rounded-none px-5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground data-[state=active]:[box-shadow:inset_0_-2px_0_0_var(--brand-500)]"
            >
              {committee.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </ScrollArea>

      {committees.map((committee) => (
        <TabsContent key={committee.name} value={committee.name} className="mt-5">
          <div className="grid gap-6 lg:grid-cols-[2fr_1.2fr]">
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{committee.name}</h3>
                  <Badge variant="outline" className="rounded-full">
                    {difficultyLabel(committee.difficulty)}
                  </Badge>
                  {committee.maxDelegates ? (
                    <Badge variant="secondary" className="rounded-full">
                      <Users className="mr-1 size-3" />
                      {committee.maxDelegates} delegates
                    </Badge>
                  ) : null}
                </div>
                {committee.topic ? (
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    Topic: {committee.topic}
                  </p>
                ) : null}
              </div>
              {committee.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {committee.description}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 text-sm font-semibold">
                <Globe className="size-4 text-brand-500" />
                Country matrix
              </div>
              {committee.countryMatrix.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Country</TableHead>
                      <TableHead className="pr-4 text-right">Seats</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {committee.countryMatrix.map((entry) => (
                      <TableRow key={entry.country}>
                        <TableCell className="pl-4 font-medium">{entry.country}</TableCell>
                        <TableCell className="pr-4 text-right text-muted-foreground">
                          {entry.seats}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Country assignments open at the conference.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
