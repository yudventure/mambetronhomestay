'use client';
// Client hooks shared by sheets and pop-ups.
import { startTransition, useEffect, type FormEvent, type RefObject } from 'react';

// Freeze the page behind an open sheet. Pinning the body with position fixed
// is the only lock that holds on iOS Safari, overflow hidden alone does not.
export function useKunciGulir(aktif: boolean) {
  useEffect(() => {
    if (!aktif) return;
    const y = window.scrollY;
    const s = document.body.style;
    const lama = { position: s.position, top: s.top, left: s.left, right: s.right, width: s.width };
    s.position = 'fixed';
    s.top = `-${y}px`;
    s.left = '0';
    s.right = '0';
    s.width = '100%';
    return () => {
      Object.assign(s, lama);
      const html = document.documentElement;
      const gulir = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      html.style.scrollBehavior = gulir;
    };
  }, [aktif]);
}

// Close when the visitor taps outside the panel or presses Escape. The
// listener sits on the document, not on a backdrop element. It waits for the
// full click, so the tap that closes the sheet never lands on a link behind it.
export function useTutupLuar(aktif: boolean, tutup: () => void, dalam: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!aktif) return;
    const ketuk = (e: MouseEvent) => {
      const t = e.target as Node;
      if (dalam.some((r) => r.current?.contains(t))) return;
      e.preventDefault();
      e.stopPropagation();
      tutup();
    };
    const tombol = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tutup();
    };
    document.addEventListener('click', ketuk, true);
    document.addEventListener('keydown', tombol);
    return () => {
      document.removeEventListener('click', ketuk, true);
      document.removeEventListener('keydown', tombol);
    };
  }, [aktif, tutup, dalam]);
}

// Submit a form through a useActionState action without React clearing the
// fields afterwards, so a validation error never wipes what was typed.
export function kirimTanpaReset(aksi: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => aksi(fd));
  };
}
