// Counts a page view of the public site. Signed in operators, robots and
// browsers asking not to be tracked are not counted.
import { headers } from 'next/headers';
import { catatKunjungan, negaraDari } from '@/lib/statistik';
import { alamatPengunjung, sesiSah } from '@/lib/sesi';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const h = await headers();
    if (h.get('dnt') === '1' || h.get('sec-gpc') === '1' || (await sesiSah())) return new Response(null, { status: 204 });
    const isi = JSON.parse((await req.text()).slice(0, 1000) || '{}') as { jalur?: unknown };
    await catatKunjungan({
      ip: await alamatPengunjung(),
      ua: h.get('user-agent') ?? '',
      jalur: typeof isi.jalur === 'string' ? isi.jalur : '/',
      negara: negaraDari(h),
    });
  } catch (e) {
    console.error('[mambetron] kunjungan gagal dicatat', e);
  }
  return new Response(null, { status: 204 });
}
