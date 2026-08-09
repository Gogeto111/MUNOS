"use client";

import { useState } from "react";
import { Shield, Plus, Trash2, Users, Swords, Target, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMunContext, type CountryIntel, type AllianceInfo } from "@/lib/mun-context";

type Tab = "opposition" | "alliances" | "speeches";

const STATUS_COLORS: Record<string, string> = {
  ally: "border-green-500/30 bg-green-500/10 text-green-600",
  potential: "border-blue-500/30 bg-blue-500/10 text-blue-600",
  neutral: "border-border/60 bg-muted/50 text-muted-foreground",
  opposition: "border-red-500/30 bg-red-500/10 text-red-600",
};

function FieldEditor({
  country,
  field,
  label,
  icon,
}: {
  country: string;
  field: keyof CountryIntel;
  label: string;
  icon: string;
}) {
  const ctx = useMunContext();
  const [input, setInput] = useState("");
  const values = (ctx.countries[country]?.[field] as string[]) || [];

  const addToList = (value: string) => {
    if (!value.trim()) return;
    const current = ctx.countries[country];
    if (!current) return;
    const arr = current[field];
    if (Array.isArray(arr)) {
      ctx.updateCountry(country, { [field]: [...arr, value.trim()] });
    }
  };

  const removeFromList = (index: number) => {
    const current = ctx.countries[country];
    if (!current) return;
    const arr = current[field];
    if (Array.isArray(arr)) {
      ctx.updateCountry(country, { [field]: arr.filter((_: string, i: number) => i !== index) });
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        <span>{icon}</span> {label}
        <Badge variant="outline" className="ml-auto h-4 text-[8px]">{values.length}</Badge>
      </div>
      {values.length > 0 && (
        <div className="space-y-1">
          {values.map((v, i) => (
            <div key={i} className="group flex items-start gap-1.5 rounded bg-muted/30 px-2 py-1">
              <span className="flex-1 text-xs leading-relaxed">{v}</span>
              <button
                onClick={() => removeFromList(i)}
                className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-2.5 w-2.5 text-muted-foreground hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <Input
          placeholder={`Add ${label.toLowerCase()}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-7 text-[10px]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addToList(input);
              setInput("");
            }
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 shrink-0"
          onClick={() => { addToList(input); setInput(""); }}
          disabled={!input.trim()}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function CountryCard({
  alliance,
  country,
  expanded = false,
}: {
  alliance: AllianceInfo;
  country?: CountryIntel;
  expanded?: boolean;
}) {
  const ctx = useMunContext();
  const [open, setOpen] = useState(expanded);
  const totalItems =
    (country?.arguments?.length || 0) +
    (country?.contradictions?.length || 0) +
    (country?.vulnerabilities?.length || 0);

  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-2 transition-colors",
      STATUS_COLORS[alliance.status] || STATUS_COLORS.neutral
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{alliance.country}</span>
          <select
            value={alliance.status}
            onChange={(e) => {
              e.stopPropagation();
              ctx.updateAlliance(alliance.country, { status: e.target.value as AllianceInfo["status"] });
            }}
            className="rounded border border-border/40 bg-transparent px-1 py-0.5 text-[10px] font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="ally">Ally</option>
            <option value="potential">Potential</option>
            <option value="neutral">Neutral</option>
            <option value="opposition">Opposition</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {totalItems > 0 && (
            <Badge variant="outline" className="h-4 text-[8px]">{totalItems} items</Badge>
          )}
          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && country && (
        <div className="space-y-3 pt-2">
          <FieldEditor country={alliance.country} field="arguments" label="Arguments" icon="💬" />
          <FieldEditor country={alliance.country} field="contradictions" label="Contradictions" icon="⚠️" />
          <FieldEditor country={alliance.country} field="vulnerabilities" label="Vulnerabilities" icon="🎯" />
          <FieldEditor country={alliance.country} field="promises" label="Promises" icon="🤝" />
          <FieldEditor country={alliance.country} field="speeches" label="Speeches" icon="🎤" />
        </div>
      )}
    </div>
  );
}

export function LiveTracker() {
  const ctx = useMunContext();
  const [tab, setTab] = useState<Tab>("opposition");
  const [newCountry, setNewCountry] = useState("");

  const trackedCountries = Object.keys(ctx.countries);
  const allyCountries = ctx.alliances.filter((a) => a.status === "ally" || a.status === "potential");
  const oppositionCountries = ctx.alliances.filter((a) => a.status === "opposition");

  const addCountry = () => {
    if (!newCountry.trim()) return;
    ctx.updateCountry(newCountry.trim(), { name: newCountry.trim() });
    if (!ctx.alliances.find((a) => a.country === newCountry.trim())) {
      ctx.addAlliance({
        country: newCountry.trim(),
        status: "neutral",
        sharedInterests: [],
        notes: "",
      });
    }
    setNewCountry("");
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Live Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1.5">
          {[
            { key: "opposition" as Tab, label: "Opposition", icon: <Swords className="h-3 w-3" />, count: oppositionCountries.length },
            { key: "alliances" as Tab, label: "Alliances", icon: <Users className="h-3 w-3" />, count: allyCountries.length },
            { key: "speeches" as Tab, label: "By Country", icon: <Target className="h-3 w-3" />, count: trackedCountries.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                tab === t.key
                  ? "border-brand-500 bg-brand-500/10 text-brand-600"
                  : "border-border/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {t.icon} {t.label}
              {t.count > 0 && (
                <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[8px]">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Add country */}
        <div className="flex gap-2">
          <Input
            placeholder="Track a country..."
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && addCountry()}
          />
          <Button size="sm" onClick={addCountry} disabled={!newCountry.trim()} className="h-8 px-3 text-xs shrink-0">
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Opposition tab */}
        {tab === "opposition" && (
          <div className="space-y-3">
            {oppositionCountries.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">No opposition tracked yet. Add countries above.</p>
            ) : (
              oppositionCountries.map((a) => (
                <CountryCard
                  key={a.country}
                  alliance={a}
                  country={ctx.countries[a.country]}
                />
              ))
            )}
          </div>
        )}

        {/* Alliances tab */}
        {tab === "alliances" && (
          <div className="space-y-3">
            {allyCountries.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">No allies tracked yet. Add countries above.</p>
            ) : (
              allyCountries.map((a) => (
                <CountryCard
                  key={a.country}
                  alliance={a}
                  country={ctx.countries[a.country]}
                />
              ))
            )}
          </div>
        )}

        {/* By Country tab */}
        {tab === "speeches" && (
          <div className="space-y-3">
            {trackedCountries.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-4">No countries tracked yet.</p>
            ) : (
              trackedCountries.map((name) => {
                const intel = ctx.countries[name];
                const alliance = ctx.alliances.find((a) => a.country === name);
                return (
                  <CountryCard
                    key={name}
                    alliance={alliance || { country: name, status: "neutral", sharedInterests: [], notes: "" }}
                    country={intel}
                    expanded
                  />
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
