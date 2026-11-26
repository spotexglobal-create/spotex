'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { ProductQuickView, type QuickViewProduct } from '@/components/catalog/ProductQuickView';
import { Link } from '@/i18n/navigation';
import type { CategorySlug } from '@/lib/catalog/types';
import { MAP_H, MAP_W, type ExportMapData } from './export-map';
import { FabricInspector } from './FabricInspector';
import { FABRIC_DETAILS } from './fabric-details';
import { CHAPTERS, useFilmTimeline, type ChapterKey } from './useFilmTimeline';
import './film.css';

export interface FilmProduct {
  slug: string;
  code: string;
  name: string;
  category: CategorySlug;
  image: string;
}

export interface FilmData {
  actorImage: string;
  /** Discipline line-up, left to right. `discipline` indexes messages Film.uniforms.disciplines / facts. */
  lineup: { discipline: number; category: CategorySlug; image: string; main?: boolean }[];
  ring: QuickViewProduct[];
  belts: FilmProduct[];
  map: ExportMapData;
  stats: { staff: number; clients: number; since: number };
}

const DEPARTMENTS_ROW_1 = ['design', 'pattern', 'fabric', 'knitting', 'dyeing'] as const;
const DEPARTMENTS_ROW_2 = ['printing', 'cutting', 'stitching', 'inspection', 'packing'] as const;
const STRIPES = ['w', 'b', 'p', 'br', 'k'] as const;

/** Logo spots on the centre gi (SI-JJU-1001), as fractions of its photo box; `side` = where the label sits, `lead` = line length (px). */
const LOGO_PLACES = [
  { key: 'collar', x: 0.51, y: 0.06, side: 'r', lead: 34 },
  { key: 'chest', x: 0.6, y: 0.23, side: 'r', lead: 28 },
  { key: 'belt', x: 0.52, y: 0.35, side: 'r', lead: 44 },
  { key: 'thigh', x: 0.55, y: 0.64, side: 'r', lead: 46 },
  { key: 'sleeve', x: 0.32, y: 0.34, side: 'l', lead: 30 },
  { key: 'pants', x: 0.37, y: 0.85, side: 'l', lead: 34 },
] as const;

const productHref = (p: Pick<FilmProduct, 'category' | 'slug'>) =>
  ({ pathname: '/products/[category]/[product]', params: { category: p.category, product: p.slug } }) as const;

export function FilmStage({ data }: { data: FilmData }) {
  const t = useTranslations('Film');
  const common = useTranslations('Common');
  const dept = useTranslations('Departments');
  const root = useRef<HTMLElement>(null);
  const hudBar = useRef<HTMLElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState<ChapterKey>('fabric');
  // which fabric close-up the inspector shows (moved by scrolling, or picked by the visitor)
  const [detail, setDetail] = useState(0);
  // which discipline card is in the spotlight in the uniforms scene (-1 = none)
  const [spot, setSpot] = useState(-1);
  // the ring card that is "picked up": hidden in the ring while its enlarged copy is shown
  const [quick, setQuick] = useState<{ product: QuickViewProduct; card: HTMLElement } | null>(null);
  const closeQuick = useCallback(() => {
    setQuick((q) => {
      if (q) q.card.style.visibility = '';
      return null;
    });
  }, []);

  const onProgress = useCallback((progress: number, current: ChapterKey) => {
    if (hudBar.current) hudBar.current.style.transform = `scaleX(${progress})`;
    hud.current?.classList.toggle('on', progress > 0 && progress < 1);
    setChapter(current);
  }, []);

  useFilmTimeline(root, { ringCount: data.ring.length, detailCount: FABRIC_DETAILS.length, onDetail: setDetail, onSpot: setSpot, onProgress });

  const disciplines = t.raw('uniforms.disciplines') as string[];
  const facts = t.raw('uniforms.facts') as string[];
  const steps = t.raw('custom.steps') as string[];
  const methods = t.raw('custom.methods') as string[];
  const ranks = t.raw('belts.ranks') as string[];
  const chapterIndex = CHAPTERS.findIndex(([key]) => key === chapter);
  const ringSeg = 360 / data.ring.length;
  // each row repeats its first two names so the band never runs out while it slides
  const rush = (keys: readonly (typeof DEPARTMENTS_ROW_1)[number][] | readonly (typeof DEPARTMENTS_ROW_2)[number][]) =>
    [...keys, keys[0], keys[1]].map((k, i) => (
      <span key={i}>
        {i > 0 && <i>/</i>}
        {dept(`${k}.name`)}
      </span>
    ));

  return (
    <section ref={root} className="film" aria-label={t('fabric.titleA')}>
      <div className="film-stage">
        {/* caption while the dress arrives */}
        {/* 01 fabric */}
        <div className="scene s2">
          <div className="in copy vmid">
            <p className="eyebrow">{t('fabric.eyebrow')}</p>
            <h2>
              {t('fabric.titleA')}
              <br />
              <em>{t('fabric.titleB')}</em>
            </h2>
            <p className="lead mt-3.5">{t('fabric.text')}</p>
            <div className="fi-note" aria-live="polite">
              <p>
                <b>{String(detail + 1).padStart(2, '0')}</b>
                {t(`fabric.details.${FABRIC_DETAILS[detail].key}`)}
              </p>
              <span key={detail}>{t(`fabric.notes.${FABRIC_DETAILS[detail].key}`)}</span>
            </div>
            <div className="gsm">
              {(
                [
                  [450, 'academy'],
                  [550, 'challenger'],
                  [750, 'winner'],
                ] as const
              ).map(([gsm, key]) => (
                <div key={key}>
                  <b>
                    <span className="cnt" data-to={gsm}>
                      0
                    </span>
                    <small>GSM</small>
                  </b>
                  <span>{t(`fabric.${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
          {/* fabric inspector: one big close-up with a magnifying lens, plus thumbnails */}
          <div className="in weave-pos vmid dgrid">
            <FabricInspector
              active={detail}
              onPick={setDetail}
              names={FABRIC_DETAILS.map((d) => t(`fabric.details.${d.key}`))}
              hint={t('fabric.zoomHint')}
            />
          </div>
          <div className="in weave-pos vmid weave-slot" style={{ visibility: 'hidden' }} />
        </div>

        {/* the travelling dress */}
        <div className="actor" aria-hidden>
          <Image src={data.actorImage} alt="" fill loading="eager" sizes="50vh" />
        </div>

        {/* 02 uniforms + 03 custom share the centre gi */}
        <div className="scene flow s3">
          <div className="in head">
            <p className="eyebrow">{t('uniforms.eyebrow')}</p>
            <h2>
              {t('uniforms.titleA')} <em>{t('uniforms.titleB')}</em>
            </h2>
          </div>
          {/* one card per discipline; the centre one (BJJ) is the dress that travels through the film */}
          <div className="lineup">
            {data.lineup.map((item) => (
              <Link
                key={item.category}
                href={{ pathname: '/products/[category]', params: { category: item.category } }}
                className={`item pick ${item.main ? 'main gi-m' : 'uni-side'}`}
              >
                <span className="uni-in">
                  <span className="ph">
                    <Image src={item.image} alt={disciplines[item.discipline]} fill loading="eager" quality={90} sizes="(max-width: 800px) 40vw, 480px" />
                  </span>
                  {item.main && (
                    // where a customer's logo can go; shown one by one in the "your brand" scene
                    <span className="places" aria-hidden>
                      {LOGO_PLACES.map((p, n) => (
                        <span
                          key={p.key}
                          className={`place ${p.side}`}
                          style={{ left: `${p.x * 100}%`, top: `${p.y * 72}%`, ['--lead' as string]: `${p.lead}px` }}
                        >
                          <i />
                          <b />
                          <em>
                            <small>{String(n + 1).padStart(2, '0')}</small>
                            {t(`custom.places.${p.key}`)}
                          </em>
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="lab">
                    <b>{disciplines[item.discipline]}</b>
                    <small>{facts[item.discipline]}</small>
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <div className="u-foot">
            {/* note for the discipline that is in the spotlight while scrolling */}
            <p className="u-note" aria-live="polite">
              {spot >= 0 && (
                <span key={spot}>
                  <b>{disciplines[data.lineup[spot].discipline]}</b>
                  {t.raw('uniforms.notes')[data.lineup[spot].discipline]}
                </span>
              )}
            </p>
            <Link href="/products" className="btn pick">
              {t('uniforms.allCategories')} →
            </Link>
          </div>
        </div>
        <div className="scene s4">
          <div className="in copy vmid">
            <p className="eyebrow">{t('custom.eyebrow')}</p>
            <h2>
              {t('custom.titleA')}
              <br />
              <em>{t('custom.titleB')}</em>
            </h2>
            <p className="lead mt-3.5">{t('custom.text')}</p>
            {/* phones only: the logo spots' names; the gi itself shows just their numbers */}
            <ol className="c-places" aria-hidden>
              {LOGO_PLACES.map((p, n) => (
                <li key={p.key}>
                  <b>{String(n + 1).padStart(2, '0')}</b>
                  {t(`custom.places.${p.key}`)}
                </li>
              ))}
            </ol>
            <div className="c-block">
              <p className="c-title">{t('custom.methodsTitle')}</p>
              <ul className="c-methods">
                {methods.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
            <div className="c-block">
              <p className="c-title">{t('custom.stepsTitle')}</p>
              <ol className="c-steps">
                {steps.map((s, i) => (
                  <li key={s}>
                    <b>{String(i + 1).padStart(2, '0')}</b>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <Link href="/contact" className="btn pick c-cta">
              {common('requestSample')}
            </Link>
          </div>
        </div>

        {/* 04 collection */}
        <div className="scene flow s5">
          <div className="in head">
            <p className="eyebrow">{t('collection.eyebrow')}</p>
            <h2>
              {t('collection.titleA')} <em>{t('collection.titleB')}</em>
            </h2>
          </div>
          <div className="ringwrap">
            <div className="ringpos">
              <div className="ring">
                {data.ring.map((p, i) => (
                  <Link
                    key={p.slug}
                    href={productHref(p)}
                    className="card pick"
                    style={{ transform: `rotateY(${i * ringSeg}deg) translateZ(var(--r))` }}
                    onClick={(e) => {
                      // plain click opens the pop-up; ctrl/cmd-click still opens the product page
                      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                      e.preventDefault();
                      const card = e.currentTarget;
                      card.style.visibility = 'hidden';
                      setQuick({ product: p, card });
                    }}
                  >
                    <span className="im block">
                      <Image src={p.images[0]} alt={`${p.name} ${p.code}`} fill loading="eager" sizes="240px" />
                    </span>
                    <span className="m block">
                      <span className="code block">{p.code}</span>
                      <h3>{p.name}</h3>
                    </span>
                    <span className="tap" aria-hidden>
                      +
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="also">
            <p>
              {t('collection.also')} <b>{t('collection.alsoList')}</b>
            </p>
            <Link href="/products" className="btn pick">
              {common('viewAllProducts')} →
            </Link>
          </div>
        </div>

        {/* 05 belts */}
        <div className="scene s6">
          <div className="stripes" aria-hidden>
            {STRIPES.map((c, i) => (
              <div key={c} className={`stripe ${c}`}>
                <span>{ranks[i]}</span>
                <span className="rk">{t('belts.rank', { n: String(i + 1).padStart(2, '0') })}</span>
              </div>
            ))}
          </div>
          <div className="in belt-head">
            <p className="eyebrow">{t('belts.eyebrow')}</p>
            <h2>{t('belts.title')}</h2>
          </div>
          <div className="beltwrap">
            <div className="bhead">
              <p className="eyebrow">{t('belts.eyebrow')}</p>
              <h3>
                {t('belts.titleA')} <em>{t('belts.titleB')}</em>
              </h3>
            </div>
            <div className="beltrow">
              {data.belts.map((p) => (
                <Link key={p.slug} href={productHref(p)} className="pick">
                  <span className="ph">
                    <Image src={p.image} alt={`${p.name} ${p.code}`} fill loading="eager" sizes="25vw" />
                  </span>
                  <span className="cap">
                    <span>{p.code}</span>
                    {p.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 06 factory */}
        <div className="scene flow s7">
          <div className="in head">
            <p className="eyebrow">{t('factory.eyebrow')}</p>
            <h2>
              {t('factory.titleA')} <br />
              <em>{t('factory.titleB')}</em>
            </h2>
            <p className="lead">{t('factory.text')}</p>
          </div>
          <div className="rushband" aria-hidden>
            <div className="rush r1">{rush(DEPARTMENTS_ROW_1)}</div>
            <div className="rush r2">{rush(DEPARTMENTS_ROW_2)}</div>
          </div>
          <div className="stats">
            <div>
              <b>
                <span className="cnt" data-to={data.stats.staff}>
                  0
                </span>
                <sup>+</sup>
              </b>
              <span>{t('factory.staff')}</span>
            </div>
            <div>
              <b>
                <span className="cnt" data-to={data.stats.clients}>
                  0
                </span>
                <sup>+</sup>
              </b>
              <span>{t('factory.clients')}</span>
            </div>
            <div>
              <b>ISO</b>
              <span>{t('factory.iso')}</span>
            </div>
            <div>
              <b>{data.stats.since}</b>
              <span>{t('factory.since')}</span>
            </div>
          </div>
        </div>

        {/* 07 export */}
        <div className="scene flow s8">
          <div className="in head">
            <p className="eyebrow">{t('export.eyebrow')}</p>
            <h2>
              {t('export.titleA')} <em>{t('export.titleB')}</em>
            </h2>
          </div>
          <div className="exp">
            <div className="mapbox">
              <div className="map" style={{ aspectRatio: `${MAP_W} / ${MAP_H}`, maxWidth: `calc((100vh - var(--top) - var(--bot) - 190px) * ${MAP_W / MAP_H})` }}>
                <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden>
                  {/* real country shapes: land, the borders between countries, then home + markets on top */}
                  <defs>
                    {/* the land fades out towards the edges instead of ending in a hard rectangle */}
                    <radialGradient id="map-fade" cx="50%" cy="50%" r="62%">
                      <stop offset="70%" stopColor="#fff" />
                      <stop offset="100%" stopColor="#000" />
                    </radialGradient>
                    <mask id="map-mask">
                      <rect width={MAP_W} height={MAP_H} fill="url(#map-fade)" />
                    </mask>
                  </defs>
                  <g mask="url(#map-mask)">
                    <path className="land" d={data.map.land} />
                    <path className="borders" d={data.map.borders} />
                    <path className="home" d={data.map.home} />
                    {data.map.pins.map((p, i) => (
                      <path key={p.country} className="mk" data-i={i} d={p.shape} />
                    ))}
                  </g>
                  {data.map.pins.map((p) => (
                    <path key={p.country} className="arc" d={p.arc} />
                  ))}
                  {/* dots that keep travelling from Pakistan to each market once its route is drawn */}
                  {data.map.pins.map((p, i) => (
                    <path key={p.country} className="flow" data-i={i} d={p.arc} />
                  ))}
                </svg>
                {data.map.pins.map((p, i) => (
                  <div key={p.country} className={`city ${p.label}`} data-i={i} style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                    <i />
                    <span>
                      <span className="full">{t(`export.countries.${p.country}`)}</span>
                      <span className="short">{p.country}</span>
                    </span>
                  </div>
                ))}
                <div className="city origin right" style={{ left: `${data.map.origin.x}%`, top: `${data.map.origin.y}%` }}>
                  <i />
                  <span>
                    <span className="full">{t('export.origin')}</span>
                    <span className="short">pk</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="markets">
            {(['us', 'eu', 'kr'] as const).map((m) => (
              <span key={m}>
                <b>{m.toUpperCase()}</b>
                {t(`export.markets.${m}`)}
              </span>
            ))}
          </div>
          {/* phones: a wide world map is tiny on a tall screen, so the routes are shown as a board instead (film.css) */}
          <div className="routes">
            <p className="r-origin">
              <i aria-hidden />
              <b>PK</b>
              {t('export.origin')}
            </p>
            <ol>
              {data.map.pins.map((p, i) => (
                <li key={p.country} style={{ ['--i' as string]: i }}>
                  <b>{p.country.toUpperCase()}</b>
                  <span>{t(`export.countries.${p.country}`)}</span>
                  <small>{p.country === 'us' ? 'US' : p.country === 'kr' ? 'KR' : 'EU'}</small>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* scene counter */}
      <div ref={hud} className="film-hud" aria-hidden>
        <b>{String(chapterIndex + 1).padStart(2, '0')}</b>
        <span>/ {String(CHAPTERS.length).padStart(2, '0')}</span>
        <span className="track">
          <i ref={hudBar} />
        </span>
        <span>{t(`chapters.${chapter}`)}</span>
      </div>

      <ProductQuickView product={quick?.product ?? null} origin={quick?.card ?? null} onClose={closeQuick} />
    </section>
  );
}
