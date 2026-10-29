// Checks a booking's payments with Midtrans after the guest closes the
// payment window, so the page shows the result even before Midtrans sends
// its notification.
import { NextResponse } from 'next/server';
import { asalPermintaan } from '@/lib/asal';
import { cekBayar, kabariHasil } from '@/lib/bayar-server';
import { pesananDariKode } from '@/lib/data';
import { GalatMidtrans, bacaKonfigMidtrans } from '@/lib/midtrans';
import { bolehKirim, catatKirim, tokenCocok } from '@/lib/pesan';

export const dynamic = 'force-dynamic';
const jawab = (o: unknown, status = 200) => NextResponse.json(o, { status, headers: { 'cache-control': 'no-store' } });

export async function POST(req: Request) {
  const o = (await req.json().catch(() => null)) as { kode?: unknown; t?: unknown } | null;
  const kode = typeof o?.kode === 'string' ? o.kode.trim().toUpperCase().slice(0, 16) : '';
  const t = typeof o?.t === 'string' ? o.t.slice(0, 64) : '';
  if (!kode || !t) return jawab({ galat: 'tidakAda' }, 404);
  if (!bolehKirim(`cek:${kode}`, 60)) return jawab({ galat: 'terlaluSering' }, 429);
  catatKirim(`cek:${kode}`);
  const p = await pesananDariKode(kode).catch(() => null);
  if (!p || !tokenCocok(t, p.token)) return jawab({ galat: 'tidakAda' }, 404);
  const k = await bacaKonfigMidtrans();
  if (!k) return jawab({ status: p.status, berubah: false });
  let berubah = false;
  try {
    const asal = asalPermintaan(req);
    for (const h of await cekBayar(k, p)) {
      berubah ||= h.hasil === 'diterapkan';
      await kabariHasil(h.orderId, h, asal);
    }
  } catch (e) {
    if (!(e instanceof GalatMidtrans)) console.error('[mambetron] cek pembayaran', e);
  }
  const baru = await pesananDariKode(kode).catch(() => null);
  return jawab({ status: baru?.status ?? p.status, berubah });
}
