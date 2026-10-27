'use client';
// Copies a link, for the export links a booking site needs. Falls back to
// selecting the text when the browser refuses the clipboard.
import { useRef, useState } from 'react';
import Ikon from '../Ikon';

export default function TombolSalin({ teks, label }: { teks: string; label: string }) {
  const kotak = useRef<HTMLInputElement>(null);
  const [tersalin, setTersalin] = useState(false);
  const salin = async () => {
    try {
      await navigator.clipboard.writeText(teks);
    } catch {
      kotak.current?.select();
      document.execCommand?.('copy');
    }
    setTersalin(true);
    setTimeout(() => setTersalin(false), 2500);
  };
  return (
    <div className="flex min-w-0 gap-2">
      <input ref={kotak} readOnly value={teks} aria-label={label} onFocus={(e) => e.currentTarget.select()}
        className="isian !min-h-10 min-w-0 flex-1 !rounded-full !py-2 font-mono !text-[0.8125rem]" />
      <button type="button" onClick={salin} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-panel-utama px-4 text-sm font-semibold text-white hover:bg-panel-utama-2">
        <Ikon nama={tersalin ? 'centang' : 'salin'} className="size-4" /> {tersalin ? 'Tersalin' : 'Salin'}
      </button>
    </div>
  );
}
