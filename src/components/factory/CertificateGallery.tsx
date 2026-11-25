'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Certificate = {
  src: string;
  title: string;
  issuer: string;
  note: string;
  group: 'quality' | 'sport';
};

type Props = {
  items: Certificate[];
  labels: { quality: string; sport: string; view: string; close: string; prev: string; next: string };
};

export function CertificateGallery({ items, labels }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const open = (i: number) => {
    setActive(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (d: number) => setActive((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    const onClose = () => setActive(null);
    dlg.addEventListener('keydown', onKey);
    dlg.addEventListener('close', onClose);
    return () => {
      dlg.removeEventListener('keydown', onKey);
      dlg.removeEventListener('close', onClose);
    };
  }, [step]);

  const current = active === null ? null : items[active];

  return (
    <>
      {(['quality', 'sport'] as const).map((group) => (
        <div key={group} className="mt-12 first:mt-10">
          <h3 className="flex items-center gap-3 text-[11px] font-extrabold tracking-[0.18em] text-ink uppercase">
            <span className="h-[2px] w-8 bg-brand" aria-hidden />
            {labels[group]}
          </h3>
          <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((c, i) =>
              c.group !== group ? null : (
                <li key={c.src}>
                  <button
                    type="button"
                    onClick={() => open(i)}
                    aria-label={`${labels.view}: ${c.title}, ${c.issuer}`}
                    className="group flex h-full w-full flex-col overflow-hidden rounded-[20px] border-[1.5px] border-ink bg-white text-left transition-colors hover:border-brand"
                  >
                    <span className="relative block aspect-[3/4] bg-soft">
                      <Image
                        src={c.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
                        className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <span className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full bg-ink text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 fill-none stroke-current stroke-2">
                          <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" />
                        </svg>
                      </span>
                    </span>
                    <span className="flex flex-1 flex-col border-t border-ink/10 p-4">
                      <span className="display text-2xl leading-none text-ink group-hover:text-brand">{c.title}</span>
                      <span className="mt-1.5 text-[12px] font-bold text-ink">{c.issuer}</span>
                      <span className="mt-1 text-[12px] leading-relaxed text-ink/75">{c.note}</span>
                    </span>
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      ))}

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-label={current ? `${current.title}, ${current.issuer}` : undefined}
        className="m-auto max-h-[100dvh] max-w-[100vw] bg-transparent p-0 backdrop:bg-ink/80"
      >
        {current && (
          <div
            onClick={(e) => e.target === e.currentTarget && close()}
            className="flex h-[100dvh] w-[100vw] flex-col items-center justify-center gap-3 p-4 sm:p-8"
          >
            <div className="relative min-h-0 w-full max-w-[520px] flex-1">
              <Image src={current.src} alt={`${current.title}, ${current.issuer}`} fill sizes="520px" className="object-contain" />
            </div>
            <div className="flex w-full max-w-[520px] items-center gap-3 rounded-2xl bg-white p-3 pl-5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">
                  {current.title} · {current.issuer}
                </p>
                <p className="truncate text-[12px] text-ink/75">{current.note}</p>
              </div>
              <button type="button" onClick={() => step(-1)} aria-label={labels.prev} className="grid h-10 w-10 flex-none place-items-center rounded-full border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white">
                ←
              </button>
              <button type="button" onClick={() => step(1)} aria-label={labels.next} className="grid h-10 w-10 flex-none place-items-center rounded-full border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white">
                →
              </button>
              <button type="button" onClick={close} aria-label={labels.close} className="grid h-10 w-10 flex-none place-items-center rounded-full bg-brand text-white">
                ✕
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
