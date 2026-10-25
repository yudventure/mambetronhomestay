// Booking e-mails through SMTP. Optional, nothing is sent while the SMTP
// values are empty, and a failed send never blocks the booking.
import nodemailer from 'nodemailer';
import { alamatSitus, envSurel, surelDiatur } from './env';
import { rupiah, tanggal } from './format';
import type { Pesanan, Situs } from './jenis';
import { KAMUS } from './kamus';

async function kirim(ke: string, judul: string, teks: string) {
  if (!surelDiatur() || !ke) return;
  const s = envSurel();
  try {
    const t = nodemailer.createTransport({
      host: s.host,
      port: s.port,
      secure: s.port === 465,
      auth: { user: s.user, pass: s.password },
    });
    await t.sendMail({ from: s.dari, to: ke, subject: judul, text: teks });
  } catch (e) {
    console.error('[mambetron] surel gagal dikirim', e);
  }
}

function ringkas(p: Pesanan, situs: Situs, untukAdmin: boolean) {
  const b = untukAdmin ? 'id' : p.bahasa;
  const k = KAMUS[b];
  const baris = [
    `${k.hasil.kode}`,
    p.kode,
    '',
    `${p.kamar_nama}, ${k.hasil.pondokN(p.jumlah_kamar)}`,
    `${k.tiba} ${tanggal(p.check_in, b, 'panjang')}`,
    `${k.pulang} ${tanggal(p.check_out, b, 'panjang')}`,
    `${k.form.malam(p.malam)}, ${k.hasil.tamu(p.dewasa, p.anak)}`,
    '',
    `${k.form.total} ${rupiah(p.total, b)}`,
  ];
  if (p.dp) baris.push(`${k.form.uangMuka(situs.dpPersen)} ${rupiah(p.dp, b)}`);
  return baris.join('\n');
}

export async function surelPesananBaru(p: Pesanan, situs: Situs, asal: string) {
  const dasar = alamatSitus() || asal;
  const k = KAMUS[p.bahasa];
  const tautanTamu = `${dasar}/pesanan/${p.kode}?t=${p.token}`;
  if (p.email) {
    await kirim(
      p.email,
      `${situs.nama} ${p.kode}`,
      `${situs.pesanTerima[p.bahasa] || situs.pesanTerima.id}\n\n${ringkas(p, situs, false)}\n\n${k.hasil.simpan}\n${tautanTamu}\n`,
    );
  }
  const admin = envSurel().admin;
  if (admin) {
    await kirim(
      admin,
      `Pesanan baru ${p.kode} dari ${p.nama}`,
      `Ada pesanan baru di situs.\n\n${ringkas(p, situs, true)}\n\nPemesan\n${p.nama}\n${p.telepon}\n${p.email}\n\n${dasar}/admin/pesanan/${p.id}\n`,
    );
  }
}
