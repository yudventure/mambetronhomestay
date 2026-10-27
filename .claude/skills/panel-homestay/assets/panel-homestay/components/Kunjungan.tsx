'use client';
// Tells the site a page was viewed, once per page. Sent with sendBeacon so
// it never slows the page down.
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Kunjungan() {
  const jalur = usePathname();
  useEffect(() => {
    const isi = JSON.stringify({ jalur });
    if (navigator.sendBeacon?.('/api/kunjungan', isi)) return;
    fetch('/api/kunjungan', { method: 'POST', body: isi, keepalive: true }).catch(() => {});
  }, [jalur]);
  return null;
}
