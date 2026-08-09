"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface SpeechRecord {
  id: string;
  speaker: string;
  country: string;
  type: "gsl" | "moderated" | "unmoderated" | "poi" | "closing";
  topic?: string;
  content?: string;
  timestamp: number;
  duration?: number;
  wordCount?: number;
}

export interface PoiRecord {
  id: string;
  from: string;
  fromCountry: string;
  to: string;
  toCountry: string;
  text: string;
  type: "diplomatic" | "aggressive" | "trap" | "evidence" | "technical" | "follow-up" | "counter";
  response?: string;
  timestamp: number;
}

export interface CountryIntel {
  name: string;
  position?: string;
  arguments: string[];
  promises: string[];
  contradictions: string[];
  vulnerabilities: string[];
  alliances: string[];
  votingPattern?: string;
  speeches: string[];
  pois: string[];
}

export interface AllianceInfo {
  country: string;
  status: "ally" | "potential" | "neutral" | "opposition";
  sharedInterests: string[];
  notes: string;
}

export interface SessionEvent {
  id: string;
  type: "speech" | "poi" | "caucus" | "vote" | "motion" | "note" | "alliance" | "crisis";
  content: string;
  country?: string;
  timestamp: number;
}

export interface MunContextValue {
  country: string;
  committee: string;
  agenda: string;
  conference: string;
  sessionActive: boolean;
  currentTopic: string;
  currentModeratedCaucus: string;
  currentUnmoderatedCaucus: string;
  speakingList: string[];
  currentSpeaker: string;
  speeches: SpeechRecord[];
  pois: PoiRecord[];
  countries: Record<string, CountryIntel>;
  alliances: AllianceInfo[];
  events: SessionEvent[];
  sessionNotes: string;
}

interface MunContextActions {
  setCountry: (v: string) => void;
  setCommittee: (v: string) => void;
  setAgenda: (v: string) => void;
  setConference: (v: string) => void;
  setSessionActive: (v: boolean) => void;
  setCurrentTopic: (v: string) => void;
  setCurrentModeratedCaucus: (v: string) => void;
  setCurrentUnmoderatedCaucus: (v: string) => void;
  setSpeakingList: (v: string[]) => void;
  setCurrentSpeaker: (v: string) => void;
  addSpeech: (s: Omit<SpeechRecord, "id" | "timestamp">) => void;
  addPoi: (p: Omit<PoiRecord, "id" | "timestamp">) => void;
  updateCountry: (name: string, data: Partial<CountryIntel>) => void;
  addAlliance: (a: AllianceInfo) => void;
  updateAlliance: (country: string, data: Partial<AllianceInfo>) => void;
  addEvent: (e: Omit<SessionEvent, "id" | "timestamp">) => void;
  setSessionNotes: (v: string) => void;
  clearSession: () => void;
  get_context_summary: () => string;
}

const INITIAL: MunContextValue = {
  country: "",
  committee: "",
  agenda: "",
  conference: "",
  sessionActive: false,
  currentTopic: "",
  currentModeratedCaucus: "",
  currentUnmoderatedCaucus: "",
  speakingList: [],
  currentSpeaker: "",
  speeches: [],
  pois: [],
  countries: {},
  alliances: [],
  events: [],
  sessionNotes: "",
};

const MunContext = createContext<(MunContextValue & MunContextActions) | null>(null);

const STORAGE_KEY = "munos-mun-context";

function loadSaved(): Partial<MunContextValue> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveToStorage(state: MunContextValue) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function MunProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MunContextValue>(() => ({
    ...INITIAL,
    ...loadSaved(),
  }));

  const update = useCallback((patch: Partial<MunContextValue>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveToStorage(next);
      return next;
    });
  }, []);

  const actions: MunContextActions = {
    setCountry: (v) => update({ country: v }),
    setCommittee: (v) => update({ committee: v }),
    setAgenda: (v) => update({ agenda: v }),
    setConference: (v) => update({ conference: v }),
    setSessionActive: (v) => update({ sessionActive: v }),
    setCurrentTopic: (v) => update({ currentTopic: v }),
    setCurrentModeratedCaucus: (v) => update({ currentModeratedCaucus: v }),
    setCurrentUnmoderatedCaucus: (v) => update({ currentUnmoderatedCaucus: v }),
    setSpeakingList: (v) => update({ speakingList: v }),
    setCurrentSpeaker: (v) => update({ currentSpeaker: v }),
    addSpeech: (s) => {
      const record: SpeechRecord = {
        ...s,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        timestamp: Date.now(),
      };
      update({ speeches: [...state.speeches, record] });
    },
    addPoi: (p) => {
      const record: PoiRecord = {
        ...p,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        timestamp: Date.now(),
      };
      update({ pois: [...state.pois, record] });
    },
    updateCountry: (name, data) => {
      const existing = state.countries[name] || {
        name, arguments: [], promises: [], contradictions: [],
        vulnerabilities: [], alliances: [], speeches: [], pois: [],
      };
      update({
        countries: {
          ...state.countries,
          [name]: { ...existing, ...data },
        },
      });
    },
    addAlliance: (a) => update({ alliances: [...state.alliances, a] }),
    updateAlliance: (country, data) => {
      update({
        alliances: state.alliances.map((a) =>
          a.country === country ? { ...a, ...data } : a
        ),
      });
    },
    addEvent: (e) => {
      const record: SessionEvent = {
        ...e,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        timestamp: Date.now(),
      };
      update({ events: [...state.events, record] });
    },
    setSessionNotes: (v) => update({ sessionNotes: v }),
    clearSession: () => {
      setState({ ...INITIAL });
      if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    },
    get_context_summary: () => {
      const s = state;
      const parts: string[] = [];
      if (s.country) parts.push(`Country: ${s.country}`);
      if (s.committee) parts.push(`Committee: ${s.committee}`);
      if (s.agenda) parts.push(`Agenda: ${s.agenda}`);
      if (s.conference) parts.push(`Conference: ${s.conference}`);
      if (s.currentTopic) parts.push(`Current topic: ${s.currentTopic}`);
      if (s.currentModeratedCaucus) parts.push(`Moderated caucus: ${s.currentModeratedCaucus}`);
      if (s.currentUnmoderatedCaucus) parts.push(`Unmoderated caucus: ${s.currentUnmoderatedCaucus}`);
      if (s.currentSpeaker) parts.push(`Current speaker: ${s.currentSpeaker}`);
      if (s.speakingList.length) parts.push(`Speaking list: ${s.speakingList.join(", ")}`);
      if (s.speeches.length) parts.push(`Speeches given: ${s.speeches.length}`);
      if (s.pois.length) parts.push(`POIs exchanged: ${s.pois.length}`);
      const allyNames = s.alliances.filter((a) => a.status === "ally").map((a) => a.country);
      if (allyNames.length) parts.push(`Allies: ${allyNames.join(", ")}`);
      const oppNames = s.alliances.filter((a) => a.status === "opposition").map((a) => a.country);
      if (oppNames.length) parts.push(`Opposition: ${oppNames.join(", ")}`);
      if (s.events.length) parts.push(`Session events: ${s.events.length}`);
      if (s.sessionNotes) parts.push(`Notes: ${s.sessionNotes.slice(0, 200)}`);
      return parts.join("\n") || "No context set. User is in mid-session mode.";
    },
  };

  return (
    <MunContext.Provider value={{ ...state, ...actions }}>
      {children}
    </MunContext.Provider>
  );
}

export function useMunContext() {
  const ctx = useContext(MunContext);
  if (!ctx) throw new Error("useMunContext must be used within MunProvider");
  return ctx;
}
