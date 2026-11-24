import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ScheduleIcon } from './ScheduleIcon';

const daylight = [
  { phase:'dawn', start:330, anchor:450, top:'#D9EEE5', base:'#F7F4EA' },
  { phase:'morning', start:540, anchor:615, top:'#D8E9F4', base:'#F4F7F6' },
  { phase:'noon', start:690, anchor:780, top:'#E8F1EB', base:'#F9F2E0' },
  { phase:'afternoon', start:870, anchor:960, top:'#F2E2CC', base:'#F8F0E5' },
  { phase:'dusk', start:1050, anchor:1140, top:'#D7DCEA', base:'#F2DCD1' },
] as const;
const start = 330, end = start + 1439;
function localMinutes() {
  const now = new Date();
  return now.getHours()*60+now.getMinutes();
}
export function useSolarSky() {
  const [local,setLocal]=useState(localMinutes);
  const [preview,setPreview]=useState<number|null>(null);
  useEffect(()=>{
    const update=()=>setLocal(localMinutes());
    const timer=window.setInterval(update,15000);
    document.addEventListener('visibilitychange',update);
    return ()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',update);};
  },[]);
  const minutes=preview??local;
  const palette=[...daylight].reverse().find(item=>minutes>=item.start)??daylight[4];
  const style={'--sky-top':palette.top,'--sky-base':palette.base} as CSSProperties;
  return {minutes,phase:palette.phase,style,automatic:preview===null,setPreview};
}
const formatTime=(value:number)=>String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');
const capitalize=(phase:string)=>phase[0].toUpperCase()+phase.slice(1);

export function SkyPicker({sky}: {sky:ReturnType<typeof useSolarSky>}) {
  const id=useId();
  const time=formatTime(sky.minutes);
  const phase=capitalize(sky.phase);
  return <div className="sky-scrubber">
    <div className="solar-readout"><label htmlFor={id}><span>{sky.automatic?'Local':phase}</span> <time>{time}</time></label>
      <button type="button" className="follow-time" aria-label="Use automatic local time" aria-pressed={sky.automatic}
        title="Follow local time" onClick={()=>sky.setPreview(null)}><ScheduleIcon symbol="local-time"/> Reset</button>
    </div>
    <input id={id} aria-label="Preview local time" aria-valuetext={phase+', '+time+' local time'}
      type="range" min={start} max={end} step="1" value={sky.minutes<start?sky.minutes+1440:sky.minutes} onChange={e=>sky.setPreview(Number(e.target.value)%1440)}/>
    <div className="sky-stops" aria-label="Daylight phases">{daylight.map(({phase,anchor})=>
      <button key={phase} aria-pressed={sky.phase===phase} onClick={()=>sky.setPreview(anchor)}>{capitalize(phase)}</button>
    )}</div>
  </div>;
}

export function SkyDisclosure({sky}: {sky:ReturnType<typeof useSolarSky>}) {
  const disclosure=useRef<HTMLDetailsElement>(null);
  const toggle=useRef<HTMLElement>(null);
  const phase=sky.automatic?'Local':capitalize(sky.phase);
  return <details className="sky-disclosure" ref={disclosure} onKeyDown={event=>{
    if (event.key!=='Escape' || !disclosure.current?.open) return;
    event.preventDefault();
    disclosure.current.open=false;
    toggle.current?.focus();
  }}>
    <summary ref={toggle} aria-label={'Daylight preview, '+phase+' '+formatTime(sky.minutes)}>
      {phase} <time>{formatTime(sky.minutes)}</time>
    </summary>
    <div className="sky-panel"><SkyPicker sky={sky}/></div>
  </details>;
}
