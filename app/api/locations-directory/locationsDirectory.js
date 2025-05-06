import { createClient } from "../../utils/supabase/server";

export async function getLocationsDirectory() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations_directory")
    .select("*");

  if (error) throw error;
  return data;
}

export async function createLocation(location) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations_directory")
    .insert(location)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLocation(id, location) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations_directory")
    .update(location)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLocation(id) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("locations_directory")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { message: "Location deleted successfully" };
}

export async function getLocationById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations_directory")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
