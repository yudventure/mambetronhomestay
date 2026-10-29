// Opens the Midtrans payment window for a booking. Needs the secret from the
// guest's booking link, and answers with the Snap token, the client key and
// the address of snap.js, so the window opens over the booking page.
import { NextResponse } from 'next/server';
import { asalPermintaan } from '@/lib/asal';
import { siapkanBayar } from '@/lib/bayar-server';
import { ambilSitus, pesananDariKode } from '@/lib/data';
import { GalatMidtrans, alamatSnapJs, bacaKonfigMidtrans } from '@/lib/midtrans';
import { bolehKirim, catatKirim, tokenCocok } from '@/lib/pesan';

export const dynamic = 'force-dynamic';
const jawab = (o: unknown, status = 200) => NextResponse.json(o, { status, headers: { 'cache-control': 'no-store' } });

export async function POST(req: Request) {
  const o = (await req.json().catch(() => null)) as { kode?: unknown; t?: unknown } | null;
  const kode = typeof o?.kode === 'string' ? o.kode.trim().toUpperCase().slice(0, 16) : '';
  const t = typeof o?.t === 'string' ? o.t.slice(0, 64) : '';
  if (!kode || !t) return jawab({ galat: 'tidakAda' }, 404);
  // a handful of openings per booking is plenty, more is a script
  if (!bolehKirim(`bayar:${kode}`, 20)) return jawab({ galat: 'terlaluSering' }, 429);
  catatKirim(`bayar:${kode}`);
  const p = await pesananDariKode(kode).catch(() => null);
  if (!p || !tokenCocok(t, p.token)) return jawab({ galat: 'tidakAda' }, 404);
  const k = await bacaKonfigMidtrans();
  if (!k || !k.tampil) return jawab({ galat: 'belumAktif' }, 409);
  try {
    const situs = await ambilSitus();
    const token = await siapkanBayar(k, p, `${asalPermintaan(req)}/pesanan/${p.kode}?t=${p.token}`, situs.nama);
    return jawab({ token, client: k.client, snap: alamatSnapJs(k.produksi) });
  } catch (e) {
    if (e instanceof GalatMidtrans) return jawab({ galat: e.kode || 'midtrans' }, e.kode === 'tidakPerlu' ? 409 : 502);
    console.error('[mambetron] buka pembayaran', e);
    return jawab({ galat: 'server' }, 500);
  }
}
