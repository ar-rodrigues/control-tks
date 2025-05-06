import { createClient } from "../../utils/supabase/server";

export async function getVinLists() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("vin_lists").select("*");

  if (error) throw error;
  return data;
}

export async function createVinList(vinList) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vin_lists")
    .insert(vinList)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVinList(id, vinList) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vin_lists")
    .update(vinList)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteVinList(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("vin_lists").delete().eq("id", id);

  if (error) throw error;
  return { message: "Vin list deleted successfully" };
}

export async function getVinListById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vin_lists")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
