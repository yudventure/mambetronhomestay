'use client';
// Header shell. On the home page it floats over the hero photo, clear with
// white links, and turns white once the visitor scrolls. Elsewhere it is a
// plain white bar that sticks to the top.
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
  const posisi = beranda ? 'fixed inset-x-0 top-0 px-3 sm:px-4' : 'sticky top-0';
  const latar = bening ? 'bg-transparent pt-3 sm:pt-4' : 'bg-white shadow-tipis';
  return (
    <header data-bening={bening ? '' : undefined} className={`group/kepala z-40 transition-[background-color,box-shadow,padding] duration-300 ${posisi} ${latar}`}>
      {children}
    </header>
  );
}
