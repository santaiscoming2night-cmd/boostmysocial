import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  const email = String(form?.get('email') || '').trim();
  const origin = new URL(request.url).origin;

  if (email && createAdminClient()) {
    await createAdminClient().from('subscribers').insert({ email });
  }
  return NextResponse.redirect(`${origin}/?subscribed=1`, { status: 303 });
}
