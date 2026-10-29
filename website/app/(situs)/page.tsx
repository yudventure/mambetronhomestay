import Link from 'next/link';
import Bagian, { JudulBagian } from '@/components/Bagian';
import CariCepat from '@/components/CariCepat';
import GeserPondok from '@/components/GeserPondok';
import Ikon from '@/components/Ikon';
import Wajah from '@/components/Wajah';
import VideoTentang from '@/components/VideoTentang';
import KartuKegiatan from '@/components/KartuKegiatan';
import GaleriBeranda from '@/components/GaleriBeranda';
import Pahlawan from '@/components/Pahlawan';
import PetaRute from '@/components/PetaRute';
import { koordinat } from '@/components/Peta';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus, daftarKamar, daftarLayanan, daftarUlasan, fotoSitus, gambarCadangan, pemesananAktif, sisaKamar } from '@/lib/data';
import { kamus } from '@/lib/kamus';
import { dwi, paragraf, rapatRentang, tautanLuar, tautanWa } from '@/lib/format';
import { KISI, KISI2, rentang, rentang2 } from '@/lib/kisi';
import { hariIni, tambahHari } from '@/lib/tanggal';
import { kursAktif } from '@/lib/uang-server';
import { siapkanVideo } from '@/lib/video-server';

const JUDUL = 'text-[clamp(2.1rem,1.5rem+2.4vw,3.25rem)]';
const WARNA_INISIAL = ['bg-biru-tua', 'bg-laut', 'bg-aksen', 'bg-laut-2'];

export default async function Beranda() {
  const [b, s, layanan, ulasan, foto, kurs, kamar, aktif] = await Promise.all([
    bahasaAktif(), ambilSitus(), daftarLayanan(), daftarUlasan(), fotoSitus(), kursAktif(), daftarKamar(), pemesananAktif(),
  ]);
  const k = kamus(b);
  const wa = tautanWa(s.whatsapp, k.pesanWaUmum);
  const hari = hariIni();
  const awal = tambahHari(hari, s.jedaHari);
  const akhir = tambahHari(hari, s.batasHari);

  // Free bungalows per night over every type for the planner calendar. A
  // night is listed only when some unit is taken, as in sisaKamar.
  const peta = aktif && kamar.length ? await sisaKamar(kamar, hari, tambahHari(akhir, 61)).catch(() => new Map()) : new Map();
  const unit = kamar.reduce((n, x) => n + x.jumlah_unit, 0);
  const sisa: Record<string, number> = {};
  for (const x of kamar) for (const d of Object.keys(peta.get(x.id) ?? {})) sisa[d] = 0;
  for (const d of Object.keys(sisa)) sisa[d] = kamar.reduce((n, x) => n + (peta.get(x.id)?.[d] ?? x.jumlah_unit), 0);
  const tentangFoto = foto.tentang[0];
  const video = await siapkanVideo(s.tentangVideo.slice(0, 3));
  const titik = koordinat(s.petaKoordinat);
  const tautanPeta = s.petaTautan || (titik ? `https://www.google.com/maps?q=${titik.lat},${titik.lng}` : '');
  const info = s.lokasiInfo.filter((x) => dwi(x.teks, b));
  const catatanLokasi = dwi(s.lokasiCatatan, b);
  const rata = ulasan.length ? ulasan.reduce((n, u) => n + u.bintang, 0) / ulasan.length : 0;
  const angka1 = new Intl.NumberFormat(b === 'en' ? 'en-US' : 'id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  // Photo cards under the hero, one per photo in Foto situs, plain and not
  // clickable. Until photos are uploaded three sea illustrations hold the place.
  // The white frame is a border, not a ring, so the scrolling row cannot clip
  // it off the outer sides of the first and last card.
  const fotoKartu = foto.unggulan.length ? foto.unggulan : [undefined, undefined, undefined];
  const kartuUnggulan = fotoKartu.map((f, i) => (
    <div key={f?.id ?? i} className={`overflow-hidden rounded-[1.6rem] border-[5px] border-white bg-buih ${fotoKartu.length === 1 ? 'aspect-[2/1]' : 'aspect-[4/3.3]'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={f?.url ?? gambarCadangan(i)} alt={f?.keterangan ?? ''} loading="lazy" width={f?.lebar || 1200} height={f?.tinggi || 800}
        className="size-full object-cover" />
    </div>
  ));
  const skor = Number(s.ulasanSkor.replace(',', '.'));
  // real guest photos from Foto situs win over the drawn faces from Isi situs
  const fotoTamu = foto.tamu.slice(0, 6);
  const wajah = fotoTamu.length ? [] : s.ulasanWajah.filter((x) => x.nama.trim() || x.wajah).slice(0, 6);
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
                    {fotoTamu.length > 0 && (
                      <div className="flex -space-x-2" aria-hidden>
                        {fotoTamu.map((f) => (
                          <span key={f.id} title={f.keterangan || undefined} className="inline-flex size-10 overflow-hidden rounded-full bg-buih ring-[3px] ring-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f.url} alt="" width={80} height={80} loading="lazy" className="size-full object-cover" />
                          </span>
                        ))}
                      </div>
                    )}
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
          </div>
          {video.length > 0 ? (
            <VideoTentang b={b} video={video} sampulCadangan={tentangFoto?.url ?? '/merek/adegan-siang.svg'} />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={tentangFoto?.url ?? '/merek/adegan-siang.svg'} alt={tentangFoto?.keterangan ?? ''} aria-hidden={tentangFoto ? undefined : true}
              width={tentangFoto?.lebar || 1600} height={tentangFoto?.tinggi || 1200} loading="lazy"
              className="aspect-[4/3] w-full rounded-[1.75rem] object-cover lg:aspect-[16/11]" />
          )}
        </div>
        {/* stay planner with the calendar open, under the about text and photo */}
        <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 md:mt-16">
          <CariCepat b={b} awal={awal} akhir={akhir} checkIn={s.checkIn} checkOut={s.checkOut} sisa={sisa} unit={Math.max(1, unit)}
            kapasitas={Math.max(1, ...kamar.map((x) => x.kapasitas))} minMalam={kamar.length ? Math.max(1, Math.min(...kamar.map((x) => x.min_malam))) : 1}
            maksTamu={kamar.length ? Math.min(20, kamar.reduce((n, x) => n + x.kapasitas * x.jumlah_unit, 0)) : 6} />
        </div>
      </section>

      {layanan.length > 0 && (
        <Bagian id="kegiatan" className="!pt-0">
          <JudulBagian judul={dwi(s.layananJudul, b)} teks={dwi(s.layananTeks, b)} />
          <div className={`${KISI} gap-4 md:gap-5`}>
            {layanan.map((l, i) => (
              <KartuKegiatan key={l.id} b={b} l={l} i={i} kurs={kurs} label={k.pesanKegiatan}
                mendatar={layanan.length % 3 === 1 && i === layanan.length - 1} className={rentang(layanan.length, i)} />
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

      <Bagian id="lokasi" latar="buih">
        <div className="grid gap-x-6 gap-y-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-end">
          <div>
            {dwi(s.lokasiLabel, b) && <p className="label-kecil">{dwi(s.lokasiLabel, b)}</p>}
            <h2 className={`mt-2 ${JUDUL}`}>{dwi(s.lokasiJudul, b)}</h2>
          </div>
          {dwi(s.caraSampai, b) && (
            <div className="prosa text-laut/80 lg:pb-1.5">
              {paragraf(dwi(s.caraSampai, b)).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}
        </div>

        {/* map and steps side by side from xl, below that the steps line up under the map */}
        <div className="mt-10 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:gap-5">
          <PetaRute b={b} n={s.rute.length} className={s.rute.length ? '' : 'xl:col-span-2'} />
          {s.rute.length > 0 && (
            <ol className={`${KISI} gap-4 xl:grid-cols-1 xl:auto-rows-fr`}>
              {s.rute.map((x, i) => (
                <li key={i} className={`flex gap-4 rounded-3xl bg-white p-5 shadow-tipis sm:p-6 ${rentang(s.rute.length, i)} xl:col-span-1`}>
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-laut font-judul text-lg text-white">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                      <h3 className="pt-1.5 text-xl">{dwi(x.judul, b)}</h3>
                      {dwi(x.label, b) && <span className="rounded-full bg-buih px-3 py-1.5 text-xs font-bold whitespace-nowrap text-biru-tua">{rapatRentang(dwi(x.label, b))}</span>}
                    </div>
                    <p className="mt-2 text-[0.95rem] text-abu">{rapatRentang(dwi(x.teks, b))}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {(info.length > 0 || catatanLokasi || wa || tautanPeta || dwi(s.alamat, b)) && (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:gap-5">
            {info.length > 0 && (
              <ul className={`${KISI2} gap-4 ${catatanLokasi || wa || tautanPeta || dwi(s.alamat, b) ? '' : 'xl:col-span-2'}`}>
                {info.map((x, i) => (
                  <li key={i} className={`flex items-center gap-4 rounded-3xl bg-white/65 p-5 ${rentang2(info.length, i)}`}>
                    <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-biru-tua shadow-tipis">
                      <Ikon nama={x.ikon} className="size-5" />
                    </span>
                    <p className="text-[0.95rem] text-laut/85">{rapatRentang(dwi(x.teks, b))}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className={`pt-2 xl:px-1 xl:pt-3 ${info.length ? '' : 'xl:col-span-2'}`}>
              {dwi(s.alamat, b) && (
                <p className="mb-4 flex items-start gap-2.5 text-laut">
                  <Ikon nama="lokasi" className="mt-0.5 size-5 shrink-0 text-biru-tua" />
                  <span className="whitespace-pre-line">{dwi(s.alamat, b)}</span>
                </p>
              )}
              {catatanLokasi && <p className="max-w-xl text-[0.95rem] text-abu">{rapatRentang(catatanLokasi)}</p>}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                {wa && (
                  <a href={wa} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-bold text-biru-tua underline decoration-biru-tua/30 decoration-2 underline-offset-[6px] hover:decoration-biru-tua">
                    {k.tanyaRute} <Ikon nama="luar" className="size-4" />
                  </a>
                )}
                {tautanPeta && (
                  <a href={tautanPeta} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-bold text-biru-tua underline decoration-biru-tua/30 decoration-2 underline-offset-[6px] hover:decoration-biru-tua">
                    {k.peta} <Ikon nama="luar" className="size-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Bagian>

      {s.faq.length > 0 && (
        <Bagian id="tanya" lebar="max-w-3xl">
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
