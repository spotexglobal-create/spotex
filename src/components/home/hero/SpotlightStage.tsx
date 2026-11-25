'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { type CSSProperties, useRef, useState } from 'react';
import { scrollToY, useLenis } from '@/components/motion/SmoothScroll';
import { Link } from '@/i18n/navigation';
import type { CategorySlug } from '@/lib/catalog/types';
import type { CalloutSide } from './hero-items';
import './spotlight.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface HeroSlide {
  slug: string;
  code: string;
  name: string;
  category: CategorySlug;
  image: string;
  /** One-line spec summary, e.g. "Pearl weave · Poly-cotton · 280 GSM". */
  spec: string;
  callouts: { key: string; side: CalloutSide; x: number; y: number; title: string; text: string }[];
  /** Per-product override of INNER for wide products. */
  inner?: number;
}

export interface HeroText {
  introTop: string;
  introFacts: string[];
  eyebrow: string;
  titleA: string;
  titleB: string;
  copy: string;
  viewCollection: string;
  requestSample: string;
  scroll: string;
}

/** Timeline layout: the logo phase takes 1 unit, then each product gets STEP units. */
const START = 1;
const STEP = 1.15;
const LABEL_W = 210;
/** Minimum vertical space between two labels on the same side. */
const LABEL_GAP = 26;
/** The product fills roughly the middle half of its square photo; labels start just outside it. */
const INNER = 0.24;
/** Where the product's feet are in the photo, the base width (share of the photo), and the tilted disc's height ratio (cos 74°). */
const FEET = 0.965;
const BASE_W = 0.62;
const TILT_H = 0.276;
const HEADER_BOTTOM = 80;
const LETTERS = ['S', 'P', 'O', 'T', 'E', 'X'];

const isNarrow = () => window.innerWidth < 800;

/** Rect of `el` relative to `stage`, so it is right even while the pinned stage is off-screen. */
function relRect(el: Element, stage: Element) {
  const r = el.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  return { left: r.left - s.left, right: r.right - s.left, top: r.top - s.top, bottom: r.bottom - s.top, width: r.width, height: r.height };
}

export function SpotlightStage({ slides, text }: { slides: HeroSlide[]; text: HeroText }) {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const lenis = useLenis();
  const total = slides.length;

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const stage = el.querySelector('.sl-stage')!;
      const imgs = q('.sl-prod img');

      /** Places every callout around the product, keeping labels clear of the copy and product info. */
      const layoutCallouts = () => {
        const prod = relRect(el.querySelector('.sl-prod')!, stage);
        // the base sits just below the product's feet (photos end ~3% above the box bottom)
        const feet = prod.top + FEET * prod.height;
        const base = prod.width * BASE_W;
        const plat = el.querySelector<HTMLElement>('.sl-plat')!;
        plat.style.width = `${base}px`;
        plat.style.top = `${feet + (base * TILT_H) / 2 + 6}px`;
        const shadow = el.querySelector<HTMLElement>('.sl-shadow')!;
        shadow.style.top = `${feet}px`;
        shadow.style.width = `${prod.width * 0.42}px`;
        if (isNarrow()) return;

        const pad = (node: Element) => {
          const r = relRect(node, stage);
          return { l: r.left - 24, r: r.right + 24, t: r.top - 16, b: r.bottom + 16 };
        };
        const meta = pad(el.querySelector('.sl-meta')!);
        meta.l = Math.min(meta.l, meta.r - 360); // product names change width: reserve room
        const obstacles = [pad(el.querySelector('.sl-copy')!), meta];

        slides.forEach((slide, i) => {
          const lastTop: Record<CalloutSide, number> = { L: Infinity, R: Infinity };
          // bottom-most callout first, so labels stack upward
          [...slide.callouts]
            .map((c, j) => ({ c, j }))
            .sort((a, b) => b.c.y - a.c.y)
            .forEach(({ c, j }) => {
              const co = el.querySelector<HTMLElement>(`[data-co="${i}-${j}"]`)!;
              const line = co.querySelector<HTMLElement>('.ln')!;
              const label = co.querySelector<HTMLElement>('.lb')!;
              const x = prod.left + c.x * prod.width;
              const y = prod.top + c.y * prod.height;
              const inner = slide.inner ?? INNER;
              const lx =
                c.side === 'L'
                  ? Math.max(16, prod.left + inner * prod.width - LABEL_W - 36)
                  : Math.min(window.innerWidth - LABEL_W - 16, prod.right - inner * prod.width + 36);
              const h = label.offsetHeight;
              const titleMid = label.querySelector<HTMLElement>('b')!.offsetHeight / 2;

              let top = y - titleMid;
              for (const o of obstacles) {
                if (lx < o.r && lx + LABEL_W > o.l && top + h > o.t && top < o.b) top = o.t - h;
              }
              top = Math.max(HEADER_BOTTOM, Math.min(top, lastTop[c.side] - h - LABEL_GAP));
              lastTop[c.side] = top;

              co.style.left = `${x}px`;
              co.style.top = `${y}px`;
              label.style.left = `${lx - x}px`;
              label.style.top = `${top - y}px`;
              label.style.textAlign = c.side === 'L' ? 'right' : 'left';

              const dx = (c.side === 'L' ? lx + LABEL_W + 8 : lx - 8) - x;
              const dy = top + titleMid - y;
              line.style.width = `${Math.hypot(dx, dy)}px`;
              gsap.set(line, { rotation: (Math.atan2(dy, dx) * 180) / Math.PI, transformOrigin: '0% 50%' });
            });
        });
      };

      // initial state + the logo builds itself on load
      // These match the CSS start state (spotlight.css), so nothing jumps when the script takes over.
      // Centring of the word and the product is done in CSS only; GSAP animates their children,
      // so the two never stack up and push things off-centre. The turntable is GSAP-only.
      gsap.set(q('.sl-plat'), { xPercent: -50, yPercent: -50, rotateX: 74, transformPerspective: 1200 });
      gsap.set(q('.sl-co .ln'), { scaleX: 0 });
      gsap.set(q('.sl-copy, .sl-meta, .sl-plat, .sl-mdet, .sl-shadow'), { autoAlpha: 0 });
      // the logo builds itself on load in CSS (spotlight.css → sl-letter), so it shows before this script runs

      // scroll film: letters fly apart, the set appears, then one product per step
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
      // fromTo (not to): the load intro may still be running when this is recorded
      tl.fromTo(q('.sl-intro, .sl-cue'), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -20, duration: 0.3 }, 0)
        .fromTo(
          q('.sl-word span'),
          { x: 0, y: 0, rotate: 0, scale: 1, autoAlpha: 1 },
          {
            x: (i) => (i - 2.5) * (isNarrow() ? 70 : 190),
            y: (i) => (i % 2 ? -1 : 1) * window.innerHeight * 0.12,
            rotate: (i) => (i - 2.5) * 12,
            scale: 1.15,
            autoAlpha: 0,
            duration: 0.6,
            stagger: 0.03,
          },
          0.05,
        )
        .fromTo(q('.sl-plat'), { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'expo.out' }, 0.35)
        .fromTo(q('.sl-shadow'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0.6)
        .fromTo(q('.sl-ghost'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.5)
        .fromTo(q('.sl-copy'), { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.5)
        .fromTo(q('.sl-meta'), { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.55)
        .set(q('.sl-mdet'), { autoAlpha: 1 }, 0.9);

      slides.forEach((slide, i) => {
        const t = START + i * STEP;
        // the product drops in from above and lands on the turntable
        tl.fromTo(
          imgs[i],
          { opacity: 1, y: () => -window.innerHeight * 1.15, rotate: -9, scale: 0.92, filter: 'blur(6px)' },
          { opacity: 1, y: 0, rotate: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' },
          t - 0.1,
        )
          // landing: the contact shadow squashes as the product touches down
          .fromTo(q('.sl-shadow'), { scaleX: 0.6 }, { scaleX: 1, duration: 0.25, ease: 'back.out(3)' }, t + 0.25);

        slide.callouts.forEach((_, j) => {
          const co = `[data-co="${i}-${j}"]`;
          const at = t + 0.2 + j * 0.07;
          tl.fromTo(q(`${co} .dot`), { scale: 0 }, { scale: 1, duration: 0.1, ease: 'back.out(3)' }, at)
            .fromTo(q(`${co} .ln`), { scaleX: 0 }, { scaleX: 1, duration: 0.2 }, at + 0.05)
            .fromTo(q(`${co} .lb`), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.15 }, at + 0.15);
        });

        if (i < slides.length - 1) {
          const out = t + STEP - 0.3;
          // fromTo with the known start values (not to): GSAP then never reads styles back, which on a phone
          // forced a fresh layout for every tween while the page was starting up
          tl.fromTo(q(`[data-co^="${i}-"]`), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.12, immediateRender: false }, out).fromTo(
            imgs[i],
            { opacity: 1, y: 0, rotate: 0, scale: 1, filter: 'blur(0px)' },
            {
              opacity: 0,
              y: () => window.innerHeight * 0.35,
              rotate: 7,
              scale: 0.9,
              filter: 'blur(8px)',
              duration: 0.35,
              ease: 'power3.in',
              immediateRender: false,
            },
            out,
          );
        }
      });
      tl.to({}, { duration: 0.3 });

      const sync = (progress: number) => {
        const t = progress * tl.duration();
        const i = Math.max(0, Math.min(slides.length - 1, Math.floor((t - START + 0.25) / STEP)));
        if (trackRef.current) trackRef.current.style.transform = `scaleX(${Math.max(0, (t - START) / (slides.length * STEP))})`;
        if (i !== activeRef.current) {
          activeRef.current = i;
          setActive(i);
        }
      };

      triggerRef.current = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: isNarrow() ? 0.35 : 0.8,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: (self) => sync(self.progress),
      });

      // after a refresh, sweep end → start → current so every "from" state is re-applied
      const onRefresh = () => {
        layoutCallouts();
        const p = tl.progress();
        tl.progress(1, true).progress(0, true).progress(p, true);
      };
      ScrollTrigger.addEventListener('refresh', onRefresh);
      onRefresh();

      // idle life: the word drifts with the mouse (the turntable rings spin in CSS)
      const onPointer = (e: PointerEvent) => gsap.to(q('.sl-word-in'), { x: -(e.clientX / window.innerWidth - 0.5) * 40, duration: 1 });
      window.addEventListener('pointermove', onPointer);

      return () => {
        ScrollTrigger.removeEventListener('refresh', onRefresh);
        window.removeEventListener('pointermove', onPointer);
      };
    },
    { scope: root, dependencies: [slides] },
  );

  /** Scrolls to the moment the chosen product has landed. */
  const goTo = (i: number) => {
    const st = triggerRef.current;
    const tl = st?.animation;
    if (!st || !tl) return;
    const t = START + i * STEP + 0.6;
    scrollToY(lenis, st.start + (st.end - st.start) * (t / tl.duration()));
  };

  const current = slides[active];

  return (
    <section ref={root} className="spotlight" style={{ '--steps': 1.4 + total * STEP } as CSSProperties} aria-label={text.eyebrow}>
      <div className="sl-stage">
        <div className="sl-intro-in">
          <p className="sl-intro sl-intro-top">{text.introTop}</p>
          <ul className="sl-intro sl-intro-bot">
            {text.introFacts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <div className="sl-cue" aria-hidden>
            <span>{text.scroll}</span>
            <i />
          </div>
        </div>
        <div className="sl-word" aria-hidden>
          <div className="sl-word-in">
            {LETTERS.map((l, i) => (
              <span key={l} className={i === LETTERS.length - 1 ? 'x' : undefined}>
                <i style={{ '--i': i } as CSSProperties}>{l}</i>
              </span>
            ))}
          </div>
        </div>

        <div className="sl-ghost" aria-hidden>
          SPOTEX
        </div>
        <div className="sl-plat" aria-hidden>
          <i className="p1" />
          <i className="p2" />
          <i className="p3" />
          <i className="p4" />
        </div>
        <div className="sl-shadow" aria-hidden />
        <div className="sl-prod">
          {/* turns slowly to and fro on the turntable (CSS only; GSAP moves the images inside) */}
          <div className="sl-turn">
            {slides.map((s, i) => (
              <Image key={s.slug} src={s.image} alt={`${s.name} ${s.code}`} fill sizes="(max-width: 800px) 60vw, 440px" priority={i === 0} />
            ))}
          </div>
        </div>

        <div aria-hidden>
          {slides.map((s, i) =>
            s.callouts.map((c, j) => (
              <div key={`${i}-${j}`} className="sl-co" data-co={`${i}-${j}`}>
                <span className="ln" />
                <i className="dot" />
                <div className="lb">
                  <b>{c.title}</b>
                  {c.text}
                </div>
              </div>
            )),
          )}
        </div>

        <p className="sl-mdet">
          {current.callouts.map((c) => (
            <span key={c.key} className="block">
              <b>{c.title}</b> · {c.text}
            </span>
          ))}
        </p>

        <div className="sl-copy">
          <p className="eyebrow">{text.eyebrow}</p>
          <h1>
            {text.titleA}
            <br />
            <em>{text.titleB}</em>
          </h1>
          <p>{text.copy}</p>
          <div className="row">
            <Link href="/products" className="btn">
              {text.viewCollection}
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              {text.requestSample}
            </Link>
          </div>
        </div>

        <div className="sl-meta">
          <p className="count">
            <b>{String(active + 1).padStart(2, '0')}</b> / {String(total).padStart(2, '0')}
          </p>
          <p className="code">{current.code}</p>
          <Link
            href={{ pathname: '/products/[category]/[product]', params: { category: current.category, product: current.slug } }}
            className="name"
          >
            {current.name}
          </Link>
          <p className="spec">{current.spec}</p>
          <div className="sl-thumbs">
            {slides.map((s, i) => (
              <button key={s.slug} type="button" aria-label={s.name} aria-current={i === active} onClick={() => goTo(i)}>
                <Image src={s.image} alt="" fill sizes="50px" />
              </button>
            ))}
          </div>
          <div className="sl-track">
            <i ref={trackRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
