"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Card,
  CardBody,
  useToast,
  Select,
  VStack,
  Spinner,
  Text,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { FaUserShield } from "react-icons/fa";
import dynamic from "next/dynamic";
import StatsCard from "../components/admin/StatsCard";
import WorkSessionsTable from "../components/admin/WorkSessionsTable";
import { checkUserRole } from "../actions/actions";
import { toLocalDate } from "../utils/toLocalDate";
import { useRouter } from "next/navigation";
import { usePermissions } from "../utils/hooks/usePermissions";
import MinimalCalendarPicker from "../components/admin/MinimalCalendarPicker";

// Dynamically import components that use browser APIs
const PieChart = dynamic(() => import("../components/admin/PieChart"), {
  ssr: false,
});
const LocationMap = dynamic(() => import("../components/admin/LocationMap"), {
  ssr: false,
});

const AdminDashboard = () => {
  const [workSessions, setWorkSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [stats, setStats] = useState({
    totalEmployees: 0,
    onTimePercentage: 0,
    latePercentage: 0,
    absentPercentage: 0,
  });
  const [filteredStatus, setFilteredStatus] = useState(null);
  const toast = useToast();
  const router = useRouter();
  const page = "/admin";

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
        setIsInitialLoading(false);
      }
    };

    fetchUserRole();
  }, [router, toast]);

  useEffect(() => {
    const fetchData = async () => {
      if (!role) return; // Don't fetch data if role is not set yet

      try {
        setIsDataLoading(true);
        // Fetch work sessions
        const sessionsResponse = await fetch("/api/work-sessions/admin");
        const sessionsData = await sessionsResponse.json();

        // Fetch users
        const usersResponse = await fetch("/api/users");
        const usersData = await usersResponse.json();

        setWorkSessions(sessionsData.adminWorkSessions || []);
        setUsers(usersData || []);

        // Calculate stats only if we have data
        if (
          sessionsData.adminWorkSessions?.length > 0 &&
          usersData?.length > 0
        ) {
          calculateStats(
            sessionsData.adminWorkSessions,
            usersData,
            selectedDate
          );
        }
      } catch (error) {
        toast({
          title: "Error al cargar datos",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsDataLoading(false);
      }
    };

    if (usePermissions(page, role)) {
      fetchData();
    }
  }, [role, page, selectedDate]);

  useEffect(() => {
    if (workSessions.length > 0 && users.length > 0) {
      calculateStats(workSessions, users, selectedDate);
    }
  }, [selectedDate, workSessions, users]);

  const calculateStats = (sessions, users, date) => {
    const dateData = sessions.find(
      (session) => session.work_session_date === date
    );
    const dateSessions = dateData?.employees_sessions || [];

    const onTimeSessions = dateSessions.filter((session) => {
      const checkInTime = new Date(session.first_check_in);
      return (
        checkInTime.getHours() < 9 ||
        (checkInTime.getHours() === 9 && checkInTime.getMinutes() <= 10)
      );
    });

    const lateSessions = dateSessions.filter((session) => {
      const checkInTime = new Date(session.first_check_in);
      return (
        checkInTime.getHours() > 9 ||
        (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 10)
      );
    });

    const absentCount = users.length - dateSessions.length;

    setStats({
      totalEmployees: users.length,
      onTimePercentage: (onTimeSessions.length / users.length) * 100,
      latePercentage: (lateSessions.length / users.length) * 100,
      absentPercentage: (absentCount / users.length) * 100,
    });
  };

  const handleChartClick = (status) => {
    setFilteredStatus(status);
  };

  const getAvailableDates = () => {
    if (!workSessions || workSessions.length === 0) {
      return [selectedDate]; // Return current date if no sessions available
    }
    return workSessions.map((session) => session.work_session_date);
  };

  if (isInitialLoading) {
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

  if (!usePermissions(page, role)) {
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

  if (isDataLoading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Flex justify="center" align="center" minH="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color="gray.600">Cargando datos del dashboard...</Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  return (
    <Container
      maxW={{ base: "100%", md: "container.xl" }}
      py={{ base: 4, md: 8 }}
      px={{ base: 1, md: 4 }}
    >
      <Heading mb={6} fontSize={{ base: "xl", md: "2xl" }}>
        Panel de Administración
      </Heading>

      {/* Date Selection */}
      <Box mb={6} maxW={{ base: "100%", md: "300px" }}>
        <MinimalCalendarPicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          availableDates={getAvailableDates()}
        />
      </Box>

      {/* Stats Cards */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 4 }}
        spacing={{ base: 3, md: 6 }}
        mb={8}
      >
        <StatsCard label="Total de Empleados" value={stats.totalEmployees} />
        <StatsCard
          label="A Tiempo Hoy"
          value={stats.onTimePercentage}
          suffix="%"
        />
        <StatsCard
          label="Tardanzas Hoy"
          value={stats.latePercentage}
          suffix="%"
        />
        <StatsCard
          label="Ausentes Hoy"
          value={stats.absentPercentage}
          suffix="%"
        />
      </SimpleGrid>

      {/* Charts Section */}
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 3, md: 6 }}
        mb={8}
      >
        <Card>
          <CardBody>
            <Heading size="md" mb={4} fontSize={{ base: "md", md: "lg" }}>
              Mapa de Ubicaciones
            </Heading>
            <Box h={{ base: "220px", md: "300px" }} w="100%" overflowX="auto">
              <LocationMap
                workSessions={workSessions}
                selectedDate={selectedDate}
              />
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={4} fontSize={{ base: "md", md: "lg" }}>
              Distribución de Asistencia
            </Heading>
            <Box h={{ base: "220px", md: "300px" }} w="100%" overflowX="auto">
              <PieChart
                data={[
                  { name: "A tiempo", value: stats.onTimePercentage },
                  { name: "Tardanza", value: stats.latePercentage },
                  { name: "Ausente", value: stats.absentPercentage },
                ]}
                onChartClick={handleChartClick}
              />
            </Box>
            {/* Percentages row */}
            <Flex mt={4} justify="center" gap={4} wrap="wrap">
              <Box display="flex" alignItems="center" gap={1}>
                <Box w={3} h={3} borderRadius="full" bg="#48BB78" />
                <Text fontSize="sm">
                  A tiempo: {stats.onTimePercentage.toFixed(1)}%
                </Text>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box w={3} h={3} borderRadius="full" bg="#F56565" />
                <Text fontSize="sm">
                  Tardanza: {stats.latePercentage.toFixed(1)}%
                </Text>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box w={3} h={3} borderRadius="full" bg="#718096" />
                <Text fontSize="sm">
                  Ausente: {stats.absentPercentage.toFixed(1)}%
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Work Sessions Table */}
      <WorkSessionsTable
        workSessions={workSessions}
        users={users}
        selectedDate={selectedDate}
        filteredStatus={filteredStatus}
        setFilteredStatus={setFilteredStatus}
      />
    </Container>
  );
};

export default AdminDashboard;
