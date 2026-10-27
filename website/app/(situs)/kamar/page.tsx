import type { Metadata } from 'next';
import Bagian, { JudulBagian } from '@/components/Bagian';
import KartuKamar from '@/components/KartuKamar';
import { bahasaAktif } from '@/lib/bahasa';
import { ambilSitus, daftarKamar } from '@/lib/data';
import { kamus } from '@/lib/kamus';
import { dwi } from '@/lib/format';
import { KISI, rentang } from '@/lib/kisi';
import { kursAktif } from '@/lib/uang-server';

export async function generateMetadata(): Promise<Metadata> {
  return { title: kamus(await bahasaAktif()).semuaPondok };
}

export default async function DaftarPondok() {
  const [b, situs, kamar, kurs] = await Promise.all([bahasaAktif(), ambilSitus(), daftarKamar(), kursAktif()]);
  const k = kamus(b);
  return (
    <Bagian latar="buih" className="!pt-10 md:!pt-14">
      <JudulBagian label={situs.nama} judul={dwi(situs.kamarJudul, b)} teks={dwi(situs.kamarTeks, b)} />
      {kamar.length ? (
        <div className={`${KISI} gap-6`}>
          {kamar.map((x, i) => <KartuKamar key={x.id} kamar={x} b={b} kurs={kurs} i={i} lebar={kamar.length === 1} className={rentang(kamar.length, i)} />)}
        </div>
      ) : (
        <p className="kartu p-6 text-lg">{k.tidakAdaPondok}</p>
      )}
    </Bagian>
  );
}
