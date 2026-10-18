'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSettings, settingOn } from '@/lib/settings';
import { hasSupabaseEnv } from '@/lib/supabase/env';

async function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  // Fall back to the request host so confirmation links also work when the
  // deployment URL was not configured explicitly.
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  if (!host) return '';
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function fail(path, message) {
  redirect(`${path}?err=${encodeURIComponent(message)}`);
}

export async function signIn(formData) {
  if (!hasSupabaseEnv()) fail('/login', 'Supabase is not configured yet.');

  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const next = String(formData.get('next') || '/dashboard');

  if (!email || !password) fail('/login', 'Email and password are required.');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) fail('/login', error.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single();
    if (profile && profile.status !== 1) {
      await supabase.auth.signOut();
      fail('/login', 'Your account has been blocked.');
    }
  }

  revalidatePath('/', 'layout');
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
}

export async function signUp(formData) {
  if (!hasSupabaseEnv()) fail('/signup', 'Supabase is not configured yet.');

  const settings = await getSettings();
  if (settingOn(settings, 'disable_signup_page')) fail('/signup', 'Sign up is currently disabled.');

  const first_name = String(formData.get('first_name') || '').trim();
  const last_name = String(formData.get('last_name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm_password') || '');
  const timezone = String(formData.get('timezone') || 'UTC');

  if (!first_name || !last_name) fail('/signup', 'First and last name are required.');
  if (!email) fail('/signup', 'Email is required.');
  if (password.length < 8) fail('/signup', 'Password must be at least 8 characters.');
  if (password !== confirm) fail('/signup', 'Passwords do not match.');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name, last_name, timezone },
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) fail('/signup', error.message);

  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  redirect('/login?ok=' + encodeURIComponent('Account created. Check your email to confirm it, then sign in.'));
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordReset(formData) {
  if (!hasSupabaseEnv()) fail('/forgot-password', 'Supabase is not configured yet.');
  const email = String(formData.get('email') || '').trim();
  if (!email) fail('/forgot-password', 'Email is required.');

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) fail('/forgot-password', error.message);

  redirect('/login?ok=' + encodeURIComponent('If that email exists, a reset link has been sent.'));
}

export async function updatePassword(formData) {
  if (!hasSupabaseEnv()) fail('/reset-password', 'Supabase is not configured yet.');
  const password = String(formData.get('password') || '');
  if (password.length < 8) fail('/reset-password', 'Password must be at least 8 characters.');

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) fail('/reset-password', error.message);

  redirect('/dashboard');
}
