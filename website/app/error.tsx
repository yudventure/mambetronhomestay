'use client';
import { useEffect } from 'react';
import { KAMUS } from '@/lib/kamus';

export default function Galat({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  const b = typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'id';
  const k = KAMUS[b].galatHalaman;
  return (
    <main className="flex min-h-[70svh] items-center justify-center bg-buih px-4 py-16">
      <div className="max-w-md text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/merek/logo-utama.svg" alt="" aria-hidden width={134} height={112} className="mx-auto h-32 w-auto" />
        <h1 className="mt-6 text-3xl">{k.judul}</h1>
        <p className="mt-3 text-abu">{k.teks}</p>
        <button type="button" onClick={reset} className="tombol mt-8">{k.ulang}</button>
      </div>
    </main>
  );
}
