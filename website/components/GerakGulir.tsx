'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Gentle motion while the guest scrolls, the owner's request, November 2026:
// "buatkan scroll effect yang profesional sehingga lebih enak diliat".
//
// Blocks marked data-muncul, and each child of a list marked
// data-muncul-anak, rise and fade in once as they come into view, the
// children of a list one after another. Blocks already on screen when the
// page opens stay as they are, so nothing blinks on load. Once a block has
// come in its classes are removed, so it keeps no transform: a fixed panel
// inside it (the photo viewer, the DAMPIER sheet) is never boxed in, and its
// own hover transitions come back.
//
// The hero photo drifts a little slower than the page (data-gulir-lambat),
// only while the hero is on screen.
//
// Nothing moves when the device asks for reduced motion, and without
// JavaScript every block simply shows.
export default function GerakGulir() {
  const jalur = usePathname();

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    document.querySelectorAll<HTMLElement>('[data-muncul-anak]').forEach((w) => {
      Array.from(w.children).forEach((c, i) => (c as HTMLElement).style.setProperty('--muncul-urut', String(i % 6)));
    });
    const semua = Array.from(document.querySelectorAll<HTMLElement>('[data-muncul], [data-muncul-anak] > *'));
    const tinggi = window.innerHeight;
    const selesai = (el: HTMLElement) => {
      el.classList.remove('siap-muncul', 'tampak');
      el.style.removeProperty('--muncul-urut');
    };
    const nanti = semua.filter((el) => {
      if (el.dataset.sudahMuncul) return false;
      const r = el.getBoundingClientRect();
      // on screen already, or hidden (a closed list, a tab): shown as it is
      if ((r.top < tinggi * 0.92 && r.bottom > 0) || (!r.width && !r.height)) {
        el.dataset.sudahMuncul = '1';
        return false;
      }
      return true;
    });
    for (const el of nanti) el.classList.add('siap-muncul');
    const io = new IntersectionObserver((entri) => {
      for (const e of entri) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        el.dataset.sudahMuncul = '1';
        el.classList.add('tampak');
        const urut = Number(el.style.getPropertyValue('--muncul-urut')) || 0;
        // the classes go once the rise is over (0.8 s after its turn in the list)
        window.setTimeout(() => selesai(el), 1100 + urut * 90);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    for (const el of nanti) io.observe(el);
    return () => {
      io.disconnect();
      for (const el of nanti) selesai(el);
    };
  }, [jalur]);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lambat = Array.from(document.querySelectorAll<HTMLElement>('[data-gulir-lambat]'));
    if (!lambat.length) return;
    let bingkai = 0;
    const geser = () => {
      bingkai = 0;
      for (const el of lambat) {
        const wadah = el.closest('section')?.getBoundingClientRect();
        if (!wadah || wadah.bottom < 0 || wadah.top > window.innerHeight) continue;
        // a quarter of the distance scrolled past the top of the hero, never above it
        el.style.translate = `0 ${Math.max(0, -wadah.top) * 0.25}px`;
      }
    };
    const minta = () => { if (!bingkai) bingkai = requestAnimationFrame(geser); };
    geser();
    window.addEventListener('scroll', minta, { passive: true });
    window.addEventListener('resize', minta);
    return () => {
      window.removeEventListener('scroll', minta);
      window.removeEventListener('resize', minta);
      if (bingkai) cancelAnimationFrame(bingkai);
      for (const el of lambat) el.style.translate = '';
    };
  }, [jalur]);

  return null;
}
