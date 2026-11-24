import {useEffect,useState} from 'react';
import {cachedProgramme,checkProgramme,type Edition,type Snapshot} from '../data/officialProgramme';

function Reader({edition}:{edition:Edition}){
  const [data,setData]=useState<Snapshot|null>(null), [status,setStatus]=useState('Loading programme…');
  const [query,setQuery]=useState(''), [page,setPage]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    let timer:number, snapshot:Snapshot|null=null;
    async function refresh(){
      try{
        const updated=await checkProgramme(edition,snapshot?.revision);
        if(controller.signal.aborted)return;
        if(updated && updated.revision!==snapshot?.revision){snapshot=updated;setData(updated);setPage(0);}
        setStatus('Revision '+snapshot?.revision);
      }catch{
        if(controller.signal.aborted)return;
        setStatus(snapshot?'Offline copy · revision '+snapshot.revision:'Programme unavailable. Your sample schedule is available offline.');
      }
      if(!controller.signal.aborted)timer=window.setTimeout(refresh,60000);
    }
    cachedProgramme(edition).then(cached=>{
      if(controller.signal.aborted)return;
      snapshot=cached;setData(cached);void refresh();
    });
    return ()=>{controller.abort();clearTimeout(timer);};
  },[edition]);
  const matches=data?.records.filter(r=>r.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))??[];
  return <div className="feed-reader">
    <p role="status">{status}{data?' · '+data.records.length+' contributions':''}</p>
    {data && <><label>Find a contribution<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/></label>
      {matches.slice(page*8,page*8+8).map(r=><details key={r.id}><summary>{r.title}</summary>
        <p>{r.abstract||'Abstract unspecified'}</p>
        <details><summary>Authors ({r.authors.length})</summary><p>{r.authors.join(', ')||'Authors unspecified'}</p></details>
        <p>{r.room}</p><p className="room-note">ROOM CAP: {r.capacity??'UNSPECIFIED'} · CHI JSON</p>
        {r.doi && <a className="list-button" href={r.doi} target="_blank" rel="noreferrer">View publication ↗</a>}
      </details>)}
      {matches.length===0 && <p>No matching contributions</p>}
      {matches.length>8 && <div className="feed-pages"><button className="list-button" disabled={!page} onClick={()=>setPage(page-1)}>Previous</button>
        <span>{page+1} / {Math.ceil(matches.length/8)}</span><button className="list-button" disabled={(page+1)*8>=matches.length} onClick={()=>setPage(page+1)}>Next</button></div>}
    </>}
  </div>;
}
export function ProgrammeReference(){
  const [open,setOpen]=useState(false),[edition,setEdition]=useState<Edition>('chi2026');
  return <details className="list-demo" onToggle={e=>setOpen(e.currentTarget.open)}>
    <summary>Official programme reference</summary>
    {open && <><label>Dataset <select value={edition} onChange={e=>setEdition(e.target.value as Edition)}>
      <option value="chi2026">CHI 2026 · historical</option><option value="sandbox">Sandbox · synthetic</option>
    </select></label><Reader key={edition} edition={edition}/></>}
  </details>;
}
