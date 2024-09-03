// app/api/logout/route.js
import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function POST(request) {
  const supabase = createClient();

  try {
    await supabase.auth.signOut();
    
    return NextResponse.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ success: false, message: 'An error occurred during logout' }, { status: 500 });
  }
}
