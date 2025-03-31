import { createClient } from '../../../utils/supabase/server';

// GET: Fetch unique clientes
export async function GET() {
  const supabase = createClient();
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*')

  if (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(clientes), { status: 200 });
}
