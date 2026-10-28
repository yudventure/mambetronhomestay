// E-mails through SMTP, for bookings and for the admin password code.
// Optional, nothing is sent while the SMTP values are empty, and a failed
// send never blocks a booking.
import nodemailer from 'nodemailer';
import { KODE_MENIT } from './akun';
import { alamatSitus, envSurel, surelDiatur } from './env';
import { dwi, rupiah, tanggal, waktu } from './format';
import type { Pesanan, Situs } from './jenis';
import { KAMUS } from './kamus';

async function kirim(ke: string, judul: string, teks: string) {
  if (!surelDiatur() || !ke) return false;
  const s = envSurel();
  try {
    const t = nodemailer.createTransport({
      host: s.host,
      port: s.port,
      secure: s.port === 465,
      auth: { user: s.user, pass: s.password },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
    });
    await t.sendMail({ from: s.dari, to: ke, subject: judul, text: teks });
    return true;
  } catch (e) {
    console.error('[mambetron] surel gagal dikirim', e);
    return false;
  }
}

// EMAIL_ADMIN, or the sending mailbox itself when EMAIL_ADMIN is empty.
export function tujuanAdmin() {
  const s = envSurel();
  return s.admin || (s.dari.match(/<([^>]+)>/)?.[1] ?? s.dari).trim();
}

const kini = () => waktu(new Date().toISOString().slice(0, 19).replace('T', ' '));

export function surelKodeSandi(ke: string, kode: string, ip: string) {
  return kirim(
    ke,
    'Kode ganti kata sandi panel Mambetron',
    `Kode untuk mengganti kata sandi panel pengelola Mambetron Homestay\n\n${kode}\n\n`
      + `Kode berlaku ${KODE_MENIT} menit dan hanya bisa dipakai sekali.\n`
      + 'Bila kamu tidak sedang mengganti kata sandi, abaikan surel ini. Kata sandi yang sekarang tetap berlaku.\n\n'
      + `Diminta pada ${kini()}\nAlamat IP ${ip}\n`,
  );
}

export function surelSandiDiganti(ke: string, ip: string) {
  return kirim(
    ke,
    'Kata sandi panel Mambetron sudah diganti',
    `Kata sandi akun ${ke} di panel pengelola Mambetron Homestay baru saja diganti. Perangkat lain yang masih masuk dengan akun ini sudah dikeluarkan.\n\n`
      + `Diganti pada ${kini()}\nAlamat IP ${ip}\n\n`
      + 'Bila bukan kamu yang menggantinya, ubah ADMIN_PASSWORD di hPanel Hostinger lalu mulai ulang aplikasi. '
      + 'Kata sandi dari hPanel itu langsung berlaku, dan kata sandi yang baru diganti ini tidak bisa dipakai lagi.\n',
  );
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
    ...(p.paket ? ['', k.hasil.paket, dwi(p.paket.nama, b), dwi(p.paket.syarat, b)].filter((x, i) => i < 3 || x) : []),
    '',
    `${k.form.total} ${rupiah(p.total, b)}`,
  ];
  if (p.dp && p.dp < p.total) baris.push(`${k.form.uangMuka(situs.dpPersen)} ${rupiah(p.dp, b)}`);
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
  const admin = tujuanAdmin();
  if (admin) {
    await kirim(
      admin,
      `Pesanan baru ${p.kode} dari ${p.nama}`,
      `Ada pesanan baru di situs.\n\n${ringkas(p, situs, true)}\n\nPemesan\n${p.nama}\n${p.telepon}\n${p.email}\n\n${dasar}/admin/pesanan/${p.id}\n`,
    );
  }
}
