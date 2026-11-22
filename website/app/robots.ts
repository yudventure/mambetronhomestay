// robots.txt. Every page may be crawled, and pages that should stay out of
// Google say so themselves with noindex (the panel, the guest booking
// pages, the booking form, every page while developer mode is on). A page
// blocked here could still be listed from links without its noindex being
// read. Only the switches and feeds that are not pages are left out.
import type { MetadataRoute } from 'next';
import { asalHalaman } from '@/lib/asal';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const dasar = await asalHalaman();
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/ical/', '/bahasa', '/uang'] }],
    ...(dasar ? { sitemap: `${dasar}/sitemap.xml` } : {}),
  };
}
