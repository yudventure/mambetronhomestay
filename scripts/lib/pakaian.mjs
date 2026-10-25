// Flat garment drawings for mockups. Units are millimetres at size M,
// x = 0 on the centre line, y = 0 at the neck point.
const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};
export { shade };

const mirror = (pts) => pts.concat(pts.slice().reverse().map(([x, y]) => [-x, y]));

export function kaos({ warna, sisi = 'depan' }) {
  const garis = shade(warna, warna === '#FFFFFF' ? -0.18 : -0.35);
  const lipat = shade(warna, warna === '#FFFFFF' ? -0.07 : -0.18);
  const neckD = sisi === 'depan' ? 66 : 20;
  // left half outline from the shoulder seam at the neck to the hem
  const body = `M-92 -2L-234 22L-376 188Q-334 238 -294 286L-262 236Q-252 480 -262 722Q0 734 262 722Q252 480 262 236L294 286Q334 238 376 188L234 22L92 -2Q46 ${neckD} 0 ${neckD}Q-46 ${neckD} -92 -2Z`;
  const kerah = `M-92 -2Q-46 ${neckD} 0 ${neckD}Q46 ${neckD} 92 -2L112 2Q56 ${neckD + 24} 0 ${neckD + 24}Q-56 ${neckD + 24} -112 2Z`;
  // inside of the back neck, seen through the front opening
  let s = sisi === 'depan' ? `<path d="M-112 2Q0 34 112 2L92 -2Q46 ${neckD} 0 ${neckD}Q-46 ${neckD} -92 -2Z" fill="${shade(warna, warna === '#FFFFFF' ? -0.12 : -0.3)}"/>` : '';
  s += `<path d="${body}" fill="${warna}" stroke="${garis}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<path d="${kerah}" fill="${lipat}" stroke="${garis}" stroke-width="2.5" stroke-linejoin="round"/>`;
  // hems and sleeve seams
  s += `<path d="M-357 214Q-322 254 -288 292M357 214Q322 254 288 292M-260 700Q0 712 260 700M-234 22Q-262 130 -262 236M234 22Q262 130 262 236" fill="none" stroke="${lipat}" stroke-width="2.5"/>`;
  return s;
}

export function jaket({ warna, rib, sisi = 'depan' }) {
  const garis = shade(warna, -0.35);
  rib = rib || shade(warna, -0.2);
  const ribGaris = shade(rib, -0.3);
  const neckD = sisi === 'depan' ? 70 : 22;
  const sleeve = (k) => `M${-240 * k} 28L${-394 * k} 566L${-320 * k} 588L${-282 * k} 250Z`;
  let s = '';
  for (const k of [1, -1]) {
    s += `<path d="${sleeve(k)}" fill="${warna}" stroke="${garis}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="M${-394 * k} 566L${-404 * k} 630L${-326 * k} 652L${-320 * k} 588Z" fill="${rib}" stroke="${ribGaris}" stroke-width="2.5" stroke-linejoin="round"/>`;
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      s += `<path d="M${(-394 + 74 * t) * k} ${566 + 22 * t}L${(-404 + 78 * t) * k} ${630 + 22 * t}" stroke="${ribGaris}" stroke-width="1.2" opacity="0.5"/>`;
    }
  }
  s += `<path d="M-100 0L-240 28L-282 250L-280 610L280 610L282 250L240 28L100 0Q50 ${neckD} 0 ${neckD}Q-50 ${neckD} -100 0Z" fill="${warna}" stroke="${garis}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<path d="M-280 610L-282 676L282 676L280 610Z" fill="${rib}" stroke="${ribGaris}" stroke-width="2.5" stroke-linejoin="round"/>`;
  for (let x = -270; x <= 270; x += 18) s += `<path d="M${x} 614V672" stroke="${ribGaris}" stroke-width="1.2" opacity="0.5"/>`;
  if (sisi === 'depan') s = `<path d="M-118 -26Q0 -6 118 -26L100 0Q50 ${neckD} 0 ${neckD}Q-50 ${neckD} -100 0Z" fill="${shade(rib, -0.25)}"/>` + s;
  s += `<path d="M-100 0Q-50 ${neckD} 0 ${neckD}Q50 ${neckD} 100 0L118 -26Q60 ${neckD - 32} 0 ${neckD - 32}Q-60 ${neckD - 32} -118 -26Z" fill="${rib}" stroke="${ribGaris}" stroke-width="2.5" stroke-linejoin="round"/>`;
  s += `<path d="M-240 28Q-262 130 -282 250M240 28Q262 130 282 250" fill="none" stroke="${shade(warna, -0.2)}" stroke-width="2.5"/>`;
  if (sisi === 'depan') {
    s += `<path d="M0 ${neckD - 6}V676" stroke="${shade(warna, -0.45)}" stroke-width="7"/><path d="M0 ${neckD - 6}V676" stroke="${shade(warna, 0.25)}" stroke-width="2" stroke-dasharray="3 3"/>`;
    s += `<rect x="-9" y="${neckD - 2}" width="18" height="34" rx="5" fill="#C9CED1" stroke="${shade(warna, -0.45)}" stroke-width="2"/>`;
    s += `<path d="M-215 420L-168 520M215 420L168 520" stroke="${shade(warna, -0.3)}" stroke-width="7" stroke-linecap="round"/>`;
  }
  return s;
}
