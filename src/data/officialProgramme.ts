export type Edition = 'chi2026' | 'sandbox';
type Row = Record<string,unknown>;
export type RecordView = {id:number;title:string;abstract:string;authors:string[];room:string;capacity:number|null;doi:string|null};
export type Snapshot = {revision:number; records:RecordView[]};
const cacheName='wr-reference-v1';
const rows=(v:unknown):Row[]=>Array.isArray(v)?v.filter((r):r is Row=>r!==null && typeof r==='object'):[];
const str=(v:unknown)=>typeof v==='string'?v.trim():'';
const index=(v:unknown)=>new Map(rows(v).map(r=>[r.id,r]));
function publicationUrl(addons:unknown){
  const doi=(addons as {doi?:{url?:unknown}}|null)?.doi?.url;
  if(typeof doi!=='string')return null;
  try{
    const url=new URL(doi);
    if(url.protocol==='https:' && !url.username && !url.password &&
      ((url.hostname==='doi.org' && /^\/10\.\d{4,9}\/.+/.test(url.pathname)) ||
       (url.hostname==='dl.acm.org' && /^\/doi\/(?:abs\/|full\/)?10\.\d{4,9}\/.+/.test(url.pathname))))return url.href;
  }catch{}
  return null;
}
export function readRecords(data:Row):RecordView[]{
  if(data.schemeVersion!==7 || !Array.isArray(data.contents))throw Error('Unsupported programme format');
  const rooms=index(data.rooms), sessions=index(data.sessions), events=index(data.events), people=index(data.people);
  return rows(data.contents).flatMap(c=>{
    if(typeof c.id!=='number')return [];
    const placements=[...(Array.isArray(c.sessionIds)?c.sessionIds:[]).map(id=>sessions.get(id)),
      ...(Array.isArray(c.eventIds)?c.eventIds:[]).map(id=>events.get(id))];
    const room=placements.map(p=>rooms.get(p?.roomId)).find(r=>r && str(r.name));
    return [{id:c.id,title:str(c.title)||'Title unspecified',abstract:str(c.abstract),authors:rows(c.authors).map(a=>{
      const person=people.get(a.personId);
      return [person?.firstName,person?.middleInitial,person?.lastName].map(str).filter(Boolean).join(' ')||'Name unspecified';
    }),room:str(room?.name)||'Room unspecified',capacity:typeof room?.capacity==='number'?room.capacity:null,doi:publicationUrl(c.addons)}];
  });
}
const base=(edition:Edition)=>'https://chidigitalexperience.org/data/'+edition+'/';
export async function cachedProgramme(edition:Edition):Promise<Snapshot|null>{
  try{
    const response=await (await caches.open(cacheName)).match(base(edition)+'snapshot');
    if(response)return await response.json();
  }catch{}
  return null;
}
async function fetchRevision(edition:Edition, known:number|undefined):Promise<Snapshot|null>{
  const root=base(edition);
  const version=await fetch(root+'version.json?t='+Date.now(),{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
  if(!version.ok)throw Error('Programme update unavailable');
  const meta=await version.json();
  if(!Number.isSafeInteger(meta.revision) || meta.edition!==edition)throw Error('Invalid version record');
  if(meta.revision===known)return null;
  const url=new URL(meta.revision_url,root);
  if(!url.href.startsWith(root+'revisions/') || !url.pathname.endsWith('.json'))throw Error('Invalid revision URL');
  const response=await fetch(url,{credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('Revision unavailable');
  const snapshot={revision:meta.revision,records:readRecords(await response.json())};
  try{await (await caches.open(cacheName)).put(root+'snapshot',new Response(JSON.stringify(snapshot)));}catch{}
  return snapshot;
}


// Share the same request when users reopen the reader or return to an edition.
const recent=new Map<Edition,{started:number;request:Promise<Snapshot|null>}>();
export function checkProgramme(edition:Edition,known:number|undefined){
  const previous=recent.get(edition);
  if(previous && Date.now()-previous.started<60000) return previous.request;
  const request=fetchRevision(edition,known);
  recent.set(edition,{started:Date.now(),request});
  return request;
}
