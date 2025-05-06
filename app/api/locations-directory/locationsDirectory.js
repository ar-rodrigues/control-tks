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

export async function bulkInsertLocations(locations) {
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error("No se proporcionaron ubicaciones válidas");
  }

  const requiredFields = [
    "cliente",
    "convenio",
    "agencia",
    "direccion",
    "ciudad",
    "estado",
    "cp",
  ];
  const invalidLocations = locations.filter(
    (loc) => !requiredFields.every((field) => loc[field])
  );

  if (invalidLocations.length > 0) {
    throw new Error(
      "Algunas ubicaciones no tienen todos los campos requeridos"
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations_directory")
    .insert(locations)
    .select();

  if (error) throw new Error("Error al insertar las ubicaciones");
  return data;
}
