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
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";

const WorkSessionsTable = ({
  workSessions,
  users,
  selectedDate,
  filteredStatus,
  setFilteredStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationAddresses, setLocationAddresses] = useState({});

  const getDateSessions = () => {
    const dateData = workSessions.find(
      (session) => session.work_session_date === selectedDate
    );
    return dateData?.employees_sessions || [];
  };

  const getStatus = (session) => {
    if (!session) return { status: "Ausente", color: "gray" };

    const checkInTime = new Date(session.first_check_in);
    const isOnTime =
      checkInTime.getHours() < 9 ||
      (checkInTime.getHours() === 9 && checkInTime.getMinutes() <= 10);

    return isOnTime
      ? { status: "A tiempo", color: "green" }
      : { status: "Tardanza", color: "red" };
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchLocation = async (session) => {
    if (!session?.first_check_in_location) return;

    const locationKey = `${session.first_check_in_location.lat},${session.first_check_in_location.lng}`;

    // Skip if already cached
    if (locationAddresses[locationKey]) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${session.first_check_in_location.lat}&lon=${session.first_check_in_location.lng}`,
        {
          headers: {
            "User-Agent": "TKSControl/1.0",
            "Accept-Language": "es",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location");
      }

      const data = await response.json();
      const address = data.display_name;

      setLocationAddresses((prev) => ({
        ...prev,
        [locationKey]: address,
      }));
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocationAddresses((prev) => ({
        ...prev,
        [locationKey]: "Ubicación no disponible",
      }));
    }
  };

  // Fetch locations when component mounts or sessions change
  useEffect(() => {
    const dateSessions = getDateSessions();
    dateSessions.forEach((session) => {
      if (session?.first_check_in_location) {
        fetchLocation(session);
      }
    });
  }, [workSessions, selectedDate]);

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

  return (
    <Card>
      <CardBody>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Sesiones de Trabajo</Heading>
          <Flex align="center" gap={2}>
            {filteredStatus && (
              <Button
                size="sm"
                leftIcon={<CloseIcon />}
                onClick={() => setFilteredStatus(null)}
                variant="ghost"
              >
                Limpiar filtro
              </Button>
            )}
            <Box>
              <Input
                placeholder="Buscar empleado..."
                size="sm"
                maxW="300px"
                mr={2}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IconButton aria-label="Buscar" icon={<SearchIcon />} size="sm" />
            </Box>
          </Flex>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Empleado</Th>
                <Th>Primer Check In</Th>
                <Th>Último Check Out</Th>
                <Th>Estado</Th>
                <Th>Ubicación</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => {
                const userSession = dateSessions.find(
                  (session) => session.profile_id === user.id
                );
                const status = getStatus(userSession);
                const locationKey = userSession?.first_check_in_location
                  ? `${userSession.first_check_in_location.lat},${userSession.first_check_in_location.lng}`
                  : null;

                return (
                  <Tr key={user.id}>
                    <Td>{user.full_name}</Td>
                    <Td>{formatTime(userSession?.first_check_in)}</Td>
                    <Td>{formatTime(userSession?.last_check_out)}</Td>
                    <Td>
                      <Badge colorScheme={status.color}>{status.status}</Badge>
                    </Td>
                    <Td>
                      {locationKey ? (
                        locationAddresses[locationKey] ? (
                          locationAddresses[locationKey]
                        ) : (
                          <Skeleton height="20px" width="200px" />
                        )
                      ) : (
                        "N/A"
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </CardBody>
    </Card>
  );
};

export default WorkSessionsTable;
