import { useId } from 'react';
import foundation from '../assets/fallingwater/foundation.webp';
import glazing from '../assets/fallingwater/glazing.webp';
import lower from '../assets/fallingwater/lower.webp';
import left from '../assets/fallingwater/left.webp';
import upper from '../assets/fallingwater/upper.webp';
import { landingById, sessionById } from '../data/programme';
import type { PlanEntry } from '../store/useScheduleStore';

// The contours follow the clay renders at their original camera scale.
const decks = {
  lower: {image:lower, x:125, width:242, height:51, top:2.6, wall:45.3,
    outline:'M128 11Q128 7 134 7L327 3 358 5Q366 5 365 12V33Q365 39 360 40L160 48Q146 48 130 43Q128 42 128 39Z'},
  left: {image:left, x:29, width:157, height:40, top:2.8, wall:34.2,
    outline:'M32 6Q32 4 38 4L180 3Q184 3 183 8V30Q183 34 180 35L56 37 34 34Q32 33 32 30Z'},
  upper: {image:upper, x:124, width:231, height:45, top:3, wall:39.4,
    outline:'M128 7Q130 3 152 3L349 9Q352 9 352 12V36Q352 39 348 40L151 42Q133 42 128 38Z'},
};

function WindowWall({top,bottom}: {top:number; bottom:number}) {
  const height=bottom-top;
  if (height<=2) return null;
  return <svg x="177" y={top} width="106" height={height} viewBox="49 7 200 159"
    preserveAspectRatio="none" overflow="hidden" aria-hidden="true" pointerEvents="none">
    <rect x="49" y="7" width="200" height="159" fill="#c0aa7c"/>
    <image href={glazing} width="260" height="174"/>
  </svg>;
}

export function TerraceVessel({entries, load, selected, onSelect}: {
  entries: PlanEntry[]; load: number; selected: string | null; onSelect: (entry: PlanEntry) => void;
}) {
  const course = useId().replace(/:/g,'')+'-masonry';
  const ordered = [...entries];
  // Untimed breaks after the last booking make a gap before that session.
  const lastSession = ordered.map(entry=>entry.kind).lastIndexOf('session');
  if (lastSession>0) {
    const pauses = ordered.splice(lastSession+1);
    ordered.splice(lastSession,0,...pauses);
  }
  const gap = Math.max(9,37 - Math.max(0,load-68)*.7 - Math.max(0,entries.length-3)*1.6);
  let bottom = 219;
  const layers = ordered.map((entry,index)=>{
    const deck = index===0 ? decks.lower : index%2 ? decks.left : decks.upper;
    const session = entry.kind==='session' ? sessionById.get(entry.id)! : null;
    const material = session?.type ?? 'break';
    const title = entry.kind==='break' ? landingById.get(entry.landing)!.title : session!.title;
    const scale = material==='break' ? .44 : material==='poster' ? .78 : 1;
    const top = bottom - deck.wall*scale;
    bottom = top - (index===0 ? Math.min(gap,3) : gap) - (material==='break' ? 10 : 0);
    return {entry,deck,material,title,scale,top};
  });
  const rightFloors = layers.filter(layer=>layer.deck!==decks.left);
  const columnTop = Math.min(16,(layers.at(-1)?.top ?? 61)-39);
  const viewTop = Math.min(-8,columnTop-16);
  const margin = 8+Math.min(144,Math.max(0,layers.length-3)*20);

  return <svg className="terrace-vessel" viewBox={`${-margin} ${viewTop} ${410+2*margin} ${326-viewTop}`}
    preserveAspectRatio="xMidYMid meet" role="group" aria-label="Western Pennsylvania clay terraces" data-layer-gap={gap.toFixed(2)}>
    <defs aria-hidden="true">
      <pattern id={course} x="74" y="36" width="108" height="48" patternUnits="userSpaceOnUse">
        <svg width="108" height="48" viewBox="74 53 108 48" aria-hidden="true">
          <image href={foundation} width="410" height="319"/>
        </svg>
      </pattern>
    </defs>
    <image className="clay-foundation" href={foundation} width="410" height="319" aria-hidden="true" pointerEvents="none"/>
    {columnTop<16 && <g aria-hidden="true" pointerEvents="none">
      <rect x="74" y={columnTop+12} width="108" height={38-columnTop-12} fill={`url(#${course})`}/>
      <svg x="72" y={columnTop} width="112" height="21" viewBox="72 16 112 21" aria-hidden="true">
        <image href={foundation} width="410" height="319"/>
      </svg>
    </g>}
    {rightFloors.slice(1).map((layer,index)=><WindowWall key={layer.entry.id}
      top={layer.top+(layer.deck.wall-1.5)*layer.scale} bottom={rightFloors[index].top+5}/>)}
    {layers.map(({entry,deck,material,title,scale,top})=>
      <g key={entry.id} className="vessel-terrace" data-entry={entry.id} data-material={material}
        transform={`translate(0 ${top-deck.top*scale})`} role="button" tabIndex={0} aria-label={'Preview '+title}
        aria-pressed={selected===entry.id} onClick={()=>onSelect(entry)}
        onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(entry);}}}>
        <title>{title}</title>
        <rect x={deck.x+3} width={deck.width-6} y={deck.top*scale} height={(deck.height-deck.top)*scale} rx="4" fill="transparent"/>
        <g className="terrace-surface" aria-hidden="true" pointerEvents="none">
          <g transform={`scale(1 ${scale})`}>
            <image className="clay-deck" href={deck.image} x={deck.x} width={deck.width} height={deck.height}/>
            <path className="terrace-outline" d={deck.outline} vectorEffect="non-scaling-stroke"/>
          </g>
        </g>
      </g>)}
    <path className="water-light" d="M164 290q13-4 23-6" fill="none" stroke="#f3faec" strokeWidth=".65" opacity=".45" aria-hidden="true" pointerEvents="none"/>
  </svg>;
}
