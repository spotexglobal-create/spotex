import { geoArea, geoCentroid, geoDistance, geoMercator, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection } from 'geojson';
import { feature, mesh } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import countries110m from 'world-atlas/countries-110m.json';
import countries50m from 'world-atlas/countries-50m.json';

/** Map drawing units; the SVG scales to its box, so these never change at runtime. */
export const MAP_W = 1000;
export const MAP_H = 240;

/** Country keys; names live in messages Film.export.countries. */
export type CountryKey = 'kr' | 'it' | 'de' | 'fr' | 'no' | 'us';

/** Where a pin's label sits relative to its dot. */
type LabelSide = 'above' | 'below' | 'left' | 'right';

/** ISO 3166 numeric ids, as used by world-atlas. */
const PAKISTAN = '586';
const ORIGIN: [number, number] = [74.19, 32.16]; // Gujranwala
/**
 * Export markets, in the order their routes are drawn. Routes end in the middle of the country;
 * `centre` overrides that point where the geometric centre falls outside a long, thin country.
 */
const MARKETS: { country: CountryKey; iso: string; label: LabelSide; centre?: [number, number] }[] = [
  { country: 'it', iso: '380', label: 'left', centre: [12.6, 42.6] },
  { country: 'fr', iso: '250', label: 'left', centre: [2.4, 46.6] },
  { country: 'de', iso: '276', label: 'above' },
  { country: 'no', iso: '578', label: 'left', centre: [9.2, 61.6] },
  { country: 'us', iso: '840', label: 'above' },
  { country: 'kr', iso: '410', label: 'above' },
];

export interface ExportMapData {
  /** All land, and the borders between countries (SVG path data in map units). */
  land: string;
  borders: string;
  /** Pakistan's outline. */
  home: string;
  origin: { x: number; y: number };
  /** Each market: its outline, its pin (% of the box) and the flight arc from Gujranwala. */
  pins: { country: CountryKey; label: LabelSide; shape: string; x: number; y: number; arc: string }[];
}

let cache: ExportMapData | undefined;

/**
 * Builds the export map once on the server: real country shapes (Natural Earth 1:110m),
 * the markets' outlines, pins and arcs. The browser only receives plain SVG path data.
 */
export function buildExportMap(): ExportMapData {
  if (cache) return cache;
  const topo = countries110m as unknown as Topology<{ countries: GeometryCollection; land: GeometryCollection }>;
  // the grey background uses the light 1:110m shapes; the highlighted countries use the detailed 1:50m ones
  const detailed = countries50m as unknown as Topology<{ countries: GeometryCollection }>;
  const countries = (feature(detailed, detailed.objects.countries) as unknown as FeatureCollection).features;
  const byId = (id: string) => countries.find((c) => c.id === id) as Feature;
  /** Keeps a country's main landmass and what lies near it (drops Alaska, Hawaii, Svalbard …). */
  const mainland = (f: Feature): Feature => {
    if (f.geometry.type !== 'MultiPolygon') return f;
    const polys = f.geometry.coordinates.map((coordinates) => ({ coordinates, area: geoArea({ type: 'Polygon', coordinates }) }));
    const main = polys.reduce((a, b) => (b.area > a.area ? b : a));
    const mainCentre = geoCentroid({ type: 'Polygon', coordinates: main.coordinates });
    const near = (12 * Math.PI) / 180;
    const coordinates = polys
      .filter((poly) => geoDistance(geoCentroid({ type: 'Polygon', coordinates: poly.coordinates }), mainCentre) < near)
      .map((poly) => poly.coordinates);
    return { ...f, geometry: { type: 'MultiPolygon', coordinates } };
  };

  // frame USA → Europe → Korea, tight around the markets so the countries read clearly
  const projection = geoMercator().fitExtent(
    [
      [0, 0],
      [MAP_W, MAP_H],
    ],
    { type: 'MultiPoint', coordinates: [[-126, 20], [134, 68], [-126, 68], [134, 20]] },
  );
  // shapes are cut at the frame (plus a margin), so land outside the map (Africa, Australia …) is not sent to the browser;
  // clipExtent only trims geometry, points like pins and arcs are projected as before
  const clipped = geoMercator()
    .scale(projection.scale())
    .translate(projection.translate())
    .clipExtent([
      [-40, -40],
      [MAP_W + 40, MAP_H + 40],
    ]);
  const path = geoPath(clipped).digits(1);
  const [ox, oy] = projection(ORIGIN)!;
  const pct = (x: number, y: number) => ({ x: (x / MAP_W) * 100, y: (y / MAP_H) * 100 });

  cache = {
    land: path(feature(topo, topo.objects.land)) ?? '',
    borders: path(mesh(topo, topo.objects.countries, (a, b) => a !== b)) ?? '',
    home: path(mainland(byId(PAKISTAN))) ?? '',
    origin: pct(ox, oy),
    pins: MARKETS.map((m) => {
      const shape = mainland(byId(m.iso));
      const [x, y] = projection(m.centre ?? geoCentroid(shape))!;
      const dist = Math.hypot(x - ox, y - oy);
      const arc = `M${ox},${oy} Q${(ox + x) / 2},${(oy + y) / 2 - dist * 0.32} ${x},${y}`;
      return { country: m.country, label: m.label, shape: path(shape) ?? '', ...pct(x, y), arc };
    }),
  };
  return cache;
}
