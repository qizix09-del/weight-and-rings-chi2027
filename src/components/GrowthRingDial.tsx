import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { years, type Session } from '../data/programme';
import { MaterialFace, ResearchRing, linkedYears, ringContour } from './MaterialRingBadge';

const ticks = Array.from({length:100},(_,i)=>i);
const step = 360/years.length;
const indexAngle = 132;
const dialMaterial = 'workshop';
const indexAt = (angle:number) => ((Math.round((indexAngle-angle)/step)%years.length)+years.length)%years.length;
type Turn = { pointer:number; previous:number; rotation:number; origin:number; x:number; y:number; moved:boolean; index:number };

function EngravedIndex() {
  const [cut, bevel, light] = ['#4f2e18','#99623a','#fbd8a5'];
  return <g className="engraved-index" aria-hidden="true" pointerEvents="none" transform={`rotate(${indexAngle} 100 101)`}>
    <path d="M99.2 22.6c1.5 2.7 2.9 6.5 3.5 10.5l.8 10.2c-1.7-3.7-3.2-7.3-4-10.1-.9-3.6-1.1-7.6-.3-10.6Z" fill={cut}/>
    <path d="M99.4 25.4c.2 4.6 1.8 10 3.8 15.8l-1.1-7.5Z" fill={bevel}/>
    <path d="M98.8 24.5c-.7 4.8 1.1 11.4 4.2 17.9" fill="none" stroke={light} strokeWidth="1.1" strokeLinecap="round"/>
  </g>;
}

function dialPoint(event:PointerEvent<SVGSVGElement>) {
  const matrix=event.currentTarget.getScreenCTM();
  if(!matrix) return null;
  const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
  const x=p.x-200, y=p.y-198;
  return {angle:Math.atan2(x,-y)*180/Math.PI,radius:Math.hypot(x,y)};
}

export function GrowthRingDial({session,year,onYear}: {
  session:Session; year:number; onYear:(year:number)=>void;
}) {
  const linked=linkedYears(session);
  const labels=useRef<(HTMLButtonElement|null)[]>([]);
  const turn=useRef<Turn|null>(null);
  const suppressClick=useRef(false);
  const [freeAngle,setFreeAngle]=useState<number|null>(null);
  const rotation=freeAngle??indexAngle-years.indexOf(year)*step;
  function pick(index:number) {
    onYear(years[index]);
    labels.current[index]?.focus({preventScroll:true});
  }
  function start(event:PointerEvent<SVGSVGElement>) {
    if(!event.isPrimary || event.button!==0 || turn.current) return;
    suppressClick.current=false;
    const p=dialPoint(event);
    if(!p || p.radius<138 || p.radius>214) return;
    turn.current={pointer:event.pointerId,previous:p.angle,rotation,origin:rotation,x:event.clientX,y:event.clientY,moved:false,index:years.indexOf(year)};
    // Capture on the original element so a tap on a printed year remains a native click.
    (event.target as Element).setPointerCapture(event.pointerId);
  }
  function move(event:PointerEvent<SVGSVGElement>) {
    const gesture=turn.current;
    if(!gesture || gesture.pointer!==event.pointerId) return;
    if(!gesture.moved && Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<4) return;
    const p=dialPoint(event);
    if(!p || p.radius<20) return;
    gesture.moved=true;
    gesture.rotation+=(p.angle-gesture.previous+540)%360-180;
    gesture.previous=p.angle;
    setFreeAngle(gesture.rotation);
    const index=indexAt(gesture.rotation);
    if(index!==gesture.index) {
      gesture.index=index;
      onYear(years[index]);
    }
  }
  function finish(event:PointerEvent<SVGSVGElement>,cancel=false) {
    const gesture=turn.current;
    if(!gesture || gesture.pointer!==event.pointerId) return;
    turn.current=null;
    suppressClick.current=gesture.moved;
    if(gesture.moved && cancel) onYear(years[indexAt(gesture.origin)]);
    setFreeAngle(null);
  }
  function handleKey(event:KeyboardEvent,index:number) {
    let next=index;
    switch(event.key) {
      case 'ArrowRight': case 'ArrowDown': next=(index+1)%years.length;break;
      case 'ArrowLeft': case 'ArrowUp': next=(index+years.length-1)%years.length;break;
      case 'Home': next=0;break;
      case 'End': next=years.length-1;break;
      case ' ': case 'Enter': break;
      default:return;
    }
    event.preventDefault();
    pick(next);
  }
  return <><svg viewBox="0 0 400 396" className="growth-dial" role="group" aria-label="CHI research year" data-material={dialMaterial}
    aria-describedby="dial-help" onPointerDown={start} onPointerMove={move} onPointerUp={event=>finish(event)} onPointerCancel={event=>finish(event,true)}
    onLostPointerCapture={event=>finish(event)} onClickCapture={event=>{if(suppressClick.current){event.stopPropagation();suppressClick.current=false;}}}>
    <circle className="dial-grip" aria-hidden="true" cx="200" cy="198" r="169" fill="none" stroke="transparent" strokeWidth="57"/>
    <g className="dial-scale" transform={`translate(200 198) rotate(${rotation})`} aria-hidden="true" pointerEvents="none">
      {ticks.map(i=><line key={i} x1="0" x2="0" y1={i%5===0?-154:-158} y2="-165"
        transform={'rotate('+i*3.6+')'} stroke={i%20===0?'#414b3a':'#838576'} strokeWidth={i%5===0?1.25:.8}/>)}
    </g>
    <g aria-hidden="true" transform="translate(66 62.66) scale(1.34)">
      <g className="specimen-shadow"><MaterialFace type={dialMaterial}/></g>
      {years.map((y,i)=><ResearchRing key={y} type={dialMaterial} index={i} ink={y===year||y===2027||linked.includes(y)} selected={y===year} linked={linked.includes(y)}/>)}
      <EngravedIndex/>
      {years.map((y,i)=><path key={y} data-pick-year={y} d={ringContour(dialMaterial,i)}
        fill="none" stroke="transparent" strokeWidth="14.8" pointerEvents="stroke" onClick={()=>pick(i)}/>)}
    </g>
    {years.map((y,i)=>{
      const direction=(i*step+rotation)%360;
      const rad=direction*Math.PI/180;
      const x=200+Math.sin(rad)*182, yPos=198-Math.cos(rad)*179;
      const tangent=((direction+540)%360+360)%360-180;
      const tilt=Math.abs(tangent)>90?tangent-Math.sign(tangent)*180:tangent;
      return <g key={y} transform={`translate(${x} ${yPos}) rotate(${tilt})`}>
        <foreignObject x="-42" y="-21" width="84" height="42" overflow="visible">
          <button className="dial-year" ref={el=>{labels.current[i]=el;}} aria-pressed={year===y}
            onKeyDown={event=>handleKey(event,i)} onClick={()=>pick(i)}>{y}</button>
        </foreignObject>
      </g>;
    })}
  </svg><p id="dial-help" className="dial-help">Turn the rim<span className="sr-only"> or choose a year</span></p></>;
}
