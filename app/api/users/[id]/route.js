
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


/**
 * ///
 * /////// PUT /api/users/:id
 */

export async function PUT(request, { params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY
  );
  const updatedUser = await request.json();

  //console.log('Updated User Data:', updatedUser);
  
  // Prepare authUserData, including password if present
  const authUserData = {
    email: updatedUser.email,
    ...(updatedUser.password && { password: updatedUser.password }),
    // Include other fields as necessary
  };

  // Update the user's data in the auth.users table
  const { data: userData, error: userError } = await supabase.auth.admin.updateUserById(params.id, authUserData);

  if (userError) {
    console.error('Error updating user:', userError);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Convert role to integer if present
  let profileUpdateData = {};

  // Update the corresponding data in the public.profiles table
  if (updatedUser.name || updatedUser.email || updatedUser.role) {
    profileUpdateData.full_name = updatedUser.name || undefined;
    profileUpdateData.email = updatedUser.email || undefined;
    profileUpdateData.roles = parseInt(updatedUser.role, 10) || undefined
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdateData)
    .eq('id', params.id);

  if (profileError){  
    console.log('Error updating profile:', profileError);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ user: userData, profile: profileData });
}
