// Admin password changed through a code sent by e-mail. The new password is
// kept as a scrypt hash in the akun table and wins over ADMIN_PASSWORD until
// ADMIN_PASSWORD itself is changed in hPanel. That is the way back in when the
// mailbox is out of reach, the hash then no longer matches and is ignored.
import crypto from 'crypto';
import { cache } from 'react';
import { jalankan, satu } from './db';
import { dbDiatur, rahasiaSesi, sandiAdmin } from './env';

export const KODE_MENIT = 10;
const MAKS_SALAH = 5;
const MAKS_KIRIM = 3;
const N = 16384;

const sidikEnv = () => crypto.createHash('sha256').update(`mambetron|${sandiAdmin()}`).digest('hex');
const sidikKode = (kode: string) => crypto.createHmac('sha256', rahasiaSesi()).update(`kode|${kode}`).digest('hex');

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

// The stored hash, or '' while ADMIN_PASSWORD is the password in force.
export const sandiTersimpan = cache(async () => {
  if (!dbDiatur()) return '';
  try {
    const r = await satu<{ sandi: string; sidik_env: string }>('SELECT sandi, sidik_env FROM akun WHERE id = 1');
    return r && r.sandi && r.sidik_env === sidikEnv() ? r.sandi : '';
  } catch {
    return '';
  }
});

// A fresh six digit code, or the reason none can be sent yet. At most one
// code a minute and three an hour.
export async function buatKode(): Promise<{ kode: string } | { galat: string }> {
  await jalankan('INSERT IGNORE INTO akun (id) VALUES (1)');
  const r = await satu<{ n: number; jam: number | null; jeda: number | null }>(
    'SELECT kirim_n AS n, TIMESTAMPDIFF(SECOND, kirim_mulai, NOW()) AS jam, TIMESTAMPDIFF(SECOND, kirim_akhir, NOW()) AS jeda FROM akun WHERE id = 1',
  );
  if (r?.jeda != null && r.jeda < 60) return { galat: 'Kode baru saja dikirim. Tunggu satu menit sebelum meminta kode lagi.' };
  const jamBaru = r?.jam == null || r.jam >= 3600;
  if (!jamBaru && Number(r?.n) >= MAKS_KIRIM) return { galat: 'Kode sudah diminta tiga kali dalam satu jam. Coba lagi nanti.' };
  const kode = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  await jalankan(
    `UPDATE akun SET kode = ?, kode_habis = DATE_ADD(NOW(), INTERVAL ${KODE_MENIT} MINUTE), kode_salah = 0,
      kirim_mulai = IF(?, NOW(), kirim_mulai), kirim_n = IF(?, 1, kirim_n + 1), kirim_akhir = NOW() WHERE id = 1`,
    [sidikKode(kode), jamBaru, jamBaru],
  );
  return { kode };
}

// Checks a code and uses it up. Five wrong tries end the code.
export async function pakaiKode(kode: string): Promise<'ok' | 'salah' | 'habis'> {
  const r = await satu<{ kode: string; berlaku: number; salah: number }>(
    'SELECT kode, kode_habis > NOW() AS berlaku, kode_salah AS salah FROM akun WHERE id = 1',
  );
  if (!r || !r.kode || !Number(r.berlaku) || r.salah >= MAKS_SALAH) return 'habis';
  const cocok = crypto.timingSafeEqual(Buffer.from(r.kode, 'hex'), Buffer.from(sidikKode(kode), 'hex'));
  if (!cocok) {
    // kode is set before kode_salah so both use the old count on MySQL and MariaDB
    await jalankan("UPDATE akun SET kode = IF(kode_salah + 1 >= ?, '', kode), kode_salah = kode_salah + 1 WHERE id = 1", [MAKS_SALAH]);
    return r.salah + 1 >= MAKS_SALAH ? 'habis' : 'salah';
  }
  await jalankan("UPDATE akun SET kode = '', kode_habis = NULL, kode_salah = 0 WHERE id = 1");
  return 'ok';
}

export async function simpanSandi(hash: string) {
  await jalankan('UPDATE akun SET sandi = ?, sidik_env = ? WHERE id = 1', [hash, sidikEnv()]);
}
