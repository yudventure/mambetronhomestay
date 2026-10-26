// Admin accounts. Signing in takes an e-mail and a password. The e-mails come
// from hPanel only, EMAIL_ADMIN for the owner and EMAIL_DEVELOPER for the
// developer, never from the panel, so nobody inside the panel can add an
// account or redirect a code. Every account starts with ADMIN_PASSWORD and
// can set its own password through a code sent to its own e-mail.
//
// An own password is kept as a scrypt hash in admin_akun and wins over
// ADMIN_PASSWORD until ADMIN_PASSWORD itself is changed in hPanel. That is
// the way back in when a mailbox is out of reach, every stored hash then no
// longer matches and is ignored.
import crypto from 'crypto';
import { cache } from 'react';
import { situsBawaan } from './bawaan.mjs';
import { jalankan, satu } from './db';
import { dbDiatur, envSurel, rahasiaSesi, sandiAdmin } from './env';

export const KODE_MENIT = 10;
const MAKS_SALAH = 5;
const MAKS_KIRIM = 3;
const N = 16384;

export type Akun = { surel: string; peran: 'pemilik' | 'pengembang' };

const rapi = (s: string) => s.trim().toLowerCase();
const alamat = (s: string) => rapi(s.match(/<([^>]+)>/)?.[1] ?? s);

// The owner falls back to the sending mailbox, then to the contact address
// shipped with the site. Never to the contact address edited in the panel.
export function daftarAkun(): Akun[] {
  const s = envSurel();
  const pemilik = alamat(s.admin || s.dari || ((situsBawaan() as { email?: string }).email ?? ''));
  const pengembang = (process.env.EMAIL_DEVELOPER ?? '').split(',').map(alamat).filter(Boolean);
  const semua: Akun[] = pemilik ? [{ surel: pemilik, peran: 'pemilik' }] : [];
  for (const x of pengembang) if (!semua.some((a) => a.surel === x)) semua.push({ surel: x, peran: 'pengembang' });
  return semua;
}

export const akunDari = (surel: string) => daftarAkun().find((a) => a.surel === rapi(surel)) ?? null;

const sidikEnv = () => crypto.createHash('sha256').update(`mambetron|${sandiAdmin()}`).digest('hex');
const sidikKode = (surel: string, kode: string) => crypto.createHmac('sha256', rahasiaSesi()).update(`kode|${surel}|${kode}`).digest('hex');

function scrypt(s: string, garam: Buffer, n: number) {
  return new Promise<Buffer>((ok, gagal) => {
    crypto.scrypt(s, garam, 32, { N: n, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (e, h) => (e ? gagal(e) : ok(h)));
  });
}

export async function hashSandi(s: string) {
  const garam = crypto.randomBytes(16);
  const h = await scrypt(s, garam, N);
  return `scrypt$${N}$${garam.toString('base64url')}$${h.toString('base64url')}`;
}

export async function cocokHash(s: string, simpan: string) {
  const [jenis, n, garam, h] = simpan.split('$');
  if (jenis !== 'scrypt' || !garam || !h || !(Number(n) >= 1024)) return false;
  const hasil = await scrypt(s, Buffer.from(garam, 'base64url'), Number(n));
  const target = Buffer.from(h, 'base64url');
  return target.length === hasil.length && crypto.timingSafeEqual(hasil, target);
}

// The account's own hash, or '' while ADMIN_PASSWORD is its password.
export const sandiTersimpan = cache(async (surel: string) => {
  if (!dbDiatur()) return '';
  try {
    const r = await satu<{ sandi: string; sidik_env: string }>('SELECT sandi, sidik_env FROM admin_akun WHERE surel = ?', [surel]);
    return r && r.sandi && r.sidik_env === sidikEnv() ? r.sandi : '';
  } catch {
    return '';
  }
});

// A fresh six digit code for an account, or the reason none can be sent yet.
// At most one code a minute and three an hour per account.
export async function buatKode(surel: string): Promise<{ kode: string } | { galat: string }> {
  await jalankan('INSERT IGNORE INTO admin_akun (surel) VALUES (?)', [surel]);
  const r = await satu<{ n: number; jam: number | null; jeda: number | null }>(
    'SELECT kirim_n AS n, TIMESTAMPDIFF(SECOND, kirim_mulai, NOW()) AS jam, TIMESTAMPDIFF(SECOND, kirim_akhir, NOW()) AS jeda FROM admin_akun WHERE surel = ?',
    [surel],
  );
  if (r?.jeda != null && r.jeda < 60) return { galat: 'Kode baru saja dikirim. Tunggu satu menit sebelum meminta kode lagi.' };
  const jamBaru = r?.jam == null || r.jam >= 3600;
  if (!jamBaru && Number(r?.n) >= MAKS_KIRIM) return { galat: 'Kode sudah diminta tiga kali dalam satu jam. Coba lagi nanti.' };
  const kode = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  await jalankan(
    `UPDATE admin_akun SET kode = ?, kode_habis = DATE_ADD(NOW(), INTERVAL ${KODE_MENIT} MINUTE), kode_salah = 0,
      kirim_mulai = IF(?, NOW(), kirim_mulai), kirim_n = IF(?, 1, kirim_n + 1), kirim_akhir = NOW() WHERE surel = ?`,
    [sidikKode(surel, kode), jamBaru, jamBaru, surel],
  );
  return { kode };
}

// Checks a code and uses it up. Five wrong tries end the code.
export async function pakaiKode(surel: string, kode: string): Promise<'ok' | 'salah' | 'habis'> {
  const r = await satu<{ kode: string; berlaku: number; salah: number }>(
    'SELECT kode, kode_habis > NOW() AS berlaku, kode_salah AS salah FROM admin_akun WHERE surel = ?',
    [surel],
  );
  if (!r || !r.kode || !Number(r.berlaku) || r.salah >= MAKS_SALAH) return 'habis';
  const cocok = crypto.timingSafeEqual(Buffer.from(r.kode, 'hex'), Buffer.from(sidikKode(surel, kode), 'hex'));
  if (!cocok) {
    // kode is set before kode_salah so both use the old count on MySQL and MariaDB
    await jalankan("UPDATE admin_akun SET kode = IF(kode_salah + 1 >= ?, '', kode), kode_salah = kode_salah + 1 WHERE surel = ?", [MAKS_SALAH, surel]);
    return r.salah + 1 >= MAKS_SALAH ? 'habis' : 'salah';
  }
  await jalankan("UPDATE admin_akun SET kode = '', kode_habis = NULL, kode_salah = 0 WHERE surel = ?", [surel]);
  return 'ok';
}

export async function simpanSandi(surel: string, hash: string) {
  await jalankan('UPDATE admin_akun SET sandi = ?, sidik_env = ? WHERE surel = ?', [hash, sidikEnv(), surel]);
}
