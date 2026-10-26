import DiagnosaDb from '@/components/admin/DiagnosaDb';
import MenuAdmin from '@/components/admin/MenuAdmin';
import { cekDb } from '@/lib/db';
import { sesiAkun, wajibMasuk } from '@/lib/sesi';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await wajibMasuk();
  const db = await cekDb();
  return (
    <div className="lg:flex">
      <MenuAdmin surel={await sesiAkun()} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {db.ok ? children : <DiagnosaDb pesan={db.pesan} />}
      </main>
    </div>
  );
}
