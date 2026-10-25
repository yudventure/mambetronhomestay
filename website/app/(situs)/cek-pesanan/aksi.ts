'use server';
import { redirect } from 'next/navigation';
import { pesananDariKode } from '@/lib/data';
import { dbDiatur } from '@/lib/env';
import { kamus } from '@/lib/kamus';
import { bolehMencoba, catatGagal, alamatPengunjung } from '@/lib/sesi';

export async function cariPesananTamu(_: { galat: string }, fd: FormData): Promise<{ galat: string }> {
  const b = fd.get('bahasa') === 'en' ? 'en' : 'id';
  const k = kamus(b);
  const ip = `cek:${await alamatPengunjung()}`;
  if (!bolehMencoba(ip)) return { galat: k.galat.sibuk };
  const kode = String(fd.get('kode') ?? '').trim().toUpperCase().replace(/\s/g, '');
  const kontak = String(fd.get('kontak') ?? '').trim().toLowerCase();
  if (!dbDiatur() || !kode || !kontak) return { galat: k.cek.tidakAda };
  const p = await pesananDariKode(kode).catch(() => null);
  const angka = (s: string) => s.replace(/\D/g, '').replace(/^0/, '62');
  const cocok = p && (
    (p.email && p.email.toLowerCase() === kontak)
    || (angka(kontak).length >= 8 && angka(p.telepon).endsWith(angka(kontak).slice(-9)))
  );
  if (!p || !cocok) {
    catatGagal(ip);
    return { galat: k.cek.tidakAda };
  }
  redirect(`/pesanan/${p.kode}?t=${p.token}`);
}
