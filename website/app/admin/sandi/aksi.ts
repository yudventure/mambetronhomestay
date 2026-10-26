'use server';
// Changing the admin password with a code sent to the admin mailbox. Open
// without signing in, so it also works when the password is forgotten. The
// code goes only to EMAIL_ADMIN from hPanel, never to an address typed here.
import { after } from 'next/server';
import { redirect } from 'next/navigation';
import { buatKode, hashSandi, pakaiKode, simpanSandi } from '@/lib/akun';
import { cekDb } from '@/lib/db';
import { surelDiatur } from '@/lib/env';
import { alamatPengunjung, bolehMencoba, buatSesi, catatGagal, lupakanGagal, sandiDiatur } from '@/lib/sesi';
import { samarkan, surelKodeSandi, surelSandiDiganti, tujuanAdmin } from '@/lib/surel';

export type HasilSandi = { galat: string; pesan: string };

async function siap(): Promise<string> {
  if (!sandiDiatur()) return 'ADMIN_PASSWORD belum diisi di environment variables.';
  if (!surelDiatur()) return 'Pengiriman surel belum diatur. Isi SMTP_HOST, SMTP_USER, dan SMTP_PASSWORD di hPanel.';
  if (!(await cekDb()).ok) return 'Database belum terhubung.';
  return '';
}

export async function mintaKode(_: HasilSandi): Promise<HasilSandi> {
  const galat = await siap();
  if (galat) return { galat, pesan: '' };
  const ip = await alamatPengunjung();
  if (!bolehMencoba(ip)) return { galat: 'Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi.', pesan: '' };
  const k = await buatKode();
  if ('galat' in k) return { galat: k.galat, pesan: '' };
  if (!(await surelKodeSandi(k.kode, ip))) {
    return { galat: 'Surel gagal dikirim. Periksa SMTP_HOST, SMTP_PORT, SMTP_USER, dan SMTP_PASSWORD di hPanel.', pesan: '' };
  }
  return { galat: '', pesan: `Kode dikirim ke ${samarkan(tujuanAdmin())}. Periksa juga folder spam.` };
}

export async function gantiSandi(_: HasilSandi, fd: FormData): Promise<HasilSandi> {
  const galat = await siap();
  if (galat) return { galat, pesan: '' };
  const ip = await alamatPengunjung();
  if (!bolehMencoba(ip)) return { galat: 'Terlalu banyak percobaan. Tunggu 15 menit lalu coba lagi.', pesan: '' };
  const kode = String(fd.get('kode') ?? '').replace(/\D/g, '');
  const sandi = String(fd.get('sandi') ?? '');
  const ulangi = String(fd.get('ulangi') ?? '');
  if (kode.length !== 6) return { galat: 'Kode terdiri dari 6 angka.', pesan: '' };
  if (sandi.length < 10) return { galat: 'Kata sandi baru minimal 10 karakter.', pesan: '' };
  if (sandi.length > 200) return { galat: 'Kata sandi baru paling banyak 200 karakter.', pesan: '' };
  if (sandi !== ulangi) return { galat: 'Kedua kata sandi baru belum sama.', pesan: '' };

  const hasil = await pakaiKode(kode);
  if (hasil !== 'ok') {
    catatGagal(ip);
    return {
      galat: hasil === 'salah' ? 'Kode salah. Periksa lagi angka di surel.' : 'Kode sudah tidak berlaku. Minta kode baru.',
      pesan: '',
    };
  }
  const hash = await hashSandi(sandi);
  await simpanSandi(hash);
  lupakanGagal(ip);
  await buatSesi(hash);
  after(() => surelSandiDiganti(ip));
  redirect('/admin?ok=sandi');
}
