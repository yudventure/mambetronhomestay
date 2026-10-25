import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus } from '@/lib/data';
import { alamatSitus } from '@/lib/env';
import './globals.css';

const fredoka = localFont({
  src: './fonts/fredoka-latin.woff2',
  weight: '300 700',
  variable: '--font-fredoka',
  display: 'swap',
});

const jakarta = localFont({
  src: [
    { path: './fonts/plus-jakarta-sans-latin.woff2', style: 'normal', weight: '200 800' },
    { path: './fonts/plus-jakarta-sans-italic-latin.woff2', style: 'italic', weight: '200 800' },
  ],
  variable: '--font-jakarta',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const [s, b] = await Promise.all([ambilSitus(), bahasaAktif()]);
  const judul = s.seoJudul[b] || s.nama;
  const deskripsi = s.seoDeskripsi[b];
  const dasar = alamatSitus();
  return {
    ...(dasar ? { metadataBase: new URL(dasar) } : {}),
    title: { default: judul, template: `%s | ${s.nama}` },
    description: deskripsi,
    applicationName: s.nama,
    openGraph: {
      title: judul,
      description: deskripsi,
      siteName: s.nama,
      type: 'website',
      locale: b === 'en' ? 'en_US' : 'id_ID',
      images: [{ url: '/merek/og.png', width: 1200, height: 630, alt: s.nama }],
    },
    twitter: { card: 'summary_large_image', title: judul, description: deskripsi, images: ['/merek/og.png'] },
    manifest: '/manifest.webmanifest',
  };
}

export const viewport: Viewport = {
  themeColor: '#0b3b4a',
  width: 'device-width',
  initialScale: 1,
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const b = await bahasaAktif();
  return (
    <html lang={b} className={`${fredoka.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
