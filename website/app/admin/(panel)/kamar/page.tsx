import Link from 'next/link';
import Ikon from '@/components/Ikon';
import Kabar, { JudulAdmin } from '@/components/admin/Kabar';
import { daftarKamar, gambarCadangan } from '@/lib/data';
import { rupiah } from '@/lib/format';
import { KAMUS } from '@/lib/kamus';
import { KISI, rentang } from '@/lib/kisi';

export const metadata = { title: 'Bungalow' };

export default async function KamarAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const kamar = await daftarKamar(true);
  return (
    <>
      <JudulAdmin judul="Bungalow" teks="Nama, harga, foto, dan jumlah unit tiap jenis bungalow.">
        <Link href="/admin/kamar/baru" className="tombol tombol-kecil"><Ikon nama="tambah" className="size-4" /> Tambah bungalow</Link>
      </JudulAdmin>
      <Kabar ok={sp.hapus ? 'hapus' : undefined} pesan={{ 'ok:hapus': 'Bungalow sudah dihapus.' }} />
      <div className={`${KISI} gap-5`}>
        {kamar.map((k, i) => (
          <Link key={k.id} href={`/admin/kamar/${k.id}`} className={`kartu block overflow-hidden transition-shadow hover:shadow-angkat ${rentang(kamar.length, i)}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={k.foto[0]?.url ?? gambarCadangan(i)} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl">{k.nama}</h2>
                {!k.aktif && <span className="rounded-full bg-[#fbe4df] px-3 py-1 text-xs font-bold text-merah">Nonaktif</span>}
              </div>
              <p className="mt-1 text-sm text-abu">{k.jumlah_unit} unit, muat {k.kapasitas} orang, {k.foto.length} foto</p>
              <p className="mt-3 font-judul text-xl font-semibold text-laut">{rupiah(k.harga)}</p>
              <p className="text-sm text-abu">{KAMUS.id.perSkema[k.skema_harga]}</p>
            </div>
          </Link>
        ))}
      </div>
      {!kamar.length && <p className="rounded-2xl bg-white px-4 py-6 text-center text-abu">Belum ada bungalow. Tambahkan yang pertama.</p>}
    </>
  );
}
