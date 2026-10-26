'use client';
// Header shell. At the very top of the page the bar lies flat on the white
// background above the hero, and once the visitor scrolls it becomes a
// floating white pill. The pill itself is drawn by the inner bar in Kepala,
// this shell only places it. Both states have the same height, so the page
// does not jump when the header changes.
import { useEffect, useState } from 'react';

export default function BingkaiKepala({ children }: { children: React.ReactNode }) {
  const [atas, setAtas] = useState(true);

  useEffect(() => {
    const cek = () => setAtas(window.scrollY < 8);
    cek();
    window.addEventListener('scroll', cek, { passive: true });
    return () => window.removeEventListener('scroll', cek);
  }, []);

  return (
    <header data-datar={atas ? '' : undefined} className="group/kepala pointer-events-none sticky top-0 z-40 px-2 pt-2 sm:px-4 sm:pt-3">
      {children}
    </header>
  );
}
