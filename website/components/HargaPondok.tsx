// The price block of a bungalow, on its page and on its card. A bungalow
// priced per bungalow with a solo discount (Isi situs, Bungalow) reads
// "For 2 guests", the price, and the price for one guest under it. The
// owner's price, November 2026: Rp1.200.000 for two, one guest 30% less.
import type { Bahasa, Kamar } from '@/lib/jenis';
import { kamus } from '@/lib/kamus';
import { rupiah } from '@/lib/format';
import { hargaSendiri, persenSendiri } from '@/lib/harga';
import type { Kurs } from '@/lib/uang';
import Perkiraan from './Perkiraan';

type Props = {
  b: Bahasa;
  kamar: Pick<Kamar, 'harga' | 'skema_harga' | 'persen_sendiri' | 'kapasitas'>;
  kurs: Kurs;
  // the price's own type size
  ukuran: string;
  usiaGratis?: number;
};

export default function HargaPondok({ b, kamar, kurs, ukuran, usiaGratis }: Props) {
  const k = kamus(b);
  const perPondok = kamar.skema_harga === 'kamar';
  const sendiri = hargaSendiri(kamar.harga, persenSendiri(kamar));
  const adaSendiri = sendiri < kamar.harga;
  return (
    <div data-harga-pondok>
      <p className="text-sm text-abu">{adaSendiri ? k.untukOrang(kamar.kapasitas) : k.mulai}</p>
      <p className={`font-judul font-semibold text-laut ${ukuran}`}>{rupiah(kamar.harga, b)}</p>
      <p className="text-sm text-abu">{k.perSkema[kamar.skema_harga]}</p>
      <Perkiraan idr={kamar.harga} kurs={kurs} b={b} className="mt-1 text-abu" />
      {adaSendiri && <p className="mt-2 text-sm font-semibold text-laut" data-harga-sendiri>{k.hargaSendiri(rupiah(sendiri, b))}</p>}
      {usiaGratis !== undefined && (
        <p className="mt-2 text-sm font-semibold text-biru-tua" data-aturan-anak>{perPondok ? k.hargaAnakKamar(usiaGratis) : k.hargaAnak(usiaGratis)}</p>
      )}
    </div>
  );
}
