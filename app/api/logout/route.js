import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function POST(request) {
  const supabase = createClient();

  try {
    await supabase.auth.signOut();

    const url = new URL(request.url);
    const baseUrl = `${url.protocol}/${url.host}`;

    return NextResponse.redirect(new URL('/login', baseUrl).toString());
  } catch (error) {
    console.error('Error during logout:', error);
    // You can return an error response here if needed
  }
}
