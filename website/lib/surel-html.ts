// The HTML layout of every e-mail the site sends: a sea blue header with the
// white logo, a white card with the content, and a light footer with the
// homestay's contacts. Built from tables with inline styles, the only layout
// that holds in Gmail, Outlook and Apple Mail. Sections are told apart by
// background and space, never by divider lines. The old Outlook for Windows
// ignores max-width and padding on links, so it gets a fixed 600 px table and
// mso-padding-alt in comments only it reads. Each e-mail also carries a
// plain text version, written next to it in surel.ts.

const W = {
  laut: '#0b3b4a',
  tinta: '#16343e',
  abu: '#5b6b70',
  biruTua: '#036f87',
  aksen: '#037f96',
  buih: '#e3f4f7',
  embun: '#f1f8f9',
  latar: '#eaf5f7',
  pasir: '#fbf1d9',
  merah: '#b03826',
  merahMuda: '#fde3dc',
};
const HURUF = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const baris = (s: string) => esc(s).replace(/\r?\n/g, '<br>');

export type Blok =
  | { jenis: 'paragraf'; teks: string; tebal?: boolean }
  | { jenis: 'kode'; label: string; nilai: string }
  | { jenis: 'judul'; teks: string }
  | { jenis: 'rincian'; baris: [string, string][]; total?: [string, string, string?] }
  | { jenis: 'tombol'; teks: string; href: string }
  | { jenis: 'rekening'; daftar: { bank: string; nomor: string; atasNama: string; swift?: string }[]; labelSwift: string }
  | { jenis: 'kotak'; teks: string; nada?: 'info' | 'awas' };

function blok(b: Blok): string {
  switch (b.jenis) {
    case 'paragraf':
      return `<p style="margin:0 0 16px;font-family:${HURUF};font-size:16px;line-height:1.6;color:${W.tinta};${b.tebal ? 'font-weight:700;' : ''}">${baris(b.teks)}</p>`;
    case 'judul':
      return `<p style="margin:28px 0 12px;font-family:${HURUF};font-size:13px;line-height:1.4;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${W.biruTua};">${esc(b.teks)}</p>`;
    case 'kode':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;"><tr><td style="background:${W.buih};border-radius:16px;padding:18px 22px;">
<p style="margin:0;font-family:${HURUF};font-size:12px;line-height:1.4;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${W.abu};">${esc(b.label)}</p>
<p style="margin:4px 0 0;font-family:${HURUF};font-size:28px;line-height:1.2;font-weight:800;letter-spacing:3px;color:${W.laut};">${esc(b.nilai)}</p>
</td></tr></table>`;
    case 'rincian': {
      const isi = b.baris.map(([l, n]) => `<tr>
<td valign="top" style="padding:7px 12px 7px 0;width:38%;font-family:${HURUF};font-size:14px;line-height:1.5;color:${W.abu};">${esc(l)}</td>
<td valign="top" style="padding:7px 0;font-family:${HURUF};font-size:15px;line-height:1.5;color:${W.tinta};">${baris(n)}</td>
</tr>`).join('');
      const total = b.total ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;"><tr><td style="background:${W.buih};border-radius:14px;padding:14px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font-family:${HURUF};font-size:15px;font-weight:700;color:${W.laut};">${esc(b.total[0])}</td>
<td align="right" style="font-family:${HURUF};font-size:20px;font-weight:800;color:${W.laut};white-space:nowrap;">${esc(b.total[1])}</td>
</tr>${b.total[2] ? `<tr><td colspan="2" align="right" style="padding-top:2px;font-family:${HURUF};font-size:13px;color:${W.abu};">${esc(b.total[2])}</td></tr>` : ''}</table>
</td></tr></table>` : '';
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${isi}</table>${total}`;
    }
    case 'tombol':
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 8px;"><tr><td bgcolor="${W.aksen}" style="border-radius:999px;background:${W.aksen};mso-padding-alt:15px 30px;">
<a href="${esc(b.href)}" target="_blank" style="display:inline-block;padding:15px 30px;font-family:${HURUF};font-size:15px;font-weight:700;letter-spacing:0.5px;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(b.teks)}</a>
</td></tr></table>`;
    case 'rekening':
      return b.daftar.map((r) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;"><tr><td style="background:${W.embun};border-radius:14px;padding:14px 18px;">
<p style="margin:0;font-family:${HURUF};font-size:13px;font-weight:700;color:${W.biruTua};">${esc(r.bank)}</p>
<p style="margin:2px 0 0;font-family:${HURUF};font-size:20px;font-weight:800;letter-spacing:1px;color:${W.laut};">${esc(r.nomor)}</p>
<p style="margin:2px 0 0;font-family:${HURUF};font-size:14px;color:${W.abu};">${esc(r.atasNama)}</p>
${r.swift ? `<p style="margin:6px 0 0;font-family:${HURUF};font-size:14px;color:${W.abu};">${esc(b.labelSwift)} <strong style="color:${W.laut};letter-spacing:1px;">${esc(r.swift)}</strong></p>` : ''}
</td></tr></table>`).join('');
    case 'kotak':
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;"><tr><td style="background:${b.nada === 'awas' ? W.merahMuda : W.pasir};border-radius:14px;padding:14px 18px;font-family:${HURUF};font-size:15px;line-height:1.55;color:${b.nada === 'awas' ? W.merah : W.tinta};">${baris(b.teks)}</td></tr></table>`;
  }
}

export type Kaki = { nama: string; baris: string[]; tautan: { teks: string; href: string }[]; alasan: string };

// One whole e-mail. `logo` is the absolute address of the white PNG logo,
// or empty to write the name instead (no site address known).
export function susunSurel(o: { lang: string; judul: string; pratinjau: string; logo: string; blok: Blok[]; kaki: Kaki }) {
  const kepala = o.logo
    ? `<img src="${esc(o.logo)}" width="200" height="48" alt="${esc(o.kaki.nama)}" style="display:block;width:200px;height:auto;border:0;outline:none;">`
    : `<p style="margin:0;font-family:${HURUF};font-size:22px;font-weight:800;letter-spacing:2px;color:#ffffff;">${esc(o.kaki.nama.toUpperCase())}</p>`;
  const tautan = o.kaki.tautan.map((t) => `<a href="${esc(t.href)}" target="_blank" style="color:${W.biruTua};font-weight:700;text-decoration:none;">${esc(t.teks)}</a>`).join('&nbsp;&nbsp;&nbsp;');
  return `<!doctype html>
<html lang="${esc(o.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(o.judul)}</title>
</head>
<body style="margin:0;padding:0;background:${W.latar};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${W.latar};">${esc(o.pratinjau)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${W.latar};">
<tr><td align="center" style="padding:28px 12px 36px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="background:${W.laut};border-radius:22px 22px 0 0;padding:26px 32px;">${kepala}</td></tr>
<tr><td style="background:#ffffff;padding:34px 32px 30px;">
<h1 style="margin:0 0 18px;font-family:${HURUF};font-size:26px;line-height:1.25;font-weight:800;color:${W.laut};">${esc(o.judul)}</h1>
${o.blok.map(blok).join('\n')}
</td></tr>
<tr><td style="background:${W.embun};border-radius:0 0 22px 22px;padding:22px 32px 26px;">
<p style="margin:0;font-family:${HURUF};font-size:15px;font-weight:800;color:${W.laut};">${esc(o.kaki.nama)}</p>
${o.kaki.baris.map((b) => `<p style="margin:3px 0 0;font-family:${HURUF};font-size:14px;line-height:1.5;color:${W.abu};">${baris(b)}</p>`).join('')}
${tautan ? `<p style="margin:12px 0 0;font-family:${HURUF};font-size:14px;">${tautan}</p>` : ''}
</td></tr>
<tr><td style="padding:16px 24px 0;font-family:${HURUF};font-size:12px;line-height:1.5;color:${W.abu};text-align:center;">${esc(o.kaki.alasan)}</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}
