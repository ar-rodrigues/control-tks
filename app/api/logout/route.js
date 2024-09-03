import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  return NextResponse.redirect(new URL('/login', baseUrl).toString());
}
