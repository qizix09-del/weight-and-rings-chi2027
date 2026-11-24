import type { CSSProperties } from 'react';
import { PebbleArt } from './PebbleArt';
import { landings, type Plan, type Session, type Weight } from './agenda';

interface BridgeItem {
  id: string;
  title: string;
  shape: number;
  weight: Weight;
  activate: () => void;
}

export function Bridge({ today, breaks, load, showSession, showBreak }: {
  today: Session[];
  breaks: Plan['breaks'];
  load: number;
  showSession: (id: string) => void;
  showBreak: () => void;
}) {
  const items: BridgeItem[] = [
    ...today.map((session) => ({ ...session, activate: () => showSession(session.id) })),
    ...landings.filter(({ id }) => breaks.includes(id)).map((landing) => ({
      id: landing.id, title: landing.title, shape: 4, weight: 'pause' as const, activate: showBreak,
    })),
  ];
  const visible = items.slice(0, 5);
  const sag = Math.min(21, load * 2.2);
  const presentation = visible.length === 3
    ? [{ left: 29, width: 36, shift: 32, angle: -9 }, { left: 55, width: 29, shift: 29, angle: 4 }, { left: 78, width: 21, shift: 34, angle: -5 }]
    : visible.map((_, i) => ({
      left: visible.length === 1 ? 50 : 16 + 68 * i / (visible.length - 1),
      width: Math.min(39, 94 / Math.max(1, visible.length)), shift: 32, angle: i % 2 === 0 ? -6 : 5,
    }));

  return (
    <div className="bridge-art">
      <svg viewBox="0 0 380 150" className="bridge-span" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="span-face" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop stopColor="#847362" /><stop offset=".43" stopColor="#67584a" /><stop offset="1" stopColor="#4b4037" />
          </linearGradient>
          <linearGradient id="span-edge" x1="0%" x2="100%">
            <stop stopColor="#594d42" /><stop offset=".53" stopColor="#a79884" /><stop offset="1" stopColor="#615244" />
          </linearGradient>
        </defs>
        <path d="M16 133H364" stroke="#d8d4ca" strokeWidth="1" />
        <path d="M36 128h31l3-29H46z M313 128h31l-10-29h-24z" fill="url(#span-face)" />
        <path d={`M27 95 Q190 ${95 + sag} 353 95 L351 104 Q190 ${104 + sag} 29 104Z`} fill="url(#span-face)" />
        <path d={`M27 95 Q190 ${95 + sag} 353 95`} fill="none" stroke="url(#span-edge)" strokeWidth="2.2" />
        <path d="M36 128h31m246 0h31" stroke="#52463c" strokeWidth="1.5" />
      </svg>
      <div className="bridge-stones" aria-label="Planned sessions and breaks">
        {visible.map((item, i) => (
          <button key={item.id} className="bridge-pebble" type="button" onClick={item.activate}
            aria-label={item.title} style={{
              '--stone-x': `${presentation[i].left}%`, '--stone-width': `${presentation[i].width}%`,
              '--stone-shift': `${presentation[i].shift}%`, '--stone-angle': `${presentation[i].angle}deg`,
            } as CSSProperties}>
            <PebbleArt shape={item.shape} weight={item.weight} />
          </button>
        ))}
      </div>
      {items.length > visible.length && <span className="bridge-more mono">+{items.length - visible.length} in list view</span>}
    </div>
  );
}
