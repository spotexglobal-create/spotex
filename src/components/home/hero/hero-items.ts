/**
 * Products shown in the Spotlight hero, in order.
 * Each callout points at a real spot on the photo: x, y are fractions of the square product
 * photo (0,0 = top-left), measured on the 1500×1500 originals. `side` is where the label sits.
 * Callout texts live in messages → Hero.callouts.<slug>.<key>.
 */
export type CalloutSide = 'L' | 'R';

export interface HeroItem {
  slug: 'si-jju-1001' | 'si-ju-1005' | 'si-jju-1002' | 'si-ms-1001' | 'si-gbp-1001';
  callouts: { key: string; side: CalloutSide; x: number; y: number }[];
  /** Gap between the photo edge and the product, as a share of the photo width (default 0.24). Wide products need less. */
  inner?: number;
}

export const HERO_ITEMS: HeroItem[] = [
  {
    slug: 'si-jju-1001',
    callouts: [
      { key: 'label', side: 'R', x: 0.51, y: 0.05 }, // woven label at the back of the collar
      { key: 'weave', side: 'L', x: 0.31, y: 0.34 }, // sleeve fabric
      { key: 'logo', side: 'R', x: 0.58, y: 0.47 }, // SPOTEX chest embroidery
      { key: 'pants', side: 'R', x: 0.54, y: 0.66 }, // ripstop pants
      { key: 'belt', side: 'L', x: 0.41, y: 0.41 }, // belt (left side of the knot)
    ],
  },
  {
    slug: 'si-ju-1005',
    callouts: [
      { key: 'dye', side: 'R', x: 0.55, y: 0.2 }, // lapel / jacket colour
      { key: 'weight', side: 'L', x: 0.3, y: 0.31 }, // wide judo sleeve
      { key: 'belt', side: 'R', x: 0.6, y: 0.34 }, // white belt
      { key: 'range', side: 'L', x: 0.38, y: 0.45 }, // jacket skirt
      { key: 'pants', side: 'R', x: 0.53, y: 0.7 }, // drill pants
    ],
  },
  {
    slug: 'si-jju-1002',
    callouts: [
      { key: 'stitch', side: 'R', x: 0.53, y: 0.12 }, // contrast stitching on the lapel
      { key: 'patch', side: 'L', x: 0.32, y: 0.14 }, // shoulder patch
      { key: 'logo', side: 'R', x: 0.6, y: 0.45 }, // chest embroidery
      { key: 'made', side: 'R', x: 0.56, y: 0.7 }, // pants
      { key: 'belt', side: 'L', x: 0.44, y: 0.37 }, // belt (left side of the knot)
    ],
  },
  {
    slug: 'si-ms-1001',
    inner: 0.06, // the shorts fill almost the whole photo width
    callouts: [
      { key: 'waist', side: 'R', x: 0.49, y: 0.15 }, // logo on the waistband
      { key: 'print', side: 'L', x: 0.22, y: 0.58 }, // big side print
      { key: 'fabric', side: 'R', x: 0.66, y: 0.7 }, // stripes / fabric
      { key: 'team', side: 'R', x: 0.74, y: 0.8 }, // red leg panel
    ],
  },
  {
    slug: 'si-gbp-1001',
    callouts: [
      { key: 'handle', side: 'R', x: 0.5, y: 0.04 }, // top grab handle
      { key: 'kit', side: 'R', x: 0.64, y: 0.3 }, // main compartment
      { key: 'pocket', side: 'L', x: 0.27, y: 0.45 }, // side pocket
      { key: 'brand', side: 'R', x: 0.56, y: 0.5 }, // printed logo on the front
    ],
  },
];
