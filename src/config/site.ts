/**
 * Company defaults (confirmed by Spotex, 2026-11-25). Admin → Settings overrides them.
 */
export const SITE = {
  name: 'Spotex International',
  logo: '/brand/logo.webp',
  address: {
    street: 'Sialkot Road, Sialkot Bypass, Sardar Town',
    city: 'Gujranwala',
    postalCode: '52250',
    country: 'Pakistan',
  },
  phone: '+92 300 9648142',
  whatsapp: '923009648142',
  email: 'inquiry@spotexinternational.com',
  foundedYear: 1989,
  stats: { staff: 50, clients: 100, departments: 10 },
} as const;

/** WhatsApp chat link. Pass the number from getSite() so admin changes apply. */
export const whatsappLink = (text?: string, number: string = SITE.whatsapp) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
