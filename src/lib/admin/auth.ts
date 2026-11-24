import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Admin sign-in. One admin account, configured with environment variables:
 *   ADMIN_EMAIL          the login e-mail
 *   ADMIN_PASSWORD_HASH  "scrypt:<salt>:<hash>" (make one with `node scripts/hash-password.mjs <password>`;
 *                        no "$" in it, because Next.js expands "$name" inside .env files)
 *   AUTH_SECRET          long random string that signs the session cookie
 * The session is a signed, http-only cookie; nothing is stored server side.
 */

const COOKIE = 'spx_admin';
const MAX_AGE = 60 * 60 * 8; // 8 hours

export interface AdminSession {
  email: string;
  exp: number;
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('AUTH_SECRET must be set (32+ characters)');
  return s;
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

/** True when the admin login has been configured on this deployment. */
export const authConfigured = () =>
  Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && (process.env.AUTH_SECRET?.length ?? 0) >= 32);

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `scrypt:${b64(salt)}:${b64(scryptSync(password, salt, 64))}`;
}

function verifyPassword(password: string, stored: string) {
  const [kind, salt, hash] = stored.trim().split(/[:$]/);
  if (kind !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = scryptSync(password, Buffer.from(salt, 'base64url'), expected.length);
  return timingSafeEqual(actual, expected);
}

/** Checks the e-mail and password against the configured admin account (constant time for the password). */
export function checkCredentials(email: string, password: string) {
  if (!authConfigured()) return false;
  const emailOk = email.trim().toLowerCase() === process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const passwordOk = verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!);
  return emailOk && passwordOk;
}

export async function startSession(email: string) {
  const payload = b64(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + MAX_AGE } satisfies AdminSession));
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: '/admin' });
}

/** The signed-in admin, or null. */
export async function getSession(): Promise<AdminSession | null> {
  if (!authConfigured()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AdminSession;
    return session.exp > Date.now() / 1000 ? session : null;
  } catch {
    return null;
  }
}

/** For admin pages and actions: the session, or a redirect to the login page. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}
