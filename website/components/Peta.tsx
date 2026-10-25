// Google Maps embed from coordinates, no API key needed.
export function koordinat(s: string) {
  const m = s.match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/);
  if (!m) return null;
  const lat = Number(m[1]), lng = Number(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export default function Peta({ titik, judul }: { titik: string; judul: string }) {
  const k = koordinat(titik);
  if (!k) return null;
  return (
    <iframe
      title={judul}
      src={`https://maps.google.com/maps?q=${k.lat},${k.lng}&z=11&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="aspect-[4/3] w-full rounded-3xl border-4 border-white bg-buih shadow-lembut"
    />
  );
}
