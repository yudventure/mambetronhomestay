// E-mails through SMTP, for bookings, online payments and the admin
// password code. Each one goes out as designed HTML (lib/surel-html.ts) with
// a plain text version for mail apps that show only text. Optional, nothing
// is sent while the SMTP values are empty, and a failed send never blocks a
// booking.
import nodemailer from 'nodemailer';
import { KODE_MENIT } from './akun';
import { alamatSitus, envSurel, surelDiatur } from './env';
import { dwi, rupiah, tampilWa, tanggal, tautanWa, waktu } from './format';
import type { Bahasa, Pesanan, Situs } from './jenis';
import { KAMUS } from './kamus';
import { bacaKonfigMidtrans } from './midtrans';
import { susunSurel, type Blok, type Kaki } from './surel-html';

async function kirim(ke: string, judul: string, teks: string, html?: string) {
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
    await t.sendMail({ from: s.dari, to: ke, subject: judul, text: teks, ...(html ? { html } : {}) });
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
const logo = (dasar: string) => (dasar ? `${dasar}/merek/logo-surel.png` : '');
const NAMA = 'Mambetron Homestay';

// The footer with the homestay's contacts, in the reader's language.
function kaki(situs: Situs | null, b: Bahasa, dasar: string, alasan: string): Kaki {
  const wa = situs ? tautanWa(situs.whatsapp) : '';
  return {
    nama: situs?.nama ?? NAMA,
    baris: situs ? [dwi(situs.lokasi, b), ...(situs.whatsapp ? [`WhatsApp ${tampilWa(situs.whatsapp)}`] : [])] : [],
    tautan: [
      ...(wa ? [{ teks: 'WhatsApp', href: wa }] : []),
      ...(dasar ? [{ teks: dasar.replace(/^https?:\/\//, ''), href: dasar }] : []),
    ],
    alasan,
  };
}

// The stay, as rows of label and value.
function barisMenginap(p: Pesanan, situs: Situs, b: Bahasa): [string, string][] {
  const k = KAMUS[b];
  return [
    [k.form.pondok, `${p.kamar_nama}, ${k.hasil.pondokN(p.jumlah_kamar)}`],
    [k.tiba, `${tanggal(p.check_in, b, 'panjang')}\n${k.checkInOut.masuk} ${situs.checkIn}`],
    [k.pulang, `${tanggal(p.check_out, b, 'panjang')}\n${k.checkInOut.keluar} ${situs.checkOut}`],
    [k.surel.lama, k.form.malam(p.malam)],
    [k.surel.tamu, k.hasil.tamu(p.dewasa, p.anak)],
    ...(p.paket ? [[k.hasil.paket, [dwi(p.paket.nama, b), dwi(p.paket.syarat, b)].filter(Boolean).join('\n')] as [string, string]] : []),
  ];
}

// The price, the room line and each add-on, then the total.
function barisHarga(p: Pesanan, b: Bahasa): [string, string][] {
  const k = KAMUS[b];
  return [
    [p.kamar_nama, `${rupiah(p.biaya_kamar, b)}\n${k.form.malam(p.malam)}`],
    ...p.rincian.map((r) => [b === 'en' && r.nama_en ? r.nama_en : r.nama, `${rupiah(r.subtotal, b)}\n${k.form.kali(r.jumlah, rupiah(r.harga, b))}`] as [string, string]),
  ];
}

const totalBaris = (p: Pesanan, situs: Situs, b: Bahasa): [string, string, string?] => {
  const k = KAMUS[b];
  const muka = p.dp && p.dp < p.total ? `${k.form.uangMuka(situs.dpPersen)} ${rupiah(p.dp, b)}` : undefined;
  return [k.form.total, rupiah(p.total, b), muka];
};

// Plain text of the same stay, for the text version of each e-mail.
function ringkas(p: Pesanan, situs: Situs, b: Bahasa) {
  const k = KAMUS[b];
  const baris = [
    k.hasil.kode, p.kode, '',
    ...barisMenginap(p, situs, b).flatMap(([l, n]) => [l, n, '']),
    `${k.form.total} ${rupiah(p.total, b)}`,
  ];
  if (p.dp && p.dp < p.total) baris.push(`${k.form.uangMuka(situs.dpPersen)} ${rupiah(p.dp, b)}`);
  return baris.join('\n');
}

const rekeningSitus = (situs: Situs) => situs.bank.filter((r) => r.nomor.trim()).map((r) => ({ ...r, swift: (r.swift ?? '').replace(/\s/g, '').toUpperCase() }));

export async function surelPesananBaru(p: Pesanan, situs: Situs, asal: string) {
  const dasar = alamatSitus() || asal;
  const tautanTamu = `${dasar}/pesanan/${p.kode}?t=${p.token}`;
  if (p.email) {
    const b = p.bahasa;
    const k = KAMUS[b];
    const online = (await bacaKonfigMidtrans().catch(() => null))?.tampil ?? false;
    const rekening = rekeningSitus(situs);
    const perluBayar = p.status === 'menunggu' && p.dp > 0;
    const bayar: Blok[] = !perluBayar ? [] : [
      { jenis: 'judul', teks: k.surel.caraBayar },
      ...(online ? [{ jenis: 'paragraf', teks: k.surel.bayarOnline } as Blok] : []),
      ...(rekening.length
        ? [{ jenis: 'paragraf', teks: online ? k.surel.atauTransfer : k.surel.transfer } as Blok, { jenis: 'rekening', daftar: rekening, labelSwift: k.hasil.swift } as Blok]
        : online ? [] : [{ jenis: 'paragraf', teks: k.hasil.rekeningNanti } as Blok]),
      ...(rekening.length || !online ? [{ jenis: 'paragraf', teks: dwi(situs.catatanBayar, b) } as Blok] : []),
    ];
    const html = susunSurel({
      lang: b,
      judul: k.surel.judulTerima,
      pratinjau: k.surel.pratinjauTerima(p.kode),
      logo: logo(dasar),
      blok: [
        { jenis: 'paragraf', teks: `${b === 'en' ? 'Hi' : 'Halo'} ${p.nama},` },
        { jenis: 'paragraf', teks: dwi(situs.pesanTerima, b) },
        { jenis: 'kode', label: k.hasil.kode, nilai: p.kode },
        { jenis: 'judul', teks: k.surel.rincian },
        { jenis: 'rincian', baris: barisMenginap(p, situs, b) },
        { jenis: 'judul', teks: k.surel.harga },
        { jenis: 'rincian', baris: barisHarga(p, b), total: totalBaris(p, situs, b) },
        ...bayar,
        { jenis: 'tombol', teks: perluBayar ? k.surel.tombolBayar : k.surel.tombolLihat, href: tautanTamu },
        { jenis: 'paragraf', teks: k.surel.simpan },
        { jenis: 'paragraf', teks: k.surel.tanya },
      ],
      kaki: kaki(situs, b, dasar, k.surel.alasan(situs.nama)),
    });
    const teks = `${dwi(situs.pesanTerima, b)}\n\n${ringkas(p, situs, b)}\n\n${k.hasil.simpan}\n${tautanTamu}\n`;
    await kirim(p.email, `${situs.nama} ${p.kode}`, teks, html);
  }
  const admin = tujuanAdmin();
  if (admin) {
    const k = KAMUS.id;
    const pemesan: [string, string][] = ([
      ['Nama', p.nama], ['WhatsApp', p.telepon], ['Surel', p.email], ['Asal', p.negara], ['Rencana tiba', p.kedatangan], ['Catatan tamu', p.catatan],
    ] as [string, string][]).filter(([, n]) => n.trim());
    const html = susunSurel({
      lang: 'id',
      judul: `Pesanan baru ${p.kode}`,
      pratinjau: `${p.nama}, ${tanggal(p.check_in, 'id')} sampai ${tanggal(p.check_out, 'id')}, ${rupiah(p.total)}`,
      logo: logo(dasar),
      blok: [
        { jenis: 'paragraf', teks: `Ada pesanan baru dari ${p.nama} lewat situs. Statusnya ${k.status[p.status].toLowerCase()}.` },
        { jenis: 'kode', label: k.hasil.kode, nilai: p.kode },
        { jenis: 'judul', teks: 'Menginap' },
        { jenis: 'rincian', baris: barisMenginap(p, situs, 'id') },
        { jenis: 'judul', teks: 'Harga' },
        { jenis: 'rincian', baris: barisHarga(p, 'id'), total: totalBaris(p, situs, 'id') },
        { jenis: 'judul', teks: 'Pemesan' },
        { jenis: 'rincian', baris: pemesan },
        { jenis: 'tombol', teks: 'Buka di panel', href: `${dasar}/admin/pesanan/${p.id}` },
      ],
      kaki: kaki(situs, 'id', dasar, `Pemberitahuan pesanan dari situs ${situs.nama}.`),
    });
    await kirim(
      admin,
      `Pesanan baru ${p.kode} dari ${p.nama}`,
      `Ada pesanan baru di situs.\n\n${ringkas(p, situs, 'id')}\n\nPemesan\n${p.nama}\n${p.telepon}\n${p.email}\n\n${dasar}/admin/pesanan/${p.id}\n`,
      html,
    );
  }
}

// A payment through Midtrans has come in. The guest gets a thank you, the
// owner the booking with what was paid. A cancelled booking, or an amount
// Midtrans reports differently, is pointed out to the owner.
export async function surelBayarMasuk(p: Pesanan, situs: Situs, asal: string, o: { jumlah: number; metode: string; metodeTamu: string; orderId: string; jumlahBeda: boolean }) {
  const dasar = alamatSitus() || asal;
  const tautanTamu = `${dasar}/pesanan/${p.kode}?t=${p.token}`;
  if (p.email && !o.jumlahBeda) {
    const b = p.bahasa;
    const k = KAMUS[b];
    const terima = k.hasil.surelBayar(rupiah(o.jumlah, b), o.metodeTamu, situs.nama);
    const html = susunSurel({
      lang: b,
      judul: k.surel.judulBayar,
      pratinjau: k.surel.pratinjauBayar(p.kode),
      logo: logo(dasar),
      blok: [
        { jenis: 'paragraf', teks: `${b === 'en' ? 'Hi' : 'Halo'} ${p.nama},` },
        { jenis: 'paragraf', teks: terima },
        { jenis: 'kode', label: k.hasil.kode, nilai: p.kode },
        { jenis: 'rincian', baris: [[k.surel.dibayar, rupiah(o.jumlah, b)], [k.surel.cara, o.metodeTamu]] },
        { jenis: 'judul', teks: k.surel.rincian },
        { jenis: 'rincian', baris: barisMenginap(p, situs, b) },
        { jenis: 'tombol', teks: k.surel.tombolLihat, href: tautanTamu },
        { jenis: 'paragraf', teks: k.surel.tanya },
      ],
      kaki: kaki(situs, b, dasar, k.surel.alasan(situs.nama)),
    });
    await kirim(p.email, `${situs.nama} ${p.kode}`, `${terima}\n\n${ringkas(p, situs, b)}\n\n${k.hasil.simpan}\n${tautanTamu}\n`, html);
  }
  const admin = tujuanAdmin();
  if (!admin) return;
  const catatan = o.jumlahBeda
    ? 'Midtrans melaporkan jumlah yang berbeda dari tagihan, jadi pembayaran ini belum dicatat di pesanan. Periksa transaksinya di Dashboard Midtrans.'
    : p.status === 'batal' ? 'Pesanan ini sudah dibatalkan sebelum pembayaran masuk. Hubungi tamu untuk mengembalikan dananya.' : '';
  const judul = o.jumlahBeda ? `Periksa pembayaran online ${p.kode}` : `Pembayaran online masuk ${p.kode}`;
  const html = susunSurel({
    lang: 'id',
    judul,
    pratinjau: `${rupiah(o.jumlah)} lewat ${o.metode} dari ${p.nama}`,
    logo: logo(dasar),
    blok: [
      ...(catatan ? [{ jenis: 'kotak', teks: catatan, nada: 'awas' } as Blok] : [{ jenis: 'paragraf', teks: `${p.nama} sudah membayar lewat Midtrans. Status pesanannya sekarang ${KAMUS.id.status[p.status].toLowerCase()}.` } as Blok]),
      { jenis: 'kode', label: 'Kode pesanan', nilai: p.kode },
      { jenis: 'rincian', baris: [['Dibayar', rupiah(o.jumlah)], ['Cara bayar', o.metode], ['Order Midtrans', o.orderId], ['Pemesan', [p.nama, p.telepon, p.email].filter(Boolean).join('\n')]] },
      { jenis: 'judul', teks: 'Menginap' },
      { jenis: 'rincian', baris: barisMenginap(p, situs, 'id'), total: totalBaris(p, situs, 'id') },
      { jenis: 'tombol', teks: 'Buka di panel', href: `${dasar}/admin/pesanan/${p.id}` },
    ],
    kaki: kaki(situs, 'id', dasar, `Pemberitahuan pembayaran dari situs ${situs.nama}.`),
  });
  await kirim(
    admin,
    judul,
    `${catatan ? `${catatan}\n\n` : ''}${ringkas(p, situs, 'id')}\n\nDibayar lewat Midtrans\n${rupiah(o.jumlah)}, ${o.metode}\nOrder ${o.orderId}\n\nPemesan\n${p.nama}\n${p.telepon}\n${p.email}\n\n${dasar}/admin/pesanan/${p.id}\n`,
    html,
  );
}

const alasanKeamanan = `Surel keamanan untuk akun panel pengelola ${NAMA}.`;

export function surelKodeSandi(ke: string, kode: string, ip: string, asal = '') {
  const dasar = alamatSitus() || asal;
  const html = susunSurel({
    lang: 'id',
    judul: 'Kode ganti kata sandi',
    pratinjau: `Kode berlaku ${KODE_MENIT} menit.`,
    logo: logo(dasar),
    blok: [
      { jenis: 'paragraf', teks: `Pakai kode ini untuk mengganti kata sandi panel pengelola ${NAMA}.` },
      { jenis: 'kode', label: 'Kode', nilai: kode },
      { jenis: 'paragraf', teks: `Kode berlaku ${KODE_MENIT} menit dan hanya bisa dipakai sekali.` },
      { jenis: 'kotak', teks: 'Bila kamu tidak sedang mengganti kata sandi, abaikan surel ini. Kata sandi yang sekarang tetap berlaku.' },
      { jenis: 'rincian', baris: [['Diminta pada', kini()], ['Alamat IP', ip]] },
    ],
    kaki: kaki(null, 'id', dasar, alasanKeamanan),
  });
  return kirim(
    ke,
    'Kode ganti kata sandi panel Mambetron',
    `Kode untuk mengganti kata sandi panel pengelola ${NAMA}\n\n${kode}\n\n`
      + `Kode berlaku ${KODE_MENIT} menit dan hanya bisa dipakai sekali.\n`
      + 'Bila kamu tidak sedang mengganti kata sandi, abaikan surel ini. Kata sandi yang sekarang tetap berlaku.\n\n'
      + `Diminta pada ${kini()}\nAlamat IP ${ip}\n`,
    html,
  );
}

export function surelSandiDiganti(ke: string, ip: string, asal = '') {
  const dasar = alamatSitus() || asal;
  const pulih = 'Bila bukan kamu yang menggantinya, ubah ADMIN_PASSWORD di hPanel Hostinger lalu mulai ulang aplikasi. Kata sandi dari hPanel itu langsung berlaku, dan kata sandi yang baru diganti ini tidak bisa dipakai lagi.';
  const html = susunSurel({
    lang: 'id',
    judul: 'Kata sandi sudah diganti',
    pratinjau: `Kata sandi akun ${ke} baru saja diganti.`,
    logo: logo(dasar),
    blok: [
      { jenis: 'paragraf', teks: `Kata sandi akun ${ke} di panel pengelola ${NAMA} baru saja diganti. Perangkat lain yang masih masuk dengan akun ini sudah dikeluarkan.` },
      { jenis: 'rincian', baris: [['Diganti pada', kini()], ['Alamat IP', ip]] },
      { jenis: 'kotak', teks: pulih, nada: 'awas' },
    ],
    kaki: kaki(null, 'id', dasar, alasanKeamanan),
  });
  return kirim(
    ke,
    'Kata sandi panel Mambetron sudah diganti',
    `Kata sandi akun ${ke} di panel pengelola ${NAMA} baru saja diganti. Perangkat lain yang masih masuk dengan akun ini sudah dikeluarkan.\n\n`
      + `Diganti pada ${kini()}\nAlamat IP ${ip}\n\n${pulih}\n`,
    html,
  );
}

