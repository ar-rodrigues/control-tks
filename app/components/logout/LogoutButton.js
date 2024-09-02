'use client';
import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
    });

    if (response.ok) {
      router.push('/login'); // Use Next.js router for redirection
    } else {
      console.error('Logout failed');
    }
  };

  return (
    <Button onClick={handleLogout} colorScheme='blue' size='lg' mt={4}>
      Sign out
    </Button>
  );
}
