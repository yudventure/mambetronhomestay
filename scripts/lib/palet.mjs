// Brand colours. CMYK values are rough conversions for the printer's first
// proof, not a colour-managed match.
export const W = {
  hitam: '#161616',
  laut: '#0B3B4A',
  biru: '#0497B2',
  biruTua: '#036F87',
  senja: '#F27A3D',
  pasir: '#F7DFA8',
  buih: '#E3F4F7',
  putih: '#FFFFFF',
};

export const PALET = [
  { kunci: 'biru', nama: 'Biru Mambetron', hex: W.biru, peran: 'Warna logo, aksen, ikon' },
  { kunci: 'laut', nama: 'Laut Dalam', hex: W.laut, peran: 'Judul, latar gelap, seragam' },
  { kunci: 'senja', nama: 'Jingga Senja', hex: W.senja, peran: 'Tombol pesan dan sorotan' },
  { kunci: 'pasir', nama: 'Pasir Pulau', hex: W.pasir, peran: 'Latar hangat dan label' },
  { kunci: 'buih', nama: 'Buih Laut', hex: W.buih, peran: 'Latar lembut di layar' },
  { kunci: 'hitam', nama: 'Hitam Malam', hex: W.hitam, peran: 'Teks panjang' },
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
