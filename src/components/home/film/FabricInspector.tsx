'use client';

import Image from 'next/image';
import { useRef, useState, type PointerEvent } from 'react';
import { FABRIC_DETAILS, tileCover, type FabricDetail } from './fabric-details';

/** How much the lens magnifies the close-up. */
const ZOOM = 2.6;

/** One close-up, filling its box (an HD photo or a tile cut from the composite photo). */
function DetailImage({ d, sizes, sharp }: { d: FabricDetail; sizes: string; sharp?: boolean }) {
  return d.src ? (
    // resized per screen by next/image (a phone gets a small file); the zoom lens asks for a bigger, sharper one
    <Image src={d.src} alt="" fill sizes={sizes} quality={sharp ? 90 : 75} className="object-cover" />
  ) : d.tile ? (
    <span className="fi-crop" style={tileCover(d.tile)} />
  ) : null;
}

/**
 * Fabric close-ups as a product inspector: one large view with a magnifying lens that follows the
 * pointer (so buyers can see the weave and stitching), and a strip of thumbnails. The film timeline
 * moves `active` while scrolling; a thumbnail click picks one directly.
 */
export function FabricInspector({
  active,
  onPick,
  names,
  hint,
}: {
  active: number;
  onPick: (index: number) => void;
  names: string[];
  hint: string;
}) {
  const view = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const d = FABRIC_DETAILS[active];

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = view.current!.getBoundingClientRect();
    setLens({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
  };

  return (
    <div className="fi">
      <div ref={view} className="fi-view" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setLens(null)}>
        <DetailImage d={d} sizes="(max-width: 800px) 72vw, 40vw" sharp />
        {lens && (
          <span className="fi-lens" style={{ left: lens.x, top: lens.y }} aria-hidden>
            {/* the same close-up, ZOOM times bigger, shifted so the point under the pointer sits in the lens centre */}
            <span
              className="fi-lens-in"
              style={{
                width: lens.w * ZOOM,
                height: lens.h * ZOOM,
                transform: `translate(${-lens.x * ZOOM}px, ${-lens.y * ZOOM}px)`,
              }}
            >
              <DetailImage d={d} sizes="(max-width: 800px) 100vw, 1200px" sharp />
            </span>
          </span>
        )}
        <span className="fi-cap">
          <b>{String(active + 1).padStart(2, '0')}</b>
          {names[active]}
        </span>
        {!lens && (
          <span className="fi-hint" aria-hidden>
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5" />
            </svg>
            {hint}
          </span>
        )}
      </div>
      <div className="fi-thumbs">
        {FABRIC_DETAILS.map((t, i) => (
          <button key={t.key} type="button" className="fi-thumb" aria-label={names[i]} aria-pressed={i === active} onClick={() => onPick(i)}>
            <DetailImage d={t} sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}
