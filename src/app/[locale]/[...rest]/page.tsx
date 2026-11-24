import { notFound } from 'next/navigation';

/** Any unknown URL inside a language shows that language's 404 page (with the site header and footer). */
export default function CatchAll() {
  notFound();
}
