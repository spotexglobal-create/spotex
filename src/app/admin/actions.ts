'use server';

import { redirect } from 'next/navigation';
import { authConfigured, checkCredentials, endSession, startSession } from '@/lib/admin/auth';

export interface LoginState {
  error?: string;
  email?: string;
}

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? '').slice(0, 200);
  const password = String(form.get('password') ?? '').slice(0, 200);

  if (!authConfigured()) return { email, error: 'Admin login is not set up on this server yet (missing environment variables).' };
  if (!email || !password) return { email, error: 'Enter your e-mail and password.' };

  // a small fixed delay makes guessing passwords slow
  await new Promise((r) => setTimeout(r, 450));
  if (!checkCredentials(email, password)) return { email, error: 'Wrong e-mail or password.' };

  await startSession(email.trim().toLowerCase());
  redirect('/admin');
}

export async function logout() {
  await endSession();
  redirect('/admin/login');
}
