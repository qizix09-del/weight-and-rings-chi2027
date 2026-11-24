import type { ReactNode } from 'react';

export const views = ['vessel', 'rings', 'pause', 'saved', 'list'] as const;
export type View = typeof views[number];
const icons: Record<View, ReactNode> = {
  vessel: <path d="M10 4v16M10 6h9l2 2H10M10 11H5l-2 2h7m0 3h11l-2 2h-9M7 21h6"/>,
  rings: <g transform="rotate(-22 12 12)"><ellipse cx="12" cy="12" rx="9.5" ry="7.4"/><ellipse cx="12" cy="12" rx="5.9" ry="4.3"/><ellipse cx="12" cy="12" rx="2" ry="1.5"/></g>,
  pause: <path d="M3 9q4-3.5 9 0t9 0M3 15q4-3.5 9 0t9 0"/>,
  saved: <path d="m3 8 9-4 9 4-9 4zM3 12l9 4 9-4M3 16l9 4 9-4"/>,
  list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.2M4 12h.2M4 18h.2"/>,
};
export function DockIcon({ view }: { view: View }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[view]}</svg>;
}
export function BottomDock({ view }: { view: View }) {
  return <nav id="main-navigation" className="dock" aria-label="Main navigation">{views.map(item =>
    <a key={item} href={'#/' + (item==='vessel'?'today':item)} aria-current={item === view ? 'page' : undefined}>
      <span className="dock-mark"><DockIcon view={item}/></span>
      <span className="dock-caption">{item[0].toUpperCase() + item.slice(1)}</span>
    </a>)}</nav>;
}
