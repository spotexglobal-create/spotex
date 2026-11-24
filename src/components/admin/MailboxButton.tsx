'use client';

import { useState } from 'react';
import { Icon, btnDark } from './ui';

const MAILBOX = 'https://mail.hostinger.com';

/**
 * "Reply in mailbox": copies the customer's address and opens the company webmail in a new tab,
 * where pasting it into the search finds their e-mail (the webmail has no links to single e-mails).
 */
export function MailboxButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = () => {
    navigator.clipboard
      ?.writeText(email)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
      })
      .catch(() => {});
  };

  return (
    <a href={MAILBOX} target="_blank" rel="noopener noreferrer" onClick={onClick} title={`Copies ${email} and opens the mailbox`} className={btnDark}>
      <Icon name="mail" className="h-4 w-4" /> {copied ? 'E-mail copied ✓' : 'Reply in mailbox'}
    </a>
  );
}
