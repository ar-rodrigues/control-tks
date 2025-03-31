"use client";
import React, { useState, useEffect } from "react";

import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { Box, Flex, Heading, VStack, Spinner } from "@chakra-ui/react";

import { useRouter } from "next/navigation";
import { checkUserRole } from "../actions/actions";
import {
  fetchDealers,
  fetchClientes,
  fetchEstados,
  fetchZonas,
} from "../api/dealers/dealers";

import TableDealers from "../components/Dealers/TableDealers";

export default function Dealers() {
  const [data, setData] = useState({});
  const [clientes, setClientes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { role, email } = await checkUserRole();
        if (!role) {
          router.push("/login");
        } else {
          setRole(role);
          const dealers = await fetchDealers();
          const clientes = await fetchClientes();
          const zonas = await fetchZonas();
          const estados = await fetchEstados();
          setClientes(clientes);
          setZonas(zonas);
          setEstados(estados);
          setData(dealers);
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        router.push("/error"); // Replace with your error page
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [router]);

  return (
    <Box>
      {isLoading && role ? (
        <Flex justify="center" align="center" height="100vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <PrimeReactProvider>
          <Box p={4}>
            <Heading as="h1" size="xl" mb={4}>
              <TableDealers
                data={data}
                clientes={clientes}
                zonas={zonas}
                estados={estados}
                isLoading={isLoading}
              />
            </Heading>
          </Box>
        </PrimeReactProvider>
      )}
    </Box>
  );
}
