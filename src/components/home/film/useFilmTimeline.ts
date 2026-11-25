'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useState, type RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Chapter start times on the film timeline, in order. */
export const CHAPTERS = [
  ['fabric', 0],
  ['uniforms', 6.95],
  ['custom', 11.8],
  ['collection', 15.35],
  ['belts', 21.2],
  ['factory', 24.6],
  ['export', 27.4],
] as const;
export type ChapterKey = (typeof CHAPTERS)[number][0];

/** Extra timeline time given to the fabric close-ups; everything after the fabric scene moves by this much. */
const DETAILS_EXTRA = 3.15;
/** Where the close-ups start and how long each one stays. */
const DETAILS_START = 1.5;
const DETAILS_SLOT = 0.75;
/** Extra time for the discipline line-up, and when / how long each discipline is highlighted. */
const LINEUP_EXTRA = 3.05;
const LINEUP_START = 8.2;
const LINEUP_SLOT = 0.6;
/** Extra time for the "your brand" scene (inserted at BRAND_SHIFT_AT), and when / how often a logo spot appears. */
const BRAND_EXTRA = 1.2;
const BRAND_SHIFT_AT = 13.55;
const BRAND_START = 12.5;
const BRAND_SLOT = 0.32;
/** Extra time for the product ring (inserted at RING_SHIFT_AT), and the stretch in which it turns. */
const RING_EXTRA = 2.2;
const RING_SHIFT_AT = 18.35;
const RING_START = 15.6;
const RING_END = 20.5;
/** Share of a line-up card's height taken by its photo (the rest is the label). */
const LINEUP_PHOTO = 0.72;

const isNarrow = () => window.innerWidth < 800;
const cssPx = (name: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

function relRect(el: Element, stage: Element) {
  const r = el.getBoundingClientRect();
  const s = stage.getBoundingClientRect();
  return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
}

/** Animate a path being drawn, using its real length (pathLength-based dashes render as dots in Chrome). */
// The gap is longer than the path and the offset sits inside it, so not even a round cap shows before drawing starts.
const drawFrom = {
  strokeDasharray: (_: number, el: SVGPathElement) => `${el.getTotalLength()} ${el.getTotalLength() + 4}`,
  strokeDashoffset: (_: number, el: SVGPathElement) => el.getTotalLength() + 2,
};

/**
 * Builds the home film: one timeline, scrubbed by scrolling through `root`.
 * `onProgress` receives the scroll progress (0–1) and the active chapter.
 */
export function useFilmTimeline(
  root: RefObject<HTMLElement | null>,
  {
    ringCount,
    detailCount,
    onDetail,
    onSpot,
    onProgress,
  }: {
    ringCount: number;
    detailCount: number;
    /** Called with the fabric close-up to show while scrolling through the fabric scene. */
    onDetail: (index: number) => void;
    /** Called with the discipline card in the spotlight in the uniforms scene (-1 when none is). */
    onSpot: (index: number) => void;
    onProgress: (progress: number, chapter: ChapterKey) => void;
  },
) {
  // Building the film (hundreds of tweens, each measuring the page) is the heaviest work on the home page.
  // It is done only once the film is about to come into view — while the visitor is still on the hero —
  // so opening the page stays fast.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '150% 0px 150% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  useGSAP(
    () => {
      if (!near) return;
      const el = root.current!;
      const q = gsap.utils.selector(el);
      const one = <T extends Element = HTMLElement>(sel: string) => el.querySelector<T>(sel)!;
      const stage = one('.film-stage');
      const actor = one('.actor');

      /* ---- sizes that depend on the screen ---- */
      const sizeRing = () => {
        // layout height (not getBoundingClientRect): the wrap is scaled down while it animates in
        const boxH = one<HTMLElement>('.ringwrap').clientHeight;
        const narrow = isNarrow();
        const cw = Math.max(120, Math.min(window.innerWidth * (narrow ? 0.62 : 0.2), 300, (boxH * 0.9) / 1.38));
        // radius big enough that neighbouring cards don't touch, whatever the number of products
        const fit = (cw * 1.4) / (2 * Math.sin(Math.PI / ringCount));
        // on phones the ring may run past the screen edges: the front card matters, the neighbours just peek in
        const r = Math.min(Math.max(cw * (narrow ? 1.5 : 1.9), fit), window.innerWidth * (narrow ? 2.2 : 0.5));
        one('.ring').style.setProperty('--cw', `${cw}px`);
        one('.ring').style.setProperty('--r', `${r}px`);
        one('.ringpos').style.setProperty('--r', `${r}px`);
      };
      sizeRing();

      // layout reads are cached until the next refresh: dozens of tween values ask for the same boxes,
      // and reading layout between GSAP's style writes forces a reflow each time
      const cache = new Map<string, unknown>();
      const once = <T,>(key: string, read: () => T) => {
        if (!cache.has(key)) cache.set(key, read());
        return cache.get(key) as T;
      };
      const px = (name: string) => once(`px:${name}`, () => cssPx(name));

      /* ---- where the travelling dress goes (offsets from the stage centre) ---- */
      const actorH = () => actor.offsetHeight;
      const toCentre = (r: { left: number; top: number; width: number; height: number }) => ({
        x: r.left + r.width / 2 - window.innerWidth / 2,
        y: r.top + r.height / 2 - window.innerHeight / 2,
      });
      const slotWeave = () =>
        once('weave', () => {
          const r = relRect(one('.weave-slot'), stage);
          return { ...toCentre(r), s: (r.height * 0.96) / actorH() };
        });
      // layout box of the centre gi (offset* ignore GSAP transforms; the scene itself never moves)
      const giBox = () =>
        once('gi', () => {
          const s = relRect(one('.s3'), stage);
          const g = one('.gi-m');
          return { left: s.left + g.offsetLeft, top: s.top + g.offsetTop, w: g.offsetWidth, h: g.offsetHeight };
        });
      const slotUni = () => {
        const b = giBox();
        const h = b.h * LINEUP_PHOTO;
        return { x: b.left + b.w / 2 - window.innerWidth / 2, y: b.top + h / 2 - window.innerHeight / 2, s: h / actorH() };
      };
      // in the "your brand" scene the gi's photo (top 72% of its card) is moved down to the bottom of the
      // safe area and grown from its bottom edge until it reaches the header, so it fills the right side
      // phones: the gi fills the space between the copy block and the scene counter, centred in it
      const phoneFit = () => {
        const b = giBox();
        const top = once('copyBottom', () => {
          const copy = one('.s4 .copy');
          return copy.offsetTop + copy.offsetHeight + 16;
        });
        const bottom = window.innerHeight - px('--bot') - 10;
        const scale = Math.min(2.1, (bottom - top) / (b.h * LINEUP_PHOTO));
        const spare = bottom - top - b.h * LINEUP_PHOTO * scale;
        return { scale, bottom: bottom - Math.max(0, spare) / 2 };
      };
      const camShift = () => {
        const b = giBox();
        const bottom = isNarrow() ? phoneFit().bottom : window.innerHeight - px('--bot') - 6;
        return bottom - (b.top + b.h * LINEUP_PHOTO);
      };
      // desktop: grow to the header
      const camScale = () => {
        const b = giBox();
        return isNarrow() ? phoneFit().scale : Math.min(2.2, (window.innerHeight - px('--bot') - px('--top') - 12) / (b.h * LINEUP_PHOTO));
      };
      const camX = () => {
        const b = giBox();
        // phones: a little left of centre, so the labels on the right stay on screen
        return isNarrow() ? window.innerWidth * 0.48 - (b.left + b.w / 2) : window.innerWidth * 0.2;
      };

      /* ---- initial state ---- */
      gsap.set(q('.s2, .s3, .s4, .s5, .s6, .s8, .beltwrap'), { autoAlpha: 0 });
      gsap.set(actor, { xPercent: -50, yPercent: -50 });
      gsap.set(q('.belt-head'), { yPercent: -50 });

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
      const count = (sel: string, at: number) =>
        q(sel).forEach((node) => {
          const counter = { v: 0 };
          const to = Number(node.getAttribute('data-to'));
          tl.fromTo(counter, { v: 0 }, { v: to, duration: 0.8, ease: 'power1.out', onUpdate: () => (node.textContent = String(Math.round(counter.v))) }, at);
        });

      /* ---- fabric: the dress drops in, then a spec-sheet grid shows its real close-ups ---- */
      tl.set(q('.s2'), { autoAlpha: 1 }, 0)
        .fromTo(
          actor,
          { x: () => slotWeave().x, y: () => -window.innerHeight, rotate: -10, scale: () => slotWeave().s * 0.9, autoAlpha: 1 },
          { x: () => slotWeave().x, y: () => slotWeave().y, rotate: 0, scale: () => slotWeave().s, autoAlpha: 1, duration: 0.9, ease: 'power3.out' },
          0.1,
        )
        .from(q('.s2 .copy > *'), { x: -80, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.35)
        // the detail grid appears where the dress stands (only opacity here: its position comes from CSS);
        // the tiles pop in and take turns in the spotlight after the timeline is extended (below)
        .fromTo(q('.dgrid'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 1.05)
        .to(actor, { autoAlpha: 0, duration: 0.15 }, 1.1)
        .from(q('.s2 .gsm > div'), { y: 60, rotate: -6, autoAlpha: 0, duration: 0.5, stagger: 0.12 }, 1.4);
      count('.s2 .cnt', 1.5);
      tl.to(q('.dgrid'), { autoAlpha: 0, duration: 0.3, ease: 'power3.in' }, 2.9)
        .to(actor, { autoAlpha: 1, duration: 0.15 }, 3.1)
        .to(q('.s2 .copy'), { x: -120, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 3.05)
        .set(q('.s2'), { autoAlpha: 0 }, 3.5)

        /* ---- uniforms: the dress walks into the discipline line-up and becomes the centre (BJJ) card ---- */
        .to(actor, { x: () => slotUni().x, y: () => slotUni().y, scale: () => slotUni().s, duration: 0.8 }, 3.05)
        .set(q('.gi-m'), { autoAlpha: 0 }, 3.55)
        .set(q('.s3'), { autoAlpha: 1 }, 3.6)
        .to(q('.gi-m'), { autoAlpha: 1, duration: 0.12 }, 3.86)
        .to(actor, { autoAlpha: 0, duration: 0.12 }, 3.9)
        // the other disciplines rise into place on both sides
        .from(q('.uni-side'), { y: () => window.innerHeight * 0.5, rotate: (i) => (i < 2 ? -10 : 10), autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, 3.8)
        .from(q('.s3 .head > *'), { y: 60, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 3.7)
        .from(q('.s3 .u-foot'), { y: 30, autoAlpha: 0, duration: 0.5 }, 4.3)

        /* ---- your brand: the other disciplines drop away, the camera pushes in on the gi; logo spots follow (below) ---- */
        .to(q('.uni-side'), { y: () => window.innerHeight * 0.45, autoAlpha: 0, duration: 0.7, stagger: 0.05, ease: 'power3.in' }, 5.2)
        .to(q('.gi-m .lab'), { autoAlpha: 0, duration: 0.3 }, 5.2)
        .to(q('.s3 .head'), { y: -80, autoAlpha: 0, duration: 0.6 }, 5.2)
        .to(q('.s3 .u-foot'), { y: 40, autoAlpha: 0, duration: 0.4 }, 5.2)
        .to(q('.gi-m'), { x: camX, y: camShift, scale: camScale, transformOrigin: `50% ${LINEUP_PHOTO * 100}%`, duration: 1 }, 5.4)
        // the grey card behind the gi dissolves, so the uniform stands on the clean white page
        .to(q('.gi-m .ph'), { backgroundColor: 'rgba(243, 243, 243, 0)', boxShadow: 'rgba(11, 11, 11, 0) 0px 0px 0px 0px inset', duration: 0.6 }, 5.5)
        // from here the gi is a showpiece, not a link: no card behind it, no click (both undo when scrolling back)
        .set(q('.gi-m'), { pointerEvents: 'none' }, 5.4)
        .set(q('.gi-m .ph'), { backgroundColor: 'transparent', boxShadow: 'none' }, 6.1)
        .set(q('.s4'), { autoAlpha: 1 }, 5.8)
        .from(q('.s4 .copy > *'), { x: () => (isNarrow() ? 0 : -80), y: () => (isNarrow() ? 16 : 0), autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 5.9)

        /* ---- collection: the gi shrinks away, the product ring spins up ---- */
        .to(q('.s4 .copy'), { x: -120, autoAlpha: 0, duration: 0.5 }, 7.4)
        .to(q('.gi-m'), { scale: 0.2, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, 7.4)
        .set(q('.s3, .s4'), { autoAlpha: 0 }, 7.95)
        .set(q('.s5'), { autoAlpha: 1 }, 7.95)
        .from(q('.ringwrap'), { scale: 0.4, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 7.95)
        .from(q('.s5 .head > *'), { y: -40, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 8.0)
        .from(q('.s5 .also'), { y: 30, autoAlpha: 0, duration: 0.5 }, 8.4);

      tl.to(q('.s5'), { y: () => -window.innerHeight * 0.2, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, 11.1)

        /* ---- belts: rank bands sweep in, the black belt fills the screen ---- */
        .set(q('.s6'), { autoAlpha: 1 }, 11.3)
        .from(q('.stripe'), { scaleX: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }, 11.3)
        .from(q('.stripe span'), { x: -60, autoAlpha: 0, duration: 0.4, stagger: 0.06 }, 11.6)
        .from(q('.belt-head'), { scale: 0.6, autoAlpha: 0, duration: 0.6 }, 11.8)
        .to(q('.belt-head'), { autoAlpha: 0, scale: 0.9, duration: 0.35 }, 12.8)
        .to(q('.stripe:not(.k)'), { flex: 0.0001, padding: 0, duration: 0.8, ease: 'power3.inOut' }, 12.9)
        .to(q('.stripe span'), { autoAlpha: 0, duration: 0.3 }, 12.9)
        .set(q('.beltwrap'), { autoAlpha: 1 }, 13.0)
        .from(q('.beltwrap .bhead'), { y: -30, autoAlpha: 0, duration: 0.45 }, 13.0)
        .from(q('.beltrow > a'), { y: () => window.innerHeight * 0.6, rotate: (i) => (i - 1.5) * 8, duration: 0.8, stagger: 0.08, ease: 'expo.out' }, 13.05)
        .to(q('.beltwrap'), { y: () => -window.innerHeight * 0.5, autoAlpha: 0, duration: 0.6, ease: 'power3.in' }, 14.3)

        /* ---- factory (black): departments rush past, numbers count up ---- */
        .to(q('.s7'), { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: 'none' }, 14.6)
        .set(q('.s6'), { autoAlpha: 0 }, 15.1)
        .from(q('.s7 .head > *'), { y: 60, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 14.9)
        .fromTo(q('.r1'), { x: '5%' }, { x: '-55%', duration: 2.4, ease: 'none' }, 14.9)
        .fromTo(q('.r2'), { x: '-55%' }, { x: '5%', duration: 2.4, ease: 'none' }, 14.9)
        .from(q('.s7 .stats > div'), { y: 80, autoAlpha: 0, duration: 0.5, stagger: 0.1 }, 15.4);
      count('.s7 .cnt', 15.5);

      /* ---- export: the black lifts away, routes draw out to each market ---- */
      // data-live starts the map's moving dots (film.css); scrubbing back above this point removes it again
      tl.set(q('.s8'), { autoAlpha: 1, attr: { 'data-live': '1' } }, 17.2)
        .to(q('.s7'), { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'power3.inOut' }, 17.3)
        .from(q('.s8 .head > *'), { y: 60, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 17.5)
        .from(q('.map'), { scale: 1.2, autoAlpha: 0, duration: 0.8 }, 17.5)
        .from(q('.city.origin'), { scale: 0, duration: 0.4, ease: 'back.out(3)' }, 18.0);
      if (isNarrow()) {
        // phones show the route board instead of the map (its cards come in by CSS), so the film ends
        // right after the heading instead of keeping the visitor scrolling while the hidden map draws
        tl.to({}, { duration: 0.3 }, 18.1);
      } else {
        const arcs = q('.arc');
        const arcGap = 1.8 / arcs.length;
        arcs.forEach((arc, i) => {
          tl.fromTo(arc, drawFrom, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' }, 18.2 + i * arcGap).from(
            q(`.city[data-i="${i}"]`),
            { scale: 0, autoAlpha: 0, duration: 0.3, ease: 'back.out(3)' },
            18.5 + i * arcGap,
          );
          // the market's country fills in as its route lands
          tl.from(q(`.mk[data-i="${i}"]`), { autoAlpha: 0, duration: 0.3 }, 18.5 + i * arcGap);
          tl.from(q(`.flow[data-i="${i}"]`), { autoAlpha: 0, duration: 0.3 }, 18.5 + i * arcGap);
        });
        tl.from(q('.markets span'), { y: 30, autoAlpha: 0, duration: 0.4, stagger: 0.1 }, 19.6).to({}, { duration: 0.6 }, 20.4);
      }

      /* ---- fabric close-ups: make room after the fabric scene, then a spec-sheet grid of real details ---- */
      tl.shiftChildren(DETAILS_EXTRA, true, 2.85);
      // the inspector pops in, then steps through the close-ups at an even pace while the visitor scrolls
      tl.fromTo(q('.fi'), { y: 40, scale: 0.94, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.6)' }, 1.05);
      const step = { i: 0 };
      let shown = 0;
      tl.fromTo(
        step,
        { i: 0 },
        {
          i: detailCount - 1,
          duration: (detailCount - 1) * DETAILS_SLOT,
          ease: 'none',
          onUpdate: () => {
            const next = Math.round(step.i);
            if (next !== shown) onDetail((shown = next));
          },
        },
        DETAILS_START + DETAILS_SLOT / 2,
      );

      /* ---- discipline line-up: make room, then light up each discipline from left to right ---- */
      tl.shiftChildren(LINEUP_EXTRA, true, 8.3);
      const cards = q('.lineup .uni-in');
      cards.forEach((_, k) => {
        tl.to(cards, {
          opacity: (i) => (i === k ? 1 : 0.38),
          scale: (i) => (i === k ? 1.05 : 0.95),
          duration: 0.2,
          ease: 'power2.out',
        }, LINEUP_START + k * LINEUP_SLOT);
      });
      const spotStep = { i: 0 };
      let spotShown = -1;
      tl.fromTo(
        spotStep,
        { i: 0 },
        {
          i: cards.length,
          duration: cards.length * LINEUP_SLOT,
          ease: 'none',
          onUpdate: () => {
            const next = spotStep.i > 0 && spotStep.i < cards.length ? Math.floor(spotStep.i) : -1;
            if (next !== spotShown) onSpot((spotShown = next));
          },
        },
        LINEUP_START,
      );
      // all back to normal before the centre card moves on to the custom scene
      tl.to(cards, { opacity: 1, scale: 1, duration: 0.2 }, LINEUP_START + cards.length * LINEUP_SLOT);

      /* ---- your brand: make room, then show where a logo can go, one spot at a time ---- */
      // phones: all six spots at once and no extra hold, so one swipe moves on (desktop: two steps of three)
      const narrow = isNarrow();
      const brandExtra = narrow ? 0 : BRAND_EXTRA;
      // everything after the brand scene comes this much earlier on phones
      const brandSaved = BRAND_EXTRA - brandExtra;
      if (brandExtra) tl.shiftChildren(brandExtra, true, BRAND_SHIFT_AT);
      q('.place').forEach((place, k) => {
        const group = narrow || k < 3 ? 0 : 1;
        tl.fromTo(
          place,
          { autoAlpha: 0, scale: 0.4 },
          { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2.2)' },
          BRAND_START + group * BRAND_SLOT * 1.4 + (k % 3) * 0.05,
        );
      });

      /* ---- collection: make room, then the ring turns smoothly through every product ---- */
      tl.shiftChildren(RING_EXTRA, true, RING_SHIFT_AT - brandSaved);
      const ringStart = RING_START - brandSaved;
      const seg = 360 / ringCount;
      const slot = (RING_END - RING_START) / ringCount;
      gsap.set(q('.ring'), { rotateX: -2 });
      tl.to(q('.ring'), { rotateY: -(ringCount - 1) * seg, duration: (ringCount - 1) * slot, ease: 'none' }, ringStart + slot * 0.5);
      // chapter start times (for the scene counter) after the brand scene move with it
      const chapterAt = (at: number) => (at > BRAND_SHIFT_AT ? at - brandSaved : at);

      ScrollTrigger.create({
        trigger: el,
        // start while the film is still scrolling in, so there is never a blank white screen after the hero
        start: 'top 75%',
        end: 'bottom bottom',
        // phones: Lenis already smooths the finger scroll, so a short catch-up avoids a floaty double lag
        scrub: narrow ? 0.4 : 1,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const t = self.progress * tl.duration();
          let chapter: ChapterKey = 'fabric';
          for (const [key, at] of CHAPTERS) if (t >= chapterAt(at) - 0.3) chapter = key;
          onProgress(self.progress, chapter);
        },
      });

      // re-measure before every refresh; afterwards sweep end → start → current so
      // every "from" state is re-applied and nothing shows up before its scene
      const onRefreshInit = () => {
        cache.clear();
        sizeRing();
      };
      const onRefresh = () => {
        const p = tl.progress();
        tl.progress(1, true).progress(0, true).progress(p, true);
      };
      ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.addEventListener('refresh', onRefresh);
      onRefresh();

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
        ScrollTrigger.removeEventListener('refresh', onRefresh);
      };
    },
    { scope: root, dependencies: [near, ringCount, detailCount, onDetail, onSpot] },
  );
}
