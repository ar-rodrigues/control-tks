"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { createClient } from "../utils/supabase/server";

export async function login(formData) {
  const supabase = createClient();
  const { email, password } = formData;

  try {
    // Sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    //console.log('Sign in data:', data, 'Error:', error)

    if (error) {
      // Handle errors gracefully without throwing
      console.error("Login failed:", error.message);
      return { success: false, message: "Invalid login credentials" };
    }

    return { success: true, message: "Login successful" };
  } catch (err) {
    // Handle unexpected errors
    console.error("Unexpected error during login:", err);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function signup(formData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function custom_access_token_hook() {
  const supabase = createClient();

  // Get user session and role from custom hook or session management
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error("Failed to fetch user: " + error.message);
  }

  if (!data || !data.user) {
    throw new Error("User not found");
  }

  return { user: data.user.id, email: data.user.email };
}

export async function checkUserRole() {
  const supabase = createClient();
  const { user, email } = await custom_access_token_hook();

  //console.log('User ID:', user);
  //console.log('User Email:', email);

  // Fetch the user's role from the profile_roles view
  const { data, error } = await supabase
    .from("profile_roles")
    .select("role_name")
    .eq("id", user)
    .single();

  if (error || !data) {
    console.error("Error fetching user role:", error || "No data returned");
    return { hasAccess: false, role: null, email };
  }

  //console.log('User Role:', data.roles);

  return { hasAccess: true, role: data.role_name, email };
}
