import { createClient } from '../../../utils/supabase/server';

// GET: Fetch unique estados
export async function GET() {
  const supabase = createClient();
  const { data: estados, error } = await supabase
    .from('estados')
    .select('*')

  if (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(estados), { status: 200 });
}
