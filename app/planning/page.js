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
  IconButton,
  SimpleGrid,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import { getUserProfile } from "../utils/users/usersOperations";
import {
  DeleteIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DownloadIcon,
  CheckIcon,
  CloseIcon,
} from "@chakra-ui/icons";

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

// Filter Controls Component
const FilterControls = React.memo(
  ({ locations, auditors, filters, onFilterChange }) => {
    // Get unique values for filter options
    const clienteOptions = useMemo(() => {
      const unique = [
        ...new Set(locations.map((loc) => loc.cliente).filter(Boolean)),
      ];
      return unique.sort();
    }, [locations]);

    const convenioOptions = useMemo(() => {
      const unique = [
        ...new Set(locations.map((loc) => loc.convenio).filter(Boolean)),
      ];
      return unique.sort();
    }, [locations]);

    const zonaOptions = useMemo(() => {
      const unique = [
        ...new Set(locations.map((loc) => loc.zona).filter(Boolean)),
      ];
      return unique.sort();
    }, [locations]);

    return (
      <Box p={4} bg="gray.50" borderRadius="md" mb={0}>
        <Text fontSize="md" fontWeight="semibold" mb={3}>
          Filtros
        </Text>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
          <Select
            placeholder="Clientes"
            value={filters.cliente}
            onChange={(e) => onFilterChange("cliente", e.target.value)}
            size="sm"
          >
            {clienteOptions.map((cliente) => (
              <option key={cliente} value={cliente}>
                {cliente}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Convenios"
            value={filters.convenio}
            onChange={(e) => onFilterChange("convenio", e.target.value)}
            size="sm"
          >
            {convenioOptions.map((convenio) => (
              <option key={convenio} value={convenio}>
                {convenio}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Todas las zonas"
            value={filters.zona}
            onChange={(e) => onFilterChange("zona", e.target.value)}
            size="sm"
          >
            {zonaOptions.map((zona) => (
              <option key={zona} value={zona}>
                {zona}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Auditores"
            value={filters.auditor}
            onChange={(e) => onFilterChange("auditor", e.target.value)}
            size="sm"
          >
            {auditors.map((auditor) => (
              <option key={auditor.id} value={auditor.id}>
                {auditor.full_name}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Matriz: Todos"
            value={filters.matriz}
            onChange={(e) => onFilterChange("matriz", e.target.value)}
            size="sm"
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </Select>

          <Select
            placeholder="Activo: Todos"
            value={filters.activo}
            onChange={(e) => onFilterChange("activo", e.target.value)}
            size="sm"
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </Select>
        </SimpleGrid>
      </Box>
    );
  }
);

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
const AuditorSelect = React.memo(
  ({ value, onChange, id, auditors, isDisabled }) => {
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
          isDisabled={isDisabled}
          opacity={isDisabled ? 0.6 : 1}
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
  }
);

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
    onActiveToggle,
    onRowClick,
    dateRange,
    handleDeletePlanning,
    localPlanningData,
    savedPlanningData,
    selectedMonth,
  }) => {
    // Determine if location is active based on planning data or current status
    const isActive = useMemo(() => {
      // If there's saved planning data, use was_active from that
      const savedPlanning = savedPlanningData[location.id]?.[selectedMonth];
      if (savedPlanning?.auditor_id) {
        return savedPlanning.was_active !== false; // Default to true if was_active not set
      }
      // Otherwise use current is_active status
      return location.is_active !== false; // Default to true if is_active not set
    }, [location, savedPlanningData, selectedMonth]);

    // Enhanced styling for matriz locations
    const isMatriz = location.es_matriz;
    const rowBg = isMatriz
      ? isActive
        ? "blue.50"
        : "blue.100"
      : isActive
      ? "white"
      : "gray.100";
    const rowHoverBg = isMatriz
      ? isActive
        ? "blue.100"
        : "blue.150"
      : isActive
      ? "gray.50"
      : "gray.200";
    const borderLeft = isMatriz ? "4px solid" : "none";
    const borderColor = isMatriz ? "blue.500" : "transparent";

    return (
      <Tr
        bg={rowBg}
        _hover={{ bg: rowHoverBg }}
        cursor="pointer"
        onClick={() => onRowClick(location)}
        opacity={isActive ? 1 : 0.7}
        borderLeft={borderLeft}
        borderColor={borderColor}
        fontWeight={isMatriz ? "semibold" : "normal"}
      >
        <Td py={1} px={2} maxW="120px" isTruncated fontSize="xs">
          <Text color={isMatriz ? "blue.700" : "inherit"}>
            {location.cliente}
          </Text>
        </Td>
        <Td py={2} px={2} maxW="150px" fontSize="xs" whiteSpace="normal">
          <Box>
            <Text
              fontWeight={isMatriz ? "bold" : "medium"}
              color={isMatriz ? "blue.700" : "inherit"}
              lineHeight="1.2"
            >
              {location.convenio}
            </Text>
            {location.direccion && (
              <Text
                fontSize="2xs"
                color="gray.600"
                mt={1}
                lineHeight="1.1"
                noOfLines={2}
              >
                {location.direccion}
              </Text>
            )}
          </Box>
        </Td>
        <Td py={1} px={2} w="100px" onClick={(e) => e.stopPropagation()}>
          <ZoneSelect
            value={location.zona}
            onChange={(e) => onZoneChange(location.id, e.target.value)}
            id={`zone-${location.id}`}
          />
        </Td>
        <Td py={1} px={2} w="130px" onClick={(e) => e.stopPropagation()}>
          <AuditorSelect
            value={selectedAuditor}
            onChange={(e) => onAuditorChange(location.id, e.target.value)}
            id={`auditor-${location.id}`}
            auditors={auditors}
            isDisabled={!isActive}
          />
        </Td>
        <Td py={1} px={2} w="100px" onClick={(e) => e.stopPropagation()}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => onDateChange(location.id, date)}
            dateFormat="dd/MM/yyyy"
            className="chakra-input css-1kp110w"
            placeholderText="Fecha"
            minDate={dateRange.startDate}
            maxDate={dateRange.endDate}
            disabled={!isActive}
            style={{
              opacity: isActive ? 1 : 0.6,
              cursor: isActive ? "pointer" : "not-allowed",
              fontSize: "12px",
              padding: "4px 8px",
              width: "95px",
            }}
          />
        </Td>
        <Td py={1} px={2} w="60px" onClick={(e) => e.stopPropagation()}>
          <Switch
            id={`matriz-${location.id}`}
            isChecked={location.es_matriz}
            onChange={(e) => onMatrizToggle(location.id, e.target.checked)}
            size="sm"
            colorScheme={isMatriz ? "blue" : "gray"}
          />
        </Td>
        <Td py={1} px={2} w="60px" onClick={(e) => e.stopPropagation()}>
          <Switch
            id={`active-${location.id}`}
            isChecked={isActive}
            onChange={(e) => onActiveToggle(location.id, e.target.checked)}
            size="sm"
            colorScheme="green"
          />
        </Td>
        <Td py={1} px={2} w="60px" onClick={(e) => e.stopPropagation()}>
          {localPlanningData[location.id]?.[selectedMonth]?.auditor_id && (
            <IconButton
              aria-label="Eliminar planificación"
              icon={<DeleteIcon />}
              size="xs"
              colorScheme="red"
              onClick={() => handleDeletePlanning(location.id)}
            />
          )}
        </Td>
      </Tr>
    );
  }
);

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Helper function to group locations by convenio
const groupLocationsByConvenio = (locations) => {
  const groups = {};

  locations.forEach((location) => {
    const convenio = location.convenio;
    if (!groups[convenio]) {
      groups[convenio] = {
        matriz: null,
        subsidiaries: [],
      };
    }

    if (location.es_matriz) {
      groups[convenio].matriz = location;
    } else {
      groups[convenio].subsidiaries.push(location);
    }
  });

  // Handle edge case: if no matriz exists, make the first location the matriz
  Object.values(groups).forEach((group) => {
    if (!group.matriz && group.subsidiaries.length > 0) {
      group.matriz = group.subsidiaries.shift();
    }
  });

  return groups;
};

// Memoize the SubsidiaryRow component
const SubsidiaryRow = React.memo(
  ({
    location,
    selectedAuditor,
    selectedDate,
    auditors,
    onDateChange,
    onAuditorChange,
    onZoneChange,
    onMatrizToggle,
    onActiveToggle,
    onRowClick,
    dateRange,
    handleDeletePlanning,
    localPlanningData,
    savedPlanningData,
    selectedMonth,
  }) => {
    // Determine if location is active
    const isActive = useMemo(() => {
      const savedPlanning = savedPlanningData[location.id]?.[selectedMonth];
      if (savedPlanning?.auditor_id) {
        return savedPlanning.was_active !== false;
      }
      return location.is_active !== false;
    }, [location, savedPlanningData, selectedMonth]);

    return (
      <Tr
        bg={isActive ? "gray.25" : "gray.150"}
        _hover={{ bg: isActive ? "gray.75" : "gray.200" }}
        cursor="pointer"
        onClick={() => onRowClick(location)}
        opacity={isActive ? 1 : 0.7}
        borderLeft="2px solid"
        borderColor="gray.300"
      >
        <Td py={1} px={2} pl={8} maxW="120px" isTruncated fontSize="xs">
          <Text color="gray.600" fontSize="2xs">
            └─
          </Text>
        </Td>
        <Td py={2} px={2} maxW="150px" fontSize="xs" whiteSpace="normal">
          <Box>
            <Text
              fontSize="2xs"
              color="gray.600"
              mt={0}
              lineHeight="1.1"
              noOfLines={2}
            >
              {location.direccion}
            </Text>
          </Box>
        </Td>
        <Td py={1} px={2} w="100px" onClick={(e) => e.stopPropagation()}>
          <ZoneSelect
            value={location.zona}
            onChange={(e) => onZoneChange(location.id, e.target.value)}
            id={`zone-${location.id}`}
          />
        </Td>
        <Td py={1} px={2} w="130px" onClick={(e) => e.stopPropagation()}>
          <AuditorSelect
            value={selectedAuditor}
            onChange={(e) => onAuditorChange(location.id, e.target.value)}
            id={`auditor-${location.id}`}
            auditors={auditors}
            isDisabled={!isActive}
          />
        </Td>
        <Td py={1} px={2} w="100px" onClick={(e) => e.stopPropagation()}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => onDateChange(location.id, date)}
            dateFormat="dd/MM/yyyy"
            className="chakra-input css-1kp110w"
            placeholderText="Fecha"
            minDate={dateRange.startDate}
            maxDate={dateRange.endDate}
            disabled={!isActive}
            style={{
              opacity: isActive ? 1 : 0.6,
              cursor: isActive ? "pointer" : "not-allowed",
              fontSize: "12px",
              padding: "4px 8px",
              width: "95px",
            }}
          />
        </Td>
        <Td py={1} px={2} w="60px" onClick={(e) => e.stopPropagation()}>
          <Switch
            id={`matriz-${location.id}`}
            isChecked={location.es_matriz}
            onChange={(e) => onMatrizToggle(location.id, e.target.checked)}
            size="sm"
            colorScheme="gray"
          />
        </Td>
        <Td py={1} px={2} w="60px" onClick={(e) => e.stopPropagation()}>
          <Switch
            id={`active-${location.id}`}
            isChecked={isActive}
            onChange={(e) => onActiveToggle(location.id, e.target.checked)}
            size="sm"
            colorScheme="green"
          />
        </Td>
        <Td py={1} px={2} w="60px" onClick={(e) => e.stopPropagation()}>
          {localPlanningData[location.id]?.[selectedMonth]?.auditor_id && (
            <IconButton
              aria-label="Eliminar planificación"
              icon={<DeleteIcon />}
              size="xs"
              colorScheme="red"
              onClick={() => handleDeletePlanning(location.id)}
            />
          )}
        </Td>
      </Tr>
    );
  }
);

// Enhanced MatrizRow component with expand/collapse functionality
const MatrizRow = React.memo(
  ({
    location,
    selectedAuditor,
    selectedDate,
    auditors,
    onDateChange,
    onAuditorChange,
    onZoneChange,
    onMatrizToggle,
    onActiveToggle,
    onRowClick,
    dateRange,
    handleDeletePlanning,
    localPlanningData,
    savedPlanningData,
    selectedMonth,
    hasSubsidiaries,
    isExpanded,
    onToggleExpand,
  }) => {
    // Determine if location is active
    const isActive = useMemo(() => {
      const savedPlanning = savedPlanningData[location.id]?.[selectedMonth];
      if (savedPlanning?.auditor_id) {
        return savedPlanning.was_active !== false;
      }
      return location.is_active !== false;
    }, [location, savedPlanningData, selectedMonth]);

    // Enhanced styling for matriz locations
    const isMatriz = location.es_matriz;
    const rowBg = isMatriz
      ? isActive
        ? "blue.50"
        : "blue.100"
      : isActive
      ? "white"
      : "gray.100";
    const rowHoverBg = isMatriz
      ? isActive
        ? "blue.100"
        : "blue.150"
      : isActive
      ? "gray.50"
      : "gray.200";
    const borderLeft = isMatriz ? "4px solid" : "none";
    const borderColor = isMatriz ? "blue.500" : "transparent";

    return (
      <Tr
        bg={rowBg}
        _hover={{ bg: rowHoverBg }}
        cursor="pointer"
        onClick={() => onRowClick(location)}
        opacity={isActive ? 1 : 0.7}
        borderLeft={borderLeft}
        borderColor={borderColor}
        fontWeight={isMatriz ? "semibold" : "normal"}
      >
        <Td py={1} px={2} maxW="120px" isTruncated fontSize="xs">
          <HStack spacing={1}>
            {hasSubsidiaries && (
              <IconButton
                aria-label={isExpanded ? "Collapse" : "Expand"}
                icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                size="md"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
                minW="auto"
                h="auto"
                p={0}
                fontSize="xs"
                color="gray.500"
              />
            )}
            <Text color={isMatriz ? "blue.700" : "inherit"} isTruncated>
              {location.cliente}
            </Text>
          </HStack>
        </Td>
        <Td py={2} px={2} maxW="150px" fontSize="xs" whiteSpace="normal">
          <Box>
            <Text
              fontWeight={isMatriz ? "bold" : "medium"}
              color={isMatriz ? "blue.700" : "inherit"}
              lineHeight="1.2"
            >
              {location.convenio}
            </Text>
            {location.direccion && (
              <Text
                fontSize="2xs"
                color="gray.600"
                mt={1}
                lineHeight="1.1"
                noOfLines={2}
              >
                {location.direccion}
              </Text>
            )}
          </Box>
        </Td>
        <Td py={1} px={2} w="100px" onClick={(e) => e.stopPropagation()}>
          <ZoneSelect
            value={location.zona}
            onChange={(e) => onZoneChange(location.id, e.target.value)}
            id={`zone-${location.id}`}
          />
        </Td>
        <Td py={1} px={2} w="130px" onClick={(e) => e.stopPropagation()}>
          <AuditorSelect
            value={selectedAuditor}
            onChange={(e) => onAuditorChange(location.id, e.target.value)}
            id={`auditor-${location.id}`}
            auditors={auditors}
            isDisabled={!isActive}
          />
        </Td>
        <Td py={1} px={2} w="100px" onClick={(e) => e.stopPropagation()}>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => onDateChange(location.id, date)}
            dateFormat="dd/MM/yyyy"
            className="chakra-input css-1kp110w"
            placeholderText="Fecha"
            minDate={dateRange.startDate}
            maxDate={dateRange.endDate}
            disabled={!isActive}
            style={{
              opacity: isActive ? 1 : 0.6,
              cursor: isActive ? "pointer" : "not-allowed",
              fontSize: "12px",
              padding: "4px 8px",
              width: "95px",
            }}
          />
        </Td>
        <Td py={1} px={2} w="60px" onClick={(e) => e.stopPropagation()}>
          <Switch
            id={`matriz-${location.id}`}
            isChecked={location.es_matriz}
            onChange={(e) => onMatrizToggle(location.id, e.target.checked)}
            size="sm"
            colorScheme={isMatriz ? "blue" : "gray"}
          />
        </Td>
        <Td py={1} px={2} w="60px" onClick={(e) => e.stopPropagation()}>
          <Switch
            id={`active-${location.id}`}
            isChecked={isActive}
            onChange={(e) => onActiveToggle(location.id, e.target.checked)}
            size="sm"
            colorScheme="green"
          />
        </Td>
        <Td py={1} px={2} w="60px" onClick={(e) => e.stopPropagation()}>
          {localPlanningData[location.id]?.[selectedMonth]?.auditor_id && (
            <IconButton
              aria-label="Eliminar planificación"
              icon={<DeleteIcon />}
              size="xs"
              colorScheme="red"
              onClick={() => handleDeletePlanning(location.id)}
            />
          )}
        </Td>
      </Tr>
    );
  }
);

// ConvenioGroup component to manage grouped rows
const ConvenioGroup = React.memo(
  ({
    convenio,
    group,
    auditors,
    localPlanningData,
    savedPlanningData,
    selectedMonth,
    selectedYear,
    onDateChange,
    onAuditorChange,
    onZoneChange,
    onMatrizToggle,
    onActiveToggle,
    onRowClick,
    handleDeletePlanning,
    dateRange,
    expandedGroups,
    onToggleGroup,
  }) => {
    const isExpanded = expandedGroups[convenio] || false;
    const hasSubsidiaries = group.subsidiaries.length > 0;

    return (
      <>
        {/* Matriz Row */}
        {group.matriz && (
          <MatrizRow
            location={group.matriz}
            selectedAuditor={
              localPlanningData[group.matriz.id]?.[selectedMonth]?.auditor_id
            }
            selectedDate={
              localPlanningData[group.matriz.id]?.[selectedMonth]?.audit_date
            }
            auditors={auditors}
            onDateChange={onDateChange}
            onAuditorChange={onAuditorChange}
            onZoneChange={onZoneChange}
            onMatrizToggle={onMatrizToggle}
            onActiveToggle={onActiveToggle}
            onRowClick={onRowClick}
            dateRange={dateRange}
            handleDeletePlanning={handleDeletePlanning}
            localPlanningData={localPlanningData}
            savedPlanningData={savedPlanningData}
            selectedMonth={selectedMonth}
            hasSubsidiaries={hasSubsidiaries}
            isExpanded={isExpanded}
            onToggleExpand={() => onToggleGroup(convenio)}
          />
        )}

        {/* Subsidiary Rows */}
        {isExpanded &&
          group.subsidiaries.map((location) => (
            <SubsidiaryRow
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
              onActiveToggle={onActiveToggle}
              onRowClick={onRowClick}
              dateRange={dateRange}
              handleDeletePlanning={handleDeletePlanning}
              localPlanningData={localPlanningData}
              savedPlanningData={savedPlanningData}
              selectedMonth={selectedMonth}
            />
          ))}
      </>
    );
  }
);

// Memoize the PlanningTable component
const PlanningTable = React.memo(
  ({
    locations,
    auditors,
    localPlanningData,
    savedPlanningData,
    selectedMonth,
    selectedYear,
    onDateChange,
    onAuditorChange,
    onZoneChange,
    onMatrizToggle,
    onActiveToggle,
    onRowClick,
    handleDeletePlanning,
    filters,
    expandedGroups,
    onToggleGroup,
  }) => {
    // Memoize the date range for the current month
    const dateRange = useMemo(() => {
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      return { startDate, endDate };
    }, [selectedYear, selectedMonth]);

    // Filter locations based on current filters
    const filteredLocations = useMemo(() => {
      return locations.filter((location) => {
        // Cliente filter
        if (filters.cliente && location.cliente !== filters.cliente) {
          return false;
        }

        // Convenio filter
        if (filters.convenio && location.convenio !== filters.convenio) {
          return false;
        }

        // Zona filter
        if (filters.zona && location.zona !== filters.zona) {
          return false;
        }

        // Auditor filter
        if (filters.auditor) {
          const assignedAuditor =
            localPlanningData[location.id]?.[selectedMonth]?.auditor_id;
          if (assignedAuditor !== filters.auditor) {
            return false;
          }
        }

        // Matriz filter
        if (filters.matriz !== "") {
          const isMatriz = filters.matriz === "true";
          if (location.es_matriz !== isMatriz) {
            return false;
          }
        }

        // Activo filter
        if (filters.activo !== "") {
          const shouldBeActive = filters.activo === "true";
          // Use same logic as in PlanningRow to determine if active
          const savedPlanning = savedPlanningData[location.id]?.[selectedMonth];
          const isActive = savedPlanning?.auditor_id
            ? savedPlanning.was_active !== false
            : location.is_active !== false;

          if (isActive !== shouldBeActive) {
            return false;
          }
        }

        return true;
      });
    }, [
      locations,
      filters,
      localPlanningData,
      savedPlanningData,
      selectedMonth,
    ]);

    // Group filtered locations by convenio
    const groupedLocations = useMemo(() => {
      return groupLocationsByConvenio(filteredLocations);
    }, [filteredLocations]);

    return (
      <Box overflowX="auto">
        <Table variant="simple" size="xs">
          <Thead>
            <Tr>
              <Th py={1} fontSize="xs">
                Cliente
              </Th>
              <Th py={1} fontSize="xs">
                Convenio / Dirección
              </Th>
              <Th py={1} fontSize="xs">
                Zona
              </Th>
              <Th py={1} fontSize="xs">
                Auditor
              </Th>
              <Th py={1} fontSize="xs">
                Fecha
              </Th>
              <Th py={1} fontSize="xs">
                Matriz
              </Th>
              <Th py={1} fontSize="xs">
                Activo
              </Th>
              <Th py={1} fontSize="xs">
                Acciones
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(groupedLocations).map(([convenio, group]) => (
              <ConvenioGroup
                key={convenio}
                convenio={convenio}
                group={group}
                auditors={auditors}
                localPlanningData={localPlanningData}
                savedPlanningData={savedPlanningData}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onDateChange={onDateChange}
                onAuditorChange={onAuditorChange}
                onZoneChange={onZoneChange}
                onMatrizToggle={onMatrizToggle}
                onActiveToggle={onActiveToggle}
                onRowClick={onRowClick}
                handleDeletePlanning={handleDeletePlanning}
                dateRange={dateRange}
                expandedGroups={expandedGroups}
                onToggleGroup={onToggleGroup}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
    );
  }
);

// Action Buttons Component
const ActionButtons = React.memo(
  ({
    onClearFilters,
    onExpandAll,
    onCollapseAll,
    onDownloadCSV,
    onSaveAll,
    isLoadingPlanning,
  }) => {
    return (
      <Box py={1} mb={0}>
        <HStack spacing={2} justify="flex-end">
          <Button
            leftIcon={<CloseIcon />}
            variant="outline"
            colorScheme="gray"
            size="xs"
            onClick={onClearFilters}
            minW="80px"
          >
            Filtros
          </Button>
          <Button
            leftIcon={<ChevronDownIcon />}
            variant="outline"
            colorScheme="blue"
            size="xs"
            onClick={onExpandAll}
            minW="80px"
          >
            Expandir
          </Button>
          <Button
            leftIcon={<ChevronUpIcon />}
            variant="outline"
            colorScheme="gray"
            size="xs"
            onClick={onCollapseAll}
            minW="80px"
          >
            Contraer
          </Button>
          <Button
            leftIcon={<DownloadIcon />}
            variant="outline"
            colorScheme="teal"
            size="xs"
            onClick={onDownloadCSV}
            minW="80px"
          >
            Descargar
          </Button>
          <Button
            leftIcon={<CheckIcon />}
            variant="solid"
            colorScheme="blue"
            size="xs"
            onClick={onSaveAll}
            isDisabled={isLoadingPlanning}
            minW="80px"
          >
            Guardar
          </Button>
        </HStack>
      </Box>
    );
  }
);

export default function Planning() {
  const {
    locations,
    updateLocation,
    createLocation,
    getLocationById,
    getCoordinatesByPostalCode,
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
    deletePlanning,
  } = usePlanning();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [localPlanningData, setLocalPlanningData] = useState({});
  const [savedPlanningData, setSavedPlanningData] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [filters, setFilters] = useState({
    cliente: "",
    convenio: "",
    zona: "",
    auditor: "",
    matriz: "",
    activo: "",
  });
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const toast = useToast();

  // Handle toggle expand/collapse for specific group
  const handleToggleGroup = useCallback((convenio) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [convenio]: !prev[convenio],
    }));
  }, []);

  // Handle expand all groups
  const handleExpandAll = useCallback(() => {
    const filteredLocations = locations.filter((location) => {
      // Cliente filter
      if (filters.cliente && location.cliente !== filters.cliente) {
        return false;
      }

      // Convenio filter
      if (filters.convenio && location.convenio !== filters.convenio) {
        return false;
      }

      // Zona filter
      if (filters.zona && location.zona !== filters.zona) {
        return false;
      }

      // Auditor filter
      if (filters.auditor) {
        const assignedAuditor =
          localPlanningData[location.id]?.[selectedMonth]?.auditor_id;
        if (assignedAuditor !== filters.auditor) {
          return false;
        }
      }

      // Matriz filter
      if (filters.matriz !== "") {
        const isMatriz = filters.matriz === "true";
        if (location.es_matriz !== isMatriz) {
          return false;
        }
      }

      // Activo filter
      if (filters.activo !== "") {
        const shouldBeActive = filters.activo === "true";
        // Use same logic as in PlanningRow to determine if active
        const savedPlanning = savedPlanningData[location.id]?.[selectedMonth];
        const isActive = savedPlanning?.auditor_id
          ? savedPlanning.was_active !== false
          : location.is_active !== false;

        if (isActive !== shouldBeActive) {
          return false;
        }
      }

      return true;
    });

    const groupedLocations = groupLocationsByConvenio(filteredLocations);
    const allConvenios = Object.keys(groupedLocations);

    const newExpandedState = {};
    allConvenios.forEach((convenio) => {
      // Only expand if the group has subsidiaries
      if (groupedLocations[convenio].subsidiaries.length > 0) {
        newExpandedState[convenio] = true;
      }
    });

    setExpandedGroups(newExpandedState);
  }, [locations, filters, localPlanningData, savedPlanningData, selectedMonth]);

  // Handle collapse all groups
  const handleCollapseAll = useCallback(() => {
    setExpandedGroups({});
  }, []);

  // CSV Download function
  const downloadFilteredDataAsCSV = useCallback(
    (
      filteredLocations,
      localPlanningData,
      savedPlanningData,
      auditors,
      selectedMonth
    ) => {
      // Prepare CSV headers
      const headers = [
        "Cliente",
        "Convenio",
        "Zona",
        "Auditor Asignado",
        "Fecha Planificada",
        "Es Matriz",
        "Activo",
        "Mes",
      ];

      // Prepare CSV data
      const csvData = filteredLocations.map((location) => {
        // Get planning data for this location and month
        const planningData = localPlanningData[location.id]?.[selectedMonth];
        const savedPlanning = savedPlanningData[location.id]?.[selectedMonth];

        // Determine active status (same logic as in PlanningRow)
        const isActive = savedPlanning?.auditor_id
          ? savedPlanning.was_active !== false
          : location.is_active !== false;

        // Find assigned auditor
        const assignedAuditor = planningData?.auditor_id
          ? auditors.find((a) => a.id === planningData.auditor_id)?.full_name ||
            ""
          : "";

        // Format date
        const formattedDate = planningData?.audit_date
          ? planningData.audit_date.toLocaleDateString("es-ES")
          : "";

        // Get month name
        const monthName = MONTHS[selectedMonth];

        return [
          location.cliente || "",
          location.convenio || "",
          location.zona || "",
          assignedAuditor,
          formattedDate,
          location.es_matriz ? "Sí" : "No",
          isActive ? "Sí" : "No",
          monthName,
        ];
      });

      // Combine headers and data
      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `planificacion_${MONTHS[selectedMonth]}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      cliente: "",
      convenio: "",
      zona: "",
      auditor: "",
      matriz: "",
      activo: "",
    });
  }, []);

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
              id: plan.id,
              auditor_id: plan.auditor_id,
              audit_date: new Date(plan.audit_date),
              was_active: plan.was_active,
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

  //handler to delete a planning entry
  const handleDeletePlanning = useCallback(
    async (locationId) => {
      try {
        // Check if the entry exists in savedPlanningData
        const isSaved =
          savedPlanningData[locationId]?.[selectedMonth]?.auditor_id;
        const planningId = savedPlanningData[locationId]?.[selectedMonth]?.id;

        if (isSaved && planningId) {
          // If it's saved in the database, delete it using the planning UUID
          const deletedPlanning = await deletePlanning(planningId);
          if (!deletedPlanning) {
            toast({
              title: "Error",
              description: "No se pudo eliminar la planificación",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
            return;
          }
        }

        // Update local state after successful deletion
        setLocalPlanningData((prev) => {
          const newData = { ...prev };
          if (newData[locationId]) {
            delete newData[locationId][selectedMonth];
            // If no more months have data, remove the location entirely
            if (Object.keys(newData[locationId]).length === 0) {
              delete newData[locationId];
            }
          }
          return newData;
        });

        // Update saved data as well
        setSavedPlanningData((prev) => {
          const newData = { ...prev };
          if (newData[locationId]) {
            delete newData[locationId][selectedMonth];
            // If no more months have data, remove the location entirely
            if (Object.keys(newData[locationId]).length === 0) {
              delete newData[locationId];
            }
          }
          return newData;
        });

        toast({
          title: "Planificación eliminada",
          description: "La planificación se ha eliminado correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error deleting planning:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la planificación",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [selectedMonth, deletePlanning, toast, savedPlanningData]
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
        if (!locationId) {
          toast({
            title: "Error",
            description: "No se pudo identificar la ubicación",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const location = locations.find((loc) => loc.id === locationId);
        if (!location) {
          toast({
            title: "Error",
            description: "Ubicación no encontrada",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const updatedLocation = await updateLocation(locationId, {
          ...location,
          zona: zone,
        });

        if (!updatedLocation) {
          throw new Error("Failed to update location");
        }

        toast({
          title: "Zona actualizada",
          description: "La zona ha sido actualizada correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error updating zone:", error);
        toast({
          title: "Error",
          description: error.message || "No se pudo actualizar la zona",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [locations, toast]
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

  // Handle active status toggle
  const handleActiveToggle = useCallback(
    async (locationId, isActive) => {
      try {
        const location = locations.find((loc) => loc.id === locationId);
        if (!location) return;

        await updateLocation(locationId, {
          ...location,
          is_active: isActive,
        });

        toast({
          title: "Estado de actividad actualizado",
          description: `La ubicación ha sido ${
            isActive ? "activada" : "desactivada"
          }`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de actividad",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [locations, toast]
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
            // Find the current location to get its is_active status
            const location = locations.find((loc) => loc.id === locationId);
            const currentIsActive = location?.is_active !== false; // Default to true

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
              was_active: currentIsActive, // Store current is_active as was_active
            });
          }
        });
      });

      // Save all changes
      await Promise.all(changes.map((plan) => createPlanning(plan)));

      // Update saved data to include was_active
      const updatedSavedData = { ...localPlanningData };
      Object.entries(updatedSavedData).forEach(([locationId, months]) => {
        Object.entries(months).forEach(([month, data]) => {
          if (data.auditor_id && data.audit_date) {
            const location = locations.find((loc) => loc.id === locationId);
            updatedSavedData[locationId][month].was_active =
              location?.is_active !== false;
          }
        });
      });

      setSavedPlanningData(updatedSavedData);

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
  }, [localPlanningData, currentUserId, locations, toast]);

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
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Activo:</Text>
                    <Badge
                      colorScheme={
                        selectedLocation.is_active !== false ? "green" : "red"
                      }
                    >
                      {selectedLocation.is_active !== false ? "Sí" : "No"}
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
      </Flex>

      <Flex direction="column" gap={2} mb={6}>
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          w="200px"
          size="sm"
        >
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() - 2 + i
          ).map((year) => (
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

        {/* Filter Controls */}
        <FilterControls
          locations={locations}
          auditors={auditors}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Action Buttons */}
        <ActionButtons
          onClearFilters={handleClearFilters}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onDownloadCSV={() => {
            const filteredLocations = locations.filter((location) => {
              // Cliente filter
              if (filters.cliente && location.cliente !== filters.cliente) {
                return false;
              }

              // Convenio filter
              if (filters.convenio && location.convenio !== filters.convenio) {
                return false;
              }

              // Zona filter
              if (filters.zona && location.zona !== filters.zona) {
                return false;
              }

              // Auditor filter
              if (filters.auditor) {
                const assignedAuditor =
                  localPlanningData[location.id]?.[selectedMonth]?.auditor_id;
                if (assignedAuditor !== filters.auditor) {
                  return false;
                }
              }

              // Matriz filter
              if (filters.matriz !== "") {
                const isMatriz = filters.matriz === "true";
                if (location.es_matriz !== isMatriz) {
                  return false;
                }
              }

              // Activo filter
              if (filters.activo !== "") {
                const shouldBeActive = filters.activo === "true";
                // Use same logic as in PlanningRow to determine if active
                const savedPlanning =
                  savedPlanningData[location.id]?.[selectedMonth];
                const isActive = savedPlanning?.auditor_id
                  ? savedPlanning.was_active !== false
                  : location.is_active !== false;

                if (isActive !== shouldBeActive) {
                  return false;
                }
              }

              return true;
            });
            downloadFilteredDataAsCSV(
              filteredLocations,
              localPlanningData,
              savedPlanningData,
              auditors,
              selectedMonth
            );
          }}
          onSaveAll={handleSaveAll}
          isLoadingPlanning={isLoadingPlanning}
        />

        {/* Single table instance that updates based on selected month */}
        <PlanningTable
          locations={locations}
          auditors={auditors}
          localPlanningData={localPlanningData}
          savedPlanningData={savedPlanningData}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onDateChange={handleDateChange}
          onAuditorChange={handleAuditorChange}
          onZoneChange={handleZoneChange}
          onMatrizToggle={handleMatrizToggle}
          onActiveToggle={handleActiveToggle}
          onRowClick={handleRowClick}
          handleDeletePlanning={handleDeletePlanning}
          filters={filters}
          expandedGroups={expandedGroups}
          onToggleGroup={handleToggleGroup}
        />
      </Flex>

      <LocationDetailsDrawer />
    </Box>
  );
}
