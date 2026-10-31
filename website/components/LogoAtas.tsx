'use client';
// The logo in the header. On the home page it glides back to the top, since
// a link to the page the guest is already on would do nothing. Elsewhere it
// opens the home page, which starts at the top. A click that opens a new tab
// or window is left to the browser.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export default function LogoAtas({ label, children }: { label: string; children: ReactNode }) {
  const jalur = usePathname();
  return (
    <Link
      href="/"
      className="mr-auto shrink-0"
      aria-label={label}
      onClick={(e) => {
        if (jalur !== '/' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        const tenang = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: tenang ? 'auto' : 'smooth' });
        // a section link such as /#tentang leaves its anchor in the address
        if (window.location.hash) history.replaceState(history.state, '', '/');
      }}
    >
      {children}
    </Link>
  );
}
