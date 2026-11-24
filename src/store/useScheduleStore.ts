import { createContext, createElement, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { breakCredit, landingById, sessionById, type Landing } from '../data/programme';

export const conferenceDays = ['Mon 10','Tue 11','Wed 12','Thu 13','Fri 14'] as const;
type Day = typeof conferenceDays[number];
export type PlanEntry = {kind:'session'; id:string} | {kind:'break'; id:string; landing:Landing};
type Week = { day:Day; days:Record<Day, PlanEntry[]>; saved:string[]; selected:string|null };
const storageKey = 'weight-and-rings.schedule.v4';
const keys = [storageKey, 'weight-and-rings.schedule.v3','weight-and-rings.schedule.v2','weight-and-rings.plan.v1'];
const sessionEntry = (id:string):PlanEntry => ({kind:'session',id});
const seed:Week = {
  day:'Mon 10', days:{
    'Mon 10':['physical','time','listening'].map(sessionEntry),
    'Tue 11':['makers','field'].map(sessionEntry),
    'Wed 12':['caption','legacy'].map(sessionEntry),
    'Thu 13':['quiet','shared'].map(sessionEntry),
    'Fri 14':['haptic'].map(sessionEntry),
  }, saved:['attention','slow'], selected:null
};
const validSession = (id:unknown):id is string => typeof id==='string' && sessionById.has(id);
const validLanding = (id:unknown):id is Landing => typeof id==='string' && landingById.has(id as Landing);

function readEntries(input:unknown[]):PlanEntry[] {
  const entries:PlanEntry[]=[];
  const ids=new Set<string>();
  for(const row of input){
    if(!row || typeof row!=='object' || !('id' in row) || typeof row.id!=='string' || ids.has(row.id) || !('kind' in row)) continue;
    if(row.kind==='session' && validSession(row.id)) entries.push(sessionEntry(row.id));
    else if(row.kind==='break' && row.id.startsWith('break-') && 'landing' in row && validLanding(row.landing))
      entries.push({id:row.id,kind:'break',landing:row.landing});
    else continue;
    ids.add(row.id);
  }
  return entries;
}
function parse(raw:string|null):Week|null {
  if (!raw) return null;
  try {
    const value=JSON.parse(raw);
    if(!value || !Array.isArray(value.saved)) return null;
    const days={...seed.days};
    const day:Day=conferenceDays.includes(value.day)?value.day:'Mon 10';
    if(value.days && typeof value.days==='object'){
      for(const d of conferenceDays) if(Array.isArray(value.days[d])) days[d]=readEntries(value.days[d]);
    }else if(Array.isArray(value.entries)) days['Mon 10']=readEntries(value.entries);
    else if(Array.isArray(value.today) && Array.isArray(value.breaks)){
      days['Mon 10']=readEntries([...value.breaks.map((landing:unknown,i:number)=>({kind:'break',id:'break-legacy-'+i,landing})),...value.today.filter(validSession).map(sessionEntry)]);
    }else return null;
    return {day,days,selected:validSession(value.selected)?value.selected:null,saved:[...new Set<string>(value.saved.filter(validSession))]};
  }catch{return null;}
}
function readPlan(){
  try{for(const key of keys){const p=parse(localStorage.getItem(key));if(p)return p;}}catch{}
  return seed;
}
export function planLoad(entries:PlanEntry[]){
  let points=0;
  for(const e of entries) points=e.kind==='break'?points-breakCredit:Math.min(100,points+sessionById.get(e.id)!.loadWeight);
  return Math.max(0,points);
}
function overlaps(id:string,entries:PlanEntry[]){
  const [start,end]=sessionById.get(id)!.timeSlot.split('–');
  return entries.flatMap(entry=>{
    if(entry.kind==='break' || entry.id===id)return [];
    const existing=sessionById.get(entry.id)!;
    const [from,to]=existing.timeSlot.split('–');
    const left=start>from?start:from, right=end<to?end:to;
    return left<right?[{id:entry.id,title:existing.title,interval:left+'–'+right}]:[];
  });
}
function withEntries(p:Week, entries:PlanEntry[]):Week {
  return {...p,days:{...p.days,[p.day]:entries}};
}
function usePlan(){
  const [plan,setPlan]=useState(readPlan);
  const [storageAvailable,setStorageAvailable]=useState(true);
  const [guard,setGuard]=useState<{day:Day;id:string}|null>(null);
  const current=useRef(plan), unsaved=useRef(false);
  function present(next:Week){current.current=next;setPlan(next);}
  function commit(change:(p:Week)=>Week){
    let p=current.current;
    try{if(!unsaved.current)p=parse(localStorage.getItem(storageKey))??p;}catch{}
    const next=change(p);
    try{localStorage.setItem(storageKey,JSON.stringify(next));unsaved.current=false;setStorageAvailable(true);}
    catch{unsaved.current=true;setStorageAvailable(false);}
    present(next);
  }
  useEffect(()=>{
    commit(p=>p);
    function sync(e:StorageEvent){if((e.key===storageKey||e.key===null)&&!unsaved.current){setGuard(null);present(readPlan());}}
    window.addEventListener('storage',sync);return ()=>window.removeEventListener('storage',sync);
  },[]);
  function admit(id:string,swapDay?:Day){
    if(!validSession(id))return false;
    let admitted=false;
    commit(p=>{
      if(swapDay && p.day!==swapDay)return p;
      const entries=p.days[p.day];
      if(entries.some(e=>e.id===id)){admitted=true;return {...p,saved:p.saved.filter(s=>s!==id)};}
      const conflicts=overlaps(id,entries).map(c=>c.id);
      if(planLoad(entries)>=95 || (conflicts.length && !swapDay)){setGuard({day:p.day,id});return p;}
      admitted=true;
      return {...withEntries(p,[...entries.filter(e=>!conflicts.includes(e.id)),sessionEntry(id)]),
        selected:id,saved:[...new Set([...conflicts,...p.saved])].filter(s=>s!==id)};
    });
    if(admitted)setGuard(null);
    return admitted;
  }
  const entries=plan.days[plan.day], load=planLoad(entries);
  const blockedId=guard?.day===plan.day?guard.id:null;
  function removeEntry(id:string){commit(p=>withEntries(p,p.days[p.day].filter(e=>e.id!==id)));}
  return {day:plan.day,saved:plan.saved,selected:plan.selected,entries,load,storageAvailable,blockedId,
    conflicts:blockedId && load<95?overlaps(blockedId,entries):[],
    swap:()=>guard && admit(guard.id,guard.day),
    today:entries.filter(e=>e.kind==='session').map(e=>e.id),
    breaks:entries.filter(e=>e.kind==='break'),
    loadLabel:load<=75?'Balanced':load<=90?'Full day':'Today is full',
    setDay(day:Day){setGuard(null);commit(p=>({...p,day,selected:null}));},
    dismissBlocked:()=>setGuard(null),addSessionToToday:admit,restoreFromSlowShelf:admit,
    removeFromToday:removeEntry,removeBreak:removeEntry,
    addBreak(landing:Landing='bear-run'){
      const id='break-'+Array.from(crypto.getRandomValues(new Uint32Array(4)),n=>n.toString(16).padStart(8,'0')).join('');
      commit(p=>withEntries(p,[...p.days[p.day],{kind:'break',id,landing}]));
      return id;
    },
    moveToSlowShelf(id:string){if(validSession(id))commit(p=>({...withEntries(p,p.days[p.day].filter(e=>e.id!==id)),saved:[id,...p.saved.filter(s=>s!==id)]}));},
    removeFromSlowShelf(id:string){commit(p=>({...p,saved:p.saved.filter(s=>s!==id)}));},
    selectSession(id:string|null){if(id===null||validSession(id))commit(p=>({...p,selected:id}));},
    resetDemoData(){setGuard(null);commit(()=>seed);}
  };
}
const ScheduleContext=createContext<ReturnType<typeof usePlan>|null>(null);
export function ScheduleProvider({children}:{children:ReactNode}){
  return createElement(ScheduleContext.Provider,{value:usePlan()},children);
}
export function useScheduleStore(){
  const store=useContext(ScheduleContext);
  if(!store)throw new Error('ScheduleProvider is required');
  return store;
}

