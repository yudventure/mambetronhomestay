// Payment notifications from Midtrans (Payment Notification URL in the
// Midtrans Dashboard). Trusted only when signature_key matches the site's
// Server Key. The state is then asked again straight from Midtrans, so the
// latest state is applied whatever order the notifications arrive in.
//
// Notifications for unknown orders are answered 200 so Midtrans does not
// keep repeating them, a wrong signature gets 401. Each one is noted for the
// panel's Pembayaran page.
import { NextResponse } from 'next/server';
import { asalPermintaan } from '@/lib/asal';
import { kabariHasil, kodeDariOrder, terapkanStatus } from '@/lib/bayar-server';
import { GalatMidtrans, bacaKonfigMidtrans, catatKabarMidtrans, statusDari, statusTransaksi, tandaTanganSah } from '@/lib/midtrans';

export const dynamic = 'force-dynamic';
const jawab = (o: unknown, status = 200) => NextResponse.json(o, { status, headers: { 'cache-control': 'no-store' } });

// Opened in a browser, shows that this address exists on the installed version.
export function GET() {
  return jawab({ ok: true, layanan: 'kabar pembayaran Mambetron Homestay', cara: 'POST dari Midtrans' });
}

export async function POST(req: Request) {
  const n = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!n || typeof n !== 'object' || typeof n.order_id !== 'string') return jawab({ galat: 'Isi kabar tidak dikenal.' }, 400);
  const orderId = n.order_id.slice(0, 60);
  const k = await bacaKonfigMidtrans();
  if (!k) {
    await catatKabarMidtrans({ orderId, hasil: 'belumDipasang' });
    return jawab({ ok: false, alasan: 'belumDipasang' });
  }
  if (!tandaTanganSah(n, k.server)) {
    await catatKabarMidtrans({ orderId, hasil: 'tandaTanganSalah' });
    return jawab({ galat: 'Tanda tangan tidak sah.' }, 401);
  }
  // not a booking of this site, such as the test from the Dashboard, answered at once
  if (!kodeDariOrder(orderId)) {
    await catatKabarMidtrans({ orderId, hasil: 'bukanPesanan' });
    return jawab({ ok: true, diterapkan: false });
  }
  let st = statusDari(n);
  try {
    const langsung = await statusTransaksi(k, orderId);
    if (langsung.ada) st = langsung;
  } catch (e) {
    // Midtrans out of reach, the signed notification itself is used
    if (!(e instanceof GalatMidtrans)) console.error('[mambetron] status midtrans', e);
  }
  const h = await terapkanStatus(orderId, st);
  await catatKabarMidtrans({ orderId, hasil: h.hasil });
  await kabariHasil(orderId, h, asalPermintaan(req));
  return jawab({ ok: true, diterapkan: h.hasil === 'diterapkan' });
}
