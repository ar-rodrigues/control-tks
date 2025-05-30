"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useUsersAuditors } from "../utils/hooks/useUsersAuditors";
import { useLocationsDirectory } from "../utils/hooks/useLocationsDirectory";
import { usePlanning } from "../utils/hooks/usePlanning";
import {
  Box,
  Flex,
  Text,
  Button,
  Spinner,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  useToast,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button as ChakraButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  HStack,
  Divider,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import { getUserProfile } from "../utils/users/usersOperations";

const ZONES = ["Centro", "Sur", "Norte", "Occidente"];

const ZONE_COLORS = {
  Centro: "blue",
  Sur: "green",
  Norte: "red",
  Occidente: "purple",
};

const getZoneColor = (zone) => {
  return ZONE_COLORS[zone] || "gray";
};

// Memoize the ZoneSelect component
const ZoneSelect = React.memo(({ value, onChange, id }) => {
  return (
    <Menu>
      <MenuButton
        as={ChakraButton}
        w="100%"
        size="sm"
        colorScheme={getZoneColor(value)}
        variant="outline"
        fontSize="sm"
      >
        {value || "Seleccionar zona"}
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto">
        {ZONES.map((zone) => (
          <MenuItem
            key={zone}
            onClick={() => onChange({ target: { value: zone } })}
            bg={`${getZoneColor(zone)}.50`}
            _hover={{ bg: `${getZoneColor(zone)}.100` }}
            color={`${getZoneColor(zone)}.700`}
            fontSize="sm"
            py={1}
          >
            {zone}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
});

// Memoize the AuditorSelect component
const AuditorSelect = React.memo(({ value, onChange, id, auditors }) => {
  // Group auditors by zone
  const auditorsByZone = auditors.reduce((acc, auditor) => {
    const zone = auditor.zone || "Sin zona";
    if (!acc[zone]) {
      acc[zone] = [];
    }
    acc[zone].push(auditor);
    return acc;
  }, {});

  // Sort zones to put "Sin zona" last
  const sortedZones = Object.keys(auditorsByZone).sort((a, b) => {
    if (a === "Sin zona") return 1;
    if (b === "Sin zona") return -1;
    return a.localeCompare(b);
  });

  // Find the selected auditor to display their name
  const selectedAuditor = auditors.find((a) => a.id === value);

  return (
    <Menu>
      <MenuButton
        as={ChakraButton}
        w="100%"
        size="sm"
        variant="outline"
        fontSize="sm"
      >
        {selectedAuditor?.full_name || "Seleccionar auditor"}
      </MenuButton>
      <MenuList maxH="300px" overflowY="auto">
        {sortedZones.map((zone) => (
          <Box key={zone}>
            <Text
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="bold"
              bg={`${getZoneColor(zone)}.100`}
              color={`${getZoneColor(zone)}.700`}
            >
              {zone}
            </Text>
            {auditorsByZone[zone].map((auditor) => (
              <MenuItem
                key={auditor.id}
                onClick={() => onChange({ target: { value: auditor.id } })}
                bg={`${getZoneColor(zone)}.50`}
                _hover={{ bg: `${getZoneColor(zone)}.100` }}
                color={`${getZoneColor(zone)}.700`}
                fontSize="sm"
                py={1}
                pl={6}
              >
                {auditor.full_name}
              </MenuItem>
            ))}
          </Box>
        ))}
      </MenuList>
    </Menu>
  );
});

// Memoize the PlanningRow component
const PlanningRow = React.memo(
  ({
    location,
    selectedAuditor,
    selectedDate,
    auditors,
    onDateChange,
    onAuditorChange,
    onZoneChange,
    onMatrizToggle,
    onRowClick,
    dateRange,
  }) => {
    return (
      <Tr
        _hover={{ bg: "gray.50" }}
        cursor="pointer"
        onClick={() => onRowClick(location)}
      >
        <Td py={2} maxW="150px" isTruncated>
          {location.cliente}
        </Td>
        <Td py={2} maxW="150px" isTruncated>
          {location.convenio}
        </Td>
        <Td py={2} w="120px" onClick={(e) => e.stopPropagation()}>
          <ZoneSelect
            value={location.zona}
            onChange={(e) => onZoneChange(location.id, e.target.value)}
            id={`zone-${location.id}`}
          />
        </Td>
        <Td py={2} w="150px" onClick={(e) => e.stopPropagation()}>
          <AuditorSelect
            value={selectedAuditor}
            onChange={(e) => onAuditorChange(location.id, e.target.value)}
            id={`auditor-${location.id}`}
            auditors={auditors}
          />
        </Td>
        <Td py={2} w="120px" onClick={(e) => e.stopPropagation()}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => onDateChange(location.id, date)}
            dateFormat="dd/MM/yyyy"
            className="chakra-input css-1kp110w"
            placeholderText="Seleccionar fecha"
            minDate={dateRange.startDate}
            maxDate={dateRange.endDate}
          />
        </Td>
        <Td py={2} w="80px" onClick={(e) => e.stopPropagation()}>
          <Switch
            id={`matriz-${location.id}`}
            isChecked={location.es_matriz}
            onChange={(e) => onMatrizToggle(location.id, e.target.checked)}
            size="sm"
          />
        </Td>
      </Tr>
    );
  }
);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Memoize the PlanningTable component
const PlanningTable = React.memo(
  ({
    locations,
    auditors,
    localPlanningData,
    selectedMonth,
    selectedYear,
    onDateChange,
    onAuditorChange,
    onZoneChange,
    onMatrizToggle,
    onRowClick,
  }) => {
    // Memoize the date range for the current month
    const dateRange = useMemo(() => {
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      return { startDate, endDate };
    }, [selectedYear, selectedMonth]);

    return (
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th py={2}>Cliente</Th>
              <Th py={2}>Convenio</Th>
              <Th py={2}>Zona</Th>
              <Th py={2}>Auditor</Th>
              <Th py={2}>Fecha</Th>
              <Th py={2}>Matriz</Th>
            </Tr>
          </Thead>
          <Tbody>
            {locations.map((location) => (
              <PlanningRow
                key={location.id}
                location={location}
                selectedAuditor={
                  localPlanningData[location.id]?.[selectedMonth]?.auditor_id
                }
                selectedDate={
                  localPlanningData[location.id]?.[selectedMonth]?.audit_date
                }
                auditors={auditors}
                onDateChange={onDateChange}
                onAuditorChange={onAuditorChange}
                onZoneChange={onZoneChange}
                onMatrizToggle={onMatrizToggle}
                onRowClick={onRowClick}
                dateRange={dateRange}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  }
);

export default function Planning() {
  const {
    locations,
    isLoading: isLoadingLocations,
    error: errorLocations,
  } = useLocationsDirectory();
  const {
    auditors,
    isLoading: isLoadingAuditors,
    error: errorAuditors,
  } = useUsersAuditors();
  const {
    loading: isLoadingPlanning,
    error: errorPlanning,
    getPlannings,
    createPlanning,
  } = usePlanning();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [localPlanningData, setLocalPlanningData] = useState({});
  const [savedPlanningData, setSavedPlanningData] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const toast = useToast();

  // Get current user's ID on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setCurrentUserId(profile.id);
      } catch (error) {
        console.error("Error loading user profile:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil del usuario",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    loadUserProfile();
  }, []);

  // Load all planning data once
  useEffect(() => {
    const loadAllPlanningData = async () => {
      try {
        // Load data for the entire year
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31);

        const planningData = await getPlannings({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

        // Organize data by location_id
        const organizedData = planningData.reduce((acc, plan) => {
          acc[plan.location_id] = {
            ...acc[plan.location_id],
            [new Date(plan.audit_date).getMonth()]: {
              auditor_id: plan.auditor_id,
              audit_date: new Date(plan.audit_date),
            },
          };
          return acc;
        }, {});

        setSavedPlanningData(organizedData);
        setLocalPlanningData(organizedData);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de planificación",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (!isLoadingLocations && !isLoadingAuditors) {
      loadAllPlanningData();
    }
  }, [selectedYear, isLoadingLocations, isLoadingAuditors]);

  // Memoize the years array
  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i),
    []
  );

  // Handlers for local state changes
  const handleDateChange = useCallback(
    (locationId, date) => {
      setLocalPlanningData((prev) => ({
        ...prev,
        [locationId]: {
          ...prev[locationId],
          [selectedMonth]: {
            ...prev[locationId]?.[selectedMonth],
            audit_date: date,
          },
        },
      }));
    },
    [selectedMonth]
  );

  const handleAuditorChange = useCallback(
    (locationId, auditorId) => {
      setLocalPlanningData((prev) => ({
        ...prev,
        [locationId]: {
          ...prev[locationId],
          [selectedMonth]: {
            ...prev[locationId]?.[selectedMonth],
            auditor_id: auditorId,
          },
        },
      }));
    },
    [selectedMonth]
  );

  const handleZoneChange = useCallback(
    async (locationId, zone) => {
      try {
        const location = locations.find((loc) => loc.id === locationId);
        if (!location) return;

        await updateLocation(locationId, {
          ...location,
          zona: zone,
        });

        toast({
          title: "Zona actualizada",
          description: "La zona ha sido actualizada correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar la zona",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [locations]
  );

  const handleMatrizToggle = useCallback(
    async (locationId, isMatriz) => {
      try {
        const location = locations.find((loc) => loc.id === locationId);
        if (!location) return;

        await updateLocation(locationId, {
          ...location,
          es_matriz: isMatriz,
        });

        toast({
          title: "Estado actualizado",
          description: "El estado de matriz ha sido actualizado",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de matriz",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [locations]
  );

  // Save all changes
  const handleSaveAll = useCallback(async () => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "No se pudo identificar al usuario actual",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Get all changes
      const changes = [];
      Object.entries(localPlanningData).forEach(([locationId, months]) => {
        Object.entries(months).forEach(([month, data]) => {
          if (data.auditor_id && data.audit_date) {
            // Convert date to Mexico City timezone
            const mexicoCityDate = new Date(
              data.audit_date.toLocaleString("en-US", {
                timeZone: "America/Mexico_City",
              })
            );

            changes.push({
              location_id: locationId,
              auditor_id: data.auditor_id,
              audit_date: mexicoCityDate.toISOString(),
              created_by: currentUserId,
            });
          }
        });
      });

      // Save all changes
      await Promise.all(changes.map((plan) => createPlanning(plan)));

      // Update saved data
      setSavedPlanningData(localPlanningData);

      toast({
        title: "Planificación guardada",
        description: "La planificación se ha guardado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving planning:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la planificación",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [localPlanningData, currentUserId]);

  // Function to get the last assigned auditor for a location
  const getLastAssignedAuditor = useCallback(
    (locationId) => {
      const locationData = localPlanningData[locationId];
      if (!locationData) return null;

      // Get all months with assigned auditors, sorted by month (descending)
      const assignedMonths = Object.entries(locationData)
        .filter(([month, data]) => data.auditor_id)
        .sort(([a], [b]) => parseInt(b) - parseInt(a));

      if (assignedMonths.length === 0) return null;

      const [lastMonth, lastAssignment] = assignedMonths[0];
      const auditor = auditors.find((a) => a.id === lastAssignment.auditor_id);

      return {
        auditor,
        month: parseInt(lastMonth),
        date: lastAssignment.audit_date,
      };
    },
    [localPlanningData, auditors]
  );

  // Handle row click to open drawer
  const handleRowClick = useCallback(
    (location) => {
      setSelectedLocation(location);
      onDrawerOpen();
    },
    [onDrawerOpen]
  );

  // Location Details Drawer Component
  const LocationDetailsDrawer = () => {
    if (!selectedLocation) return null;

    const lastAssignment = getLastAssignedAuditor(selectedLocation.id);

    return (
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={onDrawerClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <VStack align="start" spacing={2}>
              <Text fontSize="lg" fontWeight="bold">
                {selectedLocation.cliente}
              </Text>
              <Text fontSize="md" color="gray.600">
                {selectedLocation.convenio}
              </Text>
            </VStack>
          </DrawerHeader>

          <DrawerBody>
            <VStack align="stretch" spacing={4}>
              {/* Basic Information */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={2}>
                  Información General
                </Text>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Cliente:</Text>
                    <Text>{selectedLocation.cliente}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Convenio:</Text>
                    <Text>{selectedLocation.convenio}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Zona:</Text>
                    <Badge colorScheme={getZoneColor(selectedLocation.zona)}>
                      {selectedLocation.zona || "Sin asignar"}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Es Matriz:</Text>
                    <Badge
                      colorScheme={
                        selectedLocation.es_matriz ? "green" : "gray"
                      }
                    >
                      {selectedLocation.es_matriz ? "Sí" : "No"}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              <Divider />

              {/* Address Information */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={2}>
                  Dirección
                </Text>
                <VStack align="stretch" spacing={2}>
                  {selectedLocation.direccion && (
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Dirección:</Text>
                      <Text textAlign="right">
                        {selectedLocation.direccion}
                      </Text>
                    </HStack>
                  )}
                  {selectedLocation.cp && (
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Código Postal:</Text>
                      <Text>{selectedLocation.cp}</Text>
                    </HStack>
                  )}
                  {selectedLocation.ciudad && (
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Ciudad:</Text>
                      <Text>{selectedLocation.ciudad}</Text>
                    </HStack>
                  )}
                  {selectedLocation.estado && (
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Estado:</Text>
                      <Text>{selectedLocation.estado}</Text>
                    </HStack>
                  )}
                  {selectedLocation.pais && (
                    <HStack justify="space-between">
                      <Text fontWeight="medium">País:</Text>
                      <Text>{selectedLocation.pais}</Text>
                    </HStack>
                  )}
                </VStack>
              </Box>

              <Divider />

              {/* Last Assignment Information */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={2}>
                  Última Asignación
                </Text>
                {lastAssignment ? (
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Auditor:</Text>
                      <Text>{lastAssignment.auditor?.full_name}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Mes:</Text>
                      <Text>{MONTHS[lastAssignment.month]}</Text>
                    </HStack>
                    {lastAssignment.date && (
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Fecha:</Text>
                        <Text>
                          {lastAssignment.date.toLocaleDateString("es-ES")}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                ) : (
                  <Text color="gray.500" fontStyle="italic">
                    No hay asignaciones previas
                  </Text>
                )}
              </Box>

              {/* Additional Information */}
              {(selectedLocation.telefono ||
                selectedLocation.email ||
                selectedLocation.contacto) && (
                <>
                  <Divider />
                  <Box>
                    <Text fontSize="md" fontWeight="semibold" mb={2}>
                      Contacto
                    </Text>
                    <VStack align="stretch" spacing={2}>
                      {selectedLocation.contacto && (
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Contacto:</Text>
                          <Text>{selectedLocation.contacto}</Text>
                        </HStack>
                      )}
                      {selectedLocation.telefono && (
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Teléfono:</Text>
                          <Text>{selectedLocation.telefono}</Text>
                        </HStack>
                      )}
                      {selectedLocation.email && (
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Email:</Text>
                          <Text>{selectedLocation.email}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </>
              )}
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onDrawerClose}>
              Cerrar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  if (isLoadingLocations || isLoadingAuditors || isLoadingPlanning) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (errorLocations || errorAuditors || errorPlanning) {
    return (
      <Box p={4}>
        <Text color="red.500">
          Error:{" "}
          {errorLocations?.message ||
            errorAuditors?.message ||
            errorPlanning?.message}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Planificación de Visitas
        </Text>
        <Button
          colorScheme="blue"
          onClick={handleSaveAll}
          isDisabled={isLoadingPlanning}
        >
          Guardar Cambios
        </Button>
      </Flex>

      <Flex direction="column" gap={4} mb={6}>
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          w="200px"
          size="sm"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>

        <Tabs
          variant="enclosed"
          index={selectedMonth}
          onChange={setSelectedMonth}
          colorScheme="blue"
        >
          <TabList>
            {MONTHS.map((month) => (
              <Tab key={month} fontSize="sm" py={2}>
                {month}
              </Tab>
            ))}
          </TabList>
        </Tabs>

        {/* Single table instance that updates based on selected month */}
        <PlanningTable
          locations={locations}
          auditors={auditors}
          localPlanningData={localPlanningData}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onDateChange={handleDateChange}
          onAuditorChange={handleAuditorChange}
          onZoneChange={handleZoneChange}
          onMatrizToggle={handleMatrizToggle}
          onRowClick={handleRowClick}
        />
      </Flex>

      <LocationDetailsDrawer />
    </Box>
  );
}
