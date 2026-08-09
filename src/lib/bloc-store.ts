import type { Bloc, BlocMessage, Stance, CountryAssignment } from "./bloc-types";

const BLOCS_KEY = "munos-blocs";
const ASSIGNMENTS_KEY = "munos-country-assignments";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getBlocId(userId: string): string {
  return `bloc-${userId}-${Date.now().toString(36)}`;
}

export function getAllBlocs(): Bloc[] {
  return read<Bloc[]>(BLOCS_KEY, []);
}

export function getBloc(blocId: string): Bloc | undefined {
  return getAllBlocs().find((b) => b.id === blocId);
}

export function getUserBloc(userId: string): Bloc | undefined {
  return getAllBlocs().find((b) => b.members.some((m) => m.userId === userId));
}

export function createBloc(data: {
  name: string;
  description: string;
  emoji: string;
  color: string;
  stance: Stance;
  userId: string;
  displayName: string;
  country: string;
}): Bloc {
  const blocs = getAllBlocs();
  const bloc: Bloc = {
    id: getBlocId(data.userId),
    name: data.name,
    description: data.description,
    emoji: data.emoji,
    color: data.color,
    stance: data.stance,
    createdBy: data.userId,
    createdAt: Date.now(),
    members: [
      {
        userId: data.userId,
        displayName: data.displayName,
        country: data.country,
        joinedAt: Date.now(),
      },
    ],
    sharedNotes: "",
    messages: [],
  };
  blocs.push(bloc);
  write(BLOCS_KEY, blocs);
  return bloc;
}

export function joinBloc(
  blocId: string,
  member: { userId: string; displayName: string; country: string }
): Bloc | undefined {
  const blocs = getAllBlocs();
  const bloc = blocs.find((b) => b.id === blocId);
  if (!bloc || bloc.members.some((m) => m.userId === member.userId)) return bloc;
  bloc.members.push({ ...member, joinedAt: Date.now() });
  write(BLOCS_KEY, blocs);
  return bloc;
}

export function leaveBloc(userId: string): void {
  const blocs = getAllBlocs();
  for (const bloc of blocs) {
    bloc.members = bloc.members.filter((m) => m.userId !== userId);
  }
  write(
    BLOCS_KEY,
    blocs.filter((b) => b.members.length > 0)
  );
}

export function dissolveBloc(blocId: string): void {
  const blocs = getAllBlocs().filter((b) => b.id !== blocId);
  write(BLOCS_KEY, blocs);
}

export function updateBlocStance(blocId: string, stance: Stance): void {
  const blocs = getAllBlocs();
  const bloc = blocs.find((b) => b.id === blocId);
  if (bloc) {
    bloc.stance = stance;
    write(BLOCS_KEY, blocs);
  }
}

export function updateBlocNotes(blocId: string, notes: string): void {
  const blocs = getAllBlocs();
  const bloc = blocs.find((b) => b.id === blocId);
  if (bloc) {
    bloc.sharedNotes = notes;
    write(BLOCS_KEY, blocs);
  }
}

export function addBlocMessage(
  blocId: string,
  msg: Omit<BlocMessage, "id" | "timestamp">
): BlocMessage | undefined {
  const blocs = getAllBlocs();
  const bloc = blocs.find((b) => b.id === blocId);
  if (!bloc) return undefined;
  const message: BlocMessage = {
    ...msg,
    id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
  };
  bloc.messages.push(message);
  write(BLOCS_KEY, blocs);
  return message;
}

export function getCountryAssignments(): CountryAssignment[] {
  return read<CountryAssignment[]>(ASSIGNMENTS_KEY, []);
}

export function setCountryAssignment(country: string, blocId: string | null): void {
  const assignments = getCountryAssignments();
  const idx = assignments.findIndex((a) => a.country === country);
  if (idx >= 0) {
    assignments[idx].blocId = blocId;
  } else {
    assignments.push({ country, blocId });
  }
  write(ASSIGNMENTS_KEY, assignments);
}
