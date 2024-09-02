
import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''

// DELETE /api/users/:id
export async function DELETE(request, { params }) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY);
  
    //console.log('Deleting user with ID:', params.id)
    //console.log("request",request)
    const { data, error } = await supabase.auth.admin.deleteUser(params.id);
  
    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Log the data to inspect its contents
    console.log('Deletion successful, response data:', data);

    // Return a confirmation message instead of the raw data
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
}