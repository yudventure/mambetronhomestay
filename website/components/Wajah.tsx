// Drawn faces for the guests beside the review score. Illustrations, never
// photos: the real reviewers' pictures belong to them and to the review site,
// and a stranger's photo would pass as a reviewer. Works on the server and in
// the admin picker alike.

type Rambut = 'pendek' | 'panjang' | 'cepol' | 'keriting' | 'bob' | 'tipis';
type Gaya = {
  label: string;
  kulit: string;
  rambut?: Rambut;
  warnaRambut: string;
  baju: string;
  latar: string;
  jenggot?: boolean;
  kacamata?: boolean;
  topi?: string;
  kerudung?: string;
};

export const WAJAH: Record<string, Gaya> = {
  a: { label: 'Rambut pendek', kulit: '#f1c7a4', rambut: 'pendek', warnaRambut: '#6b4226', baju: '#ffffff', latar: '#0497b2' },
  b: { label: 'Rambut panjang', kulit: '#e8b48d', rambut: 'panjang', warnaRambut: '#2b1d16', baju: '#f27a3d', latar: '#8fdce8' },
  c: { label: 'Rambut dicepol', kulit: '#f6d4ba', rambut: 'cepol', warnaRambut: '#c98f2e', baju: '#0b3b4a', latar: '#f7dfa8' },
  d: { label: 'Berjenggot', kulit: '#d9a172', rambut: 'pendek', warnaRambut: '#3b2a20', baju: '#f7dfa8', latar: '#13566a', jenggot: true },
  e: { label: 'Rambut keriting', kulit: '#8d5a3b', rambut: 'keriting', warnaRambut: '#1b1210', baju: '#8fdce8', latar: '#f27a3d' },
  f: { label: 'Berkacamata', kulit: '#f0c39e', rambut: 'pendek', warnaRambut: '#2a2a2a', baju: '#0497b2', latar: '#cbe9ef', kacamata: true },
  g: { label: 'Bertopi pantai', kulit: '#c68b5e', rambut: 'pendek', warnaRambut: '#2b1d16', baju: '#ffffff', latar: '#0b3b4a', topi: '#f7dfa8' },
  h: { label: 'Rambut beruban', kulit: '#f2c9a5', rambut: 'tipis', warnaRambut: '#d9d4cc', baju: '#13566a', latar: '#f7dfa8', kacamata: true },
  i: { label: 'Berkerudung', kulit: '#d9a27a', warnaRambut: '#000000', baju: '#0b3b4a', latar: '#cbe9ef', kerudung: '#f27a3d' },
  j: { label: 'Rambut bob berponi', kulit: '#f3cdb0', rambut: 'bob', warnaRambut: '#4a2c1a', baju: '#ffffff', latar: '#d6336c' },
};

// Order used when a guest has no face picked, so neighbours always differ.
const URUT = ['a', 'b', 'f', 'c', 'd', 'j', 'e', 'g', 'h', 'i'];
export const wajahKe = (kunci: string, i: number) => (WAJAH[kunci] ? kunci : URUT[i % URUT.length]);

const GELAP = '#1d2a33';

function RambutBelakang({ g }: { g: Gaya }) {
  if (g.rambut === 'panjang') return <path d="M13.5 22C13 12 18 9 24 9s11 3 10.5 13l1 14c-3.5 1.5-6.5 1-8-.2l-.5-9.8h-6l-.5 9.8c-1.5 1.2-4.5 1.7-8 .2Z" fill={g.warnaRambut} />;
  if (g.rambut === 'bob') return <path d="M13 22c0-10 5-13 11-13s11 3 11 13v8c-2 1.5-4 1-4.5 0h-13c-.5 1-2.5 1.5-4.5 0Z" fill={g.warnaRambut} />;
  if (g.rambut === 'cepol') return <circle cx="24" cy="8.5" r="4.6" fill={g.warnaRambut} />;
  return null;
}

function RambutDepan({ g }: { g: Gaya }) {
  const w = g.warnaRambut;
  switch (g.rambut) {
    case 'pendek':
      return <path d="M14.5 20.5C14 12.5 18.5 9.5 24.5 9.5c5.5 0 9.5 3 9 11-1.5-4.5-4.5-6-9.5-5.5-4 .4-7 2-9.5 5.5Z" fill={w} />;
    case 'tipis':
      return <path d="M14.6 21c-.4-6 1.6-9 4.6-9.6 1.4 1.6 3 2 4.8 2s3.4-.4 4.8-2c3 .6 5 3.6 4.6 9.6-1-3.4-2.4-4.6-3.6-4.8H18.2c-1.2.2-2.6 1.4-3.6 4.8Z" fill={w} />;
    case 'panjang':
      return <path d="M14.5 21c0-8 4.5-11 9.5-11 6 0 9.5 3.5 9.5 11-3.5-4-7.5-5.5-13.5-4.5-2 .5-4 2-5.5 4.5Z" fill={w} />;
    case 'cepol':
      return <path d="M14.5 20c0-6.5 4-9 9.5-9s9.5 2.5 9.5 9c-2.5-4-6-5-9.5-5s-7 1-9.5 5Z" fill={w} />;
    case 'bob':
      return <path d="M15 19.5c0-6.5 4-9 9-9s9 2.5 9 9c-5-1.6-13-1.6-18 0Z" fill={w} />;
    case 'keriting':
      return (
        <g fill={w}>
          {[[16, 15], [19.5, 11.5], [24, 10], [28.5, 11.5], [32, 15], [14.6, 19.5], [33.4, 19.5], [21.5, 14], [26.5, 14]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4" />)}
        </g>
      );
    default:
      return null;
  }
}

export default function Wajah({ kunci, i = 0, className = '' }: { kunci: string; i?: number; className?: string }) {
  const g = WAJAH[wajahKe(kunci, i)];
  const id = `wajah-${wajahKe(kunci, i)}-${i}`;
  return (
    // the view is cropped round the head so the face fills the circle
    <svg viewBox="5 3 38 38" className={className} aria-hidden focusable="false">
      <defs>
        <clipPath id={`${id}-bulat`}><circle cx="24" cy="22" r="19" /></clipPath>
      </defs>
      <g clipPath={`url(#${id}-bulat)`}>
        <rect width="48" height="48" fill={g.latar} />
        {g.kerudung ? (
          <path d="M24 8.5c-10 0-12 8.5-12 15.5 0 7 1.5 12-4.5 24h33c-6-12-4.5-17-4.5-24 0-7-2-15.5-12-15.5Z" fill={g.kerudung} />
        ) : (
          <path d="M7 48c1-10 7.5-14 17-14s16 4 17 14Z" fill={g.baju} />
        )}
        {!g.kerudung && <rect x="20.5" y="28" width="7" height="7.5" rx="3" fill={g.kulit} />}
        {!g.kerudung && <rect x="20.5" y="28" width="7" height="3.5" rx="1.5" fill="#000" opacity=".08" />}
        {!g.kerudung && <RambutBelakang g={g} />}
        {!g.kerudung && <circle cx="14.6" cy="22.5" r="2.2" fill={g.kulit} />}
        {!g.kerudung && <circle cx="33.4" cy="22.5" r="2.2" fill={g.kulit} />}
        <ellipse cx="24" cy="21.5" rx={g.kerudung ? 8.3 : 9.4} ry={g.kerudung ? 9.6 : 10.4} fill={g.kulit} />
        {g.kerudung && <path d="M15.6 19.2c1.6-6.4 15.2-6.4 16.8 0-3.6-2.6-13.2-2.6-16.8 0Z" fill="#000" opacity=".12" />}
        {g.jenggot && <path d="M14.8 21.5c0 9.5 4.2 12.5 9.2 12.5s9.2-3 9.2-12.5c-1.6 4.6-4.4 6.6-9.2 6.6s-7.6-2-9.2-6.6Z" fill={g.warnaRambut} />}
        {!g.kerudung && <RambutDepan g={g} />}
        {g.topi && (
          <g>
            <path d="M15.5 14.5c0-6.5 3.6-8.6 8.5-8.6s8.5 2.1 8.5 8.6Z" fill={g.topi} />
            <rect x="15.5" y="11.6" width="17" height="2.4" fill={GELAP} opacity=".25" />
            <ellipse cx="24" cy="14.6" rx="13.5" ry="3" fill={g.topi} />
          </g>
        )}
        <circle cx="20.4" cy="22" r="1.15" fill={GELAP} />
        <circle cx="27.6" cy="22" r="1.15" fill={GELAP} />
        <circle cx="18.6" cy="25.4" r="1.6" fill="#f28b82" opacity=".35" />
        <circle cx="29.4" cy="25.4" r="1.6" fill="#f28b82" opacity=".35" />
        {g.kacamata && (
          <g fill="none" stroke={GELAP} strokeWidth="1">
            <circle cx="20.4" cy="22" r="2.9" />
            <circle cx="27.6" cy="22" r="2.9" />
            <path d="M23.3 22h1.4" />
          </g>
        )}
        <path d="M21.2 26.6q2.8 2.4 5.6 0" fill="none" stroke={g.jenggot ? '#f6e3d3' : GELAP} strokeWidth="1.3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
