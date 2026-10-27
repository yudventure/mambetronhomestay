import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Panel pengelola', template: '%s | Panel Mambetron' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="panel min-h-svh bg-panel-latar">{children}</div>;
}
