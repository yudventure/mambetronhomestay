import { JudulAdmin } from '@/components/admin/Kabar';
import FormPengaturan from '@/components/admin/FormPengaturan';
import { PENGATURAN } from '@/lib/bawaan.mjs';
import { ambilSitus } from '@/lib/data';
import { rupiah, tanggal } from '@/lib/format';
import { ambilKurs } from '@/lib/kurs';
import { NAMA_UANG } from '@/lib/uang';
import { NAMA_PLATFORM, bacaVideo } from '@/lib/video';

export const metadata = { title: 'Isi situs' };

export default async function Pengaturan() {
  const [situs, kurs] = await Promise.all([ambilSitus() as unknown as Promise<Record<string, unknown>>, ambilKurs()]);
  return (
    <>
      <JudulAdmin judul="Isi situs" teks="Semua teks, kontak, dan aturan pemesanan yang tampil di situs. Setiap bagian disimpan sendiri-sendiri." />
      <nav className="mb-6 flex flex-wrap gap-2">
        {PENGATURAN.map((g) => <a key={g.kunci} href={`#${g.kunci}`} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-laut hover:bg-buih-2">{g.judul}</a>)}
      </nav>
      <div className="grid gap-6">
        {PENGATURAN.map((g) => (
          <section key={g.kunci} id={g.kunci} className="kartu scroll-mt-20 p-5 sm:p-7">
            <h2 className="text-2xl">{g.judul}</h2>
            {g.keterangan && <p className="mt-1 mb-6 text-abu">{g.keterangan}</p>}
            {g.kunci === 'uang' && (
              <div className="mb-6 rounded-2xl bg-buih px-4 py-3">
                <p className="font-semibold text-laut">
                  {kurs.sumber === 'otomatis' ? `Kurs yang dipakai sekarang, otomatis per ${kurs.tanggal ? tanggal(kurs.tanggal, 'id', 'polos') : 'hari ini'}` : 'Kurs yang dipakai sekarang, dari isian di bawah'}
                </p>
                <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm text-laut sm:grid-cols-2">
                  {(['USD', 'EUR', 'JPY', 'CNY'] as const).map((c) => (
                    <li key={c}>1 {NAMA_UANG[c].id.charAt(0).toLowerCase() + NAMA_UANG[c].id.slice(1)} sama dengan {rupiah(Math.round(kurs.idrPer[c]))}</li>
                  ))}
                </ul>
              </div>
            )}
            {g.isian.some((f) => f.k === 'tentangVideo') && (situs.tentangVideo as { url: string }[]).some((x) => x.url.trim()) && (
              <div className="mb-6 rounded-2xl bg-buih px-4 py-3">
                <p className="font-semibold text-laut">Video tentang kami yang terbaca</p>
                <ul className="mt-2 grid gap-1 text-sm text-laut">
                  {(situs.tentangVideo as { url: string }[]).filter((x) => x.url.trim()).map((x, i) => {
                    const v = bacaVideo(x.url);
                    const pendek = /^https?:\/\/((vm|vt)\.tiktok\.com|(www\.)?tiktok\.com\/t)\//i.test(x.url.trim());
                    return (
                      <li key={i} className={v || pendek ? '' : 'font-semibold text-merah'}>
                        Video {i + 1} {v ? NAMA_PLATFORM[v.jenis] : pendek ? 'TikTok, tautan pendek dibuka saat halaman tampil' : 'belum dikenali, periksa tautannya'}{i >= 3 ? ', tidak tampil karena paling banyak tiga' : ''}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <FormPengaturan bagian={g} nilai={Object.fromEntries(g.isian.map((f) => [f.k, situs[f.k]]))} />
          </section>
        ))}
        <section className="kartu p-5 sm:p-7">
          <h2 className="text-2xl">Teks tombol dan label</h2>
          <p className="mt-2 text-abu">Tulisan kecil pada tombol, menu, dan formulir, misalnya Pesan sekarang atau Nomor WhatsApp, ada di berkas bahasa website/lib/kamus.ts dan belum bisa diubah dari panel ini. Minta bantuan pengembang bila ingin mengubahnya.</p>
        </section>
      </div>
    </>
  );
}
