"use client";

import { useState, useMemo } from "react";
import { Grid3x3, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCountryFlag } from "@/lib/country-flags";
import type { Bloc, CountryAssignment } from "@/lib/bloc-types";
import { setCountryAssignment } from "@/lib/bloc-store";

const COMMITTEE_COUNTRIES = [
  "United States", "United Kingdom", "France", "China", "Russia",
  "Germany", "Japan", "India", "Brazil", "South Africa",
  "Canada", "Australia", "Mexico", "Argentina", "Nigeria",
  "Egypt", "Turkey", "Saudi Arabia", "South Korea", "Indonesia",
  "Italy", "Spain", "Poland", "Ukraine", "Iran",
  "Israel", "Pakistan", "Bangladesh", "Philippines", "Vietnam",
  "Thailand", "Kenya", "Ethiopia", "Colombia", "Peru",
  "Chile", "Morocco", "Tunisia", "Jordan", "Lebanon",
];

interface CountryAssignmentViewProps {
  blocs: Bloc[];
  assignments: CountryAssignment[];
  onAssign?: (country: string, blocId: string | null) => void;
}

export function CountryAssignmentView({
  blocs,
  assignments,
  onAssign,
}: CountryAssignmentViewProps) {
  const [search, setSearch] = useState("");
  const [selectedBloc, setSelectedBloc] = useState<string | null>(null);

  const assignmentMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const a of assignments) {
      map[a.country] = a.blocId;
    }
    return map;
  }, [assignments]);

  const filtered = COMMITTEE_COUNTRIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = (country: string) => {
    if (!selectedBloc) return;
    const currentBloc = assignmentMap[country];
    const newBlocId = currentBloc === selectedBloc ? null : selectedBloc;
    setCountryAssignment(country, newBlocId);
    onAssign?.(country, newBlocId);
  };

  const getBlocName = (blocId: string | null) => {
    if (!blocId) return "Unassigned";
    return blocs.find((b) => b.id === blocId)?.name ?? "Unknown";
  };

  const getBlocColor = (blocId: string | null) => {
    if (!blocId) return undefined;
    return blocs.find((b) => b.id === blocId)?.color;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {blocs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">
            Click a bloc, then a country to assign:
          </span>
          {blocs.map((bloc) => (
            <button
              key={bloc.id}
              onClick={() =>
                setSelectedBloc(
                  selectedBloc === bloc.id ? null : bloc.id
                )
              }
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                selectedBloc === bloc.id
                  ? "ring-2 ring-primary"
                  : "opacity-70 hover:opacity-100"
              )}
              style={{
                backgroundColor: `${bloc.color}20`,
                borderColor: `${bloc.color}40`,
              }}
            >
              {bloc.emoji} {bloc.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((country) => {
          const blocId = assignmentMap[country];
          const color = getBlocColor(blocId);
          const flag = getCountryFlag(country);
          return (
            <button
              key={country}
              onClick={() => handleAssign(country)}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition-all",
                !blocId && "border-dashed border-muted-foreground/30",
                selectedBloc && "cursor-pointer hover:ring-2 hover:ring-primary/40",
                blocId && "border-solid"
              )}
              style={
                color
                  ? { backgroundColor: `${color}10`, borderColor: `${color}30` }
                  : undefined
              }
            >
              <span className="text-base">{flag}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{country}</p>
                {blocId && (
                  <p
                    className="mt-0.5 truncate text-[10px] font-medium"
                    style={{ color }}
                  >
                    {getBlocName(blocId)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <Grid3x3 className="h-8 w-8" />
          <p className="text-sm">No countries match your search.</p>
        </div>
      )}
    </div>
  );
}
