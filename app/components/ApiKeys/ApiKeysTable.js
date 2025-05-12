import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  IconButton,
  Tooltip,
  Text,
  useBreakpointValue,
  Stack,
  HStack,
  Spacer,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaCopy, FaTrash, FaKey } from "react-icons/fa";

export default function ApiKeysTable() {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys");
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron obtener las claves API",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un nombre para la clave",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) throw new Error("Error al crear la clave");

      const data = await response.json();
      setApiKeys([...apiKeys, data]);
      setNewKeyName("");
      onClose();

      toast({
        title: "Éxito",
        description: "Clave API creada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la clave API",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleKey = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) throw new Error("Error al actualizar la clave");

      setApiKeys(
        apiKeys.map((key) =>
          key.id === id ? { ...key, is_active: !currentStatus } : key
        )
      );

      toast({
        title: "Éxito",
        description: `Clave API ${
          !currentStatus ? "activada" : "desactivada"
        } correctamente`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la clave API",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteKey = async (id) => {
    if (
      !window.confirm("¿Estás seguro de que deseas eliminar esta clave API?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar la clave");

      setApiKeys(apiKeys.filter((key) => key.id !== id));

      toast({
        title: "Éxito",
        description: "Clave API eliminada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la clave API",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Clave API copiada al portapapeles",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  // Helper for truncating API keys
  const truncateKey = (key) =>
    key.length > 16 ? key.slice(0, 8) + "..." + key.slice(-4) : key;

  // Card layout for mobile
  const renderCard = (key) => (
    <Box
      key={key.id}
      borderWidth="1px"
      borderRadius="lg"
      p={5}
      mb={4}
      boxShadow="sm"
      bg="white"
    >
      <Stack spacing={2}>
        <HStack align="flex-start">
          <Text fontWeight="bold" minW="60px">
            Nombre:
          </Text>
          <Tooltip label={key.name} hasArrow placement="top-start">
            <Text
              fontSize="md"
              fontWeight="medium"
              maxW="180px"
              whiteSpace="pre-line"
              overflow="hidden"
              display="-webkit-box"
              sx={{ WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
              textOverflow="ellipsis"
              noOfLines={2}
              cursor="pointer"
            >
              {key.name}
            </Text>
          </Tooltip>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Clave:</Text>
          <Tooltip label={key.key} hasArrow>
            <Text fontFamily="monospace" noOfLines={1} maxW="120px">
              {truncateKey(key.key)}
            </Text>
          </Tooltip>
          <Tooltip label="Copiar clave">
            <IconButton
              icon={<FaCopy />}
              size="sm"
              variant="ghost"
              aria-label="Copiar clave"
              onClick={() => copyToClipboard(key.key)}
            />
          </Tooltip>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Estado:</Text>
          <Badge
            colorScheme={key.is_active ? "green" : "red"}
            cursor="pointer"
            onClick={() => handleToggleKey(key.id, key.is_active)}
            aria-label={key.is_active ? "Desactivar clave" : "Activar clave"}
          >
            {key.is_active ? "Activa" : "Inactiva"}
          </Badge>
        </HStack>
        <HStack>
          <Text fontWeight="bold">Último Uso:</Text>
          <Text>
            {key.last_used_at
              ? new Date(key.last_used_at).toLocaleString()
              : "Nunca"}
          </Text>
        </HStack>
        <Flex justify="flex-end" mt={2}>
          <Tooltip label="Eliminar clave">
            <IconButton
              icon={<FaTrash />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              aria-label="Eliminar clave"
              onClick={() => handleDeleteKey(key.id)}
            />
          </Tooltip>
        </Flex>
      </Stack>
    </Box>
  );

  // Table row for desktop
  const renderTableRow = (key, idx) => (
    <Tr key={key.id} bg={idx % 2 === 0 ? "gray.50" : "white"}>
      <Td maxW="260px" p={2}>
        <Tooltip label={key.name} hasArrow placement="top-start">
          <Text
            isTruncated
            maxW="240px"
            fontSize="sm"
            fontWeight="medium"
            cursor="pointer"
          >
            {key.name}
          </Text>
        </Tooltip>
      </Td>
      <Td p={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Tooltip label={key.key} hasArrow>
            <Text fontFamily="monospace" noOfLines={1} maxW="120px">
              {truncateKey(key.key)}
            </Text>
          </Tooltip>
          <Tooltip label="Copiar clave">
            <IconButton
              icon={<FaCopy />}
              size="sm"
              variant="ghost"
              aria-label="Copiar clave"
              onClick={() => copyToClipboard(key.key)}
            />
          </Tooltip>
        </Box>
      </Td>
      <Td p={2}>
        <Badge
          colorScheme={key.is_active ? "green" : "red"}
          cursor="pointer"
          onClick={() => handleToggleKey(key.id, key.is_active)}
          aria-label={key.is_active ? "Desactivar clave" : "Activar clave"}
        >
          {key.is_active ? "Activa" : "Inactiva"}
        </Badge>
      </Td>
      <Td p={2}>
        {key.last_used_at
          ? new Date(key.last_used_at).toLocaleString()
          : "Nunca"}
      </Td>
      <Td p={2}>
        <Tooltip label="Eliminar clave">
          <IconButton
            icon={<FaTrash />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            aria-label="Eliminar clave"
            onClick={() => handleDeleteKey(key.id)}
          />
        </Tooltip>
      </Td>
    </Tr>
  );

  return (
    <Box>
      <Box mb={4}>
        <Button
          leftIcon={<FaKey />}
          colorScheme="blue"
          onClick={onOpen}
          size="sm"
        >
          Crear Nueva Clave API
        </Button>
      </Box>

      {isMobile ? (
        <Box>
          {apiKeys.length === 0 ? (
            <Text color="gray.400" textAlign="center">
              No hay claves API
            </Text>
          ) : (
            apiKeys.map(renderCard)
          )}
        </Box>
      ) : (
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Clave</Th>
              <Th>Estado</Th>
              <Th>Último Uso</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {apiKeys.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" color="gray.400">
                  No hay claves API
                </Td>
              </Tr>
            ) : (
              apiKeys.map(renderTableRow)
            )}
          </Tbody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Nueva Clave API</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} mb={4}>
              <FormControl>
                <FormLabel>Nombre de la Clave</FormLabel>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ej: Escáner RFID Principal"
                />
              </FormControl>
              <Button colorScheme="blue" onClick={handleCreateKey} width="full">
                Crear Clave
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
