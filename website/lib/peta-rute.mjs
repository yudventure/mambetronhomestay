// Frame and places of the route map in the Getting here section, shared by
// the drawing script (scripts/desain/peta-rute.mjs) and the page
// (components/PetaRute.tsx). One map unit is 0.001 degree, about 111 m.
export const BINGKAI = { barat: 130.47, timur: 131.40, utara: -0.30, selatan: -0.98 };
export const LEBAR = Math.round((BINGKAI.timur - BINGKAI.barat) * 1000);
export const TINGGI = Math.round((BINGKAI.utara - BINGKAI.selatan) * 1000);

/** @type {(lng: number, lat: number) => [number, number]} */
export const titik = (lng, lat) => [
  Math.round((lng - BINGKAI.barat) * 10000) / 10,
  Math.round((BINGKAI.utara - lat) * 10000) / 10,
];

// Domine Eduard Osok airport, Pelabuhan Rakyat in Sorong, Waisai harbour,
// and the west side of Kri where the bungalows stand.
export const TEMPAT = {
  bandara: titik(131.294, -0.889),
  sorong: titik(131.2475, -0.8765),
  waisai: titik(130.812, -0.4325),
  kri: titik(130.668, -0.5605),
};
