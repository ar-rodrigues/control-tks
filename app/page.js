import { redirect } from 'next/navigation';
import { checkUserRole } from './actions/actions';
import LogoutButton from './components/logout/LogoutButton';
import { AdminPanel } from './components/admin/AdminPanel';
import { DecryptorDropzone } from './components/Decryptor/DecryptorDropzone'

export default async function Home() {
  const { role, email } = await checkUserRole();
  

  if (!role) {
    redirect('/login');
}


  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
      <h1 color='blue.400' _hover={{ color: 'blue.500' }}>
        Hello {email}! You have access to the {role} dashboard.
      </h1>
      {
        role === 'admin' && <AdminPanel />
      }

      {
        role === 'back-office' && <DecryptorDropzone />
      }      
      <LogoutButton /> {/* Client component for logout */}
    </main>
  );
}