// Connection to Midtrans: the Snap payment window, transaction status, and
// the signature on payment notifications. The same approach as DAMPIER
// (lib/server/midtrans.ts there).
//
// The Server Key lives in its own pengaturan row ('midtrans'), never in the
// site settings that pages read, and only its last four characters ever
// reach the panel. MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY in the
// environment win over the panel. Sandbox or production is read from the
// keys themselves, sandbox keys start with SB-.
import { createHash, timingSafeEqual } from 'node:crypto';
import { jalankan, satu } from './db';
import { dbDiatur } from './env';

export type KonfigMidtrans = { server: string; client: string; produksi: boolean; sumber: 'env' | 'panel'; tampil: boolean };
export type HasilKabar = 'diterapkan' | 'tidakBerubah' | 'bukanPesanan' | 'tandaTanganSalah' | 'belumDipasang';
export type KabarTerakhir = { waktu: string; orderId: string; hasil: HasilKabar };

export const bentukServer = (v: string) => /^(SB-)?Mid-server-[A-Za-z0-9_-]{8,120}$/.test(v);
export const bentukClient = (v: string) => /^(SB-)?Mid-client-[A-Za-z0-9_-]{8,120}$/.test(v);
const produksiDari = (kunci: string) => !kunci.startsWith('SB-');
const teks = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

// Midtrans addresses. Only a local test points them at a stand-in.
function dasar(produksi: boolean) {
  const snap = process.env.MIDTRANS_SNAP_DASAR?.trim() || (produksi ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com');
  const api = process.env.MIDTRANS_API_DASAR?.trim() || (produksi ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com');
  return { snap: snap.replace(/\/+$/, ''), api: api.replace(/\/+$/, '') };
}
export const alamatSnapJs = (produksi: boolean) => `${dasar(produksi).snap}/snap/snap.js`;

async function bacaBaris<T>(kunci: string): Promise<Partial<T>> {
  if (!dbDiatur()) return {};
  try {
    const r = await satu<{ nilai: string }>('SELECT nilai FROM pengaturan WHERE kunci = ?', [kunci]);
    return r ? (JSON.parse(r.nilai) as Partial<T>) : {};
  } catch {
    return {};
  }
}
const tulisBaris = (kunci: string, nilai: unknown) =>
  jalankan('INSERT INTO pengaturan (kunci, nilai) VALUES (?, ?) ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)', [kunci, JSON.stringify(nilai)]);

type Simpanan = { server: string; client: string; tampil: boolean; diuji: string };

// Both keys from one place and one environment, or nothing.
export async function bacaKonfigMidtrans(): Promise<KonfigMidtrans | null> {
  const o = await bacaBaris<Simpanan>('midtrans');
  const tampil = o.tampil !== false;
  const envServer = teks(process.env.MIDTRANS_SERVER_KEY), envClient = teks(process.env.MIDTRANS_CLIENT_KEY);
  const [server, client, sumber] = envServer ? [envServer, envClient, 'env' as const] : [teks(o.server), teks(o.client), 'panel' as const];
  if (!bentukServer(server) || !bentukClient(client) || produksiDari(server) !== produksiDari(client)) return null;
  return { server, client, produksi: produksiDari(server), sumber, tampil };
}

export type StatusMidtrans = {
  aktif: boolean;
  sumber: 'env' | 'panel' | null;
  produksi: boolean;
  akhiran: string;
  client: string;
  tampil: boolean;
  diuji: string;
  kabar: KabarTerakhir | null;
  // keys in the environment that are incomplete or do not match each other
  envSalah: boolean;
};

export async function statusMidtrans(): Promise<StatusMidtrans> {
  const [k, o, kb] = await Promise.all([bacaKonfigMidtrans(), bacaBaris<Simpanan>('midtrans'), bacaBaris<KabarTerakhir>('midtrans-kabar')]);
  const kabar = kb.waktu && kb.hasil ? { waktu: kb.waktu, orderId: teks(kb.orderId).slice(0, 80), hasil: kb.hasil } : null;
  return {
    aktif: !!k, sumber: k?.sumber ?? null, produksi: k?.produksi ?? false, akhiran: k ? k.server.slice(-4) : '',
    client: k?.client ?? '', tampil: o.tampil !== false, diuji: teks(o.diuji), kabar,
    envSalah: !!teks(process.env.MIDTRANS_SERVER_KEY) && !k,
  };
}

export async function simpanKunciMidtrans(server: string, client: string) {
  const o = await bacaBaris<Simpanan>('midtrans');
  await tulisBaris('midtrans', { server, client, tampil: o.tampil !== false, diuji: new Date().toISOString() });
}
export async function hapusKunciMidtrans() {
  const o = await bacaBaris<Simpanan>('midtrans');
  await tulisBaris('midtrans', { tampil: o.tampil !== false });
}
export async function aturTampilMidtrans(tampil: boolean) {
  const o = await bacaBaris<Simpanan>('midtrans');
  await tulisBaris('midtrans', { ...o, tampil });
}

let salahTercatat = 0;
// The last notification for the panel. Ones with a wrong signature are
// written at most every ten seconds, so a flood of fake ones cannot keep
// writing to the database.
export async function catatKabarMidtrans(k: Omit<KabarTerakhir, 'waktu'>) {
  if (k.hasil === 'tandaTanganSalah') {
    if (Date.now() - salahTercatat < 10_000) return;
    salahTercatat = Date.now();
  }
  await tulisBaris('midtrans-kabar', { ...k, orderId: k.orderId.slice(0, 80), waktu: new Date().toISOString() }).catch((e) => console.error('[mambetron] catat kabar midtrans', e));
}

// An error whose message is safe and useful to show the owner or the guest.
export class GalatMidtrans extends Error {
  constructor(pesan: string, readonly kode = '') {
    super(pesan);
  }
}

async function panggil(server: string, url: string, init: RequestInit = {}) {
  let r: Response;
  try {
    r = await fetch(url, {
      ...init,
      headers: {
        // Midtrans basic auth, the Server Key as user name and an empty password
        authorization: `Basic ${Buffer.from(`${server}:`).toString('base64')}`,
        accept: 'application/json',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
      },
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    });
  } catch {
    throw new GalatMidtrans('Server situs tidak bisa menghubungi Midtrans. Coba lagi sebentar lagi.');
  }
  const o = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (r.status === 401 || String(o.status_code ?? '') === '401') throw new GalatMidtrans('Server Key ditolak Midtrans. Salin lagi dari Dashboard Midtrans, menu Settings, Access Keys.', '401');
  return { http: r.status, o };
}

// Tests a Server Key without making a transaction, by asking for an order
// that cannot exist. A good key gets "not found", a wrong one is refused.
export async function ujiKunciMidtrans(server: string) {
  await panggil(server, `${dasar(produksiDari(server)).api}/v2/mambetron-uji-kunci-${Date.now()}/status`);
}

export type IsiTransaksi = {
  orderId: string;
  jumlah: number;
  nama: string;
  tamu: { nama: string; telepon?: string; email?: string };
  // where the guest lands after a payment method that leaves the page
  selesai: string;
  batasJam: number;
};

// A Snap transaction. Returns the token the payment window opens with.
export async function buatTransaksi(k: KonfigMidtrans, t: IsiTransaksi): Promise<string> {
  const nama = t.nama.replace(/\s+/g, ' ').trim().slice(0, 50);
  const { http, o } = await panggil(k.server, `${dasar(k.produksi).snap}/snap/v1/transactions`, {
    method: 'POST',
    body: JSON.stringify({
      transaction_details: { order_id: t.orderId, gross_amount: t.jumlah },
      item_details: [{ id: t.orderId.slice(0, 50), price: t.jumlah, quantity: 1, name: nama }],
      customer_details: {
        first_name: t.tamu.nama.slice(0, 255),
        ...(t.tamu.telepon ? { phone: t.tamu.telepon.slice(0, 40) } : {}),
        ...(t.tamu.email ? { email: t.tamu.email } : {}),
      },
      callbacks: { finish: t.selesai },
      expiry: { unit: 'hours', duration: Math.max(1, Math.round(t.batasJam)) },
    }),
  });
  const token = teks(o.token);
  if (http >= 300 || !token) {
    const pesan = Array.isArray(o.error_messages) ? (o.error_messages as unknown[]).map(String).join(' ') : '';
    console.error('[mambetron] midtrans snap', http, pesan);
    throw new GalatMidtrans('Halaman pembayaran belum bisa dibuka.');
  }
  return token;
}

export type StatusTransaksi = { ada: boolean; status: string; fraud: string; metode: string; saluran?: string; jumlah: number };

// The virtual account bank or QRIS issuer of a transaction, short and lower case.
export function saluranDari(o: Record<string, unknown>): string | undefined {
  const va = Array.isArray(o.va_numbers) ? (o.va_numbers[0] as Record<string, unknown> | undefined) : undefined;
  const s = teks(va?.bank) || (teks(o.permata_va_number) ? 'permata' : '') || (teks(o.payment_type) === 'echannel' ? 'mandiri' : '')
    || (teks(o.payment_type) === 'qris' ? teks(o.issuer) || teks(o.acquirer) : '');
  const bersih = s.toLowerCase().replace(/[^a-z0-9 _-]/g, '').slice(0, 24);
  return bersih || undefined;
}

export const statusDari = (o: Record<string, unknown>): StatusTransaksi => {
  const saluran = saluranDari(o);
  return {
    ada: !!o.transaction_status && String(o.status_code ?? '') !== '404',
    status: teks(o.transaction_status), fraud: teks(o.fraud_status), metode: teks(o.payment_type),
    ...(saluran ? { saluran } : {}),
    jumlah: Math.round(Number(o.gross_amount) || 0),
  };
};

// The state of an order straight from Midtrans.
export async function statusTransaksi(k: KonfigMidtrans, orderId: string): Promise<StatusTransaksi> {
  const { o } = await panggil(k.server, `${dasar(k.produksi).api}/v2/${encodeURIComponent(orderId)}/status`);
  return statusDari(o);
}

// A notification really comes from Midtrans when signature_key is the
// SHA512 of order_id, status_code, gross_amount and the Server Key joined.
// Compared in constant time.
export function tandaTanganSah(n: Record<string, unknown>, server: string) {
  const tanda = teks(n.signature_key).toLowerCase();
  if (!tanda || !server) return false;
  const benar = createHash('sha512').update(`${teks(n.order_id)}${teks(n.status_code)}${teks(n.gross_amount)}${server}`).digest('hex');
  const a = Buffer.from(benar), b = Buffer.from(tanda);
  return a.length === b.length && timingSafeEqual(a, b);
}
