'use server';
// Changing an admin password with a code sent to that account's e-mail. Open
// without signing in, so it also works when the password is forgotten. The
// code goes only to an e-mail listed in hPanel, and the reply looks the same
// whether or not the typed e-mail is an account.
import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { akunDari, buatKode, hashSandi, pakaiKode, simpanSandi } from '@/lib/akun';
import { cekDb } from '@/lib/db';
import { surelDiatur } from '@/lib/env';
import { alamatPengunjung, bolehMencoba, buatSesi, catatGagal, lupakanGagal, sandiDiatur } from '@/lib/sesi';
import { surelKodeSandi, surelSandiDiganti } from '@/lib/surel';

export type HasilSandi = { galat: string; pesan: string };

const TERKIRIM = 'Bila surel itu terdaftar sebagai pengelola, kode 6 angka sudah dikirim ke sana. Periksa juga folder spam.';
const surelDari = (fd: FormData) => String(fd.get('surel') ?? '').trim().toLowerCase().slice(0, 190);

async function siap(): Promise<string> {
  if (!sandiDiatur()) return 'ADMIN_PASSWORD belum diisi di environment variables.';
  if (!surelDiatur()) return 'Pengiriman surel belum diatur. Isi SMTP_HOST, SMTP_USER, dan SMTP_PASSWORD di hPanel.';
  if (!(await cekDb()).ok) return 'Database belum terhubung.';
  return '';
}

export async function mintaKode(_: HasilSandi, fd: FormData): Promise<HasilSandi> {
  const galat = await siap();
  if (galat) return { galat, pesan: '' };
  const ip = await alamatPengunjung();
  if (!bolehMencoba(ip)) return { galat: 'Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi.', pesan: '' };
  const surel = surelDari(fd);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(surel)) return { galat: 'Tulis alamat surel akun dengan lengkap.', pesan: '' };
  const akun = akunDari(surel);
  if (!akun) {
    catatGagal(ip);
    return { galat: '', pesan: TERKIRIM };
  }
  const k = await buatKode(akun.surel);
  if ('galat' in k) return { galat: k.galat, pesan: '' };
  if (!(await surelKodeSandi(akun.surel, k.kode, ip))) {
    return { galat: 'Surel gagal dikirim. Periksa SMTP_HOST, SMTP_PORT, SMTP_USER, dan SMTP_PASSWORD di hPanel.', pesan: '' };
  }
  return { galat: '', pesan: TERKIRIM };
}

export async function gantiSandi(_: HasilSandi, fd: FormData): Promise<HasilSandi> {
  const galat = await siap();
  if (galat) return { galat, pesan: '' };
  const ip = await alamatPengunjung();
  if (!bolehMencoba(ip)) return { galat: 'Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi.', pesan: '' };
  const surel = surelDari(fd);
  const kode = String(fd.get('kode') ?? '').replace(/\D/g, '');
  const sandi = String(fd.get('sandi') ?? '');
  const ulangi = String(fd.get('ulangi') ?? '');
  if (!surel) return { galat: 'Tulis alamat surel akun di langkah pertama.', pesan: '' };
  if (kode.length !== 6) return { galat: 'Kode terdiri dari 6 angka.', pesan: '' };
  if (sandi.length < 10) return { galat: 'Kata sandi baru minimal 10 karakter.', pesan: '' };
  if (sandi.length > 200) return { galat: 'Kata sandi baru paling banyak 200 karakter.', pesan: '' };
  if (sandi !== ulangi) return { galat: 'Kedua kata sandi baru belum sama.', pesan: '' };

  const akun = akunDari(surel);
  const hasil = akun ? await pakaiKode(akun.surel, kode) : 'habis';
  if (!akun || hasil !== 'ok') {
    catatGagal(ip);
    return {
      galat: hasil === 'salah' ? 'Kode salah. Periksa lagi angka di surel.' : 'Kode sudah tidak berlaku atau surel tidak cocok. Minta kode baru.',
      pesan: '',
    };
  }
  const hash = await hashSandi(sandi);
  await simpanSandi(akun.surel, hash);
  lupakanGagal(ip);
  await buatSesi(akun.surel, hash);
  after(() => surelSandiDiganti(akun.surel, ip));
  redirect('/admin?ok=sandi');
}
