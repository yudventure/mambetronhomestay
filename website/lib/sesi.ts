// Admin sign-in with an e-mail and a password (see akun.ts for the
// accounts), a signed cookie that lasts seven days, and a small limit on
// wrong guesses per visitor. The cookie carries the e-mail and is signed with
// that account's stored password hash as well, so changing a password signs
// out every other device of that account.
import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { akunDari, cocokHash, sandiTersimpan } from './akun';
import { rahasiaSesi, sandiAdmin } from './env';

const KUKI = 'mb_sesi';
const UMUR = 7 * 24 * 3600;

const tanda = (isi: string, surel: string, simpan: string) =>
  crypto.createHmac('sha256', `${rahasiaSesi()}|${surel}|${simpan}`).update(isi).digest('base64url');

function sama(a: string, b: string) {
  const x = crypto.createHash('sha256').update(a).digest();
  const y = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(x, y);
}

export const sandiDiatur = () => sandiAdmin().length > 0;

export async function sandiCocok(surel: string, masukan: string) {
  const akun = akunDari(surel);
  if (!sandiDiatur() || !akun) {
    sama(masukan, 'tidak ada akun');
    return false;
  }
  const simpan = await sandiTersimpan(akun.surel);
  return simpan ? cocokHash(masukan, simpan) : sama(masukan, sandiAdmin());
}

export async function viaHttps() {
  const h = await headers();
  return (h.get('x-forwarded-proto') ?? '').split(',')[0].trim() === 'https';
}

// Pass the new hash right after a password change, the cached one is stale.
export async function buatSesi(surel: string, simpan?: string) {
  const isi = `v2.${Date.now() + UMUR * 1000}.${Buffer.from(surel).toString('base64url')}`;
  (await cookies()).set(KUKI, `${isi}.${tanda(isi, surel, simpan ?? await sandiTersimpan(surel))}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: await viaHttps(),
    path: '/',
    maxAge: UMUR,
  });
}

export async function hapusSesi() {
  (await cookies()).delete(KUKI);
}

// The signed in e-mail, or '' when nobody is signed in. An account removed
// from hPanel is signed out at once.
export const sesiAkun = cache(async () => {
  if (!sandiDiatur()) return '';
  const nilai = (await cookies()).get(KUKI)?.value ?? '';
  const i = nilai.lastIndexOf('.');
  if (i < 0) return '';
  const isi = nilai.slice(0, i);
  const [versi, habis, kode] = isi.split('.');
  if (versi !== 'v2' || !(Number(habis) > Date.now()) || !kode) return '';
  const akun = akunDari(Buffer.from(kode, 'base64url').toString());
  if (!akun) return '';
  return sama(nilai.slice(i + 1), tanda(isi, akun.surel, await sandiTersimpan(akun.surel))) ? akun.surel : '';
});

export const sesiSah = async () => Boolean(await sesiAkun());

// Use at the top of every admin page and admin server action.
export async function wajibMasuk() {
  if (!(await sesiSah())) redirect('/admin/masuk');
}

export async function alamatPengunjung() {
  const h = await headers();
  return (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'lokal';
}

const coba = new Map<string, { n: number; sampai: number }>();
export function bolehMencoba(ip: string) {
  const c = coba.get(ip);
  return !c || c.sampai < Date.now() || c.n < 6;
}
export function catatGagal(ip: string) {
  const kini = Date.now();
  const c = coba.get(ip);
  if (!c || c.sampai < kini) coba.set(ip, { n: 1, sampai: kini + 15 * 60_000 });
  else c.n += 1;
}
export const lupakanGagal = (ip: string) => coba.delete(ip);
