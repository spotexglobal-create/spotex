/**
 * Company details used across the site. Values marked TODO still need confirming with Spotex
 * (see PROJECT-STATUS.md → "company se chahiye"). Day 2 moves these into admin settings.
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
  phone: '+92 55 320 33 33', // TODO: confirm (old site also lists …33 34)
  whatsapp: '923009648142',
  email: 'inquiry@spotexinternational.com',
  foundedYear: 1989, // TODO: confirm
  stats: { staff: 50, clients: 100, departments: 10 }, // TODO: confirm staff and clients
} as const;

/** WhatsApp chat link. Pass the number from getSite() so admin changes apply. */
export const whatsappLink = (text?: string, number: string = SITE.whatsapp) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
