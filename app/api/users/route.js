import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';
import { createUser, insertProfile, getProfiles, generateMagicLink } from '../../utils/users/usersOperations'
import { sendEmail } from '../../utils/mailer/mailer'


/**
 * ///
 * /////// GET /api/users
 */
export async function GET() {
  const { data: profiles, error } = await getProfiles()


  //console.log(profiles)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(profiles);
}



/**
 * ///
 * /////// POST /api/users
 */

export async function POST(request) {
  // Use the service role key to create the Supabase client
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY);

  const { email, password, name, role } = await request.json();

  // Create user
  const { data, error } = await createUser(email, password);
  if (error) {
    console.log('Failed to create user:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Insert profile
  const userId = data.user.id;
  const { data: profileData, error: profileError } = await insertProfile(userId, name, email, role);
  if (profileError) {
    console.error('Failed to insert profile:', profileError.message)
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }


  // Send email
  try {
    const emailSubject = 'Welcome to Our Service!'
    const emailBody = `Hello ${name},\n\nYour account has been created successfully.
                        \n\nYour login details are:
                        \nEmail: ${email}
                        \nPassword: ${password}
                        \n\nPlease confirm your email by clicking the following link:\n${process.env.EMAIL_CONFIRM_URL}
                        \n\nThank you!
                      `
    await sendEmail(email, name, password, emailSubject, emailBody);
  } catch (emailError) {
    console.log('Failed to send email:', emailError.message)
    return NextResponse.json({ error: 'User created, but failed to send email.' }, { status: 502 });
  }

  return NextResponse.json(profileData, { status: 200 });
}


