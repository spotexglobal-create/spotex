import { getTranslations } from 'next-intl/server';
import { whatsappLink } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { getSite } from '@/lib/site';

/** Quote + WhatsApp buttons used at the end of most pages. */
export async function ContactActions({ whatsappText, className = '' }: { whatsappText?: string; className?: string }) {
  const t = await getTranslations('Common');
  const site = await getSite();
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Link href="/contact" className="btn">
        {t('requestQuote')}
      </Link>
      <a href={whatsappLink(whatsappText, site.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
        {t('whatsapp')}
      </a>
    </div>
  );
}
