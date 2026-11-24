import { useRef, useSyncExternalStore } from 'react';
import paperLandmark from '../assets/pittsburgh/paper-terrace.svg';
import workshopLandmark from '../assets/pittsburgh/workshop-terrace.svg';
import posterLandmark from '../assets/pittsburgh/poster-terrace.svg';
import { sessionById, typeNames } from '../data/programme';
import { useScheduleStore } from '../store/useScheduleStore';
import { linkedYears } from './MaterialRingBadge';
import { ReadingHeader } from './RingsView';
import { ScheduleIcon } from './ScheduleIcon';

const shelfArt = {
  paper: {src:paperLandmark, name:'Three Sisters Bridges', alt:'Research pages with an embossed golden suspension bridge figure'},
  workshop: {src:workshopLandmark, name:'Pittsburgh Steel Truss', alt:'A wooden workbench with prototype blocks and crossed pine-green steel supports'},
  poster: {src:posterLandmark, name:'Phipps Conservatory', alt:'An upright poster with a chart and a rounded seafoam conservatory roof'},
};

function observeCache(onChange: () => void) {
  if (!('serviceWorker' in navigator)) return () => {};
  navigator.serviceWorker.addEventListener('controllerchange',onChange);
  return () => navigator.serviceWorker.removeEventListener('controllerchange',onChange);
}
function offlineReady() {
  return Boolean(import.meta.env.PROD && navigator.serviceWorker?.controller);
}
function RestoreIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9h11a6 6 0 0 1 0 12h-2M7 4 2.5 9 7 14"/>
  </svg>;
}
export function SavedView({ open }: { open: (id: string, year?: number) => void }) {
  const store = useScheduleStore();
  const cached = useSyncExternalStore(observeCache,offlineReady);
  const heading = useRef<HTMLHeadingElement>(null);
  const entries = useRef(new Map<string,HTMLButtonElement>());
  function remove(id: string) {
    const index = store.saved.indexOf(id);
    const next = entries.current.get(store.saved[index+1]) ?? entries.current.get(store.saved[index-1]);
    (next??heading.current)?.focus({preventScroll:true});
    store.removeFromSlowShelf(id);
  }
  return <>
    <ReadingHeader badge={cached&&store.storageAvailable?'OFFLINE READY':store.storageAvailable?'ON THIS DEVICE':'THIS VISIT'}/>
    <div className="shelf-intro"><h1 ref={heading} tabIndex={-1}>Slow Shelf</h1></div>
    <div className="shelf-reading">
      {!store.saved.length ? <div className="empty-shelf"><h2>Your shelf is empty.</h2><p>Use “Save for later” on a session to keep its summary here.</p><a href="#/rings">Explore rings ›</a></div> :
      <ul className="archive-list">{store.saved.map(id=>{
        const s = sessionById.get(id)!;
        const linked = linkedYears(s);
        const art = shelfArt[s.type];
        return <li key={id} className="archive-card" data-session={id}>
          <img className="material-badge shelf-relief" width="56" height="56" src={art.src} alt={`${art.name}. ${art.alt}`}/>
          <button className="archive-open" aria-label={'Open '+s.title} onClick={()=>open(id,2027)}
            ref={el=>{if(el) entries.current.set(id,el); else entries.current.delete(id);}}>
            <span className="archive-caption">
              <span className="archive-type">{typeNames[s.type]} · {art.name}</span>
              <strong>{s.title}</strong>
            </span>
          </button>
          <div className="archive-tools">
            <div className="archive-years" role="group" aria-label="Linked CHI years">
              {linked.map(year=><button key={year} onClick={()=>open(id,year)} aria-label={'Read '+year+' record for '+s.title}>{year}</button>)}
              {!linked.length && <small>No linked years</small>}
            </div>
            <div className="shelf-actions">
              <button title="Return to Today" aria-label={'Return '+s.title+' to Today'} onClick={()=>{if(store.restoreFromSlowShelf(id)) location.hash='/today';}}><RestoreIcon/></button>
              <button title="Remove from shelf" aria-label={'Remove '+s.title+' from Slow Shelf'} onClick={()=>remove(id)}><ScheduleIcon symbol="remove"/></button>
            </div>
          </div>
        </li>;
      })}</ul>}
    </div>
  </>;
}
