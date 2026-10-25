import Link from 'next/link';
import Bagian, { JudulBagian, type Latar } from '@/components/Bagian';
import CariCepat from '@/components/CariCepat';
import Ikon from '@/components/Ikon';
import KartuKamar from '@/components/KartuKamar';
import Peta, { koordinat } from '@/components/Peta';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus, daftarKamar, daftarLayanan, daftarUlasan, fotoSitus } from '@/lib/data';
import { kamus } from '@/lib/kamus';
import { dwi, paragraf, pilih, rupiah, tautanWa } from '@/lib/format';
import { KISI, kisiSorotan, rentang } from '@/lib/kisi';
import { SATUAN } from '@/lib/satuan.mjs';
import { hariIni, tambahHari } from '@/lib/tanggal';

export default async function Beranda() {
  const [b, s, kamar, layanan, ulasan, foto] = await Promise.all([
    bahasaAktif(), ambilSitus(), daftarKamar(), daftarLayanan(), daftarUlasan(), fotoSitus(),
  ]);
  const k = kamus(b);
  const wa = tautanWa(s.whatsapp, k.pesanWaUmum);
  const hari = hariIni();
  const heroFoto = foto.beranda[0];
  const tentangFoto = foto.tentang[0];
  const titik = koordinat(s.petaKoordinat);
  const tautanPeta = s.petaTautan || (titik ? `https://www.google.com/maps?q=${titik.lat},${titik.lng}` : '');

  // light sections alternate between white and foam, dark ones stay sea blue
  const bagian: { kunci: string; gelap?: boolean; ada: boolean; isi: (latar: Latar) => React.ReactNode }[] = [
    {
      kunci: 'sorotan', ada: s.sorotan.length > 0, isi: (latar) => {
        const g = kisiSorotan(s.sorotan.length);
        return (
          <Bagian latar={latar} key="sorotan">
            <JudulBagian judul={dwi(s.sorotanJudul, b)} />
            <div className={`${g.induk} gap-5`}>
              {s.sorotan.map((x, i) => (
                <div key={i} className={`rounded-3xl p-6 ${latar === 'buih' ? 'bg-white' : 'bg-buih'} ${g.anak(i)}`}>
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-toska-tua text-white"><Ikon nama={x.ikon} className="size-6" /></span>
                  <h3 className="mt-4 text-xl">{dwi(x.judul, b)}</h3>
                  <p className="mt-2 text-abu">{dwi(x.teks, b)}</p>
                </div>
              ))}
            </div>
          </Bagian>
        );
      },
    },
    {
      kunci: 'pondok', ada: kamar.length > 0, isi: (latar) => (
        <Bagian latar={latar} id="pondok" key="pondok">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <JudulBagian judul={dwi(s.kamarJudul, b)} teks={dwi(s.kamarTeks, b)} />
            <Link href="/kamar" className="mb-10 inline-flex items-center gap-1 font-semibold text-toska-tua hover:underline">{k.semuaPondok} <Ikon nama="panah" className="size-4" /></Link>
          </div>
          <div className={`${KISI} gap-6`}>
            {kamar.map((x, i) => <KartuKamar key={x.id} kamar={x} b={b} i={i} className={rentang(kamar.length, i)} />)}
          </div>
        </Bagian>
      ),
    },
    {
      kunci: 'tentang', ada: true, isi: (latar) => (
        <Bagian latar={latar} id="tentang" key="tentang">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-2 lg:order-1">
              {tentangFoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tentangFoto.url} alt={tentangFoto.keterangan} width={tentangFoto.lebar} height={tentangFoto.tinggi} loading="lazy" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lembut" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-[2rem] bg-pasir">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/merek/mambe-santai-stiker.svg" alt="Mambe" width={320} height={350} className="h-[80%] w-auto" />
                </div>
              )}
            </div>
            <div className="order-1 lg:order-2">
              <p className="label-kecil">{k.nav.tentang}</p>
              <h2 className="mt-2 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">{dwi(s.tentangJudul, b)}</h2>
              <div className="prosa mt-5 text-lg text-laut/85">
                {paragraf(dwi(s.tentangTeks, b)).map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="mt-6 grid max-w-md grid-cols-2 gap-3">
                <div className="rounded-2xl bg-buih px-4 py-3">
                  <p className="text-sm text-abu">{k.checkInOut.masuk}</p>
                  <p className="font-judul text-xl font-semibold text-laut">{s.checkIn}</p>
                </div>
                <div className="rounded-2xl bg-buih px-4 py-3">
                  <p className="text-sm text-abu">{k.checkInOut.keluar}</p>
                  <p className="font-judul text-xl font-semibold text-laut">{s.checkOut}</p>
                </div>
              </div>
            </div>
          </div>
        </Bagian>
      ),
    },
    {
      kunci: 'galeri', ada: foto.galeri.length > 0, isi: (latar) => (
        <Bagian latar={latar} key="galeri">
          <JudulBagian judul={dwi(s.galeriJudul, b)} />
          <div className="columns-2 gap-4 md:columns-3">
            {foto.galeri.map((f) => (
              <figure key={f.id} className="mb-4 break-inside-avoid">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.keterangan} width={f.lebar} height={f.tinggi} loading="lazy" className="w-full rounded-2xl" />
                {f.keterangan && <figcaption className="mt-1.5 text-sm text-abu">{f.keterangan}</figcaption>}
              </figure>
            ))}
          </div>
        </Bagian>
      ),
    },
    {
      kunci: 'layanan', gelap: true, ada: layanan.length > 0, isi: () => (
        <section id="kegiatan" key="layanan" className="bg-laut bg-[url('/merek/pola.svg')] bg-[length:300px] py-16 text-white md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <JudulBagian terang judul={dwi(s.layananJudul, b)} teks={dwi(s.layananTeks, b)} />
            <div className={`${KISI} gap-5`}>
              {layanan.map((l, i) => (
                <div key={l.id} className={`flex flex-col rounded-3xl bg-white p-6 text-hitam ${rentang(layanan.length, i)}`}>
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-buih text-toska-tua"><Ikon nama={l.ikon} className="size-6" /></span>
                  <h3 className="mt-4 text-xl">{pilih(b, l.nama, l.nama_en)}</h3>
                  <p className="mt-2 text-abu">{pilih(b, l.keterangan, l.keterangan_en)}</p>
                  <div className="mt-auto pt-5">
                    <p className="font-judul text-xl font-semibold text-laut">{rupiah(l.harga, b)}</p>
                    <p className="text-sm text-abu">{SATUAN[l.satuan][b]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ),
    },
    {
      kunci: 'langkah', ada: s.langkah.length > 0, isi: (latar) => (
        <Bagian latar={latar} key="langkah">
          <JudulBagian judul={dwi(s.caraJudul, b)} />
          <ol className={`${KISI} gap-5`}>
            {s.langkah.map((x, i) => (
              <li key={i} className={`rounded-3xl p-6 ${latar === 'buih' ? 'bg-white' : 'bg-buih'} ${rentang(s.langkah.length, i)}`}>
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-senja font-judul text-xl font-bold text-hitam">{i + 1}</span>
                <h3 className="mt-4 text-xl">{dwi(x.judul, b)}</h3>
                <p className="mt-2 text-abu">{dwi(x.teks, b)}</p>
              </li>
            ))}
          </ol>
          <Link href="/pesan" className="tombol mt-10">{k.pesanSekarang}</Link>
        </Bagian>
      ),
    },
    {
      kunci: 'ulasan', ada: ulasan.length > 0, isi: (latar) => (
        <Bagian latar={latar} key="ulasan">
          <JudulBagian judul={dwi(s.ulasanJudul, b)} />
          <div className={`${KISI} gap-5`}>
            {ulasan.map((u, i) => (
              <figure key={u.id} className={`flex flex-col rounded-3xl p-6 ${latar === 'buih' ? 'bg-white' : 'bg-buih'} ${rentang(ulasan.length, i)}`}>
                <div className="flex gap-0.5 text-senja" role="img" aria-label={`${u.bintang}/5`}>
                  {Array.from({ length: 5 }, (_, j) => (
                    <svg key={j} viewBox="0 0 24 24" className="size-5" fill={j < u.bintang ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
                      <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="prosa mt-4 text-lg text-laut">{paragraf(u.isi).map((p, j) => <p key={j}>{p}</p>)}</blockquote>
                <figcaption className="mt-auto pt-5">
                  <span className="block font-bold text-laut">{u.nama}</span>
                  {u.asal && <span className="block text-sm text-abu">{u.asal}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </Bagian>
      ),
    },
    {
      kunci: 'lokasi', ada: true, isi: (latar) => (
        <Bagian latar={latar} id="lokasi" key="lokasi">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="label-kecil">{k.nav.lokasi}</p>
              <h2 className="mt-2 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">{dwi(s.lokasiJudul, b)}</h2>
              <div className="prosa mt-5 text-lg text-laut/85">
                {paragraf(dwi(s.caraSampai, b)).map((p, i) => <p key={i}>{p}</p>)}
              </div>
              {dwi(s.alamat, b) && (
                <p className="mt-6 flex items-start gap-3 rounded-2xl bg-buih px-4 py-3 text-laut">
                  <Ikon nama="lokasi" className="mt-0.5 size-5 shrink-0 text-toska-tua" />
                  <span className="whitespace-pre-line">{dwi(s.alamat, b)}</span>
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                {tautanPeta && <a href={tautanPeta} target="_blank" rel="noopener" className="tombol tombol-laut"><Ikon nama="luar" /> {k.peta}</a>}
                {wa && <a href={wa} target="_blank" rel="noopener" className="tombol tombol-putih"><Ikon nama="chat" /> {k.tanyaWa}</a>}
              </div>
            </div>
            <div>
              {titik ? (
                <Peta titik={s.petaKoordinat} judul={dwi(s.lokasiJudul, b)} />
              ) : (
                <div className="relative overflow-hidden rounded-[2rem] bg-buih">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/merek/kamar-2.svg" alt="" aria-hidden width={1200} height={800} className="w-full" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/merek/mambe-perahu-stiker.svg" alt="Mambe" width={200} height={220} className="absolute bottom-3 left-1/2 h-[62%] w-auto -translate-x-1/2" />
                </div>
              )}
            </div>
          </div>
        </Bagian>
      ),
    },
    {
      kunci: 'faq', ada: s.faq.length > 0, isi: (latar) => (
        <Bagian latar={latar} id="tanya" lebar="max-w-3xl" key="faq">
          <JudulBagian judul={dwi(s.faqJudul, b)} />
          <div className="grid gap-3">
            {s.faq.map((f, i) => (
              <details key={i} className={`group rounded-2xl px-5 py-4 ${latar === 'buih' ? 'bg-white' : 'bg-buih'}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-laut [&::-webkit-details-marker]:hidden">
                  {dwi(f.tanya, b)}
                  <Ikon nama="bawah" className="size-5 shrink-0 text-toska-tua transition-transform group-open:rotate-180" />
                </summary>
                <div className="prosa mt-3 text-laut/85">{paragraf(dwi(f.jawab, b)).map((p, j) => <p key={j}>{p}</p>)}</div>
              </details>
            ))}
          </div>
        </Bagian>
      ),
    },
    {
      kunci: 'ajakan', gelap: true, ada: true, isi: () => (
        <section key="ajakan" className="bg-laut-2 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-[auto_1fr] md:py-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/merek/mambe-sapa-stiker.svg" alt="Mambe" width={200} height={220} loading="lazy" className="h-44 w-auto md:h-56" />
            <div>
              <h2 className="text-[clamp(2rem,1.5rem+2vw,3rem)] !text-white">{dwi(s.ajakanJudul, b)}</h2>
              <p className="mt-3 max-w-xl text-lg text-white/80">{dwi(s.ajakanTeks, b)}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/pesan" className="tombol">{k.cekTanggal}</Link>
                {wa && <a href={wa} target="_blank" rel="noopener" className="tombol tombol-putih"><Ikon nama="chat" /> {k.tanyaWa}</a>}
              </div>
            </div>
          </div>
        </section>
      ),
    },
  ];

  let terang = 0;
  const isi = bagian.filter((x) => x.ada).map((x) => {
    if (x.gelap) {
      terang = 0;
      return x.isi('laut');
    }
    const latar: Latar = terang++ % 2 === 0 ? 'putih' : 'buih';
    return x.isi(latar);
  });

  return (
    <>
      <section className="bg-buih">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16">
          <div className="lg:pb-16">
            <p className="label-kecil">{dwi(s.heroLabel, b)}</p>
            <h1 className="mt-3 text-[clamp(2.6rem,1.7rem+3.8vw,4.5rem)] font-bold">{dwi(s.heroJudul, b)}</h1>
            <p className="mt-5 max-w-xl text-lg text-laut/80 sm:text-xl">{dwi(s.heroTeks, b)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pesan" className="tombol">{k.cekTanggal}</Link>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener" className="tombol tombol-putih"><Ikon nama="chat" /> {k.tanyaWa}</a>
              ) : (
                <Link href="/kamar" className="tombol tombol-putih">{k.lihatPondok}</Link>
              )}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            {heroFoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroFoto.url} alt={heroFoto.keterangan} width={heroFoto.lebar} height={heroFoto.tinggi} fetchPriority="high" className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-angkat" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/merek/kamar-1.svg" alt="" aria-hidden width={1200} height={800} className="aspect-[5/4] w-full rounded-[2rem] object-cover shadow-angkat" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/merek/mambe-sapa-stiker.svg" alt="Mambe" width={200} height={220} className="absolute -bottom-2 -left-3 h-36 w-auto sm:h-44 lg:-left-10 lg:h-52" />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-14 sm:px-6 md:pb-20 lg:pt-6">
          <CariCepat b={b} awal={tambahHari(hari, s.jedaHari)} akhir={tambahHari(hari, s.batasHari)} />
        </div>
      </section>
      {isi}
    </>
  );
}
