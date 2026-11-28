import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // lets a production build run next to `npm run dev` (NEXT_DIST_DIR=.next-build) without touching its .next folder
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    // Product photos live in public/products; admin uploads (day 2) go to Cloudinary.
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    // 90 is used where product photos are shown large (home line-up cards)
    qualities: [75, 90],
  },
  // browser safety rules for every page
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // no other website may show Spotex pages inside a frame (stops look-alike / click-trap pages)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          // browsers must not guess file types
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // other sites see only the domain a visitor came from, not the full page address
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HTTPS only, for two years
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          // the site never uses the camera, microphone or location
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
