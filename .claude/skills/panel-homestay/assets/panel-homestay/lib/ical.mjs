// Reading and writing iCal calendars (RFC 5545), only as far as calendar
// sync with booking sites needs. Plain JS so `node --test lib` can check it
// without a build.
//
// Dates are plain YYYY-MM-DD strings. An event covers the nights from
// `mulai` up to but not including `selesai`, the same way iCal and the
// booking sites count them (DTEND is the check-out day).

const tambah = (s, n) => new Date(Date.parse(`${s}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const keTanggal = (d8) => `${d8.slice(0, 4)}-${d8.slice(4, 6)}-${d8.slice(6, 8)}`;

// Date of a DTSTART or DTEND value. UTC times are moved to the site's time
// zone first, local and floating times keep their own date.
function tanggalDari(nilai, param, zona) {
  const v = nilai.trim();
  if (!/^\d{8}/.test(v)) return '';
  if (/^\d{8}T\d{6}Z$/.test(v) && !/VALUE=DATE(?!-)/i.test(param)) {
    const d = new Date(`${keTanggal(v)}T${v.slice(9, 11)}:${v.slice(11, 13)}:${v.slice(13, 15)}Z`);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  }
  const t = keTanggal(v.slice(0, 8));
  return Number.isNaN(Date.parse(`${t}T00:00:00Z`)) ? '' : t;
}

const buka = (s) => s.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1').trim();

/**
 * Events in an iCal text. Throws when the text is not a calendar at all.
 * @param {string} teks
 * @param {{ zona?: string }} [o]
 * @returns {{ uid: string, mulai: string, selesai: string, ringkas: string }[]}
 */
export function bacaIcal(teks, o = {}) {
  const zona = o.zona ?? 'Asia/Jayapura';
  if (!/BEGIN:VCALENDAR/i.test(teks)) throw new Error('bukan-ical');
  const baris = teks.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const acara = [];
  let a = null;
  for (const b of baris) {
    if (/^BEGIN:VEVENT$/i.test(b.trim())) { a = {}; continue; }
    if (/^END:VEVENT$/i.test(b.trim())) {
      if (a && a.mulai && !/^CANCELLED$/i.test(a.status ?? '')) {
        let selesai = a.selesai || tambah(a.mulai, 1);
        if (selesai <= a.mulai) selesai = tambah(a.mulai, 1);
        acara.push({ uid: (a.uid ?? '').slice(0, 250), mulai: a.mulai, selesai, ringkas: (a.ringkas ?? '').slice(0, 190) });
      }
      a = null;
      continue;
    }
    if (!a) continue;
    const titik = b.indexOf(':');
    if (titik < 1) continue;
    const kepala = b.slice(0, titik);
    const nilai = b.slice(titik + 1);
    const [nama, ...p] = kepala.split(';');
    const param = p.join(';');
    switch (nama.toUpperCase()) {
      case 'DTSTART': a.mulai = tanggalDari(nilai, param, zona); break;
      case 'DTEND': a.selesai = tanggalDari(nilai, param, zona); break;
      case 'UID': a.uid = nilai.trim(); break;
      case 'SUMMARY': a.ringkas = buka(nilai); break;
      case 'STATUS': a.status = nilai.trim(); break;
      default: break;
    }
  }
  return acara;
}

/**
 * Sorted nights joined into stays, [2026-11-02, 2026-11-03, 2026-11-05]
 * becomes 02 to 04 and 05 to 06.
 * @param {string[]} malam
 * @returns {{ mulai: string, selesai: string }[]}
 */
export function rangkai(malam) {
  const urut = [...new Set(malam)].sort();
  const hasil = [];
  for (const m of urut) {
    const akhir = hasil[hasil.length - 1];
    if (akhir && akhir.selesai === m) akhir.selesai = tambah(m, 1);
    else hasil.push({ mulai: m, selesai: tambah(m, 1) });
  }
  return hasil;
}

const tutupTeks = (s) => s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');

// Lines longer than 75 bytes are folded, continuation lines start with a space.
function lipat(baris) {
  const enc = new TextEncoder();
  if (enc.encode(baris).length <= 75) return baris;
  const potong = [];
  let kini = '';
  for (const ch of baris) {
    const batas = potong.length ? 74 : 75;
    if (enc.encode(kini + ch).length > batas) {
      potong.push(kini);
      kini = ch;
    } else kini += ch;
  }
  potong.push(kini);
  return potong.join('\r\n ');
}

/**
 * A calendar of all-day events.
 * @param {{ nama: string, prodid: string, acara: { uid: string, mulai: string, selesai: string, ringkas: string }[], cap?: Date }} o
 */
export function buatIcal(o) {
  const cap = (o.cap ?? new Date()).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const d = (s) => s.replace(/-/g, '');
  const isi = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${o.prodid}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${tutupTeks(o.nama)}`,
  ];
  for (const a of o.acara) {
    isi.push(
      'BEGIN:VEVENT',
      `UID:${a.uid}`,
      `DTSTAMP:${cap}`,
      `DTSTART;VALUE=DATE:${d(a.mulai)}`,
      `DTEND;VALUE=DATE:${d(a.selesai)}`,
      `SUMMARY:${tutupTeks(a.ringkas)}`,
      'TRANSP:OPAQUE',
      'END:VEVENT',
    );
  }
  isi.push('END:VCALENDAR');
  return `${isi.map(lipat).join('\r\n')}\r\n`;
}
