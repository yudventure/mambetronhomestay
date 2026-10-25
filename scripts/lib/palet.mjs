// Brand colours. CMYK values are rough conversions for the printer's first
// proof, not a colour-managed match.
export const W = {
  hitam: '#161616',
  laut: '#0B3B4A',
  toska: '#12A39A',
  toskaTua: '#0A7A73',
  senja: '#F27A3D',
  pasir: '#F7DFA8',
  buih: '#E6F5F3',
  putih: '#FFFFFF',
};

export const PALET = [
  { kunci: 'hitam', nama: 'Hitam Kuskus', hex: W.hitam, peran: 'Warna logo utama dan teks' },
  { kunci: 'laut', nama: 'Laut Dalam', hex: W.laut, peran: 'Latar gelap, judul, seragam' },
  { kunci: 'toska', nama: 'Toska Laguna', hex: W.toska, peran: 'Aksen, ikon, ilustrasi laut' },
  { kunci: 'senja', nama: 'Jingga Senja', hex: W.senja, peran: 'Tombol pesan dan sorotan' },
  { kunci: 'pasir', nama: 'Pasir Pantai', hex: W.pasir, peran: 'Latar hangat dan label' },
  { kunci: 'buih', nama: 'Buih Laut', hex: W.buih, peran: 'Latar lembut di layar' },
];

export function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function cmyk(hex) {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) return [0, 0, 0, 100];
  const f = (v) => Math.round(((1 - v - k) / (1 - k)) * 100);
  return [f(r), f(g), f(b), Math.round(k * 100)];
}
