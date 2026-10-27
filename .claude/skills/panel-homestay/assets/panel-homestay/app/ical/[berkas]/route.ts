// Export calendar for one sync link, /ical/<token>.ics. Booking sites and
// travel agents read it to see which nights are taken. It shows only the
// nights, never guest names.
import { feedSambungan } from '@/lib/sinkron';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: Promise<{ berkas: string }> }) {
  const { berkas } = await params;
  const token = berkas.replace(/\.ics$/i, '').toLowerCase();
  let isi: string | null = null;
  try {
    isi = await feedSambungan(token);
  } catch (e) {
    console.error('[mambetron] ekspor kalender', e);
    return new Response('Kalender sedang tidak bisa dibuat.', { status: 503, headers: { 'retry-after': '600' } });
  }
  if (!isi) return new Response('Tautan kalender tidak dikenal.', { status: 404 });
  return new Response(isi, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `inline; filename="${token.slice(0, 8)}.ics"`,
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
    },
  });
}
