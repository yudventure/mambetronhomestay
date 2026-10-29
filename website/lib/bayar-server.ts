// Online payment for a booking: opening the Midtrans payment window and
// applying what Midtrans reports. The booking row is locked while it
// changes, so the notification and the guest's own check arriving together
// add the payment only once.
import { kabariDampier } from './dampier';
import { ambilSitus, pesananDariKode } from './data';
import { transaksi, type Baris } from './db';
import { bacaBayarOnline, namaMetode, sudahMasuk, sudahTutup, tagihanOnline, tokenMasihBisa } from './bayar';
import { GalatMidtrans, buatTransaksi, statusTransaksi, type KonfigMidtrans, type StatusTransaksi } from './midtrans';
import type { BayarOnline, Pesanan, StatusPesanan } from './jenis';
import { surelBayarMasuk } from './surel';

// Booking code from an order id such as MB49PG9F-2.
export const kodeDariOrder = (orderId: string) => /^([A-Z0-9]{4,16})-\d{1,4}$/.exec(orderId)?.[1] ?? null;

// How long a guest has to finish a payment method such as a virtual account.
const BATAS_JAM = 24;

// The Snap token for the amount still due. A token that can still be paid
// is reused, so reopening the window shows the same virtual account.
export async function siapkanBayar(k: KonfigMidtrans, p: Pesanan, selesai: string, namaSitus: string): Promise<string> {
  return transaksi(async (c) => {
    const [[r]] = await c.query<Baris[]>('SELECT dp, dibayar, status, bayar_online FROM pesanan WHERE id = ? FOR UPDATE', [p.id]);
    if (!r) throw new GalatMidtrans('Pesanan tidak ditemukan.', 'tidakAda');
    const jumlah = tagihanOnline({ dp: r.dp, dibayar: r.dibayar, status: r.status });
    if (jumlah <= 0) throw new GalatMidtrans('Pesanan ini tidak menunggu pembayaran.', 'tidakPerlu');
    const b = bacaBayarOnline(r.bayar_online);
    if (b && tokenMasihBisa(b, jumlah)) return b.token;
    const n = (b?.n ?? 0) + 1;
    const orderId = `${p.kode}-${n}`;
    const token = await buatTransaksi(k, {
      orderId, jumlah, nama: `${namaSitus} ${p.kode}`, selesai, batasJam: BATAS_JAM,
      tamu: { nama: p.nama, telepon: p.telepon, email: p.email },
    });
    const baru: BayarOnline = { n, token, coba: [...(b?.coba ?? []), { orderId, jumlah, dibuat: new Date().toISOString(), status: '', metode: '' }].slice(-20) };
    await c.query('UPDATE pesanan SET bayar_online = ? WHERE id = ?', [JSON.stringify(baru), p.id]);
    return token;
  });
}

export type HasilTerap = {
  hasil: 'diterapkan' | 'tidakBerubah' | 'bukanPesanan';
  // the money of this transaction was added to the booking just now
  masukBaru: boolean;
  // Midtrans reports a different amount than this transaction was opened with
  jumlahBeda: boolean;
};

// Writes the latest Midtrans state of one transaction to its booking.
export async function terapkanStatus(orderId: string, st: StatusTransaksi): Promise<HasilTerap> {
  const kode = kodeDariOrder(orderId);
  const tidak: HasilTerap = { hasil: 'bukanPesanan', masukBaru: false, jumlahBeda: false };
  if (!kode) return tidak;
  return transaksi(async (c) => {
    const [[r]] = await c.query<Baris[]>('SELECT id, total, dibayar, status, bayar_online FROM pesanan WHERE kode = ? FOR UPDATE', [kode]);
    const b = bacaBayarOnline(r?.bayar_online);
    const coba = b?.coba.find((x) => x.orderId === orderId);
    if (!r || !b || !coba) return tidak;
    const masuk = sudahMasuk(st.status, st.fraud);
    const sama = coba.status === st.status && coba.metode === st.metode && (coba.saluran ?? '') === (st.saluran ?? '');
    if (sama && (!masuk || coba.masuk)) return { hasil: 'tidakBerubah', masukBaru: false, jumlahBeda: false };
    coba.status = st.status;
    coba.metode = st.metode;
    if (st.saluran) coba.saluran = st.saluran;
    coba.waktu = new Date().toISOString();
    if (masuk && !coba.masuk) {
      if (st.jumlah !== coba.jumlah) {
        console.error('[mambetron] jumlah midtrans berbeda', orderId, st.jumlah, coba.jumlah);
        await c.query('UPDATE pesanan SET bayar_online = ? WHERE id = ?', [JSON.stringify(b), r.id]);
        return { hasil: 'diterapkan', masukBaru: false, jumlahBeda: true };
      }
      coba.masuk = true;
      const dibayar = Math.min(r.total, r.dibayar + coba.jumlah);
      const lama = r.status as StatusPesanan;
      // a cancelled booking stays cancelled, the owner is told to refund
      const status: StatusPesanan = lama === 'batal' || lama === 'selesai' ? lama : dibayar >= r.total ? 'lunas' : 'dikonfirmasi';
      await c.query('UPDATE pesanan SET dibayar = ?, status = ?, bayar_online = ? WHERE id = ?', [dibayar, status, JSON.stringify(b), r.id]);
      return { hasil: 'diterapkan', masukBaru: true, jumlahBeda: false };
    }
    await c.query('UPDATE pesanan SET bayar_online = ? WHERE id = ?', [JSON.stringify(b), r.id]);
    return { hasil: 'diterapkan', masukBaru: false, jumlahBeda: false };
  });
}

// Asks Midtrans about the transactions of a booking that may still change,
// when the guest closes the payment window or reloads the page, so the
// booking is right even before the notification arrives.
export async function cekBayar(k: KonfigMidtrans, p: Pesanan) {
  const perlu = (p.bayar_online?.coba ?? []).filter((c) => !c.masuk && !sudahTutup(c.status)).slice(-3);
  const hasil: (HasilTerap & { orderId: string })[] = [];
  for (const c of perlu) {
    const st = await statusTransaksi(k, c.orderId);
    // the window was opened but no method chosen yet, Midtrans has no transaction
    if (!st.ada) continue;
    hasil.push({ ...(await terapkanStatus(c.orderId, st)), orderId: c.orderId });
  }
  return hasil;
}

// E-mails the guest and the owner once money has come in, or the owner
// alone when the amount does not match.
export async function kabariHasil(orderId: string, h: HasilTerap, asal: string) {
  if (!h.masukBaru && !h.jumlahBeda) return;
  // the booking's note in the DAMPIER calendar says it is paid
  if (h.masukBaru) kabariDampier();
  const kode = kodeDariOrder(orderId);
  const p = kode ? await pesananDariKode(kode) : null;
  const coba = p?.bayar_online?.coba.find((c) => c.orderId === orderId);
  if (!p || !coba) return;
  const situs = await ambilSitus();
  await surelBayarMasuk(p, situs, asal, { jumlah: coba.jumlah, metode: namaMetode(coba.metode, coba.saluran, 'id'), metodeTamu: namaMetode(coba.metode, coba.saluran, p.bahasa), orderId, jumlahBeda: h.jumlahBeda })
    .catch((e) => console.error('[mambetron] surel pembayaran', e));
}
