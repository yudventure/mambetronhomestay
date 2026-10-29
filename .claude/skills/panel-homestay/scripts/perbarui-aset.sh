#!/bin/bash
# Copies the panel source from a Mambetron checkout into assets/panel-homestay,
# keeping the repo paths. Run after the panel changes in Mambetron.
#   bash scripts/perbarui-aset.sh /path/to/mambetronhomestay/website
set -euo pipefail
SUMBER="${1:?path to the Mambetron website/ folder}"
TUJUAN="$(cd "$(dirname "$0")/.." && pwd)/assets/panel-homestay"
BERKAS=(
  "app/admin/layout.tsx"
  "app/admin/(panel)/layout.tsx"
  "app/admin/(panel)/page.tsx"
  "app/admin/(panel)/pesanan/page.tsx"
  "app/admin/(panel)/kalender/page.tsx"
  "app/api/kunjungan/route.ts"
  "components/Kunjungan.tsx"
  "components/admin/RangkaPanel.tsx"
  "components/admin/Kabar.tsx"
  "components/admin/JamLangsung.tsx"
  "components/admin/MejaPesanan.tsx"
  "components/admin/BarisPesanan.tsx"
  "components/admin/StatistikSitus.tsx"
  "components/admin/PilihPondok.tsx"
  "components/admin/TombolYakin.tsx"
  "components/admin/TombolSalin.tsx"
  "app/admin/(panel)/sinkron/page.tsx"
  "app/admin/aksi.ts"
  "app/ical/[berkas]/route.ts"
  "instrumentation.ts"
  "lib/sinkron.ts"
  "lib/dampier.ts"
  "lib/jaringan.ts"
  "lib/ical.mjs"
  "lib/ical.test.mjs"
  "lib/statistik.ts"
  "lib/kait.ts"
  "lib/tanggal.ts"
  "lib/format.ts"
  "lib/jenis.ts"
  "lib/data.ts"
  "lib/ikon.ts"
  "components/Ikon.tsx"
  "database/skema.sql"
  "app/globals.css"
)
# panel.css is written by hand and kept
find "$TUJUAN" -mindepth 1 ! -name panel.css -delete 2>/dev/null || true
mkdir -p "$TUJUAN"
for b in "${BERKAS[@]}"; do
  mkdir -p "$TUJUAN/$(dirname "$b")"
  cp "$SUMBER/$b" "$TUJUAN/$b"
done
echo "Disalin ${#BERKAS[@]} berkas ke $TUJUAN"
