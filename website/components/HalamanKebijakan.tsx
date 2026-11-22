import Link from 'next/link';
import Bagian from './Bagian';
import TeksPanjang from './TeksPanjang';
import type { Bahasa, Situs } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { dwi, tampilWa, tanggal } from '@/lib/format';

// Privacy policy and terms and conditions, the owner's request, November
// 2026: "buatkan juga halaman privacy policy dan kebijakan, tulis di footer
// bagian paling bawah seperti layaknya website profesional". The text comes
// from Isi situs, Kebijakan privasi dan syarat, with the site's own name,
// contact, check-in times and free age filled in, so it stays right when
// those change.
export type JenisKebijakan = 'privasi' | 'syarat';

export function isiKebijakan(teks: string, situs: Situs, b: Bahasa) {
  const k = kamus(b).kebijakan;
  const kontak = [
    situs.whatsapp.trim() && `${k.kontakWa} ${tampilWa(situs.whatsapp)}`,
    situs.email.trim() && `${k.kontakSurel} ${situs.email.trim()}`,
  ].filter(Boolean).join(` ${k.atau} `) || k.kontakSitus;
  const isi: Record<string, string> = {
    nama: situs.nama, lokasi: dwi(situs.lokasi, b), kontak, checkIn: situs.checkIn, checkOut: situs.checkOut, usiaGratis: String(situs.usiaGratis),
  };
  return teks.replace(/\{(\w+)\}/g, (asli, kunci: string) => isi[kunci] ?? asli);
}

export default function HalamanKebijakan({ jenis, b, situs }: { jenis: JenisKebijakan; b: Bahasa; situs: Situs }) {
  const k = kamus(b);
  const judul = jenis === 'privasi' ? k.kaki.privasi : k.kaki.syarat;
  const teks = isiKebijakan(dwi(jenis === 'privasi' ? situs.privasiTeks : situs.syaratTeks, b), situs, b);
  const tgl = /^\d{4}-\d{2}-\d{2}$/.test(situs.kebijakanTanggal.trim()) ? tanggal(situs.kebijakanTanggal.trim(), b, 'polos') : situs.kebijakanTanggal.trim();
  const lain = [
    jenis !== 'privasi' && { href: '/kebijakan-privasi', label: k.kaki.privasi },
    jenis !== 'syarat' && { href: '/syarat-ketentuan', label: k.kaki.syarat },
    { href: '/ketentuan', label: k.kaki.ketentuan },
  ].filter((x) => !!x);
  return (
    <Bagian lebar="max-w-3xl" className="!pt-10 md:!pt-14">
      <p className="label-kecil">{situs.nama}</p>
      <h1 className="mt-2 text-[clamp(2.1rem,1.6rem+2vw,3rem)]">{judul}</h1>
      {tgl && <p className="mt-3 text-abu" data-kebijakan-tanggal>{k.kebijakan.diperbarui} {tgl}</p>}
      <div className="prosa mt-8 text-lg text-laut/85" data-kebijakan={jenis}>
        <TeksPanjang teks={teks} />
      </div>
      <nav aria-label={k.kebijakan.terkait} className="mt-12 rounded-3xl bg-buih p-6">
        <p className="text-sm font-semibold text-abu">{k.kebijakan.terkait}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {lain.map((x) => (
            <li key={x.href}>
              <Link href={x.href} className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-biru-tua shadow-tipis transition-colors hover:bg-buih-2">{x.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </Bagian>
  );
}
