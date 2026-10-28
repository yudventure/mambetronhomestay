import Link from 'next/link';
import Ikon from './Ikon';
import type { Bahasa, Situs } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { dwi, tampilWa, tautanLuar, tautanWa } from '@/lib/format';

// Footer. Brand on the left, booking links in the middle, contact on the
// right with WhatsApp, email and the social accounts set in Isi situs. The
// bottom bar names the site that manages this one, linked to it.
export default function Kaki({ b, situs }: { b: Bahasa; situs: Situs }) {
  const k = kamus(b);
  const wa = tautanWa(situs.whatsapp, k.pesanWaUmum);
  const ig = situs.instagram.replace(/^@/, '').trim();
  const sosial = [
    { nama: 'Instagram', ikon: 'kamera', href: ig ? `https://instagram.com/${ig}` : '' },
    { nama: 'Facebook', ikon: 'facebook', href: tautanLuar(situs.facebook) },
    { nama: 'TikTok', ikon: 'tiktok', href: tautanLuar(situs.tiktok) },
    { nama: 'YouTube', ikon: 'youtube', href: tautanLuar(situs.youtube) },
  ].filter((x) => x.href);
  // On narrow phones a long address wraps after the @, not in the middle.
  const at = situs.email.indexOf('@');
  const surel = at > 0 ? <>{situs.email.slice(0, at + 1)}<wbr />{situs.email.slice(at + 1)}</> : situs.email;
  const kontak = [
    wa && { ikon: 'chat', label: 'WhatsApp', nilai: tampilWa(situs.whatsapp), href: wa, luar: true },
    situs.email && { ikon: 'surel', label: k.kaki.surel, nilai: surel, href: `mailto:${situs.email}`, luar: false },
  ].filter((x) => !!x);
  const label = 'block text-xs font-semibold tracking-[0.12em] text-sorot uppercase';
  const tahun = new Date().getFullYear();
  // the site that manages this one, set in Identitas
  const pengelola = tautanLuar(situs.pengelola);
  return (
    <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="bingkai overflow-hidden bg-laut text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-12 sm:grid-cols-[0.8fr_1.2fr] sm:px-8 lg:grid-cols-[1.15fr_0.7fr_1.15fr] lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/merek/logo-putih.svg" alt={situs.nama} width={134} height={112} className="h-28 w-auto" />
            <p className="mt-4 max-w-sm text-white/80">{dwi(situs.kakiTeks, b)}</p>
            <p className="mt-3 text-sm text-sorot">{dwi(situs.lokasi, b)}</p>
          </div>

          <div>
            <h2 className="text-lg text-white">{k.kaki.pesanLangsung}</h2>
            <ul className="mt-4 grid gap-2.5 text-white/85">
              <li><Link href="/kamar" className="hover:text-sorot">{k.semuaPondok}</Link></li>
              <li><Link href="/pesan" className="hover:text-sorot">{k.pesanSekarang}</Link></li>
              <li><Link href="/cek-pesanan" className="hover:text-sorot">{k.nav.cek}</Link></li>
              <li><Link href="/ketentuan" className="hover:text-sorot">{k.kaki.ketentuan}</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg text-white">{k.kaki.hubungi}</h2>
            {kontak.length > 0 && (
              <ul className="mt-4 grid gap-4">
                {kontak.map((x) => (
                  <li key={x.label}>
                    <a href={x.href} {...(x.luar ? { target: '_blank', rel: 'noopener' } : {})} className="group flex items-center gap-3">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-sorot transition-colors group-hover:bg-white/20">
                        <Ikon nama={x.ikon} />
                      </span>
                      <span className="min-w-0">
                        <span className={label}>{x.label}</span>
                        <span className="block text-[0.9375rem] font-semibold text-white transition-colors [overflow-wrap:anywhere] group-hover:text-sorot">{x.nilai}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {sosial.length > 0 && (
              <div className="mt-7">
                <p className={label}>{k.kaki.ikuti}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {sosial.map((x) => (
                    <li key={x.nama}>
                      <a href={x.href} target="_blank" rel="noopener" aria-label={x.nama} title={x.nama}
                        className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white hover:text-laut">
                        <Ikon nama={x.ikon} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-laut-3">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-white/65 sm:px-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <p>© {tahun} {situs.nama}</p>
              {pengelola && (
                <p>
                  {dwi(situs.pengelolaTeks, b)}{' '}
                  <a href={pengelola} target="_blank" rel="noopener" className="font-semibold text-white/85 underline-offset-4 transition-colors hover:text-sorot hover:underline">
                    {situs.pengelola.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '')}
                  </a>
                </p>
              )}
            </div>
            <a href="/admin" rel="nofollow" className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-white/80 ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white">
              <Ikon nama="gembok" className="size-4" /> {k.kaki.masukOperator}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
