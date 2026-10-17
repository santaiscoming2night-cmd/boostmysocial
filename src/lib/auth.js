import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export async function getSessionUser() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;
  return { ...profile, authEmail: user.email };
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.status !== 1) redirect('/login?blocked=1');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}

export function isAdmin(user) {
  return Boolean(user && user.role === 'admin');
}
