'use client';

import { useActionState, useState } from 'react';
import { login, type LoginState } from '../actions';

const FIELD =
  'mt-1.5 w-full rounded-xl border-[1.5px] border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-ink';

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-8 space-y-4" noValidate>
      {state.error && (
        <p role="alert" className="rounded-xl border-[1.5px] border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="text-xs font-bold tracking-[0.12em] text-ink/70 uppercase">E-mail</span>
        <input name="email" type="email" autoComplete="username" required defaultValue={state.email} className={FIELD} placeholder="you@company.com" />
      </label>
      <label className="block">
        <span className="text-xs font-bold tracking-[0.12em] text-ink/70 uppercase">Password</span>
        <span className="relative block">
          <input name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required className={`${FIELD} pr-16`} />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute top-1/2 right-3 mt-[3px] -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-bold tracking-[0.1em] text-ink/50 uppercase hover:text-ink"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </span>
      </label>
      <button type="submit" disabled={pending} className="btn w-full disabled:opacity-60">
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
