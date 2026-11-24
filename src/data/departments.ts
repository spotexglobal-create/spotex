/**
 * The ten factory departments in production order, grouped into the four phases shown on the
 * Factory page. Names and texts live in messages → Departments.<key>.
 */
export const DEPARTMENTS = [
  { key: 'design', phase: 0, image: '/products/jiu-jitsu-uniform-si-jju-1002-778279-1775542141.webp' },
  { key: 'pattern', phase: 0, image: '/products/judo-uniforms-si-ju-1003-153351-1775543799.webp' },
  { key: 'fabric', phase: 1, image: '/products/details/si-jju-1001-details.webp' },
  { key: 'knitting', phase: 1, image: '/products/hoodies-si-h-1001-278647-1775544768.webp' },
  { key: 'dyeing', phase: 1, image: '/products/karate-uniforms-k-104-sti-5-10-oz-644498-1731392893.webp' },
  { key: 'cutting', phase: 2, image: '/products/jiu-jitsu-uniforms-si-jju-1005-318594-1775542495.webp' },
  { key: 'printing', phase: 2, image: '/products/details/chest-embroidery.webp' },
  { key: 'stitching', phase: 2, image: '/products/jiu-jitsu-uniforms-si-jju-1001-631636-1775541913.webp' },
  { key: 'inspection', phase: 3, image: '/products/judo-uniforms-si-ju-1005-190467-1775543959.webp' },
  { key: 'packing', phase: 3, image: '/products/gi-bag-pack-si-gbp-1001-432446-1775544337.webp' },
] as const;

export type DepartmentKey = (typeof DEPARTMENTS)[number]['key'];

export const isDepartment = (v: string): v is DepartmentKey => DEPARTMENTS.some((d) => d.key === v);
