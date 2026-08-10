"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

const COUNTRIES = [
  { name: "Afghanistan", flag: "🇦🇫" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "China", flag: "🇨🇳" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Cuba", flag: "🇨🇺" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Ethiopia", flag: "🇪🇹" },
  { name: "France", flag: "🇫🇷" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "India", flag: "🇮🇳" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Iran", flag: "🇮🇷" },
  { name: "Iraq", flag: "🇮🇶" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Jordan", flag: "🇯🇴" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "Lebanon", flag: "🇱🇧" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Nepal", flag: "🇳🇵" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "North Korea", flag: "🇰🇵" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Pakistan", flag: "🇵🇰" },
  { name: "Palestine", flag: "🇵🇸" },
  { name: "Philippines", flag: "🇵🇭" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "Russia", flag: "🇷🇺" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Sweden", flag: "🇸🇪" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Syria", flag: "🇸🇾" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "Uganda", flag: "🇺🇬" },
  { name: "Ukraine", flag: "🇺🇦" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Venezuela", flag: "🇻🇪" },
  { name: "Vietnam", flag: "🇻🇳" },
  { name: "Yemen", flag: "🇾🇪" },
] as const;

const STORAGE_KEY = "munos-country-research-recent";

let cachedCountries: { name: string; flag: string }[] | null = null;

async function fetchCountriesFromApi(): Promise<{ name: string; flag: string }[]> {
  if (cachedCountries) return cachedCountries;
  try {
    const res = await fetch(
      `https://api.restcountries.com/countries/v3.1/all?fields=name,flags,cca2`
    );
    if (!res.ok) return [...COUNTRIES];
    const data = await res.json();
    cachedCountries = data
      .map((c: { name: { common: string }; flags?: { emoji: string } }) => ({
        name: c.name.common,
        flag: c.flags?.emoji || "🏳️",
      }))
      .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
    return cachedCountries ?? [];
  } catch {
    return [...COUNTRIES];
  }
}

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(country: string) {
  const recent = getRecentSearches().filter((r) => r !== country);
  recent.unshift(country);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, 5)));
}

interface CountrySearchProps {
  value: string;
  onChange: (country: string) => void;
  onSearch?: () => void;
  disabled?: boolean;
}

export function CountrySearch({ value, onChange, onSearch, disabled }: CountrySearchProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [countries, setCountries] = useState<{ name: string; flag: string }[]>([...COUNTRIES]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    fetchCountriesFromApi().then(setCountries);
  }, []);

  const filtered = value.trim()
    ? countries.filter((c) => c.name.toLowerCase().includes(value.toLowerCase()))
    : countries;

  const recentFiltered = recentSearches.filter(
    (r) => !value.trim() || r.toLowerCase().includes(value.toLowerCase()),
  );

  const showRecent = recentFiltered.length > 0 && !value.trim();
  const allItems = showRecent
    ? [...recentFiltered.map((r) => ({ name: r, flag: countries.find((c) => c.name === r)?.flag || "🏳️", isRecent: true })), ...filtered.map((c) => ({ ...c, isRecent: false }))]
    : filtered.map((c) => ({ ...c, isRecent: false }));

  const deduped = allItems.filter((item, index, self) => index === self.findIndex((t) => t.name === item.name));

  const selectCountry = useCallback(
    (name: string) => {
      onChange(name);
      setOpen(false);
      addRecentSearch(name);
      setRecentSearches(getRecentSearches());
      onSearch?.();
    },
    [onChange, onSearch],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, deduped.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (deduped[highlightedIndex]) {
        selectCountry(deduped[highlightedIndex].name);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value]);

  useEffect(() => {
    if (open && listRef.current) {
      const highlighted = listRef.current.children[highlightedIndex] as HTMLElement;
      highlighted?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, open]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search country..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pl-9 pr-8"
          aria-label="Search country"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {open && deduped.length > 0 && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md"
        >
          {showRecent && (
            <>
              <div className="px-2 py-1 text-[10px] font-medium uppercase text-muted-foreground">
                <Clock className="mr-1 inline size-3" />
                Recent
              </div>
              {deduped
                .filter((i) => i.isRecent)
                .map((item, i) => (
                  <button
                    key={item.name}
                    role="option"
                    aria-selected={highlightedIndex === i}
                    className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                      highlightedIndex === i ? "bg-accent text-accent-foreground" : ""
                    }`}
                    onClick={() => selectCountry(item.name)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                  >
                    <span className="text-base">{item.flag}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              <div className="my-1 border-t" />
            </>
          )}

          {!showRecent && (
            <div className="px-2 py-1 text-[10px] font-medium uppercase text-muted-foreground">
              All Countries
            </div>
          )}

          {deduped
            .filter((i) => !i.isRecent || !showRecent)
            .map((item, i) => {
              const idx = showRecent
                ? recentFiltered.length + deduped.filter((d) => !d.isRecent).indexOf(item)
                : i;
              return (
                <button
                  key={item.name}
                  role="option"
                  aria-selected={highlightedIndex === idx}
                  className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                    highlightedIndex === idx ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onClick={() => selectCountry(item.name)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <span className="text-base">{item.flag}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
        </div>
      )}

      {open && deduped.length === 0 && value.trim() && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md">
          No countries match &quot;{value}&quot;
        </div>
      )}
    </div>
  );
}
