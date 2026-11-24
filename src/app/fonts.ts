import { Bebas_Neue, Montserrat } from 'next/font/google';

/** Site fonts, shared by the public site and the admin portal. */
export const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas', display: 'swap' });
export const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });
