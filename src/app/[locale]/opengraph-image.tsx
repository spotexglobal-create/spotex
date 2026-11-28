import { ImageResponse } from 'next/og';

/**
 * The preview picture shown when a Spotex link is shared on WhatsApp, Facebook, LinkedIn … (1200×630).
 * Used by every page; product pages and articles share their own photo instead.
 */
export const alt = 'Spotex International · Martial arts uniform manufacturer since 1989';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// the main BJJ gi, converted to PNG by Cloudinary (the image renderer cannot read WebP)
const GI = 'https://res.cloudinary.com/vmom2s9f/image/upload/f_png,w_560/v1795599006/spotex/products/jiu-jitsu-uniforms-si-jju-1001-631636-1775541913.webp';

async function giPhoto() {
  try {
    const res = await fetch(GI);
    if (!res.ok) return null;
    return `data:image/png;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null; // the card still works without the photo
  }
}

export default async function OgImage() {
  const photo = await giPhoto();
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0b0b0b', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 0 0 72px', width: photo ? 700 : 1200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, fontWeight: 700, letterSpacing: 6, color: '#de0000' }}>
            <div style={{ width: 44, height: 4, background: '#de0000' }} />
            OWN FACTORY SINCE 1989
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22, fontSize: 92, fontWeight: 900, lineHeight: 0.95, letterSpacing: -2 }}>
            <span>SPOTEX</span>
            <span style={{ color: '#de0000' }}>INTERNATIONAL</span>
          </div>
          <div style={{ marginTop: 26, fontSize: 30, lineHeight: 1.35, color: 'rgba(255,255,255,.82)', maxWidth: 580 }}>
            BJJ gis, judo uniforms, rash guards &amp; MMA shorts, custom-branded.
          </div>
          <div style={{ display: 'flex', marginTop: 34, fontSize: 22, fontWeight: 700, color: '#fff' }}>
            <div style={{ display: 'flex', padding: '12px 26px', borderRadius: 999, background: '#de0000' }}>spotexinternational.com</div>
          </div>
        </div>
        {photo && (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', margin: '40px 48px 40px 0', borderRadius: 32, background: '#fff' }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG, not a page */}
            <img src={photo} alt="" width={380} height={500} style={{ objectFit: 'contain' }} />
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: '#de0000' }} />
      </div>
    ),
    size,
  );
}
