import { createClient } from "../utils/supabase/server";

export const checkBackendPermission = async (user, requiredRoles) => {
  if (!user) return false;

  const supabase = createClient();

  const { data: userRole, error } = await supabase
    .from("profile_roles")
    .select("role_name")
    .eq("id", user.id)
    .single();

  if (error || !userRole) return false;

  return requiredRoles.includes(userRole.role_name);
};
