export type SessionKind = 'Paper session' | 'Workshop' | 'Panel' | 'Poster' | 'Demo';
export type Weight = 'heavy' | 'medium' | 'light' | 'pause';
export type RingYear = 2023 | 2024 | 2025 | 2026 | 2027;

export interface Session {
  id: string;
  title: string;
  kind: SessionKind;
  weight: Exclude<Weight, 'pause'>;
  shape: number;
  time: string;
  minutes: number;
  room: string;
  capacity: number | null;
  preview: string;
  related: Partial<Record<RingYear, string>>;
}

export const sessions: Session[] = [
  {
    id: 'physical', title: 'Physical & Tangible Visualizations', kind: 'Paper session',
    weight: 'heavy', shape: 0, time: '10:00–11:15', minutes: 75, room: 'Room 04', capacity: null,
    preview: 'Explore how physical objects help people make sense of data.',
    related: { 2024: 'Physical representations of personal data', 2026: 'Sharing data through objects and touch' },
  },
  {
    id: 'time', title: 'Designing with Time', kind: 'Paper session',
    weight: 'heavy', shape: 2, time: '11:30–12:10', minutes: 40, room: 'Room 02', capacity: 110,
    preview: 'Explore how interface choices shape our experience of waiting, pacing, and attention.',
    related: { 2025: 'Making time visible in everyday tools' },
  },
  {
    id: 'listening', title: 'Listening Across Differences', kind: 'Panel',
    weight: 'medium', shape: 1, time: '13:05–13:35', minutes: 30, room: 'Room 06', capacity: 80,
    preview: 'A discussion about creating more ways to participate in live conversations.',
    related: { 2023: 'Participation beyond the microphone' },
  },
  {
    id: 'quiet', title: 'Designing for Quiet', kind: 'Poster',
    weight: 'light', shape: 3, time: '14:00–14:20', minutes: 20, room: 'Poster hall', capacity: null,
    preview: 'A study of how people find and evaluate quieter places in crowded public spaces.',
    related: { 2025: 'Sensory access in public spaces', 2026: 'Finding quieter routes through busy spaces' },
  },
  {
    id: 'slow', title: 'The Slow Archive', kind: 'Demo',
    weight: 'light', shape: 4, time: '14:20–14:40', minutes: 20, room: 'Demo hall', capacity: 200,
    preview: 'An interactive archive that lets visitors return to short encounters and read at their own pace.',
    related: { 2026: 'Reading beyond the first encounter' },
  },
  {
    id: 'attention', title: 'Making Room for Attention', kind: 'Workshop',
    weight: 'medium', shape: 1, time: '15:00–16:00', minutes: 60, room: 'Room 07', capacity: 42,
    preview: 'Participants sketch different ways to build pauses into dense information environments.',
    related: { 2024: 'Designing for flexible attention' },
  },
  {
    id: 'field', title: 'Field Notes in Motion', kind: 'Demo',
    weight: 'light', shape: 3, time: '16:10–16:30', minutes: 20, room: 'Demo hall', capacity: 200,
    preview: 'A handheld tool for marking observations while walking through shared spaces.', related: {},
  },
  {
    id: 'shared', title: 'Shared Places, Shared Stories', kind: 'Paper session',
    weight: 'heavy', shape: 0, time: '16:30–17:15', minutes: 45, room: 'Room 03', capacity: 115,
    preview: 'Research on how people construct a shared record of places that change over time.',
    related: { 2023: 'Collective memory and public places', 2026: 'Capturing unfinished place stories' },
  },
];

export const landings = [
  { id: 'riverwalk', title: 'Riverwalk Breather', minutes: 15 },
  { id: 'coffee', title: 'Strip District Coffee', minutes: 30 },
  { id: 'quiet-space', title: 'Quiet break', minutes: 20 },
] as const;

export type LandingId = (typeof landings)[number]['id'];
export const years: RingYear[] = [2027, 2026, 2025, 2024, 2023];
export const weightPoints: Record<Weight, number> = { heavy: 3, medium: 2, light: 1, pause: -1.5 };
export const storageKey = 'weight-and-rings.plan.v1';

export interface Plan {
  today: string[];
  saved: string[];
  breaks: LandingId[];
  listView?: boolean;
}

const initialPlan: Plan = { today: ['physical', 'time', 'listening'], saved: ['quiet', 'slow'], breaks: [] };
const sessionIds = new Set(sessions.map((session) => session.id));

export function loadPlan(): Plan {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return initialPlan;
    const plan = JSON.parse(stored) as Partial<Plan>;
    const validSessions = (ids: unknown) => Array.isArray(ids)
      ? [...new Set(ids.filter((id): id is string => typeof id === 'string' && sessionIds.has(id)))]
      : [];
    return {
      today: validSessions(plan.today),
      saved: validSessions(plan.saved),
      breaks: landings.filter(({ id }) => plan.breaks?.includes(id)).map(({ id }) => id),
      listView: typeof plan.listView === 'boolean' ? plan.listView : undefined,
    };
  } catch {
    return initialPlan;
  }
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours ? `${hours}h${remainder ? ` ${remainder}m` : ''}` : `${minutes}m`;
}
