import Link from 'next/link';
import Ikon from '@/components/Ikon';
import BarisPesanan from '@/components/admin/BarisPesanan';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import TombolYakin from '@/components/admin/TombolYakin';
import { hapusTutup, tambahTutup } from '@/app/admin/aksi';
import { cariPesanan, daftarKamar, daftarTutup } from '@/lib/data';
import { tanggal } from '@/lib/format';
import { daftarMalam, hariDalamMinggu, hariIni, sahTanggal, tambahHari } from '@/lib/tanggal';

export const metadata = { title: 'Kalender' };

const HARI = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
const RENTANG = 28;

export default async function KalenderAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const hari = hariIni();
  const mulai = sahTanggal(sp.mulai) ? sp.mulai : hari;
  const sampai = tambahHari(mulai, RENTANG);
  const malam = daftarMalam(mulai, sampai);
  const [kamar, pesanan, tutup] = await Promise.all([
    daftarKamar(true),
    cariPesanan({ dari: mulai, sampai, urut: 'tiba', batas: 1000 }),
    daftarTutup(hari),
  ]);
  const hidup = pesanan.filter((p) => p.status !== 'batal');
  const semuaTutup = tutup.filter((t) => t.mulai < sampai);

  const isi = (kamarId: number, d: string) => {
    const tertutup = semuaTutup.some((t) => (t.kamar_id == null || t.kamar_id === kamarId) && t.mulai <= d && t.akhir >= d);
    const terisi = hidup.filter((p) => p.kamar_id === kamarId && p.check_in <= d && p.check_out > d).reduce((a, p) => a + p.jumlah_kamar, 0);
    return { tertutup, terisi };
  };
  const tampilKamar = kamar.filter((k) => k.aktif || hidup.some((p) => p.kamar_id === k.id));
  const kembali = `/admin/kalender${sp.mulai ? `?mulai=${mulai}` : ''}`;

  return (
    <>
      <JudulAdmin judul="Kalender" teks="Keterisian pondok per malam. Angka menunjukkan pondok yang terisi dari jumlah unit." />
      <Kabar ok={sp.ok} galat={sp.galat} pesan={{ 'ok:tutup': 'Tanggal tutup sudah ditambahkan.', 'galat:tanggal': 'Tanggal tutup belum benar.' }} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href={`/admin/kalender?mulai=${tambahHari(mulai, -14)}`} className="tombol tombol-putih tombol-kecil"><Ikon nama="kiri" className="size-4" /> 2 minggu</Link>
        <Link href="/admin/kalender" className="tombol tombol-putih tombol-kecil">Hari ini</Link>
        <Link href={`/admin/kalender?mulai=${tambahHari(mulai, 14)}`} className="tombol tombol-putih tombol-kecil">2 minggu <Ikon nama="kanan" className="size-4" /></Link>
        <span className="ml-auto text-sm font-semibold text-laut">{tanggal(mulai, 'id')} sampai {tanggal(tambahHari(sampai, -1), 'id')}</span>
      </div>

      <div className="kartu overflow-x-auto p-4">
        <table className="border-separate border-spacing-1 text-center text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-36 bg-white pr-2 text-left font-semibold text-abu">Pondok</th>
              {malam.map((d) => {
                const libur = hariDalamMinggu(d) === 0 || hariDalamMinggu(d) === 6;
                return (
                  <th key={d} className={`min-w-10 rounded-lg px-1 py-1 font-semibold ${d === hari ? 'bg-senja text-hitam' : libur ? 'text-toska-tua' : 'text-abu'}`}>
                    <span className="block text-[0.7rem]">{HARI[hariDalamMinggu(d)]}</span>
                    <span className="block">{Number(d.slice(8))}</span>
                    {(d.endsWith('-01') || d === mulai) && <span className="block text-[0.65rem] uppercase">{tanggal(d, 'id').split(' ')[1]}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tampilKamar.map((k) => (
              <tr key={k.id}>
                <th className="sticky left-0 z-10 bg-white pr-2 text-left font-semibold text-laut">
                  <span className="block leading-tight">{k.nama}</span>
                  <span className="block text-xs font-normal text-abu">{k.jumlah_unit} unit</span>
                </th>
                {malam.map((d) => {
                  const c = isi(k.id, d);
                  const gaya = c.tertutup ? 'bg-[#fbe4df] text-merah' : c.terisi >= k.jumlah_unit ? 'bg-laut text-white' : c.terisi > 0 ? 'bg-buih-2 text-laut' : 'bg-buih/60 text-abu/60';
                  return (
                    <td key={d} className={`h-10 rounded-lg font-semibold tabular-nums ${gaya}`} title={`${k.nama}, ${tanggal(d, 'id', 'panjang')}`}>
                      {c.tertutup ? 'T' : c.terisi ? `${c.terisi}/${k.jumlah_unit}` : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-3 flex flex-wrap gap-4 text-sm text-abu">
          <li className="inline-flex items-center gap-2"><span className="size-3 rounded bg-laut" />Penuh</li>
          <li className="inline-flex items-center gap-2"><span className="size-3 rounded bg-buih-2" />Sebagian terisi</li>
          <li className="inline-flex items-center gap-2"><span className="size-3 rounded bg-[#fbe4df]" />Tutup</li>
        </ul>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 text-2xl">Pesanan di rentang ini</h2>
          {hidup.length ? <div className="grid gap-2">{hidup.map((p) => <BarisPesanan key={p.id} p={p} />)}</div>
            : <p className="rounded-2xl bg-white px-4 py-3 text-abu">Belum ada pesanan di rentang ini.</p>}
        </section>
        <section className="kartu self-start p-5 sm:p-6">
          <h2 className="text-2xl">Tutup tanggal</h2>
          <p className="mt-1 text-sm text-abu">Untuk perbaikan, acara keluarga, atau tamu yang memesan di luar situs tanpa dicatat. Tamu tidak bisa memesan malam yang ditutup.</p>
          <form action={tambahTutup} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="kembali" value={kembali} />
            <div className="sm:col-span-2">
              <label className="label-isian" htmlFor="kamar_id">Pondok</label>
              <select id="kamar_id" name="kamar_id" className="isian">
                <option value="">Semua pondok</option>
                {kamar.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div><label className="label-isian" htmlFor="mulai">Malam pertama</label><input id="mulai" name="mulai" type="date" required min={hari} className="isian" /></div>
            <div><label className="label-isian" htmlFor="akhir">Malam terakhir</label><input id="akhir" name="akhir" type="date" min={hari} className="isian" /></div>
            <div className="sm:col-span-2"><label className="label-isian" htmlFor="alasan">Alasan</label><input id="alasan" name="alasan" className="isian" placeholder="Hanya terlihat di panel" /></div>
            <button className="tombol tombol-laut tombol-kecil sm:col-span-2">Tutup tanggal ini</button>
          </form>
          {tutup.length > 0 && (
            <ul className="mt-5 grid gap-2">
              {tutup.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-buih px-4 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-laut">{t.kamar_id ? kamar.find((k) => k.id === t.kamar_id)?.nama ?? 'Pondok terhapus' : 'Semua pondok'}</span>
                    <span className="block text-sm text-abu">{tanggal(t.mulai, 'id')} sampai {tanggal(t.akhir, 'id')}{t.alasan ? `, ${t.alasan}` : ''}</span>
                  </span>
                  <form action={hapusTutup}><input type="hidden" name="id" value={t.id} />
                    <TombolYakin tanya="Buka lagi tanggal ini untuk pemesanan?" className="inline-flex size-9 items-center justify-center rounded-full bg-white text-merah"><Ikon nama="sampah" className="size-4" /><span className="sr-only">Hapus</span></TombolYakin>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
