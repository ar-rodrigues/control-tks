"use client";
import { useEffect, useState } from "react";
import { useUsersAuditors } from "../utils/hooks/useUsersAuditors";
import { useLocation } from "../utils/hooks/useLocation";
import { useFileImport } from "../utils/hooks/useFileImport";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  Text,
  Badge,
  Button,
  useToast,
  Spinner,
  Center,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  Collapse,
  IconButton,
  VStack,
  HStack,
  Divider,
  Card,
  CardBody,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, EditIcon } from "@chakra-ui/icons";

export default function Auditors() {
  const {
    auditors,
    getAuditorById,
    updateAuditor,
    isLoading: isLoadingAuditors,
    error: errorAuditors,
  } = useUsersAuditors();
  const {
    getLocationByAddress,
    getLocationByPostalCode,
    isLoading: isLoadingLocation,
    error: errorLocation,
  } = useLocation();
  const { uploadFiles, progress, isUploading, clearProgress } = useFileImport();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedAuditor, setSelectedAuditor] = useState(null);
  const [editedAuditor, setEditedAuditor] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [isConvertingAddress, setIsConvertingAddress] = useState(false);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);

  // Color mode values for styling
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const expandedBg = useColorModeValue("gray.50", "gray.700");

  // Monitor upload progress
  useEffect(() => {
    if (progress.length > 0 && uploadingProfilePicture) {
      const fileProgress = progress[0];

      if (fileProgress.status === "completed" && fileProgress.url) {
        // Upload completed successfully
        setEditedAuditor((prev) => ({
          ...prev,
          profile_picture: fileProgress.url,
        }));

        toast({
          title: "Foto subida exitosamente",
          description: "La foto de perfil se ha actualizado",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setUploadingProfilePicture(false);
        clearProgress();
      } else if (fileProgress.status === "error") {
        // Upload failed
        toast({
          title: "Error al subir la foto",
          description:
            fileProgress.error || "No se pudo subir la foto de perfil",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

        setUploadingProfilePicture(false);
        clearProgress();
      }
    }
  }, [progress, uploadingProfilePicture, toast, clearProgress]);

  const handleSelectAuditor = async (auditorId) => {
    try {
      const auditor = await getAuditorById(auditorId);
      setSelectedAuditor(auditor);
      setEditedAuditor({ ...auditor }); // Create a copy to avoid mutation
      onOpen();
    } catch (error) {
      toast({
        title: "Error al cargar auditor",
        description: "No se pudo cargar la información del auditor",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCloseDrawer = () => {
    // Reset states when closing drawer
    setUploadingProfilePicture(false);
    clearProgress();
    onClose();
  };

  const handleSaveAuditor = async () => {
    if (!editedAuditor) return;

    try {
      await updateAuditor(editedAuditor.id, editedAuditor);
      setSelectedAuditor(editedAuditor);
      onClose();
      toast({
        title: "Auditor actualizado",
        description: "Los datos del auditor se han actualizado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar el auditor",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleConvertAddress = async () => {
    if (!editedAuditor?.home_address) {
      toast({
        title: "Dirección requerida",
        description:
          "Por favor ingresa una dirección antes de convertir a coordenadas",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsConvertingAddress(true);
    try {
      const locationData = await getLocationByAddress(
        editedAuditor.home_address
      );
      if (locationData && (locationData.lat || locationData.lon)) {
        // Handle both formats: {lat, lon} from API and {lat, lon} from stored data
        const coordinates = {
          lat: locationData.lat,
          lon: locationData.lon || locationData.lon, // Handle both formats
        };

        setEditedAuditor({
          ...editedAuditor,
          home_address_coordinates: coordinates,
        });
        toast({
          title: "Coordenadas obtenidas",
          description: `Lat: ${coordinates.lat}, lon: ${coordinates.lon}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("No se pudieron obtener coordenadas válidas");
      }
    } catch (error) {
      toast({
        title: "Error al obtener coordenadas",
        description:
          error.message ||
          "No se pudieron obtener las coordenadas de la dirección",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConvertingAddress(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Por favor selecciona un archivo de imagen válido",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Clear previous progress and start upload
    clearProgress();
    setUploadingProfilePicture(true);

    const uploadOptions = {
      bucket: "avatars", // You may need to adjust this bucket name
      folder: "auditors",
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      maxSize: 5 * 1024 * 1024, // 5MB max
      saveToDatabase: false, // We don't need to save metadata for profile pictures
    };

    try {
      await uploadFiles([file], uploadOptions);
      // The useEffect will handle the completion/error states
    } catch (error) {
      toast({
        title: "Error al subir la foto",
        description: error.message || "No se pudo subir la foto de perfil",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setUploadingProfilePicture(false);
      clearProgress();
    }
  };

  const toggleRow = (auditorId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [auditorId]: !prev[auditorId],
    }));
  };

  if (isLoadingAuditors) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando auditores...</Text>
        </VStack>
      </Center>
    );
  }

  if (errorAuditors) {
    return (
      <Center h="100vh">
        <Card maxW="md">
          <CardBody>
            <VStack spacing={4}>
              <Text fontSize="xl" color="red.500" textAlign="center">
                Error al cargar auditores
              </Text>
              <Text color="gray.600" textAlign="center">
                {errorAuditors}
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => window.location.reload()}
              >
                Intentar de nuevo
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Center>
    );
  }

  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" color="blue.600" mb={2}>
            Gestión de Auditores
          </Heading>
          <Text color="gray.600">
            Administra la información de los auditores registrados en el sistema
          </Text>
        </Box>

        <Card>
          <CardBody p={0}>
            <Table variant="simple">
              <Thead bg={expandedBg}>
                <Tr>
                  <Th width="80px">Foto</Th>
                  <Th>Información del Auditor</Th>
                  <Th width="60px" textAlign="center">
                    Acciones
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {auditors.flatMap((auditor) => [
                  <Tr
                    key={auditor.id}
                    cursor="pointer"
                    onClick={() => toggleRow(auditor.id)}
                    _hover={{ bg: expandedBg }}
                    transition="background-color 0.2s"
                  >
                    <Td>
                      <Avatar
                        size="md"
                        name={auditor.full_name}
                        src={auditor.profile_picture}
                        bg="blue.500"
                      />
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="md">
                          {auditor.full_name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {auditor.email}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={auditor.zone ? "green" : "gray"}
                          variant="subtle"
                        >
                          {auditor.zone || "Sin zona asignada"}
                        </Badge>
                      </VStack>
                    </Td>
                    <Td textAlign="center">
                      <IconButton
                        size="sm"
                        icon={
                          expandedRows[auditor.id] ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          )
                        }
                        variant="ghost"
                        colorScheme="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(auditor.id);
                        }}
                        aria-label={
                          expandedRows[auditor.id] ? "Contraer" : "Expandir"
                        }
                      />
                    </Td>
                  </Tr>,
                  <Tr key={`${auditor.id}-details`}>
                    <Td colSpan={3} p={0} borderBottom="none">
                      <Collapse in={expandedRows[auditor.id]}>
                        <Box
                          p={6}
                          bg={expandedBg}
                          borderTop="1px"
                          borderColor={borderColor}
                        >
                          <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between" align="start">
                              <VStack align="start" spacing={3} flex={1}>
                                <Box>
                                  <Text
                                    fontSize="sm"
                                    fontWeight="bold"
                                    color="gray.700"
                                    mb={1}
                                  >
                                    Dirección de Casa
                                  </Text>
                                  <Text fontSize="sm">
                                    {auditor.home_address || "No especificada"}
                                  </Text>
                                </Box>

                                {auditor.home_address_coordinates && (
                                  <Box>
                                    <Text
                                      fontSize="sm"
                                      fontWeight="bold"
                                      color="gray.700"
                                      mb={1}
                                    >
                                      Coordenadas
                                    </Text>
                                    <Text fontSize="sm" fontFamily="mono">
                                      Lat:{" "}
                                      {auditor.home_address_coordinates.lat},
                                      Lon:{" "}
                                      {auditor.home_address_coordinates.lon ||
                                        auditor.home_address_coordinates.lon}
                                    </Text>
                                  </Box>
                                )}
                              </VStack>

                              <Button
                                leftIcon={<EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectAuditor(auditor.id);
                                }}
                              >
                                Editar Auditor
                              </Button>
                            </HStack>
                          </VStack>
                        </Box>
                      </Collapse>
                    </Td>
                  </Tr>,
                ])}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={handleCloseDrawer}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <VStack align="start" spacing={2}>
              <Text>Editar Auditor</Text>
              {selectedAuditor && (
                <Text fontSize="sm" color="gray.600">
                  ID: {selectedAuditor.id}
                </Text>
              )}
            </VStack>
          </DrawerHeader>

          <DrawerBody>
            {editedAuditor && (
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>Foto de Perfil</FormLabel>
                  <VStack spacing={3}>
                    <Avatar
                      size="xl"
                      name={editedAuditor.full_name}
                      src={editedAuditor.profile_picture}
                      bg="blue.500"
                    />

                    <VStack spacing={2} align="stretch" width="100%">
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          Subir nueva foto:
                        </Text>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          isDisabled={uploadingProfilePicture}
                        />
                        {uploadingProfilePicture && (
                          <HStack mt={2} spacing={2}>
                            <Spinner size="sm" color="blue.500" />
                            <Text fontSize="sm" color="blue.500">
                              Subiendo foto...
                            </Text>
                          </HStack>
                        )}
                      </Box>

                      <Divider />

                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          O ingresa una URL:
                        </Text>
                        <Input
                          placeholder="URL de la imagen de perfil"
                          value={editedAuditor.profile_picture || ""}
                          onChange={(e) =>
                            setEditedAuditor({
                              ...editedAuditor,
                              profile_picture: e.target.value,
                            })
                          }
                          isDisabled={uploadingProfilePicture}
                        />
                      </Box>
                    </VStack>
                  </VStack>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Nombre Completo</FormLabel>
                  <Input
                    value={editedAuditor.full_name || ""}
                    onChange={(e) =>
                      setEditedAuditor({
                        ...editedAuditor,
                        full_name: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={editedAuditor.email || ""}
                    onChange={(e) =>
                      setEditedAuditor({
                        ...editedAuditor,
                        email: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Zona de Trabajo</FormLabel>
                  <Select
                    value={editedAuditor.zone || ""}
                    onChange={(e) =>
                      setEditedAuditor({
                        ...editedAuditor,
                        zone: e.target.value,
                      })
                    }
                  >
                    <option value="">Sin zona asignada</option>
                    <option value="Centro">Centro</option>
                    <option value="Sur">Sur</option>
                    <option value="Norte">Norte</option>
                    <option value="Occidente">Occidente</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Dirección de Casa</FormLabel>
                  <VStack spacing={3} align="stretch">
                    <Input
                      placeholder="Ingresa la dirección completa"
                      value={editedAuditor.home_address || ""}
                      onChange={(e) =>
                        setEditedAuditor({
                          ...editedAuditor,
                          home_address: e.target.value,
                        })
                      }
                    />

                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      onClick={handleConvertAddress}
                      isLoading={isConvertingAddress}
                      loadingText="Convirtiendo..."
                      isDisabled={!editedAuditor.home_address}
                    >
                      Convertir a Coordenadas
                    </Button>

                    {editedAuditor.home_address_coordinates && (
                      <Box
                        p={3}
                        bg={expandedBg}
                        borderRadius="md"
                        border="1px"
                        borderColor={borderColor}
                      >
                        <Text fontSize="sm" fontWeight="bold" mb={1}>
                          Coordenadas actuales:
                        </Text>
                        <Text fontSize="sm" fontFamily="mono">
                          Latitud: {editedAuditor.home_address_coordinates.lat}
                        </Text>
                        <Text fontSize="sm" fontFamily="mono">
                          Longitud:{" "}
                          {editedAuditor.home_address_coordinates.lon ||
                            editedAuditor.home_address_coordinates.lon}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </FormControl>
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={handleCloseDrawer}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveAuditor}
              isLoading={isLoadingAuditors}
              loadingText="Guardando..."
            >
              Guardar Cambios
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
