import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Badge,
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stack,
  Select,
  Switch,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { ChevronRightIcon, ArrowBackIcon } from "@chakra-ui/icons";
import BulkImport from "./BulkImport";
import { useLocation } from "../../utils/hooks/useLocation";

export default function LocationsTable() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedConvenio, setSelectedConvenio] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [cpValue, setCpValue] = useState("");
  const [cpError, setCpError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { getLocationByPostalCode, isLoading: coordLoading } = useLocation();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const zonaOptions = ["Norte", "Sur", "Centro", "Occidente"];

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations-directory");
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo obtener el directorio de ubicaciones",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Validation functions
  const validateCP = (cp) => {
    const cpRegex = /^\d+$/;
    return cpRegex.test(cp);
  };

  const handleCPChange = (e) => {
    const value = e.target.value;
    setCpValue(value);
    if (value && !validateCP(value)) {
      setCpError("El CP debe contener solo números");
    } else {
      setCpError("");
    }
  };

  const handleGetCoordinates = async () => {
    if (!cpValue || !validateCP(cpValue)) {
      toast({
        title: "Error",
        description: "Ingresa un CP válido (solo números)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await getLocationByPostalCode(cpValue);
      if (result && result.lat && result.lon) {
        const coords = { lat: result.lat, lon: result.lon };
        setCoordinates(coords);
        toast({
          title: "Éxito",
          description: "Coordenadas obtenidas correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron obtener las coordenadas para este CP",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al obtener las coordenadas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Layer 1: Unique clientes
  const clientes = [...new Set(locations.map((loc) => loc.cliente))];

  // Layer 2: Unique convenios for selected cliente
  const convenios = selectedCliente
    ? [
        ...new Set(
          locations
            .filter((loc) => loc.cliente === selectedCliente)
            .map((loc) => loc.convenio)
        ),
      ]
    : [];

  // Layer 3: Locations for selected cliente+convenio
  const filteredLocations =
    selectedCliente && selectedConvenio
      ? locations.filter(
          (loc) =>
            loc.cliente === selectedCliente && loc.convenio === selectedConvenio
        )
      : [];

  const handleDelete = async (id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta ubicación?")
    ) {
      try {
        await fetch(`/api/locations-directory/${id}`, {
          method: "DELETE",
        });
        toast({
          title: "Éxito",
          description: "Ubicación eliminada correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchLocations();
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la ubicación",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const cp = formData.get("cp");
    if (!validateCP(cp)) {
      toast({
        title: "Error",
        description: "El CP debe contener solo números",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const locationData = {
      cliente: formData.get("cliente"),
      convenio: formData.get("convenio"),
      agencia: formData.get("agencia"),
      direccion: formData.get("direccion"),
      ciudad: formData.get("ciudad"),
      estado: formData.get("estado"),
      cp: cp,
      zona: formData.get("zona"),
      es_matriz: formData.get("es_matriz") === "on",
      is_active: formData.get("is_active") === "on",
      location_coordinates: coordinates,
    };

    try {
      const url = selectedLocation
        ? `/api/locations-directory/${selectedLocation.id}`
        : "/api/locations-directory";
      const method = selectedLocation ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });

      toast({
        title: "Éxito",
        description: `Ubicación ${
          selectedLocation ? "actualizada" : "creada"
        } correctamente`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      fetchLocations();
      // Reset form state
      setCoordinates(null);
      setCpValue("");
      setCpError("");
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${
          selectedLocation ? "actualizar" : "crear"
        } la ubicación`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (location) => {
    setSelectedLocation(location);
    setCpValue(location.cp || "");
    setCoordinates(location.location_coordinates || null);
    setCpError("");
    onOpen();
  };

  const handleAdd = () => {
    setSelectedLocation(null);
    setCoordinates(null);
    setCpValue("");
    setCpError("");
    onOpen();
  };

  // Navigation handlers
  const goBackToClientes = () => {
    setSelectedCliente(null);
    setSelectedConvenio(null);
  };
  const goBackToConvenios = () => {
    setSelectedConvenio(null);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <Heading size="lg">Directorio de Ubicaciones</Heading>
        <Box w={{ base: "full", sm: "auto" }}>
          <Stack
            direction={{ base: "column", sm: "row" }}
            spacing={2}
            w={{ base: "full", sm: "auto" }}
          >
            <BulkImport onImportComplete={fetchLocations} />
            <Button
              colorScheme="blue"
              onClick={handleAdd}
              w={{ base: "full", sm: "auto" }}
            >
              Agregar ubicación
            </Button>
          </Stack>
        </Box>
      </div>

      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        mb={6}
      >
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={goBackToClientes}
            isCurrentPage={!selectedCliente}
          >
            Clientes
          </BreadcrumbLink>
        </BreadcrumbItem>
        {selectedCliente && (
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={goBackToConvenios}
              isCurrentPage={!selectedConvenio}
            >
              {selectedCliente}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {selectedConvenio && (
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{selectedConvenio}</BreadcrumbLink>
          </BreadcrumbItem>
        )}
      </Breadcrumb>

      {/* Layer 1: Clientes */}
      {!selectedCliente && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
          {clientes.map((cliente) => (
            <Card
              key={cliente}
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              overflow="hidden"
              _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => setSelectedCliente(cliente)}
            >
              <CardBody>
                <Heading size="md">{cliente}</Heading>
                <Badge colorScheme="blue" mt={2}>
                  {locations.filter((loc) => loc.cliente === cliente).length}{" "}
                  convenios
                </Badge>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Layer 2: Convenios for selected cliente */}
      {selectedCliente && !selectedConvenio && (
        <>
          <Button
            leftIcon={<ArrowBackIcon />}
            mb={4}
            onClick={goBackToClientes}
            variant="ghost"
            w={{ base: "full", sm: "auto" }}
          >
            Volver a clientes
          </Button>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
            {convenios.map((convenio) => (
              <Card
                key={convenio}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => setSelectedConvenio(convenio)}
              >
                <CardBody>
                  <Heading size="md">{convenio}</Heading>
                  <Badge colorScheme="blue" mt={2}>
                    {
                      locations.filter(
                        (loc) =>
                          loc.cliente === selectedCliente &&
                          loc.convenio === convenio
                      ).length
                    }{" "}
                    ubicaciones
                  </Badge>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}

      {/* Layer 3: Locations for selected cliente+convenio */}
      {selectedCliente && selectedConvenio && (
        <>
          <Button
            leftIcon={<ArrowBackIcon />}
            mb={4}
            onClick={goBackToConvenios}
            variant="ghost"
            w={{ base: "full", sm: "auto" }}
          >
            Volver a convenios
          </Button>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
            {filteredLocations.map((location) => (
              <Card
                key={location.id}
                bg={bgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
              >
                <CardBody>
                  <Heading size="md" mb={2}>
                    {location.agencia}
                  </Heading>
                  <HStack mb={2} wrap="wrap">
                    <Badge
                      colorScheme={
                        location.zona === "Norte"
                          ? "blue"
                          : location.zona === "Sur"
                          ? "green"
                          : location.zona === "Centro"
                          ? "purple"
                          : "orange"
                      }
                    >
                      {location.zona}
                    </Badge>
                    <Badge colorScheme={location.is_active ? "green" : "red"}>
                      {location.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                    {location.es_matriz && (
                      <Badge colorScheme="yellow">Matriz</Badge>
                    )}
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    <b>Cliente:</b> {location.cliente}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    <b>Convenio:</b> {location.convenio}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    <b>Dirección:</b> {location.direccion}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    <b>Ciudad:</b> {location.ciudad}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    <b>Estado:</b> {location.estado}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    <b>CP:</b> {location.cp}
                  </Text>
                  {location.location_coordinates && (
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      <b>Coordenadas:</b> Lat:{" "}
                      {location.location_coordinates.lat}, Lon:{" "}
                      {location.location_coordinates.lon}
                    </Text>
                  )}
                  <Box
                    display="flex"
                    flexDirection={{ base: "column", sm: "row" }}
                    gap={2}
                  >
                    <Button
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleEdit(location)}
                      flex={1}
                      w={{ base: "full", sm: "auto" }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDelete(location.id)}
                      flex={1}
                      w={{ base: "full", sm: "auto" }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent mx={2}>
          <ModalHeader>
            {selectedLocation ? "Editar ubicación" : "Agregar ubicación"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Cliente</FormLabel>
                  <Input
                    name="cliente"
                    defaultValue={
                      selectedLocation?.cliente || selectedCliente || ""
                    }
                    w="full"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Convenio</FormLabel>
                  <Input
                    name="convenio"
                    defaultValue={
                      selectedLocation?.convenio || selectedConvenio || ""
                    }
                    w="full"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Agencia</FormLabel>
                  <Input
                    name="agencia"
                    defaultValue={selectedLocation?.agencia}
                    w="full"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Dirección</FormLabel>
                  <Input
                    name="direccion"
                    defaultValue={selectedLocation?.direccion}
                    w="full"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Ciudad</FormLabel>
                  <Input
                    name="ciudad"
                    defaultValue={selectedLocation?.ciudad}
                    w="full"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Estado</FormLabel>
                  <Input
                    name="estado"
                    defaultValue={selectedLocation?.estado}
                    w="full"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Zona</FormLabel>
                  <Select
                    name="zona"
                    defaultValue={selectedLocation?.zona || ""}
                    placeholder="Selecciona una zona"
                    w="full"
                  >
                    {zonaOptions.map((zona) => (
                      <option key={zona} value={zona}>
                        {zona}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired isInvalid={!!cpError}>
                  <FormLabel>CP</FormLabel>
                  <Input
                    name="cp"
                    value={cpValue}
                    onChange={handleCPChange}
                    placeholder="Solo números"
                    w="full"
                  />
                  {cpError && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {cpError}
                    </Text>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Coordenadas</FormLabel>
                  <VStack spacing={2} align="stretch">
                    <Button
                      onClick={handleGetCoordinates}
                      isLoading={coordLoading}
                      loadingText="Obteniendo..."
                      isDisabled={!cpValue || !!cpError}
                      colorScheme="green"
                      size="sm"
                    >
                      Obtener coordenadas por CP
                    </Button>
                    {coordinates && (
                      <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          Lat: {coordinates.lat}, Lon: {coordinates.lon}
                        </Text>
                      </Alert>
                    )}
                  </VStack>
                </FormControl>
                <FormControl>
                  <HStack justify="space-between">
                    <FormLabel mb={0}>Es Matriz</FormLabel>
                    <Switch
                      name="es_matriz"
                      defaultChecked={selectedLocation?.es_matriz || false}
                    />
                  </HStack>
                </FormControl>
                <FormControl>
                  <HStack justify="space-between">
                    <FormLabel mb={0}>Activo</FormLabel>
                    <Switch
                      name="is_active"
                      defaultChecked={selectedLocation?.is_active ?? true}
                    />
                  </HStack>
                </FormControl>
                <Button type="submit" colorScheme="blue" w="full">
                  {selectedLocation ? "Actualizar" : "Crear"}
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
