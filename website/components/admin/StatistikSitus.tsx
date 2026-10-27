// Website visitors on the dashboard, after the DAMPIER statistics block.
// One series per chart, so one hue and no legend box. Values ride the column
// caps, every column is a link that opens that day's details, and a hidden
// table carries the same numbers for screen readers.
import Link from 'next/link';
import { dbDiatur } from '@/lib/env';
import { statistikSitus, type Statistik } from '@/lib/statistik';
import { sahTanggal, ZONA } from '@/lib/tanggal';

const namaNegara = new Intl.DisplayNames(['id'], { type: 'region' });
const bendera = (k: string) => (k.length === 2 ? String.fromCodePoint(...[...k.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0))) : '');
const negara = (k: string) => {
  if (!k) return 'Tidak diketahui';
  try {
    return namaNegara.of(k) ?? k;
  } catch {
    return k;
  }
};
const fmt = (s: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('id-ID', { ...o, timeZone: 'UTC' }).format(new Date(`${s}T00:00:00Z`));
const angka = (n: number) => new Intl.NumberFormat('id-ID').format(n);

function Ubin({ label, nilai, ket, gelap }: { label: string; nilai: number; ket: string; gelap?: boolean }) {
  return (
    <div className={`rounded-2xl px-4 py-4 sm:px-5 ${gelap ? 'bg-panel-utama text-white' : 'bg-panel-latar text-panel-utama'}`}>
      <p className={`text-sm ${gelap ? 'text-white/75' : 'text-abu'}`}>{label}</p>
      <p className="mt-1 text-[1.6rem] leading-none font-bold tabular-nums sm:text-[2rem]">{angka(nilai)}</p>
      <p className={`mt-1 text-sm ${gelap ? 'text-white/75' : 'text-abu'}`}>pengunjung</p>
      <p className={`mt-2 text-xs ${gelap ? 'text-white/60' : 'text-abu'}`}>{ket}</p>
    </div>
  );
}

function Grafik({ s, hari, rentang, pilih }: { s: Statistik; hari: string; rentang: 7 | 30; pilih: string }) {
  const tinggi = Math.max(1, ...s.perHari.map((d) => d.pengunjung));
  const puncak = s.perHari.reduce((m, d) => (d.pengunjung > m.pengunjung ? d : m), s.perHari[0]);
  return (
    <div>
      <ol className="flex h-60 items-end gap-0.5 sm:gap-1" aria-hidden>
        {s.perHari.map((d, i) => {
          const tampilkan = rentang === 7 || d.tanggal === hari || (d.tanggal === puncak.tanggal && d.pengunjung > 0);
          const tinggiBatang = d.pengunjung ? Math.max(4, (d.pengunjung / tinggi) * 100) : 0;
          return (
            <li key={d.tanggal} className="group relative flex h-full min-w-0 flex-1">
              <Link href={`/admin?rentang=${rentang}&hari=${d.tanggal}#statistik`} scroll={false} tabIndex={-1}
                className={`flex h-full w-full flex-col items-center justify-end rounded-lg pt-6 ${d.tanggal === pilih ? 'bg-white' : 'hover:bg-white/60'}`}>
                <span className={`relative w-full max-w-6 rounded-t-[4px] ${d.pengunjung ? 'bg-panel-utama-2' : 'bg-panel-garis'}`} style={{ height: d.pengunjung ? `${tinggiBatang}%` : 2 }}>
                  {tampilkan && <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-xs font-semibold text-panel-utama/80 tabular-nums">{d.pengunjung}</span>}
                </span>
              </Link>
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-xl bg-panel-utama px-3 py-2 text-xs whitespace-nowrap text-white shadow-angkat group-hover:block">
                {fmt(d.tanggal, { weekday: 'short', day: 'numeric', month: 'short' })}
                <span className="block font-semibold">{d.pengunjung} pengunjung, {d.tampilan} tampilan</span>
              </span>
              {i === 0 && <span className="sr-only">Grafik pengunjung per hari</span>}
            </li>
          );
        })}
      </ol>
      <ol className="mt-2 flex gap-0.5 sm:gap-1" aria-hidden>
        {s.perHari.map((d, i) => (
          <li key={d.tanggal} className={`min-w-0 flex-1 text-center text-[0.6875rem] whitespace-nowrap ${d.tanggal === hari ? 'font-bold text-panel-utama' : 'text-abu'}`}>
            {d.tanggal === hari
              ? <>Hari<span className="block">ini</span></>
              : rentang === 7
                ? <>{fmt(d.tanggal, { weekday: 'short' })}<span className="block">{Number(d.tanggal.slice(8))}</span></>
                : i % 5 === 0 ? <>{Number(d.tanggal.slice(8))}<span className="block">{fmt(d.tanggal, { month: 'short' })}</span></> : ''}
          </li>
        ))}
      </ol>
      {/* the wrapper hides it, a table itself ignores the 1px width and pushes the page wider */}
      <div className="sr-only"><table>
        <caption>Pengunjung per hari, {rentang} hari terakhir</caption>
        <thead><tr><th>Tanggal</th><th>Pengunjung</th><th>Tampilan halaman</th></tr></thead>
        <tbody>
          {s.perHari.map((d) => <tr key={d.tanggal}><td>{fmt(d.tanggal, { day: 'numeric', month: 'long' })}</td><td>{d.pengunjung}</td><td>{d.tampilan}</td></tr>)}
        </tbody>
      </table></div>
      <p className="mt-3 text-xs text-abu">Pilih batang untuk melihat rincian hari itu di panel rincian.</p>
    </div>
  );
}

export default async function StatistikSitus({ hari, rentang, pilih: pilihArg }: { hari: string; rentang: 7 | 30; pilih?: string }) {
  if (!dbDiatur()) return null;
  const pilih = sahTanggal(pilihArg) && pilihArg <= hari ? pilihArg : hari;
  const s = await statistikSitus(hari, rentang, pilih).catch(() => null);
  if (!s) return null;
  const pukul = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZONA }).format(new Date()).replace(':', '.');
  const tombolRentang = (n: 7 | 30) => (
    <Link href={`/admin?rentang=${n}&hari=${pilih}#statistik`} scroll={false} aria-current={rentang === n ? 'true' : undefined}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${rentang === n ? 'bg-panel-utama text-white' : 'text-panel-utama hover:bg-white'}`}>
      {n} hari
    </Link>
  );
  return (
    <section id="statistik" className="kartu scroll-mt-24 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-kecil">Statistik situs</p>
          <h2 className="mt-1 text-[1.6rem] text-panel-utama">Pengunjung website</h2>
          <p className="mt-0.5 text-[0.9375rem] text-abu">Orang yang membuka situs dan halaman yang mereka lihat.</p>
        </div>
        <div className="sm:text-right">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff5e6] px-3 py-1 text-xs font-bold text-[#1f7a3d]">
            <span className="size-1.5 rounded-full bg-[#1f7a3d]" /> Langsung
          </span>
          <p className="mt-1 text-xs text-abu">Diperbarui {pukul} WIT</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Ubin gelap label="Aktif sekarang" nilai={s.aktif} ket="Dalam 5 menit terakhir" />
        <Ubin label="Hari ini" nilai={s.hari.pengunjung} ket={`${angka(s.hari.tampilan)} tampilan halaman`} />
        <Ubin label="7 hari terakhir" nilai={s.tujuh.pengunjung} ket={`${angka(s.tujuh.tampilan)} tampilan halaman`} />
        <Ubin label="30 hari terakhir" nilai={s.tigaPuluh.pengunjung} ket={`${angka(s.tigaPuluh.tampilan)} tampilan halaman`} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="rounded-2xl bg-panel-latar p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-panel-utama">Pengunjung per hari</h3>
              <p className="text-xs text-abu">{fmt(s.perHari[0].tanggal, { day: 'numeric', month: 'short' })}–{fmt(hari, { day: 'numeric', month: 'short' })}</p>
            </div>
            <div className="flex gap-1 rounded-full bg-panel-latar">{tombolRentang(7)}{tombolRentang(30)}</div>
          </div>
          <Grafik s={s} hari={hari} rentang={rentang} pilih={pilih} />
        </div>

        <div className="rounded-2xl bg-panel-lembut p-5 text-panel-utama">
          <h3 className="font-semibold">Rincian hari</h3>
          <p className="text-sm text-abu">{fmt(pilih, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <p className="mt-3 text-xs text-abu">Pengunjung</p>
          <p className="text-2xl font-bold tabular-nums">{angka(s.pilih.pengunjung)}</p>
          <p className="mt-2 text-xs text-abu">Tampilan halaman</p>
          <p className="text-2xl font-bold tabular-nums">{angka(s.pilih.tampilan)}</p>
          {s.pilih.negara.length > 0 && (
            <>
              <p className="mt-3 text-xs text-abu">Negara</p>
              <ul className="mt-1 grid gap-1 text-sm">
                {s.pilih.negara.map((n) => <li key={n.kode} className="flex justify-between gap-2"><span className="truncate">{bendera(n.kode)} {negara(n.kode)}</span><span className="tabular-nums">{n.n}</span></li>)}
              </ul>
            </>
          )}
          {s.pilih.halaman.length > 0 && (
            <>
              <p className="mt-3 text-xs text-abu">Halaman teratas</p>
              <ul className="mt-1 grid gap-1 text-sm">
                {s.pilih.halaman.map((h) => <li key={h.jalur} className="flex justify-between gap-2"><span className="truncate">{h.jalur}</span><span className="tabular-nums">{h.n}</span></li>)}
              </ul>
            </>
          )}
          {!s.pilih.tampilan && <p className="mt-3 text-sm text-abu">Belum ada kunjungan pada hari ini.</p>}
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-panel-latar p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-semibold text-panel-utama">Asal negara pengunjung</h3>
          <p className="text-xs text-abu">30 hari terakhir, {angka(s.totalNegara)} pengunjung</p>
        </div>
        {s.negara.length ? (
          <ul className="mt-3 grid gap-x-10 gap-y-2.5 md:grid-cols-2">
            {s.negara.map((n) => {
              const persen = s.totalNegara ? Math.round((n.n / s.totalNegara) * 100) : 0;
              return (
                <li key={n.kode} className="grid grid-cols-[9rem_minmax(0,1fr)_4.5rem] items-center gap-3 text-sm text-panel-utama">
                  <span className="truncate font-semibold">{bendera(n.kode)} {negara(n.kode)}</span>
                  <span className="h-2 rounded-full bg-white"><span className="block h-2 rounded-full bg-panel-utama-2" style={{ width: `${Math.max(2, persen)}%` }} /></span>
                  <span className="text-right text-abu tabular-nums">{n.n} · {persen}%</span>
                </li>
              );
            })}
          </ul>
        ) : <p className="mt-2 text-sm text-abu">Belum ada kunjungan dalam 30 hari terakhir.</p>}
        <p className="mt-3 text-xs text-abu">
          Negara diambil dari server bila tersedia, bila tidak ditebak dari bahasa peramban pengunjung. Situs menghitung sendiri tanpa cookie dan tanpa menyimpan alamat IP. Kunjungan pengelola yang sedang masuk panel tidak dihitung.
        </p>
      </div>
    </section>
  );
}
