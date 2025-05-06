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
  Textarea,
  Badge,
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

export default function VinListsTable() {
  const [vinLists, setVinLists] = useState([]);
  const [selectedVinList, setSelectedVinList] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const fetchVinLists = async () => {
    try {
      const response = await fetch("/api/vin-lists");
      const data = await response.json();
      setVinLists(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo obtener la lista de VINs",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchVinLists();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta lista de VINs?")
    ) {
      try {
        await fetch(`/api/vin-lists/${id}`, {
          method: "DELETE",
        });
        toast({
          title: "Éxito",
          description: "Lista de VINs eliminada correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchVinLists();
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la lista de VINs",
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
    const vins = formData
      .get("vins")
      .split("\n")
      .map((vin) => vin.trim())
      .filter((vin) => vin);

    const vinListData = {
      convenio: formData.get("convenio"),
      inventario: vins,
    };

    try {
      const url = selectedVinList
        ? `/api/vin-lists/${selectedVinList.id}`
        : "/api/vin-lists";
      const method = selectedVinList ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vinListData),
      });

      toast({
        title: "Éxito",
        description: `Lista de VINs ${
          selectedVinList ? "actualizada" : "creada"
        } correctamente`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      fetchVinLists();
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${
          selectedVinList ? "actualizar" : "crear"
        } la lista de VINs`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (vinList) => {
    setSelectedVinList(vinList);
    onOpen();
  };

  const handleAdd = () => {
    setSelectedVinList(null);
    onOpen();
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <Heading size="lg">Listas de VINs</Heading>
        <Button
          colorScheme="blue"
          onClick={handleAdd}
          w={{ base: "full", sm: "auto" }}
        >
          Agregar lista de VINs
        </Button>
      </div>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {vinLists.map((vinList) => (
          <Card
            key={vinList.id}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
            transition="all 0.2s"
          >
            <CardBody>
              <Box mb={4}>
                <Heading size="md" mb={2}>
                  {vinList.convenio}
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  Creado: {new Date(vinList.created_at).toLocaleDateString()}
                </Text>
              </Box>

              <Box mb={4}>
                <Badge colorScheme="blue" fontSize="sm" mb={2}>
                  {vinList.inventario.length} VINs
                </Badge>
                <Text fontSize="sm" color="gray.600" noOfLines={3}>
                  {vinList.inventario.slice(0, 3).join(", ")}
                  {vinList.inventario.length > 3 ? "..." : ""}
                </Text>
              </Box>

              <Box
                display="flex"
                flexDirection={{ base: "column", sm: "row" }}
                gap={2}
              >
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => handleEdit(vinList)}
                  flex={1}
                  w={{ base: "full", sm: "auto" }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => handleDelete(vinList.id)}
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

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent mx={2}>
          <ModalHeader>
            {selectedVinList ? "Editar lista de VINs" : "Agregar lista de VINs"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Convenio</FormLabel>
                  <Input
                    name="convenio"
                    defaultValue={selectedVinList?.convenio}
                    w="full"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>VINs (uno por línea)</FormLabel>
                  <Textarea
                    name="vins"
                    defaultValue={selectedVinList?.inventario.join("\n")}
                    rows={10}
                    placeholder="Escribe un VIN por línea"
                    w="full"
                  />
                </FormControl>
                <Button type="submit" colorScheme="blue" w="full">
                  {selectedVinList ? "Actualizar" : "Crear"}
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
