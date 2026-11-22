// sitemap.xml for Google Search Console (lib/seo.ts). The public pages only,
// one address each, since the language comes from a cookie. The bungalow
// list joins once there is more than one bungalow, while one bungalow
// sends /kamar straight to its page. The booking form, the guest booking
// pages and the panel stay out.
import type { MetadataRoute } from 'next';
import { asalHalaman } from '@/lib/asal';
import { daftarKamar } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dasar = await asalHalaman();
  const kamar = await daftarKamar().catch(() => []);
  const jalur = [
    { j: '/', prioritas: 1 },
    ...(kamar.length > 1 ? [{ j: '/kamar', prioritas: 0.8 }] : []),
    ...kamar.map((k) => ({ j: `/kamar/${k.slug}`, prioritas: 0.9 })),
    { j: '/ketentuan', prioritas: 0.4 },
    { j: '/syarat-ketentuan', prioritas: 0.3 },
    { j: '/kebijakan-privasi', prioritas: 0.3 },
  ];
  return jalur.map((x) => ({ url: `${dasar}${x.j}`, changeFrequency: x.j === '/' || x.j.startsWith('/kamar') ? 'weekly' : 'monthly', priority: x.prioritas }));
}
