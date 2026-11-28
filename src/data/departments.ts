/**
 * The ten factory departments in production order, grouped into the four phases shown on the
 * Factory page. Names and texts live in messages → Departments.<key>.
 */
export const DEPARTMENTS = [
  { key: 'design', phase: 0, image: '/products/jiu-jitsu-uniform-si-jju-1002-778279-1775542141.webp' },
  { key: 'pattern', phase: 0, image: '/products/judo-uniforms-si-ju-1003-153351-1775543799.webp' },
  { key: 'fabric', phase: 1, image: '/products/details/si-jju-1001-details.webp' },
  { key: 'knitting', phase: 1, image: '/products/mma-shorts-si-ms-1001-813389-1775545568.webp' },
  { key: 'dyeing', phase: 1, image: 'https://res.cloudinary.com/vmom2s9f/image/upload/v1795599015/spotex/products/bjj-belts-jjb-101-sti-01-273480-1731403590.webp' },
  { key: 'cutting', phase: 2, image: '/products/jiu-jitsu-uniforms-si-jju-1005-318594-1775542495.webp' },
  { key: 'printing', phase: 2, image: '/products/details/chest-embroidery.webp' },
  { key: 'stitching', phase: 2, image: '/products/jiu-jitsu-uniforms-si-jju-1001-631636-1775541913.webp' },
  { key: 'inspection', phase: 3, image: '/products/judo-uniforms-si-ju-1005-190467-1775543959.webp' },
  { key: 'packing', phase: 3, image: '/products/gi-bag-pack-si-gbp-1001-432446-1775544337.webp' },
] as const;

export type DepartmentKey = (typeof DEPARTMENTS)[number]['key'];

export const isDepartment = (v: string): v is DepartmentKey => DEPARTMENTS.some((d) => d.key === v);
