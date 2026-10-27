// Booking desk rows after the DAMPIER request list. Every row is its own
// framed block, rows are spaced apart and never ruled. Labels sit on their
// own line above each value.
import Link from 'next/link';
import Ikon from '../Ikon';
import { LencanaStatus } from './BarisPesanan';
import type { Pesanan } from '@/lib/jenis';
import { rentangTanggal, rupiah, tautanWa } from '@/lib/format';

const BARU_JAM = 24;

function Bayar({ p }: { p: Pesanan }) {
  if (p.status === 'batal') return null;
  if (p.total > 0 && p.dibayar >= p.total) return <span className="inline-flex rounded-full bg-[#dff5e6] px-3 py-1 text-xs font-bold text-[#1f7a3d]">LUNAS</span>;
  if (p.dibayar > 0) return <span className="inline-flex rounded-full bg-panel-lembut px-3 py-1 text-xs font-bold text-panel-aksen">DIBAYAR {rupiah(p.dibayar)}</span>;
  return <span className="inline-flex rounded-full bg-[#fde3dc] px-3 py-1 text-xs font-bold text-merah">BELUM DIBAYAR</span>;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="block text-[0.6875rem] font-bold tracking-[0.14em] text-abu uppercase">{children}</span>
);

export function BarisMeja({ p, homestay }: { p: Pesanan; homestay: string }) {
  const baru = Date.now() - new Date(`${p.dibuat.replace(' ', 'T')}Z`).getTime() < BARU_JAM * 3600_000;
  const tamu = [`${p.dewasa} dewasa`, p.anak ? `${p.anak} anak` : ''].filter(Boolean).join(', ');
  const pesan = p.bahasa === 'en'
    ? `Hello ${p.nama}, this is ${homestay} about your booking ${p.kode}.`
    : `Halo ${p.nama}, kami dari ${homestay} tentang pesanan ${p.kode}.`;
  const wa = p.telepon ? tautanWa(p.telepon, pesan) : '';
  return (
    <li className={`rounded-2xl px-5 py-4 ring-1 ring-panel-garis ${baru ? 'bg-panel-lembut/60' : 'bg-white'}`}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-6 xl:grid-cols-[1fr_1.1fr_1.5fr_0.9fr]">
        <div>
          <Label>Kode</Label>
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <Link href={`/admin/pesanan/${p.id}`} className="font-semibold tracking-wide text-panel-utama hover:underline">{p.kode}</Link>
            {baru && <span className="rounded-full bg-[#dff5e6] px-2 py-0.5 text-[0.6875rem] font-bold text-[#1f7a3d]">BARU</span>}
          </span>
        </div>
        <div className="min-w-0">
          <Label>Tamu</Label>
          <span className="mt-1 block truncate font-semibold text-panel-utama">{p.nama}</span>
          <span className="block truncate text-sm text-abu">{[p.telepon, p.negara].filter(Boolean).join(' · ') || p.email}</span>
        </div>
        <div className="min-w-0">
          <Label>Yang dipesan</Label>
          <span className="mt-1 block font-semibold text-panel-utama">{p.kamar_nama}{p.jumlah_kamar > 1 ? ` ×${p.jumlah_kamar}` : ''}</span>
          <span className="block text-sm text-abu">{p.malam} malam, {tamu}</span>
          {p.rincian.length > 0 && <span className="block truncate text-sm text-abu">{p.rincian.map((r) => r.nama).join(', ')}</span>}
        </div>
        <div>
          <Label>Tanggal</Label>
          <span className="mt-1 block font-semibold text-panel-utama">{rentangTanggal(p.check_in, p.check_out)}</span>
        </div>
        <div>
          <Label>Total</Label>
          <span className="mt-1 block font-semibold text-panel-utama tabular-nums">{rupiah(p.total)}</span>
        </div>
        <div>
          <Label>Status</Label>
          <span className="mt-1.5 flex flex-wrap gap-1.5"><LencanaStatus status={p.status} /><Bayar p={p} /></span>
        </div>
        <div className="col-span-2 flex flex-wrap items-end gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-panel-utama ring-1 ring-panel-garis hover:bg-panel-latar">
              <Ikon nama="chat" className="size-4" /> Kabari tamu
            </a>
          )}
          <Link href={`/admin/pesanan/${p.id}`} className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-panel-utama ring-1 ring-panel-garis hover:bg-panel-latar">
            Lihat detail <Ikon nama="panah" className="size-4" />
          </Link>
        </div>
      </div>
    </li>
  );
}

// Search and status filter on top, rows below. GET form, so the filter lives
// in the address and survives a reload.
export default function MejaPesanan({ pesanan, homestay, jumlah, q, status, aksi, judul = 'Pesanan masuk', teks }: {
  pesanan: Pesanan[];
  homestay: string;
  jumlah: number;
  q?: string;
  status?: string;
  aksi: string;
  judul?: string;
  teks?: string;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-kecil flex items-center gap-1.5 !text-panel-utama"><Ikon nama="daftar" className="size-3.5" /> Meja pesanan</p>
          <h2 className="mt-1 text-[1.75rem] text-panel-utama">{judul}</h2>
          {teks && <p className="mt-0.5 text-[0.9375rem] text-abu">{teks}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-abu">{jumlah} pesanan</span>
          <Link href="/admin/pesanan/baru" className="tombol tombol-laut tombol-kecil !bg-panel-utama"><Ikon nama="tambah" className="size-4" /> Tambah pesanan manual</Link>
        </div>
      </div>
      <form action={aksi} className="mt-4 flex flex-wrap gap-2">
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Cari pesanan</span>
          <Ikon nama="cari" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-abu" />
          <input name="q" defaultValue={q} placeholder="Cari kode, nama, atau nomor" className="isian !rounded-full !pl-11" />
        </label>
        <label className="sr-only" htmlFor="saring-status">Status</label>
        <select id="saring-status" name="status" defaultValue={status ?? ''} className="isian !w-auto !rounded-full">
          <option value="">Semua status</option>
          <option value="menunggu">Menunggu konfirmasi</option>
          <option value="dikonfirmasi">Dikonfirmasi</option>
          <option value="lunas">Lunas</option>
          <option value="selesai">Selesai</option>
          <option value="batal">Batal</option>
        </select>
        <button className="tombol tombol-putih tombol-kecil !rounded-full">Saring</button>
      </form>
      {pesanan.length ? (
        <ul className="mt-4 grid gap-3">{pesanan.map((p) => <BarisMeja key={p.id} p={p} homestay={homestay} />)}</ul>
      ) : (
        <p className="mt-4 rounded-2xl bg-panel-latar px-5 py-4 text-abu">{q || status ? 'Tidak ada pesanan yang cocok dengan pencarian ini.' : 'Belum ada pesanan.'}</p>
      )}
    </section>
  );
}
