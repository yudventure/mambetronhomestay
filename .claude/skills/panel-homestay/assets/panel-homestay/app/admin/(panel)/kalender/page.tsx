import Link from 'next/link';
import Ikon from '@/components/Ikon';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import PilihPondok from '@/components/admin/PilihPondok';
import TombolYakin from '@/components/admin/TombolYakin';
import { hapusTutup, tambahTutup } from '@/app/admin/aksi';
import { cariPesanan, daftarKamar, daftarTutup } from '@/lib/data';
import { bulanTahun, rentangTanggal, tanggal } from '@/lib/format';
import type { Pesanan } from '@/lib/jenis';
import { blokLuar, pastikanSegar, type BlokLuar } from '@/lib/sinkron';
import { awalBulan, hariDalamMinggu, hariIni, jumlahHariBulan, sahTanggal, tambahBulan, tambahHari } from '@/lib/tanggal';

export const metadata = { title: 'Kalender' };

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MUAT = 2;

// Dot colour carries the booking state, the legend under the grid names it.
const titik = (p: Pesanan) => (p.status === 'menunggu' ? 'bg-senja' : 'bg-panel-aksen');
// Nights taken on a booking site, read through calendar sync.
const UNGU = 'bg-[#7a5cc7]';

export default async function KalenderAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const hari = hariIni();
  const bulan = /^\d{4}-\d{2}$/.test(sp.bulan ?? '') && sahTanggal(`${sp.bulan}-01`) ? `${sp.bulan}-01` : awalBulan(hari);
  const kodeBulan = bulan.slice(0, 7);
  const akhirBulan = `${kodeBulan}-${String(jumlahHariBulan(bulan)).padStart(2, '0')}`;
  // Monday on or before the 1st, Sunday on or after the last day
  const mulai = tambahHari(bulan, -((hariDalamMinggu(bulan) + 6) % 7));
  const selesai = tambahHari(akhirBulan, (7 - hariDalamMinggu(akhirBulan)) % 7);
  const pilih = sahTanggal(sp.tgl) ? sp.tgl : '';

  pastikanSegar().catch(() => {});
  const [kamar, pesanan, tutup, luar] = await Promise.all([
    daftarKamar(true),
    cariPesanan({ dari: mulai, sampai: tambahHari(selesai, 1), urut: 'tiba', batas: 1000 }),
    daftarTutup(mulai),
    blokLuar(mulai, tambahHari(selesai, 1)).catch(() => [] as BlokLuar[]),
  ]);
  const pondok = kamar.find((k) => String(k.id) === sp.pondok);
  const kamarDilihat = pondok ? [pondok] : kamar.filter((k) => k.aktif);
  const hidup = pesanan.filter((p) => p.status !== 'batal' && (!pondok || p.kamar_id === pondok.id));
  const tutupDi = (d: string) => tutup.filter((t) => t.mulai <= d && t.akhir >= d && (!pondok || t.kamar_id == null || t.kamar_id === pondok.id));
  const menginapDi = (d: string) => hidup.filter((p) => p.check_in <= d && p.check_out > d);
  const unitAda = (b: BlokLuar) => b.unit <= (kamar.find((k) => k.id === b.kamar_id)?.jumlah_unit ?? 0);
  const luarDi = (d: string) => luar.filter((b) => b.mulai <= d && b.selesai > d && unitAda(b) && (!pondok || b.kamar_id === pondok.id));
  // one chip per site, with the units it took that night
  const luarPerSitus = (d: string) => {
    const m = new Map<string, { nama: string; kamar: number; unit: Set<number> }>();
    for (const b of luarDi(d)) {
      const k = `${b.kamar_id}|${b.nama}`;
      const x = m.get(k) ?? { nama: b.nama, kamar: b.kamar_id, unit: new Set<number>() };
      x.unit.add(b.unit);
      m.set(k, x);
    }
    return [...m.entries()];
  };
  // units taken that night, a unit counts once whether booked here or on a booking site
  const terisiDi = (d: string, k: (typeof kamar)[number]) => {
    if (tutupDi(d).some((t) => t.kamar_id == null || t.kamar_id === k.id)) return k.jumlah_unit;
    const sini = hidup.filter((p) => p.kamar_id === k.id && p.check_in <= d && p.check_out > d).reduce((a, p) => a + p.jumlah_kamar, 0);
    const sana = new Set(luarDi(d).filter((b) => b.kamar_id === k.id).map((b) => b.unit)).size;
    return Math.min(k.jumlah_unit, sini + sana);
  };
  const totalUnit = kamarDilihat.reduce((a, k) => a + k.jumlah_unit, 0);
  const terisiSemua = (d: string) => kamarDilihat.reduce((a, k) => a + terisiDi(d, k), 0);
  const penuhDi = (d: string) => kamarDilihat.length > 0 && kamarDilihat.every((k) => terisiDi(d, k) >= k.jumlah_unit);
  // with one hut type the type name says nothing, the guest name is enough
  const satuJenis = Boolean(pondok) || kamar.filter((k) => k.aktif).length === 1;

  const hariGrid: string[] = [];
  for (let d = mulai; d <= selesai; d = tambahHari(d, 1)) hariGrid.push(d);
  const tautan = (b: string, extra = '') => `/admin/kalender?bulan=${b.slice(0, 7)}${pondok ? `&pondok=${pondok.id}` : ''}${extra}`;
  const kembali = tautan(bulan, pilih ? `&tgl=${pilih}` : '');
  const namaPenuh = 'Penuh';

  const detail = pilih && {
    tiba: hidup.filter((p) => p.check_in === pilih),
    pulang: hidup.filter((p) => p.check_out === pilih),
    menginap: menginapDi(pilih),
    tutup: tutupDi(pilih),
    luar: luarDi(pilih),
  };

  return (
    <>
      <JudulAdmin label={`Meja pengelola · ${bulanTahun(bulan, 'id')}`} judul="Kalender" teks="Tamu yang menginap tiap malam, malam yang terisi dari OTA, dan tanggal yang ditutup. Pilih tanggal untuk melihat kegiatan hari itu." />
      <Kabar ok={sp.ok} galat={sp.galat} pesan={{ 'ok:tutup': 'Tanggal tutup sudah ditambahkan.', 'galat:tanggal': 'Tanggal tutup belum benar.' }} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href={tautan(tambahBulan(bulan, -1))} className="inline-flex size-11 items-center justify-center rounded-full text-panel-utama ring-1 ring-panel-garis hover:bg-panel-latar" aria-label="Bulan sebelumnya"><Ikon nama="kiri" className="size-4" /></Link>
        <Link href={tautan(tambahBulan(bulan, 1))} className="inline-flex size-11 items-center justify-center rounded-full text-panel-utama ring-1 ring-panel-garis hover:bg-panel-latar" aria-label="Bulan berikutnya"><Ikon nama="kanan" className="size-4" /></Link>
        <h2 className="text-[1.6rem] text-panel-utama capitalize">{bulanTahun(bulan, 'id')}</h2>
        {kodeBulan !== hari.slice(0, 7) && <Link href={tautan(hari)} className="text-sm font-semibold text-panel-aksen hover:underline">Ke bulan ini</Link>}
        <div className="ml-auto"><PilihPondok kamar={kamar.map((k) => ({ id: k.id, nama: k.nama }))} nilai={pondok ? String(pondok.id) : ''} bulan={kodeBulan} /></div>
      </div>

      <div className="rounded-[1.75rem] bg-panel-latar p-1.5 sm:p-3">
        <ol className="grid grid-cols-7 gap-1 sm:gap-2" aria-hidden>
          {HARI.map((h) => <li key={h} className="py-2 text-center text-[0.6875rem] font-bold tracking-[0.14em] text-panel-utama/70 uppercase sm:text-xs">{h}</li>)}
        </ol>
        <ol className="grid grid-cols-7 gap-1 sm:gap-2">
          {hariGrid.map((d) => {
            const diBulan = d.slice(0, 7) === kodeBulan;
            const tamu = menginapDi(d);
            const tt = tutupDi(d);
            const situsLain = luarPerSitus(d);
            const penuh = penuhDi(d);
            const terisi = terisiSemua(d);
            const butir = [
              ...(penuh ? [{ k: 'penuh', el: <span className="block truncate rounded-md bg-panel-lembut px-1.5 py-0.5 font-semibold text-panel-utama">{namaPenuh}</span> }] : []),
              ...tt.map((t) => ({ k: `t${t.id}`, el: <span className="block truncate rounded-md bg-[#fde3dc] px-1.5 py-0.5 text-merah">Tutup{t.alasan ? ` · ${t.alasan}` : ''}</span> })),
              ...tamu.map((p) => ({
                k: `p${p.id}`,
                el: <span className="flex items-center gap-1.5 truncate rounded-md bg-panel-latar px-1.5 py-0.5 text-panel-utama/90"><span className={`size-1.5 shrink-0 rounded-full ${titik(p)}`} /><span className="truncate">{satuJenis ? p.nama : `${p.kamar_nama} · ${p.nama}`}{p.jumlah_kamar > 1 ? ` ×${p.jumlah_kamar}` : ''}</span></span>,
              })),
              ...situsLain.map(([kunci, x]) => ({
                k: `l${kunci}`,
                el: <span className="flex items-center gap-1.5 truncate rounded-md bg-[#f1edfb] px-1.5 py-0.5 text-[#4b3a8c]"><span className={`size-1.5 shrink-0 rounded-full ${UNGU}`} /><span className="truncate">{x.nama} · unit {[...x.unit].sort((a, b) => a - b).join(', ')}</span></span>,
              })),
            ];
            const lebih = Math.max(0, butir.length - MUAT);
            return (
              <li key={d}>
                <Link href={tautan(bulan, `&tgl=${d}`)} scroll={false}
                  aria-label={`${tanggal(d, 'id', 'panjang')}, ${terisi} dari ${totalUnit} unit terisi, ${tamu.length} pesanan menginap${situsLain.length ? `, terisi dari ${situsLain.map(([, x]) => x.nama).join(' dan ')}` : ''}${penuh ? ', penuh' : ''}${tt.length ? ', ada tanggal tutup' : ''}`}
                  className={`flex h-full min-h-[4.25rem] min-w-0 flex-col rounded-xl p-1.5 transition-shadow sm:min-h-[8.75rem] sm:rounded-2xl sm:p-2.5 ${diBulan ? 'bg-white' : 'bg-white/50'} ${d === pilih ? 'ring-2 ring-panel-utama' : 'hover:shadow-tipis'}`}>
                  <span className="flex items-center justify-between gap-1">
                    <span className={`inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold sm:size-8 sm:text-base ${d === hari ? 'bg-panel-utama text-white' : diBulan ? 'text-panel-utama' : 'text-abu/60'}`}>{Number(d.slice(8))}</span>
                    {terisi > 0 && !penuh && totalUnit > 1 && <span className="hidden text-xs font-semibold text-abu tabular-nums sm:inline">{terisi}/{totalUnit}</span>}
                  </span>
                  <span className="mt-1 hidden min-w-0 grid-cols-[minmax(0,1fr)] gap-1 text-xs sm:grid">
                    {butir.slice(0, MUAT + (lebih === 1 ? 1 : 0)).map((b) => <span key={b.k}>{b.el}</span>)}
                    {lebih > 1 && <span className="px-1 text-abu">+{lebih} lagi</span>}
                  </span>
                  {butir.length > 0 && (
                    <span className="mt-auto flex flex-wrap gap-0.5 sm:hidden" aria-hidden>
                      {penuh && <span className="h-1.5 w-full rounded-full bg-panel-utama" />}
                      {!penuh && tamu.slice(0, 4).map((p) => <span key={p.id} className={`size-1.5 rounded-full ${titik(p)}`} />)}
                      {!penuh && situsLain.slice(0, 3).map(([kunci]) => <span key={kunci} className={`size-1.5 rounded-full ${UNGU}`} />)}
                      {!penuh && tt.length > 0 && <span className="size-1.5 rounded-full bg-merah" />}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 px-2 pt-3 pb-1 text-xs text-abu sm:text-sm">
          <li className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-panel-aksen" />Dikonfirmasi atau lunas</li>
          <li className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-senja" />Menunggu uang muka</li>
          <li className="inline-flex items-center gap-2"><span className={`size-2 rounded-full ${UNGU}`} />Terisi dari OTA</li>
          <li className="inline-flex items-center gap-2"><span className="h-2 w-4 rounded-full bg-panel-lembut ring-1 ring-panel-utama/20 max-sm:h-1.5 max-sm:bg-panel-utama max-sm:ring-0" />Semua bungalow penuh</li>
          <li className="inline-flex items-center gap-2"><span className="h-2 w-4 rounded-full bg-[#fde3dc] max-sm:size-2 max-sm:bg-merah" />Tutup</li>
        </ul>
      </div>

      {detail && (
        <section id="hari" className="kartu mt-6 scroll-mt-24 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="label-kecil">Kegiatan hari itu</p>
              <h2 className="mt-1 text-[1.5rem] text-panel-utama">{tanggal(pilih, 'id', 'panjang')}</h2>
            </div>
            <Link href={tautan(bulan)} scroll={false} className="inline-flex size-10 items-center justify-center rounded-full text-panel-utama ring-1 ring-panel-garis hover:bg-panel-latar" aria-label="Tutup rincian"><Ikon nama="silang" className="size-4" /></Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {([['Tiba', detail.tiba], ['Pulang', detail.pulang], ['Menginap malam ini', detail.menginap]] as const).map(([judul, daftar]) => (
              <div key={judul} className="rounded-2xl bg-panel-latar p-4">
                <p className="text-sm font-semibold text-panel-utama">{judul}<span className="ml-1.5 text-abu">{daftar.length}</span></p>
                {daftar.length ? (
                  <ul className="mt-2 grid gap-1.5">
                    {daftar.map((p) => (
                      <li key={p.id}>
                        <Link href={`/admin/pesanan/${p.id}`} className="block rounded-xl bg-white px-3 py-2 hover:shadow-tipis">
                          <span className="flex items-center gap-2 font-semibold text-panel-utama"><span className={`size-2 shrink-0 rounded-full ${titik(p)}`} />{p.nama}</span>
                          <span className="block text-sm text-abu">{p.kamar_nama}{p.jumlah_kamar > 1 ? ` ×${p.jumlah_kamar}` : ''}, {p.dewasa + p.anak} tamu, {p.kode}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-1 text-sm text-abu">Tidak ada.</p>}
              </div>
            ))}
          </div>
          {detail.luar.length > 0 && (
            <div className="mt-3 rounded-2xl bg-[#f1edfb] p-4">
              <p className="text-sm font-semibold text-[#4b3a8c]">Terisi dari OTA<span className="ml-1.5 opacity-70">{detail.luar.length}</span></p>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {detail.luar.map((b, i) => (
                  <li key={`${b.sambungan_id}-${b.mulai}-${i}`} className="rounded-xl bg-white px-3 py-2">
                    <span className="flex items-center gap-2 font-semibold text-panel-utama"><span className={`size-2 shrink-0 rounded-full ${UNGU}`} />{b.nama}, unit {b.unit}</span>
                    <span className="block text-sm text-abu">{kamar.find((k) => k.id === b.kamar_id)?.nama ?? 'Bungalow'}, {rentangTanggal(b.mulai, b.selesai)}{b.ringkas ? `, ${b.ringkas}` : ''}</span>
                  </li>
                ))}
              </ul>
              <Link href="/admin/sinkron" className="mt-2 inline-block text-sm font-semibold text-[#4b3a8c] hover:underline">Atur sinkron OTA</Link>
            </div>
          )}
          {detail.tutup.length > 0 && (
            <p className="mt-3 rounded-2xl bg-[#fde3dc] px-4 py-3 text-sm font-semibold text-merah">
              Ditutup untuk {detail.tutup.map((t) => (t.kamar_id ? kamar.find((k) => k.id === t.kamar_id)?.nama ?? 'bungalow terhapus' : 'semua bungalow')).join(', ')}
            </p>
          )}
        </section>
      )}

      <section className="kartu mt-6 p-5 sm:p-6">
        <p className="label-kecil">Tanggal tutup</p>
        <h2 className="mt-1 text-[1.5rem] text-panel-utama">Tutup tanggal</h2>
        <p className="mt-1 text-sm text-abu">Untuk perbaikan, acara keluarga, atau tamu yang memesan di luar situs tanpa dicatat. Tamu tidak bisa memesan malam yang ditutup.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <form action={tambahTutup} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="kembali" value={kembali} />
            <div className="sm:col-span-2">
              <label className="label-isian" htmlFor="kamar_id">Bungalow</label>
              <select id="kamar_id" name="kamar_id" className="isian" defaultValue={pondok ? String(pondok.id) : ''}>
                <option value="">Semua bungalow</option>
                {kamar.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div><label className="label-isian" htmlFor="mulai">Malam pertama</label><input id="mulai" name="mulai" type="date" required min={hari} defaultValue={pilih && pilih >= hari ? pilih : undefined} className="isian" /></div>
            <div><label className="label-isian" htmlFor="akhir">Malam terakhir</label><input id="akhir" name="akhir" type="date" min={hari} className="isian" /></div>
            <div className="sm:col-span-2"><label className="label-isian" htmlFor="alasan">Alasan</label><input id="alasan" name="alasan" className="isian" placeholder="Hanya terlihat di panel" /></div>
            <button className="tombol tombol-laut tombol-kecil !bg-panel-utama sm:col-span-2">Tutup tanggal ini</button>
          </form>
          {tutup.filter((t) => t.akhir >= hari).length > 0 ? (
            <ul className="grid content-start gap-2">
              {tutup.filter((t) => t.akhir >= hari).map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-panel-latar px-4 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-panel-utama">{t.kamar_id ? kamar.find((k) => k.id === t.kamar_id)?.nama ?? 'Bungalow terhapus' : 'Semua bungalow'}</span>
                    <span className="block text-sm text-abu">{tanggal(t.mulai, 'id')} sampai {tanggal(t.akhir, 'id')}{t.alasan ? `, ${t.alasan}` : ''}</span>
                  </span>
                  <form action={hapusTutup}><input type="hidden" name="id" value={t.id} />
                    <TombolYakin tanya="Buka lagi tanggal ini untuk pemesanan?" className="inline-flex size-9 items-center justify-center rounded-full bg-white text-merah"><Ikon nama="sampah" className="size-4" /><span className="sr-only">Hapus</span></TombolYakin>
                  </form>
                </li>
              ))}
            </ul>
          ) : <p className="rounded-2xl bg-panel-latar px-4 py-3 text-sm text-abu">Belum ada tanggal yang ditutup.</p>}
        </div>
      </section>
    </>
  );
}
