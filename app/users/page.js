"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkUserRole } from "../actions/actions";
import { AdminPanel } from "../components/admin/AdminPanel";
import {
  Box,
  Flex,
  Heading,
  VStack,
  Spinner,
  Container,
  useToast,
  Text,
  Icon,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@chakra-ui/react";
import { FaUserShield, FaUser } from "react-icons/fa";

const Users = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { role } = await checkUserRole();
        if (!role) {
          toast({
            title: "Sesión expirada",
            description: "Por favor, inicie sesión nuevamente.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          router.push("/login");
        } else {
          setRole(role);
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        toast({
          title: "Error",
          description: "Ha ocurrido un error al verificar su rol.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        router.push("/error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [router, toast]);

  if (role !== "admin" && !isLoading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Card>
          <CardBody>
            <VStack spacing={6} align="center" py={10}>
              <Icon as={FaUserShield} w={20} h={20} color="red.500" />
              <Heading size="lg" color="red.500">
                Acceso Denegado
              </Heading>
              <Text color="gray.600" textAlign="center">
                No tiene los permisos necesarios para acceder a esta página. Por
                favor, contacte al administrador si cree que esto es un error.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Flex justify="center" align="center" minH="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color="gray.600">Cargando panel de administración...</Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Card>
        <CardHeader>
          <Flex align="center" justify="space-between" mb={2}>
            <VStack align="start" spacing={1}>
              <Flex align="center" gap={2}>
                <Icon as={FaUser} w={8} h={8} color="blue.500" />
                <Heading size="lg" color="blue.500">
                  Administración de Usuarios
                </Heading>
              </Flex>
              <Text color="gray.600">
                Gestione los usuarios del sistema, sus roles y permisos
              </Text>
            </VStack>
          </Flex>
          <Divider />
        </CardHeader>
        <CardBody>
          <Box p={4}>
            <AdminPanel />
          </Box>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Users;
