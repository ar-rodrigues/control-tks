import { createClient } from "../../utils/supabase/server";

// DELETE: Delete a dealer
export async function DELETE({ params, request }) {
  const supabase = createClient();
  if (!params.id) {
    return new Response(JSON.stringify({ error: "Missing dealer ID" }), {
      status: 400,
    });
  }

  const { error: deleteError } = await supabase
    .from("dealers")
    .delete()
    .match({ id: params.id });

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({ success: true, message: "Dealer deleted successfully" }),
    { status: 200 }
  );
}

import { createClient } from "../../utils/supabase/server";

// PATCH: Update a dealer
export async function PATCH({ params, request }) {
  const supabase = createClient();
  if (!params.id) {
    return new Response(JSON.stringify({ error: "Missing dealer ID" }), {
      status: 400,
    });
  }

  const data = await request.json();
  if (typeof data !== "object") {
    return new Response(
      JSON.stringify({ error: "Invalid request data. Expected an object" }),
      { status: 400 }
    );
  }

  const dealerToUpdate = {
    id: params.id,
    convenio: data.convenio,
    remotas: data.remotas,
    zona: data.zona,
    agencia: data.agencia,
    grupo: data.grupo,
    marca: data.marca,
    direccion: data.direccion,
    ciudad: data.ciudad,
    estado: data.estado,
    telefono: parseInt(data.telefono), // convert to number
    cliente: data.cliente,
    matriz: data.matriz,
    latitud: parseFloat(data.latitud), // convert to float
    longitud: parseFloat(data.longitud),
  };

  const { error: updateError } = await supabase
    .from("dealers")
    .update(dealerToUpdate);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({ success: true, message: "Dealer updated successfully" }),
    { status: 200 }
  );
}
