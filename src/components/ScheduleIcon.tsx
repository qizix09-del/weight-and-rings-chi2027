import type { ReactNode } from 'react';
import type { SessionType } from '../data/programme';

type Symbol = SessionType | 'break' | 'add' | 'remove' | 'inspect' | 'local-time';
const shapes: Record<Symbol, ReactNode> = {
  paper: <path d="M5 3.5h10l4 4V21H5zM15 3.5V8h4M8.5 12h7m-7 4h7"/>,
  workshop: <><rect x="3.5" y="12" width="8.5" height="8" rx="1.4"/><rect x="12" y="12" width="8.5" height="8" rx="1.4"/><rect x="7.75" y="4" width="8.5" height="8" rx="1.4"/></>,
  poster: <path d="M4.5 4.5h15V15h-15zM12 15v6m-3-6-3 6m9-6 3 6M8 8h8m-8 3.5h5"/>,
  break: <path d="M2.5 9q3.5-3.7 9.5-.4t9.5-.6M2.5 15q3.5-3.7 9.5-.4t9.5-.6"/>,
  add: <path d="M12 5v14M5 12h14"/>,
  remove: <path d="M5 12h14"/>,
  inspect: <><circle cx="10.5" cy="10.5" r="5.75"/><path d="m14.65 14.65 5 5"/></>,
  'local-time': <path d="M20.4 9.2a8.35 8.35 0 1 1-2.3-3.4l2.4 2.2M20.5 3.75V8.1h-4.35M12 7.8V12l2.9 1.7"/>,
};

export function ScheduleIcon({ symbol, className }: { symbol: Symbol; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {shapes[symbol]}
  </svg>;
}
