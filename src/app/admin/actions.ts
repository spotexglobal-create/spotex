'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authConfigured, checkCredentials, endSession, startSession } from '@/lib/admin/auth';
import { connectDb, dbConfigured } from '@/lib/db/connect';
import { LoginFailModel } from '@/lib/db/models';

const PER_IP = 5;
const TOTAL = 20;

/** True while this network (or everyone, after many failures) is locked out. Without a database, never. */
async function locked(ip: string) {
  if (!dbConfigured()) return false;
  try {
    await connectDb();
    const [mine, all] = await Promise.all([LoginFailModel.countDocuments({ key: `ip:${ip}` }), LoginFailModel.countDocuments({ key: 'all' })]);
    return mine >= PER_IP || all >= TOTAL;
  } catch {
    return false; // a database hiccup must not lock the owner out
  }
}

async function recordFail(keys: string[]) {
  if (!dbConfigured()) return;
  try {
    await LoginFailModel.insertMany(keys.map((key) => ({ key })));
  } catch {
    /* best effort */
  }
}

export interface LoginState {
  error?: string;
  email?: string;
}

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? '').slice(0, 200);
  const password = String(form.get('password') ?? '').slice(0, 200);

  if (!authConfigured()) return { email, error: 'Admin login is not set up on this server yet (missing environment variables).' };
  if (!email || !password) return { email, error: 'Enter your e-mail and password.' };

  // lock: 5 wrong tries from one network, or 20 in total, close the login for 15 minutes
  const ip = ((await headers()).get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  const keys = [`ip:${ip}`, 'all'];
  if (await locked(ip)) return { email, error: 'Too many wrong attempts. The login is locked for 15 minutes.' };

  // a small fixed delay makes guessing passwords slow
  await new Promise((r) => setTimeout(r, 450));
  if (!checkCredentials(email, password)) {
    await recordFail(keys);
    return { email, error: 'Wrong e-mail or password.' };
  }

  await startSession(email.trim().toLowerCase());
  redirect('/admin');
}

export async function logout() {
  await endSession();
  redirect('/admin/login');
}
