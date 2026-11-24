import type { ReactNode } from 'react';
import { sessions, type Session } from '../data/programme';
import { useScheduleStore } from '../store/useScheduleStore';
import { YearRecord } from './YearRecord';
import { GrowthRingDial } from './GrowthRingDial';

export function ReadingHeader({ badge, picker }: { badge: string; picker?: ReactNode }) {
  return <header className="reading-header">
    <a href="#/today" className="reading-back"><svg viewBox="0 0 16 24" aria-hidden="true"><path d="m13 2-10 10 10 10" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg>Today</a>
    {picker ? <label className="reading-label reading-switch">{badge}<span aria-hidden="true">⌄</span>{picker}</label>
      : <span className="reading-label">{badge}</span>}
  </header>;
}

export function RingsView({ session, year, open }: {
  session: Session; year: number; open: (id: string, year?: number, replace?: boolean) => void;
}) {
  const store = useScheduleStore();
  const saved = store.saved.includes(session.id);
  function saveOrRestore() {
    if (saved) {
      if (store.restoreFromSlowShelf(session.id)) location.hash='/today';
    } else {
      store.moveToSlowShelf(session.id);
      location.hash='/saved';
    }
  }
  return <>
    <ReadingHeader badge="CHI 2023–2027" picker={
      <select aria-label="Choose a session" value={session.id} onChange={event=>open(event.target.value)}>
        {sessions.map(other=><option key={other.id} value={other.id}>{other.title}</option>)}
      </select>
    }/>
    <div className="rings-reading" key={session.id}>
      <GrowthRingDial session={session} year={year} onYear={value=>open(session.id,value,true)}/>
      <section className="ring-caption" aria-labelledby="session-name">
        <h1 id="session-name">{session.title}</h1>
        <p>{session.timeSlot} · {session.room} · {session.priorWorks.length} prior {session.priorWorks.length===1?'work':'works'}</p>
      </section>
      <YearRecord session={session} year={year} compact/>
    </div>
    <footer className="rings-footer">
      <button className="reading-action" onClick={saveOrRestore}>{saved?'Return to Today':'Save for later'}</button>
    </footer>
    {year!==2027 && <details className="session-abstract">
      <summary>15-second session preview</summary><p>{session.abstract15s}</p>
    </details>}
  </>;
}
