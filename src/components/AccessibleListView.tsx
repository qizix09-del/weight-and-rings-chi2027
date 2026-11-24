import {ProgrammeReference} from './ProgrammeReference';
import { useLayoutEffect, useRef, useState } from 'react';
import { BottomSheet } from '../BottomSheet';
import { landings, landingById, sessionById, sessions, typeNames, years, type Landing, type Session, type SessionType } from '../data/programme';
import { useScheduleStore, type PlanEntry } from '../store/useScheduleStore';
import { Load } from './Today';
import { SkyPicker, useSolarSky } from './SolarSky';
import { YearRecord } from './YearRecord';

const filters = ['all','paper','workshop','poster'] as const;
type Filter = 'all' | SessionType;
type Sky = ReturnType<typeof useSolarSky>;

function TextReader({session, saved, close, save}: {
  session: Session; saved: boolean; close: () => void; save: () => void;
}) {
  const [year, setYear] = useState(2027);
  return <BottomSheet titleId="static-session-title" onDismiss={close}>
    <div className="text-reader">
      <p className="list-meta">{typeNames[session.type]} · 2027 demo</p>
      <h2 id="static-session-title">{session.title}</h2>
      <p>{session.timeSlot} · {session.room}</p>
      <section aria-labelledby="static-preview"><h3 id="static-preview">15-second session preview</h3><p>{session.abstract15s}</p></section>
      <fieldset><legend>Research year</legend><div className="filter-options">{years.map(y=>
        <label key={y}><input type="radio" name="reading-year" checked={year===y} onChange={()=>setYear(y)}/>{y}</label>
      )}</div></fieldset>
      <YearRecord session={session} year={year} includePreview={false}/>
      {saved ? <p>Saved to Slow Shelf</p> : <button className="list-primary" onClick={save}>Save to Slow Shelf</button>}
      <button className="list-button" onClick={close}>Back to schedule</button>
    </div>
  </BottomSheet>;
}

function BreakPicker({close, add}: {close: () => void; add: (id: Landing) => void}) {
  const [choice,setChoice] = useState<Landing>('bear-run');
  const rest = landingById.get(choice)!;
  return <BottomSheet titleId="list-break-title" onDismiss={close}>
    <div className="text-reader">
      <h2 id="list-break-title">Add a break</h2>
      <label htmlFor="break-option">Choose a break
        <select id="break-option" value={choice} onChange={event=>setChoice(event.target.value as Landing)}>
          {landings.map(item=><option key={item.id} value={item.id}>{item.title} · {item.minutes} min</option>)}
        </select>
      </label>
      <p>{rest.note}</p>
      <button className="list-primary" onClick={()=>add(choice)}>Add a {rest.minutes} min break</button>
    </div>
  </BottomSheet>;
}

export function AccessibleListView({sky}: {sky: Sky}) {
  const store = useScheduleStore();
  const [browse, setBrowse] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pickingBreak, setPickingBreak] = useState(false);
  const [reading, setReading] = useState<Session | null>(null);
  const [notice, setNotice] = useState('');
  const todayTab = useRef<HTMLButtonElement>(null);
  const focusToday = useRef(false);
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const visible = sessions.filter(s=>{
    if (!browse) return store.today.includes(s.id);
    const text = [s.title,typeNames[s.type],s.timeSlot,s.room,s.abstract15s].join(' ').toLocaleLowerCase();
    return (filter==='all'||filter===s.type) && terms.every(term=>text.includes(term));
  });
  const rows: PlanEntry[] = visible.map(session=>({kind:'session',id:session.id}));
  // Breaks carry a duration but no clock time. Slot them before the last timed
  // session for display while keeping the stored plan and load credits intact.
  if (!browse) rows.splice(Math.max(0,rows.length-1),0,...store.breaks);

  useLayoutEffect(()=>{
    if (focusToday.current) todayTab.current?.focus();
    focusToday.current=false;
  });
  function save(s: Session) {
    if (!browse) focusToday.current=true;
    store.moveToSlowShelf(s.id);
    setReading(null);
    setNotice(s.title+' saved to Slow Shelf.');
  }
  function changePlan(s: Session) {
    if (store.today.includes(s.id)) {
      if (!browse) focusToday.current=true;
      store.removeFromToday(s.id);
      setNotice(s.title+' removed from today.');
    } else if (store.addSessionToToday(s.id)) setNotice(s.title+' added to today.');
  }
  function changeSection(next: boolean) {
    setNotice('');
    setExpanded(null);
    setBrowse(next);
  }
  function reset() {
    store.resetDemoData();
    sky.setPreview(null);
    setFilter('all'); setQuery(''); setBrowse(false); setExpanded(null);
    setNotice('Demo reset. Three sessions in today’s plan and two on Slow Shelf.');
  }

  return <div className="accessible-list">
    <div className="list-toolbar">
      <div role="group" aria-label="Schedule sections" className="list-switch">
        <button ref={todayTab} aria-pressed={!browse} onClick={()=>changeSection(false)}>Today ({store.today.length+store.breaks.length})</button>
        <button aria-pressed={browse} onClick={()=>changeSection(true)}>Explore ({sessions.length})</button>
      </div>
      <button className="list-button jump-break" aria-haspopup="dialog" onClick={()=>setPickingBreak(true)}>+ Break</button>
    </div>
    {!browse && <div className="list-load"><Load store={store}/></div>}
    <p className="list-notice sr-only" role="status" aria-atomic="true">{notice}</p>
    <section aria-label={browse?'Explore sessions':'Today’s plan'} className="list-panel">
      {browse && <div className="list-filters">
        <label className="sr-only" htmlFor="session-search">Search sessions</label>
        <input id="session-search" type="search" value={query} placeholder="Title, room or keyword" onChange={event=>{setQuery(event.target.value);setNotice('');}}/>
        <fieldset><legend className="sr-only">Session type</legend><div className="filter-options">{filters.map(f=>
          <label key={f}><input type="radio" name="session-type" value={f} checked={filter===f}
            onChange={()=>{setFilter(f);setNotice('');}}/>{f[0].toUpperCase()+f.slice(1)}</label>
        )}</div></fieldset>
        <p className="sr-only" aria-live="polite" aria-atomic="true">{visible.length} of {sessions.length} sessions</p>
      </div>}
      {rows.length > 0 ? <ul className="static-sessions">{rows.map(row=>{
        const isOpen = expanded===row.id;
        const detailsId = 'actions-'+row.id;
        const toggle = ()=>setExpanded(isOpen?null:row.id);
        if (row.kind==='break') {
          const rest = landingById.get(row.landing)!;
          return <li className="timeline-row" key={row.id} data-kind="break">
            <div className="time-rail"><span>Flex</span><span>{rest.minutes}m</span></div>
            <article className="timeline-card" data-material="break">
              <button className="row-toggle" aria-expanded={isOpen} aria-controls={detailsId} onClick={toggle}>
                <span className="list-type">Break</span><strong>{rest.title}</strong>
              </button>
              <div className="list-row-actions" id={detailsId} hidden={!isOpen}>
                <button onClick={()=>{focusToday.current=true;store.removeBreak(row.id);setNotice(rest.title+' removed from today.');}}>Remove<span className="sr-only"> · {rest.title}</span></button>
              </div>
            </article>
          </li>;
        }
        const session=sessionById.get(row.id)!;
        const [start,end]=session.timeSlot.split(/\s*[–—-]\s*/);
        const planned=store.today.includes(row.id);
        const saved=store.saved.includes(row.id);
        return <li className="timeline-row" key={row.id} data-session={row.id}>
          <div className="time-rail"><time>{start}</time>{end && <time>{end}</time>}</div>
          <article className="timeline-card" data-material={session.type}>
            <div className="timeline-heading">
              <button className="row-toggle" aria-expanded={isOpen} aria-controls={detailsId} onClick={toggle}>
                <span className="list-type">{typeNames[session.type]}</span><strong>{session.title}</strong><span className="list-meta">{session.room}</span>
              </button>
              <button className="timeline-rings" aria-label={'Inspect Rings · '+session.title} aria-haspopup="dialog"
                onClick={()=>{store.selectSession(session.id);setReading(session);}}>Rings</button>
            </div>
            <div className="list-row-actions" id={detailsId} hidden={!isOpen}>
              {(!planned || browse) && <button onClick={()=>changePlan(session)}>
                {planned?'Remove':'Add to Today'}<span className="sr-only"> · {session.title}</span>
              </button>}
              <button onClick={()=>{
                if (!saved) { save(session); return; }
                store.removeFromSlowShelf(session.id);
                setNotice(session.title+' removed from Slow Shelf.');
              }}>{saved?'Unsave':'Save for later'}<span className="sr-only"> · {session.title}</span></button>
              {planned && !browse && <button onClick={()=>changePlan(session)}>Remove<span className="sr-only"> · {session.title}</span></button>}
            </div>
          </article>
        </li>;
      })}</ul> : <div className="list-empty">
        <p>{browse?'No sessions match your search and type.':'Your schedule is open.'}</p>
        <button className="list-button" onClick={()=>{setQuery('');setFilter('all');changeSection(true);}}>{browse?'Clear filters':'Explore sessions'}</button>
      </div>}
    </section>
    <details className="list-demo"><summary>Demo settings</summary>
      <fieldset><legend>Local sky preview</legend>
        <div className="sky-sample" aria-hidden="true"/>
        <SkyPicker sky={sky}/>
      </fieldset>
      <button className="list-button" onClick={reset}>Reset Demo Data</button>
    </details>
    <ProgrammeReference/>
    {pickingBreak && <BreakPicker close={()=>setPickingBreak(false)} add={id=>{
      store.addBreak(id);setPickingBreak(false);setNotice(landingById.get(id)!.title+' added to today.');
    }}/>}
    {reading && <TextReader key={reading.id} session={reading} saved={store.saved.includes(reading.id)} close={()=>setReading(null)} save={()=>save(reading)}/>}
  </div>;
}
