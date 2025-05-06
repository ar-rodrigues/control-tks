import { createClient } from "../../utils/supabase/server";
import crypto from "crypto";

// Helper function to generate a secure API key
function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}

export async function getApiKeys() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createApiKey(name, userId) {
  const supabase = createClient();
  const key = generateApiKey();

  const { data, error } = await supabase
    .from("api_keys")
    .insert([
      {
        name,
        key,
        is_active: true,
        created_by: userId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateApiKey(id, updates) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("api_keys")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApiKey(id) {
  const supabase = createClient();
  const { error } = await supabase.from("api_keys").delete().eq("id", id);

  if (error) throw error;
  return { success: true };
}

export async function getApiKeyById(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
