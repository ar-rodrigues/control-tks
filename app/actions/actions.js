'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { createClient } from '../utils/supabase/server';

export async function login(formData) {
  const supabase = createClient();
  const { email, password } = formData;

  // Sign in with email and password
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error('Login failed: ' + error.message); // Handle errors properly
  }

  // Optionally handle successful login, such as redirecting
  redirect('/');
}

export async function signup(formData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
      email: String(formData.get('email')),
      password: String(formData.get('password')),
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
      redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function custom_access_token_hook() {
  const supabase = createClient();
  
  // Get user session and role from custom hook or session management
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error('Failed to fetch user: ' + error.message);
  }
  
  if (!data || !data.user) {
    throw new Error('User not found');
  }
  
  return { "user": data.user.id, "email": data.user.email };
}

export async function checkUserRole() {
  const supabase = createClient();
  const { user, email } = await custom_access_token_hook();

  const { data, error } = await supabase
        .from('user_roles')
        .select(`
            roles:role_id(role_name)
        `)
        .eq('user_id', user)
        .single();

    if (error || !data) {
        return { hasAccess: false, role: null, email };
    }

    return { hasAccess: true, role: data.roles.role_name, email };
}


