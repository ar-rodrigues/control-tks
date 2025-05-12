import { createClient } from "./supabase/server";

export async function validateApiKey(apiKey) {
  if (!apiKey) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY
  );

  // Check if the API key exists and is active
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key", apiKey)
    .eq("is_active", true)
    .single();

  if (error || !data) return false;

  // Update last_used_at timestamp
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return true;
}

export function getApiKeyFromRequest(request) {
  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}
