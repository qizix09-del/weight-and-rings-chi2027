import { useId } from 'react';
import type { RingYear, Weight } from './agenda';

const silhouettes = [
  'M5 57C5 45 11 34 23 25C33 17 53 10 67 8C81 6 89 12 92 24C95 35 93 52 87 63C83 70 73 73 58 74L25 74C13 74 6 67 5 57Z',
  'M5 60C5 50 12 40 24 33C34 27 42 15 54 12C66 9 74 17 81 26C87 34 96 42 96 53C96 64 87 69 73 70C61 71 48 67 35 71C20 74 7 70 5 60Z',
  'M7 46C10 33 19 25 34 19C47 13 69 11 82 15C94 19 97 28 94 41C90 54 78 65 66 68C52 72 38 68 26 68C13 68 3 60 7 46Z',
  'M7 44C15 36 24 37 37 29C49 22 65 21 77 26C88 30 95 36 94 47C93 58 83 64 72 64C55 63 48 67 34 66C21 65 11 63 7 56C5 52 4 48 7 44Z',
  'M13 51C17 42 29 34 42 30C53 27 62 25 73 28C83 30 91 35 91 45C91 56 79 60 65 61C50 62 40 67 26 65C17 64 9 59 13 51Z',
] as const;

const material: Record<Weight, [string, string, string]> = {
  heavy: ['#847970', '#524b43', '#24221f'],
  medium: ['#b4a798', '#8f8170', '#51483e'],
  light: ['#e3dac9', '#bbb09d', '#8b7e68'],
  pause: ['#fffcf4', '#e9dfce', '#b4a795'],
};

export function PaperGrain() {
  const id = useId();
  return (
    <svg className="paper-grain pointer-events-none opacity-[0.03]" aria-hidden="true">
      <defs>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

export function PebbleArt({ shape, weight, year }: { shape: number; weight: Weight; year?: RingYear }) {
  const id = useId();
  const outline = silhouettes[shape % silhouettes.length];
  const [light, mid, dark] = material[weight];

  return (
    <svg viewBox="0 0 100 80" aria-hidden="true" className="pebble-art">
      <defs>
        <linearGradient id={`${id}-body`} x1="33%" x2="62%" y1="0%" y2="100%">
          <stop stopColor={light} />
          <stop offset=".59" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={outline} />
        </clipPath>
        <filter id={`${id}-texture`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".77" numOctaves="3" seed={shape + 3} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <ellipse cx="51" cy="75" rx="43" ry="3" fill="#282119" opacity=".14" />
      <path d={outline} fill={`url(#${id}-body)`} stroke={dark} strokeWidth=".6" />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y="0" width="100" height="80" filter={`url(#${id}-texture)`} opacity=".38" className="stone-texture" />
        {year !== undefined && ([2027, 2026, 2025, 2024, 2023] as const).map((ring, index) => {
          const size = 0.91 - index * 0.165;
          const selected = ring === year;
          return (
            <path key={ring} d={outline} transform={`translate(${48 * (1 - size)} ${48 * (1 - size)}) scale(${size})`}
              fill="none" stroke={selected ? '#f3d68c' : ring === 2027 ? '#c59b38' : '#302822'}
              strokeWidth={selected ? 1.55 : 0.85} vectorEffect="non-scaling-stroke" opacity={selected ? 1 : 0.82} />
          );
        })}
      </g>
    </svg>
  );
}
