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
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaCopy, FaTrash, FaKey } from "react-icons/fa";

export default function ApiKeysTable() {
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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

      <Table variant="simple">
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
          {apiKeys.map((key) => (
            <Tr key={key.id}>
              <Td>{key.name}</Td>
              <Td>
                <Box display="flex" alignItems="center" gap={2}>
                  <Text fontFamily="monospace">{key.key}</Text>
                  <Tooltip label="Copiar clave">
                    <IconButton
                      icon={<FaCopy />}
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(key.key)}
                    />
                  </Tooltip>
                </Box>
              </Td>
              <Td>
                <Badge
                  colorScheme={key.is_active ? "green" : "red"}
                  cursor="pointer"
                  onClick={() => handleToggleKey(key.id, key.is_active)}
                >
                  {key.is_active ? "Activa" : "Inactiva"}
                </Badge>
              </Td>
              <Td>
                {key.last_used_at
                  ? new Date(key.last_used_at).toLocaleString()
                  : "Nunca"}
              </Td>
              <Td>
                <Tooltip label="Eliminar clave">
                  <IconButton
                    icon={<FaTrash />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteKey(key.id)}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
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
