// components/LogoutButton.js
'use client';
import { useState } from 'react';
import { Button, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/login'); // Redirect to login on success
      } else {
        setError(result.message); // Display error message
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleLogout} colorScheme='red' size='md' w={"100%"} fontSize={"93%"} mt={4} mb={4} isDisabled={loading} >
        {loading ? <Spinner size="sm" /> : 'Salir'}
      </Button>
      {error && <Text color="red.500">{error}</Text>}
    </>
  );
}
