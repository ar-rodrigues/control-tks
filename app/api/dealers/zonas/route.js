import { createClient } from '../../../utils/supabase/server';

// GET: Fetch unique zonas
export async function GET() {
  const supabase = createClient();
  const { data: zonas, error } = await supabase
    .from('zonas')
    .select('*');

  if (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(zonas), { status: 200 });
}