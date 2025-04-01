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
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch work sessions
        const sessionsResponse = await fetch("/api/work-sessions/admin");
        const sessionsData = await sessionsResponse.json();

        // Fetch users
        const usersResponse = await fetch("/api/users");
        const usersData = await usersResponse.json();

        setWorkSessions(sessionsData.adminWorkSessions);
        setUsers(usersData);

        // Calculate stats
        calculateStats(sessionsData.adminWorkSessions, usersData, selectedDate);
      } catch (error) {
        toast({
          title: "Error al cargar datos",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (role === "admin") {
      fetchData();
    }
  }, [role]);

  useEffect(() => {
    calculateStats(workSessions, users, selectedDate);
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
    return workSessions.map((session) => session.work_session_date);
  };

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

  if (role !== "admin") {
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

  if (loading) {
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
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Panel de Administración</Heading>

      {/* Date Selection */}
      <Box mb={6}>
        <Select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          maxW="300px"
        >
          {getAvailableDates().map((date) => (
            <option key={date} value={date}>
              {toLocalDate(date)}
            </option>
          ))}
        </Select>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
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
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Distribución de Asistencia
            </Heading>
            <Box h="300px">
              <PieChart
                data={[
                  { name: "A tiempo", value: stats.onTimePercentage },
                  { name: "Tardanza", value: stats.latePercentage },
                  { name: "Ausente", value: stats.absentPercentage },
                ]}
                onChartClick={handleChartClick}
              />
            </Box>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Mapa de Ubicaciones
            </Heading>
            <Box h="300px">
              <LocationMap
                workSessions={workSessions}
                selectedDate={selectedDate}
              />
            </Box>
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
