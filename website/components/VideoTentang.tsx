'use client';
// Videos beside the about text, in place of its photo. On wide screens the
// first video stands tall in the middle with the next two shorter at its
// sides, and the one under the cursor grows tall. Below that the videos
// form a row to swipe, the one in the middle large and its neighbours
// smaller at the edges.
//
// YouTube and TikTok videos start on their own, muted and looping, once the
// section scrolls into view, and pause again when it scrolls away. On a
// phone only the video in the middle plays. The cover stays until the
// player has loaded, then the video fades in over it. Instagram has no
// player that starts on its own, so it keeps a cover with a play button,
// as do all videos for visitors who asked for less motion or to save data.
import { useCallback, useEffect, useRef, useState } from 'react';
import Ikon from './Ikon';
import type { Bahasa } from '@/lib/jenis';
import { NAMA_PLATFORM, kirimPerintah, type Video } from '@/lib/video';

const LEBAR = '(min-width: 1024px)';

export default function VideoTentang({ b, video, sampulCadangan }: { b: Bahasa; video: Video[]; sampulCadangan: string }) {
  const [aktif, setAktif] = useState(0);
  const [diputar, setDiputar] = useState<number | null>(null);
  const [gagal, setGagal] = useState<Set<number>>(new Set());
  // autoplay is allowed for this visitor, the section has been seen, and is in view now
  const [boleh, setBoleh] = useState(false);
  const [terlihat, setTerlihat] = useState(false);
  const [dimuat, setDimuat] = useState<Set<number>>(new Set());
  const [siap, setSiap] = useState<Set<number>>(new Set());
  const [lebarLayar, setLebarLayar] = useState(false);
  const bungkus = useRef<HTMLDivElement>(null);
  const jalur = useRef<HTMLUListElement>(null);
  const bingkai = useRef(new Map<number, HTMLIFrameElement>());
  // the first video sits in the middle, the second left of it and the third right
  const urut = video.length >= 3 ? [1, 0, 2] : video.map((_, i) => i);
  const lebar = () => window.matchMedia(LEBAR).matches;

  const keTengah = useCallback((i: number, halus = true) => {
    const el = jalur.current;
    const li = el?.querySelector<HTMLElement>(`[data-video="${i}"]`);
    if (!el || !li) return;
    el.scrollTo({ left: li.offsetLeft - (el.clientWidth - li.offsetWidth) / 2, behavior: halus ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(LEBAR);
    const ubah = () => setLebarLayar(mq.matches);
    ubah();
    mq.addEventListener('change', ubah);
    const tenang = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hemat = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    setBoleh(!tenang && !hemat);
    return () => mq.removeEventListener('change', ubah);
  }, []);

  // on phones the first video starts in the middle of the row
  useEffect(() => {
    if (!lebar()) keTengah(0, false);
  }, [keTengah]);

  // the section counts as seen once a quarter of it is on screen
  useEffect(() => {
    const el = bungkus.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setTerlihat(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the slide nearest the middle of the row is the large one
  useEffect(() => {
    const el = jalur.current;
    if (!el) return;
    let rf = 0;
    const cek = () => {
      cancelAnimationFrame(rf);
      rf = requestAnimationFrame(() => {
        if (lebar()) return;
        const tengah = el.scrollLeft + el.clientWidth / 2;
        let dekat = 0, jarak = Infinity;
        el.querySelectorAll<HTMLElement>('[data-video]').forEach((li) => {
          const d = Math.abs(li.offsetLeft + li.offsetWidth / 2 - tengah);
          if (d < jarak) { jarak = d; dekat = Number(li.dataset.video); }
        });
        setAktif(dekat);
      });
    };
    el.addEventListener('scroll', cek, { passive: true });
    return () => {
      el.removeEventListener('scroll', cek);
      cancelAnimationFrame(rf);
    };
  }, []);

  const otomatis = (i: number) => boleh && Boolean(video[i]?.otomatis);
  const harusJalan = useCallback((i: number) => terlihat && (lebarLayar || i === aktif), [terlihat, lebarLayar, aktif]);

  // load the players that should run, once, and keep them loaded afterwards
  useEffect(() => {
    if (!terlihat || !boleh) return;
    setDimuat((d) => {
      const baru = new Set(d);
      video.forEach((v, i) => { if (v.otomatis && harusJalan(i)) baru.add(i); });
      return baru.size === d.size ? d : baru;
    });
  }, [terlihat, boleh, harusJalan, video]);

  // play what is in view, pause the rest
  useEffect(() => {
    bingkai.current.forEach((f, i) => kirimPerintah(f.contentWindow, video[i].jenis, harusJalan(i) ? 'play' : 'pause'));
  }, [harusJalan, video]);

  // the TikTok player says when it is ready, it then gets muted and started or paused
  useEffect(() => {
    const dengar = (e: MessageEvent) => {
      let d = e.data;
      if (typeof d === 'string') {
        try { d = JSON.parse(d); } catch { return; }
      }
      if (!d?.['x-tiktok-player'] || d.type !== 'onPlayerReady') return;
      bingkai.current.forEach((f, i) => {
        if (f.contentWindow !== e.source) return;
        kirimPerintah(f.contentWindow, 'tiktok', 'mute');
        kirimPerintah(f.contentWindow, 'tiktok', harusJalan(i) ? 'play' : 'pause');
      });
    };
    window.addEventListener('message', dengar);
    return () => window.removeEventListener('message', dengar);
  }, [harusJalan]);

  // a video tapped for sound stops when swiped away on a phone
  useEffect(() => {
    if (diputar !== null && diputar !== aktif && !lebar()) setDiputar(null);
  }, [aktif, diputar]);

  function ketuk(i: number) {
    if (i !== aktif && !lebar()) {
      keTengah(i);
      return;
    }
    setAktif(i);
    setDiputar(i);
  }

  function muat(i: number, f: HTMLIFrameElement) {
    // the player needs a moment after load before the first frame shows
    setTimeout(() => setSiap((s) => new Set(s).add(i)), 600);
    if (video[i].jenis === 'tiktok') {
      kirimPerintah(f.contentWindow, 'tiktok', 'mute');
      kirimPerintah(f.contentWindow, 'tiktok', 'play');
    }
  }

  const putar = b === 'en' ? 'Play video' : 'Putar video';
  const tampilkan = b === 'en' ? 'Show video' : 'Tampilkan video';
  const keTengahLabel = b === 'en' ? 'Bring to the middle' : 'Bawa ke tengah';

  // min-w-0 keeps the row as wide as its column, so it scrolls instead of stretching the page
  return (
    <div ref={bungkus} className="min-w-0">
      <ul ref={jalur} onMouseLeave={() => lebar() && setAktif(0)}
        className={`tanpa-bilah relative -mx-4 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-[calc(50vw-min(31vw,8.5rem))] py-3 sm:-mx-6 lg:mx-0 ${video.length === 1 ? 'lg:aspect-[4/3]' : 'lg:aspect-[25/16]'} lg:snap-none lg:justify-center lg:gap-4 lg:overflow-visible lg:px-0 lg:py-0`}>
        {urut.map((i) => {
          const v = video[i];
          const besar = i === aktif;
          const sampul = !gagal.has(i) && v.sampul ? v.sampul : sampulCadangan;
          const nama = v.judul || `${NAMA_PLATFORM[v.jenis]} ${i + 1}`;
          const auto = otomatis(i) && diputar !== i;
          const sampulGambar = (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={sampul} alt="" loading="lazy" onError={() => setGagal((g) => new Set(g).add(i))}
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          );
          return (
            <li key={i} data-video={i} onMouseEnter={() => lebar() && setAktif(i)}
              className={`group relative aspect-[9/16] w-[min(62vw,17rem)] shrink-0 snap-center overflow-hidden rounded-[1.6rem] bg-laut-3 transition-all duration-500 ease-out lg:w-auto lg:max-w-none lg:scale-100 lg:opacity-100 lg:shadow-lembut ${besar ? 'lg:h-full' : 'scale-[0.86] opacity-75 lg:h-[78%]'}`}>
              {diputar === i ? (
                <iframe src={v.embed} title={nama} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
                  className="absolute inset-0 size-full border-0 bg-black" />
              ) : auto ? (
                <>
                  {sampulGambar}
                  {dimuat.has(i) && (
                    <iframe src={v.otomatis} title={nama} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
                      ref={(f) => { if (f) bingkai.current.set(i, f); else bingkai.current.delete(i); }}
                      onLoad={(e) => muat(i, e.currentTarget)} data-jalan={harusJalan(i) ? '1' : '0'}
                      className={`absolute inset-0 size-full border-0 transition-opacity duration-700 ${siap.has(i) ? 'opacity-100' : 'opacity-0'}`} />
                  )}
                  {/* on a phone a side video is tapped to come to the middle, not to work its player */}
                  {!lebarLayar && !besar && (
                    <button type="button" onClick={() => keTengah(i)} aria-label={`${keTengahLabel}, ${nama}`} className="absolute inset-0 size-full" />
                  )}
                </>
              ) : (
                <button type="button" onClick={() => ketuk(i)} onFocus={() => lebar() && setAktif(i)} aria-label={`${putar}, ${nama}`}
                  className="absolute inset-0 block size-full text-left">
                  {sampulGambar}
                  <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-black/10" />
                  <span aria-hidden className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-laut shadow-angkat transition-transform group-hover:scale-110">
                    <Ikon nama="putar" className="ml-1 size-7" />
                  </span>
                  <span aria-hidden className="absolute bottom-4 left-4 rounded-full bg-black/35 px-3 py-1 text-xs font-bold tracking-wide text-white">
                    {NAMA_PLATFORM[v.jenis]}
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {video.length > 1 && (
        <div className="mt-2 flex justify-center gap-2 lg:hidden">
          {urut.map((i) => (
            <button key={i} type="button" onClick={() => keTengah(i)} aria-label={`${tampilkan} ${i + 1}`} aria-current={i === aktif ? 'true' : undefined}
              className={`h-2 rounded-full transition-all ${i === aktif ? 'w-6 bg-biru-tua' : 'w-2 bg-buih-2'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
