import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function POST() {
  const supabase = createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/login', process.env.EMAIL_CONFIRM_URL).toString());
}
