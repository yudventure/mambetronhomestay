'use client';
// Row of photo cards that overlaps the bottom of the hero by 3.5rem. It scrolls sideways
// when there are more cards than fit, with arrow buttons beside it. The
// column on the right holds the section text.
import { useEffect, useRef, useState } from 'react';
import Ikon from './Ikon';

// A lone card spreads over the whole row, two share it, three or more show
// three at a time on wide screens and scroll.
function lebar(n: number) {
  if (n === 1) return 'w-full';
  if (n === 2) return 'w-[84%] sm:w-[calc((100%-1rem)/2)]';
  return 'w-[78%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]';
}

export default function GeserPondok({ kartu, samping, label }: {
  kartu: React.ReactNode[]; samping: React.ReactNode; label: { sebelum: string; berikut: string };
}) {
  const jalur = useRef<HTMLUListElement>(null);
  const [ujung, setUjung] = useState({ awal: true, akhir: true });

  useEffect(() => {
    const el = jalur.current;
    if (!el) return;
    const cek = () => setUjung({ awal: el.scrollLeft < 4, akhir: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
    cek();
    el.addEventListener('scroll', cek, { passive: true });
    window.addEventListener('resize', cek);
    return () => {
      el.removeEventListener('scroll', cek);
      window.removeEventListener('resize', cek);
    };
  }, []);

  const geser = (arah: number) => {
    const el = jalur.current;
    const li = el?.querySelector('li');
    if (!el || !li) return;
    el.scrollBy({ left: arah * (li.getBoundingClientRect().width + 16), behavior: 'smooth' });
  };
  const bisaGeser = !(ujung.awal && ujung.akhir);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15.5rem] lg:gap-10">
      <ul ref={jalur} className="tanpa-bilah -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-1 pb-3 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0">
        {kartu.map((x, i) => (
          <li key={i} className={`shrink-0 snap-start ${lebar(kartu.length)}`}>{x}</li>
        ))}
      </ul>
      {/* the side column starts just under the hero, below the arrows when there are any */}
      <div className={`relative ${bisaGeser ? 'lg:pt-[8.25rem]' : 'lg:pt-[5.5rem]'}`}>
        {bisaGeser && (
          <div className="mb-6 hidden gap-2 sm:flex lg:absolute lg:top-[4.5rem] lg:left-0 lg:mb-0">
            <button type="button" onClick={() => geser(-1)} disabled={ujung.awal} aria-label={label.sebelum}
              className="inline-flex size-11 items-center justify-center rounded-full bg-white text-laut shadow-lembut transition-opacity hover:bg-buih disabled:opacity-40">
              <Ikon nama="kiri" className="size-5" />
            </button>
            <button type="button" onClick={() => geser(1)} disabled={ujung.akhir} aria-label={label.berikut}
              className="inline-flex size-11 items-center justify-center rounded-full bg-white text-laut shadow-lembut transition-opacity hover:bg-buih disabled:opacity-40">
              <Ikon nama="kanan" className="size-5" />
            </button>
          </div>
        )}
        {samping}
      </div>
    </div>
  );
}
