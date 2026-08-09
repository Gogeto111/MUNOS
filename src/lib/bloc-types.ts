export type Stance = "pro" | "con" | "neutral";

export interface BlocMember {
  userId: string;
  displayName: string;
  country: string;
  joinedAt: number;
}

export interface BlocMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
}

export interface Bloc {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  stance: Stance;
  createdBy: string;
  createdAt: number;
  members: BlocMember[];
  sharedNotes: string;
  messages: BlocMessage[];
}

export interface CountryAssignment {
  country: string;
  blocId: string | null;
}
