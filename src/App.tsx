import {DayPicker} from './components/DayPicker';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { BottomDock, views, type View } from './components/BottomDock';
import { RingsView } from './components/RingsView';
import { SavedView } from './components/SavedView';
import './styles/reading.css';
import './styles/accessibility.css';
import { AccessibleListView } from './components/AccessibleListView';
import { SkyDisclosure, useSolarSky } from './components/SolarSky';
import { CapacitySheet, Today } from './components/Today';
import { landings, sessionById, sessions, years } from './data/programme';
import { useScheduleStore } from './store/useScheduleStore';
import { ScheduleIcon } from './components/ScheduleIcon';

const headings = { vessel: 'Today', rings: 'Growth Rings', pause: 'Take a break', saved: 'Slow Shelf', list: 'Schedule' };
function readRoute(): string {
  const hash = location.hash.replace(/^#\/?/,'').replace(/^today$/, 'vessel');
  if (views.includes(hash.split('/')[0] as View)) return hash;
  if (!hash) {
    const path = location.pathname.match(/\/(rings|pause|saved|list)(?:\/(.*))?\/?$/);
    if (path) return path[1]+(path[2]?'/'+path[2]:'');
  }
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'list' : 'vessel';
}
function onNavigate(callback: () => void) {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  window.addEventListener('hashchange', callback);
  media.addEventListener('change', callback);
  return () => { window.removeEventListener('hashchange', callback); media.removeEventListener('change', callback); };
}
type Store = ReturnType<typeof useScheduleStore>;
const pauseMarks = {
  'bear-run': 'M2.5 12h3l2.5-5 3.5 10 3.5-8 2 3h4.5',
  riverwalk: 'M3 8q4-4 9 0t9 0M3 15q4-4 9 0t9 0',
  'quiet-space': 'M3 18h6v-5h6V8h6',
};
function Pause({ store }: { store: Store }) {
  return <ul className="pause-options">{landings.map(b=><li className="landing" key={b.id}>
    <span className="landing-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={pauseMarks[b.id]}/></svg></span>
    <div className="landing-copy"><h2>{b.title}</h2><p>{b.note}</p></div>
    <button className="pause-duration" aria-label={`Add a ${b.minutes} min break · ${b.title}`}
      onClick={()=>{store.addBreak(b.id);location.hash='/today';}}><ScheduleIcon symbol="add"/>{b.minutes}m</button>
  </li>)}</ul>;
}
export default function App() {
  const route = useSyncExternalStore(onNavigate, readRoute);
  const [name, routeId, routeYear] = route.split('/');
  const view = name as View;
  const sky=useSolarSky();
  const store=useScheduleStore();
  const main=useRef<HTMLElement>(null);
  const previous=useRef(view);
  useEffect(()=>{
    if(previous.current!==view) {main.current?.focus({preventScroll:true});previous.current=view;}
  },[view]);
  const session = sessionById.get(routeId) ?? sessionById.get(store.selected??'') ?? sessionById.get(store.today[0]) ?? sessions[0];
  const year = years.includes(Number(routeYear)) ? Number(routeYear) : Math.max(0,...session.priorWorks.map(w=>w.year)) || 2027;
  function open(id: string, year?: number, replace=false) {
    if (store.selected!==id) store.selectSession(id);
    const hash = '#/rings/'+id+(year ? '/'+year : '');
    if (replace) {
      history.replaceState(null,'',hash);
      window.dispatchEvent(new Event('hashchange'));
    } else location.hash=hash;
  }
  const reading = view==='rings' || view==='saved';
  useEffect(()=>{
    document.title=(view==='rings'?session.title:headings[view])+' · Weight & Rings';
  },[view,session.title]);
  return <div className="studio"><div className="phone" data-sky={sky.phase} style={sky.style} data-sky-preview={!sky.automatic} data-static={view==='list'}>
    <div className="skip-actions">
      {view!=='list' && <a href="#/list">Skip to static schedule</a>}
      <a href="#main-navigation" onClick={event=>{
        event.preventDefault();
        document.querySelector<HTMLElement>('#main-navigation a[aria-current]')?.focus();
      }}>Skip to navigation</a>
    </div>
    <main key={view} ref={main} tabIndex={-1} aria-label={headings[view]} id="main" className={'screen '+(view==='vessel'?'home':view+'-screen')}>
      <div className="geo-mark kicker">Western Pennsylvania · Terraces</div>
      {!reading && <header className="screen-heading">
        <h1>{headings[view]}</h1>
        {(view==='vessel'||view==='pause') && <SkyDisclosure sky={sky}/>}
      </header>}
      {(view==='vessel'||view==='list') && <DayPicker/>}
      {view==='vessel' && <Today key={store.day} store={store} open={open}/>}
      {view==='list' && <AccessibleListView key={store.day} sky={sky}/>}
      {view==='pause' && <Pause store={store}/>}
      {view==='rings' && <RingsView session={session} year={year} open={open}/>}
      {view==='saved' && <SavedView open={open}/>}
      {(view==='list'||view==='saved') && <footer className="programme-credit">Programme data © ACM CHI 2027, licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</footer>}
    </main>
    {!store.storageAvailable&&<div className="storage-note" role="alert">Storage unavailable. This plan lasts for this visit.</div>}
    {view!=='list' && <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{store.today.length} sessions, {store.breaks.length} breaks, {store.saved.length} saved.</div>}
    <BottomDock view={view}/>
    <CapacitySheet store={store} stayInList={view==='list'}/>
  </div></div>;
}
