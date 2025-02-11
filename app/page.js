'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserRole } from './actions/actions';
import LogoutButton from './components/logout/LogoutButton';
import { Box, Flex, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import { FiAtSign } from "react-icons/fi";
import { FaUserShield } from 'react-icons/fa';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { role, email } = await checkUserRole();
        if (!role) {
          router.push('/login');
        } else {
          setRole(role);
          setEmail(email);
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
        maxW="lg"
        w="full"
        p={8}
        bg="white"
        boxShadow="lg"
        borderRadius="md"
        textAlign="center"
      >
        <VStack spacing={6}>
          <Heading size="lg" color="blue.500">
            Hola!
          </Heading>
          <Flex align="center" color="gray.600">
            <FiAtSign boxSize={6} mr={2} />
            <Text fontSize="lg">{email}</Text>
          </Flex>
          <Flex align="center" color="gray.600">
            <FaUserShield style={{ marginRight: '8px', fontSize: '24px' }} />
            <Text fontSize="lg">Role: {role}</Text>
          </Flex>
          <LogoutButton />
        </VStack>
      </Box>
    </Flex>
  );
};

export default Home;
