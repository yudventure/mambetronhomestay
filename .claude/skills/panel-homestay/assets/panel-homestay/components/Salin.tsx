'use client';
import { useState } from 'react';
import Ikon from './Ikon';

export default function Salin({ teks, label, sudah }: { teks: string; label: string; sudah: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="tombol tombol-putih tombol-kecil" onClick={async () => {
      try {
        await navigator.clipboard.writeText(teks);
        setOk(true);
        setTimeout(() => setOk(false), 1800);
      } catch {
        setOk(false);
      }
    }}>
      <Ikon nama={ok ? 'centang' : 'salin'} className="size-4" /> {ok ? sudah : label}
    </button>
  );
}
