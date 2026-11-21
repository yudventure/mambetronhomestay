// The price block of a bungalow, on its page and on its card. A bungalow
// priced per bungalow with a price for one guest (Bungalow, Harga untuk 1
// orang) reads "For 2 guests", the price, and the price for one guest
// under it. The owner's price, November 2026: Rp1.200.000 for two, one
// guest Rp850.000.
import type { Bahasa, Kamar } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { rupiah } from '@/lib/format';
import { hargaIsiPondok, hargaSendiri } from '@/lib/harga';
import type { Kurs } from '@/lib/uang';
import Perkiraan from './Perkiraan';

type Props = {
  b: Bahasa;
  kamar: Pick<Kamar, 'harga' | 'skema_harga' | 'harga_sendiri' | 'harga_tambah' | 'kapasitas'>;
  kurs: Kurs;
  // the price's own type size
  ukuran: string;
  usiaGratis?: number;
};

export default function HargaPondok({ b, kamar, kurs, ukuran, usiaGratis }: Props) {
  const k = kamus(b);
  const perPondok = kamar.skema_harga === 'kamar';
  const sendiri = hargaSendiri(kamar);
  const adaSendiri = sendiri < kamar.harga;
  // a third guest who adds to the price, on a bungalow that sleeps three or more
  const tiga = perPondok && kamar.kapasitas >= 3 && kamar.harga_tambah > 0 ? hargaIsiPondok(kamar, 3) : 0;
  const perIsi = adaSendiri || tiga > 0;
  return (
    <div data-harga-pondok>
      <p className="text-sm text-abu">{perIsi ? k.untukOrang(tiga ? 2 : kamar.kapasitas) : k.mulai}</p>
      <p className={`font-judul font-semibold text-laut ${ukuran}`}>{rupiah(kamar.harga, b)}</p>
      <p className="text-sm text-abu">{k.perSkema[kamar.skema_harga]}</p>
      <Perkiraan idr={kamar.harga} kurs={kurs} b={b} className="mt-1 text-abu" />
      {perIsi && (
        <div className="mt-2 text-sm font-semibold text-laut">
          {adaSendiri && <p data-harga-sendiri>{k.hargaSendiri(rupiah(sendiri, b))}</p>}
          {tiga > 0 && <p data-harga-tiga>{k.hargaOrang(3, rupiah(tiga, b))}</p>}
        </div>
      )}
      {usiaGratis !== undefined && (
        <p className="mt-2 text-sm font-semibold text-biru-tua" data-aturan-anak>{perPondok ? k.hargaAnakKamar(usiaGratis) : k.hargaAnak(usiaGratis)}</p>
      )}
    </div>
  );
}
