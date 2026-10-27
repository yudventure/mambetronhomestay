# Tema panel untuk homestay lain

Bentuk panel sama di semua homestay. Yang berubah hanya enam warna, logo,
dan isi. Warna yang lain (hijau lunas, merah tutup, jingga menunggu, abu
teks) sama di semua situs karena artinya sama.

## Enam token

| Token | Dipakai untuk | Cara memilih dari logo |
|---|---|---|
| `--color-panel-utama` | Menu aktif, kartu sapaan, tombol utama, judul, batang grafik gelap | Rona logo yang digelapkan sampai teks putih di atasnya 7:1 atau lebih |
| `--color-panel-utama-2` | Hover tombol, batang grafik | Utama dinaikkan sedikit terangnya, teks putih tetap 4.5:1 |
| `--color-panel-aksen` | Label kecil kapital, tautan, chip DIBAYAR, pil "akan datang" | Rona logo yang terbaca di putih dan di lembut (4.5:1 di keduanya) |
| `--color-panel-lembut` | Kartu HARI INI, rincian hari, pesanan baru, submenu aktif | Rona logo sangat tipis, utama di atasnya 7:1 |
| `--color-panel-latar` | Blok di dalam kartu, sel kalender, ubin statistik | Abu dingin hampir putih, kontras dengan putih 1.03 sampai 1.15 |
| `--color-panel-garis` | Bingkai kartu, cincin tombol putih | Abu dingin, kontras dengan putih 1.15 sampai 1.5 |

Mambetron (biru laut dari logo #0497b2):

```css
--color-panel-utama: #0b3b4a;
--color-panel-utama-2: #13566a;
--color-panel-aksen: #036f87;
--color-panel-lembut: #e6f4f6;
--color-panel-latar: #f3f6f8;
--color-panel-garis: #e2e9ed;
```

## Memeriksa

Jalankan pemeriksa sebelum menempel token. Ia mengukur kontras untuk setiap
pasangan yang benar-benar muncul di panel, dan menolak latar, garis, dan
lembut yang krem keabuan, karena pemilik tidak menyukainya.

```bash
node scripts/cek-token.mjs utama=#2d1f4a utama2=#43306b aksen=#5b3fa0 lembut=#f0ecf8 latar=#f4f5f8 garis=#e3e5ec
```

Kalau ada yang GAGAL, geser terang warnanya, jangan ganti ronanya. Aksen
yang gagal di atas lembut biasanya cukup digelapkan satu langkah. Pemeriksa
ini menemukan aksen Mambetron lama (#037f96) hanya 4.16:1 di atas lembut,
lalu diganti #036f87.

Latar dan garis sebaiknya abu yang sedikit condong ke rona merek (biru
untuk laut, hijau untuk hutan). Homestay dengan merek hangat (pasir,
terakota) tetap memakai latar abu dingin seperti Mambetron, warna hangat
cukup di utama dan aksen.

## Sudah dicoba

Di Mambetron enam token diganti palet ungu (contoh di atas) tanpa mengubah
kode lain. Rangka, menu aktif, kartu sapaan, ubin, grafik, rincian hari,
kalender, meja pesanan, dan halaman lama seperti Isi situs ikut ungu.
Bingkai kolom isian dan cincin fokus waktu itu masih teal, sesudahnya
diarahkan ke token di blok `.panel` (dicek dengan warna Mambetron, belum
dicek ulang dengan ungu). Yang tetap Mambetron hanya logo dan alis kartu
sapaan (`--color-sorot`), keduanya memang diganti manual.

## Warna yang belum lewat token

Beberapa nilai Mambetron masih ditulis langsung. Cari dan ganti saat
memasang di homestay lain.

- `rgb(11 59 74` dan `rgb(11_59_74` untuk bayangan menu aktif dan bilah
  atas, isi dengan angka RGB `--color-panel-utama`
- `143 220 232` untuk gelombang kartu sapaan, isi dengan `--color-sorot`
- `--color-sorot` (alis di kartu sapaan gelap), rona terang merek yang
  terbaca di atas utama

## Huruf

Judul memakai huruf judul situs (`--font-judul`, Mambetron memakai
Londrina Solid), isi memakai huruf teks situs (Plus Jakarta Sans). Angka
di ubin dan grafik memakai huruf teks tebal dengan `tabular-nums`, bukan
huruf judul, supaya angka sejajar dan mudah dibaca.
