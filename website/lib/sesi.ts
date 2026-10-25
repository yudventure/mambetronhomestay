// Admin sign-in. One shared password from ADMIN_PASSWORD, a signed cookie
// that lasts seven days, and a small limit on wrong guesses per visitor.
import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { rahasiaSesi, sandiAdmin } from './env';

const KUKI = 'mb_sesi';
const UMUR = 7 * 24 * 3600;

const tanda = (isi: string) => crypto.createHmac('sha256', rahasiaSesi()).update(isi).digest('base64url');

function sama(a: string, b: string) {
  const x = crypto.createHash('sha256').update(a).digest();
  const y = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(x, y);
}

export const sandiDiatur = () => sandiAdmin().length > 0;
export const sandiCocok = (masukan: string) => sandiDiatur() && sama(masukan, sandiAdmin());

export async function viaHttps() {
  const h = await headers();
  return (h.get('x-forwarded-proto') ?? '').split(',')[0].trim() === 'https';
}

export async function buatSesi() {
  const isi = `v1.${Date.now() + UMUR * 1000}`;
  (await cookies()).set(KUKI, `${isi}.${tanda(isi)}`, {
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

export async function sesiSah() {
  if (!sandiDiatur()) return false;
  const nilai = (await cookies()).get(KUKI)?.value ?? '';
  const i = nilai.lastIndexOf('.');
  if (i < 0) return false;
  const isi = nilai.slice(0, i);
  const [versi, habis] = isi.split('.');
  if (versi !== 'v1' || !(Number(habis) > Date.now())) return false;
  return sama(nilai.slice(i + 1), tanda(isi));
}

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
