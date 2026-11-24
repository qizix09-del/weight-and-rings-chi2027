import { useId } from 'react';
import cedarFace from '../assets/rings/cedar-endgrain.svg';
import { years, type Session, type SessionType } from '../data/programme';

const sandstone = 'M19 71Q20 44 35 25Q46 12 74 14L151 17Q177 19 183 36Q188 48 185 80L179 145Q178 174 159 181Q146 186 118 181L46 166Q18 161 14 146Q10 134 14 111Z';
const jade = 'M12 101C19 65 55 29 103 17C145 5 182 20 190 54C202 96 177 145 146 172C123 191 86 192 56 179C19 164 4 135 12 101Z';
const colors = { paper: '#ac7616', workshop: '#795124', poster: '#216554' };

export function linkedYears(session: Session) {
  return years.filter(year => session.priorWorks.some(work => work.year === year));
}

type FaceProps = { type: SessionType };
export function MaterialFace({ type }: FaceProps) {
  const id = useId().replace(/:/g, '');
  if (type === 'workshop') {
    // Vector contours traced from the approved end-grain study, including its eccentric pith and bark.
    return <image href={cedarFace} x="-9" y="-8" width="218" height="218" aria-hidden="true"/>;
  }
  const stone = type === 'paper';
  const shape = stone ? sandstone : jade;
  const ref = (name: string) => 'url(#'+id+name+')';
  return <g aria-hidden="true">
    <defs>
      <path id={id+'shape'} d={shape}/>
      <clipPath id={id+'clip'}><use href={'#'+id+'shape'}/></clipPath>
      <linearGradient id={id+'side'} x2=".65" y2="1" gradientUnits="objectBoundingBox">
        <stop stopColor={stone?'#a39274':'#acbbab'}/><stop offset=".44" stopColor={stone?'#756851':'#8eaa99'}/><stop offset=".72" stopColor={stone?'#9c8e73':'#acbdab'}/><stop offset="1" stopColor={stone?'#776b58':'#8ea18f'}/>
      </linearGradient>
      <radialGradient id={id+'face'} cx=".24" cy=".17" r="1.12">
        <stop stopColor={stone?'#c9c0aa':'#e9edda'}/><stop offset=".46" stopColor={stone?'#b8ad96':'#d6e2d1'}/><stop offset=".84" stopColor={stone?'#ad9f85':'#bccfbf'}/><stop offset="1" stopColor={stone?'#b8ac94':'#acbfac'}/>
      </radialGradient>
      <filter id={id+'grain'} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency={stone?'.48 .64':'.037 .065'} numOctaves="3" seed={stone?8:15}/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <linearGradient id={id+'shine'} x2="1" y2="1">
        <stop stopColor="#fffbe5" stopOpacity=".73"/><stop offset=".48" stopColor="#fffbe5" stopOpacity="0"/><stop offset="1" stopColor="#556652" stopOpacity=".32"/>
      </linearGradient>
    </defs>
    <use href={'#'+id+'shape'} fill={ref('side')} transform="translate(0 4)"/>
    {stone && [0.78,0.6,0.38].map((layer,i)=><use key={layer} href={'#'+id+'shape'} transform={'translate(0 '+layer*4+')'} fill={['#857961','#a5987e','#93846b'][i]}/>)}
    <use href={'#'+id+'shape'} fill={ref('face')}/>
    <g clipPath={ref('clip')}>
      <rect width="200" height="200" filter={ref('grain')} opacity={stone?.34:.085} style={{mixBlendMode:'multiply'}}/>
      {stone ? <g stroke="#efe6ca" fill="none" opacity=".36" strokeWidth=".65">
        <path d="M-10 32q43-6 63 1t46 1 55 8 49 0M-5 35q41-7 65 0t49 2M12 147q32-7 50 0t44 7 51-2 44 3M17 150q30-6 47 1t40 5"/>
        <path d="m37 49 7-2 4 1 6-2m52 96 6-2 6 2 5-1m16-119 4 1 7-2m-87 90 3-1 4 1m102-31 6-1"/>
      </g> : <g fill="none" stroke="#f6fae9" strokeLinecap="round">
        <path d="M23 92Q43 45 89 30" strokeWidth="3.5" opacity=".42"/>
        <path d="M44 155Q73 170 96 164T161 132" strokeWidth="7" opacity=".17"/>
        <path d="M42 157Q76 171 95 166T164 130" strokeWidth="1" opacity=".44"/>
      </g>}
    </g>
    <use href={'#'+id+'shape'} fill="none" stroke={ref('shine')} strokeWidth="1.5"/>
  </g>;
}

// The center and the five increasing radii are shared by the engraved rings and their hit areas.
export function ringContour(type: SessionType, index: number) {
  const radius = 17 + index * 15;
  const relief = type === 'workshop' ? .014 : .033;
  const profile = type === 'paper' ? .88 : type === 'poster' ? .92 : .99;
  const points = Array.from({length: 96}, (_, i) => {
    const a = Math.PI * 2 * i / 96;
    const r = radius * (1 + relief * (Math.cos(3*a-.7) + .45*Math.sin(5*a+.4)));
    const x = 100 + r * Math.cos(a);
    const y = 101 + r * (profile*Math.sin(a) - (type==='poster'?.12:0)*Math.cos(a));
    return x.toFixed(2)+' '+y.toFixed(2);
  });
  return 'M'+points.join('L')+'Z';
}
export function ResearchRing({ index, type, ink, selected=false, linked=false }: {
  index: number; type: SessionType; ink: boolean; selected?: boolean; linked?: boolean;
}) {
  const contour = ringContour(type,index);
  const stroke = selected || (index===4 && ink) ? '#D49B2A' : ink ? colors[type] : '#463b2a';
  return <g data-ring-year={years[index]} data-linked={linked} aria-hidden="true" fill="none" pointerEvents="none">
    <path d={contour} transform="translate(0 .65)" stroke="#fff8dc" strokeWidth={ink?1.45:1.1} opacity={ink?.74:.28}/>
    <path d={contour} stroke={stroke} strokeWidth={selected?1.75:ink?1.2:.6} opacity={ink?1:.34}/>
  </g>;
}
