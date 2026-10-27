import Link from 'next/link';
import Bagian, { JudulBagian } from '@/components/Bagian';
import CariCepat from '@/components/CariCepat';
import GeserPondok from '@/components/GeserPondok';
import Ikon from '@/components/Ikon';
import Wajah from '@/components/Wajah';
import GaleriBeranda from '@/components/GaleriBeranda';
import Pahlawan from '@/components/Pahlawan';
import Perkiraan from '@/components/Perkiraan';
import Peta, { koordinat } from '@/components/Peta';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus, daftarLayanan, daftarUlasan, fotoSitus, gambarCadangan } from '@/lib/data';
import { kamus } from '@/lib/kamus';
import { dwi, paragraf, pilih, rupiah, tautanLuar, tautanWa } from '@/lib/format';
import { KISI, kisiSorotan, rentang } from '@/lib/kisi';
import { SATUAN } from '@/lib/satuan.mjs';
import { hariIni, tambahHari } from '@/lib/tanggal';
import { kursAktif } from '@/lib/uang-server';

const JUDUL = 'text-[clamp(2.1rem,1.5rem+2.4vw,3.25rem)]';
const WARNA_INISIAL = ['bg-biru-tua', 'bg-laut', 'bg-aksen', 'bg-laut-2'];

export default async function Beranda() {
  const [b, s, layanan, ulasan, foto, kurs] = await Promise.all([
    bahasaAktif(), ambilSitus(), daftarLayanan(), daftarUlasan(), fotoSitus(), kursAktif(),
  ]);
  const k = kamus(b);
  const wa = tautanWa(s.whatsapp, k.pesanWaUmum);
  const hari = hariIni();
  const tentangFoto = foto.tentang[0];
  const ajakanFoto = foto.ajakan[0];
  const titik = koordinat(s.petaKoordinat);
  const tautanPeta = s.petaTautan || (titik ? `https://www.google.com/maps?q=${titik.lat},${titik.lng}` : '');
  const rata = ulasan.length ? ulasan.reduce((n, u) => n + u.bintang, 0) / ulasan.length : 0;
  const angka1 = new Intl.NumberFormat(b === 'en' ? 'en-US' : 'id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const g = kisiSorotan(s.sorotan.length);

  // Photo cards under the hero, one per photo in Foto situs, plain and not
  // clickable. Until photos are uploaded three sea illustrations hold the place.
  const fotoKartu = foto.unggulan.length ? foto.unggulan : [undefined, undefined, undefined];
  const kartuUnggulan = fotoKartu.map((f, i) => (
    <div key={f?.id ?? i} className={`overflow-hidden rounded-[1.6rem] bg-buih shadow-lembut ring-[5px] ring-white ${fotoKartu.length === 1 ? 'aspect-[2/1]' : 'aspect-[4/3.3]'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={f?.url ?? gambarCadangan(i)} alt={f?.keterangan ?? ''} loading="lazy" width={f?.lebar || 1200} height={f?.tinggi || 800}
        className="size-full object-cover" />
    </div>
  ));
  const skor = Number(s.ulasanSkor.replace(',', '.'));
  const wajah = s.ulasanWajah.filter((x) => x.nama.trim() || x.wajah).slice(0, 6);
  const sumber = s.ulasanSumber.trim();
  const tautanUlasan = tautanLuar(s.ulasanTautan);

  return (
    <>
      <Pahlawan b={b} s={s} foto={foto.beranda[0]} fotoHp={foto.berandaHp[0]} />

      {kartuUnggulan.length > 0 && (
        <section id="pondok" className="relative z-10 mx-auto -mt-10 max-w-6xl scroll-mt-28 px-4 sm:-mt-14 sm:px-6">
          <h2 className="sr-only">{k.unggulanJudul}</h2>
          <GeserPondok
            kartu={kartuUnggulan}
            label={k.geser}
            samping={(
              <div className="lg:pr-2">
                {skor > 0 ? (
                  <div>
                    {wajah.length > 0 && (
                      <div className="flex -space-x-2" aria-hidden>
                        {wajah.map((x, i) => (
                          <span key={i} title={x.nama} className="inline-flex size-10 overflow-hidden rounded-full ring-[3px] ring-white">
                            <Wajah kunci={x.wajah} i={i} className="size-full" />
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <span className="rounded-xl rounded-bl-sm bg-laut px-2.5 py-2 font-judul text-xl leading-none text-white tabular-nums">{angka1.format(skor)}</span>
                      <p className="text-sm leading-tight text-abu">
                        {sumber && <span className="block font-bold text-laut">{sumber}</span>}
                        {k.nilaiTamu(s.ulasanSkala)}
                      </p>
                    </div>
                  </div>
                ) : ulasan.length > 0 && (
                  <div>
                    <div className="flex -space-x-2" aria-hidden>
                      {ulasan.slice(0, 3).map((u, i) => (
                        <span key={u.id} className={`inline-flex size-9 items-center justify-center rounded-full text-sm font-bold text-white ring-[3px] ring-white ${WARNA_INISIAL[i % WARNA_INISIAL.length]}`}>
                          {u.nama.trim().charAt(0).toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-laut">
                      <Ikon nama="bintang" className="size-4 fill-biru text-biru" />
                      {k.ulasanRingkas(angka1.format(rata), ulasan.length)}
                    </p>
                  </div>
                )}
                {tautanUlasan ? (
                  <a href={tautanUlasan} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-biru-tua hover:underline">
                    {k.lihatDi(sumber || 'Booking.com')} <Ikon nama="luar" className="size-4" />
                  </a>
                ) : (
                  <Link href="/kamar" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-biru-tua hover:underline">
                    {k.semuaPondok} <Ikon nama="panah" className="size-4" />
                  </Link>
                )}
              </div>
            )}
          />
        </section>
      )}

      <section id="tentang" className="scroll-mt-24 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.6fr)] lg:items-center lg:gap-12">
          <div>
            <h2 className={JUDUL}>{dwi(s.tentangJudul, b)}</h2>
            <div className="prosa mt-5 text-laut/80">
              {paragraf(dwi(s.tentangTeks, b)).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="mt-8">
              {wa
                ? <a href={wa} target="_blank" rel="noopener" className="tombol tombol-garis"><Ikon nama="chat" className="size-4" /> {k.tanyaWa}</a>
                : <Link href="/#lokasi" className="tombol tombol-garis">{k.nav.lokasi}</Link>}
            </div>
          </div>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tentangFoto?.url ?? '/merek/adegan-siang.svg'} alt={tentangFoto?.keterangan ?? ''} aria-hidden={tentangFoto ? undefined : true}
              width={tentangFoto?.lebar || 1600} height={tentangFoto?.tinggi || 1200} loading="lazy"
              className="aspect-[4/3] w-full rounded-[1.75rem] object-cover lg:ml-auto lg:aspect-[16/12] lg:w-[74%]" />
            <div className="relative mx-auto -mt-24 w-[calc(100%-2rem)] max-w-sm lg:absolute lg:top-[6%] lg:left-0 lg:mx-0 lg:mt-0 lg:w-[17.5rem]">
              <CariCepat b={b} awal={tambahHari(hari, s.jedaHari)} akhir={tambahHari(hari, s.batasHari)} checkIn={s.checkIn} checkOut={s.checkOut} />
            </div>
          </div>
        </div>
      </section>

      {s.sorotan.length > 0 && (
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="sr-only">{dwi(s.sorotanJudul, b)}</h2>
            <div className={`${g.induk} gap-4`}>
              {s.sorotan.map((x, i) => (
                <div key={i} className={`rounded-3xl bg-embun p-6 ${g.anak(i)}`}>
                  <div className="flex items-center gap-3">
                    <Ikon nama={x.ikon} className="size-7 shrink-0 text-biru-tua" tebal={1.5} />
                    <h3 className="text-xl">{dwi(x.judul, b)}</h3>
                  </div>
                  <p className="mt-3 text-[0.95rem] text-abu">{dwi(x.teks, b)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="bingkai relative isolate overflow-hidden bg-laut p-3 sm:p-4 lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ajakanFoto?.url ?? '/merek/adegan-pagi.svg'} alt={ajakanFoto?.keterangan ?? ''} aria-hidden={ajakanFoto ? undefined : true}
              width={ajakanFoto?.lebar || 1600} height={ajakanFoto?.tinggi || 1100} loading="lazy"
              className="aspect-[16/10] w-full rounded-[1.4rem] object-cover sm:rounded-[1.75rem]" />
            <div className="px-3 pt-8 pb-6 sm:px-6 lg:py-10 lg:pr-12">
              {dwi(s.ajakanLabel, b) && <p className="text-sm font-semibold tracking-wide text-sorot">{dwi(s.ajakanLabel, b)}</p>}
              <h2 className={`mt-3 text-white ${JUDUL}`}>{dwi(s.ajakanJudul, b)}</h2>
              <p className="mt-4 max-w-md text-white/80">{dwi(s.ajakanTeks, b)}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/pesan" className="tombol tombol-garis-putih">{k.cekTanggal}</Link>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/merek/simbol-putih.svg" alt="" aria-hidden width={400} height={300} className="pointer-events-none absolute -right-16 -bottom-10 -z-10 w-80 opacity-[0.07]" />
          </div>
        </div>
      </section>

      {layanan.length > 0 && (
        <Bagian id="kegiatan" className="!pt-0">
          <JudulBagian judul={dwi(s.layananJudul, b)} teks={dwi(s.layananTeks, b)} />
          <div className={`${KISI} gap-4`}>
            {layanan.map((l, i) => (
              <div key={l.id} className={`flex flex-col rounded-3xl bg-embun p-6 ${rentang(layanan.length, i)}`}>
                <div className="flex items-center gap-3">
                  <Ikon nama={l.ikon} className="size-7 shrink-0 text-biru-tua" tebal={1.5} />
                  <h3 className="text-xl">{pilih(b, l.nama, l.nama_en)}</h3>
                </div>
                <p className="mt-3 text-[0.95rem] text-abu">{pilih(b, l.keterangan, l.keterangan_en)}</p>
                <div className="mt-auto pt-5">
                  <p className="font-judul text-xl text-laut">{rupiah(l.harga, b)}</p>
                  <p className="text-sm text-abu">{SATUAN[l.satuan][b]}</p>
                  <Perkiraan idr={l.harga} kurs={kurs} b={b} className="mt-1 text-abu" />
                </div>
              </div>
            ))}
          </div>
        </Bagian>
      )}

      {foto.galeri.length > 0 && (
        <Bagian className="!pt-0">
          <JudulBagian judul={dwi(s.galeriJudul, b)} />
          <GaleriBeranda b={b} foto={foto.galeri} />
        </Bagian>
      )}

      {ulasan.length > 0 && (
        <Bagian className="!pt-0">
          <JudulBagian judul={dwi(s.ulasanJudul, b)} />
          <div className={`${KISI} gap-4`}>
            {ulasan.map((u, i) => (
              <figure key={u.id} className={`flex flex-col rounded-3xl bg-embun p-6 ${rentang(ulasan.length, i)}`}>
                <div className="flex gap-0.5 text-biru" role="img" aria-label={`${u.bintang}/5`}>
                  {Array.from({ length: 5 }, (_, j) => (
                    <svg key={j} viewBox="0 0 24 24" className="size-5" fill={j < u.bintang ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
                      <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="prosa mt-4 text-lg text-laut">{paragraf(u.isi).map((p, j) => <p key={j}>{p}</p>)}</blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-5">
                  <span aria-hidden className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-white ${WARNA_INISIAL[i % WARNA_INISIAL.length]}`}>
                    {u.nama.trim().charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="block font-bold text-laut">{u.nama}</span>
                    {u.asal && <span className="block text-sm text-abu">{u.asal}</span>}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Bagian>
      )}

      {s.langkah.length > 0 && (
        <Bagian className="!pt-0">
          <JudulBagian judul={dwi(s.caraJudul, b)} />
          <ol className={`${KISI} gap-4`}>
            {s.langkah.map((x, i) => (
              <li key={i} className={`rounded-3xl bg-embun p-6 ${rentang(s.langkah.length, i)}`}>
                <span className="font-judul text-4xl text-biru">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-xl">{dwi(x.judul, b)}</h3>
                <p className="mt-2 text-[0.95rem] text-abu">{dwi(x.teks, b)}</p>
              </li>
            ))}
          </ol>
          <Link href="/pesan" className="tombol mt-8">{k.pesanSekarang} <Ikon nama="panah" className="size-4" /></Link>
        </Bagian>
      )}

      <Bagian id="lokasi" className="!pt-0">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className={JUDUL}>{dwi(s.lokasiJudul, b)}</h2>
            <div className="prosa mt-5 text-laut/80">
              {paragraf(dwi(s.caraSampai, b)).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            {dwi(s.alamat, b) && (
              <p className="mt-6 flex items-start gap-3 rounded-2xl bg-embun px-4 py-3 text-laut">
                <Ikon nama="lokasi" className="mt-0.5 size-5 shrink-0 text-biru-tua" />
                <span className="whitespace-pre-line">{dwi(s.alamat, b)}</span>
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {tautanPeta && <a href={tautanPeta} target="_blank" rel="noopener" className="tombol tombol-laut"><Ikon nama="luar" className="size-4" /> {k.peta}</a>}
              {wa && <a href={wa} target="_blank" rel="noopener" className="tombol tombol-garis"><Ikon nama="chat" className="size-4" /> {k.tanyaWa}</a>}
            </div>
          </div>
          <div>
            {titik ? (
              <Peta titik={s.petaKoordinat} judul={dwi(s.lokasiJudul, b)} />
            ) : (
              <div className="relative overflow-hidden rounded-[1.75rem] bg-buih">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/merek/kamar-2.svg" alt="" aria-hidden width={1200} height={800} loading="lazy" className="w-full" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/merek/mambe-perahu-stiker.svg" alt="Mambe" width={200} height={220} loading="lazy" className="absolute bottom-3 left-1/2 h-[62%] w-auto -translate-x-1/2" />
              </div>
            )}
          </div>
        </div>
      </Bagian>

      {s.faq.length > 0 && (
        <Bagian id="tanya" lebar="max-w-3xl" className="!pt-0">
          <JudulBagian judul={dwi(s.faqJudul, b)} />
          <div className="grid gap-3">
            {s.faq.map((f, i) => (
              <details key={i} className="group rounded-2xl bg-embun px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-laut [&::-webkit-details-marker]:hidden">
                  {dwi(f.tanya, b)}
                  <Ikon nama="bawah" className="size-5 shrink-0 text-biru-tua transition-transform group-open:rotate-180" />
                </summary>
                <div className="prosa mt-3 text-laut/80">{paragraf(dwi(f.jawab, b)).map((p, j) => <p key={j}>{p}</p>)}</div>
              </details>
            ))}
          </div>
        </Bagian>
      )}
    </>
  );
}
