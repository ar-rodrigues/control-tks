'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserRole } from '../actions/actions';
import { AdminPanel } from '../components/admin/AdminPanel';
import { Box, Flex, Heading, VStack, Spinner } from '@chakra-ui/react';

const Users = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { role } = await checkUserRole();
        if (!role) {
          router.push('/login');
        } else {
          setRole(role);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        router.push('/error'); // Replace with your error page
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [router]);

  if(role !== 'admin' && !isLoading){
    return (
        <Flex minH="100vh" justify="center" align="center" p={8} bgGradient="linear(to-r, gray.50, blue.50)">
            <Heading size="lg" color="red.500">Acceso denegado</Heading>
        </Flex>
    )
  }

  if (isLoading) {
    return (
      <Flex minH="100vh" justify="center" align="center" p={8} bgGradient="linear(to-r, gray.50, blue.50)">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex
      minH="100vh"
      justify="center"
      align="center"
      p={8}
      bgGradient="linear(to-r, gray.50, blue.50)"
    >
      <Box
        maxW="xl"
        w="full"
        p={8}
        bg="white"
        boxShadow="lg"
        borderRadius="md"
        textAlign="center"
      >
        <VStack spacing={6}>
          <Heading size="lg" color="blue.500">
            Administrador de Usuários
          </Heading>
          <AdminPanel />
        </VStack>
      </Box>
    </Flex>
  );
};

export default Users;
