import { useId } from 'react';
import { years, type Session } from '../data/programme';

const materials = {
  paper: { shape:'M16 34 32 21 78 18 94 33 88 66 62 83 19 71 11 55Z', top:'#bcb6a6', side:'#898173', line:'#695c4c', active:'#835908' },
  workshop: { shape:'M18 31Q31 13 57 15T92 35Q99 60 75 76T28 77Q4 61 18 31Z', top:'#dab888', side:'#87694c', line:'#946e4c', active:'#77441b' },
  poster: { shape:'M16 49Q26 21 66 17 91 16 91 37T75 70Q55 86 28 77T16 49Z', top:'#cbe0d6', side:'#97b7a7', line:'#699384', active:'#2d6050' },
};
export function RingBadge({ session, large=false }: { session: Session; large?: boolean }) {
  const id=useId().replace(/:/g,'');
  const mat=materials[session.type];
  const linked=new Set(session.priorWorks.map(w=>w.year));
  return <svg className={large?'rings-art':'ring-badge'} viewBox="0 0 106 100" aria-hidden="true">
    <defs><clipPath id={id}><path d={mat.shape}/></clipPath></defs>
    <path d={mat.shape} transform="translate(0 5)" fill={mat.side}/><path d={mat.shape} fill={mat.top}/>
    <g clipPath={'url(#'+id+')'} stroke={mat.line} opacity=".32" fill="none" strokeWidth=".9">
      {session.type==='paper' && [31,45,62,70].map(y=><path key={y} d={'M0 '+y+'l30 3 33-5 42 2'}/>)}
      {session.type==='workshop' && [30,52,66].map(y=><path key={y} d={'M2 '+y+'q22-5 25 1t18 5'}/>)}
      {session.type==='poster' && <path d="M18 49q12-23 45-27" stroke="#fff" strokeWidth="3"/>}
    </g>
    {years.map((year,i)=>{
      const scale=.14+i*.165;
      const active=linked.has(year);
      return <path key={year} d={mat.shape} transform={'translate(53 49) scale('+scale+') translate(-53 -49)'} fill="none"
        stroke={year===2027?'var(--gold)':active?mat.active:mat.line} opacity={year===2027||active?1:.32}
        strokeWidth={(active?1.9:1)/scale} strokeLinejoin="round"/>;
    })}
  </svg>;
}
