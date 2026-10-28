// Video links from YouTube (also Shorts), Instagram and TikTok, turned into
// the platform's own embed player and, where the platform offers one without
// a key, a cover image. Safe to use in client components.
export type JenisVideo = 'youtube' | 'tiktok' | 'instagram';
// embed plays with sound after a tap, otomatis plays muted on its own and
// loops, empty where the platform has no such player (Instagram)
export type Video = { jenis: JenisVideo; id: string; url: string; embed: string; otomatis: string; sampul: string; judul: string };

export const NAMA_PLATFORM: Record<JenisVideo, string> = { youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram' };

// Commands to a playing embed through postMessage, the documented way for
// both YouTube (with enablejsapi=1) and the TikTok embed player.
export type Perintah = 'play' | 'pause' | 'mute';
export function kirimPerintah(jendela: Window | null | undefined, jenis: JenisVideo, apa: Perintah) {
  if (!jendela) return;
  if (jenis === 'youtube') {
    const func = { play: 'playVideo', pause: 'pauseVideo', mute: 'mute' }[apa];
    jendela.postMessage(JSON.stringify({ event: 'command', func, args: [] }), 'https://www.youtube-nocookie.com');
  } else if (jenis === 'tiktok') {
    jendela.postMessage({ type: apa, 'x-tiktok-player': true }, 'https://www.tiktok.com');
  }
}

export function bacaVideo(tautan: string, judul = ''): Video | null {
  let u: URL;
  try {
    u = new URL(tautan.trim());
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.toLowerCase().replace(/^(www|m|mobile)\./, '');
  const bagian = u.pathname.split('/').filter(Boolean);

  if (['youtu.be', 'youtube.com', 'youtube-nocookie.com', 'music.youtube.com'].includes(host)) {
    const id = host === 'youtu.be' ? bagian[0] : ['shorts', 'embed', 'live', 'v'].includes(bagian[0]) ? bagian[1] : u.searchParams.get('v');
    if (!id || !/^[\w-]{11}$/.test(id)) return null;
    return {
      jenis: 'youtube', id, url: tautan, judul,
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`,
      otomatis: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`,
      sampul: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  if (host === 'tiktok.com') {
    const i = bagian.indexOf('video');
    const id = i >= 0 ? bagian[i + 1] : ['embed', 'player'].includes(bagian[0]) ? bagian[bagian.length - 1] : undefined;
    if (!id || !/^\d{8,25}$/.test(id)) return null;
    return {
      jenis: 'tiktok', id, url: tautan, judul, sampul: '',
      embed: `https://www.tiktok.com/player/v1/${id}?autoplay=1&description=0&music_info=0&rel=0`,
      otomatis: `https://www.tiktok.com/player/v1/${id}?autoplay=1&loop=1&controls=1&progress_bar=0&play_button=0&fullscreen_button=0&timestamp=0&volume_control=1&description=0&music_info=0&rel=0&native_context_menu=0&closed_caption=0`,
    };
  }
  if (host === 'instagram.com') {
    const i = bagian.findIndex((x) => ['p', 'reel', 'reels', 'tv'].includes(x));
    const kode = i >= 0 ? bagian[i + 1] : undefined;
    if (!kode || !/^[\w-]{5,40}$/.test(kode)) return null;
    const jalur = bagian[i] === 'reel' || bagian[i] === 'reels' ? 'reel' : 'p';
    return { jenis: 'instagram', id: kode, url: tautan, judul, sampul: '', otomatis: '', embed: `https://www.instagram.com/${jalur}/${kode}/embed/` };
  }
  return null;
}
