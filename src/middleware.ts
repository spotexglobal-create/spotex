import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { localeForCountry } from './i18n/geo';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // the admin portal has no language prefix: /en/admin/... -> /admin/...
  const admin = request.nextUrl.pathname.match(/^\/(?:en|de|no|it|fr)(\/admin(?:\/.*)?)$/);
  if (admin) {
    const url = request.nextUrl.clone();
    url.pathname = admin[1];
    return NextResponse.redirect(url);
  }
  // Only the bare homepage is redirected by country, and only until the visitor picks a language.
  // Inner pages are never force-redirected, so search engines can crawl every language.
  if (request.nextUrl.pathname === '/' && !request.cookies.has('NEXT_LOCALE')) {
    const country = request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry');
    const locale = localeForCountry(country, request.headers.get('accept-language') ?? '');
    if (locale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }
  }
  return intlMiddleware(request);
}

export const config = {
  // Skip API routes, the admin portal, Next.js internals and files with an extension.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
