"use client";

import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  IconButton,
  Flex,
  Heading,
  Card,
  CardBody,
  Button,
  Skeleton,
  CardHeader,
  Select,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon, DownloadIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { useBreakpointValue } from "@chakra-ui/react";

const WorkSessionsTable = ({
  workSessions,
  users,
  selectedDate,
  filteredStatus,
  setFilteredStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [expandedAddresses, setExpandedAddresses] = useState({});

  const toggleAddress = (userId, field) => {
    setExpandedAddresses((prev) => ({
      ...prev,
      [`${userId}_${field}`]: !prev[`${userId}_${field}`],
    }));
  };

  const getDateSessions = () => {
    const dateData = workSessions.find(
      (session) => session.work_session_date === selectedDate
    );
    return dateData?.employees_sessions || [];
  };

  const getStatus = (session) => {
    if (!session) {
      return { status: "No registrado", color: "gray" };
    }

    const checkInTime = new Date(session.first_check_in);
    const isOnTime =
      checkInTime.getHours() < 9 ||
      (checkInTime.getHours() === 9 && checkInTime.getMinutes() <= 10);

    if (isOnTime) {
      return { status: "A tiempo", color: "green" };
    } else {
      return { status: "Tardanza", color: "red" };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dateSessions = getDateSessions();

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const userSession = dateSessions.find(
      (session) => session.profile_id === user.id
    );
    const status = getStatus(userSession);

    if (filteredStatus) {
      return matchesSearch && status.status === filteredStatus;
    }
    return matchesSearch;
  });

  // CSV Download logic
  const handleDownloadCSV = () => {
    // CSV header
    const header = [
      "Empleado",
      "Primer Check In",
      "Último Check Out",
      "Estado",
      "Dirección Entrada",
      "Dirección Salida",
    ];
    // CSV rows
    const rows = filteredUsers.map((user) => {
      const userSession = dateSessions.find(
        (session) => session.profile_id === user.id
      );
      const status = getStatus(userSession);
      return [
        user.full_name,
        formatTime(userSession?.first_check_in),
        formatTime(userSession?.last_check_out),
        status.status,
        userSession?.first_check_in_address || "No disponible",
        userSession?.last_check_out_address || "No disponible",
      ];
    });
    // CSV string
    const csvContent = [
      header.join(","),
      ...rows.map((row) =>
        row
          .map(
            (field) => `"${String(field).replace(/"/g, '""')}"` // Escape quotes
          )
          .join(",")
      ),
    ].join("\r\n");
    // Filename
    const [yyyy, mm, dd] = selectedDate.split("-");
    const filename = `asistencia-${dd}-${mm}-${yyyy}.csv`;
    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          <Heading size="md" fontSize={{ base: "lg", md: "xl" }}>
            Registro de Asistencia
          </Heading>
          <Flex
            gap={2}
            direction={{ base: "column", sm: "row" }}
            w={{ base: "100%", md: "auto" }}
            align="center"
          >
            <Input
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW={{ base: "100%", md: "300px" }}
              fontSize={{ base: "sm", md: "md" }}
              py={{ base: 2, md: 3 }}
            />
            <Select
              value={filteredStatus || ""}
              onChange={(e) => setFilteredStatus(e.target.value || null)}
              maxW={{ base: "100%", md: "200px" }}
              fontSize={{ base: "sm", md: "md" }}
              py={{ base: 2, md: 3 }}
            >
              <option value="">Todos los estados</option>
              <option value="A tiempo">A tiempo</option>
              <option value="Tardanza">Tardanza</option>
              <option value="No registrado">No registrado</option>
            </Select>
            <Tooltip label="Descargar CSV" aria-label="Descargar CSV">
              <IconButton
                icon={<DownloadIcon />}
                colorScheme="blue"
                variant="outline"
                size="md"
                onClick={handleDownloadCSV}
                minW="44px"
                px={2}
                aria-label="Descargar CSV"
              />
            </Tooltip>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody p={{ base: 2, md: 4 }}>
        {isMobile ? (
          // Card/List view for mobile
          <Box maxH="60vh" overflowY="auto">
            <VStack spacing={4} align="stretch">
              {filteredUsers.map((user) => {
                const userSession = dateSessions.find(
                  (session) => session.profile_id === user.id
                );
                const status = getStatus(userSession);
                return (
                  <Box
                    key={user.id}
                    borderWidth="1px"
                    borderRadius="lg"
                    p={3}
                    boxShadow="sm"
                    bg="gray.50"
                  >
                    <Text fontWeight="bold" fontSize="md">
                      {user.full_name}
                    </Text>
                    <Flex mt={1} wrap="wrap" fontSize="sm" color="gray.700">
                      <Box flex="1 1 50%">
                        <Text fontWeight="medium">Primer Check In:</Text>
                        <Text>{formatTime(userSession?.first_check_in)}</Text>
                      </Box>
                      <Box flex="1 1 50%">
                        <Text fontWeight="medium">Último Check Out:</Text>
                        <Text>{formatTime(userSession?.last_check_out)}</Text>
                      </Box>
                    </Flex>
                    <Flex mt={1} align="center" gap={2}>
                      <Badge colorScheme={status.color}>{status.status}</Badge>
                    </Flex>
                    <Box mt={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        Dirección:
                      </Text>
                      {userSession ? (
                        <Box>
                          <Tooltip
                            label={userSession.first_check_in_address}
                            isDisabled={
                              expandedAddresses[`${user.id}_checkin`] ||
                              !userSession.first_check_in_address ||
                              userSession.first_check_in_address.length < 30
                            }
                          >
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              mb={1}
                              maxW="220px"
                              isTruncated={
                                !expandedAddresses[`${user.id}_checkin`]
                              }
                              cursor={
                                userSession.first_check_in_address
                                  ? "pointer"
                                  : "default"
                              }
                              onClick={() =>
                                userSession.first_check_in_address &&
                                toggleAddress(user.id, "checkin")
                              }
                              title={
                                expandedAddresses[`${user.id}_checkin`]
                                  ? undefined
                                  : userSession.first_check_in_address
                              }
                            >
                              Entrada:{" "}
                              {userSession.first_check_in_address ||
                                "No disponible"}
                            </Text>
                          </Tooltip>
                          {userSession.last_check_out && (
                            <Tooltip
                              label={userSession.last_check_out_address}
                              isDisabled={
                                expandedAddresses[`${user.id}_checkout`] ||
                                !userSession.last_check_out_address ||
                                userSession.last_check_out_address.length < 30
                              }
                            >
                              <Text
                                fontSize="sm"
                                color="gray.600"
                                isTruncated={
                                  !expandedAddresses[`${user.id}_checkout`]
                                }
                                maxW="220px"
                                cursor={
                                  userSession.last_check_out_address
                                    ? "pointer"
                                    : "default"
                                }
                                onClick={() =>
                                  userSession.last_check_out_address &&
                                  toggleAddress(user.id, "checkout")
                                }
                                title={
                                  expandedAddresses[`${user.id}_checkout`]
                                    ? undefined
                                    : userSession.last_check_out_address
                                }
                              >
                                Salida:{" "}
                                {userSession.last_check_out_address ||
                                  "No disponible"}
                              </Text>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Text fontSize="sm">No registrado</Text>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        ) : (
          // Table view for desktop
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th fontSize="md">Empleado</Th>
                  <Th fontSize="md">Primer Check In</Th>
                  <Th fontSize="md">Último Check Out</Th>
                  <Th fontSize="md">Estado</Th>
                  <Th fontSize="md">Dirección</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user) => {
                  const userSession = dateSessions.find(
                    (session) => session.profile_id === user.id
                  );
                  const status = getStatus(userSession);
                  return (
                    <Tr key={user.id}>
                      <Td fontSize="sm">{user.full_name}</Td>
                      <Td fontSize="sm">
                        {formatTime(userSession?.first_check_in)}
                      </Td>
                      <Td fontSize="sm">
                        {formatTime(userSession?.last_check_out)}
                      </Td>
                      <Td fontSize="sm">
                        <Badge colorScheme={status.color}>
                          {status.status}
                        </Badge>
                      </Td>
                      <Td fontSize="sm">
                        {userSession ? (
                          <Box>
                            <Tooltip
                              label={userSession.first_check_in_address}
                              isDisabled={
                                expandedAddresses[`${user.id}_checkin`] ||
                                !userSession.first_check_in_address ||
                                userSession.first_check_in_address.length < 30
                              }
                            >
                              <Text
                                fontSize="sm"
                                color="gray.600"
                                mb={1}
                                maxW="180px"
                                isTruncated={
                                  !expandedAddresses[`${user.id}_checkin`]
                                }
                                cursor={
                                  userSession.first_check_in_address
                                    ? "pointer"
                                    : "default"
                                }
                                onClick={() =>
                                  userSession.first_check_in_address &&
                                  toggleAddress(user.id, "checkin")
                                }
                                title={
                                  expandedAddresses[`${user.id}_checkin`]
                                    ? undefined
                                    : userSession.first_check_in_address
                                }
                              >
                                <Text fontWeight={"bold"}>Entrada: </Text>
                                {userSession.first_check_in_address ||
                                  "No disponible"}
                              </Text>
                            </Tooltip>
                            {userSession.last_check_out && (
                              <Tooltip
                                label={userSession.last_check_out_address}
                                isDisabled={
                                  expandedAddresses[`${user.id}_checkout`] ||
                                  !userSession.last_check_out_address ||
                                  userSession.last_check_out_address.length < 30
                                }
                              >
                                <Text
                                  fontSize="sm"
                                  color="gray.600"
                                  isTruncated={
                                    !expandedAddresses[`${user.id}_checkout`]
                                  }
                                  maxW="180px"
                                  cursor={
                                    userSession.last_check_out_address
                                      ? "pointer"
                                      : "default"
                                  }
                                  onClick={() =>
                                    userSession.last_check_out_address &&
                                    toggleAddress(user.id, "checkout")
                                  }
                                  title={
                                    expandedAddresses[`${user.id}_checkout`]
                                      ? undefined
                                      : userSession.last_check_out_address
                                  }
                                >
                                  <Text fontWeight={"bold"}>Salida: </Text>
                                  {userSession.last_check_out_address ||
                                    "No disponible"}
                                </Text>
                              </Tooltip>
                            )}
                          </Box>
                        ) : (
                          "No registrado"
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

export default WorkSessionsTable;
