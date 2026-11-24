'use client';

import Image from 'next/image';
import { useState, type MouseEvent } from 'react';

/**
 * Product photos: a square main view (hover to zoom into the fabric, the zoom follows the pointer)
 * with a column of thumbnails beside it on wide screens and below it on phones.
 */
export function ProductGallery({ images, alt, zoomHint }: { images: string[]; alt: string; zoomHint: string }) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState<string | null>(null);

  const follow = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2.5 md:flex-col">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={`relative h-20 w-16 flex-none overflow-hidden rounded-xl border-[1.5px] bg-soft transition-colors ${
                i === active ? 'border-brand' : 'border-ink/20 hover:border-ink'
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="photo-multiply object-cover" />
            </button>
          ))}
        </div>
      )}
      <div
        className="group relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-[22px] border-[1.5px] border-ink/15 bg-soft"
        onMouseMove={follow}
        onMouseLeave={() => setOrigin(null)}
      >
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 92vw"
          className="photo-multiply object-contain p-6 transition-transform duration-200 ease-out"
          style={{ transform: origin ? 'scale(1.9)' : 'none', transformOrigin: origin ?? '50% 50%' }}
        />
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-ink/80 px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase transition-opacity group-hover:opacity-0">
          {zoomHint}
        </span>
      </div>
    </div>
  );
}
