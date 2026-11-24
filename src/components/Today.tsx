import { useRef, useState } from 'react';
import { BottomSheet } from '../BottomSheet';
import { landingById, sessionById, sessions, typeNames, type Session } from '../data/programme';
import { useScheduleStore, type PlanEntry } from '../store/useScheduleStore';
import { TerraceVessel } from './TerraceVessel';
import { ScheduleIcon } from './ScheduleIcon';

type Store = ReturnType<typeof useScheduleStore>;

function CautionMark() {
  return <svg className="caution-mark" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="2.3" transform="rotate(45 12 12)" fill="#f1d6a4" stroke="#815f35"/>
    <path d="M12 7.7v5.3m0 2.5v.5" fill="none" stroke="#573e22" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>;
}

export function Load({ store }: { store: Store }) {
  const full = store.load > 90;
  return <div className="load-chip" data-full={full} aria-live="polite" aria-atomic="true">
    {full && <CautionMark/>}{full ? `Today is full · ${store.load}%` : `${store.load}% · ${store.loadLabel}`}
  </div>;
}

function SessionPicker({ candidates, add, close, full }: {
  full:boolean; candidates: Session[]; add: (id: string) => void; close: () => void;
}) {
  // Papers at the top make it easy to compare heavier additions in the demo.
  const papers = candidates.filter(item => item.type === 'paper');
  const others = candidates.filter(item => item.type !== 'paper');
  return <BottomSheet titleId="add-session-title" onDismiss={close}>
    <h2 id="add-session-title">Add a session</h2>
    <p className="subtext">{full?'Your day is full. Choose a session to save for later.':'CHI 2027 sample programme'}</p>
    <ul className="admission-list">{[...papers, ...others].map(session =>
      <li key={session.id}><span className="session-symbol" title={typeNames[session.type]}>
        <ScheduleIcon symbol={session.type}/><span className="sr-only">{typeNames[session.type]}</span>
      </span><div><small>{session.loadWeight} pts</small>
        <strong>{session.title}</strong><small>{session.timeSlot} · {session.room}</small></div>
        <button className="schedule-icon-button" aria-label={'Add '+session.title} title="Add to Today" onClick={()=>add(session.id)}>
          <ScheduleIcon symbol="add"/>
        </button>
      </li>)}</ul>
    {!candidates.length && <p>All sessions are already in today’s plan.</p>}
  </BottomSheet>;
}

export function CapacitySheet({ store, stayInList=false }: { store: Store; stayInList?: boolean }) {
  const item = store.blockedId && sessionById.get(store.blockedId);
  if (!item) return null;
  function save() {
    if (!item) return;
    store.moveToSlowShelf(item.id);
    store.dismissBlocked();
    if (!stayInList) location.hash = '/saved';
  }
  if(store.conflicts.length) return <BottomSheet titleId="conflict-title" onDismiss={store.dismissBlocked}>
    <div className="capacity-content"><h2 id="conflict-title">These sessions overlap</h2>
      <p><strong>{item.title}</strong> · {item.timeSlot}</p>
      <ul>{store.conflicts.map(c=><li key={c.id}>{c.title} · overlaps {c.interval}</li>)}</ul>
      <button className="action" onClick={save}>Save new to Slow Shelf</button>
      <button className="list-button" onClick={store.swap}>Swap into Today</button>
      <small>Swapping saves the replaced sessions to Slow Shelf.</small>
    </div></BottomSheet>;
  return <BottomSheet titleId="capacity-title" onDismiss={store.dismissBlocked}>
    <div className="capacity-content">
      <CautionMark/>
      <h2 id="capacity-title">Keep this for later?</h2>
      <p>Your day is full. Save <strong>{item.title}</strong> to read when you have more room.</p>
      <button className="action" onClick={save}>Save for later</button>
    </div>
  </BottomSheet>;
}

export function Today({ store, open }: { store: Store; open: (id: string) => void }) {
  const [picking, setPicking] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const breakButton = useRef<HTMLButtonElement>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const entry = store.entries.find(e => e.id === selection);
  const session = entry?.kind === 'session' ? sessionById.get(entry.id) : null;
  const rest = entry?.kind === 'break' ? landingById.get(entry.landing) : null;

  function select(item: PlanEntry) {
    setSelection(item.id);
    if (item.kind === 'session') store.selectSession(item.id);
  }
  function addSession(id: string) {
    const added = store.addSessionToToday(id);
    setPicking(false);
    if (added) select({ kind: 'session', id });
  }
  function addBreak() {
    setSelection(store.addBreak());
  }
  function remove(item: PlanEntry) {
    if (item.kind === 'session') {
      store.removeFromToday(item.id);
      addButton.current?.focus({preventScroll:true});
    } else {
      store.removeBreak(item.id);
      breakButton.current?.focus({preventScroll:true});
    }
    setSelection(null);
  }

  return <div className="today-content">
    <div className="load-row"><Load store={store}/>
      <button ref={addButton} className="schedule-icon-button" aria-label="Add session" title="Add session"
        aria-haspopup="dialog" onClick={()=>setPicking(true)}><ScheduleIcon symbol="add"/></button>
    </div>
    <div className="vessel-stage">
      <TerraceVessel entries={store.entries} load={store.load} selected={entry?.id ?? null} onSelect={select}/>
    </div>
    <div className="vessel-controls">
      <div className="preview-space">{entry && <section key={entry.id} className="terrace-preview" aria-label="Selected plan item">
        <div className="terrace-copy" aria-live="polite">
          <span className="session-symbol" title={session ? typeNames[session.type] : 'Break'}>
            <ScheduleIcon symbol={session?.type ?? 'break'}/>
            <span className="sr-only">{session ? typeNames[session.type] : 'Break'}</span>
          </span>
          <div><strong>{session?.title ?? rest?.title}</strong>
            <small>{session ? session.timeSlot+' · '+session.room : rest?.minutes+' min · '+rest?.place}</small></div>
        </div>
        <div className="terrace-actions">
          {session && <button className="explore-rings" onClick={()=>open(session.id)}>
            Explore rings
          </button>}
          <button className="schedule-icon-button" aria-label={session ? 'Remove '+session.title+' from Today' : 'Remove break'}
            title={session ? 'Remove from Today' : 'Remove break'} onClick={()=>remove(entry)}><ScheduleIcon symbol="remove"/></button>
        </div>
      </section>}</div>
      <button ref={breakButton} className="break-button" aria-label="Add a 15 min break" title="Add a 15 min break" onClick={addBreak}>
        <ScheduleIcon symbol="break"/><span>15 min</span><ScheduleIcon className="break-plus" symbol="add"/>
      </button>
    </div>
    {picking && !store.blockedId && <SessionPicker full={store.load>=95} candidates={sessions.filter(s=>!store.today.includes(s.id))} add={addSession} close={()=>setPicking(false)}/>}
  </div>;
}
