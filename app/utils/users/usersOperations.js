'use server'
import { createClient } from "../supabase/server";


export async function createUser(email, password) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY);
  return supabase.auth.admin.createUser({
     email, 
     password,
     email_confirm: true,
    });
}

export async function insertProfile(userId, name, email, role) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return supabase
    .from('profiles')
    .insert([{ id: userId, full_name: name, email, roles: role }])
    .select();
}

export async function getProfiles() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  return supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      profile_picture,
      roles!profiles_roles_fkey ( role_name )
    `);
}


export const generateMagicLink = async (email) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=`, {
    method: 'POST',
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // Use anon key for this request
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
    }),
  });

  console.log('Magic link generated:', response)

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error generating magic link:', errorData);
    throw new Error('Failed to generate magic link.');
  }

  const data = await response.json();
  return data;
};
