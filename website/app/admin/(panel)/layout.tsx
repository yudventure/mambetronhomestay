import MenuAdmin from '@/components/admin/MenuAdmin';
import { cekDb } from '@/lib/db';
import { wajibMasuk } from '@/lib/sesi';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await wajibMasuk();
  const db = await cekDb();
  return (
    <div className="lg:flex">
      <MenuAdmin />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {db.ok ? children : (
          <div className="kartu max-w-2xl p-6 sm:p-8">
            <h1 className="text-3xl">Database belum terhubung</h1>
            <p className="mt-3 text-abu">{db.pesan}</p>
            <p className="mt-4">Situs tetap tampil dengan isi bawaan, tetapi pemesanan dan panel ini butuh database. Langkahnya sebagai berikut.</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Buat database MySQL di hPanel Hostinger, menu Databases.</li>
              <li>Isi DB_HOST, DB_PORT, DB_NAME, DB_USER, dan DB_PASSWORD di pengaturan Environment variables aplikasi Node.js.</li>
              <li>Mulai ulang aplikasi. Tabel dan isi awal dibuat sendiri saat situs pertama kali terhubung.</li>
            </ol>
          </div>
        )}
      </main>
    </div>
  );
}
