import DiagnosaDb from '@/components/admin/DiagnosaDb';
import RangkaPanel from '@/components/admin/RangkaPanel';
import { akunDari } from '@/lib/akun';
import { ringkasPanel, type RingkasPanel } from '@/lib/data';
import { cekDb } from '@/lib/db';
import { sesiAkun, wajibMasuk } from '@/lib/sesi';
import { hariIni } from '@/lib/tanggal';

const PERAN = { pemilik: 'Pemilik', pengembang: 'Pengembang' };

// The sentence on the HARI INI card in the sidebar.
function kalimatHariIni(r: RingkasPanel, dbOk: boolean) {
  if (!dbOk) return 'Database belum terhubung, jadi pesanan belum bisa ditampilkan.';
  const tamu = [r.tiba && `${r.tiba} pesanan tiba`, r.pulang && `${r.pulang} pulang`].filter(Boolean).join(' dan ');
  const awal = tamu ? `${tamu.charAt(0).toUpperCase()}${tamu.slice(1)} hari ini.` : 'Tidak ada tamu yang tiba atau pulang hari ini.';
  const tunggu = r.menunggu ? ` ${r.menunggu} pesanan menunggu konfirmasi uang muka.` : ' Semua pesanan sudah ditanggapi.';
  return awal + tunggu;
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await wajibMasuk();
  const [surel, db] = await Promise.all([sesiAkun(), cekDb()]);
  const ringkas = db.ok ? await ringkasPanel(hariIni()) : { menunggu: 0, tiba: 0, pulang: 0, menginap: 0, daftarMenunggu: [] };
  const akun = akunDari(surel);
  return (
    <RangkaPanel surel={surel} peran={akun ? PERAN[akun.peran] : 'Pengelola'} ringkas={ringkas} hariIni={kalimatHariIni(ringkas, db.ok)}>
      {db.ok ? children : <DiagnosaDb pesan={db.pesan} />}
    </RangkaPanel>
  );
}
