// Route map beside the travel steps in the Getting here section. The sea and
// land come from public/merek/peta-rute.svg (scripts/desain/peta-rute.mjs),
// the flight, ferry and boat routes, the numbers and the place names are
// drawn here. The first three steps are numbered on the map, at Sorong
// airport, on the ferry to Waisai and at the pin on Kri.
//
// From xl the map fills the height of the step cards beside it and is
// cropped at its sides, from md it is cropped a little at top and bottom, so
// everything drawn stays clear of the outer 50 units. On
// phones names and numbers are drawn larger, as the map is shown small.
import type { Bahasa } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { LEBAR, TINGGI, TEMPAT } from '@/lib/peta-rute.mjs';

type Titik = [number, number];

// point and heading in degrees at t along a quadratic curve
function pada(a: Titik, c: Titik, b: Titik, t: number) {
  const u = 1 - t;
  const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0];
  const y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
  const dx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]);
  const dy = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
  return { x, y, arah: (Math.atan2(dy, dx) * 180) / Math.PI };
}
const kurva = (a: Titik, c: Titik, b: Titik) => `M${a[0]} ${a[1]}Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`;

const { bandara, sorong, waisai, kri } = TEMPAT;
const TERBANG: [Titik, Titik, Titik] = [[800, -20], [868, 330], bandara];
const FERI: [Titik, Titik, Titik] = [sorong, [640, 300], waisai];
const PERAHU: [Titik, Titik, Titik] = [waisai, [250, 205], kri];
const pesawat = pada(...TERBANG, 0.42);
const feri = pada(...FERI, 0.5);
const perahu = pada(...PERAHU, 0.5);

const TITIK = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const NAMA = { stroke: '#fff', strokeWidth: 6, strokeLinejoin: 'round', paintOrder: 'stroke' } as const;

function Nomor({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="max-md:scale-[1.55]">
        <circle r="17" className="fill-laut" stroke="#fff" strokeWidth="3" />
        <text dy="0.36em" textAnchor="middle" className="fill-white font-bold [font-size:17px]">{n}</text>
      </g>
    </g>
  );
}

function Singgah({ p }: { p: Titik }) {
  return <circle cx={p[0]} cy={p[1]} r="6.5" fill="#fff" strokeWidth="3" className="stroke-laut" />;
}

export default function PetaRute({ b, n, className = '' }: { b: Bahasa; n: number; className?: string }) {
  const t = kamus(b).petaRute;
  const kota = 'font-bold uppercase tracking-[0.2em] fill-laut [font-size:21px] max-md:[font-size:30px]';
  const laut = 'italic fill-laut/70 [font-size:20px] max-md:[font-size:28px]';
  return (
    <figure className={`relative aspect-[930/680] overflow-hidden rounded-[1.75rem] border-[5px] border-white bg-[#d3ecf3] md:aspect-[930/600] xl:aspect-auto xl:h-full xl:min-h-[30rem] ${className}`}>
      <svg viewBox={`0 0 ${LEBAR} ${TINGGI}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={t.judul} className="absolute inset-0 size-full">
        <image href="/merek/peta-rute.svg" width={LEBAR} height={TINGGI} />

        <text x="470" y="62" className={laut} {...NAMA}>{t.waigeo}</text>
        <text x="300" y="400" className={laut} {...NAMA}>{t.selat}</text>

        {/* flight into Sorong, then the ride to the harbour */}
        <path d={kurva(...TERBANG)} {...TITIK} strokeWidth="2.4" strokeDasharray="0 8" className="stroke-laut/45" />
        <path d={`M${bandara[0]} ${bandara[1]}L${sorong[0]} ${sorong[1]}`} {...TITIK} strokeWidth="2.4" strokeDasharray="0 7" className="stroke-laut/60" />
        <g transform={`translate(${pesawat.x} ${pesawat.y}) rotate(${pesawat.arah + 90})`}>
          <path className="fill-laut max-md:scale-[1.35]" d="M0-22c2.5 0 3.5 3 3.5 7v10L20 5v4L3.5 4v10L8 18v3l-8-2-8 2v-3l4.5-4V4L-20 9V5l16.5-10v-10c0-4 1-7 3.5-7Z" />
        </g>

        {/* fast ferry Sorong to Waisai and our boat Waisai to Kri */}
        <path d={kurva(...FERI)} {...TITIK} strokeWidth="3.4" strokeDasharray="0 10" className="stroke-laut" />
        <path d={kurva(...PERAHU)} {...TITIK} strokeWidth="3.4" strokeDasharray="0 10" className="stroke-biru-tua" />
        <g transform={`translate(${feri.x} ${feri.y + 4})`}>
          <g className="max-md:scale-[1.4]">
            <path d="M-30 2h60l-7 13h-46Z" className="fill-laut" />
            <path d="M-16-11h24a5 5 0 0 1 5 5v8h-34v-8a5 5 0 0 1 5-5Z" fill="#fff" strokeWidth="2.6" strokeLinejoin="round" className="stroke-laut" />
            <path d="M-11-6h5v4h-5ZM-2-6h5v4h-5Z" className="fill-laut" />
            <path d="M-38 20q5-4 10 0t10 0M22 20q5-4 10 0t10 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
        <g transform={`translate(${perahu.x} ${perahu.y})`}>
          <g className="max-md:scale-[1.4]">
            <path d="M-20-1h40l-6 9h-30Z" className="fill-biru-tua" />
            <path d="M-9-1v-7h12v7" fill="none" strokeWidth="2.4" strokeLinejoin="round" className="stroke-biru-tua" />
          </g>
        </g>

        <Singgah p={sorong} />
        <Singgah p={waisai} />
        <text x={waisai[0] + 16} y={waisai[1] - 16} className={kota} {...NAMA}>Waisai</text>
        <text x={sorong[0] - 20} y={sorong[1] + 8} textAnchor="end" className={kota} {...NAMA}>Sorong</text>
        <text x={kri[0] + 20} y={kri[1] + 36} className={kota} {...NAMA}>{t.kri}</text>

        {n > 0 && <Nomor x={bandara[0]} y={bandara[1]} n={1} />}
        {n > 1 && <Nomor x={feri.x} y={feri.y - 34} n={2} />}

        {/* the bungalows on Kri */}
        <g transform={`translate(${kri[0]} ${kri[1]})`}>
          <g className="max-md:scale-[1.45]">
            <path d="M0 0C-6-12-20-22-20-36a20 20 0 1 1 40 0C20-22 6-12 0 0Z" strokeWidth="3" stroke="#fff" className="fill-biru-tua" />
            <circle cy="-36" r="12" fill="#fff" />
            {n > 2
              ? <text y="-36" dy="0.36em" textAnchor="middle" className="fill-biru-tua font-bold [font-size:15px]">3</text>
              : <circle cy="-36" r="4.5" className="fill-biru-tua" />}
          </g>
        </g>
      </svg>
      <figcaption className="absolute bottom-2 left-3 rounded-full bg-white/70 px-2 py-0.5 text-[0.625rem] text-laut/70">{t.sumber}</figcaption>
    </figure>
  );
}
