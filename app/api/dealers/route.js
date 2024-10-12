import { createClient } from '../../utils/supabase/server';

// GET: Fetch all dealers
export async function GET() {
  const supabase = createClient();
  const { data:dealers, error } = await supabase.from('dealers').select('*');
  //console.log("api dealers",dealers)
  if (error) {
    console.log(error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(dealers), { status: 200 });
}


// POST: Insert multiple dealers
export async function POST({ request }) {
  const supabase = createClient();
  const data = await request.json();
  if (!Array.isArray(data)) {
    return new Response(JSON.stringify({ error: 'Invalid request data. Expected an array of dealer objects.' }), { status: 400 });
  }

  const dealersToInsert = data.map((dealer) => ({
    convenio: dealer.convenio,
    remotas: dealer.remotas,
    zona: dealer.zona,
    agencia: dealer.agencia,
    grupo: dealer.grupo,
    marca: dealer.marca,
    direccion: dealer.direccion,
    ciudad: dealer.ciudad,
    estado: dealer.estado,
    telefono: Number(dealer.telefono),
    cliente: dealer.cliente,
    matriz: dealer.matriz,
    latitud: Number(dealer.latitud),
    longitud: Number(dealer.longitud),
  }));

  const { data: newDealers, error: insertError } = await supabase.from('dealers').insert(dealersToInsert);

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, message: 'Dealers inserted successfully' }), { status: 201 });
}
