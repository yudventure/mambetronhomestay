'use client';
// Header shell. On the home page it floats over the hero photo, clear with
// white links, and becomes a floating white pill once the visitor scrolls.
// Elsewhere the pill sticks to the top from the start. The pill itself is
// drawn by the inner bar in Kepala, this shell only places it.
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BingkaiKepala({ children }: { children: React.ReactNode }) {
  const beranda = usePathname() === '/';
  const [atas, setAtas] = useState(true);

  useEffect(() => {
    if (!beranda) return;
    const cek = () => setAtas(window.scrollY < 40);
    cek();
    window.addEventListener('scroll', cek, { passive: true });
    return () => window.removeEventListener('scroll', cek);
  }, [beranda]);

  const bening = beranda && atas;
  const posisi = beranda ? 'fixed inset-x-0 top-0' : 'sticky top-0';
  const jarak = bening ? 'px-3 pt-3 sm:px-4 sm:pt-4' : 'px-2 pt-2 sm:px-4 sm:pt-3';
  return (
    <header data-bening={bening ? '' : undefined} className={`group/kepala pointer-events-none z-40 transition-[padding] duration-300 ${posisi} ${jarak}`}>
      {children}
    </header>
  );
}
