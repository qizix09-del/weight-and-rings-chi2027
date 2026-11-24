import sample from './chiSessions.json';

export type SessionType = 'paper' | 'workshop' | 'poster';
export interface PriorWork {
  year: number;
  title: string;
  authors: string[];
  takeaway: string;
  venue: string;
  url: string;
}
export interface Session {
  id: string;
  title: string;
  type: SessionType;
  timeSlot: string;
  room: string;
  loadWeight: number;
  abstract15s: string;
  roomCapacity: number | null;
  priorWorks: PriorWork[];
}

export const sessions = [...(sample as Session[])].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
export const sessionById = new Map(sessions.map(session => [session.id, session]));
export const typeNames = { paper: 'Paper session', workshop: 'Workshop / SIG', poster: 'Poster / Demo' };
export const years = [2023, 2024, 2025, 2026, 2027];
export const landings = [
  { id: 'bear-run', title: 'Bear Run Pause', minutes: 15, place: 'Wherever you are', note: 'Quiet sound moment · Nature cue' },
  { id: 'riverwalk', title: 'Allegheny Riverwalk', minutes: 15, place: 'Outdoors', note: 'Fresh river air · 3 min walk' },
  { id: 'quiet-space', title: 'Sensory Landing', minutes: 20, place: 'Indoors', note: 'Quiet indoor seat · Step off' },
] as const;
// Older saved plans may contain the original thirty-minute coffee break.
const retainedCoffee = { id: 'coffee', title: 'Strip District Coffee', minutes: 30, place: 'Café', note: 'Take a warm drink and a seat away from the hall.' } as const;
export type Landing = typeof landings[number]['id'] | typeof retainedCoffee.id;
export const landingById = new Map<Landing, typeof landings[number] | typeof retainedCoffee>(
  [...landings, retainedCoffee].map(landing => [landing.id, landing]),
);
export const breakCredit = 12;
