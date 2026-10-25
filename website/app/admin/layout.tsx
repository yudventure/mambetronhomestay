import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Panel pengelola', template: '%s | Panel Mambetron' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-buih">{children}</div>;
}
