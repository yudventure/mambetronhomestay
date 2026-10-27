// Checks a set of panel colours before they go into globals.css.
//   node scripts/cek-token.mjs utama=#0b3b4a utama2=#13566a aksen=#037f96 lembut=#e6f4f6 latar=#f3f6f8 garis=#e2e9ed
// Missing values fall back to the Mambetron set. Exit code 1 when a check fails.
const BAWAAN = { utama: '#0b3b4a', utama2: '#13566a', aksen: '#036f87', lembut: '#e6f4f6', latar: '#f3f6f8', garis: '#e2e9ed' };
const t = { ...BAWAAN };
for (const a of process.argv.slice(2)) {
  const [k, v] = a.split('=');
  if (!(k in BAWAAN) || !/^#[0-9a-f]{6}$/i.test(v ?? '')) {
    console.error(`Tidak dikenal ${a}. Pakai ${Object.keys(BAWAAN).join(', ')} dengan nilai #rrggbb`);
    process.exit(2);
  }
  t[k] = v.toLowerCase();
}

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const terang = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const kontras = (a, b) => { const [x, y] = [terang(a), terang(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
function hsl(h) {
  const [r, g, b] = rgb(h);
  const maks = Math.max(r, g, b), min = Math.min(r, g, b), l = (maks + min) / 2;
  if (maks === min) return { h: 0, s: 0, l };
  const d = maks - min;
  const s = l > 0.5 ? d / (2 - maks - min) : d / (maks + min);
  const hue = maks === r ? ((g - b) / d + (g < b ? 6 : 0)) : maks === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: hue * 60, s, l };
}

const hasil = [];
const cek = (nama, ok, info) => hasil.push({ nama, ok, info });
const k = (a, b) => kontras(a, b).toFixed(2);

cek('Teks putih di atas utama (menu aktif, kartu sapaan, tombol)', kontras('#ffffff', t.utama) >= 7, `${k('#ffffff', t.utama)}:1, perlu 7`);
cek('Teks putih di atas utama2 (hover tombol)', kontras('#ffffff', t.utama2) >= 4.5, `${k('#ffffff', t.utama2)}:1, perlu 4.5`);
cek('Aksen di atas putih (label kecil, tautan)', kontras(t.aksen, '#ffffff') >= 4.5, `${k(t.aksen, '#ffffff')}:1, perlu 4.5`);
cek('Utama di atas lembut (kartu HARI INI, lencana)', kontras(t.utama, t.lembut) >= 7, `${k(t.utama, t.lembut)}:1, perlu 7`);
cek('Aksen di atas lembut (chip DIBAYAR, alis di kartu lembut)', kontras(t.aksen, t.lembut) >= 4.5, `${k(t.aksen, t.lembut)}:1, perlu 4.5`);
cek('Utama di atas latar (teks di blok latar)', kontras(t.utama, t.latar) >= 7, `${k(t.utama, t.latar)}:1, perlu 7`);
cek('Latar cukup terang untuk blok di kartu putih', terang(t.latar) >= 0.85 && kontras('#ffffff', t.latar) <= 1.15, `kontras dengan putih ${k('#ffffff', t.latar)}:1, perlu 1.03 sampai 1.15`);
cek('Latar terlihat beda dari putih', kontras('#ffffff', t.latar) >= 1.03, `${k('#ffffff', t.latar)}:1`);
cek('Garis rambut terlihat tapi halus', kontras('#ffffff', t.garis) >= 1.15 && kontras('#ffffff', t.garis) <= 1.5, `${k('#ffffff', t.garis)}:1, perlu 1.15 sampai 1.5`);

// The owner dislikes greyish cream. Warm hue (25 to 65 degrees) with low
// saturation on a light neutral reads as cream grey.
for (const n of ['latar', 'garis', 'lembut']) {
  const { h, s, l } = hsl(t[n]);
  const krem = l > 0.8 && h >= 25 && h <= 65 && s > 0.08 && s < 0.6;
  cek(`${n} bukan krem keabuan`, !krem, `hue ${Math.round(h)}°, saturasi ${Math.round(s * 100)}%`);
}
cek('Utama dan aksen satu keluarga warna', Math.min(Math.abs(hsl(t.utama).h - hsl(t.aksen).h), 360 - Math.abs(hsl(t.utama).h - hsl(t.aksen).h)) <= 30,
  `beda hue ${Math.round(Math.abs(hsl(t.utama).h - hsl(t.aksen).h))}°, paling banyak 30`);

for (const r of hasil) console.log(`${r.ok ? 'LULUS' : 'GAGAL'}  ${r.nama}  (${r.info})`);
console.log(`\n${hasil.filter((r) => r.ok).length}/${hasil.length} lulus`);
console.log(`\n  --color-panel-utama: ${t.utama};\n  --color-panel-utama-2: ${t.utama2};\n  --color-panel-aksen: ${t.aksen};\n  --color-panel-lembut: ${t.lembut};\n  --color-panel-latar: ${t.latar};\n  --color-panel-garis: ${t.garis};`);
process.exit(hasil.every((r) => r.ok) ? 0 : 1);
